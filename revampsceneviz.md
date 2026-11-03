# Sceneviz Revamp — Full Parity Plan (Option B)

Status: **DRAFT — awaiting approval.** Nothing here is started.
Baseline truth: today only `/studio/image` works end-to-end with 3 t2i models on one
RunPod SDXL worker. Everything else in the product surface errors. This plan closes that
gap to muapi-class parity and re-launches as a real product.

Target definition of done: **every advertised studio works, users can sign up, pay,
generate, see history, and the site does not promise anything that 404s.**

---

## 1. Workstreams

### WS1 — Storage & media pipeline (foundation for everything)
R2 bucket `sceneviz-media` + `media.opraiz.com` custom domain (public read).
- Uploads: `GET /app/get_file_upload_url` → presign (R2 S3 API) **or** Worker-mediated
  multipart (fallback already specced in the Worker). Decide in a 1-day spike.
- **Outputs:** Worker stores every generated image/video/audio in R2, returns real
  `https://media.opraiz.com/...` URLs. Kills the data-URI hack.
- Lifecycle: output objects expire after N days (config; default 30) unless saved to
  user history; uploads expire 24h if unreferenced.
- i2i unlocks automatically: all 3 image models gain input-image support.

### WS2 — Model breadth (the actual product)
RunPod serverless endpoints per modality, added incrementally, each behind the same
`modelMap` + contract (submit → poll → hosted output):

| Modality | Endpoint | Candidate workers | GPU tier |
|---|---|---|---|
| t2i (have) | image | worker-sdxl (live) | 4090 |
| i2i / inpaint | image | extend worker-sdxl or add diffusers-worker | 4090 |
| t2v / i2v | video | WAN / LTX-Video / Hunyuan worker | A100 / H100 |
| tts + voice clone | audio | XTTS / F5-TTS / minimax-class worker | 4090 |
| lipsync | video | latentsync / sonic class worker | A100 |
| upscale / recast | image | SD-upscale / CLAUDE-free diffusion tooling | 4090 |

Model expansion policy: each new model = modelMap entry + input translation + a live
generation test + UI metadata. Target **15–25 genuinely working models** at re-launch
(not 585 fake ones) across the 4 studios that matter: image, video, audio, lipsync.

