CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  timestamp TEXT,
  plan TEXT,
  stakes TEXT,
  risk_level TEXT,
  score REAL,
  data_score INTEGER,
  errors_score INTEGER,
  check_score INTEGER,
  accountability_score INTEGER,
  loss_score INTEGER,
  flags_count INTEGER,
  plan_changed TEXT,
  helpfulness_rating INTEGER,
  comment TEXT
);

CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
