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

Each generation debits credits from your key's balance at submit time.
Images charge per output (`num_images` 1–2, cost × num_images); videos are one
output per job (cost × 1):

| Model | Cost | Modality |
|---|---|---|
| `flux-schnell-image` | 2 | image (BFL FLUX.2 klein 4b) |
| `sdxl-image` | 2 | image (RunPod) |
| `flux-kontext-pro-t2i` | 4 | image (+ optional input image edit) |
| `flux-dev-image` | 5 | image |
| `flux-kontext-max-t2i` | 8 | image |
| `seedance-pro-t2v` / `seedance-lite-t2v` / `seedance-pro-i2v` | 60 | video |
| `kling-v2.1-master-t2v` / `kling-v2.1-master-i2v` | 80 | video |
| `kling-v2.5-turbo-pro-t2v` | 100 | video |
| `runway-text-to-video` / `runway-image-to-video` | 90 | video |

`GET /api/v1/models` always returns the live list with per-model `cost_credits`
and accepted parameters. Check your balance any time via
`GET /api/v1/account/balance`. Note: credits are debited on successful submit;
automatic refunds for failed jobs are not yet available.

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

Model catalog — the live list of served models, with provider, credit cost and
accepted parameters per model:

```json
{
  "models": [
    { "id": "sdxl-image", "modality": "image", "provider": "runpod", "cost_credits": 2, "params": [ { "name": "prompt", "type": "string", "required": true }, … ] }
  ]
}
```

### POST /api/v1/{model} — submit a generation

Replace `{model}` with one of the live model ids from `GET /api/v1/models`
(images: `flux-dev-image`, `flux-schnell-image`, `flux-kontext-pro-t2i`,
`flux-kontext-max-t2i`, `sdxl-image`; videos: `kling-v2.1-master-t2v`,
`kling-v2.1-master-i2v`, `kling-v2.5-turbo-pro-t2v`, `seedance-pro-t2v`,
`seedance-lite-t2v`, `seedance-pro-i2v`, `runway-text-to-video`,
`runway-image-to-video`). Unknown ids return `501` with the list of currently
served models.

**Request — image models** (all fields except `prompt` optional):

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
| `negative_prompt` | string | `""` | sdxl only |
| `width` / `height` | int | 1024 | BFL clamps to 256–1440, multiples of 32 |
| `aspect_ratio` | string | `1:1` | kontext / video models (e.g. `16:9`, `9:16`, `1:1`) |
| `image_url` | string | — | start frame — **required** for i2v models, optional i2i edit for kontext |
| `resolution` | string | `480p` | Seedance only: `480p`/`720p`/`1080p` |
| `duration` | int | 5 | seconds; Kling 5/10, Seedance 2–12, Runway 2–10 |
| `num_images` | int | 1 | clamped to 1–2, images only (each charges separately) |
| `seed` | int | random | reproducibility |
| `sync` | bool | false | image models only — wait inline for the result (see below) |

**Request — video model example** (`runway-image-to-video`):

```json
{ "prompt": "slow dolly-in, golden hour", "image_url": "https://api.opraiz.com/media/uploads/frame.png", "aspect_ratio": "16:9", "duration": 5 }
```

**Response** — the job is asynchronous; use `request_id` (or `id`) to poll:

```json
{ "status": "submitted", "request_id": "c0a80101-7ab2-4c1e-9f3a-1b2c3d4e5f60", "id": "c0a80101-7ab2-4c1e-9f3a-1b2c3d4e5f60" }
```

**Sync mode (image models):** add `"sync": true` and the API polls the provider
inline for up to ~25 s. If the job completes within that budget you get the
finished result in one round trip:

```json
{ "status": "completed", "outputs": ["https://api.opraiz.com/media/outputs/…/0.png"], "output": "https://api.opraiz.com/media/outputs/…/0.png", "request_id": "c0a80101-…", "id": "c0a80101-…", "sync": true }
```

If it is still running when the budget expires, the normal `{"status": "submitted", …}`
shape is returned and you poll as usual. `sync: true` on a video model returns
`400 { "detail": { "error": "Sync mode is only available for image models" } }`.

**Error responses:**

