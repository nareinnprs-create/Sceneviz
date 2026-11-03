#!/usr/bin/env node
/**
 * Issue a Sceneviz API key (Phase A; optional WS4 account linkage).
 *
 * Usage:  node api/issue-key.mjs <label> [credits] [account_id]
 * Prints the raw key ONCE. Only its SHA-256 hash is stored in D1.
 * With account_id, the key is linked to that account (dashboard /me lists it).
 * Requires the keys.account_id / keys.key_hint columns (see schema.sql header).
 *
 * Requires: CLOUDFLARE_API_TOKEN in env (or wrangler login), and the D1
 * database `sceneviz` created (see api/wrangler.jsonc).
 */
import { execFileSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const label = process.argv[2] || "";
const credits = Number(process.argv[3] || process.env.DEFAULT_KEY_CREDITS || 500);
const accountId = process.argv[4] || "";

if (!label) {
  console.error("usage: node api/issue-key.mjs <label> [credits] [account_id]");
  process.exit(1);
}

const raw = `sk_live_${randomBytes(24).toString("hex")}`;
const keyHash = createHash("sha256").update(raw).digest("hex");
const id = randomBytes(8).toString("hex");

// key_hint (first 12 chars) is display-only for the dashboard — not a secret.
const sql =
  `INSERT INTO keys (id, key_hash, label, credits, status, key_hint${accountId ? ", account_id" : ""}) VALUES ` +
  `('${id}', '${keyHash}', '${label.replace(/'/g, "''")}', ${credits}, 'active', '${raw.slice(0, 12)}'` +
  `${accountId ? `, '${accountId.replace(/'/g, "''")}'` : ""});`;

// Windows shells re-split arguments, so the SQL goes through a temp file.
const dir = mkdtempSync(join(tmpdir(), "sceneviz-key-"));
const sqlFile = join(dir, "issue.sql");
writeFileSync(sqlFile, sql);
try {
  execFileSync(
    "npx",
    ["wrangler", "d1", "execute", "sceneviz", "--remote", "--file", sqlFile, "-y"],
    { stdio: ["ignore", "pipe", "inherit"], shell: process.platform === "win32" }
  );
} finally {
  rmSync(dir, { recursive: true, force: true });
}

console.log("key:     " + raw);
console.log("label:   " + label);
console.log("credits: " + credits);
console.log("Store it now — it is not recoverable.");
