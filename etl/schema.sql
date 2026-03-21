-- 오프라인 ML용 SQLite 스키마 (Kaggle 매치 결과 + StatsBomb 공개 데이터)
-- 적용: python etl/init_db.py

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- 적재 메타 (재실행·버전 추적)
CREATE TABLE IF NOT EXISTS etl_meta (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- --- Kaggle 계열: 국제 A매치 등 CSV ---
CREATE TABLE IF NOT EXISTS kaggle_intl_match (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_date TEXT,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  tournament TEXT,
  city TEXT,
  country TEXT,
  neutral INTEGER,
  source_file TEXT,
  raw_row_json TEXT
);

CREATE INDEX IF NOT EXISTS idx_kaggle_date ON kaggle_intl_match (match_date);
CREATE INDEX IF NOT EXISTS idx_kaggle_home ON kaggle_intl_match (home_team);
CREATE INDEX IF NOT EXISTS idx_kaggle_away ON kaggle_intl_match (away_team);

-- --- StatsBomb: competitions.json ---
CREATE TABLE IF NOT EXISTS statsbomb_competition (
  competition_id INTEGER NOT NULL,
  season_id INTEGER NOT NULL,
  competition_name TEXT,
  season_name TEXT,
  country_name TEXT,
  competition_gender TEXT,
  competition_youth INTEGER,
  competition_international INTEGER,
  PRIMARY KEY (competition_id, season_id)
);

-- --- StatsBomb: matches/**/*.json ---
CREATE TABLE IF NOT EXISTS statsbomb_match (
  match_id INTEGER PRIMARY KEY,
  competition_id INTEGER,
  season_id INTEGER,
  match_date TEXT,
  kick_off TEXT,
  home_team_id INTEGER,
  home_team_name TEXT,
  away_team_id INTEGER,
  away_team_name TEXT,
  home_score INTEGER,
  away_score INTEGER,
  match_status TEXT,
  competition_stage_name TEXT,
  stadium_name TEXT,
  source_path TEXT
);

CREATE INDEX IF NOT EXISTS idx_sb_match_comp ON statsbomb_match (competition_id, season_id);
CREATE INDEX IF NOT EXISTS idx_sb_match_date ON statsbomb_match (match_date);

-- --- StatsBomb: events/{match_id}.json (옵션 적재) ---
CREATE TABLE IF NOT EXISTS statsbomb_event (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,
  event_uuid TEXT,
  event_index INTEGER,
  period INTEGER,
  minute INTEGER,
  second_val REAL,
  type_name TEXT,
  team_id INTEGER,
  team_name TEXT,
  player_id INTEGER,
  player_name TEXT,
  x REAL,
  y REAL,
  play_pattern_name TEXT,
  outcome_name TEXT,
  possession_team_id INTEGER,
  possession_team_name TEXT,
  FOREIGN KEY (match_id) REFERENCES statsbomb_match (match_id)
);

CREATE INDEX IF NOT EXISTS idx_sb_event_match ON statsbomb_event (match_id);
CREATE INDEX IF NOT EXISTS idx_sb_event_type ON statsbomb_event (type_name);
