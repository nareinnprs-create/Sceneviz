# Stage 2 — Opraiz API on Cloudflare Workers + RunPod GPU

Status: **plan, not yet executed.** Nothing here has been provisioned or billed.
Prerequisites already verified: Cloudflare zone `opraiz.com` active; RunPod key valid (`user_3Jgd…`).
Backend contract: [`stage2-api-contract.md`](./stage2-api-contract.md) — 66 endpoints, 10 compatibility-critical items.

---

## 1. Goal

Replace the MuAPI backend with an Opraiz-owned API so that:

1. End users never touch a third-party brand for keys, uploads, or generated media.
2. `sceneviz.opraiz.com` and `api.opraiz.com` are both Opraiz infrastructure.
3. GPU inference is billed per-second on RunPod serverless (scale-to-zero, $0 idle).

## 2. Architecture

```
sceneviz.opraiz.com            (existing Next Worker — unchanged except build-time base URL)
   │  x-api-key: <sceneviz key>
   ▼
api.opraiz.com                 (NEW Worker: sceneviz-api)
   ├─ D1   sceneviz_keys       keys, credits, usage ledger
   ├─ R2   sceneviz-media      user uploads + generated output (public read via custom domain)
   ├─ Secrets: RUNPOD_API_KEY
   ▼
RunPod serverless endpoints    (one per modality, scale-to-zero)
   ├─ sceneviz-image           SDXL / Flux class        → RTX 4090 / A100
   ├─ sceneviz-video           WAN / Veo class          → A100 / H100
   ├─ sceneviz-audio           TTS / voice clone        → RTX 4090
   └─ sceneviz-lipsync         video-to-video           → A100

RunPod → Worker webhook        job completion → D1 usage row → client sees balance/usage
```

Request flow (generation):

```
client POST /api/v1/{model-id}            (Worker: auth → meter → map model → RunPod /run)
client GET  /api/v1/predictions/{id}/result  (Worker: RunPod /status/{id} → contract status vocabulary)
RunPod POST webhook → /internal/job-done  (Worker: write usage row to D1)
```

RunPod's `/run` returns a job id immediately, so the Worker never blocks on GPU time — no
Workers CPU-limit or timeout exposure. Polling is client-driven; each poll costs 2 Worker
subrequests (well inside limits).

## 3. Scope reality check

The contract has **585 model ids**. Reproducing all of them on RunPod is not a Phase-1 job —
MuAPI is an aggregator across many providers. Recommended cut:

| Phase | Scope |
|---|---|
| A — API shell | auth, keys, balance, models list (real catalog metadata, generation `501 Not Implemented`), R2 uploads |
| B — GPU bridge | **one modality: text→image**, 2–3 flagship models end-to-end |
| C — breadth | video, audio, lipsync; webhook metering; expand catalog |
| D — deferred | agents (17 ep), workflow (23 ep), creative-agent (14 ep) — server-side logic, separate effort; app degrades to empty sections without them |

Deferred-phase note: agents/workflow endpoints are FastAPI-style business logic, not GPU
calls. They belong in a second Worker (or Durable Objects) and are **not** on the critical
path for "generate an image/video".

## 4. Phases

### Phase 0 — setup (no billing)
- `runpodctl` install + `doctor`; `RUNPOD_API_KEY` in `.env` (gitignored).
- CF: `wrangler.toml`/`jsonc` for `sceneviz-api`; secrets via `wrangler secret put`
  (never committed); D1 + R2 created; `api.opraiz.com` custom domain.
- **Token hygiene:** both tokens were pasted in chat — rotate both after Phase A.
  CF token is on disk nowhere (temp file was deleted); keep it that way.

**Exit:** `api.opraiz.com` serves `GET /healthz` → 200.

### Phase A — API shell
- Worker routes: `/api/v1/models`, `/api/v1/account/balance`, `/app/get_file_upload_url`,
  auth middleware, key issuance (CLI script, not a public endpoint yet).
- D1 schema: `keys`, `usage`, `balance_ledger`.
- R2 public bucket + `media.opraiz.com` (or r2.dev) for object URLs.
- `x-api-key` check → 401 (bad key) / 403 (no permission) to match `muapi:auth-required`.
- Balance endpoint returns `{balance, email}` — polled every 30s by the app.

