#!/usr/bin/env node
/**
 * Opraiz API contract tests — plain Node (18+), zero dependencies.
 *
 * Usage:  node api/contract-test.mjs
 * Env:    API_BASE        (default https://api.opraiz.com)
 *         TEST_KEY        sk_live key; without it, auth-required tests SKIP
 *                         and only the 401/auth-gate surface is verified.
 *         TEST_RATE_LIMIT set to 1 to opt in to the 429 burst test
 *                         (requires TEST_KEY; spends real credits — up to 61
 *                         submits on the cheapest model at 2 credits each).
 *
 * Exit code: 0 when no test FAILs (SKIPs are fine), 1 otherwise.
 * Output: one PASS/FAIL/SKIP line per test + a summary.
 *
 * Tests for endpoints still being built (auth/keys/history/mcp) are marked
 * `pending`: a 404 from them counts as SKIP ("not yet live") instead of FAIL,
 * so this suite stays green against today's deployment and tightens
 * automatically as those endpoints ship.
 */

const BASE = (process.env.API_BASE || "https://api.opraiz.com").replace(/\/+$/, "");
const KEY = process.env.TEST_KEY || "";

const tests = [];
const test = (name, fn) => tests.push({ name, fn });

/* ------------------------------------------------------------- helpers */

async function call(method, path, { key = KEY, bearer = false, body, raw, headers = {} } = {}) {
  const h = { ...headers };
  if (key) {
    if (bearer) h.authorization = `Bearer ${key}`;
    else h["x-api-key"] = key;
  }
  if (body !== undefined) h["content-type"] = "application/json";
  return fetch(BASE + path, {
    method,
    headers: h,
    body: raw !== undefined ? raw : body !== undefined ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20000),
  });
}

const json = (r) => r.json().catch(() => null);

async function expectStatusIn(r, codes) {
  if (codes.includes(r.status)) return;
  const text = await r.text().catch(() => "");
  throw new Error(`expected status ${codes.join(" | ")}, got ${r.status} — ${text.slice(0, 140)}`);
}

/* ------------------------------------------------ live: no key required */

test("healthz: 200 {ok:true, service:'sceneviz-api'}", async () => {
  const r = await call("GET", "/healthz", { key: "" });
  await expectStatusIn(r, [200]);
  const b = await json(r);
  if (!b || b.ok !== true || b.service !== "sceneviz-api")
    throw new Error(`unexpected body: ${JSON.stringify(b)}`);
});

test("CORS preflight: OPTIONS → 204 + access-control-allow-origin:*", async () => {
  const r = await call("OPTIONS", "/api/v1/account/balance", { key: "" });
  await expectStatusIn(r, [204]);
  if ((r.headers.get("access-control-allow-origin") || "") !== "*")
    throw new Error(`missing/incorrect access-control-allow-origin: ${r.headers.get("access-control-allow-origin")}`);
});

test("balance without key → 401 {detail:'Not authenticated'}", async () => {
  const r = await call("GET", "/api/v1/account/balance", { key: "" });
  await expectStatusIn(r, [401]);
  const b = await json(r);
  if (typeof b?.detail !== "string") throw new Error(`expected string detail, got ${JSON.stringify(b)}`);
});

test("balance with unknown key → 401 {detail}", async () => {
  const r = await call("GET", "/api/v1/account/balance", { key: "sk_live_contract_test_invalid" });
  await expectStatusIn(r, [401]);
  const b = await json(r);
  if (typeof b?.detail !== "string") throw new Error(`expected string detail, got ${JSON.stringify(b)}`);
});

test("auth gate precedes routing: POST unknown model without key → 401 (not 404/501)", async () => {
  const r = await call("POST", "/api/v1/definitely-not-a-model", { key: "", body: {} });
  await expectStatusIn(r, [401]);
});

test("models without key → 401", async () => {
  const r = await call("GET", "/api/v1/models", { key: "" });
  await expectStatusIn(r, [401]);
});

/* ---------------------------------------------- live: TEST_KEY required */

test("balance with key → 200 {balance:number, email:string}", async () => {
  if (!KEY) return "TEST_KEY not set — authenticated tests skipped";
  const r = await call("GET", "/api/v1/account/balance");
  await expectStatusIn(r, [200]);
  const b = await json(r);
  if (typeof b?.balance !== "number" || typeof b?.email !== "string")
    throw new Error(`unexpected body: ${JSON.stringify(b)}`);
});

