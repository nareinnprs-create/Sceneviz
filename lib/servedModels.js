/**
 * Client-side registry of endpoints the Opraiz backend can actually serve
 * right now. Everything else in the client catalog (packages/studio/src/
 * models.js — kept as the future/roadmap catalog) must not be offered as
 * selectable or generateable in the UI until it lands here.
 *
 * keep in sync with api/src/modelMap.js (ids + costCredits are mirrored).
 */
export const SERVED_IMAGE_MODELS = [
  { endpoint: "sdxl-image", label: "SDXL", costCredits: 2 },
  { endpoint: "flux-schnell-image", label: "FLUX Schnell", costCredits: 2 },
  { endpoint: "flux-dev-image", label: "FLUX Dev", costCredits: 4 },
];

/**
 * True when a catalog entry's request endpoint (its `endpoint` field, or its
 * `id` when absent — see muapi.js generateImage) is served by the backend.
 */
export function isServedImageEndpoint(endpoint) {
  return SERVED_IMAGE_MODELS.some((served) => served.endpoint === endpoint);
}
