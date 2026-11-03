/**
 * Sceneviz API — Stage 2 backend (Phase A shell + Phase B GPU bridge + WS4 accounts).
 * Runs on Cloudflare Workers at https://api.opraiz.com.
 *
 * Contract: docs/stage2-api-contract.md — response shapes follow the
 * FastAPI-style conventions the client expects ({detail} / {detail:{error}}).
 *
 * Auth:
 * - API keys (BYOK + self-serve): issued by api/issue-key.mjs or POST /keys;
 *   only SHA-256 hashes are stored. Clients send `x-api-key` or
 *   `Authorization: Bearer sk_live_…`. 401 = missing/unknown key, 403 = disabled.
 * - Account sessions (dashboard): POST /auth/* mints a 32-byte hex token
 *   (30-day expiry; only its SHA-256 is stored), sent as `Authorization: Bearer <token>`.
 *   Sessions work on /me, /keys, /history; generation still requires a key.
 */

import { MODEL_MAP, modelCatalog } from "./modelMap.js";
import { submitJob, getJob } from "./gpu.js";
import {
  sha256Hex,
  randomHex,
  hashPassword,
  verifyPassword,
  createSession,
  getSession,
  deleteSession,
} from "./auth.js";
import { handleMcp } from "./mcp.js";
import {
  PACKS,
  createDodoCheckout,
  verifyDodoWebhook,
  grantCredits,
} from "./billing.js";

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

function uuid() {
  return crypto.randomUUID();
}

/** Media object path for a stored upload. */
function mediaPath(key) {
  return `/media/${key}`;
}

/** Public media read: R2 when enabled, Workers KV interim. */
async function handleMediaRead(request, env, url, path) {
  const objectKey = decodeURIComponent(path.slice("/media/".length));
  if (!objectKey) return err404();
  if (env.MEDIA) {
    const obj = await env.MEDIA.get(objectKey);
    if (!obj) return err404();
    const headers = new Headers(CORS);
    obj.writeHttpMetadata(headers);
    headers.set("etag", obj.httpEtag);
    headers.set("cache-control", "public, max-age=31536000, immutable");
    return new Response(obj.body, { status: 200, headers });
  }
  if (env.MEDIA_KV) {
    const val = await env.MEDIA_KV.getWithMetadata(objectKey, { type: "arrayBuffer" });
    if (!val || !val.value) return err404();
    const headers = new Headers(CORS);
    headers.set("content-type", val.metadata?.contentType || "application/octet-stream");
    headers.set("cache-control", "public, max-age=31536000, immutable");
    return new Response(val.value, { status: 200, headers });
  }
  return err501("Object storage is not enabled yet.");
}

// Phase B GPU bridge: per-key fixed-window rate limit on generation submits.
// shortcut: rate rows accumulate one per active key-minute, no cleanup job —
// table stays tiny; add a GC pass if usage grows unbounded.
const RATE_WINDOW_MS = 60000;
const RATE_LIMIT_PER_WINDOW = 60;

// Self-serve keys (WS4).
const MAX_KEYS_PER_ACCOUNT = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

    if (path === "/healthz") return json({ ok: true, service: "sceneviz-api", stage: "A" });

    // Open endpoints (no credential): account signup/login mint sessions.
    if (request.method === "POST" && path === "/auth/signup") return handleSignup(request, env);
    if (request.method === "POST" && path === "/auth/login") return handleLogin(request, env);

    // M3 billing, public half: /billing/packs is read-only, and the webhook
    // routes authenticate via signature (not user credentials) — they MUST sit
    // before the authenticate() gate so gateway retries never get 401s.
    if (request.method === "GET" && path === "/billing/packs") return handleBillingPacks(env);
    if (request.method === "POST" && path === "/webhooks/dodo") return handleDodoWebhook(request, env);

    // Media reads are public: <img> tags cannot send API keys.
    if (request.method === "GET" && path.startsWith("/media/")) {
      return await handleMediaRead(request, env, url, path);
    }

    let auth;
    try {
      auth = await authenticate(request, env);
    } catch (e) {
      return json({ detail: { error: String(e?.message || e) } }, 500);
    }
    if (!auth.ok) return auth.response;

    try {
      return await route(request, env, url, path, auth);
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

  // Dashboard sessions: raw 32-byte hex tokens (keys are sk_live_-prefixed), so
  // only 64-hex credentials hit the sessions table — keys skip the extra read.
  if (/^[0-9a-f]{64}$/i.test(provided)) {
    const session = await getSession(env, provided);
    if (session) {
      if (session.status !== "active") return { ok: false, response: err403("Account is disabled") };
      return { ok: true, key: null, session, account: session };
    }
  }

  const key_hash = await sha256Hex(provided);
  const row = await env.DB.prepare(
    "SELECT id, key_hash, label, credits, status, account_id, key_hint, created_at FROM keys WHERE key_hash = ?"
  )
    .bind(key_hash)
    .first();

  if (!row) return { ok: false, response: err401() };
  if (row.status !== "active") return { ok: false, response: err403("Key is disabled") };

  return { ok: true, key: row, session: null, account: null };
}

