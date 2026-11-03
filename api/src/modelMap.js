/**
 * Model map: client catalog endpoint id → provider + cost + input translation.
 *
 * The client posts to `/api/v1/{endpoint}` where endpoint = catalog entry's
 * `endpoint` field (or its `id` when absent) — see packages/studio/src/models.js.
 * Providers live in src/providers.js ({runpod, bfl, kling, fal, runway}).
 * `translate()` maps catalog input fields to the provider body; it throws on
 * missing required fields (the caller surfaces the message as a 400).
 *
 * Provider endpoint shapes verified against docs.bfl.ml OpenAPI, fal queue
 * OpenAPI (fal.ai/api/openapi/queue/...), docs.dev.runwayml.com OpenAPI and
 * the Kling Open Platform API (2026-11). Pending live probe pass — see
 * README "Live checks".
 *
 * `modelCatalog()` derives the public GET /models payload from this map — the
 * single source of truth the UI renders (WS3).
 */

/** RunPod SD-worker body (worker-sdxl; Phase-A behavior unchanged). */
function sdxlTranslate(input) {
  return {
    prompt: input.prompt,
    negative_prompt: input.negative_prompt || "",
    width: input.width || 1024,
    height: input.height || 1024,
    num_images: Math.min(2, Math.max(1, input.num_images || 1)),
    seed: input.seed ?? -1,
  };
}

function bflDim(v) {
  const n = Number(v) || 1024;
  return Math.min(1440, Math.max(256, Math.round(n / 32) * 32));
}

function bflSeed(input) {
  return Number(input.seed) > 0 ? { seed: Math.floor(Number(input.seed)) } : {};
}

/** BFL dev/klein body: width/height sizing (multiples of 32, 256-1440). */
function bflWHTranslate(input) {
  return {
    prompt: input.prompt,
    width: bflDim(input.width),
    height: bflDim(input.height),
    ...bflSeed(input),
    output_format: "png",
    // charging hint — stripped by the adapter before POST
    num_images: Math.min(2, Math.max(1, input.num_images || 1)),
  };
}

/** BFL kontext body: aspect-ratio sizing, optional input image (i2i). */
function kontextTranslate(input) {
  return {
    prompt: input.prompt,
    ...(input.image_url ? { input_image: String(input.image_url) } : {}),
    ...(input.aspect_ratio ? { aspect_ratio: String(input.aspect_ratio) } : {}),
    ...bflSeed(input),
    output_format: "png",
    num_images: Math.min(2, Math.max(1, input.num_images || 1)),
  };
}

function klingCommon(input, cfgDefaults) {
  return {
    prompt: input.prompt,
    ...(input.image_url ? { image: String(input.image_url) } : {}),
    ...(["16:9", "9:16", "1:1"].includes(input.aspect_ratio)
      ? { aspect_ratio: input.aspect_ratio }
      : cfgDefaults.aspect_ratio
        ? { aspect_ratio: cfgDefaults.aspect_ratio }
        : {}),
    duration: Number(input.duration) === 10 ? 10 : 5,
    ...(["std", "pro"].includes(input.mode) ? { mode: input.mode } : {}),
  };
}

function klingT2VTranslate(input) {
  return klingCommon(input, { aspect_ratio: "16:9" });
}

function klingI2VTranslate(input) {
  if (!input.image_url) throw new Error("Field 'image_url' is required for image-to-video");
  return klingCommon(input, { aspect_ratio: "16:9" });
}

const SEEDANCE_AR = ["21:9", "16:9", "4:3", "1:1", "3:4", "9:16", "9:21"];
const SEEDANCE_RES = ["480p", "720p", "1080p"];
const SEEDANCE_DUR = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

function seedanceCommon(input, dflt, needImage) {
  if (needImage && !input.image_url) throw new Error("Field 'image_url' is required for image-to-video");
  return {
    prompt: input.prompt,
    ...(input.image_url ? { image_url: String(input.image_url) } : {}),
    ...(SEEDANCE_AR.includes(input.aspect_ratio) ? { aspect_ratio: input.aspect_ratio } : {}),
    resolution: SEEDANCE_RES.includes(input.resolution) ? input.resolution : dflt.resolution,
    duration: SEEDANCE_DUR.includes(String(input.duration)) ? String(input.duration) : dflt.duration,
    ...(Number(input.seed) > 0 ? { seed: Math.floor(Number(input.seed)) } : {}),
  };
}

const seedanceT2VTranslate = (input) => seedanceCommon(input, { resolution: "480p", duration: "5" }, false);
const seedanceI2VTranslate = (input) => seedanceCommon(input, { resolution: "480p", duration: "5" }, true);

