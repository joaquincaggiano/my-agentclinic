CREATE TABLE agents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  model_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting'
    CHECK (status IN ('waiting', 'in_session', 'recovering'))
);

CREATE TABLE ailments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL
);

CREATE TABLE agent_ailments (
  agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  ailment_id INTEGER NOT NULL REFERENCES ailments(id) ON DELETE CASCADE,
  PRIMARY KEY (agent_id, ailment_id)
);
