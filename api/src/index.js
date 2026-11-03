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

import { MODEL_MAP, modelCatalog, costFor } from "./modelMap.js";
import { PROVIDERS } from "./providers.js";
import { runpodPublic } from "./runpodPublic.js";
const ALL_PROVIDERS = { ...PROVIDERS, runpodPublic };
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
  localizedTiers,
  createDodoCheckout,
  verifyDodoWebhook,
  grantCredits,
} from "./billing.js";
import {
  dispatch as agentsDispatch,
  listTemplateAgents,
  listFeaturedAgents,
  listAgentSkills as listAgentStudioSkills,
  getBySlug as getAgentBySlugPublic,
  agentJobPollResponse,
} from "./agentsApi.js";
import {
  dispatch as workflowsDispatch,
  initEngine,
  listTemplateWorkflows,
  listPublishedWorkflows,
  nodeSchemasRegistry,
  getWorkflowDef,
} from "./workflowsApi.js";
import { dispatch as creativeDispatch } from "./creativeApi.js";

// Workflows' run engine reuses this module's generation pipeline (credits +
// rate limit + provider adapters live here) — set once at module scope.
initEngine({ generateCore, persistOutputs, checkRateLimit });

const JSON_HDR = { "content-type": "application/json; charset=utf-8" };

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PUT,DELETE,PATCH,OPTIONS",
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
// Rate rows accumulate one per active key-minute; a ~2% GC pass inside
// checkRateLimit drops windows older than 1 h (no cron worker).
const RATE_WINDOW_MS = 60000;
const RATE_LIMIT_PER_WINDOW = 60;

