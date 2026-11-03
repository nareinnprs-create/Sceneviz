/**
 * M7 — Creative agent (design canvas) API (D1-backed).
 *
 * Serves /api/v1/creative-agent/* exactly as the canvas client calls it
 * (Bearer key or session): sessions, message snapshots, asset registry,
 * chat/run-skill jobs and the events poll. Jobs are TEMPLATE-BASED in v1 —
 * a completed job emits info+text events, no model calls, no asset events.
 * Client-side PATCHed message snapshots are stored verbatim as one JSON
 * column (the client owns that state and re-sends the full array).
 */

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
const err404 = (m = "Not found") => json({ detail: m }, 404);

const uuid = () => crypto.randomUUID();
const nowIso = () => new Date().toISOString();

function ownerId(auth) {
  return auth.account?.id || auth.key?.account_id || auth.key?.id || null;
}

/** Skills the canvas mentions by name; inputs[0] receives the user text. */
export function listAgentSkills() {
  return [
    { name: "generate_image", inputs: ["premise"] },
    { name: "edit_image", inputs: ["image", "instruction"] },
    { name: "image_to_video", inputs: ["image", "premise"] },
    { name: "remove_background", inputs: ["image"] },
  ];
}

/** v1 responder: deterministic brief acknowledgment, no model calls. */
function caReply(message, skillName, inputKeys) {
  const text = String(message || "").trim();
  const quoted = text.length > 280 ? `${text.slice(0, 280)}…` : text;
  const skillNote = skillName
    ? `Skill \`${skillName}\` received: ${inputKeys.join(", ") || "no inputs"}.`
    : `Got your brief: “${quoted}”.`;
  return [
    skillNote,
    "",
    "_Template mode: the creative agent runs scripted responses for now — model-backed generation lands with the next release._",
  ].join("\n");
}

async function ownedSession(env, auth, sessionId) {
  const row = await env.DB.prepare("SELECT * FROM ca_sessions WHERE id = ?").bind(sessionId).first();
  if (!row) return { error: err404("Session not found") };
  if (row.owner_id !== ownerId(auth)) return { error: err404("Session not found") };
  return { session: row };
}

async function touchSession(env, sessionId) {
  await env.DB.prepare("UPDATE ca_sessions SET updated_at = ? WHERE id = ?").bind(nowIso(), sessionId).run();
}

/* --------------------------------------------------------------- sessions */

async function listSessions(env, auth) {
  const rows =
    (await env.DB.prepare("SELECT id, name, updated_at FROM ca_sessions WHERE owner_id = ? ORDER BY updated_at DESC LIMIT 200")
      .bind(ownerId(auth))
      .all()).results || [];
  return json(rows);
}

async function createSession(request, env, auth) {
  const id = uuid();
  const now = nowIso();
  await env.DB.prepare(
    "INSERT INTO ca_sessions (id, owner_id, name, messages_json, created_at, updated_at) VALUES (?, ?, 'New Session', '[]', ?, ?)"
  )
    .bind(id, ownerId(auth), now, now)
    .run();
  return json({ id, name: "New Session" }, 201);
}

async function renameSession(request, env, auth, sessionId) {
  let body;
  try {
    body = await request.json();
  } catch {
    return err400("Expected a JSON body");
  }
  const name = String(body?.name || "").trim();
  if (!name) return err400("Field 'name' is required");
  const { error } = await ownedSession(env, auth, sessionId);
  if (error) return error;
  await env.DB.prepare("UPDATE ca_sessions SET name = ?, updated_at = ? WHERE id = ?").bind(name, nowIso(), sessionId).run();
  return json({ ok: true, name });
}

async function deleteSession(env, auth, sessionId) {
  const { error } = await ownedSession(env, auth, sessionId);
  if (error) return error;
  await env.DB.batch([
    env.DB.prepare("DELETE FROM ca_sessions WHERE id = ?").bind(sessionId),
    env.DB.prepare("DELETE FROM ca_jobs WHERE session_id = ?").bind(sessionId),
    env.DB.prepare("DELETE FROM ca_assets WHERE session_id = ?").bind(sessionId),
  ]);
  return json({ ok: true });
}

/* --------------------------------------------------------------- messages */

async function getMessages(env, auth, sessionId) {
  const { session, error } = await ownedSession(env, auth, sessionId);
  if (error) return error;
  let messages = [];
  try {
    messages = JSON.parse(session.messages_json || "[]");
  } catch {}
  return json(messages);
}