/* ----------------------------------------------------------------- routes */

async function route(request, env, url, path, auth) {
  const method = request.method;
  const key = auth.key;

  // --- accounts / dashboard (session auth unless noted) --------------------
  if (method === "POST" && path === "/auth/logout") return handleLogout(request, env, auth);
  if (method === "GET" && path === "/me") return handleMe(env, auth);
  if (method === "POST" && path === "/keys") return handleCreateKey(request, env, auth);
  const keyDel = path.match(/^\/keys\/([^/]+)$/);
  if (method === "DELETE" && keyDel) return handleDeleteKey(env, auth, keyDel[1]);
  if (method === "POST" && path === "/billing/checkout") return handleBillingCheckout(request, env, auth);
  // /history and /api/v1/history both served (contract legacy path + dashboard).
  if (method === "GET" && (path === "/history" || path === "/api/v1/history")) {
    return handleHistory(request, env, auth);
  }

  // Everything below requires a raw API key — sessions cannot generate.
  if (!key) return json({ detail: { error: "API key required for this endpoint" } }, 401);

  // --- MCP (JSON-RPC 2.0 over HTTP; key auth) ------------------------------
  if (path === "/mcp") {
    if (method !== "POST") return json({ detail: { error: "MCP endpoint accepts POST only" } }, 405);
    return await handleMcp(request, env, key, generateCore);
  }

  // --- account -----------------------------------------------------------
  if (method === "GET" && path === "/api/v1/account/balance") {
    return json({ balance: key.credits, email: key.label || "sceneviz-key" });
  }

  // --- model catalog -----------------------------------------------------
  if (method === "GET" && (path === "/api/v1/models" || path === "/models")) {
    // Derived from modelMap — the single truth the UI renders (WS3).
    return json(modelCatalog());
  }

  // --- uploads (object storage: R2 when enabled, Workers KV interim) ------
  const media = env.MEDIA || env.MEDIA_KV ? "available" : null;
  if (!media && (path === "/app/get_file_upload_url" || path === "/app/upload" || path === "/api/v1/upload_file")) {
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
    return await handleMediaRead(request, env, url, path);
  }

  // --- generation (Phase B) ---------------------------------------------
  const genMatch = path.match(/^\/api\/v1\/([^/]+)$/);
  if (method === "POST" && genMatch) {
    const model = genMatch[1];
    if (
      model === "predictions" ||
      model === "upload_file" ||
      model === "account" ||
      model === "models" ||
      model === "history"
    ) {
      return err404();
    }
    return await handleGenerate(request, env, key, model);
  }

  const pollMatch = path.match(/^\/api\/v1\/predictions\/([^/]+)\/result$/);
  if (method === "GET" && pollMatch) {
    return await handleResult(request, env, key, pollMatch[1]);
  }

  return err404();
}

/* ------------------------------------------------------- accounts (WS4) */

