CREATE TABLE letters (
 id TEXT PRIMARY KEY, payload TEXT NOT NULL, delete_hash TEXT NOT NULL,
 parent_id TEXT REFERENCES letters(id) ON DELETE CASCADE,
 root_id TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL
);
CREATE INDEX letters_root ON letters(root_id, created_at);
CREATE INDEX letters_expiry ON letters(expires_at);
CREATE TABLE rate_limits (bucket TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL);
CREATE INDEX rate_expiry ON rate_limits(expires_at);