**Upload gotcha (contract item 3):** the client **derives** the public URL as
`https://cdn.muapi.ai/{fields.key}` — hardcoded in **5 call sites**. Two options:
  1. Refactor those 5 sites to use `NEXT_PUBLIC_SCENEVIZ_CDN_BASE_URL` (override already
     exists in `apiConfig.js`) → clean, required eventually. **Recommended.**
  2. Mimic: serve uploads from a hostname and accept the muapi-shaped derivation — no.
Also note: R2 may not support S3 presigned **POST** policy. Fallback that definitely works:
Worker accepts the multipart upload itself (`Request.formData()` → R2 binding, ≤100 MB) and
returns the same `{url, fields}`-shaped response. Decide in Phase A spike.

**Exit:** app pointed at `api.opraiz.com` builds, loads catalog, uploads to R2, generation
returns 501 with a clean message. Zero MuAPI in the network tab.

### Phase B — GPU bridge (text→image)
- RunPod: one `flash` handler (`@Endpoint`) or Hub worker for an SDXL/Flux-class model;
  GPU pool RTX 4090 (cost) or A100 (speed); scale-to-zero; container baked with model or
  network-volume mount (use `runpod-templates` / golden path 05/20).
- Worker: `POST /api/v1/{model-id}` model-map (2–3 ids) → RunPod `/run`; input schema
  translation (contract's exact field names); `/predictions/{id}/result` proxy with status
  mapping `completed|succeeded|success` / `failed|error|cancelled|canceled`, output
  extraction `outputs[0] | url | output.url`.
- Rate limit + meter on the Worker.

**Exit:** `/studio/image` generates end-to-end against Opraiz API. This is the first
billable GPU minute — cap worker count at 1 during bring-up.

### Phase C — breadth + metering
- RunPod endpoints per modality (video/audio/lipsync); webhook → D1 usage rows;
  balance debits on completion; expand model map.
- Client changes (repo, not infra): 5-call-site CDN refactor (above);
  `KEY_SIGNUP_URL` needs an Opraiz key page — **it currently has no env override**
  (contract flagged); add `NEXT_PUBLIC_SCENEVIZ_*` override or change the 3
  byte-identical `apiConfig.js` copies; CSP `connect-src`/`img-src` for new media host.

### Phase D — agents/workflow (separate effort, later)

## 5. Cost model

| Item | Cost |
|---|---|
| CF Workers (API) | free tier likely sufficient to start (3 MB, 100k req/day); paid $5/mo when needed |
| CF D1 / R2 | free allowances cover bring-up; R2 storage ~$0.015/GB-mo, egress $0 |
| RunPod serverless | per-second while a worker holds a job; **$0 idle**. Ballpark RTX 4090 ≈ $0.0005/s ≈ $1.8/h of active generation |
| Bring-up guard | max workers = 1, flash-workers = 0 while debugging |

## 6. Security

- `RUNPOD_API_KEY` = Worker secret only. Never in repo, never in client bundle — all RunPod
  traffic is server-side from the Worker.
- Keys issued by D1; never reuse the RunPod key as a product key.
- R2 bucket public-read for objects only; write path exclusively through the Worker.
- Rate limit per key on the Worker before GPU spend (abuse = direct money).
- Both tokens were pasted into chat: rotate both at the end of Phase A.

## 7. Decisions needed before Phase B

1. **First modality** — recommendation: text→image (`/studio/image`).
2. **Which models** — 2–3 flagship t2i ids; contract lists the catalog.
3. **Credits model** — prepaid credits in D1 (recommended) vs static balance display.
4. **GPU tier** — 4090 (cheap) vs A100 (fast) for image; H100 only if video demands it.
5. **Key page** — where users obtain a Sceneviz key (`KEY_SIGNUP_URL`).

## 8. Risks

| Risk | Mitigation |
|---|---|
| R2 presigned-POST gap | Worker-mediated upload fallback (Phase A spike) |
| Model input-schema drift across 585 ids | Phase-scoped model map; per-id schema tests |
| RunPod cold starts on scale-to-zero | first-request latency seconds→tens of seconds; acceptable for async polling, note in UI if needed |
| Abuse = GPU bill | per-key rate limit + credit floor + max-workers cap |
| Agents/workflow parity gap | deferred explicitly; app shows empty sections, no errors |
