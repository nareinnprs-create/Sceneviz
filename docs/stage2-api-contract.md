# Sceneviz Stage-2 API Compatibility Contract

**Audience:** the Opraiz backend team. This document describes, exactly, every backend call the
Sceneviz app makes today against the current provider (**MuAPI**, `https://api.muapi.ai`), the
precise request/response fields the client code reads, and which behaviors are load-bearing
(essential) versus cosmetic. If Opraiz's API satisfies this contract, the app can be flipped to
the Opraiz backend by changing one config file (three byte-identical mirrors).

**Stage-2 flip point:** `lib/apiConfig.js` (mirrored byte-identically at `src/lib/apiConfig.js`
and `packages/studio/src/apiConfig.js`). Today it pins five defaults:

| Export | Default (Stage 1) | Env override |
|---|---|---|
| `API_BASE_URL` | `https://api.muapi.ai` | `NEXT_PUBLIC_SCENEVIZ_API_BASE_URL` (build-time inlined) |
| `KEY_SIGNUP_URL` | `https://muapi.ai/access-keys` | **none yet** (hardcoded const) |
| `MCP_BASE_URL` | `https://api.muapi.ai/mcp` | `NEXT_PUBLIC_SCENEVIZ_MCP_BASE_URL` |
| `DOCS_URL` | `https://muapi.ai/docs` | `NEXT_PUBLIC_SCENEVIZ_DOCS_URL` |
| `CDN_BASE_URL` | `https://cdn.muapi.ai` | `NEXT_PUBLIC_SCENEVIZ_CDN_BASE_URL` (exported; **no consumers yet** — see §7) |

`API_BASE_URL` also has a **legacy fallback**: if no env var is set the MuAPI default is used.
There are no other fallbacks — no per-surface overrides, no runtime config.

---

## 1. Auth model

Pure **BYOK (bring-your-own-key)**, key-paste model. There is **no login/oauth endpoint** and no
session system. The user obtains a key from a signup page (`KEY_SIGNUP_URL`) and pastes it into a
modal (`components/ApiKeyModal.js`, `src/components/AuthModal.js`).

