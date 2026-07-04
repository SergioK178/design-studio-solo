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
