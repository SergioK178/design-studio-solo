CREATE TABLE IF NOT EXISTS metric_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  measured_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  source TEXT NOT NULL CHECK (source IN ('deploy', 'daily', 'manual')),
  url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ok', 'partial', 'failed')),
  ttfb_ms INTEGER,
  transfer_bytes INTEGER,
  lighthouse_performance REAL,
  lighthouse_accessibility REAL,
  lighthouse_best_practices REAL,
  lighthouse_seo REAL,
  lcp_ms INTEGER,
  cls REAL,
  inp_ms INTEGER,
  raw_json TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_metric_runs_measured_at ON metric_runs(measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_metric_runs_status_measured_at ON metric_runs(status, measured_at DESC);

CREATE TABLE IF NOT EXISTS brief_drafts (
  id TEXT PRIMARY KEY,
  answers_json TEXT NOT NULL,
  estimate_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL,
  price_low INTEGER NOT NULL,
  price_high INTEGER NOT NULL,
  term_low INTEGER NOT NULL,
  term_high INTEGER NOT NULL,
  utm_json TEXT NOT NULL DEFAULT '{}',
  source TEXT NOT NULL DEFAULT 'brief',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','in_progress','won','lost')),
  next_action TEXT NOT NULL DEFAULT '',
  next_action_at TEXT,
  draft_id TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_next_action_at ON leads(next_action_at);
CREATE INDEX IF NOT EXISTS idx_drafts_expires ON brief_drafts(expires_at);

CREATE TABLE IF NOT EXISTS lead_details (
  lead_id INTEGER PRIMARY KEY REFERENCES leads(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  contact TEXT NOT NULL DEFAULT '',
  comment TEXT NOT NULL DEFAULT '',
  answers_json TEXT NOT NULL DEFAULT '{}',
  summary TEXT NOT NULL DEFAULT ''
);