async function handleSignup(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return err400("Expected a JSON body");
  }
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  if (!EMAIL_RE.test(email)) return err400("A valid email address is required");
  if (password.length < 8) return err400("Password must be at least 8 characters");

  const id = uuid();
  try {
    // shortcut: no email provider yet — accounts are auto-verified (email_verified=1);
    // add verification mail before advertising signup publicly.
    // shortcut: open signup auto-grants DEFAULT_KEY_CREDITS (parity with manual
    // issuance); set the var to 0 or gate signups if abuse becomes a concern.
    await env.DB.prepare("INSERT INTO accounts (id, email, pw_hash, credits) VALUES (?, ?, ?, ?)")
      .bind(id, email, await hashPassword(password), Number(env.DEFAULT_KEY_CREDITS || 0))
      .run();
  } catch (e) {
    if (String(e?.message || e).includes("UNIQUE")) {
      return json({ detail: { error: "Email already registered" } }, 409);
    }
    throw e;
  }
  const { token } = await createSession(env, id);
  return json({ account_id: id, session_token: token });
}

async function handleLogin(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return err400("Expected a JSON body");
  }
  const email = String(body?.email || "").trim().toLowerCase();
  const row = await env.DB.prepare("SELECT id, pw_hash, status FROM accounts WHERE email = ?")
    .bind(email)
    .first();
  const okPassword = row && (await verifyPassword(String(body?.password || ""), row.pw_hash));
  if (!okPassword) return json({ detail: { error: "Invalid email or password" } }, 401);
  if (row.status !== "active") return err403("Account is disabled");
  const { token, expiresAt } = await createSession(env, row.id);
  return json({ account_id: row.id, session_token: token, expires_at: expiresAt });
}

async function handleLogout(request, env, auth) {
  if (!auth.session) return err401();
  await deleteSession(env, auth.session.token_hash);
  return new Response(null, { status: 204, headers: CORS });
}

async function handleMe(env, auth) {
  if (auth.session) {
    const a = auth.account;
    const keys =
      (
        await env.DB.prepare(
          "SELECT id, label, key_hint, created_at FROM keys WHERE account_id = ? ORDER BY created_at DESC"
        )
          .bind(a.id)
          .all()
      ).results || [];
    return json({
      account: { id: a.id, email: a.email, credits: a.credits, created_at: a.created_at },
      keys: keys.map((k) => ({
        id: k.id,
        label: k.label,
        key_hint: k.key_hint || null,
        created_at: k.created_at,
      })),
      created_at: a.created_at,
    });
  }
  // Key-auth /me (legacy manually-issued keys, and account keys used as keys):
  // no account object — sessions are the account view.
  const k = auth.key;
  return json({
    account: null,
    keys: [{ id: k.id, label: k.label, key_hint: k.key_hint || null, created_at: k.created_at }],
    created_at: k.created_at,
  });
}

async function handleCreateKey(request, env, auth) {
  if (!auth.session) return err401();
  let body = {};
  try {
    body = await request.json();
  } catch {}
  const label = String(body?.label || "").slice(0, 100);
  const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM keys WHERE account_id = ?")
    .bind(auth.account.id)
    .first();
  if ((n?.n || 0) >= MAX_KEYS_PER_ACCOUNT) {
    return json({ detail: { error: `Key limit reached (${MAX_KEYS_PER_ACCOUNT} per account)` } }, 409);
  }
  const raw = `sk_live_${randomHex(24)}`;
  const id = uuid();
  // shortcut: the new key's credits mirror the account balance at creation
  // (one active key per account assumed); shared pools land with payments (M3).
  await env.DB.prepare(
    "INSERT INTO keys (id, key_hash, label, credits, status, account_id, key_hint) VALUES (?, ?, ?, ?, 'active', ?, ?)"
  )
    .bind(id, await sha256Hex(raw), label, auth.account.credits || 0, auth.account.id, raw.slice(0, 12))
    .run();
  return json({ id, key: raw, label }, 201);
}

async function handleDeleteKey(env, auth, keyId) {
  if (!auth.session) return err401();
  const row = await env.DB.prepare("SELECT id, account_id FROM keys WHERE id = ?").bind(keyId).first();
  if (!row || row.account_id !== auth.account.id) return err404("Key not found");
  await env.DB.prepare("DELETE FROM keys WHERE id = ?").bind(keyId).run();
  return new Response(null, { status: 204, headers: CORS });
}

