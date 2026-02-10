-- MikroTik Hotspot Manager - PostgreSQL Init Script
-- This runs automatically on first container start

CREATE TABLE IF NOT EXISTS kv_store_4f18e215 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

-- Create index for prefix searches (used by getByPrefix)
CREATE INDEX IF NOT EXISTS idx_kv_store_key_prefix ON kv_store_4f18e215 USING btree (key text_pattern_ops);
