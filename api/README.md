# Sceneviz API (`api.opraiz.com`)

Stage 2 backend. Plan: [`../docs/stage2-runpod-plan.md`](../docs/stage2-runpod-plan.md) ·
Contract: [`../docs/stage2-api-contract.md`](../docs/stage2-api-contract.md)

## Layout
- `wrangler.jsonc` — Worker config: custom domain `api.opraiz.com`, D1 `sceneviz`, R2 `sceneviz-media`
- `src/index.js` — Worker (auth, accounts, keys, history, catalog, MCP, uploads, media, generation, billing)
- `src/auth.js` — PBKDF2 password hashing + session-token helpers (WebCrypto only)
- `src/mcp.js` — minimal streamable-HTTP MCP server (JSON-RPC 2.0)
- `src/billing.js` — M3 credit packs, Dodo checkout creation, webhook signature verification, idempotent credit grants
- `schema.sql` — D1 tables (`keys`, `usage`, `rate`, `accounts`, `sessions`, `generations`, `payments`, `credit_ledger`)
- `issue-key.mjs` — key issuance CLI (optional account linkage)

## Setup / deploy
```powershell
$env:PATH = "$env:LOCALAPPDATA\Programs\nodejs;$env:PATH"
# one-time provisioning
npx wrangler d1 create sceneviz          # put the id into wrangler.jsonc
npx wrangler r2 bucket create sceneviz-media
npx wrangler d1 execute sceneviz --remote --file schema.sql -y
npx wrangler secret put RUNPOD_API_KEY   # Phase B; set now, unused in Phase A

# EXISTING databases only — schema.sql can't alter the live keys table:
npx wrangler d1 execute sceneviz --remote --command "ALTER TABLE keys ADD COLUMN account_id TEXT" -y
npx wrangler d1 execute sceneviz --remote --command "ALTER TABLE keys ADD COLUMN key_hint TEXT" -y

# deploy + smoke
npx wrangler deploy
curl https://api.opraiz.com/healthz
```

## Keys
```powershell
$env:CLOUDFLARE_API_TOKEN = "..."   # account token with D1 access
node api/issue-key.mjs "narein-dev" 500          # legacy manual key (account_id NULL)
node api/issue-key.mjs "dash-key" 500 <account_id>  # linked to an account
```
Raw key is printed once; only the SHA-256 hash is stored (plus a 12-char display hint).

## Auth
- **API keys** (unchanged): `x-api-key: sk_live_…` or `Authorization: Bearer sk_live_…`.
  Keys with a NULL `account_id` are legacy manually-issued keys and stay fully valid.
- **Dashboard sessions** (WS4): `POST /auth/signup` / `/auth/login` return a 32-byte
  `session_token`; send it as `Authorization: Bearer <session_token>`. 30-day expiry,
  only the SHA-256 is stored in `sessions`. Sessions work on `/me`, `/keys`,
  `DELETE /keys/{id}`, `/history`; generation still requires an API key.
- Passwords: PBKDF2-SHA256, 100k iterations, per-account random 16-byte salt
  (`salt:hash` hex in `accounts.pw_hash`). No plaintext secrets anywhere in D1.