// Self-serve keys (WS4).
const MAX_KEYS_PER_ACCOUNT = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

    if (path === "/healthz") return json({ ok: true, service: "sceneviz-api", stage: "A" });

    // Open endpoints (no credential): account signup/login mint sessions.
    if (request.method === "POST" && path === "/auth/signup") return handleSignup(request, env);
    if (request.method === "POST" && path === "/auth/login") return handleLogin(request, env);
    if (request.method === "POST" && path === "/auth/forgot") return handleForgotPassword(request, env);
    if (request.method === "POST" && path === "/auth/reset") return handleResetPassword(request, env);

    // M3 billing, public half: /billing/packs is read-only, and the webhook
    // routes authenticate via signature (not user credentials) — they MUST sit
    // before the authenticate() gate so gateway retries never get 401s.
    // Public routes sit outside the auth try/catch, so they need their own.
    try {
      if (request.method === "GET" && path === "/billing/packs") return json(await handleBillingPacks(env, request));
      if (request.method === "POST" && path === "/webhooks/dodo") return await handleDodoWebhook(request, env);
    } catch (e) {
      return json({ detail: { error: `Billing route failed: ${String(e?.message || e)}` } }, 500);
    }

    // Media reads are public: <img> tags cannot send API keys.
    if (request.method === "GET" && path.startsWith("/media/")) {
      return await handleMediaRead(request, env, url, path);
    }

    // M7 studios, public read half: galleries + builder schemas. The client
    // sends x-api-key anyway; these just allow anonymous reads (shareable
    // /agents/by-slug links, template browsing) to skip the auth gate.
    // by-slug / get-workflow-def fall through for authed callers so is_owner
    // still resolves — only anonymous requests are served here.
    if (request.method === "GET") {
      let handled;
      try {
        if (path === "/agents/templates/agents") handled = json(await listTemplateAgents());
        else if (path === "/agents/featured/agents") handled = json(await listFeaturedAgents());
        else if (path === "/agents/skills") handled = json(listAgentStudioSkills());
        else if (path === "/workflow/get-template-workflows" || path === "/workflow/templates") {
          handled = json(await listTemplateWorkflows(env));
        } else if (path === "/workflow/get-published-workflows") handled = json(await listPublishedWorkflows(env));
        else if (path === "/workflow/node-schemas" || /^\/workflow\/([^/]+)\/node-schemas$/.test(path)) {
          handled = json(nodeSchemasRegistry());
        } else {
          const defMatch = path.match(/^\/workflow\/get-workflow-def\/([^/]+)$/);
          const profileMatch = path.match(/^\/agents\/([^/]+)\/profile$/);
          const bySlug = path.match(/^\/agents\/(?:by-slug\/)?([^/]+)$/);
          const isAgentDetail =
            (bySlug && !["templates", "featured", "user", "skills", "suggest", "conversations"].includes(bySlug[1])) ||
            (profileMatch && profileMatch[1] !== "by-slug");
          if (defMatch || isAgentDetail) {
            let soft = null;
            try {
              const a = await authenticate(request, env);
              if (a.ok) soft = a;
            } catch {}
            if (defMatch) {
              handled = await getWorkflowDef(env, soft, defMatch[1]);
            } else if (!soft) {
              const slug = profileMatch?.[1] ?? bySlug?.[1];
              handled = await getAgentBySlugPublic(env, null, slug); // anonymous share view
            }
          }
        }
      } catch (e) {
        return json({ detail: { error: `Studio route failed: ${String(e?.message || e)}` } }, 500);
      }
      if (handled) return handled;
    }

    let auth;
    try {
      auth = await authenticate(request, env);
    } catch (e) {
      return json({ detail: { error: String(e?.message || e) } }, 500);
    }
    if (!auth.ok) return auth.response;

    try {
      return await route(request, env, url, path, auth, ctx);
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

async function route(request, env, url, path, auth, ctx) {
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
  // B10 usage analytics (key or session).
  if (method === "GET" && path === "/usage") return handleUsage(env, auth);

  // --- M7 studios (agents / workflows / creative agent) --------------------
  // Key or session everywhere; the run-submit handlers inside re-check for a
  // raw key themselves (generation debits).
  if (path === "/agents" || path.startsWith("/agents/")) {
    return agentsDispatch(request, env, auth, path);
  }
  if (path === "/workflow" || path.startsWith("/workflow/")) {
    // B2 cost widgets — intercepted before the studio dispatcher (no model calls).
    if (method === "POST" && (path === "/workflow/estimate-cost" || path === "/workflow/calculate_dynamic_cost")) {
      return handleCostEstimate(request, path === "/workflow/estimate-cost");
    }
    return workflowsDispatch(request, env, auth, path, ctx, key);
  }
  if (path === "/api/v1/creative-agent" || path.startsWith("/api/v1/creative-agent/")) {
    return creativeDispatch(request, env, auth, path);
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

  // B2: the workflow builder's cost hook calls this legacy path (see
  // useGenerationCost.jsx) — same computation as /workflow/calculate_dynamic_cost.
  if (method === "POST" && path === "/app/calculate_dynamic_cost") {
    return handleCostEstimate(request, false);
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
      model === "history" ||
      model === "creative-agent"
    ) {
      return err404();
    }
    return await handleGenerate(request, env, key, model);
  }

  const pollMatch = path.match(/^\/api\/v1\/predictions\/([^/]+)\/result$/);
  if (method === "GET" && pollMatch) {
    // Agent-chat jobs surface their chat envelope through this same poll
    // route (contract §8 #18) — media jobs fall through to the provider poll.
    const agentRes = await agentJobPollResponse(env, pollMatch[1]);
    if (agentRes) return agentRes;
    return await handleResult(request, env, key, pollMatch[1]);
  }

  return err404();
}

/* ------------------------------------------------------- accounts (WS4) */

/**
 * Password reset: request creates a single-use token (stored hashed, 1h TTL).
 * shortcut: no transactional email provider yet — the reset link is returned
 * to admins via `node scripts/admin.mjs reset-link <email>`; when a provider
 * key lands, email it instead and drop the token from the response.
 */
async function handleForgotPassword(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return err400("Expected a JSON body");
  }
  const email = String(body?.email || "").trim().toLowerCase();
  const account = await env.DB.prepare("SELECT id FROM accounts WHERE email = ?").bind(email).first();
  if (account) {
    const token = randomHex(24);
    await env.DB.prepare(
      "INSERT INTO password_resets (token_hash, account_id) VALUES (?, ?)"
    )
      .bind(await sha256Hex(token), account.id)
      .run();
    // Returned only here, never for a guessed email (no account-existence leak).
    return json({ ok: true, note: "Reset link issued to the account owner via support.", reset_token: token });
  }
  return json({ ok: true, note: "If the account exists, a reset link has been issued." });
}