test("models with key → 200 {models: array}", async () => {
  if (!KEY) return "TEST_KEY not set";
  const r = await call("GET", "/api/v1/models");
  await expectStatusIn(r, [200]);
  const b = await json(r);
  if (!Array.isArray(b?.models)) throw new Error(`models is not an array: ${JSON.stringify(b)}`);
});

test("reserved model path POST /api/v1/models → 404 (routing guard)", async () => {
  if (!KEY) return "TEST_KEY not set";
  const r = await call("POST", "/api/v1/models", { body: {} });
  await expectStatusIn(r, [404]);
});

test("POST unknown model with key → 501 {detail:{error:'not yet served'}}", async () => {
  if (!KEY) return "TEST_KEY not set";
  const r = await call("POST", "/api/v1/definitely-not-a-model", { body: {} });
  await expectStatusIn(r, [501]);
  const b = await json(r);
  if (typeof b?.detail?.error !== "string" || !b.detail.error.includes("not yet served"))
    throw new Error(`unexpected body: ${JSON.stringify(b)}`);
});

test("poll unknown request id → 404 {detail:'Unknown request id'}", async () => {
  if (!KEY) return "TEST_KEY not set";
  const r = await call("GET", "/api/v1/predictions/contract-test-unknown-id/result");
  await expectStatusIn(r, [404]);
  const b = await json(r);
  if (b?.detail !== "Unknown request id") throw new Error(`unexpected body: ${JSON.stringify(b)}`);
});

test("upload presign with key → 200 {url,fields} or 501 while object storage is off", async () => {
  if (!KEY) return "TEST_KEY not set";
  const r = await call("GET", "/app/get_file_upload_url?filename=contract-test.png");
  await expectStatusIn(r, [200, 501]);
  const b = await json(r);
  if (r.status === 200) {
    if (typeof b?.url !== "string" || typeof b?.fields?.key !== "string")
      throw new Error(`unexpected presign body: ${JSON.stringify(b)}`);
  } else if (typeof b?.detail?.error !== "string")
    throw new Error(`unexpected 501 body: ${JSON.stringify(b)}`);
});

test("POST known model (sdxl-image) with malformed body → 400 or 503 pre-GPU", async () => {
  if (!KEY) return "TEST_KEY not set";
  // No GPU spend possible: 503 (endpoint not provisioned) and 400 (bad JSON)
  // both fire before the submit path.
  const r = await call("POST", "/api/v1/sdxl-image", { raw: "not-json" });
  await expectStatusIn(r, [400, 503]);
  const b = await json(r);
  if (typeof b?.detail?.error !== "string") throw new Error(`unexpected body: ${JSON.stringify(b)}`);
});

test("insufficient credits → 403", async () => {
  // Not forceable from a contract test: it needs a key with credits below the
  // cheapest model cost (2). SKIP unless the API later exposes a way to
  // provision a near-zero-credit test key.
  if (!KEY) return "TEST_KEY not set";
  return "cannot be forced safely — needs a sub-2-credit test key";
});

test("rate limit: burst submits → 429 within 60-request window", async () => {
  if (!KEY) return "TEST_KEY not set";
  if (process.env.TEST_RATE_LIMIT !== "1")
    return "opt-in only (TEST_RATE_LIMIT=1 with TEST_KEY) — would spend real GPU credits";
  const statuses = [];
  for (let i = 0; i < 61; i++) {
    const r = await call("POST", "/api/v1/sdxl-image", {
      body: { prompt: "contract rate-limit probe", num_images: 1 },
    });
    statuses.push(r.status);
    if (r.status === 429) {
      const b = await json(r);
      if (b?.detail?.error !== "Rate limit exceeded")
        throw new Error(`429 body mismatch: ${JSON.stringify(b)}`);
      break;
    }
  }
  if (!statuses.includes(429))
    throw new Error(`no 429 within window (${statuses.length} submits): ${statuses.join(",")}`);
});

/* ------------------------------- pending: auth/keys/history/mcp surface */

// These endpoints are being added by the backend team. 404 on a pending test
// = "not yet live" → SKIP. 401 without a key is also accepted today: the auth
// gate runs before routing, so unauthenticated probes of not-yet-live paths
// answer 401. Assertions tighten once the endpoints ship.

test("POST /auth/signup with empty body → 400 (pending)", async () => {
  const r = await call("POST", "/auth/signup", { key: "", body: {} });
  if (r.status === 404) return "endpoint not yet live (404)";
  // 401 accepted while the auth gate still covers the path; live signup must
  // reject `{}` with a validation error.
  await expectStatusIn(r, [400, 401, 422]);
});

