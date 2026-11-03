/**
 * Pricing engine (revampsceneviz.md §1b): charge = upstream cost × MARKUP,
 * rounded up to whole credits. MARKUP 2.4 covers Dodo MoR fees (~5–8%) and
 * yields ~50% net margin at tier-discounted rates (~55%+ at list).
 *
 * Upstream numbers are estimates from provider pricing — Runway does not
 * publish per-model costs. Calibrate via `node scripts/admin.mjs margin`.
 */

const MARKUP = 2.4;
const CREDIT_CENTS = 0.6; // $0.006 per credit ($2.99 / 500)

const UPSTREAM_CENTS = {
  // images
  "flux-dev-image": 2.5, // BFL FLUX.1 dev
  "flux-schnell-image": 1, // BFL FLUX.2 klein 4b (cheapest)
  "flux-kontext-pro-t2i": 4,
  "flux-kontext-max-t2i": 8,
  "sdxl-image": 1, // RunPod 4090 worker, ~8s warm + cold-start amortization
  // video (5-second base; duration scaling multiplies)
  "kling-v2.1-master-t2v": 45, // served via Runway (kling3.0_standard)
  "kling-v2.1-master-i2v": 45,
  "kling-v2.5-turbo-pro-t2v": 65, // kling3.0_pro
  "seedance-pro-t2v": 50, // seedance2
  "seedance-lite-t2v": 30, // seedance2_fast
  "seedance-pro-i2v": 45,
  "runway-text-to-video": 60, // gen4.5
  "runway-image-to-video": 45, // gen4_turbo
};

/** Base credits for one unit (1 image / 5s video) — markup-applied, min 1. */
export function baseCredits(modelId, fallback) {
  const u = UPSTREAM_CENTS[modelId];
  if (u === undefined) return fallback;
  return Math.max(1, Math.ceil((u * MARKUP) / CREDIT_CENTS));
}