| Status | Body | When |
|---|---|---|
| 400 | `{ "detail": { "error": "Expected a JSON body" } }` / `"Field 'prompt' is required"` | malformed request |
| 403 | `{ "detail": { "error": "Insufficient credits" } }` | balance below cost |
| 429 | `{ "detail": { "error": "Rate limit exceeded" } }` | >60 submits / 60 s |
| 501 | `{ "detail": { "error": "Model '…' is not yet served by the Opraiz API. Currently served: …" } }` | unknown model id |
| 502 | `{ "detail": { "error": "Provider submit failed: …" } }` | upstream provider error |
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

### POST /workflow/estimate-cost

Quote the credits a generation would charge before submitting — the exact formula
the submit endpoint bills (`cost_credits × num_images × duration factor`):

```bash
curl -X POST https://api.opraiz.com/workflow/estimate-cost \
  -H "x-api-key: sk_live_YOUR_KEY" -H "content-type: application/json" \
  -d '{"model":"flux-dev-image","num_images":2}'
```

```json
{ "credits": 10, "currency": "credits", "model": "flux-dev-image" }
```

`duration` scales video quotes (each 5 s block multiplies the base cost, max ×4);
`width`/`height` are accepted for validation parity but do not change the price.
Unknown model ids return `404`.

### POST /workflow/calculate_dynamic_cost

Same computation, wrapper shape used by the workflow builder's cost widgets:

```json
{ "cost": { "credits": 10, "usd": 0.06 }, "credits": 10, "usd": 0.06 }
```

`usd` converts at $0.006 per credit (500 credits = $2.99). Also accepts the
builder's `{ "task_name": "<model>", "payload": { … } }` envelope; the legacy
path `POST /app/calculate_dynamic_cost` behaves identically.

### GET /usage

Usage analytics for the authenticated caller (API key or dashboard session).
Sessions and account keys see account-wide numbers; legacy keys see their own:

```json
{
  "totals": { "generations": 42, "credits_spent": 310 },
  "by_model": [ { "model": "sdxl-image", "count": 30, "credits": 60 } ],
  "recent_7d": [ { "day": "2026-11-01", "count": 5 } ]
}
```

`recent_7d` covers the last 7 calendar days including today; days with no
generations are absent.

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

No auth. Returns the purchasable packs.

```json
{
  "packs": [
    { "id": "credits500", "credits": 500, "priceUSD": "$2.99", "gateways": ["dodo"] }
  ]
}
```

### POST /billing/checkout

Dashboard session auth (`Authorization: Bearer <session_token>`; API keys get `401` — buying
is a dashboard action). Body `{ "pack": "credits500", "gateway": "dodo" }` → Dodo checkout
session → `{ "checkout_url": "https://checkout.dodopayments.com/…" }`. Redirect the browser
to `checkout_url`; after payment Dodo returns the user to
`https://sceneviz.opraiz.com/dashboard/billing?paid=1`. Unknown pack/gateway → `400`.

### Webhooks (public, signature-verified)

- `POST /webhooks/dodo` — Svix signature scheme: HMAC-SHA256 (base64) over
  `{webhook-id}.{webhook-timestamp}.{raw body}` with the webhook signing secret, checked
  against every `v1,<signature>` entry in the `webhook-signature` header. Timestamps older
  than 5 minutes are rejected (`400`). Grants credits on `payment.succeeded` (and
  `checkout.completed`) using `metadata.account_id` / `metadata.credits` set at checkout
  creation; unknown event types → `200 {received:true, ignored:true}`; a payment id already
  processed → `200 {received:true, duplicate:true}` (no double credit).

The endpoint **fails closed**: while `DODO_WEBHOOK_SECRET` is unset it answers
`503 {"detail":{"error":"Webhook not configured"}}` before reading or parsing anything.
Every processed payment is stored in `payments` (unique per gateway payment id) with an
audit row in `credit_ledger`; grants increment the account balance and all of that
account's active API keys.

## Roadmap (rolling out with the Phase B auth surface)

These endpoints are being added and are not yet live as of November 2026:
`POST /auth/signup`, `POST /auth/login`, `POST /auth/logout`, `GET /me`,
`POST /keys` + `DELETE /keys/{id}` (self-serve API key management), and
`GET /api/v1/history` (paginated past generations). This document is updated as each ships.

## Studios: agents / workflows / creative agent (M7)

