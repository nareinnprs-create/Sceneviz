// Sceneviz API config — Stage 1 backend binding (MuAPI engine).
// One of three mirrored copies (keep all three byte-identical):
//   lib/apiConfig.js               — Next app (import as '@/lib/apiConfig')
//   src/lib/apiConfig.js           — Vite app (import relative: ../lib/apiConfig)
//   packages/studio/src/apiConfig.js — studio package (import relative: ./apiConfig)
// STAGE 2 FLIP POINT: when Opraiz API goes live, change DEFAULT_API_BASE_URL,
// DEFAULT_KEY_SIGNUP_URL, DEFAULT_MCP_BASE_URL, DEFAULT_DOCS_URL, and
// DEFAULT_CDN_BASE_URL here, or override via env where supported.
// Exports (resolved values, env override else default):
//   API_BASE_URL      — REST backend base URL     (env: NEXT_PUBLIC_SCENEVIZ_API_BASE_URL)
//   KEY_SIGNUP_URL    — key signup page URL       (env: none yet)
//   MCP_BASE_URL      — MCP endpoint base URL     (env: NEXT_PUBLIC_SCENEVIZ_MCP_BASE_URL)
//   DOCS_URL          — docs site URL             (env: NEXT_PUBLIC_SCENEVIZ_DOCS_URL)
//   CDN_BASE_URL      — CDN base URL (exported for future use; no consumers yet)
//                       (env: NEXT_PUBLIC_SCENEVIZ_CDN_BASE_URL)
// Also exported: DEFAULT_API_BASE_URL, DEFAULT_KEY_SIGNUP_URL, DEFAULT_MCP_BASE_URL,
// DEFAULT_DOCS_URL, DEFAULT_CDN_BASE_URL (the un-overridden defaults above).
export const DEFAULT_API_BASE_URL = 'https://api.muapi.ai';
export const DEFAULT_KEY_SIGNUP_URL = 'https://muapi.ai/access-keys';
export const DEFAULT_MCP_BASE_URL = 'https://api.muapi.ai/mcp';
export const DEFAULT_DOCS_URL = 'https://muapi.ai/docs';
export const DEFAULT_CDN_BASE_URL = 'https://cdn.muapi.ai';
export const API_BASE_URL =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SCENEVIZ_API_BASE_URL) ||
    DEFAULT_API_BASE_URL;
export const KEY_SIGNUP_URL = DEFAULT_KEY_SIGNUP_URL;
export const MCP_BASE_URL =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SCENEVIZ_MCP_BASE_URL) ||
    DEFAULT_MCP_BASE_URL;
export const DOCS_URL =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SCENEVIZ_DOCS_URL) ||
    DEFAULT_DOCS_URL;
export const CDN_BASE_URL =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SCENEVIZ_CDN_BASE_URL) ||
    DEFAULT_CDN_BASE_URL;
