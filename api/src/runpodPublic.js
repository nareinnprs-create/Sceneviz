/**
 * RunPod Public Endpoints adapter — hosted models billed per output, zero
 * idle cost (unlike our private worker which had a 24/7 standby charge).
 * Submit: POST https://api.runpod.ai/v2/{slug}/run {input:{...}} → {id}
 * Poll:   GET  https://api.runpod.ai/v2/{slug}/status/{id} → {status, output}
 * Docs: docs.runpod.io/public-endpoints — output shapes vary per model;
 * extractOutputs handles image_url / images[] / output strings.
 */
const BASE = "https://api.runpod.ai/v2";

const headers = (env) => {
  if (!env.RUNPOD_API_KEY) throw new Error("RUNPOD_API_KEY secret is not set");
  return { authorization: `Bearer ${env.RUNPOD_API_KEY}`, "content-type": "application/json" };
};

export const runpodPublic = {
  async submit(env, cfg, input) {
    const res = await fetch(`${BASE}/${cfg.slug}/run`, {
      method: "POST",
      headers: headers(env),
      body: JSON.stringify({ input }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`RunPod public ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const out = await res.json();
    if (!out?.id) throw new Error(`RunPod public did not return a job id: ${JSON.stringify(out).slice(0, 200)}`);
    return { id: out.id };
  },
  async poll(env, cfg, jobId) {
    const res = await fetch(`${BASE}/${cfg.slug}/status/${encodeURIComponent(jobId)}`, {
      headers: headers(env),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`RunPod public status ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const job = await res.json();
    const s = String(job.status || "").toUpperCase();
    let status = "IN_PROGRESS";
    let error;
    if (s === "COMPLETED") status = "completed";
    else if (s === "FAILED" || s === "TIMED_OUT" || s === "CANCELLED") {
      status = "failed";
      error = (typeof job.output === "string" && job.output) || `RunPod job ${s.toLowerCase()}`;
    }
    return { status, error, outputs: extractOutputs(job.output) };
  },
};

function extractOutputs(out) {
  if (Array.isArray(out)) return out.filter((u) => typeof u === "string");
  if (typeof out === "string") return out ? [out] : [];
  if (out && typeof out === "object") {
    if (typeof out.image_url === "string") return [out.image_url];
    if (Array.isArray(out.images)) return out.images.filter((u) => typeof u === "string");
    if (typeof out.url === "string") return [out.url];
    const strings = Object.values(out).filter((v) => typeof v === "string" && /^(https?:|data:)/.test(v));
    return strings;
  }
  return [];
}
