# Sceneviz API (`api.opraiz.com`)

Stage 2 backend. Plan: [`../docs/stage2-runpod-plan.md`](../docs/stage2-runpod-plan.md) ·
Contract: [`../docs/stage2-api-contract.md`](../docs/stage2-api-contract.md)

## Layout
- `wrangler.jsonc` — Worker config: custom domain `api.opraiz.com`, D1 `sceneviz`, R2 `sceneviz-media`
- `src/index.js` — Worker (auth, accounts, keys, history, catalog, MCP, uploads, media, generation, billing; wires the M7 studios)
- `src/agentsApi.js` — M7 agents studio (template/user galleries, CRUD, conversations, template-responder chat)
- `src/workflowsApi.js` — M7 workflows studio (defs CRUD, node-schema registry, run engine, architect)
- `src/creativeApi.js` — M7 creative agent (design canvas sessions/messages/assets/jobs/events)
- `src/providers.js` — provider adapters (runpod/bfl/kling/fal/runway): submit + poll, contract status mapping
- `src/modelMap.js` — model id → provider + cost + input translation (drives GET /models and the workflow node registry)
- `src/auth.js` — PBKDF2 password hashing + session-token helpers (WebCrypto only)
- `src/mcp.js` — minimal streamable-HTTP MCP server (JSON-RPC 2.0)
- `src/billing.js` — M3 credit packs, Dodo checkout creation, webhook signature verification, idempotent credit grants
- `schema.sql` — D1 tables (`keys`, `usage`, `rate`, `accounts`, `sessions`, `generations`, `payments`, `credit_ledger`, M7: `agents`, `agent_conversations`, `agent_messages`, `agent_jobs`, `workflows`, `workflow_runs`, `ca_sessions`, `ca_jobs`, `ca_assets`)
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

## Endpoints (Phase B — generation, multi-provider)
| Method | Path | Notes |
|---|---|---|
| POST | `/api/v1/{model}` | submit → provider registry; `{status:'submitted', request_id, id}` |
| GET | `/api/v1/predictions/{request_id}/result` | provider poll → contract vocabulary; `{status, output, outputs, error?}` |
| POST | `/api/v1/{other model-id}` | 501 until mapped in `src/modelMap.js` |

**Live models** (`src/modelMap.js` — costs flagged for pricing review):

| Model | Provider | Cost | Inputs |
|---|---|---|---|
| `flux-dev-image` | BFL `/v1/flux-dev` | 5 | prompt, width, height, seed, num_images 1-2 |
| `flux-schnell-image` | BFL `/v1/flux-2-klein-4b` (schnell retired from BFL; klein 4b serves the id) | 2 | same as flux-dev |
| `flux-kontext-pro-t2i` | BFL `/v1/flux-kontext-pro` | 4 | prompt, aspect_ratio, optional image_url (i2i) |
| `flux-kontext-max-t2i` | BFL `/v1/flux-kontext-max` | 8 | same as kontext-pro |
| `sdxl-image` | RunPod worker-sdxl | 2 | prompt, negative_prompt, width, height, num_images, seed |
| `kling-v2.1-master-t2v` | Kling-branded video via Runway (`kling3.0_standard`) | 80 | prompt, aspect_ratio 16:9/9:16/1:1, duration 2–10 |
| `kling-v2.1-master-i2v` | Image-to-video via Runway (`gen4_turbo`) | 80 | + image_url (start frame) |
| `kling-v2.5-turbo-pro-t2v` | Kling-branded video via Runway (`kling3.0_pro`) | 100 | same as kling t2v |
| `seedance-pro-t2v` | Seedance 2 via Runway (`seedance2`) | 60 | prompt, aspect_ratio 16:9/9:16, duration 2-10 |
| `seedance-lite-t2v` | Seedance 2 fast via Runway (`seedance2_fast`) | 60 | same as seedance-pro-t2v |
| `seedance-pro-i2v` | Image-to-video via Runway (`gen4_turbo`) | 60 | + image_url (start frame) |
| `runway-text-to-video` | Runway `/v1/text_to_video` (`gen4.5`) | 90 | prompt, aspect_ratio 16:9/9:16, duration 2-10 |
| `runway-image-to-video` | Runway `/v1/image_to_video` (`gen4_turbo`) | 90 | prompt, image_url, aspect_ratio, duration 2-10 |

