/**
 * Sceneviz API — Stage 2 backend (Phase A shell + Phase B GPU bridge).
 * Runs on Cloudflare Workers at https://api.opraiz.com.
 *
 * Contract: docs/stage2-api-contract.md — response shapes follow the
 * FastAPI-style conventions the client expects ({detail} / {detail:{error}}).
 *
 * Auth: BYOK. Keys are issued by api/issue-key.mjs; only SHA-256 hashes are
 * stored. Clients send `x-api-key`. 401 = missing/unknown key, 403 = disabled.
 */

import { MODEL_MAP } from "./modelMap.js";
import { submitJob, getJob } from "./gpu.js";

const JSON_HDR = { "content-type": "application/json; charset=utf-8" };

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
  "access-control-allow-headers": "x-api-key,authorization,content-type",
  "access-control-max-age": "86400",
};

function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HDR, ...CORS, ...extra },
  });
}

const err400 = (m) => json({ detail: { error: m } }, 400);
const err401 = (m = "Not authenticated") => json({ detail: m }, 401);
const err403 = (m = "Not authorized") => json({ detail: { error: m } }, 403);
const err404 = (m = "Not found") => json({ detail: m }, 404);
const err501 = (m) => json({ detail: { error: m } }, 501);
const err503 = (m) => json({ detail: { error: m } }, 503);

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function uuid() {
  return crypto.randomUUID();
}

/** Media object path for a stored upload. */
function mediaPath(key) {
  return `/media/${key}`;
}

// Phase B GPU bridge: per-key fixed-window rate limit on generation submits.
// shortcut: rate rows accumulate one per active key-minute, no cleanup job —
// table stays tiny; add a GC pass if usage grows unbounded.
const RATE_WINDOW_MS = 60000;
const RATE_LIMIT_PER_WINDOW = 60;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

    if (path === "/healthz") return json({ ok: true, service: "sceneviz-api", stage: "A" });

    let auth;
    try {
      auth = await authenticate(request, env);
    } catch (e) {
      return json({ detail: { error: String(e?.message || e) } }, 500);
    }
    if (!auth.ok) return auth.response;
    const key = auth.key;

    try {
      return await route(request, env, url, path, key);
    } catch (e) {
      return json({ detail: { error: String(e?.message || e) } }, 500);
    }
  },
};

/* ------------------------------------------------------------------ auth */

