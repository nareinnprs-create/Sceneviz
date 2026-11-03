# Opraiz API Reference

The Opraiz API powers generation on **Sceneviz** (https://sceneviz.opraiz.com). Submit a
generation job, poll for the result, and manage your account — all with a single API key.

**Base URL:** `https://api.opraiz.com`
**Audience:** Sceneviz customers and integrators building against the API directly.

---

## Authentication

Every request (except `GET /healthz`) requires your API key. Send it with the **`x-api-key`
header** (recommended — this is what the Sceneviz apps send):

```bash
curl https://api.opraiz.com/api/v1/account/balance -H "x-api-key: sk_live_YOUR_KEY"
```

Two aliases are accepted for convenience: `Authorization: Bearer sk_live_YOUR_KEY`, or an
`?api_key=` query parameter.

| Status | Body | Meaning |
|---|---|---|
| 401 | `{ "detail": "Not authenticated" }` | Key missing or unknown |
| 403 | `{ "detail": { "error": "Key is disabled" } }` | Key revoked/disabled |

Keys are issued from your Sceneviz account. Treat them like passwords — only the hash is
stored server-side, so a lost key cannot be recovered and must be reissued.

## Conventions

- All requests and responses are JSON (`content-type: application/json`), except multipart uploads.
- Errors follow FastAPI-style `detail` shapes:
  - string form for auth/not-found: `{ "detail": "Not found" }`
  - object form for validation/limits: `{ "detail": { "error": "…message…" } }`
- CORS is permissive (`Access-Control-Allow-Origin: *`, headers `x-api-key, authorization,
  content-type`), so browser and desktop apps may call the API directly.
- Unknown paths return `404 { "detail": "Not found" }`. Authentication is checked first —
  an invalid key always answers `401` regardless of path.

## Rate limits

**60 generation submits per key per 60-second window** (fixed window, applies only to
`POST /api/v1/{model}`). Exceeding it returns:

```json
429 { "detail": { "error": "Rate limit exceeded" } }
```

Result polling is not rate-limited. Poll every ~2 s.

## Credits

Each generation debits credits from your key's balance at submit time. Cost per output image:

| Model | Cost per image |
|---|---|
| `flux-dev-image` | 4 credits |
| `flux-schnell-image` | 2 credits |
| `sdxl-image` | 2 credits |

`num_images` may be 1–2; each image charges separately (`cost = model cost × num_images`).
Check your balance any time via `GET /api/v1/account/balance`. Note: credits are debited on
successful submit; automatic refunds for failed jobs are not yet available.

---

## Endpoints

### GET /healthz

Liveness probe. No auth.

```json
{ "ok": true, "service": "sceneviz-api", "stage": "A" }
```

### GET /api/v1/account/balance

Current credit balance for the key.

```json
{ "balance": 500, "email": "you@example.com" }
```

### GET /api/v1/models

Model catalog. `models` is an array of live model ids — it grows as GPU models come online.

```json
{ "models": [], "note": "Opraiz API Phase A — catalog populated as GPU models come online (Phase B+)." }
```

### POST /api/v1/{model} — submit a generation

Replace `{model}` with one of the live model ids: `flux-dev-image`, `flux-schnell-image`,
`sdxl-image`. Unknown ids return `501` with the list of currently served models.

**Request** (all fields except `prompt` optional):

```json
{
  "prompt": "a cinematic shot of fog over pine ridges at dawn",
  "negative_prompt": "blurry, watermark",
  "width": 1024,
  "height": 1024,
  "num_images": 1,
  "seed": -1
}
```

| Field | Type | Default | Notes |
|---|---|---|---|
| `prompt` | string | — | required |
| `negative_prompt` | string | `""` | |
| `width` | int | 1024 | |
| `height` | int | 1024 | |
| `num_images` | int | 1 | clamped to 1–2; each image charges separately |
| `seed` | int | -1 | random when -1 |

**Response** — the job is asynchronous; use `request_id` (or `id`) to poll:

```json
{ "status": "submitted", "request_id": "c0a80101-7ab2-4c1e-9f3a-1b2c3d4e5f60", "id": "c0a80101-7ab2-4c1e-9f3a-1b2c3d4e5f60" }
```

**Error responses:**

| Status | Body | When |
|---|---|---|
| 400 | `{ "detail": { "error": "Expected a JSON body" } }` / `"Field 'prompt' is required"` | malformed request |
| 403 | `{ "detail": { "error": "Insufficient credits" } }` | balance below cost |
| 429 | `{ "detail": { "error": "Rate limit exceeded" } }` | >60 submits / 60 s |
| 501 | `{ "detail": { "error": "Model '…' is not yet served by the Opraiz API. Currently served: …" } }` | unknown model id |
| 502 | `{ "detail": { "error": "GPU submit failed: …" } }` | upstream GPU error |
| 503 | `{ "detail": { "error": "GPU endpoint not provisioned yet" } }` | model temporarily unavailable |

Example:

```bash
curl -X POST https://api.opraiz.com/api/v1/sdxl-image \
  -H "x-api-key: sk_live_YOUR_KEY" -H "content-type: application/json" \
  -d '{"prompt":"neon koi swimming through fog","num_images":1}'
```

### GET /api/v1/predictions/{request_id}/result

Poll a submitted job every ~2 s until a terminal status arrives.

```json
{
  "status": "completed",
  "request_id": "c0a80101-…",
  "id": "c0a80101-…",
  "output": "https://…/image.png",
  "outputs": ["https://…/image.png"]
}
```

| Field | Meaning |
|---|---|
| `status` | `completed`, `succeeded`, `success` → done; `failed`, `error`, `cancelled`, `canceled` → failed; anything else (e.g. `IN_PROGRESS`) → keep polling |
| `output` | first output URL, or `null` while running |
| `outputs` | all output URLs |
| `error` | present on failure, human-readable message |

Unknown request ids return `404 { "detail": "Unknown request id" }`. HTTP ≥500 is transient —
retry; 4xx should abort the poll loop.

### Uploads & media

Uploads let you pass reference images into generation payloads. They require object storage
to be enabled and currently answer:

```json
501 { "detail": { "error": "Object storage is not enabled yet — enable R2 in the Cloudflare dashboard." } }
```

Once live, the flow is:

1. `GET /app/get_file_upload_url?filename=photo.png` → `{ "url": "…", "fields": { "key": "uploads/<uuid>.png", "token": "…" } }`
2. `POST /app/upload` — `multipart/form-data` with all `fields` entries plus the `file` field last, header `x-upload-token: <fields.token>` → `204`
3. Or in one step: `POST /api/v1/upload_file` — multipart `file` field with your `x-api-key` → `{ "url": "https://api.opraiz.com/media/uploads/<uuid>.png", "file_url": "…" }`
4. `GET /media/{key}` — public read of any stored object (immutable, cache-friendly).

### MCP endpoint

An MCP (Model Context Protocol) server is exposed at `https://api.opraiz.com/mcp` for CLI and
agent integrations, authenticated with `Authorization: Bearer sk_live_YOUR_KEY` (streamable
HTTP transport). It is rolling out alongside the Phase B launch — clients can register it with
any MCP-compatible tool once available.

---

## Billing (buy credits)

Credits are bought from the dashboard. The API surface:

### GET /billing/packs

No auth. Returns the purchasable packs and whether Cashfree (India/UPI) is enabled.

```json
{
  "packs": [
    { "id": "credits500", "credits": 500, "priceUSD": "$2.99", "priceINR": "₹249", "gateways": ["dodo", "cashfree"] }
  ],
  "cashfreeAvailable": false
}
```

### POST /billing/checkout

Dashboard session auth (`Authorization: Bearer <session_token>`; API keys get `401` — buying
is a dashboard action). Body `{ "pack": "credits500", "gateway": "dodo" }` → Dodo checkout
session → `{ "checkout_url": "https://checkout.dodopayments.com/…" }`. Redirect the browser
to `checkout_url`; after payment Dodo returns the user to
`https://sceneviz.opraiz.com/dashboard/billing?paid=1`. Unknown pack/gateway → `400`;
`gateway: "cashfree"` → `503 {"detail":{"error":"Cashfree not configured yet"}}` until the
Cashfree order flow is enabled.

### Webhooks (public, signature-verified)

- `POST /webhooks/dodo` — Svix signature scheme: HMAC-SHA256 (base64) over
  `{webhook-id}.{webhook-timestamp}.{raw body}` with the webhook signing secret, checked
  against every `v1,<signature>` entry in the `webhook-signature` header. Timestamps older
  than 5 minutes are rejected (`400`). Grants credits on `payment.succeeded` (and
  `checkout.completed`) using `metadata.account_id` / `metadata.credits` set at checkout
  creation; unknown event types → `200 {received:true, ignored:true}`; a payment id already
  processed → `200 {received:true, duplicate:true}` (no double credit).
- `POST /webhooks/cashfree` — base64 HMAC-SHA256 of the raw body verified against the
  `x-webhook-signature` header. Grants credits on `payment.captured` / order status `PAID`
  from the order metadata (`account_id`, `credits`).

Both endpoints **fail closed**: while `DODO_WEBHOOK_SECRET` / `CASHFREE_WEBHOOK_SECRET` are
unset they answer `503 {"detail":{"error":"Webhook not configured"}}` before reading or
parsing anything. Every processed payment is stored in `payments` (unique per gateway
payment id) with an audit row in `credit_ledger`; grants increment the account balance and
all of that account's active API keys.

## Roadmap (rolling out with the Phase B auth surface)

These endpoints are being added and are not yet live as of November 2026:
`POST /auth/signup`, `POST /auth/login`, `POST /auth/logout`, `GET /me`,
`POST /keys` + `DELETE /keys/{id}` (self-serve API key management), and
`GET /api/v1/history` (paginated past generations). This document is updated as each ships.

## Changelog

### November 2026 — Phase A/B launch

- Launched `https://api.opraiz.com`: health, account balance, model catalog, and asynchronous
  image generation (submit + poll) for `flux-dev-image`, `flux-schnell-image`, `sdxl-image`.
- Per-key rate limit of 60 submits / 60 s with `429` responses.
- Credit metering on submit; per-model credit costs published above.
- Upload/media endpoints staged behind object storage enablement (`501` until switched on).
- MCP endpoint and account auth/keys/history surface rolling out.
