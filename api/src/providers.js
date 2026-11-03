/**
 * Provider registry — one adapter per upstream, {submit, poll} each:
 *   submit(env, cfg, input) → {id}          (our opaque job id)
 *   poll(env, cfg, jobId)   → {status, outputs[], error?}
 * `status` uses the contract vocabulary exactly (docs/stage2-api-contract.md
 * §3.1): completed | failed | cancelled terminal, "IN_PROGRESS" otherwise.
 *
 * Secrets are referenced as env.<NAME> only — never literals. Every upstream
 * call is a queue/status operation, so a 15 s timeout is generous.
 */

import { submitJob, getJob } from "./gpu.js";

const TIMEOUT_MS = 15000;

async function jfetch(url, init) {
  return fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
}

/* ----------------------------------------------------------------- runpod */

// worker-sdxl returns data URIs (or {image_url|url|images:[…]}).
function extractRunpodOutputs(out) {
  if (Array.isArray(out)) return out.filter((u) => typeof u === "string");
  if (typeof out === "string") return out ? [out] : [];
  if (out && typeof out === "object") {
    if (Array.isArray(out.images)) return out.images.filter((u) => typeof u === "string");
    const url = out.image_url || out.url;
    return typeof url === "string" ? [url] : [];
  }
  return [];
}

const runpod = {
  async submit(env, cfg, input) {
    const endpointId = env[cfg.endpointEnv];
    if (!endpointId) throw new Error("GPU endpoint not provisioned yet");
    const job = await submitJob(env, endpointId, input);
    if (!job?.id) throw new Error("RunPod did not return a job id");
    return { id: job.id };
  },
  async poll(env, cfg, jobId) {
    const job = await getJob(env, env[cfg.endpointEnv], jobId);
    const s = String(job.status || "").toUpperCase();
    if (s === "COMPLETED") return { status: "completed", outputs: extractRunpodOutputs(job.output) };
    if (s === "FAILED" || s === "TIMED_OUT") {
      return {
        status: "failed",
        outputs: [],
        error: (typeof job.output === "string" && job.output) || `RunPod job ${s.toLowerCase()}`,
      };
    }
    if (s === "CANCELLED") return { status: "cancelled", outputs: [], error: "Job was cancelled" };
    return { status: "IN_PROGRESS", outputs: [] };
  },
};

/* -------------------------------------------------------------------- bfl */

