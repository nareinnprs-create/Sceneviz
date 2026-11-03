# Sceneviz API (`api.opraiz.com`)

Stage 2 backend. Plan: [`../docs/stage2-runpod-plan.md`](../docs/stage2-runpod-plan.md) ·
Contract: [`../docs/stage2-api-contract.md`](../docs/stage2-api-contract.md)

## Layout
- `wrangler.jsonc` — Worker config: custom domain `api.opraiz.com`, D1 `sceneviz`, R2 `sceneviz-media`
- `src/index.js` — Worker (auth, balance, models, uploads, media, generation stub)
- `schema.sql` — D1 tables (`keys`, `usage`)
- `issue-key.mjs` — key issuance CLI

## Setup / deploy
```powershell
$env:PATH = "$env:LOCALAPPDATA\Programs\nodejs;$env:PATH"
# one-time provisioning
npx wrangler d1 create sceneviz          # put the id into wrangler.jsonc
npx wrangler r2 bucket create sceneviz-media
npx wrangler d1 execute sceneviz --remote --file schema.sql -y
npx wrangler secret put RUNPOD_API_KEY   # Phase B; set now, unused in Phase A

# deploy + smoke
npx wrangler deploy
curl https://api.opraiz.com/healthz
```

## Keys
```powershell
$env:CLOUDFLARE_API_TOKEN = "..."   # account token with D1 access
node api/issue-key.mjs "narein-dev" 500
```
Raw key is printed once; only the SHA-256 hash is stored.

## Endpoints (Phase A)
| Method | Path | Notes |
|---|---|---|
| GET | `/healthz` | no auth |
| GET | `/api/v1/account/balance` | `{balance, email}` |
| GET | `/api/v1/models` | catalog placeholder |
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

Phase B details: model map in `src/modelMap.js` (endpoint env `RUNPOD_ENDPOINT_ID_IMAGE`, credit cost, input translation); RunPod calls in `src/gpu.js`; per-key rate limit 60 req/60s on submits only (429); credits debited on successful submit, **no refund on failed jobs yet**. Requires `RUNPOD_API_KEY` secret and `RUNPOD_ENDPOINT_ID_IMAGE` var in `wrangler.jsonc`.
