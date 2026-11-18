CREATE TABLE fleet_manager (
  singleton INTEGER PRIMARY KEY CHECK (singleton = 1),
  user_id TEXT NOT NULL
);
--> statement-breakpoint
CREATE TABLE fleet_runs (
  id TEXT PRIMARY KEY,
  school TEXT NOT NULL,
  route TEXT NOT NULL,
  vehicle TEXT NOT NULL,
  driver TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  active INTEGER NOT NULL DEFAULT 0,
  invite_hash TEXT UNIQUE,
  invite_expiry INTEGER,
  session_hash TEXT UNIQUE,
  driver_user TEXT,
  session_expiry INTEGER,
  lat REAL,
  lng REAL,
  accuracy REAL,
  updated_at INTEGER,
  started_at INTEGER
);
--> statement-breakpoint
CREATE TABLE recovery_contacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE
);
