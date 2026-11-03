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

-- Password reset tokens (SHA-256 of the token; 1h expiry enforced in code).
CREATE TABLE IF NOT EXISTS password_resets (
  token_hash  TEXT PRIMARY KEY,
  account_id  TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
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

-- M7 Agents studio: user-created persona agents (template agents live in
-- code, see src/agentsApi.js — never in this table). skills_json /
-- initial_suggestions_json are JSON arrays; timestamps are explicit ISO
-- strings written by the API (the column defaults are only a safety net).
CREATE TABLE IF NOT EXISTS agents (
  id                       TEXT PRIMARY KEY,
  slug                     TEXT NOT NULL UNIQUE,
  owner_id                 TEXT NOT NULL, -- account id, or the key row id for legacy keys
  owner_email              TEXT,
  name                     TEXT NOT NULL,
  description              TEXT NOT NULL DEFAULT '',
  system_prompt            TEXT NOT NULL DEFAULT '',
  icon_url                 TEXT,
  category                 TEXT NOT NULL DEFAULT 'Custom',
  skills_json              TEXT NOT NULL DEFAULT '[]',
  theme                    TEXT NOT NULL DEFAULT 'cosmic',
  welcome_message          TEXT NOT NULL DEFAULT '',
  initial_suggestions_json TEXT NOT NULL DEFAULT '[]',
  is_published             INTEGER NOT NULL DEFAULT 0,
  is_template              INTEGER NOT NULL DEFAULT 0,
  like_count               INTEGER NOT NULL DEFAULT 0,
  created_at               TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at               TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_agents_owner ON agents(owner_id, created_at);

-- Agent chat: conversations carry a snapshot of the agent identity (works for
-- template agents too, which have no row in `agents`).
CREATE TABLE IF NOT EXISTS agent_conversations (
  id             TEXT PRIMARY KEY, -- client-supplied uuid or server-generated
  agent_slug     TEXT NOT NULL,
  agent_name     TEXT NOT NULL DEFAULT '',
  agent_icon_url TEXT,
  owner_id       TEXT NOT NULL,
  title          TEXT NOT NULL DEFAULT '',
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_owner ON agent_conversations(owner_id, updated_at);

CREATE TABLE IF NOT EXISTS agent_messages (
  id               TEXT PRIMARY KEY,
  conversation_id  TEXT NOT NULL,
  role             TEXT NOT NULL, -- user | assistant
  content          TEXT NOT NULL,
  thoughts         TEXT,
  attachments_json TEXT NOT NULL DEFAULT '[]',
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_agent_messages_conv ON agent_messages(conversation_id, created_at);

-- Completed agent-chat turns (served back through the predictions poll route)
-- plus workflow-architect results (kind = 'architect').
CREATE TABLE IF NOT EXISTS agent_jobs (
  id              TEXT PRIMARY KEY,
  kind            TEXT NOT NULL DEFAULT 'agent', -- agent | architect
  owner_id        TEXT NOT NULL,
  agent_id        TEXT,
  conversation_id TEXT,
  status          TEXT NOT NULL DEFAULT 'completed', -- completed | failed
  response_json   TEXT NOT NULL DEFAULT '{}',
  error           TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_agent_jobs_owner ON agent_jobs(owner_id, created_at);

-- M7 Workflows studio: graph defs (data_json = {nodes:[…]}, edges_json = […]).
CREATE TABLE IF NOT EXISTS workflows (
  id          TEXT PRIMARY KEY,
  owner_id    TEXT NOT NULL,
  name        TEXT NOT NULL DEFAULT 'Untitled',
  category    TEXT NOT NULL DEFAULT 'General',
  thumbnail   TEXT,
  data_json   TEXT NOT NULL DEFAULT '{"nodes":[]}',
  edges_json  TEXT NOT NULL DEFAULT '[]',
  status      TEXT NOT NULL DEFAULT 'draft', -- draft | ready (not load-bearing yet)
  published   INTEGER NOT NULL DEFAULT 0,
  is_template INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_workflows_owner ON workflows(owner_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_workflows_published ON workflows(published, updated_at);

-- One row per run; nodes_json maps node id → [{status, result}] for the
-- builder's per-node poll, outputs_json is the flat api-outputs list.
CREATE TABLE IF NOT EXISTS workflow_runs (
  id           TEXT PRIMARY KEY,
  workflow_id  TEXT NOT NULL,
  owner_id     TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'queued', -- queued | running | completed | failed
  inputs_json  TEXT NOT NULL DEFAULT '{}',
  outputs_json TEXT NOT NULL DEFAULT '[]',
  nodes_json   TEXT NOT NULL DEFAULT '{}',
  error        TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_wf ON workflow_runs(workflow_id, created_at);

-- M7 Creative agent (design canvas). The client owns the message transcript —
-- it PATCHes the whole array, stored verbatim in messages_json.
CREATE TABLE IF NOT EXISTS ca_sessions (
  id            TEXT PRIMARY KEY,
  owner_id      TEXT NOT NULL,
  name          TEXT NOT NULL DEFAULT 'New Session',
  messages_json TEXT NOT NULL DEFAULT '[]',
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ca_sessions_owner ON ca_sessions(owner_id, updated_at);

-- Jobs mirror the generations lifecycle for the canvas events poll.
CREATE TABLE IF NOT EXISTS ca_jobs (
  id          TEXT PRIMARY KEY,
  session_id  TEXT NOT NULL,
  owner_id    TEXT NOT NULL,
  kind        TEXT NOT NULL DEFAULT 'chat', -- chat | skill
  model       TEXT,
  prompt      TEXT,
  status      TEXT NOT NULL DEFAULT 'completed', -- completed | failed
  events_json TEXT NOT NULL DEFAULT '[]',
  error       TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ca_jobs_session ON ca_jobs(session_id, created_at);

CREATE TABLE IF NOT EXISTS ca_assets (
  id          TEXT PRIMARY KEY,
  session_id  TEXT NOT NULL,
  owner_id    TEXT NOT NULL,
  asset_label TEXT NOT NULL, -- asset_1, asset_2, … per session
  url         TEXT NOT NULL,
  kind        TEXT NOT NULL DEFAULT 'image', -- image | video | audio
  source_tool TEXT,
  model       TEXT,
  prompt      TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ca_assets_session ON ca_assets(session_id, created_at);
