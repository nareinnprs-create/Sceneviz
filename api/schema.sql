-- Sceneviz API — D1 schema (Phase A)

CREATE TABLE IF NOT EXISTS keys (
  id          TEXT PRIMARY KEY,
  key_hash    TEXT NOT NULL UNIQUE,
  label       TEXT NOT NULL DEFAULT '',
  credits     INTEGER NOT NULL DEFAULT 500,
  status      TEXT NOT NULL DEFAULT 'active', -- active | disabled
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS usage (
  id          TEXT PRIMARY KEY,
  key_id      TEXT NOT NULL,
  model       TEXT NOT NULL,
  credits     INTEGER NOT NULL DEFAULT 0,
  job_id      TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_usage_key ON usage(key_id, created_at);
