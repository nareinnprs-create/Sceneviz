/**
 * M7 — Workflows studio API (D1-backed).
 *
 * Serves the /workflow/* surface the builder calls through the /api/workflow
 * proxy: defs CRUD, galleries, node-schema registry, run engine, architect.
 *
 * Run engine (v1): POST /workflow/{id}/run and /api-execute create a
 * workflow_runs row, return {run_id} immediately, and execute the graph
 * node-by-node inside ctx.waitUntil — D1 rows carry per-node status so the
 * existing poll endpoints (run/{id}/status, run/{id}/api-outputs) drive the
 * UI. Text/utility nodes pass through; generation nodes reuse the shared
 * generateCore path (credits + rate limit apply) and are polled to a
 * terminal state. Models missing from MODEL_MAP fail the run with a clear
 * message.
 *
 * Node schemas are a static registry derived from MODEL_MAP plus the
 * passthrough/utility node types the builder's navbar expects.
 */

import { MODEL_MAP } from "./modelMap.js";
import { PROVIDERS } from "./providers.js";

const JSON_HDR = { "content-type": "application/json; charset=utf-8" };

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PUT,DELETE,PATCH,OPTIONS",
  "access-control-allow-headers": "x-api-key,authorization,content-type",
  "access-control-max-age": "86400",
};

function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), { status, headers: { ...JSON_HDR, ...CORS, ...extra } });
}
const err400 = (m) => json({ detail: { error: m } }, 400);
const err401 = () => json({ detail: { error: "API key required for this endpoint" } }, 401);
const err403 = (m = "Not authorized") => json({ detail: { error: m } }, 403);
const err404 = (m = "Not found") => json({ detail: m }, 404);

const uuid = () => crypto.randomUUID();
const nowIso = () => new Date().toISOString();

function ownerId(auth) {
  return auth.account?.id || auth.key?.account_id || auth.key?.id || null;
}

/**
 * The generation path is owned by index.js (credits, rate limit, providers).
 * index.js calls initEngine() once at module scope — avoids a circular import.
 */
let ENGINE = null;
export function initEngine(e) {
  ENGINE = e; // { generateCore, persistOutputs, checkRateLimit }
}

/* --------------------------------------------------------- serialization */