async function saveMessages(request, env, auth, sessionId) {
  let body;
  try {
    body = await request.json();
  } catch {
    return err400("Expected a JSON body");
  }
  const { error } = await ownedSession(env, auth, sessionId);
  if (error) return error;
  const messages = Array.isArray(body?.messages) ? body.messages.slice(0, 500) : [];
  await env.DB.prepare("UPDATE ca_sessions SET messages_json = ?, updated_at = ? WHERE id = ?")
    .bind(JSON.stringify(messages), nowIso(), sessionId)
    .run();
  return json({ ok: true, saved: messages.length });
}

/* ----------------------------------------------------------------- assets */

async function listAssets(env, auth, sessionId) {
  const { error } = await ownedSession(env, auth, sessionId);
  if (error) return error;
  const rows =
    (await env.DB.prepare("SELECT asset_label, url, kind, source_tool, model, prompt, created_at FROM ca_assets WHERE session_id = ? ORDER BY created_at ASC")
      .bind(sessionId)
      .all()).results || [];
  return json(rows);
}

async function registerAsset(request, env, auth, sessionId) {
  let body;
  try {
    body = await request.json();
  } catch {
    return err400("Expected a JSON body");
  }
  const url = String(body?.url || "").trim();
  if (!url) return err400("Field 'url' is required");
  const { error } = await ownedSession(env, auth, sessionId);
  if (error) return error;
  const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM ca_assets WHERE session_id = ?").bind(sessionId).first();
  const assetLabel = `asset_${(n?.n || 0) + 1}`;
  await env.DB.prepare(
    "INSERT INTO ca_assets (id, session_id, owner_id, asset_label, url, kind, source_tool, model, prompt, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  )
    .bind(
      uuid(),
      sessionId,
      ownerId(auth),
      assetLabel,
      url,
      String(body?.kind || "image"),
      String(body?.source_tool || "upload"),
      body?.model ? String(body.model) : null,
      body?.prompt ? String(body.prompt) : null,
      nowIso()
    )
    .run();
  await touchSession(env, sessionId);
  return json({ asset_label: assetLabel, url, kind: String(body?.kind || "image") }, 201);
}

/* ------------------------------------------------------------------- jobs */

async function createJob(env, auth, sessionId, kind, model, prompt, events) {
  const jobId = uuid();
  const now = nowIso();
  const withIds = events.map((e, i) => ({ id: i + 1, job_id: jobId, ...e }));
  await env.DB.prepare(
    `INSERT INTO ca_jobs (id, session_id, owner_id, kind, model, prompt, status, events_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?)`
  )
    .bind(jobId, sessionId, ownerId(auth), kind, model || null, prompt || null, JSON.stringify(withIds), now, now)
    .run();
  await touchSession(env, sessionId);
  return jobId;
}

async function sessionChat(request, env, auth, sessionId) {
  let body;
  try {
    body = await request.json();
  } catch {
    return err400("Expected a JSON body");
  }
  const { error } = await ownedSession(env, auth, sessionId);
  if (error) return error;
  const message = String(body?.message || "").trim();
  if (!message) return err400("Field 'message' is required");
  const jobId = await createJob(env, auth, sessionId, "chat", body?.model, message, [
    { type: "info", payload: { content: "Planned 1 step (template mode)." } },
    { type: "text", payload: { content: caReply(message) } },
  ]);
  return json({ job_id: jobId, id: jobId, status: "completed" }, 202);
}

async function runSkill(request, env, auth, sessionId) {
  let body;
  try {
    body = await request.json();
  } catch {
    return err400("Expected a JSON body");
  }
  const { error } = await ownedSession(env, auth, sessionId);
  if (error) return error;
  const skillName = String(body?.skill_name || "").trim();
  if (!skillName) return err400("Field 'skill_name' is required");
  const inputs = body?.inputs && typeof body.inputs === "object" ? body.inputs : {};
  const jobId = await createJob(env, auth, sessionId, "skill", body?.model, JSON.stringify(inputs), [
    { type: "info", payload: { content: `Skill \`${skillName}\` queued (template mode).` } },
    { type: "text", payload: { content: caReply(Object.values(inputs)[0] || "", skillName, Object.keys(inputs)) } },
  ]);
  return json({ job_id: jobId, id: jobId, status: "completed" }, 202);
}

async function jobEvents(request, env, auth, jobId) {
  const row = await env.DB.prepare("SELECT * FROM ca_jobs WHERE id = ?").bind(jobId).first();
  if (!row || row.owner_id !== ownerId(auth)) return err404("Job not found");
  let events = [];
  try {
    events = JSON.parse(row.events_json || "[]");
  } catch {}
  const since = Math.max(0, Number(new URL(request.url).searchParams.get("since")) || 0);
  return json({
    events: events.filter((e) => (e.id || 0) > since),
    cursor: events.length,
    done: row.status === "completed" || row.status === "failed",
    approved: null,
    ...(row.status === "failed" ? { error: row.error || "Job failed" } : {}),
  });
}

/**
 * SSE variant of jobEvents: GET …/jobs/{id}/events/stream → text/event-stream.
 * Emits each stored event as one `data:` frame (same {id, job_id, type, payload}
 * objects the poll returns), then a `data: {"done":true}` terminator, then
 * closes. Template-mode jobs complete at submit time, so the stream is one
 * short burst — no incremental updates in v1. `?since=` filters like the poll.
 */
async function jobEventStream(request, env, auth, jobId) {
  const row = await env.DB.prepare("SELECT * FROM ca_jobs WHERE id = ?").bind(jobId).first();
  if (!row || row.owner_id !== ownerId(auth)) return err404("Job not found");
  let events = [];
  try {
    events = JSON.parse(row.events_json || "[]");
  } catch {}
  const since = Math.max(0, Number(new URL(request.url).searchParams.get("since")) || 0);
  const frames = events
    .filter((e) => (e.id || 0) > since)
    .map((e) => `data: ${JSON.stringify(e)}\n\n`);
  return new Response(`${frames.join("")}data: {"done":true}\n\n`, {
    status: 200,
    headers: {
      ...CORS,
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache",
    },
  });
}

async function jobAction(request, env, auth, jobId, action) {
  const row = await env.DB.prepare("SELECT * FROM ca_jobs WHERE id = ?").bind(jobId).first();
  if (!row || row.owner_id !== ownerId(auth)) return err404("Job not found");
  return json({ ok: true, job_id: jobId, action }); // v1 jobs never pause for approval
}

async function sessionJobs(env, auth, sessionId) {
  const { error } = await ownedSession(env, auth, sessionId);
  if (error) return error;
  const rows =
    (await env.DB.prepare("SELECT id, kind, model, status, created_at FROM ca_jobs WHERE session_id = ? ORDER BY created_at ASC")
      .bind(sessionId)
      .all()).results || [];
  return json(rows);
}

async function balance(env, auth) {
  if (auth.account) return json({ balance: auth.account.credits || 0, email: auth.account.email });
  return json({ balance: auth.key?.credits || 0, email: auth.key?.label || "sceneviz-key" });
}

/* --------------------------------------------------------------- routing */

/** Authed /api/v1/creative-agent dispatcher (path includes the prefix). */
export async function dispatch(request, env, auth, path) {
  const method = request.method;
  const sub = path.slice("/api/v1/creative-agent".length) || "/";

  if (method === "GET" && sub === "/account/balance") return balance(env, auth);
  if (method === "GET" && sub === "/agent-skills") return json(listAgentSkills());
  if (method === "GET" && sub === "/sessions") return listSessions(env, auth);
  if (method === "POST" && sub === "/sessions") return createSession(request, env, auth);

  let m = sub.match(/^\/sessions\/([^/]+)$/);
  if (m) {
    if (method === "PATCH" || method === "PUT") return renameSession(request, env, auth, m[1]);
    if (method === "DELETE") return deleteSession(env, auth, m[1]);
    if (method === "GET") {
      const { session, error } = await ownedSession(env, auth, m[1]);
      if (error) return error;
      return json({ id: session.id, name: session.name, created_at: session.created_at });
    }
  }
  m = sub.match(/^\/sessions\/([^/]+)\/messages$/);
  if (m) {
    if (method === "GET") return getMessages(env, auth, m[1]);
    if (method === "PATCH" || method === "POST") return saveMessages(request, env, auth, m[1]);
  }
  m = sub.match(/^\/sessions\/([^/]+)\/jobs$/);
  if (method === "GET" && m) return sessionJobs(env, auth, m[1]);
  m = sub.match(/^\/sessions\/([^/]+)\/assets$/);
  if (m) {
    if (method === "GET") return listAssets(env, auth, m[1]);
    if (method === "POST") return registerAsset(request, env, auth, m[1]);
  }
  m = sub.match(/^\/sessions\/([^/]+)\/chat$/);
  if (method === "POST" && m) return sessionChat(request, env, auth, m[1]);
  m = sub.match(/^\/sessions\/([^/]+)\/run-skill$/);
  if (method === "POST" && m) return runSkill(request, env, auth, m[1]);
  m = sub.match(/^\/jobs\/([^/]+)\/events$/);
  if (method === "GET" && m) return jobEvents(request, env, auth, m[1]);
  m = sub.match(/^\/jobs\/([^/]+)\/events\/stream$/);
  if (method === "GET" && m) return jobEventStream(request, env, auth, m[1]);
  m = sub.match(/^\/jobs\/([^/]+)\/(approve|reject)$/);
  if (method === "POST" && m) return jobAction(request, env, auth, m[1], m[2]);

  return err404();
}