D1-backed minimal parity for the three studio surfaces — full request/response
detail in [`api/README.md`](../api/README.md#studios-m7--agents--workflows--creative-agent).

- **Agents** (`/agents/*`): template + user galleries, agent CRUD, conversations,
  and chat. Chat is a submit+poll flow (`POST /agents/by-slug/{slug}/chat` →
  `{request_id}` → `GET /api/v1/predictions/{id}/result` returns the chat
  envelope `{conversation_id, messages, is_complete, suggestions, status}`).
  **Replies come from a local template responder in v1** — no LLM key yet.
  Galleries and by-slug reads are public; all writes use the standard key/session auth.
- **Workflows** (`/workflow/*`): defs CRUD, gallery lists, a static node-schema
  registry (`GET /workflow/{id}/node-schemas`), and a run engine. Runs insert a
  `workflow_runs` row, return `{run_id}` immediately, execute the graph
  node-by-node in the background, and serve progress via
  `GET /workflow/run/{id}/status` and `/api-outputs`. Text nodes pass through;
  image/video generation nodes reuse the standard generation pipeline
  (credits + rate limit apply; run submits require a raw API key).
  `/workflow/architect` returns a template single-node graph through the same
  poll pattern. `/workflow/cloudfront-signed-url` passes the URL back
  (outputs are public `/media/*` objects; nothing to sign).
- **Creative agent** (`/api/v1/creative-agent/*`): design-canvas sessions,
  message snapshots, asset registry, chat/run-skill jobs and the
  `GET /jobs/{id}/events` poll — plus an SSE variant at
  `GET /jobs/{id}/events/stream` (`text/event-stream`: one `data:` frame per
  stored event, then `data: {"done":true}`, then close; template-mode jobs
  complete at submit, so the stream is a single short burst). Jobs complete
  synchronously with template replies in v1 (info + text events, `done: true`).

New D1 tables (idempotent in `api/schema.sql` — re-run before deploy):
`agents`, `agent_conversations`, `agent_messages`, `agent_jobs`, `workflows`,
`workflow_runs`, `ca_sessions`, `ca_jobs`, `ca_assets`.

## Changelog

### November 2026 — cost endpoints, sync mode, usage analytics

- `POST /workflow/estimate-cost` and `POST /workflow/calculate_dynamic_cost`
  (legacy `/app/calculate_dynamic_cost` alias) quote the exact submit charge in
  credits and USD.
- `POST /api/v1/{model}` accepts `sync: true` on image models — the API waits
  up to ~25 s and returns finished hosted URLs inline when the job completes.
- `GET /usage` returns totals, per-model splits and last-7-day daily counts.
- Creative-agent jobs expose `GET /jobs/{id}/events/stream` (SSE).
- Media housekeeping: KV uploads expire after 24 h, generated outputs after
  30 days; rate/session tables self-prune opportunistically; Runway i2v input
  images are de-duplicated through a 24 h asset cache.

### November 2026 — Phase A/B launch

- Launched `https://api.opraiz.com`: health, account balance, model catalog, and asynchronous
  image generation (submit + poll) for `flux-dev-image`, `flux-schnell-image`, `sdxl-image`.
- Per-key rate limit of 60 submits / 60 s with `429` responses.
- Credit metering on submit; per-model credit costs published above.
- Upload/media endpoints staged behind object storage enablement (`501` until switched on).
- MCP endpoint and account auth/keys/history surface rolling out.

### November 2026 — multi-provider generation

- Provider registry (`runpod`, `bfl`, `kling`, `fal`, `runway`) dispatches submit + poll
  behind the same `POST /api/v1/{model}` → `GET /api/v1/predictions/{id}/result` contract.
- Added real-FLUX images on BFL (`flux-dev-image` now hits FLUX.1 dev; `flux-schnell-image`
  serves via FLUX.2 klein 4b since FLUX.1 schnell left the BFL API) and FLUX.1 Kontext
  pro/max with optional input-image edits.
- Added video: Kling v2.1 Master / v2.5 Turbo Pro (t2v + i2v), Seedance 1.0 pro/lite (t2v)
  and pro (i2v) via fal, and Runway (gen4.5 t2v, gen4_turbo i2v).
- Model catalog now reports `provider` per model; MCP `list_models` reflects the same map.

### November 2026 — M7 studio endpoints

- Agents, Workflows and Creative-Agent studios served on this worker with D1
  state (see "Studios" section above). Agent/creative chat uses a template
  responder until an LLM backend lands; workflow generation nodes debit
  credits through the shared generation path.