/* ---------------------------------------------------------------- billing */

function handleBillingPacks(env) {
  return json({
    packs: Object.entries(PACKS).map(([id, p]) => ({
      id,
      credits: p.credits,
      priceUSD: p.priceUSD,
      gateways: p.gateways,
    })),
  });
}

async function handleBillingCheckout(request, env, auth) {
  if (!auth.session) return err401(); // buying credits is a dashboard action — keys cannot
  let body = {};
  try {
    body = await request.json();
  } catch {}
  const pack = PACKS[String(body?.pack || "")];
  if (!pack) return err400("Unknown credit pack");
  const gateway = String(body?.gateway || "");
  if (!pack.gateways.includes(gateway)) return err400("Unknown gateway");
  try {
    const checkout_url = await createDodoCheckout(env, auth.account, pack, auth.account.email);
    return json({ checkout_url });
  } catch (e) {
    return json({ detail: { error: `Checkout failed: ${String(e?.message || e)}` } }, 502);
  }
}

async function handleDodoWebhook(request, env) {
  // Raw body FIRST — the Svix signature covers the exact bytes on the wire.
  const rawBody = await request.text();
  const v = await verifyDodoWebhook(request, env, rawBody);
  if (!v.ok) return json({ detail: { error: v.error } }, v.status);
  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return err400("Invalid JSON body");
  }
  const type = String(event?.type || "");
  if (type !== "payment.succeeded" && type !== "checkout.completed") {
    return json({ received: true, ignored: true });
  }
  const obj = event?.data?.object || event?.data || {};
  const meta = obj.metadata || {};
  const accountId = String(meta.account_id || "");
  const credits = Number(meta.credits || 0);
  const gatewayPaymentId = String(obj.payment_id || obj.checkout_id || obj.id || "");
  if (!accountId || !credits || !gatewayPaymentId) {
    return err400("Webhook payload missing payment id or account metadata");
  }
  const result = await grantCredits(env, {
    accountId,
    credits,
    gateway: "dodo",
    gatewayPaymentId,
    amountMinor: Number(obj.total_amount) || 0,
    currency: String(obj.currency || "USD"),
  });
  return json({ received: true, ...(result.duplicate ? { duplicate: true } : {}) });
}

async function handleHistory(request, env, auth) {
  const params = new URL(request.url).searchParams;
  const limit = Math.min(100, Math.max(1, Number(params.get("limit")) || 20));
  const cursor = params.get("cursor");
  // Scope: sessions and account keys see account-wide history; legacy keys see their own.
  const [scopeCol, scopeVal] = auth.session
    ? ["account_id", auth.account.id]
    : auth.key.account_id
      ? ["account_id", auth.key.account_id]
      : ["key_id", auth.key.id];
  const rows =
    (
      await env.DB.prepare(
        `SELECT id, model, status, cost_credits, output_urls_json, created_at
         FROM generations WHERE ${scopeCol} = ? ${cursor ? "AND created_at < ?" : ""}
         ORDER BY created_at DESC LIMIT ?`
      )
        .bind(...(cursor ? [scopeVal, cursor, limit + 1] : [scopeVal, limit + 1]))
        .all()
    ).results || [];
  const more = rows.length > limit;
  const items = rows.slice(0, limit).map((r) => ({
    id: r.id,
    model: r.model,
    status: r.status,
    cost_credits: r.cost_credits,
    output_urls: JSON.parse(r.output_urls_json || "[]"),
    created_at: r.created_at,
  }));
  return json({ items, next_cursor: more ? items[items.length - 1].created_at : null });
}

/* ------------------------------------------------------------- generation */

async function handleGenerate(request, env, key, model) {
  let body;
  try {
    body = await request.json();
  } catch {
    return err400("Expected a JSON body");
  }
  return generateCore(env, key, model, body);
}

