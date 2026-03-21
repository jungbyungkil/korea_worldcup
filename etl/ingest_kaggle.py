#!/usr/bin/env python3
"""
Kaggle 등에서 받은 국제 경기 CSV -> SQLite (kaggle_intl_match).

컬럼 이름은 흔한 변형을 자동 인식합니다 (date / home_team / away_team / …).

예:
  python etl/init_db.py
  python etl/ingest_kaggle.py --csv path/to/results.csv
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sqlite3
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from etl.common import connect, default_db_path, ensure_schema, set_meta  # noqa: E402


def _norm_header(h: str) -> str:
    s = h.strip().lower()
    s = re.sub(r"\s+", "_", s)
    return s


def _pick(norm_row: dict[str, str], *keys: str) -> str | None:
    for k in keys:
        if k in norm_row and norm_row[k] is not None and str(norm_row[k]).strip() != "":
            return str(norm_row[k]).strip()
    return None


def _to_int(v: str | None) -> int | None:
    if v is None or v == "":
        return None
    try:
        return int(float(v))
    except ValueError:
        return None


def _to_neutral(v: str | None) -> int | None:
    if v is None or v == "":
        return None
    s = v.strip().lower()
    if s in ("1", "true", "t", "yes", "y"):
        return 1
    if s in ("0", "false", "f", "no", "n"):
        return 0
    return None


def _row_to_record(
    norm_row: dict[str, str],
    source_file: str,
    keep_raw: bool,
) -> tuple | None:
    d = _pick(norm_row, "date", "match_date", "game_date")
    home = _pick(norm_row, "home_team", "home", "home_team_name", "team_home")
    away = _pick(norm_row, "away_team", "away", "away_team_name", "team_away")
    if not home or not away:
        return None
    hs = _to_int(_pick(norm_row, "home_score", "home_goals", "hg"))
    aws = _to_int(_pick(norm_row, "away_score", "away_goals", "ag"))
    tournament = _pick(norm_row, "tournament", "competition", "cup")
    city = _pick(norm_row, "city")
    country = _pick(norm_row, "country", "venue_country")
    neutral = _to_neutral(_pick(norm_row, "neutral", "neutral_venue"))
    raw_json = json.dumps(norm_row, ensure_ascii=False) if keep_raw else None
    return (d, home, away, hs, aws, tournament, city, country, neutral, source_file, raw_json)


def ingest_csv(conn: sqlite3.Connection, csv_path: Path, *, append: bool, keep_raw: bool) -> int:
    if not append:
        conn.execute("DELETE FROM kaggle_intl_match WHERE source_file = ?", (str(csv_path.name),))
        conn.commit()

    with csv_path.open(newline="", encoding="utf-8-sig", errors="replace") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            return 0
        norm_fields = [_norm_header(h) for h in reader.fieldnames]
        key_map = dict(zip(reader.fieldnames, norm_fields))
        batch: list[tuple] = []
        total = 0
        for row in reader:
            norm_row = {key_map[k]: (row.get(k) or "").strip() for k in reader.fieldnames}
            rec = _row_to_record(norm_row, csv_path.name, keep_raw)
            if rec:
                batch.append(rec)
            if len(batch) >= 1000:
                conn.executemany(
                    """
                    INSERT INTO kaggle_intl_match (
                      match_date, home_team, away_team, home_score, away_score,
                      tournament, city, country, neutral, source_file, raw_row_json
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    batch,
                )
                conn.commit()
                total += len(batch)
                batch.clear()
        if batch:
            conn.executemany(
                """
                INSERT INTO kaggle_intl_match (
                  match_date, home_team, away_team, home_score, away_score,
                  tournament, city, country, neutral, source_file, raw_row_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                batch,
            )
            conn.commit()
            total += len(batch)
    return total


def main() -> int:
    p = argparse.ArgumentParser(description="Ingest international results CSV into SQLite")
    p.add_argument("--db", type=Path, default=None)
    p.add_argument("--csv", type=Path, required=True, help="CSV file path")
    p.add_argument(
        "--append",
        action="store_true",
        help="같은 source_file 행을 지우지 않고 추가만 함",
    )
    p.add_argument(
        "--keep-raw",
        action="store_true",
        help="원본 컬럼을 raw_row_json 에 JSON으로 저장",
    )
    args = p.parse_args()

    csv_path = args.csv.resolve()
    if not csv_path.is_file():
        print(f"파일 없음: {csv_path}", file=sys.stderr)
        return 1

    db_path = args.db or default_db_path()
    conn = connect(db_path)
    ensure_schema(conn)
    n = ingest_csv(conn, csv_path, append=args.append, keep_raw=args.keep_raw)
    set_meta(conn, "last_kaggle_csv", str(csv_path))
    conn.close()
    print(f"OK: inserted {n} rows from {csv_path.name} -> {db_path.resolve()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