async function authenticate(request, env) {
  const provided =
    request.headers.get("x-api-key") ||
    (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim() ||
    new URL(request.url).searchParams.get("api_key") ||
    "";

  if (!provided) return { ok: false, response: err401() };

  const key_hash = await sha256Hex(provided);
  const row = await env.DB.prepare(
    "SELECT id, key_hash, label, credits, status FROM keys WHERE key_hash = ?"
  )
    .bind(key_hash)
    .first();

  if (!row) return { ok: false, response: err401() };
  if (row.status !== "active") return { ok: false, response: err403("Key is disabled") };

  return { ok: true, key: row };
}

/* ----------------------------------------------------------------- routes */

async function route(request, env, url, path, key) {
  const method = request.method;

  // --- account -----------------------------------------------------------
  if (method === "GET" && path === "/api/v1/account/balance") {
    return json({ balance: key.credits, email: key.label || "sceneviz-key" });
  }

  // --- model catalog -----------------------------------------------------
  if (method === "GET" && path === "/api/v1/models") {
    // Phase A: catalog metadata only. Generation arrives in Phase B.
    return json({
      models: [],
      note: "Opraiz API Phase A — catalog populated as GPU models come online (Phase B+).",
    });
  }

  // --- uploads (require the MEDIA R2 binding — enable R2 first) ----------
  if (!env.MEDIA && (path === "/app/get_file_upload_url" || path === "/app/upload" || path === "/api/v1/upload_file")) {
    return err501("Object storage is not enabled yet — enable R2 in the Cloudflare dashboard.");
  }

  if (method === "GET" && path === "/app/get_file_upload_url") {
    const filename = url.searchParams.get("filename") || "upload.bin";
    const ext = (filename.split(".").pop() || "bin").replace(/[^a-z0-9]/gi, "").slice(0, 8);
    const objectKey = `uploads/${uuid()}.${ext}`;
    // fields.token carries the key's stored hash so the upload endpoint can
    // authenticate without re-sending the raw key (the hash is not usable as
    // an API key: authenticate() hashes the presented value before lookup).
    return json({
      url: `${url.origin}/app/upload`,
      fields: { key: objectKey, token: key.key_hash },
    });
  }

  if (method === "POST" && path === "/app/upload") {
    return await handleUpload(request, env);
  }

  if (method === "POST" && path === "/api/v1/upload_file") {
    const res = await handleUpload(request, env);
    if (res.status !== 204) return res;
    const stored = request.headers.get("x-stored-key");
    const publicUrl = `${url.origin}${mediaPath(stored || "")}`;
    return json({ url: publicUrl, file_url: publicUrl });
  }

  if (method === "GET" && path.startsWith("/media/")) {
    if (!env.MEDIA) return err501("Object storage is not enabled yet.");
    const objectKey = decodeURIComponent(path.slice("/media/".length));
    const obj = await env.MEDIA.get(objectKey);
    if (!obj) return err404();
    const headers = new Headers(CORS);
    obj.writeHttpMetadata(headers);
    headers.set("etag", obj.httpEtag);
    headers.set("cache-control", "public, max-age=31536000, immutable");
    return new Response(obj.body, { status: 200, headers });
  }

  // --- generation (Phase B) ---------------------------------------------
  const genMatch = path.match(/^\/api\/v1\/([^/]+)$/);
  if (method === "POST" && genMatch) {
    const model = genMatch[1];
    if (model === "predictions" || model === "upload_file" || model === "account" || model === "models") {
      return err404();
    }
    return await handleGenerate(request, env, key, model);
  }

  const pollMatch = path.match(/^\/api\/v1\/predictions\/([^/]+)\/result$/);
  if (method === "GET" && pollMatch) {
    return await handleResult(env, key, pollMatch[1]);
  }

  return err404();
}

/* ------------------------------------------------------------- generation */

async function handleGenerate(request, env, key, model) {
  const cfg = MODEL_MAP[model];
  if (!cfg) {
    return err501(
      `Model '${model}' is not yet served by the Opraiz API. ` +
        `Currently served: ${Object.keys(MODEL_MAP).join(", ")} — more come online in Phase B+ ` +
        `(see docs/stage2-runpod-plan.md).`
    );
  }

  const endpointId = env[cfg.endpointEnv];
  if (!endpointId) return err503("GPU endpoint not provisioned yet");

  let input;
  try {
    input = cfg.translate(await request.json());
  } catch {
    return err400("Expected a JSON body");
  }
  if (!input.prompt) return err400("Field 'prompt' is required");

  // Client sends num_images (catalog: each image charges separately).
  const numImages = Math.min(2, Math.max(1, Number(input.num_images) || 1));
  const cost = cfg.costCredits * numImages; // shortcut: no refund on failed jobs, add refund when metering lands
  if ((key.credits || 0) < cost) return err403("Insufficient credits");

  // Rate limit after the free checks, before any GPU spend.
  if (!(await checkRateLimit(env, key.id))) {
    return json({ detail: { error: "Rate limit exceeded" } }, 429);
  }

  let job;
  try {
    job = await submitJob(env, endpointId, input);
  } catch (e) {
    return json({ detail: { error: `GPU submit failed: ${String(e?.message || e)}` } }, 502);
  }
  if (!job?.id) return json({ detail: { error: "RunPod did not return a job id" } }, 502);

  // shortcut: no refund on failed jobs, add refund when metering lands
  await env.DB.batch([
    env.DB.prepare("UPDATE keys SET credits = credits - ? WHERE id = ?").bind(cost, key.id),
    env.DB.prepare("INSERT INTO usage (id, key_id, model, credits, job_id) VALUES (?, ?, ?, ?, ?)").bind(
      uuid(),
      key.id,
      model,
      cost,
      job.id
    ),
  ]);

  // Contract §3.1: the client reads request_id || id — return both.
  return json({ status: "submitted", request_id: job.id, id: job.id });
}

/**
 * Poll: translate RunPod status into the contract vocabulary (§3.1, exact,
 * case-insensitive). Unknown job → 404. Non-terminal → "IN_PROGRESS"
 * (client keeps polling anything outside the success/failure sets).
 */
async function handleResult(env, key, jobId) {
  const usage = await env.DB.prepare("SELECT model FROM usage WHERE job_id = ?").bind(jobId).first();
  if (!usage) return err404("Unknown request id");

  const cfg = MODEL_MAP[usage.model];
  const endpointId = cfg && env[cfg.endpointEnv];
  if (!endpointId) return err503("GPU endpoint not provisioned yet");

  let job;
  try {
    job = await getJob(env, endpointId, jobId);
  } catch (e) {
    return json({ detail: { error: `GPU status failed: ${String(e?.message || e)}` } }, 502);
  }

  const rp = String(job.status || "").toUpperCase();
  let status = "IN_PROGRESS";
  let error;
  if (rp === "COMPLETED") {
    status = "completed";
  } else if (rp === "FAILED" || rp === "TIMED_OUT") {
    status = "failed";
    error = (typeof job.output === "string" && job.output) || `RunPod job ${rp.toLowerCase()}`;
  } else if (rp === "CANCELLED") {
    status = "cancelled";
    error = "Job was cancelled";
  }

  const outputs = extractOutputs(job.output);
  // Client extraction order: outputs[0] || url || output.url → output covers all three.
  return json({
    status,
    request_id: jobId,
    id: jobId,
    output: outputs[0] || null,
    outputs,
    ...(error ? { error } : {}),
  });
}

function extractOutputs(out) {
  if (Array.isArray(out)) return out.filter((u) => typeof u === "string");
  if (typeof out === "string") return out ? [out] : [];
  if (out && typeof out === "object") {
    // worker-sdxl returns {image_url, images:[...]}; data URIs included.
    if (Array.isArray(out.images)) return out.images.filter((u) => typeof u === "string");
    const url = out.image_url || out.url;
    return typeof url === "string" ? [url] : [];
  }
  return [];
}

/** Fixed-window per-key counter; returns true when the request may proceed. */
async function checkRateLimit(env, keyId) {
  const windowStart = Math.floor(Date.now() / RATE_WINDOW_MS) * RATE_WINDOW_MS;
  const row = await env.DB.prepare(
    `INSERT INTO rate (key_id, window_start, count) VALUES (?, ?, 1)
     ON CONFLICT (key_id, window_start) DO UPDATE SET count = count + 1
     RETURNING count`
  )
    .bind(keyId, windowStart)
    .first();
  return (row?.count || 0) <= RATE_LIMIT_PER_WINDOW;
}

/* ---------------------------------------------------------------- uploads */

/**
 * Phase A upload path: multipart POST straight into the R2 MEDIA binding.
 * (Contract note: R2 presigned-POST support is not assumed; the Worker is the
 * upload intermediary. Public read is via GET /media/{key}.)
 */
async function handleUpload(request, env) {
  const token = request.headers.get("x-upload-token") || "";
  if (!token) return err401("Missing x-upload-token");
  const match = await env.DB.prepare("SELECT id FROM keys WHERE key_hash = ?")
    .bind(token)
    .first();
  if (!match) return err403("Invalid upload token");

  const form = await request.formData();
  const file = form.get("file");
  const objectKey = String(form.get("key") || `uploads/${uuid()}`);
  if (!file || typeof file === "string") return err400("Expected multipart field 'file'");

  await env.MEDIA.put(objectKey, file, {
    httpMetadata: { contentType: file.type || "application/octet-stream" },
  });
  return new Response(null, { status: 204, headers: { ...CORS, "x-stored-key": objectKey } });
}