function runwayTranslate(input) {
  return {
    prompt: input.prompt,
    ...(input.image_url ? { image_url: String(input.image_url) } : {}),
    aspect_ratio: input.aspect_ratio, // adapter maps to Runway ratio tokens
    // Runway accepts any integer 2-10 s
    duration: Math.min(10, Math.max(2, Math.round(Number(input.duration) || 5))),
  };
}

function runwayI2VTranslate(input) {
  if (!input.image_url) throw new Error("Field 'image_url' is required for image-to-video");
  return runwayTranslate(input);
}

/* Accepted input fields per shape — mirror the translate() functions above. */
export const INPUT_PARAMS = [
  { name: "prompt", type: "string", required: true, description: "What to render." },
  { name: "negative_prompt", type: "string", default: "" },
  { name: "width", type: "integer", default: 1024 },
  { name: "height", type: "integer", default: 1024 },
  { name: "num_images", type: "integer", default: 1, minimum: 1, maximum: 2 },
  { name: "seed", type: "integer", default: -1, description: "-1 = random" },
];

const IMAGE_WH_PARAMS = INPUT_PARAMS;
const IMAGE_AR_PARAMS = [
  { name: "prompt", type: "string", required: true },
  { name: "aspect_ratio", type: "string", default: "1:1", description: "21:9 … 9:21." },
  { name: "image_url", type: "string", description: "Optional input image (i2i edit)." },
  { name: "num_images", type: "integer", default: 1, minimum: 1, maximum: 2 },
  { name: "seed", type: "integer", default: -1 },
];
const VIDEO_T2V_PARAMS = [
  { name: "prompt", type: "string", required: true },
  { name: "aspect_ratio", type: "string", default: "16:9" },
  { name: "duration", type: "integer", default: 5, description: "Seconds (5 or 10)." },
];
const VIDEO_I2V_PARAMS = [
  ...VIDEO_T2V_PARAMS.slice(0, 1),
  { name: "image_url", type: "string", required: true, description: "Start frame." },
  ...VIDEO_T2V_PARAMS.slice(1),
];
const SEEDANCE_PARAMS = [
  { name: "prompt", type: "string", required: true },
  { name: "aspect_ratio", type: "string", default: "16:9" },
  { name: "resolution", type: "string", default: "480p", enum: SEEDANCE_RES },
  { name: "duration", type: "integer", default: 5, description: "2-12 s." },
  { name: "seed", type: "integer", default: -1 },
];
const SEEDANCE_I2V_PARAMS = [
  { name: "prompt", type: "string", required: true },
  { name: "image_url", type: "string", required: true, description: "Start frame." },
  { name: "resolution", type: "string", default: "480p", enum: SEEDANCE_RES },
  { name: "duration", type: "integer", default: 5, description: "2-12 s." },
  { name: "seed", type: "integer", default: -1 },
];

/**
 * Credit costs come from the pricing engine (src/pricing.js): upstream cost ×
 * 2.4 markup, computed at import so /models, estimates and charges can never
 * drift apart. Entries without an upstream entry keep their static value.
 */