## Endpoints (accounts & dashboard — WS4/WS5)
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/auth/signup` | none | `{email, password≥8}` → 200 `{account_id, session_token}`; 400 invalid, 409 `{detail:{error:'Email already registered'}}`. Accounts auto-verified (no email provider yet). |
| POST | `/auth/login` | none | → 200 `{account_id, session_token, expires_at}`; 401 `{detail:{error:'Invalid email or password'}}` |
| POST | `/auth/logout` | session | → 204, deletes the session |
| GET | `/me` | session or key | `{account:{id,email,credits,created_at}, keys:[{id,label,key_hint,created_at}], created_at}`; key auth → `account: null` + that one key |
| POST | `/keys` | session | `{label}` → 201 `{id, key:'sk_live_…', label}`; raw key shown once; max 10/account → 409 over |
| DELETE | `/keys/{id}` | session | own key only → 204; 404 otherwise |
| GET | `/history?limit=20&cursor=<iso>` | session or key | `{items:[{id, model, status, cost_credits, output_urls:[…], created_at}], next_cursor}` — newest first; sessions + account keys see account-wide, legacy keys key-wide. `/api/v1/history` also served. |
| GET | `/models` (alias `/api/v1/models`) | key | catalog derived from `src/modelMap.js`: `{models:[{id, modality, cost_credits, params:[{name,type,default,…}]}]}` |
| POST | `/mcp` | key (`x-api-key` or Bearer) | JSON-RPC 2.0 (streamable-HTTP style, JSON responses, no SSE): `initialize`, `tools/list`, `tools/call`; notifications → 202 |

## Endpoints (Phase A)
| Method | Path | Notes |
|---|---|---|
| GET | `/healthz` | no auth |
| GET | `/api/v1/account/balance` | `{balance, email}` |
| GET | `/app/get_file_upload_url` | `{url, fields:{key, token}}` |
| POST | `/app/upload` | multipart `file`+`key`, header `x-upload-token` → 204 |
| POST | `/api/v1/upload_file` | same, returns `{url, file_url}` |
| GET | `/media/{key}` | public read |

## Endpoints (Phase B — GPU bridge)
| Method | Path | Notes |
|---|---|---|
| POST | `/api/v1/flux-dev-image` | submit → RunPod; `{status:'submitted', request_id, id}` |
| POST | `/api/v1/flux-schnell-image` | same |
| POST | `/api/v1/sdxl-image` | same |
| GET | `/api/v1/predictions/{request_id}/result` | RunPod status → contract vocabulary; `{status, output, outputs}` |
| POST | `/api/v1/{other model-id}` | 501 until mapped in `src/modelMap.js` |

Phase B details: model map in `src/modelMap.js` (endpoint env `RUNPOD_ENDPOINT_ID_IMAGE`, credit cost, input translation, `/models` catalog); RunPod calls in `src/gpu.js`; per-key rate limit 60 req/60s on submits only (429) — the MCP `generate_image` tool goes through the same path; credits debited on successful submit, **no refund on failed jobs yet**. Every successful submit also inserts a `generations` row (status `submitted`), and the poll endpoint updates it with terminal status + output URLs — that table is what `/history` serves; `usage` remains the ledger feed. Requires `RUNPOD_API_KEY` secret and `RUNPOD_ENDPOINT_ID_IMAGE` var in `wrangler.jsonc`.

## Billing (M3 — prepaid credits)

Credit packs are bought from the dashboard (`/dashboard/billing`). One pack today:
`credits500` = 500 credits for **$2.99** (Dodo Payments — cards, international; merchant-of-record).
Dodo product: `pdt_0Nr933P1czZWydfhLqAZL`.

Flow: dashboard → `POST /billing/checkout` → Dodo hosted `checkout_url` → user pays →
signed webhook → credits granted. Every grant is **idempotent by gateway payment id**
(`payments.gateway_payment_id` UNIQUE): webhook retries hit `ON CONFLICT DO NOTHING` and
return `{received:true, duplicate:true}` without re-crediting. All grants land in
`payments` + `credit_ledger` and increment both `accounts.credits` and every active key of
that account (keys mirror the account balance).

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/billing/packs` | none | `{packs:[{id, credits, priceUSD, gateways}]}` |
| POST | `/billing/checkout` | session | `{pack:'credits500', gateway:'dodo'}` → `{checkout_url}` — redirect the browser there. Keys cannot buy credits (401). |
| POST | `/webhooks/dodo` | signature | Svix scheme: HMAC-SHA256 over `{webhook-id}.{webhook-timestamp}.{raw body}`, base64, compared against each `v1,<sig>` in `webhook-signature`; timestamps older than 5 min → 400. Grants on `payment.succeeded` (also accepts `checkout.completed`) from `metadata.{account_id, credits}`. |

**Fail-closed webhooks:** the webhook route returns
`503 {detail:{error:'Webhook not configured'}}` and never parses the body until the secret
exists. Bad signatures/timestamps → `400`; unknown event types → `200 {received:true, ignored:true}`.

Secret still to set (`npx wrangler secret put DODO_WEBHOOK_SECRET`): the webhook signing
secret from the Dodo dashboard (paste the `whsec_…` value verbatim; the code strips the
prefix and base64-decodes it).

## MCP
```powershell
claude mcp add --transport http sceneviz https://api.opraiz.com/mcp --header "Authorization: Bearer sk_live_..."
```
Tools: `generate_image` (args: `model`, `prompt`, plus the standard params), `get_balance`, `list_models`.