Video entries ignore `num_images` (always 1× cost). Secrets: `RUNPOD_API_KEY`,
`BFL_API_KEY` (`x-key` header), `KLING_API_KEY` (Bearer, `api-singapore.klingai.com`),
`SEEDANCE_API_KEY` (fal `Authorization: Key`, `queue.fal.run`), `RUNWAY_API_KEY`
(Bearer + `X-Runway-Version: 2024-11-06`, `api.dev.runwayml.com`) — all referenced as
`env.<NAME>` only. Provider adapters (`{submit, poll}` per provider, status mapped to
the contract vocabulary) live in `src/providers.js`; RunPod calls stay in `src/gpu.js`.

Per-key rate limit 60 req/60s on submits only (429) — the MCP `generate_image` tool
goes through the same path; credits debited on successful submit, **no refund on
failed jobs yet**. Every successful submit also inserts a `generations` row (status
`submitted`) that the poll endpoint updates with terminal status + output URLs —
`/history` serves that table; `usage` remains the ledger feed.

**Live checks pending:** endpoints/field shapes were verified against provider docs
(BFL + fal + Runway OpenAPI, Kling Open Platform), not against the real keys yet —
run one cheap generation per model through api.opraiz.com before announcing
(Kling `mode`/`duration` combos, fal COMPLETED response url path, and Runway
`gen4.5` on `/v1/text_to_video` are the spots most likely to need a tweak).

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

## Studios (M7 — agents / workflows / creative agent)

D1-backed minimal parity for the Agents, Workflows and Creative-Agent studios.
All state in D1 (no Durable Objects); **agent + creative-agent chat replies are
generated by a local TEMPLATE responder in v1** (no LLM key yet) — messages,
conversations and jobs are persisted and round-trip through the client's
normal poll endpoints. Schema additions are idempotent (`CREATE TABLE IF NOT
EXISTS`) — re-run `schema.sql` on the remote D1 before deploying.

Auth: existing key/session everywhere, **except** workflow run submits
(`/run`, `/api-execute`, `/node/{id}/run` when the node is a generation model)
which require a raw API key (credits debit per generation node via the shared
`generateCore` path — rate limit applies).

