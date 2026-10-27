/**
 * Sceneviz API — Stage 2 backend (Phase A shell).
 * Runs on Cloudflare Workers at https://api.opraiz.com.
 *
 * Contract: docs/stage2-api-contract.md — response shapes follow the
 * FastAPI-style conventions the client expects ({detail} / {detail:{error}}).
 *
 * Auth: BYOK. Keys are issued by api/issue-key.mjs; only SHA-256 hashes are
 * stored. Clients send `x-api-key`. 401 = missing/unknown key, 403 = disabled.
 */

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
    return err501(
      `Model '${model}' is not yet served by the Opraiz API (Phase A). ` +
        `Generation comes online in Phase B — see docs/stage2-runpod-plan.md.`
    );
  }

  if (method === "GET" && /^\/api\/v1\/predictions\/[^/]+\/result$/.test(path)) {
    return err501("Job status is not yet served by the Opraiz API (Phase A).");
  }

  return err404();
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
