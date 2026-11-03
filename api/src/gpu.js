/**
 * RunPod serverless bridge (Phase B). Auth via the RUNPOD_API_KEY Worker
 * secret — the key is never logged or returned. 15s timeout on both calls:
 * /run and /status are queue operations, never GPU waits.
 */

const TIMEOUT_MS = 15000;
// Jobs API lives on api.runpod.AI — the api.runpod.io/v2 gateway returns 404.
const BASE = "https://api.runpod.ai/v2";

function headers(env) {
  if (!env.RUNPOD_API_KEY) throw new Error("RUNPOD_API_KEY secret is not set");
  return { authorization: `Bearer ${env.RUNPOD_API_KEY}` };
}

async function runpodFetch(env, url, init) {
  return fetch(url, { ...init, headers: headers(env), signal: AbortSignal.timeout(TIMEOUT_MS) });
}

/** POST /run — enqueue a job. Returns the raw JSON ({id, status, ...}). */
export async function submitJob(env, endpointId, input) {
  const res = await runpodFetch(env, `${BASE}/${endpointId}/run`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ input }),
  });
  if (!res.ok) {
    throw new Error(`RunPod /run ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  return res.json();
}

/** GET /status/{jobId} — returns the raw status JSON. */
export async function getJob(env, endpointId, jobId) {
  const res = await runpodFetch(env, `${BASE}/${endpointId}/status/${encodeURIComponent(jobId)}`);
  if (!res.ok) {
    throw new Error(`RunPod /status ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  return res.json();
}
