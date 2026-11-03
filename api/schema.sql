-- Sceneviz API — D1 schema (Phase A + WS4 accounts/sessions + WS5 history)

CREATE TABLE IF NOT EXISTS keys (
  id          TEXT PRIMARY KEY,
  key_hash    TEXT NOT NULL UNIQUE,
  label       TEXT NOT NULL DEFAULT '',
  credits     INTEGER NOT NULL DEFAULT 500,
  status      TEXT NOT NULL DEFAULT 'active', -- active | disabled
  -- WS4 self-serve keys. NULL account_id = legacy manually-issued key (still valid).
  account_id  TEXT,
  key_hint    TEXT, -- first 12 chars of the raw key; dashboard display only
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
-- Existing deployments: CREATE TABLE IF NOT EXISTS never alters the live keys
-- table — apply these separately BEFORE deploying the WS4 Worker code:
--   ALTER TABLE keys ADD COLUMN account_id TEXT;
--   ALTER TABLE keys ADD COLUMN key_hint TEXT;

CREATE TABLE IF NOT EXISTS usage (
  id          TEXT PRIMARY KEY,
  key_id      TEXT NOT NULL,
  model       TEXT NOT NULL,
  credits     INTEGER NOT NULL DEFAULT 0,
  job_id      TEXT,
  -- Phase B lifecycle ('submitted' at insert). Existing DBs need:
  -- ALTER TABLE usage ADD COLUMN status TEXT NOT NULL DEFAULT 'submitted';
  status      TEXT NOT NULL DEFAULT 'submitted',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_usage_key ON usage(key_id, created_at);
CREATE INDEX IF NOT EXISTS idx_usage_job ON usage(job_id);

-- Phase B: per-key fixed-window rate-limit counters (generation submits only).
CREATE TABLE IF NOT EXISTS rate (
  key_id        TEXT NOT NULL,
  window_start  INTEGER NOT NULL, -- epoch ms, floored to RATE_WINDOW_MS
  count         INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (key_id, window_start)
);

-- WS4: accounts + dashboard sessions. Passwords are PBKDF2-SHA256
-- ('salt:hash' hex); raw passwords are never stored. email_verified defaults
-- to 1 — shortcut: no email provider yet, signups are auto-verified.
CREATE TABLE IF NOT EXISTS accounts (
  id             TEXT PRIMARY KEY,
  email          TEXT NOT NULL UNIQUE,
  pw_hash        TEXT NOT NULL,
  email_verified INTEGER NOT NULL DEFAULT 1,
  credits        INTEGER NOT NULL DEFAULT 0,
  status         TEXT NOT NULL DEFAULT 'active', -- active | disabled
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Sessions: only the SHA-256 of each token is stored (the raw token lives in
-- the client). Expired rows are rejected at auth time (no GC job yet).
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL -- ISO timestamp; 30 days after creation
);

-- WS5: user-facing generation history (usage stays the ledger feed).
-- status: submitted → completed | failed | cancelled.
CREATE TABLE IF NOT EXISTS generations (
  id               TEXT PRIMARY KEY,
  key_id           TEXT NOT NULL,
  account_id       TEXT,
  job_id           TEXT, -- RunPod job id; the poll endpoint updates the row by it
  model            TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'submitted',
  cost_credits     INTEGER NOT NULL DEFAULT 0,
  input_json       TEXT NOT NULL DEFAULT '{}',
  output_urls_json TEXT NOT NULL DEFAULT '[]',
  created_at       TEXT NOT NULL -- explicit ISO string (cursor-safe)
);
CREATE INDEX IF NOT EXISTS idx_generations_account ON generations(account_id, created_at);
CREATE INDEX IF NOT EXISTS idx_generations_key ON generations(key_id, created_at);
CREATE INDEX IF NOT EXISTS idx_generations_job ON generations(job_id);

-- M3 billing: one row per gateway payment attempt that was processed. The
-- gateway_payment_id UNIQUE constraint is the webhook idempotency gate —
-- retries hit ON CONFLICT (gateway_payment_id) DO NOTHING. New tables, so
-- applying schema.sql to the live DB creates them without touching existing
-- tables (see the keys-table note above).
CREATE TABLE IF NOT EXISTS payments (
  id                 TEXT PRIMARY KEY,
  gateway            TEXT NOT NULL, -- 'dodo'
  gateway_payment_id TEXT NOT NULL UNIQUE,
  account_id         TEXT NOT NULL,
  key_id             TEXT,
  credits            INTEGER NOT NULL,
  amount_minor       INTEGER NOT NULL DEFAULT 0,
  currency           TEXT NOT NULL DEFAULT '',
  status             TEXT NOT NULL DEFAULT 'pending',
  created_at         TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_payments_account ON payments(account_id, created_at);

-- M3 billing: append-only credit audit trail — every balance change lands here
-- alongside the payments row / debit that caused it.
CREATE TABLE IF NOT EXISTS credit_ledger (
  id         TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  delta      INTEGER NOT NULL, -- positive = grant, negative = debit
  reason     TEXT NOT NULL,    -- e.g. 'purchase:dodo'
  payment_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_account ON credit_ledger(account_id, created_at);
