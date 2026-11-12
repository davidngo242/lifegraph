// Bảng Postgres cho Bia Tưởng Niệm chung (Gia phả liên người chơi). Không import gì để db.js dùng được mà không vòng phụ thuộc.
export const SHARED_LINEAGE_SCHEMA = `
CREATE TABLE IF NOT EXISTS shared_memorials (
  id VARCHAR(32) PRIMARY KEY,
  account_id VARCHAR(100) NOT NULL,
  source_id VARCHAR(100) NOT NULL,
  display_name VARCHAR(64) NOT NULL,
  ancestor_name VARCHAR(80) NOT NULL,
  nationality VARCHAR(60) NOT NULL DEFAULT '',
  age INT NOT NULL DEFAULT 0,
  cause_of_passing VARCHAR(120) NOT NULL DEFAULT '',
  aspiration_title VARCHAR(120) NOT NULL DEFAULT '',
  epitaph VARCHAR(200) NOT NULL DEFAULT '',
  incense_count INT NOT NULL DEFAULT 0,
  adopt_count INT NOT NULL DEFAULT 0,
  report_count INT NOT NULL DEFAULT 0,
  status VARCHAR(12) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (account_id, source_id)
);
CREATE INDEX IF NOT EXISTS shared_memorials_new_idx ON shared_memorials (status, created_at DESC);
CREATE INDEX IF NOT EXISTS shared_memorials_incense_idx ON shared_memorials (status, incense_count DESC, created_at DESC);
CREATE TABLE IF NOT EXISTS shared_memorial_incense (
  memorial_id VARCHAR(32) NOT NULL,
  account_id VARCHAR(100) NOT NULL,
  day VARCHAR(10) NOT NULL,
  PRIMARY KEY (memorial_id, account_id, day)
);
CREATE TABLE IF NOT EXISTS shared_memorial_adoptions (
  memorial_id VARCHAR(32) NOT NULL,
  account_id VARCHAR(100) NOT NULL,
  day VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (memorial_id, account_id)
);
CREATE INDEX IF NOT EXISTS shared_memorial_adoptions_acc_idx ON shared_memorial_adoptions (account_id, day);
CREATE TABLE IF NOT EXISTS shared_memorial_reports (
  memorial_id VARCHAR(32) NOT NULL,
  account_id VARCHAR(100) NOT NULL,
  reason VARCHAR(40) NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (memorial_id, account_id)
);
`;
