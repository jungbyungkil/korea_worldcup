"""ETL 공통: DB 연결 및 스키마 적용."""

from __future__ import annotations

import sqlite3
from pathlib import Path

SCHEMA_PATH = Path(__file__).resolve().parent / "schema.sql"


def repo_root() -> Path:
    return Path(__file__).resolve().parent.parent


def default_db_path() -> Path:
    return repo_root() / "data" / "ml" / "korea_worldcup_ml.sqlite"


def connect(db_path: Path) -> sqlite3.Connection:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    return conn


def apply_schema(conn: sqlite3.Connection) -> None:
    sql = SCHEMA_PATH.read_text(encoding="utf-8")
    conn.executescript(sql)
    conn.commit()


def ensure_schema(conn: sqlite3.Connection) -> None:
    """DB 파일만 있고 테이블이 없을 때 스키마 자동 적용."""
    cur = conn.execute(
        "SELECT 1 FROM sqlite_master WHERE type='table' AND name='etl_meta' LIMIT 1"
    )
    if cur.fetchone() is None:
        apply_schema(conn)


def set_meta(conn: sqlite3.Connection, key: str, value: str) -> None:
    conn.execute(
        """
        INSERT INTO etl_meta (key, value, updated_at)
        VALUES (?, ?, datetime('now'))
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
        """,
        (key, value),
    )
    conn.commit()
