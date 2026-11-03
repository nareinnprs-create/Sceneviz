/**
 * Minimal streamable-HTTP MCP server (JSON-RPC 2.0). JSON responses only for
 * v1 — no SSE. Auth happens upstream in index.js (x-api-key / Bearer API key);
 * this module never sees credentials. Stateless: no Mcp-Session-Id.
 * Tools: generate_image, get_balance, list_models.
 */
import { MODEL_MAP, modelCatalog, INPUT_PARAMS } from "./modelMap.js";

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
  "access-control-allow-headers": "x-api-key,authorization,content-type",
  "access-control-max-age": "86400",
};

const SERVER_INFO = { name: "sceneviz-api", version: "1.0.0" };
const PROTOCOL_VERSION = "2025-06-18";

function jsonRpc(body) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8", ...CORS },
  });
}

const rpcResult = (id, result) => jsonRpc({ jsonrpc: "2.0", id, result });
const rpcError = (id, code, message) => jsonRpc({ jsonrpc: "2.0", id, error: { code, message } });
// Notifications (no id) get no body — 202 Accepted.
const accepted = () => new Response(null, { status: 202, headers: CORS });

const toolText = (text, isError = false) => ({
  content: [{ type: "text", text }],
  ...(isError ? { isError: true } : {}),
});

const TOOLS = [
  {
    name: "generate_image",
    description:
      "Submit an image generation job. Returns {status:'submitted', request_id}; " +
      "poll GET /api/v1/predictions/{request_id}/result until status is completed or failed.",
    inputSchema: {
      type: "object",
      properties: {
        model: { type: "string", enum: Object.keys(MODEL_MAP), description: "Catalog model id (see list_models)." },
        ...Object.fromEntries(INPUT_PARAMS.map(({ name, required, ...rest }) => [name, rest])),
      },
      required: ["model", "prompt"],
    },
  },
  {
    name: "get_balance",
    description: "Remaining API credits for the authenticated key.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "list_models",
    description: "Models the API can serve, with credit costs and accepted parameters.",
    inputSchema: { type: "object", properties: {} },
  },
];

/**
 * @param {Request} request
 * @param {object} env Worker env
 * @param {object} key authenticated key row (from index.js authenticate)
 * @param {Function} generateCore index.js submit pipeline (env, key, model, body) → Response
 */
export async function handleMcp(request, env, key, generateCore) {
  let msg;
  try {
    msg = await request.json();
  } catch {
    return rpcError(null, -32700, "Parse error");
  }
  const notify = !msg || msg.id === undefined || msg.id === null;
  if (!msg || typeof msg.method !== "string") {
    return notify ? accepted() : rpcError(msg?.id ?? null, -32600, "Invalid Request");
  }

  switch (msg.method) {
    case "initialize":
      if (notify) return accepted();
      return rpcResult(msg.id, {
        protocolVersion:
          typeof msg.params?.protocolVersion === "string" ? msg.params.protocolVersion : PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
      });
    case "tools/list":
      if (notify) return accepted();
      return rpcResult(msg.id, { tools: TOOLS });
    case "tools/call": {
      if (notify) return accepted();
      return await callTool(msg.id, (msg.params || {}).name, (msg.params || {}).arguments || {}, env, key, generateCore);
    }
    default:
      return notify ? accepted() : rpcError(msg.id, -32601, `Method not found: ${msg.method}`);
  }
}

async function callTool(id, name, args, env, key, generateCore) {
  if (name === "get_balance") {
    return rpcResult(id, toolText(JSON.stringify({ balance: key.credits || 0 })));
  }
  if (name === "list_models") {
    return rpcResult(id, toolText(JSON.stringify(modelCatalog())));
  }
  if (name === "generate_image") {
    const model = String(args.model || "");
    if (!MODEL_MAP[model]) {
      return rpcResult(
        id,
        toolText(`Unknown model '${model}'. Served: ${Object.keys(MODEL_MAP).join(", ")}`, true)
      );
    }
    // Same credits + rate limit + history path as POST /api/v1/{model}.
    const res = await generateCore(env, key, model, args);
    const payload = await res.json();
    const d = payload?.detail;
    const errText = typeof d === "string" ? d : d?.error || `HTTP ${res.status}`;
    return rpcResult(id, toolText(res.ok ? JSON.stringify(payload) : errText, !res.ok));
  }
  return rpcResult(id, toolText(`Unknown tool: ${name}`, true));
}
