# Sceneviz UI Rebuild — Plan (color theme LOCKED)

Status: **DRAFT — awaiting approval.** Nothing started.
Scope: complete structural rebuild of the frontend. **Visual identity is locked** —
cyan `#16C5D0` / teal `#0E9AA5` / amber `#F2AE43`, obsidian `#101319` / panel `#171C24` /
card `#1E242D` / muted `#818996`, fonts Space Grotesk + Inter + JetBrains Mono.
The rebuild changes layout, information architecture, and code — not the brand look.
Backend: revampsceneviz.md still governs; §C additions below.

---

## 1. Design system (new, tokens unchanged)

One Tailwind theme file (`tailwind.theme.js`) importing the existing CSS vars:
- **Surfaces**: page=obsidian, section=panel, card=card, hairlines `border-white/[0.06]`
- **Accents**: cyan primary, teal secondary, amber for money/CTA highlights
- **Type scale**: display=Space Grotesk (hero/titles/prices), body=Inter,
  mono=JetBrains Mono (keys, code, costs, model ids)
- **Spacing/radius**: 4pt grid, radius `rounded-lg` cards / `rounded-xl` panels
- **Motion**: `animate-fade-in-up` on mount, 150ms hover transitions — no new animation lib
- **Components** (new `components/ui/*`): Button, Card, Panel, Field, Select, Modal,
  Tabs, Badge, Skeleton, Toaster, EmptyState, ErrorState, CopyField, PriceTag
- **i18n**: extend `components/dashboard/i18n.js` into `src/i18n/` (en/zh, whole app)

## 2. Information architecture

```
/                     Landing (hero · live models strip · pricing · how-it-works · CTA)
/studio               Generation workspace — modality tabs:
                        Image (flux-schnell/dev/kontext/sdxl/nano-banana/seedream/qwen/z-image)
                        Video (kling/seedance/runway brands — wired via Runway+RunPod)
                        Audio (chatterbox/minimax — C5)
                      Shared: prompt panel, params drawer (per-model from /models),
                      result pane (image/video/audio player), history strip, sync toggle
/agents               Gallery (templates/yours) · Create/Edit wizard · Chat (suggestions, like)
/workflows            Template gallery · Builder-lite (graph canvas, run, outputs) · Architect
/docs                 API reference + MCP/CLI integration guide
/dashboard            Overview · API Keys · Billing (packs + history) · History · Usage
/legal/privacy,terms  kept
```

Old routes (`/studio/image`, `/zh/studio/...`, 16-tab shell) 301-redirect to the new
canonical routes for one release, then removed.

## 3. New frontend components/pages (the build list)

| Area | Builds |
|---|---|
| Shell | `AppShell` (top nav: Studio/Agents/Workflows/Docs/Dashboard, lang toggle, auth state), `LandingPage` |
| Studio | `GenWorkspace` (modality tabs), `PromptPanel`, `ParamsDrawer` (from `/models` params), `ResultPane` (img/video/audio), `HistoryStrip`, `SyncToggle`, `QuotaBadge` (C2) |
| Agents | `AgentGallery`, `AgentCard`, `AgentWizard` (create/edit), `AgentChat` (suggestions, like, profile) |
| Workflows | `WorkflowGallery`, `BuilderCanvas` (react-flow style graph, drag nodes from `/workflow/node-schemas`), `RunPanel` (per-node status), `ArchitectPanel` |
| Creative | `CreativeChat` (sessions sidebar, messages, events stream via SSE) |
| Dashboard | `Overview`, `ApiKeys`, `Billing` (packs + C1 payment history), `History`, `Usage` (totals + by-model + 7-day) |
| API layer | `lib/api.js` — one typed client: session auth, key auth for studio, error mapping, sync-mode support |

## 4. Backend additions (§C, in dependency order)