/** Submit pipeline shared by POST /api/v1/{model} and the MCP generate_image tool. */
async function generateCore(env, key, model, body) {
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
    input = cfg.translate(body);
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
  const stmts = [
    env.DB.prepare("UPDATE keys SET credits = credits - ? WHERE id = ?").bind(cost, key.id),
    env.DB.prepare("INSERT INTO usage (id, key_id, model, credits, job_id) VALUES (?, ?, ?, ?, ?)").bind(
      uuid(),
      key.id,
      model,
      cost,
      job.id
    ),
    // WS5 user-facing history row (usage stays the ledger feed). created_at is
    // an explicit ISO string so history cursors compare correctly.
    env.DB.prepare(
      `INSERT INTO generations (id, key_id, account_id, job_id, model, status, cost_credits, input_json, output_urls_json, created_at)
       VALUES (?, ?, ?, ?, ?, 'submitted', ?, ?, '[]', ?)`
    ).bind(uuid(), key.id, key.account_id || null, job.id, model, cost, JSON.stringify(input), new Date().toISOString()),
  ];
  // Account-linked keys mirror the debit onto accounts.credits (what /me shows).
  if (key.account_id) {
    stmts.push(env.DB.prepare("UPDATE accounts SET credits = credits - ? WHERE id = ?").bind(cost, key.account_id));
  }
  await env.DB.batch(stmts);

  // Contract §3.1: the client reads request_id || id — return both.
  return json({ status: "submitted", request_id: job.id, id: job.id });
}

/**
 * Poll: translate RunPod status into the contract vocabulary (§3.1, exact,
 * case-insensitive). Unknown job → 404. Non-terminal → "IN_PROGRESS"
 * (client keeps polling anything outside the success/failure sets).
 */
async function handleResult(request, env, key, jobId) {
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

  let outputs = extractOutputs(job.output);
  // Record terminal state on the history row (matched by job_id; re-polls are
  // idempotent — same values rewritten).
  if (status !== "IN_PROGRESS") {
    // Persist data-URI outputs to object storage → hosted /media/{key} URLs.
    outputs = await persistOutputs(env, jobId, outputs, new URL(request.url).origin);
    await env.DB.prepare("UPDATE generations SET status = ?, output_urls_json = ? WHERE job_id = ?")
      .bind(status, JSON.stringify(outputs), jobId)
      .run();
  }
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
 * Phase A upload path: multipart POST into object storage (R2 MEDIA binding
 * when enabled, Workers KV MEDIA_KV interim). The Worker is the upload
 * intermediary — public read is via GET /media/{key}.
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

  const contentType = file.type || "application/octet-stream";
  if (env.MEDIA) {
    await env.MEDIA.put(objectKey, file, { httpMetadata: { contentType } });
  } else if (env.MEDIA_KV) {
    await env.MEDIA_KV.put(objectKey, await file.arrayBuffer(), { metadata: { contentType } });
  } else {
    return err501("Object storage is not enabled yet.");
  }
  return new Response(null, { status: 204, headers: { ...CORS, "x-stored-key": objectKey } });
}

/**
 * Persist data-URI outputs (worker-sdxl returns base64 URIs) to object storage
 * and rewrite them as hosted /media/{key} URLs. Idempotent per job: only
 * outputs that still start with data: are converted.
 */
async function persistOutputs(env, jobId, outputs, origin) {
  const store = env.MEDIA || env.MEDIA_KV;
  if (!store) return outputs;
  const out = [];
  let n = 0;
  for (const url of outputs) {
    if (typeof url === "string" && url.startsWith("data:")) {
      const key = `outputs/${jobId}/${n++}.png`;
      const commaIdx = url.indexOf(",");
      const meta = url.slice(5, commaIdx); // e.g. image/png;base64
      const contentType = (meta.split(";")[0] || "image/png").trim();
      const buf = Buffer.from(url.slice(commaIdx + 1), "base64");
      if (env.MEDIA) {
        await store.put(key, buf, { httpMetadata: { contentType } });
      } else {
        await env.MEDIA_KV.put(key, buf, { metadata: { contentType } });
      }
      out.push(`${origin}/media/${key}`);
    } else {
      out.push(url);
    }
  }
  return out;
}