### WS3 — Catalog/UI alignment (kills the "mess" feeling)
- Filter every studio's model dropdown to served models only; everything else hidden
  until it works (single source: the API's `/api/v1/models` becomes the catalog the UI
  renders, so UI can never advertise a model the backend can't serve).
- Per-model param panels: render only inputs the backend accepts (no dead LoRA/mask/
  enhance controls).
- Honest counts everywhere: "500+ models" → real number; README, i18n, index.html.

### WS4 — Accounts, keys, billing (the big new build)
- **Auth:** email + password (D1) + magic-link verification; sessions via HttpOnly
  cookie; keys scoped to accounts. No third-party auth provider needed for v1.
- **Self-serve keys:** dashboard at `sceneviz.opraiz.com/dashboard` — create/revoke keys,
  see balance + usage. `KEY_SIGNUP_URL` → `/dashboard` (kills the homepage placeholder).
- **Payments:** prepaid credits. Provider decision needed (see §5). Webhook → D1 ledger.
  Credit costs per model already in `modelMap` (extend per new model).
- **Admin:** tiny internal CLI/dashboard for refunds, bans, credit grants.
- This workstream replaces the BYOK flow — the last muapi-shaped UX.

### WS5 — History & gallery
- `generations` table (D1): key/account, model, inputs, output URLs, cost, status, created.
- Studio-side "Recent" strip per studio + `/dashboard/history` with re-download.
- Optional public gallery (opt-in per generation) — deferred unless wanted.

### WS6 — Agents / workflows / creative-agent parity
The 54 endpoints of business logic (17 agents + 23 workflow + 14 creative-agent). This is
a second backend app, not GPU work. Options:
- **B1 (recommended):** port to a second Worker (`sceneviz-app-api`) on Durable Objects
  for conversation/workflow state, reusing the same auth + D1. 
- **B2:** run the existing FastAPI codebase on a RunPod CPU pod behind the Worker.
Sequenced LAST — image/video/audio/lipsync ship first.

### WS7 — MCP + CLI
Real `/mcp` streamable-HTTP endpoint on the API Worker (the repo already contains a
client for it), so McpCliStudio stops being dead code. CLI ships later.

### WS8 — Reliability engineering (production readiness)
- **Tests:** API contract tests (every endpoint, auth 401/403, rate limit, credits),
  run locally before deploy; one Playwright happy-path E2E (generate image in studio).
- **CI:** GitHub Actions — lint, build, contract tests, `wrangler deploy --dry-run` on PR.
- **Staging:** `staging.opraiz.com` (web) + `api.staging.opraiz.com` — same pipeline,
  separate D1/R2/keys; prod deploys only from main after green.
- **Alerts:** CF notifications on 5xx spike + RunPod job-failure rate; daily credit-ledger
  sanity job.
- **Capacity:** workersMax 2–4 per endpoint (spend-controlled), queue-delay scaler tuned;
  cold-start mitigation via workersStandby = 1 on the image endpoint.

### WS9 — Error UX & polish
- Friendly mapped errors (quota, rate limit, model busy, content-flagged) in all studios.
- zh parity for every new surface (dashboard, history, errors).
- Docs site: public API reference + quickstart at `docs.opraiz.com` (Workers Pages).

### WS10 — Desktop
- Code-signing cert (purchase + OV validation) → signed installers, no SmartScreen wall.
- Auto-update: publish `latest.yml` + artifacts to R2, electron-updater pointed at it.
- Align the Vite desktop surface with the web app's current studios or scope desktop to
  image/video/audio only — decision needed (§5).

### WS11 — Marketing truth & launch
- Landing copy: real model count, per-studio availability badges, beta→GA wording.
- Remove McpCliStudio marketing until WS7 ships; sitemap/robots reflect real pages.
- Launch checklist run: routes, CSP, no upstream brands, admin flows, refund flow.

---

## 1b. Key & provider architecture (one master key)

The user-facing model is **one key, one balance, one bill**:

```
user (sk_live_…) ──> api.opraiz.com Worker
                       ├─ auth + credits + rate limit   (D1)
                       ├─ modelMap: model-id → provider + endpoint
                       │     provider keys = Worker SECRETS, never client-visible:
                       │     RUNPOD_API_KEY, and later FAL_KEY / REPLICATE_TOKEN /
                       │     ELEVENLABS_KEY / etc. as providers are added
                       └─ provider "adapters" per provider type (run / poll shapes)
```

- The Sceneviz key authenticates **only** to `api.opraiz.com`. It is the single credential
  a user ever sees — no provider keys in the frontend, in localStorage, or in flight to
  the browser. This kills the BYOK flow (and its muapi-shaped UX) entirely.
- `modelMap` entries gain a `provider` field; `gpu.js` becomes a thin provider registry
  (submit/poll per provider type) instead of RunPod-only.
- Credits decouple user pricing from provider pricing — provider rate changes are absorbed
  server-side without any client or contract change.
- Account keys are issued by WS4 (self-serve). Until M2 lands, the manually-issued
  `sk_live_` keys keep working unchanged — no migration break.
- Provider keys live only as Worker secrets (`wrangler secret put`), rotated independently
  of user keys; a leaked provider key never exposes user data, and vice versa.

---


## 2. Milestones (each exits green on staging, then prod)

| M | Scope | Exit criteria | Rough effort |
|---|---|---|---|
| M0 | R2 live, hosted outputs, uploads, i2i on 3 image models, history v1 | i2i generation stores + serves a real https URL; history row visible | 3–5 days |
| M1 | Catalog/UI alignment + friendly errors + honest copy | No UI element can trigger a request the backend can't serve | 2–3 days |
| M2 | Accounts + self-serve keys + dashboard | Sign up → verify → key → generate → see usage, no human in the loop | 5–8 days |
| M3 | Payments (prepaid credits) + admin CLI | Buy credits → balance updates → generate debits → refund works | 3–5 days |
| M4 | Video + audio endpoints & studios | t2v and tts work end-to-end with hosted outputs | 5–10 days (model-queue dependent) |
| M5 | Lipsync + upscale + gallery + MCP | Advertised studios all functional; MCP live | 5–8 days |
| M6 | Reliability: tests, CI, staging, alerts, capacity | Green CI gates deploys; staging exists; alerts fire in a drill | 4–6 days |
| M7 | Agents/workflows/creative-agent parity | All advertised tabs functional | 10–15 days |
| M8 | Desktop: signing, updates, surface alignment | Signed installer, silent updates | 3–5 days + cert lead time |
| M9 | Docs site + launch checklist + GA | Everything advertised works; docs live | 2–3 days |

M0–M3 ≈ 2–3 weeks of focused work → that is the honest "production ready" bar.
M4–M5 add real breadth; M7 is the long tail.

---

## 3. Cost model (monthly, steady-state estimates)

| Item | Est |
|---|---|
| CF Workers paid (API + web + staging) | $5–10 |
| R2 storage (outputs + uploads, 30-day expiry) | $1–5 |
| D1 | free tier likely |
| RunPod 4090 image (active only) | $0.34/hr × usage — e.g. 100 hrs ≈ $34 |
| RunPod A100/H100 video+lipsync | $1–2/hr × usage — the dominant cost; cap per-model concurrency |
| Code-signing cert | ~$100–400/yr one-off |

RunPod spend is usage-based; caps protect against abuse (rate limit + credits + max workers).

---

## 4. Explicitly out of scope (say no)
- 585-model parity — catalog grows only as fast as models are verified working.
- Mobile apps.
- Team/multi-seat accounts (single-user accounts only for now).
- Fine-tuning / training products.
- Public gallery moderation tooling (unless opt-in gallery is approved).

---

## 5. Decisions needed from you

| # | Decision | Options | Recommendation |
|---|---|---|---|
| D1 | Payment provider | Stripe (intl cards) / Razorpay (India + UPI) / both | Razorpay first if India-first, else Stripe |
| D2 | Auth | email+password D1 (rec) / magic-link-only / OAuth (Google) | email+password + optional Google later |
| D3 | Video models first pick | WAN 2.2 / LTX / Hunyuan / Sora-class via available workers | WAN 2.2 (quality/cost balance) |
| D4 | GPU budget cap | hard monthly ceiling in RunPod dashboard + per-endpoint workersMax | set ceiling now, e.g. $200/mo |
| D5 | Staging domains | staging.opraiz.com + api.staging.opraiz.com | approve as named |
| D6 | Desktop surface | align Vite app to web studios / scope desktop to media studios | scope desktop to image/video/audio |
| D7 | Public gallery | opt-in now / skip | skip at M5, revisit post-GA |
| D8 | Agents/workflow approach | second Worker (B1, rec) / FastAPI on CPU pod (B2) | B1 |
| D9 | Timeline acceptance | M0–M3 (2–3 wks) then GA as "beta"; full parity at M7 | GA-beta after M3, iterate |

---

## 6. Risks

| Risk | Mitigation |
|---|---|
| Video model quality/cost surprises | evaluate 2–3 workers per modality before committing; hard per-job credit pricing |
| Payments/abuse → GPU drain | credits first, rate limits, max-workers caps, anomaly alert |
| Scope creep into 585-model parity | model-add policy: verified-by-test or it doesn't ship |
| Single-region D1/R2 latency | acceptable for v1; multi-region is post-GA |
| FastAPI parity depth in WS6 | B1 ports behavior, not code; agents UX will differ where upstream logic was provider-coupled — accept and document |
| Electron signing lead time | order cert at M0 so M8 isn't blocked |

---

## 7. Approval gate

Reply with: **"approved, start M0"** plus answers to D1–D9 (or "use your recommendations")
and work begins with R2 wiring + storage pipeline on a `revamp/*` branch.
