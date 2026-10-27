#!/usr/bin/env node
/**
 * Issue a Sceneviz API key (Phase A).
 *
 * Usage:  node api/issue-key.mjs <label> [credits]
 * Prints the raw key ONCE. Only its SHA-256 hash is stored in D1.
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

if (!label) {
  console.error("usage: node api/issue-key.mjs <label> [credits]");
  process.exit(1);
}

const raw = `sk_live_${randomBytes(24).toString("hex")}`;
const keyHash = createHash("sha256").update(raw).digest("hex");
const id = randomBytes(8).toString("hex");

const sql =
  `INSERT INTO keys (id, key_hash, label, credits, status) VALUES ` +
  `('${id}', '${keyHash}', '${label.replace(/'/g, "''")}', ${credits}, 'active');`;

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