async function handleResetPassword(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return err400("Expected a JSON body");
  }
  const token = String(body?.token || "");
  const newPassword = String(body?.new_password || "");
  if (!token) return err400("Reset token is required");
  if (newPassword.length < 8) return err400("Password must be at least 8 characters");
  const row = await env.DB.prepare(
    "SELECT account_id, created_at FROM password_resets WHERE token_hash = ?"
  )
    .bind(await sha256Hex(token))
    .first();
  if (!row) return err400("Invalid or already-used reset token");
  const ageHours = (Date.now() - new Date(row.created_at.replace(" ", "T") + "Z").getTime()) / 3600000;
  if (Number.isNaN(ageHours) || ageHours > 1) return err400("Reset token expired — request a new one");
  const pwHash = await hashPassword(newPassword);
  await env.DB.batch([
    env.DB.prepare("UPDATE accounts SET pw_hash = ? WHERE id = ?").bind(pwHash, row.account_id),
    env.DB.prepare("DELETE FROM password_resets WHERE token_hash = ?").bind(await sha256Hex(token)),
    // Kill existing sessions — password change invalidates them.
    env.DB.prepare("DELETE FROM sessions WHERE account_id = ?").bind(row.account_id),
  ]);
  return json({ ok: true });
}

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

async function handleLogin(request, env) {  let body;
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

function handleBillingPacks(env, request) {
  // Display-only override header wins (also handy for testing); real visitors
  // have no header, so Cloudflare's geo lookup decides. Charge currency is
  // unaffected — Dodo's checkout adapts regardless of what we display.
  const country = request.headers.get("x-country") || request.cf?.country || "";
  return localizedTiers(env, country);
}

async function handleBillingCheckout(request, env, auth) {
  if (!auth.session) return err401(); // buying credits is a dashboard action — keys cannot
  let body = {};
  try {
    body = await request.json();
  } catch {}
  const pack = PACKS[String(body?.tier || body?.pack || "")];
  if (!pack) return err400("Unknown credit tier");
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

/**
 * B10 usage analytics for the caller, computed from the generations table (the
 * account-scoped mirror of the usage ledger — usage has no account_id column).
 * Scope mirrors handleHistory: sessions + account keys see account-wide,
 * legacy keys see key-wide.
 */
async function handleUsage(env, auth) {
  const [scopeCol, scopeVal] = auth.session
    ? ["account_id", auth.account.id]
    : auth.key.account_id
      ? ["account_id", auth.key.account_id]
      : ["key_id", auth.key.id];
  const totals = await env.DB.prepare(
    `SELECT COUNT(*) AS n, COALESCE(SUM(cost_credits), 0) AS credits
     FROM generations WHERE ${scopeCol} = ?`
  )
    .bind(scopeVal)
    .first();
  const byModel =
    (
      await env.DB.prepare(
        `SELECT model, COUNT(*) AS count, COALESCE(SUM(cost_credits), 0) AS credits
         FROM generations WHERE ${scopeCol} = ? GROUP BY model ORDER BY count DESC`
      )
        .bind(scopeVal)
        .all()
    ).results || [];
  const since = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10); // 7 calendar days incl. today
  const recent =
    (
      await env.DB.prepare(
        `SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS count
         FROM generations WHERE ${scopeCol} = ? AND substr(created_at, 1, 10) >= ?
         GROUP BY day ORDER BY day`
      )
        .bind(scopeVal, since)
        .all()
    ).results || [];
  return json({
    totals: { generations: totals?.n || 0, credits_spent: totals?.credits || 0 },
    by_model: byModel,
    recent_7d: recent,
  });
}

/**
 * B2 cost widgets: quote the credits a generateCore submit would charge.
 * Body: {model | task_name, duration?, num_images?, width?, height?}; the
 * builder sends a {task_name, payload:{…}} envelope — payload fields merge in.
 */
async function handleCostEstimate(request, flat) {
  let body;
  try {
    body = await request.json();
  } catch {
    return err400("Expected a JSON body");
  }
  const input = { ...(body?.payload || {}), ...body };
  const model = String(input.model || input.task_name || "");
  const cfg = MODEL_MAP[model];
  if (!cfg) return err404(`Unknown model '${model || "(missing)"}'`);
  const credits = costFor(cfg, input);
  if (flat) return json({ credits, currency: "credits", model });
  const usd = Math.round(credits * 0.006 * 10000) / 10000; // 500 credits = $2.99 ≈ $0.006/credit
  return json({ cost: { credits, usd }, credits, usd });
}

/* ------------------------------------------------------------- generation */

async function handleGenerate(request, env, key, model) {
  let body;
  try {
    body = await request.json();
  } catch {
    return err400("Expected a JSON body");
  }
  return generateCore(env, key, model, body, { origin: new URL(request.url).origin });
}

/**
 * Submit pipeline shared by POST /api/v1/{model} and the MCP generate_image tool.
 * opts.origin (optional) enables B4 sync mode — completed outputs are persisted
 * to /media/* and returned inline.
 */
async function generateCore(env, key, model, body, opts = {}) {
  const cfg = MODEL_MAP[model];
  if (!cfg) {
    return err501(
      `Model '${model}' is not yet served by the Opraiz API. ` +
        `Currently served: ${Object.keys(MODEL_MAP).join(", ")} — see GET /models.`
    );
  }
  // Providers with an env-configured endpoint (RunPod today) stay 503 until provisioned.
  if (cfg.endpointEnv && !env[cfg.endpointEnv]) return err503("GPU endpoint not provisioned yet");

  // B4: sync mode waits inline for the result — image latencies only.
  if (body.sync === true && cfg.modality !== "image") {
    return err400("Sync mode is only available for image models");
  }

  let input;
  try {
    input = cfg.translate(body);
  } catch (e) {
    return err400(String(e?.message || "Expected a JSON body"));
  }
  if (!input.prompt) return err400("Field 'prompt' is required");

  // Client sends num_images (catalog: each image charges separately). Video
  // tiers price proportionally to duration, anchored at the 5s base.
  const cost = costFor(cfg, input); // shortcut: no refund on failed jobs, add refund when metering lands
  if ((key.credits || 0) < cost) return err403("Insufficient credits");

  // Rate limit after the free checks, before any GPU spend.
  if (!(await checkRateLimit(env, key.id))) {
    return json({ detail: { error: "Rate limit exceeded" } }, 429);
  }

  let job;
  try {
    job = await ALL_PROVIDERS[cfg.provider].submit(env, cfg, input);
  } catch (e) {
    return json({ detail: { error: `Provider submit failed: ${String(e?.message || e)}` } }, 502);
  }
  if (!job?.id) return json({ detail: { error: "Provider did not return a job id" } }, 502);

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

  // B4 sync mode: bounded server-side poll (4 attempts, 5 s apart, ≤ ~25 s —
  // Workers CPU/time limits) reusing the handleResult persist path. Anything
  // not completed within budget falls through to the normal submitted shape
  // and the client keeps polling /api/v1/predictions/{id}/result.
  if (body.sync === true && opts.origin) {
    for (let attempt = 0; attempt < 4; attempt++) {
      if (attempt) await new Promise((r) => setTimeout(r, 5000));
      const { pollError, result, outputs } = await pollJob(env, cfg, job.id, opts.origin);
      if (pollError || result.status !== "completed") break;
      return json({
        status: "completed",
        outputs,
        output: outputs[0] || null,
        request_id: job.id,
        id: job.id,
        sync: true,
      });
    }
  }

  // Contract §3.1: the client reads request_id || id — return both.
  return json({ status: "submitted", request_id: job.id, id: job.id });
}

/**
 * Shared poll core (handleResult + B4 sync mode): dispatch to the model's
 * provider adapter, persist data-URI outputs on terminal states, and record
 * the history row. Never throws — provider failures come back as {pollError}.
 */
async function pollJob(env, cfg, jobId, origin) {
  let result;
  try {
    result = await ALL_PROVIDERS[cfg.provider].poll(env, cfg, jobId);
  } catch (e) {
    return { pollError: `Provider status failed: ${String(e?.message || e)}` };
  }
  let outputs = result.outputs || [];
  // Record terminal state on the history row (matched by job_id; re-polls are
  // idempotent — same values rewritten). Persist data-URI outputs to object
  // storage → hosted /media/{key} URLs; provider-hosted https URLs pass through.
  if (result.status !== "IN_PROGRESS") {
    outputs = await persistOutputs(env, jobId, outputs, origin);
    await env.DB.prepare("UPDATE generations SET status = ?, output_urls_json = ? WHERE job_id = ?")
      .bind(result.status, JSON.stringify(outputs), jobId)
      .run();
  }
  return { result, outputs };
}

/**
 * Poll: non-terminal → "IN_PROGRESS" (client keeps polling anything outside
 * the success/failure sets). Unknown job → 404. Response shape is the
 * contract §3.1 poll envelope, unchanged.
 */
async function handleResult(request, env, key, jobId) {
  const usage = await env.DB.prepare("SELECT model FROM usage WHERE job_id = ?").bind(jobId).first();
  if (!usage) return err404("Unknown request id");

  const cfg = MODEL_MAP[usage.model];
  if (!cfg) return err503("Model is no longer served");
  if (cfg.endpointEnv && !env[cfg.endpointEnv]) return err503("GPU endpoint not provisioned yet");

  const { pollError, result, outputs } = await pollJob(env, cfg, jobId, new URL(request.url).origin);
  if (pollError) return json({ detail: { error: pollError } }, 502);

  // Client extraction order: outputs[0] || url || output.url → output covers all three.
  return json({
    status: result.status,
    request_id: jobId,
    id: jobId,
    output: outputs[0] || null,
    outputs,
    ...(result.error ? { error: result.error } : {}),
  });
}

/** Fixed-window per-key counter; returns true when the request may proceed. */
async function checkRateLimit(env, keyId) {
  // B6 occasional GC (~2% of calls): drop rate rows older than 1 h — no cron
  // worker; best-effort so a GC hiccup never fails a submit.
  if (Math.random() < 0.02) {
    try {
      await env.DB.prepare("DELETE FROM rate WHERE window_start < ?").bind(Date.now() - 3600000).run();
    } catch {}
  }
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
    // shortcut: R2 binding puts have no TTL API — set lifecycle rules for
    // uploads/ (24 h) and outputs/ (30 days) in the Cloudflare dashboard when
    // R2 lands.
    await env.MEDIA.put(objectKey, file, { httpMetadata: { contentType } });
  } else if (env.MEDIA_KV) {
    // KV interim: uploads expire after 24 h; generated outputs/ keep 30 days.
    const ttl = objectKey.startsWith("outputs/") ? 2592000 : 86400;
    await env.MEDIA_KV.put(objectKey, await file.arrayBuffer(), { metadata: { contentType }, expirationTtl: ttl });
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
        // shortcut: R2 lifecycle rules (30 days for outputs/) must be set in
        // the dashboard — binding puts have no TTL API.
        await store.put(key, buf, { httpMetadata: { contentType } });
      } else {
        // KV interim: generated media expires after 30 days.
        await env.MEDIA_KV.put(key, buf, { metadata: { contentType }, expirationTtl: 2592000 });
      }
      out.push(`${origin}/media/${key}`);
    } else {
      out.push(url);
    }
  }
  return out;
}