export const MODEL_MAP = {
  // --- images -------------------------------------------------------------
  "flux-dev-image": {
    provider: "runpodPublic",
    slug: "black-forest-labs-flux-1-dev",
    costCredits: 9, // $0.02/MP × ~1.05 MP, markup 2.4
    modality: "image",
    params: IMAGE_WH_PARAMS,
    translate: bflWHTranslate,
  },
  // FLUX.1 schnell is retired from the BFL API; the cheapest/fastest live
  // model (FLUX.2 klein 4b) serves this catalog id. Same prompt/w/h schema.
  "flux-schnell-image": {
    provider: "runpodPublic",
    slug: "black-forest-labs-flux-1-schnell",
    costCredits: 1, // $0.0024/MP × ~1.05 MP, markup 2.4
    modality: "image",
    params: IMAGE_WH_PARAMS,
    translate: bflWHTranslate,
  },
  "flux-kontext-pro-t2i": {
    provider: "runpodPublic",
    slug: "black-forest-labs-flux-kontext-dev",
    costCredits: 9,
    modality: "image",
    params: IMAGE_AR_PARAMS,
    translate: kontextTranslate,
  },
  "flux-kontext-max-t2i": {
    provider: "runpodPublic",
    slug: "black-forest-labs-flux-kontext-dev",
    costCredits: 9,
    modality: "image",
    params: IMAGE_AR_PARAMS,
    translate: kontextTranslate,
  },
  "sdxl-image": {
    provider: "runpodPublic",
    slug: "black-forest-labs-flux-1-schnell",
    costCredits: 1,
    modality: "image",
    params: IMAGE_WH_PARAMS,
    translate: bflWHTranslate,
  },

  // --- kling via Runway aggregator ------------------------------------------
  // Kling's own API needs a funded balance, and its 2.1 line retired (Sept
  // 2026). Runway's text_to_video accepts kling-branded models with the same
  // submit/poll shape, so the catalog's Kling endpoints route there until the
  // Kling account is topped up. i2v entries upload the input image through
  // the Runway assets flow inside the adapter. Credit cost is proportional
  // to duration (priced at the 5s base).
  "kling-v2.1-master-t2v": {
    provider: "runway",
    route: "text_to_video",
    modelName: "kling3.0_standard",
    allowedRatios: ["1280:720", "720:1280"],
    costCredits: 80,
    durationProportional: true,
    modality: "video",
    params: VIDEO_T2V_PARAMS,
    translate: runwayTranslate,
  },
  "kling-v2.1-master-i2v": {
    provider: "runway",
    route: "image_to_video",
    modelName: "gen4_turbo",
    costCredits: 80,
    durationProportional: true,
    modality: "video",
    params: VIDEO_I2V_PARAMS,
    translate: runwayI2VTranslate,
  },
  "kling-v2.5-turbo-pro-t2v": {
    provider: "runway",
    route: "text_to_video",
    modelName: "kling3.0_pro",
    allowedRatios: ["1280:720", "720:1280"],
    costCredits: 100,
    durationProportional: true,
    modality: "video",
    params: VIDEO_T2V_PARAMS,
    translate: runwayTranslate,
  },

  // --- seedance via Runway aggregator ----------------------------------------
  // fal key lacks app access for fal-ai/bytedance; Runway sells seedance2.
  "seedance-pro-t2v": {
    provider: "runway",
    route: "text_to_video",
    modelName: "seedance2",
    allowedRatios: ["1280:720", "720:1280"],
    costCredits: 60,
    durationProportional: true,
    modality: "video",
    params: SEEDANCE_PARAMS,
    translate: runwayTranslate,
  },
  "seedance-lite-t2v": {
    provider: "runway",
    route: "text_to_video",
    modelName: "seedance2_fast",
    allowedRatios: ["1280:720", "720:1280"],
    costCredits: 60,
    durationProportional: true,
    modality: "video",
    params: SEEDANCE_PARAMS,
    translate: runwayTranslate,
  },
  "seedance-pro-i2v": {
    provider: "runway",
    route: "image_to_video",
    modelName: "gen4_turbo",
    costCredits: 60,
    durationProportional: true,
    modality: "video",
    params: SEEDANCE_I2V_PARAMS,
    translate: runwayI2VTranslate,
  },

  // --- runway ----------------------------------------------------------------
  // gen4.5 is the current documented text_to_video model (gen3a_turbo was
  // retired from t2v); gen4_turbo serves image_to_video.
  "runway-text-to-video": {
    provider: "runway",
    route: "text_to_video",
    modelName: "gen4.5",
    allowedRatios: ["1280:720", "720:1280"],
    costCredits: 90,
    durationProportional: true,
    modality: "video",
    params: VIDEO_T2V_PARAMS,
    translate: runwayTranslate,
  },
  "runway-image-to-video": {
    provider: "runway",
    route: "image_to_video",
    modelName: "gen4_turbo",
    costCredits: 90,
    durationProportional: true,
    modality: "video",
    params: VIDEO_I2V_PARAMS,
    translate: runwayI2VTranslate,
  },
};

// Pricing engine overrides the static costs above (see src/pricing.js).
import { baseCredits } from "./pricing.js";
for (const [id, cfg] of Object.entries(MODEL_MAP)) {
  cfg.costCredits = baseCredits(id, cfg.costCredits);
}

/**
 * Credit cost for a request - the single formula generateCore charges with and
 * the /workflow cost endpoints quote: per-image tiers charge num_images
 * (clamped 1-2), video tiers scale with duration (anchored at the 5s base).
 */
export function costFor(cfg, body) {
  const numImages = Math.min(2, Math.max(1, Number(body.num_images) || 1));
  const durationFactor = cfg.durationProportional
    ? Math.min(4, Math.max(1, Math.ceil((Number(body.duration) || 5) / 5)))
    : 1;
  return cfg.costCredits * numImages * durationFactor;
}

/** Public catalog: GET /models (and the MCP list_models tool). */
export function modelCatalog() {
  return {
    models: Object.entries(MODEL_MAP).map(([id, cfg]) => ({
      id,
      modality: cfg.modality || "image",
      provider: cfg.provider,
      cost_credits: cfg.costCredits,
      params: cfg.params || INPUT_PARAMS,
    })),
  };
}
