/**
 * Phase B model map: client catalog endpoint id → RunPod endpoint config.
 *
 * The client posts to `/api/v1/{endpoint}` where endpoint = catalog entry's
 * `endpoint` field (or its `id` when absent) — see packages/studio/src/models.js
 * and muapi.js `generateImage()`. All three ids below share the width/height/
 * num_images input schema; `translate()` converts to the standard SD-worker
 * input the RunPod handler expects.
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

export const MODEL_MAP = {
  "flux-dev-image": {
    endpointEnv: "RUNPOD_ENDPOINT_ID_IMAGE",
    costCredits: 4,
    translate,
  },
  "flux-schnell-image": {
    endpointEnv: "RUNPOD_ENDPOINT_ID_IMAGE",
    costCredits: 2,
    translate,
  },
  "sdxl-image": {
    endpointEnv: "RUNPOD_ENDPOINT_ID_IMAGE",
    costCredits: 2,
    translate,
  },
};