| # | Endpoint(s) | Unlocks | Key |
|---|---|---|---|
| C1 | `GET /billing/payments` (own history) | Billing history tab | none |
| C2 | `GET /me/quota` → {window, limit, remaining} | QuotaBadge | none |
| C3 | `PATCH /keys/{id}` (label), `POST /keys/revoke-all` | Keys page completeness | none |
| C4 | LLM adapter (`runpodPublic`, OpenAI-compatible Qwen3) → `/agents/{slug}/chat` real replies, `/workflow/architect` real graphs, prompt-enhance | Kills S1 stub | none (secret set) |
| C5 | Audio: `POST /api/v1/chatterbox-tts`, `/minimax-speech` (+voice clone param) | Audio tab | none (secret set) |
| C6 | Video via runpodPublic: WAN 2.5 t2v/i2v (+audio), seedance-2.5-i2v | Video tab breadth | none (secret set) |
| C7 | Image via runpodPublic: nano-banana-2-edit, seedream-4.0 t2i/edit, qwen-image-edit, flux-kontext-dev, z-image-turbo | Image breadth | none (secret set) |
| C8 | Email (verify/reset/receipts) | Trust flows | **user key** |
| C9 | Admin UI (`/admin` on dashboard, ops-only) | Refunds/bans without CLI | none |

## 4b. Approved additions (N1–N12)

| # | Item | Unlocks | Effort |
|---|---|---|---|
| N1 | **Content moderation** — keyword pre-filter + provider moderation signals on all generation submits (403 with clear code; logged) | Legal/brand protection, ToS enforcement | 3–5 d |
| N2 | **Alerting** — 5xx spike + webhook-failure + job-failure-rate notifications to devops@opraiz.com | Ops visibility | 1–2 d |
| N3 | **GDPR endpoints** — `GET /me/export` (JSON+media manifest), `DELETE /me` (account+keys+sessions+media wipe) | Privacy-policy compliance | 2–3 d |
| N4 | **Per-user in-flight cap** — max 3 non-terminal generations per account | Queue fairness | 0.5 d |
| N5 | **Cloudflare Turnstile** on signup/login | Bot/spam protection, free | 0.5 d |
| N6 | **Queue position + ETA** in poll response (`queue_position`, `eta_seconds`) | Generation UX | 1 d |
| N7 | **Subscriptions + auto-top-up** — Dodo recurring monthly packs (discounted credits), low-balance auto recharge | Recurring revenue | 4–6 d |
| N8 | **Invoices/receipts** — surface Dodo invoice URLs on billing history | Business users | 0.5 d |
| N9 | **Image-to-image everywhere** — input-image support across all image models | Half the image product | 1–2 d |
| N10 | **Upscale endpoint** — RunPod public upscale model | Catalog expectation | 0.5 d |
| N11 | **Help/FAQ + onboarding tour** | Support deflection | 1–2 d |
| N12 | **D1 backup restore drill** — verify Time Travel, document runbook | Insurance verified | 0.5 d |

## 4c. Decisions (new)

## 5. Retirement (P5, after parity)

Delete: `components/StandaloneShell.js`, all 16 old studio tab components,
`components/landing/*` old sections, `packages/studio/src/components/*` (Image/Video/
Audio/Cinema/LipSync/Apps/Agent/Workflow studios, Settings/Auth modals, LocalModelManager),
`packages/Open-Poe-AI/packages/agents/src/*` UIs, `packages/Vibe-Workflow/.../workflow-builder/src/*`
UIs, `packages/Open-AI-Design-Agent/*` UIs, `src/**` + `electron/**` + `index.html` +
`vite.config.mjs` (desktop retired — DECISION D1), `messages/*` (replaced by src/i18n).
Keep: `packages/studio/src/{apiConfig,imageSizing,modelCapabilities}.js` logic if reused.
Redirects: old → new 301s for one release.

## 6. Phases

| Phase | Delivers | Exit criteria | Est. |
|---|---|---|---|
| P0 | Design system + ui components + `lib/api.js` + C1/C2/C3 backend + N4 in-flight cap + N5 Turnstile | Components render in isolation; client typed | 4–5 d |
| P1 | New landing + dashboard (5 pages) + Studio image tab (incl. C7) + old landing/dashboard retired | New user: signup → key → generate → buy, all in new UI | 5–7 d |
| P2 | C4 LLM brains + Agents studio + /docs + MCP page | Agent chat answers with a real LLM; no template note | 4–6 d |
| P2.5 | **Trust & polish**: N1 moderation + N2 alerting + N3 GDPR + N6 queue ETA + N8 invoices + N12 backup drill | No unmoderated generation; ops alerted; GDPR self-serve | 8–11 d |
| P3 | C6 video models + Video tab + Workflows builder-lite + architect + N9 i2i everywhere + N10 upscale | End-to-end video generation in new UI | 6–8 d |
| P4 | C5 audio + Audio tab + Creative workspace + sync/SSE UX + N7 subscriptions/auto-top-up | All four modalities generate in new UI; recurring revenue live | 8–12 d |
| P5 | Retirement deletes + redirects + full i18n + N11 help/FAQ + polish | Zero old-UI files; grep clean | 4–5 d |
| (P6) | Desktop decision + rebuild or retire (D1) | — | 3–5 d |

