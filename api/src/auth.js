/**
 * Account auth primitives (WS4): PBKDF2 password hashing + session tokens.
 * WebCrypto only (Workers runtime — no node:crypto). Only hashes are ever
 * stored in D1: passwords as `salt:hash` hex (PBKDF2-SHA256), session tokens
 * and API keys as SHA-256 digests.
 */

export const PBKDF2_ITERATIONS = 100000;
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function randomHex(bytes) {
  return [...crypto.getRandomValues(new Uint8Array(bytes))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function toHex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function deriveBits(password, salt) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  return crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: PBKDF2_ITERATIONS }, key, 256);
}

/** `salt:hash` hex — 16-byte random salt, 256-bit PBKDF2-SHA256 digest. */
export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `${toHex(salt)}:${toHex(await deriveBits(password, salt))}`;
}

/** Re-derives with the stored salt and compares digests (raw text never stored). */
export async function verifyPassword(password, stored) {
  const [saltHex, hashHex] = String(stored || "").split(":");
  if (!saltHex || !hashHex) return false;
  const salt = Uint8Array.from(saltHex.match(/.{2}/g).map((h) => parseInt(h, 16)));
  const candidate = toHex(await deriveBits(password, salt));
  return candidate.length === hashHex.length && candidate === hashHex;
}

/** Mints a 32-byte session token; only its SHA-256 goes into D1. */
export async function createSession(env, accountId) {
  const token = randomHex(32);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  await env.DB.prepare("INSERT INTO sessions (token_hash, account_id, expires_at) VALUES (?, ?, ?)")
    .bind(await sha256Hex(token), accountId, expiresAt)
    .run();
  return { token, expiresAt };
}

/** Resolves a raw session token to its account; null when unknown or expired. */
export async function getSession(env, token) {
  const row = await env.DB.prepare(
    `SELECT s.token_hash, s.account_id, s.expires_at, a.email, a.credits, a.status, a.created_at
     FROM sessions s JOIN accounts a ON a.id = s.account_id WHERE s.token_hash = ?`
  )
    .bind(await sha256Hex(token))
    .first();
  if (!row) return null;
  if (String(row.expires_at) <= new Date().toISOString()) return null; // expired
  return {
    id: row.account_id,
    email: row.email,
    credits: row.credits,
    status: row.status,
    created_at: row.created_at,
    token_hash: row.token_hash,
  };
}

export async function deleteSession(env, tokenHash) {
  await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
}