- **Header name (compatibility-critical): `x-api-key`** — sent lowercase, on **every** request,
  from every client surface (fetch, axios, XHR). No `Authorization` header is ever sent to the
  backend by the app's own code. (Several Next proxy handlers *accept* `Authorization: Bearer
  <key>` from the browser and re-emit it as `x-api-key`, but the backend contract is `x-api-key`.)
- **Key storage (client-side):** `localStorage['muapi_key']`, mirrored to a non-HttpOnly
  `muapi_key` cookie so Next server components on `/agents/*` can read it via `cookies()`.
  A legacy Vite app also reads `window.__MUAPI_KEY__`. The design-agent surface additionally
  mirrors the key to `localStorage['token']`.
- **Invalid-key semantics (compatibility-critical):** the client calls
  `window.dispatchEvent(new CustomEvent('muapi:auth-required', { detail: { status, message } }))`
  whenever a request returns **401 or 403**, to surface the key modal. The backend must return
  401 for missing/invalid keys and 403 for unauthorized actions on valid keys.
- **Balance check as key validation:** the shell polls `GET /api/v1/account/balance` every 30 s;
  the response `{ balance: <number>, email: <string> }` is consumed. Note: this endpoint
  explicitly **403s for white-label session identities** — it must accept raw BYOK keys.
- **MCP/CLI auth:** `Authorization: Bearer <key>` against `MCP_BASE_URL` (streamable-HTTP MCP).
  Same key material, different header, only used by the external CLI/MCP server products.

## 2. Request routing: who calls the backend

Three execution modes determine whether Opraiz needs CORS headers:

1. **Browser (web app, served over http/https):** everything goes through same-origin `/api/*`
   and is re-issued server-side. No CORS needed. Mapping:
   - `middleware.js`: **rewrites** `/api/v1/*` → `{API_BASE_URL}/api/v1/*` (method, headers,
     query string and body preserved), **except** three paths with dedicated handlers:
     `/api/v1/creative-agent/*`, `/api/v1/get_upload_url`, `/api/v1/upload-binary`.
     `/api/workflow/*` and `/api/app/*` are *not* rewritten (they have route handlers).
   - 8 route handlers under `app/api/**` (see §4–§9): `api/v1/[[...path]]`… specifically
     `app/api/api/v1/[[...path]]`, `app/api/workflow/[[...path]]`, `app/api/agents/[[...path]]`,
     `app/api/app/[[...path]]`, `app/api/v1/creative-agent/[[...path]]`,
     `app/api/v1/get_upload_url`, `app/api/v1/upload-binary`, `app/api/upload-binary`.
     All strip `host`/`connection`/`cookie` and set `x-api-key` from the incoming header.
   - `app/api/api/v1/[[...path]]` exists because one embedded library hardcodes a **double
     prefix** (`/api/api/v1/...`) — it maps to `{API_BASE_URL}/api/v1/...` (GET/POST).
2. **Next server components (`app/agents/**`):** call `{API_BASE_URL}/agents/...` and
   `{API_BASE_URL}/api/v1/account/balance` **directly** (server-to-server, `x-api-key` header).
3. **Desktop (Electron `file://` renderer) and the legacy Vite app in production:** call
   `{API_BASE_URL}` **directly from the browser process**. ⇒ **Opraiz's API must send permissive
   CORS headers** (`Access-Control-Allow-Origin: *`, methods GET/POST/PUT/PATCH/DELETE, headers
   `Content-Type, x-api-key`) or these surfaces break.

## 3. Universal conventions (compatibility-critical)

### 3.1 Submit-and-poll generation

All media generation is asynchronous, two-step:

1. `POST {API_BASE_URL}/api/v1/{endpoint}` — headers `Content-Type: application/json`,
   `x-api-key`. The **endpoint string is the model id** (see §4). Success response must include a
   task handle: **`request_id`** (or `id`). If neither is present the client treats the body as a
   synchronous result. Optional **sync mode**: some callers send `"sync": true` and expect the
   final payload immediately, e.g. `POST /api/v1/flux-schnell-image` `{prompt, width, height,
   num_images, sync:true}` → `{ outputs: ["<url>", ...] }`.
2. `GET {API_BASE_URL}/api/v1/predictions/{request_id}/result` — polled every 2 s for up to
   900 attempts (agents: 150). **Status values (exact, case-insensitive):**
   - success: `completed` | `succeeded` | `success`
   - failure: `failed` | `error` | `cancelled` | `canceled`
   - anything else (incl. `processing`, `running`, `starting`, `pending`) keeps polling.
   - HTTP ≥500 → retry; 4xx → abort; 400 on agent poll → error message read from
     `detail.error` (i.e. `{ "detail": { "error": "..." } }`).

**Result body fields the client actually reads:**

| Field | Where consumed |
|---|---|
| `outputs[0]` | primary output URL (`result.outputs?.[0] || result.url || result.output?.url`) |
| `url` | fallback output URL (also the top-level field merged onto the returned object) |
| `output.url` | fallback output URL |
| `request_id` / `id` | echoed back and persisted in client history |
| `status` | terminal-status detection (above) |
| `error` (string, or `{message}`) | surfaced to the user on failure |
| `images` (array) or `output.images` | layer-decompose result (`bytedance-seedream-5.0-pro-layer`); fallback `outputs` |
| `cost.refunded` (bool) + `cost.amount_credits` (number) | refund notice appended to error text |

### 3.2 Error shape

Non-2xx bodies are shown to the user as raw text (first 100 chars). Structured reads:
`{ "detail": "..." }` (upload errors, axios surfaces) and `{ "detail": { "error": "..." } }`
(agent poll 400). Keep FastAPI-style `detail` casing.

### 3.3 Cost estimation

- `POST /api/v1/models/{endpoint}/estimate-cost` (no auth header sent) with the same payload as
  the generation call → must return `{ cost: <finite number ≥ 0>, currency: <3-letter string> }`.
- `POST /api/v1/app/calculate_dynamic_cost` `{ task_name, payload }` → JSON passthrough
  (fields not read by the client today).

---

## 4. Domain: media generation (image / video / audio / lipsync / recast / motion)

**One generic pattern:** `POST /api/v1/{model-endpoint}` — **585 model endpoints** shipped in the
client catalog (`packages/studio/src/models.js`): 85 t2i, 110 t2v, 88 i2i, 184 i2v, 75 v2v,
15 lipsync, 3 recast, 2 motion-control, 23 audio. The model id **is** the URL path segment
verbatim (e.g. `flux-dev`, `kling-v2.1-master-t2v`, `suno-create-music`,
`infinitetalk-image-to-video`, `seedance-2.5-motion-control`). Opraiz must serve `POST
/api/v1/<id>` for **every id the catalog contains** (or the app must ship a trimmed catalog —
see Open Questions). The client also tolerates a catalog entry with an explicit `endpoint`
field overriding the id.

Hardcoded endpoint ids used by specific tools (all under the same generic pattern):
`bytedance-seedream-5.0-pro-layer` (layer decompose), `ai-clipping`, `motion-graphics`,
`motion-graphics-edit`, `ai-image-upscale` (from id `ai-image-upscaler`), `ai-background-remover`,
`ai-image-extension`, `seedvr2-image-upscale`, `topaz-image-upscale`,
`sd-2-vip-omni-reference-1080p`, `seedance-2-vip-omni-reference`, `seedance-2.5-motion-control`,
`seedance-2-motion-control`.

**Essential. Request bodies** are free-form per model (the client builds them from its catalog);
commonly seen fields: `prompt`, `aspect_ratio`, `duration`, `resolution`, `quality`, `seed`,
`generate_audio`, `image_url`, `images_list`, `videos_list`, `video_files`, `audio_url`,
`video_url`, `strength`, `mode`, `high_bitrate`, `num_highlights`, `return_coordinates_only`,
`edit_prompt`, `request_id`, `style`, `custom_mode`, `title`, `instrumental`, `persona_id`,
plus model-specific supplemental inputs and required-array defaults. The backend must accept the
**superset** used by the current provider's OpenAPI (the catalog was verified against it).
**Response:** see §3.1.

| # | Operation | Path | Auth | Notes |
|---|---|---|---|---|
| 1 | Generate | `POST /api/v1/{model-endpoint}` | `x-api-key` | submit → poll; 60–900 attempts |
| 2 | Estimate cost | `POST /api/v1/models/{endpoint}/estimate-cost` | none | `{cost, currency}` |

## 5. Domain: task lifecycle / history

| # | Operation | Path | Auth | Request | Response fields consumed |
|---|---|---|---|---|---|
| 3 | Poll result | `GET /api/v1/predictions/{request_id}/result` | `x-api-key` | — | see §3.1; also full agent-chat envelope (§8) |
| 4 | Delete media | `DELETE /api/v1/predictions/{request_id}/media` | `x-api-key` | — | JSON passthrough; must strip input/output media + delete S3 objects |
| 5 | History | `GET /api/v1/history?cursor=&limit=50` | `x-api-key` | cursor pagination | **shape not consumed anywhere yet** — generic JSON; treat as optional (§10) |

History/delete-media are exported but have no active consumers in the shipped surfaces —
**optional**, but they back the intended server-side "past generations" feature.

## 6. Domain: uploads (two flows — both essential)

### 6.1 Multipart direct upload (primary, all studios)

`POST /api/v1/upload_file` — **not** JSON: `multipart/form-data` with field **`file`**, header
`x-api-key`, XHR with progress events, 300 s timeout.
**Response:** the client reads `data.url || data.file_url || data.data.url` — at least one must
be the public URL of the stored file. That URL is then passed to generation payloads.

### 6.2 Presigned S3 POST flow (workflow builder, agents, design canvas)

1. `GET /app/get_file_upload_url?filename=<name>` (alias accepted: `get_upload_file`) —
   `x-api-key` **required** (proxies 401 without it).
   **Response (exact):** `{ url: <S3 HTTPS POST URL>, fields: { key: "<object key>", ... } }`.
   - In the Next app the proxy **rewrites `data.url` to `/api/upload-binary`** and injects
     `fields["x-proxy-target-url"] = <original S3 URL>`; the browser POSTs the form (all
     `fields` entries first, then `file` **last**) to that proxy, which re-POSTs to S3
     server-side (204 expected).
   - **SSRF allowlist (compatibility-critical):** the proxy only forwards to hosts matching
     `s3.amazonaws.com`, `*.s3.amazonaws.com`, `s3.<region>.amazonaws.com`,
     `<anything>.s3.<region>.amazonaws.com` — or a host listed in env
     `UPLOAD_PROXY_ALLOWED_HOSTS` (comma-separated). The presign `url` must be an `https://`
     S3-style host, or Opraiz's bucket host must be added to that env var at deploy time.
2. The client then **derives the public URL itself**: `` `https://cdn.muapi.ai/${fields.key}` ``
   (hardcoded in `CreativeCanvas.jsx`, `RenderField.jsx`, `RenderApiField.jsx`, `UploadNode.jsx`,
   `EditAgent.jsx`). ⇒ **`fields.key` must map 1:1 to a stable public CDN URL**, and that CDN
   host must either remain `cdn.muapi.ai` or every call site must change (see §12).

## 7. Domain: account / app

| # | Operation | Path | Auth | Request | Response fields consumed |
|---|---|---|---|---|---|
| 8 | Balance | `GET /api/v1/account/balance` | `x-api-key` | — | `balance` (number), `email` (string). Must 403 for white-label identities, 401 for bad keys. Polled every 30 s. |
| 9 | Register interest | `POST /app/interest` | `x-api-key` | `{ app_name }` | passthrough |
| 10 | List interests | `GET /app/interests` | `x-api-key` | — | array of app-name strings (compared to local names) |

9–10 are cosmetic (AppsStudio "request access" widget). **Optional.**

## 8. Domain: agents

Server components (`app/agents/**`) call `GET /agents/*` **directly** (mode 2); the AiAgent
library calls relative `/api/agents/*` / `/api/api/v1/*` (mode 1). All with `x-api-key`.

| # | Operation | Path | Request | Response fields consumed |
|---|---|---|---|---|
| 11 | Template agents | `GET /agents/templates/agents` | — | array, or `{agents: []}` / `{items: []}` envelope; items: `agent_id` or `id`, `name`, `icon_url`, `category`, `owner_username`, `owner_email`, `description`, `system_prompt`, `skills[]`, `theme`, `is_published`, `is_template`, `welcome_message`, `initial_suggestions` |
| 12 | User agents | `GET /agents/user/agents` | — | same |
| 13 | Featured/published | `GET /agents/featured/agents` | — | same |
| 14 | User conversations | `GET /agents/user/conversations` | — | array (chat history across agents) |
| 15 | Agent by slug | `GET /agents/by-slug/{slug}` | — | full agent object; must work unauthenticated for published/template agents; includes `is_owner` (bool, gates editing) |
| 16 | Agent by id (fallback) | `GET /agents/{agent_id}` | `x-api-key` | same, used when slug lookup fails |
| 17 | Conversation history | `GET /agents/by-slug/{slug}/{conversation_id}` | `x-api-key` | `{ history: [{role, content, thoughts?, type?, timestamp?}], created_at }` |
| 18 | Send chat message | `POST /agents/by-slug/{slug}/chat` | `x-api-key` | `{ message, conversation_id: string|null, attachments: array|null, stream: false }` → **`{ request_id }`** (or `id`), then poll op #3. Completed poll body is **not** a media URL but `{ conversation_id, messages: [{role, content, thoughts?, type:'pulse'?}], is_complete: bool, suggestions: string[], status?, error? }` — `stream:false` must be honored (no SSE). |
| 19 | Create agent | `POST /agents` | `x-api-key` | `{name, description, system_prompt, skill_ids[], welcome_message, initial_suggestions, is_published, is_template}` → `{ agent_id }` |
| 20 | Suggest agent | `POST /agents/suggest` | `x-api-key` | `{prompt}` → `{name, description, system_prompt, recommended_skill_ids[], welcome_message, initial_suggestions}` |
| 21 | Skills list | `GET /agents/skills` | `x-api-key` | array (items with `id`, name) |
| 22 | Update agent | `PUT /agents/by-slug/{slug}` | `x-api-key` | same shape as #19 + `theme`; owner-only |
| 23 | Delete agent | `DELETE /agents/by-slug/{slug}` | `x-api-key` | — |
| 24 | Preview realign | `POST /agents/by-slug/{slug}/preview-realign` | `x-api-key` | `{current_prompt, new_skill_ids[]}` → `{proposed_prompt}` |
| 25 | Like agent | `POST /agents/by-slug/{slug}/like?is_like=true|false` | `x-api-key` | — |
| 26 | Agent profile stats | `GET /agents/{agent_id}/profile` | `x-api-key` | `{agent, total_messages, total_chats, recent_chats}` |

**Essential:** 11–18 (the entire `/agents` gallery + chat loop). **Optional:** 20, 24–26.

## 9. Domain: workflows (builder + runner)

All called via the `/api/workflow` proxy (mode 1), `x-api-key`.

| # | Operation | Path | Request | Response fields consumed |
|---|---|---|---|---|
| 27 | Template workflows | `GET /workflow/get-template-workflows` | — | array; items need `id`, `name` |
| 28 | User workflows | `GET /workflow/get-workflow-defs` | — | array |
| 29 | Published workflows | `GET /workflow/get-published-workflows` | — | array |
| 30 | Get def | `GET /workflow/get-workflow-def/{id}` | — | full graph JSON (`restoreWorkflow(res.data)`); `is_owner`, `workflow_id` are logged by the proxy |
| 31 | Create/save | `POST /workflow/create` | `{workflow_id, source_workflow_id, name, edges[], data:{nodes[]}, is_vadoo, category}` | **`{ workflow_id }`** |
| 32 | Rename | `POST /workflow/update-name/{id}` | `{name}` | — |
| 33 | Delete def | `DELETE /workflow/delete-workflow-def/{id}` | — | — |
| 34 | API inputs schema | `GET /workflow/{id}/api-inputs` | — | input schema (rendered as form fields) |
| 35 | Execute | `POST /workflow/{id}/api-execute` | `{inputs}` | `{ run_id }` (or `id`), then poll #36; final: `url` or `output.url` or `outputs[].url` |
| 36 | Run outputs | `GET /workflow/run/{run_id}/api-outputs` | `x-api-key` | `{status}` (`completed|succeeded|success` done; `failed|error` fails with `error` field), output fields as above; ≥500 retried |
| 37 | Node schemas (all) | `GET /workflow/{id}/node-schemas` | — | `{categories: {...}}` schema tree |
| 38 | Node schemas (api) | `GET /workflow/{id}/api-node-schemas` | — | per-node input schemas |
| 39 | Run single node | `POST /workflow/{id}/node/{node_id}/run` | node payload | `{node_run_id}`, then poll #41 |
| 40 | Delete node run | `DELETE /workflow/node-run/{node_run_id}` | — | — |
| 41 | Run status | `GET /workflow/run/{run_id}/status` | — | `{ nodes: { "<node id>": [ { status, result: { id, outputs: [ { value } ] } } ] } }` — statuses seen: `processing`, `running`, `succeeded`, `completed` |
| 42 | Run workflow | `POST /workflow/{id}/run` | `{cost}` | **`{ run_id }`** |
| 43 | Set thumbnail | `POST /workflow/{id}/thumbnail` | `{thumbnail}` | `{success}` truthiness |
| 44 | Publish toggle | `POST /workflow/workflow/{id}/publish` | `{publish}` | `{publish}` |
| 45 | Template toggle | `POST /workflow/workflow/{id}/template` | `{is_template}` | `{is_template}` |
| 46 | Update category | `POST /workflow/update-category/{id}` | `{category}` | passthrough |
| 47 | Architect (AI builder) | `POST /workflow/architect` | `{prompt, workflow_id, history:[{role,content}]}` | **`{ request_id }`** → poll #48 |
| 48 | Architect poll | `GET /workflow/poll-architect/{request_id}/result` | `x-api-key` | `{status:"completed", message, suggestions[], workflow:{nodes:[{id,category,model,position,config…}]}}` |
| 49 | Signed download | `POST /workflow/cloudfront-signed-url` | `{url}` | **`{ signed_url }`** (CloudFront-signed GET for downloading output media) |

**Essential:** 27–38, 41–42 (builder/runner). **Optional:** 43–49.

## 10. Domain: creative agent (design canvas)

Proxied by `app/api/v1/creative-agent/[[...path]]` (GET/POST/PATCH/DELETE) →
`{API_BASE_URL}/api/v1/creative-agent/...`, `x-api-key`. Job progress is **not** SSE — it's
polled (`GET .../events?since=<cursor>`, 1.2 s interval).

| # | Operation | Path | Request | Response fields consumed |
|---|---|---|---|---|
| 50 | List sessions | `GET /api/v1/creative-agent/sessions` | — | array (`id`, `name`) |
| 51 | Create session | `POST /api/v1/creative-agent/sessions` | `{}` | `{ id }` |
| 52 | Rename / mutate session | `PATCH .../sessions/{id}` | `{name}` | — |
| 53 | Delete session | `DELETE .../sessions/{id}` | — | — |
| 54 | Get messages | `GET .../sessions/{id}/messages` | — | array of `{role, content, events[], timestamp, attachments?, skill_name?}` |
| 55 | Save messages | `PATCH .../sessions/{id}/messages` | `{messages}` | — |
| 56 | Session jobs | `GET .../sessions/{id}/jobs` | — | array (`job_id`, status…) |
| 57 | Session assets | `GET .../sessions/{id}/assets` | — | array `{asset_label, url, kind, source_tool, model, prompt}` |
| 58 | Register asset | `POST .../sessions/{id}/assets` | `{url, kind, source_tool}` | **`{ asset_label }`** |
| 59 | Chat / enqueue | `POST .../sessions/{id}/chat` | `{message, model:"gpt-5-mini", messages_snapshot, canvas_state}` | **`{ job_id }`** |
| 60 | Run skill | `POST .../sessions/{id}/run-skill` | `{skill_name, inputs:{...}, messages_snapshot, model}` | `{ job_id }` |
| 61 | Agent skills | `GET .../agent-skills` | — | array `{name, inputs[]}` |
| 62 | Job events (poll) | `GET .../jobs/{job_id}/events?since=<cursor>` | — | `{events:[{type, content, job_id?}], cursor, done: bool, approved}` — event types seen: `info`, `plan_propose` |
| 63 | Job action | `POST .../jobs/{job_id}/{action}` (approve/reject) | `{}` | — |

**Essential if the Design Agent surface ships; droppable otherwise (single consumer).**

## 11. Domain: MCP / CLI

- `MCP_BASE_URL` (default `{API_BASE_URL}/mcp`) — **streamable-HTTP MCP** endpoint, auth
  `Authorization: Bearer <key>`, registered into clients via
  `claude mcp add --transport http sceneviz <MCP_BASE_URL> --header "Authorization: Bearer ..."`.
  Not called by the web app itself; it is advertised in the UI (MCP & CLI studio tab) together
  with `DOCS_URL` and an npm CLI (`sceneviz-cli`, incl. `sceneviz auth login`).
- **Opraiz must ship:** an MCP endpoint at the configured URL supporting Bearer auth, a docs
  site, and (for feature parity) the CLI.

## 12. Hardcoded provider assumptions

**Must be reproduced by Opraiz (or every call site/config changes):**

1. **`x-api-key` header name** — every request.
2. **`request_id`** task-handle field name + **`/api/v1/predictions/{id}/result`** poll path +
   the exact status vocabulary (§3.1).
3. **`cdn.muapi.ai`** — public URL of presigned uploads is *derived* as
   `https://cdn.muapi.ai/{fields.key}` in 5 call sites; generated-media URLs returned by the
   backend are fetched/rendered directly by the browser. `CDN_BASE_URL` env exists but has **no
   consumers**, so changing the CDN host is a code change, not a config change.
4. **S3-style presign** `{url, fields}` with an `https://*.amazonaws.com` POST URL matching the
   proxy allowlist (§6.2), or `UPLOAD_PROXY_ALLOWED_HOSTS` must list Opraiz's upload host.
5. **Model catalog**: 585 model ids used verbatim as `/api/v1/{id}` path segments, with the
   current provider's input/output field names (verified against its published OpenAPI).
6. **CSP hosts** (`middleware.js`): browser fetches media directly from `https://muapi.ai`,
   `*.muapi.ai`, `*.cloudfront.net`, `storage.googleapis.com`, `static.aiquickdraw.com`,
   `samplelib.com`, `huggingface.co`, `platform.minimax.io` — Opraiz media hosts must be added.
7. **`next.config.mjs` `images.remotePatterns`**: `cdn.muapi.ai`, `*.muapi.ai`,
   `*.cloudfront.net`.
8. **Key signup page** (`KEY_SIGNUP_URL`, no env override today) — Opraiz must provide an
   equivalent page where users create/manage keys.
9. **CORS** for direct callers (Electron/Vite — §2.3).

**Cosmetic / safe to change with the config flip:**

- `KEY_SIGNUP_URL`, `DOCS_URL`, `MCP_BASE_URL` defaults (displayed/linked in UI).
- `d3adwkbyhxyrtq.cloudfront.net` (legacy branch in `EditAgent.jsx` icon prefix).
- Notification storage key `open_gen_notifications_v1`, persisted-state localStorage keys.
- Generic proxy helpers `handleProxyRequest` / `handleServerSideRequest` in `muapi.js`
  (no active consumers found).

## 13. Essential vs optional summary

- **Essential:** generation submit+poll family (§4, §3.1), `upload_file` (§6.1), presign flow
  (§6.2), `account/balance` (§7), agents list/chat cluster (§8 #11–18), workflow core (§9
  #27–38, 41–42).
- **Optional:** history + delete-media (§5), interests (§7), agent suggest/like/realign/profile
  (§8), workflow publish/template/thumbnail/architect/signed-url (§9 #43–49), creative-agent
  cluster (§10).

## 14. Open questions for Opraiz

1. Will `https://api.<opraiz-domain>` serve **all 585 model ids** under `POST /api/v1/{id}`, or
   should Sceneviz ship a reduced catalog? (A per-id availability endpoint does not exist today;
   the client's catalog is static and hard-coded.)
2. CDN strategy: will uploaded/presigned objects be reachable at a **predictable public URL
   derived from `fields.key`**? Which host, and can it stay stable enough to hardcode, or should
   the backend return the final public URL in the presign response (preferred — would let the
   client stop deriving it)?
3. Does the presign response keep the exact `{url, fields}` S3-POST shape, and is the POST URL on
   an allowlist-compatible host (§6.2) or should we extend `UPLOAD_PROXY_ALLOWED_HOSTS`?
4. Task lifecycle: will `/api/v1/predictions/{id}/result` be provided with the same status
   vocabulary, `outputs` array, `error`, and `cost.{refunded, amount_credits}` refund metadata?
5. Key management: what is the Opraiz key-signup URL (no env override exists yet — one will be
   added)? Does Opraiz issue a single static BYOK key per user, and will it support the
   white-label split (raw keys allowed on `/account/balance`, session-token identities 403'd)?
6. Sync mode: which generation endpoints support `sync: true` returning `{outputs:[...]}`?
7. Streaming: agent chat is currently `stream:false` + polling. Will Opraiz offer SSE/streaming
   for chat, and should the contract reserve a field (e.g. `stream: true` → SSE) for it?
8. Will the **MCP endpoint** (streamable HTTP + Bearer) and a **docs site** be available at
   Stage-2 launch, and will `sceneviz-cli` be republished against Opraiz?
9. Are `/api/v1/history` + `/api/v1/predictions/{id}/media` (delete) planned? If yes, what is
   the history item shape (the client has no consumer yet, so it can adopt Opraiz's shape)?
10. Rate limits / concurrency per key for the 2 s polling loops (up to 30 min for video) — any
    dedicated "wait/long-poll" variant preferred?
11. Upload size/type limits for `upload_file` (client allows up to 300 s XHR uploads, progress
    events expected) and for S3 presign flow?
12. Will the workflow service (defs, runs, node schemas, architect) and the creative-agent
    (sessions/jobs/events) services be ported as-is, or should those surfaces be feature-flagged
    off for Stage 2?