Total ≈ 6–9 weeks sequential (competitor-parity items add ~8–10 d across P2–P5); P1 alone is a coherent beta launch.

## 7. Decisions needed

| # | Decision | Options | Rec |
|---|---|---|---|
| D1 | Desktop app | Retire (web is the product) / keep + rebuild on new UI | Retire for now, revisit post-GA |
| D2 | Public gallery | Skip / opt-in post-GA | Skip |
| D3 | Old routes | 301 redirects for one release, then gone | approve |
| D4 | Free credits | keep 0 (current) | keep 0 |
| D5 | Video pricing | keep 2.6× proportional | keep |
| D6 | Moderation depth (N1) | keyword pre-filter + provider signals (rec) / ML model | keyword + provider signals first |
| D7 | Free tier + watermarked playground (S1/H5) | approve after P2.5 moderation lands | approve then |

## 4d. Competitor-parity backlog (Higgsfield / Artlist / muapi)

Recommended subset **scheduled**; the rest documented as skip/backlog.

### Scheduled

| # | Feature (source) | Approach | Phase |
|---|---|---|---|
| H1 | Cinematic camera presets (Higgsfield's moat) — dolly/crash-zoom/bullet-time chips | Prompt-template presets + Kling `camera_control` param wired in video tab | P3 |
| H3 | Start+end frame video | Kling i2v `image_tail` exposed in translate + two-image UI | P3 |
| S1 | **Public playground** — try basic models before signup (watermarked, limited) | Anonymous endpoint + watermark + Turnstile; pairs with N1 moderation | P2.5 (needs D7) |
| S2 | **Remix/variation** — "remix this" from history/public outputs | Prefill workspace from any generation row | P4 |
| H6 | Subscriptions + unlimited-tier lever | Already N7/P4; credit amounts aligned to Higgsfield bands (200/1k/3k per mo) | P4 |
| S4 | Per-model SEO pages (muapi's acquisition engine) | `/models/{id}` public pages from modelCatalog | P2 |
| A1 | Licensing page — commercial-rights statement per model license | Legal pass + static page | P2.5 |
| N11 | Help/FAQ + onboarding tour | Static + short coach marks | P5 |
| S7 | Mobile-web responsive audit | P5 polish | P5 |

### Backlog (after GA)

| # | Item | Note |
|---|---|---|
| H2 | One-click motion/effects templates | Effects gallery over i2v |
| H4 | Talking characters (lip-sync + consistent voice) | Needs TTS (P4) + lip-sync provider research |
| H5 | Daily free credits for free tier | Tied to D7 + watermark infra |
| A4 | Projects/collections (folders, favorites) | History organization |
| S3 | Referral/affiliate program | Credits for referrals |
| S5 | Languages beyond en/zh | muapi ships 11 |
| S8 | Runway asset idempotency at scale, veo3.1/Sora 2 provider research | Premium branded video |

### Skipped (documented decision)

H7 proprietary model · A2 music/SFX library · A5 editor plugins · A6 teams · A7 licensed-footage model — out of our lane or long-term R&D.

## 8. Risks

| Risk | Mitigation |
|---|---|
| Big-bang rebuild breaks working flows | Phased; old UI stays live until each phase's parity is verified |
| LLM replies (C4) cost/conversation runaway | per-reply credit charge (2–4 cr) + existing rate limit |
| RunPod public catalog rotation kills a model | modelMap is data — re-route/deploy; UI reads /models so it self-corrects |
| Unmoderated content (N1 gap until P2.5) | P2.5 lands before public marketing push; keyword filter ships first |
| i18n debt | i18n module enforced from P0; no hardcoded strings in new components |
| Retired packages break builds | P5 deletion only after P4 parity; CI guards |