### Agents
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/agents/templates/agents` | none | 3 branded starter agents from static code; array of agent objects (`agent_id`, `name`, `category`, `system_prompt`, `welcome_message`, `initial_suggestions[{label,prompt}]`, `theme`, `skills[]`, `is_template`) |
| GET | `/agents/featured/agents` | none | first 2 templates |
| GET | `/agents/skills` | none | static skill catalog (no runtime effect in v1) |
| GET | `/agents/user/agents` | key/session | caller's agents |
| GET | `/agents/user/conversations` | key/session | `[{id, title, agent_slug, agent_name, agent_icon_url, updated_at, message_count}]` |
| GET | `/agents/by-slug/{slug}` (alias `GET /agents/{id}`) | none* | full agent object incl. `is_owner` (resolved when a credential is presented), `has_liked`, `like_count`; works anonymously for templates |
| POST | `/agents` | key/session | `{name, system_prompt, …}` → 201 `{agent_id}` |
| PUT | `/agents/by-slug/{slug}` | owner | partial update (name/prompt/theme/skills/flags) |
| DELETE | `/agents/by-slug/{slug}` | owner | 204 |
| POST | `/agents/suggest` | key/session | `{prompt}` → template-derived `{name, description, system_prompt, recommended_skill_ids, welcome_message, initial_suggestions}` |
| POST | `/agents/by-slug/{slug}/chat` | key/session | `{message, conversation_id?, attachments?, stream:false}` → `{request_id, conversation_id, status}`; client-minted conversation ids are accepted |
| GET | `/agents/by-slug/{slug}/{conversation_id}` | owner | `{id, history:[{role, content, timestamp}], created_at}` |
| POST | `/agents/by-slug/{slug}/like?is_like=` | key/session | `{has_liked, like_count}` (not per-user deduped) |
| POST | `/agents/by-slug/{slug}/preview-realign` | key/session | echoes `current_prompt` (no LLM) |
| GET/POST | `/agents/{slug}/conversations`, `/agents/conversations/{id}/messages`, `/agents/conversations/{id}/like` | key/session | alternate conversation surface |

Agent-chat polls ride the standard `GET /api/v1/predictions/{request_id}/result`
route: agent jobs return `{conversation_id, messages:[{role,content}],
is_complete, suggestions, status}` before the media-poll fallback runs.

### Workflows
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/workflow/get-template-workflows` (alias `/workflow/templates`), `/workflow/get-published-workflows` | none | gallery cards `{id, name, category, thumbnail}` |
| GET | `/workflow/get-workflow-defs` (alias `/workflow/defs`), `/workflow/user/{page}` | key/session | caller's defs |
| POST | `/workflow/create` | key/session | `{workflow_id?} → {workflow_id}` (create or save) |
| GET | `/workflow/get-workflow-def/{id}` | none* | full def (`data.nodes`, `edges`, `is_owner`, `is_published`, `is_template`, `show_temp_button`) |
| POST | `/workflow/update-name/{id}`, `/workflow/update-category/{id}` | owner | `{value}` → `{success:true}` |
| DELETE | `/workflow/delete-workflow-def/{id}` | owner | `{success:true}` |
| POST | `/workflow/{id}/thumbnail` | owner | `{thumbnail}` stored → `{success:true}` |
| POST | `/workflow/workflow/{id}/publish` / `…/template` | owner | `{publish}` / `{is_template}` |
| GET | `/workflow/{id}/api-inputs` | owner | `{input_data:{properties:{nodeId:{type,title}}}}` |
| GET | `/workflow/{id}/node-schemas`, `/workflow/node-schemas` | none | static registry: `categories.{text,image,video,audio,utility,api}.models` with `input_schema.schemas.input_data` per model (derived from `src/modelMap.js` + passthrough/utility nodes) |
| GET | `/workflow/{id}/api-node-schemas` | owner | `{models:{}}` (no external API nodes in v1) |
| POST | `/workflow/{id}/run`, `/workflow/{id}/api-execute`, `/workflow/{id}/node/{nodeId}/run` | **key** | creates a run → `{run_id}` (202); executes node-by-node in `waitUntil` |
| GET | `/workflow/run/{runId}/status` | owner | `{status, nodes:{nodeId:[{status, result:{id, outputs:[{value}]}}]}}` |
| GET | `/workflow/run/{runId}/api-outputs` | owner | `{status, outputs:[{id, type, value, url}], url, error?}` |
| DELETE | `/workflow/node-run/{id}` | owner | `{ok:true}` |
| POST | `/workflow/architect` | key/session | `{prompt}` → template single-node workflow → `{request_id}` |
| GET | `/workflow/poll-architect/{requestId}/result` | key/session | `{status:"completed", message, suggestions, workflow:{nodes, edges}}` |
| POST | `/workflow/cloudfront-signed-url` | key/session | passthrough `{signed_url}` (outputs are public `/media/*` URLs) |

Run engine: text/utility nodes pass their values through; generation nodes
(image/video models in `MODEL_MAP`) submit through `generateCore` (credits +
rate limit + history rows) and are polled to a terminal state inside
`waitUntil`; unknown model ids fail the run with "Model '…' is not served by
this deployment yet". shortcut: video runs poll up to ~12 min — on the
Workers free plan the ~50-subrequest/invocation cap can cut long video runs
short; paid plans (1000) are fine.

### Creative agent (design canvas)
All under `/api/v1/creative-agent`, key or session (Bearer accepted):
| Method | Path | Notes |
|---|---|---|
| GET/POST | `/sessions` | list `[{id, name}]` / create → `{id}` |
| PATCH/DELETE | `/sessions/{id}` | rename / delete |
| GET/PATCH | `/sessions/{id}/messages` | transcript array stored verbatim (client owns it) |
| GET | `/sessions/{id}/jobs` | `[{id, kind, model, status, created_at}]` |
| GET/POST | `/sessions/{id}/assets` | registry; POST `{url, kind, source_tool}` → `{asset_label}` |
| POST | `/sessions/{id}/chat` | `{message, model, messages_snapshot, canvas_state}` → `{job_id}` (template reply) |
| POST | `/sessions/{id}/run-skill` | `{skill_name, inputs, …}` → `{job_id}` (template reply) |
| GET | `/agent-skills` | static `[{name, inputs[]}]` |
| GET | `/jobs/{id}/events?since=` | `{events:[{id, type, payload, job_id}], cursor, done:true, approved:null}` |
| POST | `/jobs/{id}/approve|reject` | `{ok:true}` (v1 jobs never pause for approval) |
| GET | `/account/balance` | `{balance, email}` |
