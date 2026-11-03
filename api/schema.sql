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