function rowToWorkflow(row) {
  return {
    id: row.id,
    owner_id: row.owner_id,
    name: row.name,
    category: row.category || "General",
    thumbnail: row.thumbnail || null,
    data: JSON.parse(row.data_json || '{"nodes":[]}'),
    edges: JSON.parse(row.edges_json || "[]"),
    is_published: !!row.published,
    is_template: !!row.is_template,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/** Gallery card shape (list consumers read id/name/category/thumbnail). */
function card(w, extra = {}) {
  return {
    id: w.id,
    name: w.name,
    category: w.category,
    thumbnail: w.thumbnail,
    updated_at: w.updated_at,
    created_at: w.created_at,
    ...extra,
  };
}

/** Full def payload consumed by the builder's restore (res.data.data.nodes). */
function serializeDef(w, auth) {
  const isOwner = auth && ownerId(auth) === w.owner_id;
  return {
    workflow_id: w.id,
    name: w.name,
    category: w.category,
    thumbnail: w.thumbnail,
    data: w.data,
    edges: w.edges,
    is_owner: isOwner,
    is_published: w.is_published,
    is_template: w.is_template,
    show_temp_button: isOwner && !w.is_template,
    run_history: {}, // shortcut: per-def node history isn't persisted in v1 — add when the builder needs it
  };
}

/* ------------------------------------------------------------- galleries */

export async function listTemplateWorkflows(env) {
  const rows =
    (await env.DB.prepare("SELECT * FROM workflows WHERE is_template = 1 ORDER BY updated_at DESC LIMIT 100").all())
      .results || [];
  return rows.map(rowToWorkflow).map((w) => card(w, { is_template: true, user_name: "opraiz" }));
}

export async function listPublishedWorkflows(env) {
  const rows =
    (await env.DB.prepare("SELECT * FROM workflows WHERE published = 1 ORDER BY updated_at DESC LIMIT 100").all())
      .results || [];
  return rows.map(rowToWorkflow).map((w) => card(w, { user_name: "Sceneviz Creator", user_profile: null }));
}

export async function listUserWorkflows(env, auth) {
  const rows =
    (await env.DB.prepare("SELECT * FROM workflows WHERE owner_id = ? ORDER BY updated_at DESC LIMIT 200")
      .bind(ownerId(auth))
      .all()).results || [];
  return rows.map(rowToWorkflow).map((w) => card(w, { is_owner: true }));
}

/* ------------------------------------------------------------------ CRUD */

export async function getWorkflowDef(env, auth, id) {
  const row = await env.DB.prepare("SELECT * FROM workflows WHERE id = ?").bind(id).first();
  if (!row) return err404("Workflow not found");
  return json(serializeDef(rowToWorkflow(row), auth));
}

export async function createOrUpdateWorkflow(request, env, auth) {
  let body;
  try {
    body = await request.json();
  } catch {
    return err400("Expected a JSON body");
  }
  const owner = ownerId(auth);
  const now = nowIso();
  const name = String(body?.name || "Untitled");
  const category = String(body?.category || "General");
  const dataJson = JSON.stringify(body?.data || { nodes: [] });
  const edgesJson = JSON.stringify(Array.isArray(body?.edges) ? body.edges : []);

  if (body?.workflow_id) {
    const row = await env.DB.prepare("SELECT id, owner_id FROM workflows WHERE id = ?").bind(body.workflow_id).first();
    if (!row) return err404("Workflow not found");
    if (row.owner_id !== owner) return err403("Not your workflow");
    await env.DB.prepare(
      "UPDATE workflows SET name = ?, category = ?, data_json = ?, edges_json = ?, updated_at = ? WHERE id = ?"
    )
      .bind(name, category, dataJson, edgesJson, now, body.workflow_id)
      .run();
    return json({ workflow_id: body.workflow_id, success: true });
  }

  const id = uuid();
  await env.DB.prepare(
    `INSERT INTO workflows (id, owner_id, name, category, data_json, edges_json, status, published, is_template, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'draft', 0, 0, ?, ?)`
  )
    .bind(id, owner, name, category, dataJson, edgesJson, now, now)
    .run();
  return json({ workflow_id: id, success: true }, 201);
}

async function ownedWorkflow(env, auth, id) {
  const row = await env.DB.prepare("SELECT * FROM workflows WHERE id = ?").bind(id).first();
  if (!row) return { error: err404("Workflow not found") };
  if (row.owner_id !== ownerId(auth)) return { error: err403("Not your workflow") };
  return { row };
}

export async function updateWorkflowField(request, env, auth, id, field, label) {
  let body;
  try {
    body = await request.json();
  } catch {
    return err400("Expected a JSON body");
  }
  const value = String(body?.[field] ?? "").trim();
  if (!value) return err400(`Field '${field}' is required`);
  const { error } = await ownedWorkflow(env, auth, id);
  if (error) return error;
  await env.DB.prepare(`UPDATE workflows SET ${field} = ?, updated_at = ? WHERE id = ?`).bind(value, nowIso(), id).run();
  return json({ success: true, [label || field]: value });
}

export async function setWorkflowThumbnail(request, env, auth, id) {
  let body = {};
  try {
    body = await request.json();
  } catch {}
  const { error } = await ownedWorkflow(env, auth, id);
  if (error) return error;
  const thumbnail = String(body?.thumbnail || "").slice(0, 2048) || null;
  await env.DB.prepare("UPDATE workflows SET thumbnail = ?, updated_at = ? WHERE id = ?").bind(thumbnail, nowIso(), id).run();
  return json({ success: true });
}

export async function setWorkflowFlag(request, env, auth, id, flag) {
  let body;
  try {
    body = await request.json();
  } catch {
    return err400("Expected a JSON body");
  }
  const { error } = await ownedWorkflow(env, auth, id);
  if (error) return error;
  const on = !!body?.[flag];
  await env.DB.prepare(`UPDATE workflows SET ${flag === "publish" ? "published" : "is_template"} = ?, updated_at = ? WHERE id = ?`)
    .bind(on ? 1 : 0, nowIso(), id)
    .run();
  return json({ [flag]: on });
}

export async function deleteWorkflow(env, auth, id) {
  const { error } = await ownedWorkflow(env, auth, id);
  if (error) return error;
  await env.DB.batch([
    env.DB.prepare("DELETE FROM workflows WHERE id = ?").bind(id),
    env.DB.prepare("DELETE FROM workflow_runs WHERE workflow_id = ?").bind(id),
  ]);
  return json({ success: true });
}

/* -------------------------------------------------- node schema registry */

function jsonSchemaFromParams(params) {
  const properties = {};
  for (const p of params || []) {
    properties[p.name] = {
      type: p.type === "integer" ? "integer" : "string",
      title: p.name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      ...(p.enum ? { enum: p.enum } : {}),
      ...(p.default !== undefined ? { default: p.default } : {}),
      ...(p.description ? { description: p.description } : {}),
      examples: [p.default !== undefined ? p.default : ""],
    };
  }
  return {
    input_schema: {
      schemas: {
        input_data: {
          type: "object",
          properties,
          required: (params || []).filter((p) => p.required).map((p) => p.name),
        },
      },
    },
  };
}

function modelEntry(id) {
  const cfg = MODEL_MAP[id];
  return [id, jsonSchemaFromParams(cfg.params)];
}

const SIMPLE_SCHEMA = (props, required = []) => ({
  input_schema: { schemas: { input_data: { type: "object", properties: props, required } } },
});

const strSchema = (title, extra = {}) => ({ type: "string", title, ...extra });

/** Static registry: passthrough + utility node types plus every served model. */
export function nodeSchemasRegistry() {
  return {
    categories: {
      text: {
        models: {
          "text-passthrough": SIMPLE_SCHEMA({ text: strSchema("Text") }),
        },
      },
      image: {
        models: {
          "image-passthrough": SIMPLE_SCHEMA({ image_url: strSchema("Image URL", { description: "URL of the input image." }) }),
          ...Object.fromEntries(Object.entries(MODEL_MAP).filter(([, c]) => c.modality === "image").map(([id, c]) => modelEntry(id))),
        },
      },
      video: {
        models: Object.fromEntries(Object.entries(MODEL_MAP).filter(([, c]) => c.modality === "video").map(([id, c]) => modelEntry(id))),
      },
      audio: {
        models: {
          "audio-passthrough": SIMPLE_SCHEMA({ audio_url: strSchema("Audio URL") }),
        },
      },
      utility: {
        models: {
          "prompt-concat": SIMPLE_SCHEMA({ prompt: strSchema("Prompt") }),
          "video-combiner": SIMPLE_SCHEMA({
            videos_list: { type: "array", title: "Videos", items: { type: "string" }, default: [] },
            aspect_ratio: strSchema("Aspect Ratio", { default: "auto" }),
          }),
        },
      },
      api: { models: {} }, // shortcut: no external API nodes in v1 — the builder filters its static list against these keys
    },
  };
}

/** api-inputs: one string field per node, keyed by node id (playground form). */
export async function getWorkflowApiInputs(env, auth, id) {
  const { row, error } = await ownedWorkflow(env, auth, id);
  if (error) return error;
  const w = rowToWorkflow(row);
  const properties = {};
  for (const n of w.data?.nodes || []) {
    properties[n.id] = {
      type: "string",
      title: n.id,
      description: `${n.model || n.category} input`,
    };
  }
  return json({ input_data: { type: "object", properties, required: [] } });
}

/* ------------------------------------------------------------ run engine */

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = { image: 90, video: 240 }; // ~4.5 min images, ~12 min video

function mergeNodeParams(node, injected) {
  const params = node.params || {};
  const merged = {
    ...(node.input_params || {}),
    ...(params.params || {}),
    ...Object.fromEntries(Object.entries(params).filter(([k]) => k !== "params")),
  };
  const inj = injected?.[node.id];
  if (typeof inj === "string") merged.prompt = inj;
  else if (inj && typeof inj === "object") Object.assign(merged, inj);
  return merged;
}

/** Fill still-empty fields from upstream node outputs (single-hop chains). */
function applyUpstream(params, node, nodeOut) {
  const sources = (node.inputs || []).map((s) => (typeof s === "string" ? s : s?.id || s?.node || s?.source)).filter(Boolean);
  for (const key of Object.keys(params)) {
    const v = params[key];
    if (v !== null && v !== undefined && v !== "") continue;
    const from = sources.map((s) => nodeOut[s]).find(Boolean);
    if (from) params[key] = from;
  }
  return params;
}

async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

async function loadRun(env, runId) {
  return env.DB.prepare("SELECT * FROM workflow_runs WHERE id = ?").bind(runId).first();
}

async function setNodeState(env, runId, nodeId, entry) {
  const row = await loadRun(env, runId);
  const nodes = JSON.parse(row?.nodes_json || "{}");
  // One entry per node keeps the client's runs[] reads simple.
  nodes[nodeId] = [entry];
  await env.DB.prepare("UPDATE workflow_runs SET nodes_json = ?, updated_at = ? WHERE id = ?")
    .bind(JSON.stringify(nodes), nowIso(), runId)
    .run();
}

async function runGenerationNode(env, key, origin, node, params) {
  const model = node.model;
  const cfg = MODEL_MAP[model];
  if (!cfg) {
    throw new Error(
      `Model '${model}' is not served by this deployment yet — see GET /models for the served list.`
    );
  }
  if (!String(params.prompt || "").trim()) {
    throw new Error(`Node '${node.id}' has no prompt — connect a text node or set one on the node.`);
  }
  const submit = await ENGINE.generateCore(env, key, model, params);
  const submitData = await submit.json().catch(() => ({}));
  if (!submit.ok) {
    const detail = submitData?.detail;
    throw new Error(typeof detail === "string" ? detail : detail?.error || `Submit failed (${submit.status})`);
  }
  const jobId = submitData.request_id || submitData.id;
  const maxPolls = MAX_POLLS[cfg.modality === "video" ? "video" : "image"];
  for (let i = 0; i < maxPolls; i++) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    const r = await PROVIDERS[cfg.provider].poll(env, cfg, jobId);
    if (r.status === "IN_PROGRESS") continue;
    if (r.status !== "completed") throw new Error(r.error || `Generation ${r.status}`);
    const urls = await ENGINE.persistOutputs(env, jobId, r.outputs || [], origin);
    const type = cfg.modality === "video" ? "video_url" : "image_url";
    return urls.map((u) => ({ type, value: u, url: u }));
  }
  throw new Error(`Generation for node '${node.id}' timed out`);
}

function passthroughOutputs(node, params) {
  const val = (k) => (params[k] !== undefined && params[k] !== null && params[k] !== "" ? String(params[k]) : null);
  if (node.category === "text") {
    const v = val("text") ?? val("prompt") ?? val("value") ?? "";
    return [{ type: "text", value: v, url: v }];
  }
  if (node.model === "video-combiner") {
    const list = Array.isArray(params.videos_list) ? params.videos_list.filter(Boolean) : [];
    const v = list[0] || val("video_url") || "";
    return [{ type: "video_url", value: v, url: v }];
  }
  if (node.category === "audio") {
    const v = val("audio_url") || "";
    return [{ type: "audio_url", value: v, url: v }];
  }
  if (node.category === "image") {
    const v = val("image_url") || "";
    return v ? [{ type: "image_url", value: v, url: v }] : [{ type: "text", value: "", url: "" }];
  }
  // prompt-concat and anything else textual
  const v = val("prompt") ?? val("text") ?? "";
  return [{ type: "text", value: v, url: v }];
}

/** Executes the whole graph sequentially; designed for ctx.waitUntil. */
async function executeRun(env, runId, key, origin) {
  const run = await loadRun(env, runId);
  if (!run || run.status !== "queued") return;
  const wfRow = await env.DB.prepare("SELECT * FROM workflows WHERE id = ?").bind(run.workflow_id).first();
  if (!wfRow) return;
  // data_json is the {nodes:[…]} payload (see createOrUpdateWorkflow), not the full def.
  const nodes = JSON.parse(wfRow.data_json || '{"nodes":[]}')?.nodes || [];
  const injected = JSON.parse(run.inputs_json || "{}");
  const nodeOut = {};
  let firstError = null;

  await env.DB.prepare("UPDATE workflow_runs SET status = 'running', updated_at = ? WHERE id = ?").bind(nowIso(), runId).run();

  for (const node of nodes) {
    const params = applyUpstream(mergeNodeParams(node, injected), node, nodeOut);
    let entry;
    try {
      const isGeneration = ["image", "video"].includes(node.category) && MODEL_MAP[node.model];
      const outputs = isGeneration
        ? await runGenerationNode(env, key, origin, node, params)
        : passthroughOutputs(node, params);
      nodeOut[node.id] = outputs[0]?.value || "";
      entry = { status: "succeeded", result: { id: `${runId}:${node.id}`, outputs } };
    } catch (e) {
      firstError = firstError || String(e?.message || e);
      entry = { status: "failed", result: { id: `${runId}:${node.id}`, outputs: [] } };
    }
    await setNodeState(env, runId, node.id, entry);
  }

  const nodesState = JSON.parse((await loadRun(env, runId))?.nodes_json || "{}");
  const failed = Object.values(nodesState).some((runs) => runs[0]?.status === "failed");
  const outputs = Object.entries(nodesState).flatMap(([id, runs]) =>
    (runs[0]?.result?.outputs || []).map((o) => ({ id, ...o }))
  );
  await env.DB.prepare(
    "UPDATE workflow_runs SET status = ?, outputs_json = ?, error = ?, updated_at = ? WHERE id = ?"
  )
    .bind(failed ? "failed" : "completed", JSON.stringify(outputs), failed ? firstError : null, nowIso(), runId)
    .run();
}

/* ----------------------------------------------------------- run routes */

async function startRun(env, auth, ctx, workflowId, inputs, origin) {
  if (!auth.key) return err401(); // generation nodes debit a raw API key
  const runId = uuid();
  const now = nowIso();
  await env.DB.prepare(
    `INSERT INTO workflow_runs (id, workflow_id, owner_id, status, inputs_json, outputs_json, nodes_json, created_at, updated_at)
     VALUES (?, ?, ?, 'queued', ?, '[]', '{}', ?, ?)`
  )
    .bind(runId, workflowId, ownerId(auth), JSON.stringify(inputs || {}), now, now)
    .run();
  const exec = executeRun(env, runId, auth.key, origin);
  if (ctx?.waitUntil) ctx.waitUntil(exec);
  else await exec; // callers without an execution context run inline
  return json({ run_id: runId, id: runId, status: "queued" }, 202);
}

export async function runWorkflow(request, env, auth, ctx, id) {
  const { row, error } = await ownedWorkflow(env, auth, id);
  if (error) return error;
  const body = await readBody(request);
  return startRun(env, auth, ctx, row.id, {}, new URL(request.url).origin);
}

export async function apiExecute(request, env, auth, ctx, id) {
  const { row, error } = await ownedWorkflow(env, auth, id);
  if (error) return error;
  const body = await readBody(request);
  return startRun(env, auth, ctx, row.id, body?.inputs || {}, new URL(request.url).origin);
}

/** Single-node run: a workflow_runs row scoped to that node. */
export async function runSingleNode(request, env, auth, ctx, workflowId, nodeId) {
  const { row, error } = await ownedWorkflow(env, auth, workflowId);
  if (error) return error;
  const body = await readBody(request);
  const model = String(body?.model || "");
  if (MODEL_MAP[model] && !auth.key) return err401(); // generation debits a raw API key
  const params = body?.params && typeof body.params === "object" ? body.params : {};
  const runId = uuid();
  const now = nowIso();
  await env.DB.prepare(
    `INSERT INTO workflow_runs (id, workflow_id, owner_id, status, inputs_json, outputs_json, nodes_json, created_at, updated_at)
     VALUES (?, ?, ?, 'queued', '{}', '[]', ?, ?, ?)`
  )
    .bind(
      runId,
      row.id,
      ownerId(auth),
      JSON.stringify({ [nodeId]: [{ status: "running", result: null }] }),
      now,
      now
    )
    .run();
  const exec = (async () => {
    let entry;
    try {
      const cfg = MODEL_MAP[model];
      const outputs = cfg
        ? await runGenerationNode(env, auth.key, new URL(request.url).origin, { id: nodeId, model, category: cfg.modality }, params)
        : passthroughOutputs({ id: nodeId, category: model.split("-")[0], model }, params);
      entry = { status: "succeeded", result: { id: `${runId}:${nodeId}`, outputs } };
    } catch (e) {
      entry = { status: "failed", result: { id: `${runId}:${nodeId}`, outputs: [] }, error: String(e?.message || e) };
    }
    const fresh = await loadRun(env, runId);
    if (!fresh || fresh.status !== "queued") return;
    const failed = entry.status === "failed";
    await env.DB.prepare(
      "UPDATE workflow_runs SET status = ?, outputs_json = ?, error = ?, updated_at = ? WHERE id = ?"
    )
      .bind(
        failed ? "failed" : "completed",
        JSON.stringify((entry.result.outputs || []).map((o) => ({ id: nodeId, ...o }))),
        failed ? entry.error : null,
        nowIso(),
        runId
      )
      .run();
    await env.DB.prepare("UPDATE workflow_runs SET nodes_json = ? WHERE id = ?")
      .bind(JSON.stringify({ [nodeId]: [entry] }), runId)
      .run();
  })();
  if (ctx?.waitUntil) ctx.waitUntil(exec);
  else await exec;
  return json({ run_id: runId, id: runId }, 202);
}

/** GET /workflow/run/{id}/status — per-node entries for the builder pollers. */
export async function runStatus(env, auth, runId) {
  const row = await loadRun(env, runId);
  if (!row || row.owner_id !== ownerId(auth)) return err404("Run not found");
  let nodes = {};
  try {
    nodes = JSON.parse(row.nodes_json || "{}");
  } catch {}
  return json({ status: row.status, run_id: row.id, nodes });
}

/** GET /workflow/run/{id}/api-outputs — final outputs for the playground poll. */
export async function runOutputs(env, auth, runId) {
  const row = await loadRun(env, runId);
  if (!row || row.owner_id !== ownerId(auth)) return err404("Run not found");
  const outputs = JSON.parse(row.outputs_json || "[]");
  const first = outputs[0]?.value || null;
  const inProgress = row.status === "queued" || row.status === "running";
  return json({
    status: inProgress ? "processing" : row.status,
    run_id: row.id,
    outputs,
    url: first,
    output: first ? { url: first } : null,
    ...(row.error ? { error: row.error } : {}),
  });
}

export async function deleteNodeRun(env, auth, nodeRunId) {
  // Node runs share the workflow_runs table; the builder's delete is cosmetic.
  await env.DB.prepare("DELETE FROM workflow_runs WHERE id = ?").bind(nodeRunId).run();
  return json({ ok: true });
}

/* -------------------------------------------------------------- architect */

/**
 * v1 architect: template that pairs a text node with one generation node
 * (video when the prompt mentions it), persisted as a completed agent-kind
 * job and served through poll-architect/{id}/result.
 */
export async function architect(request, env, auth) {
  let body;
  try {
    body = await request.json();
  } catch {
    return err400("Expected a JSON body");
  }
  const prompt = String(body?.prompt || "").trim();
  if (!prompt) return err400("Field 'prompt' is required");
  const wantsVideo = /\b(video|clip|film|trailer|animation|motion)\b/i.test(prompt);
  const genNode = wantsVideo
    ? {
        id: "video1",
        category: "video",
        model: "seedance-lite-t2v",
        input_params: {},
        output_params: {},
        params: { params: { prompt: null, aspect_ratio: "16:9", duration: 5 } },
        position: { x: 350, y: 100 },
        inputs: ["text1"],
      }
    : {
        id: "image1",
        category: "image",
        model: "flux-schnell-image",
        input_params: {},
        output_params: {},
        params: { params: { prompt: null, width: 1024, height: 1024, num_images: 1 } },
        position: { x: 350, y: 100 },
        inputs: ["text1"],
      };
  const genTarget = wantsVideo ? ["video1", "videoNode", "videoInput", "videoOutput"] : ["image1", "imageNode", "imageInput", "imageOutput"];
  const workflow = {
    nodes: [
      {
        id: "text1",
        category: "text",
        model: "text-passthrough",
        input_params: {},
        output_params: {},
        params: {},
        position: { x: 0, y: 100 },
      },
      genNode,
    ],
    edges: [
      {
        id: "e-text1-" + genTarget[0],
        source: "text1",
        target: genTarget[0],
        sourceHandle: "textOutput",
        targetHandle: genTarget[2],
      },
    ],
  };
  const jobId = uuid();
  const now = nowIso();
  await env.DB.prepare(
    `INSERT INTO agent_jobs (id, kind, owner_id, agent_id, conversation_id, status, response_json, created_at, updated_at)
     VALUES (?, 'architect', ?, NULL, NULL, 'completed', ?, ?, ?)`
  )
    .bind(
      jobId,
      ownerId(auth),
      JSON.stringify({
        status: "completed",
        message: `Built a ${wantsVideo ? "text → video" : "text → image"} starter for: “${prompt.slice(0, 120)}”. Wire the text node and run it.`,
        suggestions: ["Set your prompt on the text node", "Press Run All", "Swap the model for a different look"],
        workflow,
      }),
      now,
      now
    )
    .run();
  return json({ request_id: jobId, id: jobId, status: "completed" });
}

export async function pollArchitect(env, auth, requestId) {
  const row = await env.DB.prepare("SELECT * FROM agent_jobs WHERE id = ? AND kind = 'architect'").bind(requestId).first();
  if (!row) return err404("Unknown architect request id");
  return json(JSON.parse(row.response_json || "{}"));
}

/* --------------------------------------------------------------- routing */

/** Authed /workflow dispatcher. `key` is required only for run submits. */
export async function dispatch(request, env, auth, path, ctx, key) {
  const method = request.method;

  if (method === "GET" && (path === "/workflow/get-workflow-defs" || path === "/workflow/defs")) {
    return json(await listUserWorkflows(env, auth));
  }
  if (method === "POST" && path === "/workflow/create") return createOrUpdateWorkflow(request, env, auth);
  if (method === "GET" && path === "/workflow/node-schemas") return json(nodeSchemasRegistry());

  let m = path.match(/^\/workflow\/get-workflow-def\/([^/]+)$/);
  if (method === "GET" && m) return getWorkflowDef(env, auth, m[1]);
  m = path.match(/^\/workflow\/update-name\/([^/]+)$/);
  if (method === "POST" && m) return updateWorkflowField(request, env, auth, m[1], "name");
  m = path.match(/^\/workflow\/update-category\/([^/]+)$/);
  if (method === "POST" && m) return updateWorkflowField(request, env, auth, m[1], "category");
  m = path.match(/^\/workflow\/delete-workflow-def\/([^/]+)$/);
  if (method === "DELETE" && m) return deleteWorkflow(env, auth, m[1]);
  m = path.match(/^\/workflow\/([^/]+)\/thumbnail$/);
  if (method === "POST" && m) return setWorkflowThumbnail(request, env, auth, m[1]);
  m = path.match(/^\/workflow\/workflow\/([^/]+)\/publish$/);
  if (method === "POST" && m) return setWorkflowFlag(request, env, auth, m[1], "publish");
  m = path.match(/^\/workflow\/workflow\/([^/]+)\/template$/);
  if (method === "POST" && m) return setWorkflowFlag(request, env, auth, m[1], "template");
  m = path.match(/^\/workflow\/([^/]+)\/api-inputs$/);
  if (method === "GET" && m) return getWorkflowApiInputs(env, auth, m[1]);
  m = path.match(/^\/workflow\/([^/]+)\/node-schemas$/);
  if (method === "GET" && m) return json(nodeSchemasRegistry());
  m = path.match(/^\/workflow\/([^/]+)\/api-node-schemas$/);
  if (method === "GET" && m) return json({ models: {} });
  m = path.match(/^\/workflow\/([^/]+)\/api-execute$/);
  if (method === "POST" && m) return apiExecute(request, env, auth, ctx, m[1]);
  m = path.match(/^\/workflow\/([^/]+)\/run$/);
  if (method === "POST" && m) return runWorkflow(request, env, auth, ctx, m[1]);
  m = path.match(/^\/workflow\/([^/]+)\/node\/([^/]+)\/run$/);
  if (method === "POST" && m) return runSingleNode(request, env, auth, ctx, m[1], m[2]);
  m = path.match(/^\/workflow\/run\/([^/]+)\/status$/);
  if (method === "GET" && m) return runStatus(env, auth, m[1]);
  m = path.match(/^\/workflow\/run\/([^/]+)\/api-outputs$/);
  if (method === "GET" && m) return runOutputs(env, auth, m[1]);
  m = path.match(/^\/workflow\/node-run\/([^/]+)$/);
  if (method === "DELETE" && m) return deleteNodeRun(env, auth, m[1]);
  if (method === "POST" && path === "/workflow/architect") return architect(request, env, auth);
  if (method === "POST" && path === "/workflow/cloudfront-signed-url") {
    // shortcut: outputs are served from our own public /media/* URLs — nothing
    // to sign; pass the URL back so the builder's download flow keeps working.
    const body = await readBody(request);
    return json({ signed_url: String(body?.url || "") });
  }
  m = path.match(/^\/workflow\/poll-architect\/([^/]+)\/result$/);
  if (method === "GET" && m) return pollArchitect(env, auth, m[1]);

  return err404();
}
