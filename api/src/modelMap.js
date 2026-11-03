/**
 * Phase B model map: client catalog endpoint id → RunPod endpoint config.
 *
 * The client posts to `/api/v1/{endpoint}` where endpoint = catalog entry's
 * `endpoint` field (or its `id` when absent) — see packages/studio/src/models.js
 * and muapi.js `generateImage()`. All three ids below share the width/height/
 * num_images input schema; `translate()` converts to the standard SD-worker
 * input the RunPod handler expects.
 *
 * `modelCatalog()` derives the public GET /models payload from this map — it is
 * the single source of truth the UI renders (WS3).
 */

function translate(input) {
  return {
    prompt: input.prompt,
    negative_prompt: input.negative_prompt || "",
    width: input.width || 1024,
    height: input.height || 1024,
    // worker-sdxl expects num_images (1-2), not num_outputs.
    num_images: Math.min(2, Math.max(1, input.num_images || 1)),
    seed: input.seed ?? -1,
  };
}

/** Accepted input fields with types/defaults — mirrors translate() above. */
export const INPUT_PARAMS = [
  { name: "prompt", type: "string", required: true, description: "What to render." },
  { name: "negative_prompt", type: "string", default: "" },
  { name: "width", type: "integer", default: 1024 },
  { name: "height", type: "integer", default: 1024 },
  { name: "num_images", type: "integer", default: 1, minimum: 1, maximum: 2 },
  { name: "seed", type: "integer", default: -1, description: "-1 = random" },
];

export const MODEL_MAP = {
  "flux-dev-image": {
    endpointEnv: "RUNPOD_ENDPOINT_ID_IMAGE",
    costCredits: 4,
    modality: "image",
    translate,
  },
  "flux-schnell-image": {
    endpointEnv: "RUNPOD_ENDPOINT_ID_IMAGE",
    costCredits: 2,
    modality: "image",
    translate,
  },
  "sdxl-image": {
    endpointEnv: "RUNPOD_ENDPOINT_ID_IMAGE",
    costCredits: 2,
    modality: "image",
    translate,
  },
};

/** Public catalog: GET /models (and the MCP list_models tool). */
export function modelCatalog() {
  return {
    models: Object.entries(MODEL_MAP).map(([id, cfg]) => ({
      id,
      modality: cfg.modality || "image",
      cost_credits: cfg.costCredits,
      params: INPUT_PARAMS,
    })),
  };
}
