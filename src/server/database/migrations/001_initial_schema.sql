-- Secret Messages Table
CREATE TABLE IF NOT EXISTS secret_messages (
  id TEXT PRIMARY KEY,
  encrypted_content TEXT NOT NULL,
  max_views INTEGER DEFAULT 2,
  current_views INTEGER DEFAULT 0,
  expires_at DATETIME,
  background_image TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_accessed_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_secret_messages_created_at ON secret_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_secret_messages_expires_at ON secret_messages(expires_at);

-- Memory Games Tables
CREATE TABLE IF NOT EXISTS memory_games (
  id TEXT PRIMARY KEY,
  final_message TEXT NOT NULL,
  difficulty_level TEXT DEFAULT 'medium',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS memory_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id TEXT NOT NULL,
  image_data TEXT NOT NULL,
  position INTEGER,
  FOREIGN KEY (game_id) REFERENCES memory_games(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS memory_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id TEXT NOT NULL,
  time_seconds INTEGER,
  moves_count INTEGER,
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES memory_games(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_memory_games_created_at ON memory_games(created_at);
CREATE INDEX IF NOT EXISTS idx_memory_scores_game_id ON memory_scores(game_id);

-- Treasure Hunt Tables
CREATE TABLE IF NOT EXISTS treasure_hunts (
  id TEXT PRIMARY KEY,
  final_message TEXT NOT NULL,
  final_gps_lat REAL,
  final_gps_lng REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS treasure_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hunt_id TEXT NOT NULL,
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  hint_1 TEXT,
  hint_2 TEXT,
  answer_type TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  success_message TEXT,
  error_message TEXT,
  image_url TEXT,
  FOREIGN KEY (hunt_id) REFERENCES treasure_hunts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS treasure_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hunt_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  current_step INTEGER DEFAULT 0,
  hints_used TEXT,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (hunt_id) REFERENCES treasure_hunts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_treasure_hunts_created_at ON treasure_hunts(created_at);
CREATE INDEX IF NOT EXISTS idx_treasure_progress_hunt_id ON treasure_progress(hunt_id);
CREATE INDEX IF NOT EXISTS idx_treasure_progress_session_id ON treasure_progress(session_id);

-- Love Wheel Tables
CREATE TABLE IF NOT EXISTS love_wheels (
  id TEXT PRIMARY KEY,
  max_spins_per_day INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wheel_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wheel_id TEXT NOT NULL,
  section_number INTEGER NOT NULL,
  text TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  icon TEXT,
  probability_weight INTEGER DEFAULT 1,
  FOREIGN KEY (wheel_id) REFERENCES love_wheels(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wheel_spins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wheel_id TEXT NOT NULL,
  section_id INTEGER NOT NULL,
  session_id TEXT,
  is_completed BOOLEAN DEFAULT 0,
  spun_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (wheel_id) REFERENCES love_wheels(id) ON DELETE CASCADE,
  FOREIGN KEY (section_id) REFERENCES wheel_sections(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_love_wheels_created_at ON love_wheels(created_at);
CREATE INDEX IF NOT EXISTS idx_wheel_spins_wheel_id ON wheel_spins(wheel_id);
CREATE INDEX IF NOT EXISTS idx_wheel_spins_spun_at ON wheel_spins(spun_at);

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  game_type TEXT,
  game_id TEXT,
  metadata TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_game_id ON analytics_events(game_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);