// Black Forest Labs: POST https://api.bfl.ai/{cfg.path} with `x-key` →
// {id, polling_url}; poll GET /v1/get_result?id= → {status, result:{sample}}.
// Status enum: Pending|Reasoning|Generating|Request Moderated|Content
// Moderated|Task not found|Ready|Error.
async function bflPost(env, path, body) {
  if (!env.BFL_API_KEY) throw new Error("BFL_API_KEY secret is not set");
  const res = await jfetch(`https://api.bfl.ai${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-key": env.BFL_API_KEY },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`BFL ${path} ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const out = await res.json();
  if (!out?.id) throw new Error(`BFL did not return a task id: ${JSON.stringify(out).slice(0, 200)}`);
  return out.id;
}

const bfl = {
  // num_images (charging hint, clamped 1-2 upstream in index.js) fans out into
  // N tasks; the job id is the comma-joined task ids.
  async submit(env, cfg, input) {
    const n = Math.max(1, Math.min(2, Number(input.num_images) || 1));
    const ids = [];
    for (let i = 0; i < n; i++) {
      const body = { ...input };
      delete body.num_images;
      if (i > 0 && Number.isInteger(body.seed)) body.seed += i; // vary repeats
      ids.push(await bflPost(env, cfg.path, body));
    }
    return { id: ids.join(",") };
  },
  async poll(env, cfg, jobId) {
    if (!env.BFL_API_KEY) throw new Error("BFL_API_KEY secret is not set");
    const outputs = [];
    for (const id of jobId.split(",")) {
      const res = await jfetch(`https://api.bfl.ai/v1/get_result?id=${encodeURIComponent(id)}`, {
        headers: { "x-key": env.BFL_API_KEY },
      });
      if (!res.ok) throw new Error(`BFL get_result ${res.status}: ${(await res.text()).slice(0, 200)}`);
      const data = await res.json();
      const s = String(data.status || "");
      if (s === "Ready") {
        const sample = data.result?.sample ?? data.result?.image;
        if (typeof sample === "string") outputs.push(sample);
        continue;
      }
      if (s === "Error" || s === "Task not found") {
        return { status: "failed", outputs: [], error: `BFL task ${s.toLowerCase()}` };
      }
      if (s.endsWith("Moderated")) {
        return { status: "failed", outputs: [], error: "Prompt/content was blocked by moderation" };
      }
      return { status: "IN_PROGRESS", outputs: [] }; // Pending | Reasoning | Generating
    }
    return { status: "completed", outputs };
  },
};

/* ------------------------------------------------------------------ kling */

// Kling AI: POST /v1/videos/{text2video|image2video} with Bearer auth →
// {code:0, data:{task_id}}; poll GET /v1/videos/{route}/{task_id} →
// {code:0, data:{task_status: submitted|processing|succeed|failed,
//  task_result:{videos:[{url}]}}}.
const KLING_BASE = "https://api-singapore.klingai.com";

async function klingJson(env, url, init, what) {
  if (!env.KLING_API_KEY) throw new Error("KLING_API_KEY secret is not set");
  const res = await jfetch(url, {
    ...init,
    headers: { "content-type": "application/json", authorization: `Bearer ${env.KLING_API_KEY}` },
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {}
  if (!res.ok || !data || (data.code !== undefined && data.code !== 0)) {
    throw new Error(`Kling ${what} ${res.status}: ${text.slice(0, 200)}`);
  }
  return data;
}

const kling = {
  async submit(env, cfg, input) {
    const body = {
      model_name: cfg.modelName,
      prompt: input.prompt,
      mode: input.mode || cfg.mode || "std",
      duration: String(input.duration || 5),
      aspect_ratio: input.aspect_ratio || "16:9",
    };
    if (input.image) body.image = input.image;
    const data = await klingJson(env, `${KLING_BASE}/v1/videos/${cfg.klingRoute}`, {
      method: "POST",
      body: JSON.stringify(body),
    }, "submit");
    const id = data?.data?.task_id;
    if (!id) throw new Error(`Kling did not return a task id: ${JSON.stringify(data).slice(0, 200)}`);
    return { id };
  },
  async poll(env, cfg, jobId) {
    const data = await klingJson(
      env,
      `${KLING_BASE}/v1/videos/${cfg.klingRoute}/${encodeURIComponent(jobId)}`,
      undefined,
      "status"
    );
    const t = data?.data || {};
    const s = String(t.task_status || "").toLowerCase();
    if (s === "succeed") {
      const vids = Array.isArray(t.task_result?.videos) ? t.task_result.videos : [];
      return { status: "completed", outputs: vids.map((v) => v?.url).filter((u) => typeof u === "string") };
    }
    if (s === "failed") {
      return { status: "failed", outputs: [], error: t.task_status_msg || "Kling job failed" };
    }
    return { status: "IN_PROGRESS", outputs: [] }; // submitted | processing
  },
};

/* -------------------------------------------------------------------- fal */

// Seedance via fal queue: POST https://queue.fal.run/{cfg.endpoint} with
// `Authorization: Key …` → {status, request_id}; poll
// …/requests/{id}/status → {status: IN_QUEUE|IN_PROGRESS|COMPLETED,
// response:{video:{url}}}; result fallback GET …/requests/{id} → {video:{url}}.
async function falJson(env, url, init, what) {
  if (!env.SEEDANCE_API_KEY) throw new Error("SEEDANCE_API_KEY secret is not set");
  const res = await jfetch(url, {
    ...init,
    headers: { "content-type": "application/json", authorization: `Key ${env.SEEDANCE_API_KEY}` },
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {}
  if (!res.ok || !data) throw new Error(`fal ${what} ${res.status}: ${text.slice(0, 200)}`);
  return data;
}

const falVideoUrl = (d) =>
  d?.response?.video?.url ||
  d?.video?.url ||
  (Array.isArray(d?.response?.videos) && d.response.videos[0]?.url) ||
  (Array.isArray(d?.videos) && d.videos[0]?.url) ||
  null;

const fal = {
  async submit(env, cfg, input) {
    const data = await falJson(env, `https://queue.fal.run/${cfg.endpoint}`, {
      method: "POST",
      body: JSON.stringify(input),
    }, "submit");
    const id = data?.request_id || data?.status?.request_id;
    if (!id) throw new Error(`fal did not return a request_id: ${JSON.stringify(data).slice(0, 200)}`);
    return { id };
  },
  async poll(env, cfg, jobId) {
    const base = `https://queue.fal.run/${cfg.endpoint}/requests/${encodeURIComponent(jobId)}`;
    const data = await falJson(env, `${base}/status`, undefined, "status");
    if (String(data.status) !== "COMPLETED") return { status: "IN_PROGRESS", outputs: [] };
    // Video url rides on the status response; result endpoint is the fallback.
    let url = falVideoUrl(data);
    if (!url) url = falVideoUrl(await falJson(env, base, undefined, "result"));
    return { status: "completed", outputs: typeof url === "string" ? [url] : [] };
  },
};

/* ----------------------------------------------------------------- runway */

// Runway: POST /v1/{text_to_video|image_to_video} with Bearer auth +
// X-Runway-Version → {id}; poll GET /v1/tasks/{id} → {status:
// PENDING|THROTTLED|RUNNING|SUCCEEDED|FAILED|CANCELLED, output:[url], failure}.
const RUNWAY_BASE = "https://api.dev.runwayml.com/v1";
const RUNWAY_VERSION = "2024-11-06";
const RUNWAY_RATIO = {
  "16:9": "1280:720",
  "9:16": "720:1280",
  "1:1": "960:960",
  "4:3": "1104:832",
  "3:4": "832:1104",
  "21:9": "1584:672",
};

const runway = {
  async submit(env, cfg, input) {
    if (!env.RUNWAY_API_KEY) throw new Error("RUNWAY_API_KEY secret is not set");
    let ratio = RUNWAY_RATIO[input.aspect_ratio] || "1280:720";
    if (cfg.allowedRatios && !cfg.allowedRatios.includes(ratio)) ratio = cfg.allowedRatios[0];
    const body = {
      model: cfg.modelName,
      promptText: input.prompt,
      ratio,
      duration: Number(input.duration) || 5,
    };
    if (input.image_url) body.promptImage = input.image_url;
    const res = await jfetch(`${RUNWAY_BASE}/${cfg.route}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env.RUNWAY_API_KEY}`,
        "x-runway-version": RUNWAY_VERSION,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Runway ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const out = await res.json();
    if (!out?.id) throw new Error(`Runway did not return a task id: ${JSON.stringify(out).slice(0, 200)}`);
    return { id: out.id };
  },
  async poll(env, cfg, jobId) {
    if (!env.RUNWAY_API_KEY) throw new Error("RUNWAY_API_KEY secret is not set");
    const res = await jfetch(`${RUNWAY_BASE}/tasks/${encodeURIComponent(jobId)}`, {
      headers: {
        authorization: `Bearer ${env.RUNWAY_API_KEY}`,
        "x-runway-version": RUNWAY_VERSION,
      },
    });
    if (!res.ok) throw new Error(`Runway tasks ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const t = await res.json();
    const s = String(t.status || "").toUpperCase();
    if (s === "SUCCEEDED") {
      return {
        status: "completed",
        outputs: (Array.isArray(t.output) ? t.output : []).filter((u) => typeof u === "string"),
      };
    }
    if (s === "FAILED") {
      return { status: "failed", outputs: [], error: t.failure || t.failureCode || "Runway task failed" };
    }
    if (s === "CANCELLED") return { status: "cancelled", outputs: [], error: "Job was cancelled" };
    return { status: "IN_PROGRESS", outputs: [] }; // PENDING | THROTTLED | RUNNING
  },
};

export const PROVIDERS = { runpod, bfl, kling, fal, runway };