test("POST /auth/login with wrong credentials → 400/401 (pending)", async () => {
  const r = await call("POST", "/auth/login", {
    key: "",
    body: { email: "contract-test@example.com", password: "wrong-password" },
  });
  if (r.status === 404) return "endpoint not yet live (404)";
  await expectStatusIn(r, [400, 401]);
});

test("POST /auth/logout → 200/204/401 (pending)", async () => {
  const r = await call("POST", "/auth/logout", { key: "" });
  if (r.status === 404) return "endpoint not yet live (404)";
  await expectStatusIn(r, [200, 204, 401]);
});

test("GET /me without key → 401 {detail} (pending)", async () => {
  const r = await call("GET", "/me", { key: "" });
  if (r.status === 404) return "endpoint not yet live (404)";
  await expectStatusIn(r, [401]);
  const b = await json(r);
  if (typeof b?.detail !== "string") throw new Error(`expected string detail, got ${JSON.stringify(b)}`);
});

test("POST+DELETE /keys lifecycle via session (signup→login→create→delete)", async () => {
  // Keys are session-scoped: a legacy API key must NOT be able to manage them.
  if (!KEY) return "TEST_KEY not set";
  const email = `contract-test+${Date.now()}@opraiz.com`;
  const su = await call("POST", "/auth/signup", { body: { email, password: "contract-test-1234" } });
  if (su.status === 404) return "endpoint not yet live (404)";
  await expectStatusIn(su, [200]);
  const token = (await json(su))?.session_token;
  if (!token) throw new Error("signup returned no session_token");
  const create = await call("POST", "/keys", {
    key: "",
    headers: { authorization: `Bearer ${token}` },
    body: { label: "contract-test" },
  });
  await expectStatusIn(create, [200, 201]);
  const cb = await json(create);
  const id = cb?.id ?? cb?.key_id ?? cb?.key?.id;
  if (id === undefined) throw new Error(`created but no id field: ${JSON.stringify(cb)}`);
  const del = await call("DELETE", `/keys/${id}`, {
    key: "",
    headers: { authorization: `Bearer ${token}` },
  });
  await expectStatusIn(del, [200, 202, 204]);
  // Legacy key must be rejected for key management.
  const legacy = await call("POST", "/keys", { body: { label: "nope" } });
  if (legacy.status !== 401 && legacy.status !== 403)
    throw new Error(`legacy key should not manage keys, got ${legacy.status}`);
  await call("POST", "/auth/logout", {
    key: "",
    headers: { authorization: `Bearer ${token}` },
  });
});

test("GET /api/v1/history with key → 200 JSON (pending)", async () => {
  if (!KEY) return "TEST_KEY not set";
  const r = await call("GET", "/api/v1/history?limit=10");
  if (r.status === 404) return "endpoint not yet live (404)";
  await expectStatusIn(r, [200]);
  const b = await json(r);
  if (!Array.isArray(b) && typeof b !== "object")
    throw new Error(`unexpected body: ${JSON.stringify(b)}`);
});

test("POST /mcp (Bearer, JSON-RPC initialize) → accepted (pending)", async () => {
  if (!KEY) return "TEST_KEY not set";
  const r = await call("POST", "/mcp", {
    bearer: true,
    body: { jsonrpc: "2.0", id: 1, method: "initialize", params: {} },
    headers: { accept: "application/json, text/event-stream" },
  });
  if (r.status === 404) return "endpoint not yet live (404)";
  await expectStatusIn(r, [200, 202, 400, 401, 405, 406]);
});

/* --------------------------------------------------------------- runner */

console.log(`Opraiz API contract tests — ${BASE}`);
console.log(KEY ? "TEST_KEY set — authenticated tests enabled" : "TEST_KEY not set — authenticated tests SKIP");
console.log("");

let pass = 0;
let skip = 0;
let fail = 0;
const failures = [];

for (const t of tests) {
  try {
    const note = await t.fn();
    if (typeof note === "string") {
      skip++;
      console.log(`SKIP  ${t.name} — ${note}`);
    } else {
      pass++;
      console.log(`PASS  ${t.name}`);
    }
  } catch (e) {
    fail++;
    failures.push(`${t.name}: ${e.message}`);
    console.log(`FAIL  ${t.name} — ${e.message}`);
  }
}

console.log("");
console.log(`${pass} passed, ${skip} skipped, ${fail} failed — ${tests.length} total`);
if (fail > 0) {
  console.log("");
  for (const f of failures) console.log(`  FAIL ${f}`);
}
process.exitCode = fail > 0 ? 1 : 0;
