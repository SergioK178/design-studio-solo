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
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','in_progress','closed')),
  draft_id TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drafts_expires ON brief_drafts(expires_at);
