#!/usr/bin/env node
/**
 * Sceneviz admin CLI — account operations straight against D1.
 *
 * Usage:
 *   node scripts/admin.mjs grant <email> <credits>
 *   node scripts/admin.mjs ban <email>
 *   node scripts/admin.mjs unban <email>
 *   node scripts/admin.mjs reset-link <email>     # prints one-time reset token
 *   node scripts/admin.mjs stats
 *   node scripts/admin.mjs payments [email]
 *
 * Requires CLOUDFLARE_API_TOKEN with D1 access in env.
 */
import { execFileSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [cmd, email, amount] = process.argv.slice(2);

function runSql(sql) {
  const dir = mkdtempSync(join(tmpdir(), "sceneviz-admin-"));
  const file = join(dir, "stmt.sql");
  writeFileSync(file, sql);
  try {
    const out = execFileSync(
      "npx",
      ["wrangler", "d1", "execute", "sceneviz", "--remote", "--json", "--file", file, "-y"],
      { stdio: ["ignore", "pipe", "inherit"], shell: process.platform === "win32" }
    );
    return JSON.parse(out.toString());
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const esc = (s) => String(s).replace(/'/g, "''");

try {
  if (cmd === "grant" && email && Number(amount) > 0) {
    const ledgerId = randomBytes(8).toString("hex");
    const sql =
      `WITH acc AS (SELECT id FROM accounts WHERE email='${esc(email)}') ` +
      `INSERT INTO credit_ledger (id, account_id, delta, reason) ` +
      `SELECT '${ledgerId}', id, ${Number(amount)}, 'admin:grant' FROM acc; ` +
      `UPDATE accounts SET credits = credits + ${Number(amount)} ` +
      `WHERE email='${esc(email)}'; ` +
      `UPDATE keys SET credits = credits + ${Number(amount)} ` +
      `WHERE status='active' AND account_id IN (SELECT id FROM accounts WHERE email='${esc(email)}');`;
    runSql(sql);
    console.log(`Granted ${amount} credits to ${email}.`);
  } else if ((cmd === "ban" || cmd === "unban") && email) {
    const status = cmd === "ban" ? "disabled" : "active";
    runSql(`UPDATE accounts SET status='${status}' WHERE email='${esc(email)}';`);
    if (cmd === "ban") {
      runSql(`UPDATE keys SET status='disabled' WHERE account_id IN (SELECT id FROM accounts WHERE email='${esc(email)}');`);
      runSql(`DELETE FROM sessions WHERE account_id IN (SELECT id FROM accounts WHERE email='${esc(email)}');`);
    }
    console.log(`${email} → ${status}${cmd === "ban" ? " (keys disabled, sessions killed)" : ""}`);
  } else if (cmd === "reset-link" && email) {
    const acc = runSql(`SELECT id FROM accounts WHERE email='${esc(email)}';`);
    const accountId = acc?.[0]?.results?.[0]?.id;
    if (!accountId) {
      console.error("No such account.");
      process.exit(1);
    }
    const token = randomBytes(24).toString("hex");
    const hash = createHash("sha256").update(token).digest("hex");
    runSql(
      `INSERT INTO password_resets (token_hash, account_id) VALUES ('${hash}', '${accountId}');`
    );
    console.log("reset url: https://sceneviz.opraiz.com/dashboard/login?reset=" + token);
    console.log("(one-time, 1h; hand to the user via a trusted channel)");
  } else if (cmd === "stats") {
    const r = runSql(
      `SELECT 'accounts' k, COUNT(*) v FROM accounts UNION ALL ` +
        `SELECT 'generations', COUNT(*) FROM generations UNION ALL ` +
        `SELECT 'credits_granted', COALESCE(SUM(delta),0) FROM credit_ledger UNION ALL ` +
        `SELECT 'payments', COUNT(*) FROM payments UNION ALL ` +
        `SELECT 'usd_collected_cents', COALESCE(SUM(amount_minor),0) FROM payments;`
    );
    console.table(r?.[0]?.results);
  } else if (cmd === "payments") {
    const filter = email ? ` WHERE account_id IN (SELECT id FROM accounts WHERE email='${esc(email)}')` : "";
    const r = runSql(
      `SELECT created_at, gateway, credits, amount_minor, currency, status FROM payments${filter} ORDER BY created_at DESC LIMIT 25;`
    );
    console.table(r?.[0]?.results || []);
  } else {
    console.log(__doc__ || __filename.replace(/\\/g, "/"));
  }
} catch (e) {
  console.error(String(e?.message || e));
  process.exit(1);
}
