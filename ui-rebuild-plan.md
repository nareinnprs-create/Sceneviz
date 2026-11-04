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
| P0 | Design system + ui components + `lib/api.js` + C1/C2/C3 backend | Components render in isolation; client typed | 3–4 d |
| P1 | New landing + dashboard (5 pages) + Studio image tab (incl. C7) + old landing/dashboard retired | New user: signup → key → generate → buy, all in new UI | 5–7 d |
| P2 | C4 LLM brains + Agents studio + /docs + MCP page | Agent chat answers with a real LLM; no template note | 4–6 d |
| P3 | C6 video models + Video tab + Workflows builder-lite + architect | End-to-end video generation in new UI | 5–7 d |
| P4 | C5 audio + Audio tab + Creative workspace + sync/SSE UX | All four modalities generate in new UI | 4–6 d |
| P5 | Retirement deletes + redirects + full i18n + polish | Zero old-UI files; grep clean | 3–4 d |
| (P6) | Desktop decision + rebuild or retire (D1) | — | 3–5 d |

Total ≈ 4–6 weeks sequential; P1 alone is a coherent beta launch.

## 7. Decisions needed

| # | Decision | Options | Rec |
|---|---|---|---|
| D1 | Desktop app | Retire (web is the product) / keep + rebuild on new UI | Retire for now, revisit post-GA |
| D2 | Public gallery | Skip / opt-in post-GA | Skip |
| D3 | Old routes | 301 redirects for one release, then gone | approve |
| D4 | Free credits | keep 0 (current) | keep 0 |
| D5 | Video pricing | keep 2.6× proportional | keep |

## 8. Risks

| Risk | Mitigation |
|---|---|
| Big-bang rebuild breaks working flows | Phased; old UI stays live until each phase's parity is verified |
| LLM replies (C4) cost/conversation runaway | per-reply credit charge (2–4 cr) + existing rate limit |
| RunPod public catalog rotation kills a model | modelMap is data — re-route/deploy; UI reads /models so it self-corrects |
| i18n debt | i18n module enforced from P0; no hardcoded strings in new components |
| Retired packages break builds | P5 deletion only after P4 parity; CI guards |
