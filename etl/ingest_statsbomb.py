#!/usr/bin/env python3
"""
StatsBomb Open Data (로컬 clone) -> SQLite.

사전 준비:
  git clone https://github.com/statsbomb/open-data.git data/open-data

예:
  python etl/init_db.py
  python etl/ingest_statsbomb.py --open-data-root data/open-data
  python etl/ingest_statsbomb.py --open-data-root data/open-data --events
"""

from __future__ import annotations

import argparse
import json
import sqlite3
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from etl.common import connect, default_db_path, ensure_schema, set_meta  # noqa: E402


def _resolve_data_root(open_data_root: Path) -> Path:
    """open-data 리포 루트 또는 그 안의 data/ 를 받아 competitions.json 이 있는 디렉터리 반환."""
    r = open_data_root.resolve()
    if (r / "competitions.json").is_file():
        return r
    if (r / "data" / "competitions.json").is_file():
        return r / "data"
    raise FileNotFoundError(
        f"competitions.json 을 찾을 수 없습니다: {open_data_root} "
        "(StatsBomb 리포를 clone 했는지, --open-data-root 경로를 확인하세요)"
    )


def _clear_statsbomb(conn: sqlite3.Connection) -> None:
    conn.execute("DELETE FROM statsbomb_event")
    conn.execute("DELETE FROM statsbomb_match")
    conn.execute("DELETE FROM statsbomb_competition")
    conn.commit()


def ingest_competitions(conn: sqlite3.Connection, data_root: Path) -> int:
    path = data_root / "competitions.json"
    raw = json.loads(path.read_text(encoding="utf-8"))
    rows = []
    for c in raw:
        rows.append(
            (
                int(c["competition_id"]),
                int(c["season_id"]),
                c.get("competition_name"),
                c.get("season_name"),
                c.get("country_name"),
                c.get("competition_gender"),
                1 if c.get("competition_youth") else 0,
                1 if c.get("competition_international") else 0,
            )
        )
    conn.executemany(
        """
        INSERT OR REPLACE INTO statsbomb_competition (
          competition_id, season_id, competition_name, season_name, country_name,
          competition_gender, competition_youth, competition_international
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        rows,
    )
    conn.commit()
    return len(rows)


def _match_tuple(m: dict, source_path: str) -> tuple:
    comp = m.get("competition") or {}
    season = m.get("season") or {}
    ht = m.get("home_team") or {}
    at = m.get("away_team") or {}
    stage = m.get("competition_stage") or {}
    st = m.get("stadium") or {}
    return (
        int(m["match_id"]),
        int(comp.get("competition_id") or 0) or None,
        int(season.get("season_id") or 0) or None,
        m.get("match_date"),
        m.get("kick_off"),
        ht.get("home_team_id"),
        ht.get("home_team_name"),
        at.get("away_team_id"),
        at.get("away_team_name"),
        m.get("home_score"),
        m.get("away_score"),
        m.get("match_status"),
        stage.get("name"),
        st.get("name"),
        source_path,
    )


def ingest_matches(conn: sqlite3.Connection, data_root: Path) -> int:
    matches_dir = data_root / "matches"
    if not matches_dir.is_dir():
        return 0
    batch: list[tuple] = []
    total = 0
    for json_path in sorted(matches_dir.rglob("*.json")):
        rel = str(json_path.relative_to(data_root)).replace("\\", "/")
        try:
            arr = json.loads(json_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue
        if not isinstance(arr, list):
            continue
        for m in arr:
            if not isinstance(m, dict) or "match_id" not in m:
                continue
            try:
                batch.append(_match_tuple(m, rel))
            except (KeyError, TypeError, ValueError):
                continue
        if len(batch) >= 500:
            conn.executemany(
                """
                INSERT OR REPLACE INTO statsbomb_match (
                  match_id, competition_id, season_id, match_date, kick_off,
                  home_team_id, home_team_name, away_team_id, away_team_name,
                  home_score, away_score, match_status, competition_stage_name,
                  stadium_name, source_path
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                batch,
            )
            conn.commit()
            total += len(batch)
            batch.clear()
            print(f"  matches ... {total}", flush=True)
    if batch:
        conn.executemany(
            """
            INSERT OR REPLACE INTO statsbomb_match (
              match_id, competition_id, season_id, match_date, kick_off,
              home_team_id, home_team_name, away_team_id, away_team_name,
              home_score, away_score, match_status, competition_stage_name,
              stadium_name, source_path
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            batch,
        )
        conn.commit()
        total += len(batch)
    return total


def _outcome_from_event(ev: dict) -> str | None:
    for key in ("pass", "shot", "duel", "dribble", "clearance", "interception", "goalkeeper"):
        block = ev.get(key)
        if isinstance(block, dict):
            o = block.get("outcome")
            if isinstance(o, dict):
                return o.get("name")
    return None


def _event_rows(match_id: int, events: list[dict]) -> list[tuple]:
    out: list[tuple] = []
    for ev in events:
        if not isinstance(ev, dict):
            continue
        t = ev.get("type") or {}
        type_name = t.get("name")
        team = ev.get("team") or {}
        player = ev.get("player") or {}
        ppt = ev.get("possession_team") or {}
        pp = ev.get("play_pattern") or {}
        loc = ev.get("location")
        x = y = None
        if isinstance(loc, (list, tuple)) and len(loc) >= 2:
            try:
                x, y = float(loc[0]), float(loc[1])
            except (TypeError, ValueError):
                pass
        minute = ev.get("minute")
        second_val = ev.get("second")
        try:
            minute_i = int(minute) if minute is not None else None
        except (TypeError, ValueError):
            minute_i = None
        try:
            second_f = float(second_val) if second_val is not None else None
        except (TypeError, ValueError):
            second_f = None
        try:
            eidx = int(ev["index"])
        except (KeyError, TypeError, ValueError):
            eidx = None
        out.append(
            (
                match_id,
                str(ev.get("id")) if ev.get("id") is not None else None,
                eidx,
                ev.get("period"),
                minute_i,
                second_f,
                type_name,
                team.get("id"),
                team.get("name"),
                player.get("id"),
                player.get("name"),
                x,
                y,
                pp.get("name"),
                _outcome_from_event(ev),
                ppt.get("id"),
                ppt.get("name"),
            )
        )
    return out


def ingest_events(conn: sqlite3.Connection, data_root: Path, match_ids: set[int]) -> int:
    events_dir = data_root / "events"
    if not events_dir.is_dir():
        return 0
    total = 0
    for json_path in sorted(events_dir.glob("*.json")):
        try:
            mid = int(json_path.stem)
        except ValueError:
            continue
        if mid not in match_ids:
            continue
        try:
            arr = json.loads(json_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue
        if not isinstance(arr, list):
            continue
        rows = _event_rows(mid, arr)
        if not rows:
            continue
        conn.executemany(
            """
            INSERT INTO statsbomb_event (
              match_id, event_uuid, event_index, period, minute, second_val,
              type_name, team_id, team_name, player_id, player_name,
              x, y, play_pattern_name, outcome_name,
              possession_team_id, possession_team_name
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            rows,
        )
        conn.commit()
        total += len(rows)
        if total % 50000 < len(rows):
            print(f"  events ... {total}", flush=True)
    return total


def main() -> int:
    p = argparse.ArgumentParser(description="Ingest StatsBomb open-data into SQLite")
    p.add_argument("--db", type=Path, default=None, help="SQLite file")
    p.add_argument(
        "--open-data-root",
        type=Path,
        default=None,
        help="statsbomb/open-data 클론 경로 (기본: data/open-data 또는 $STATSBOMB_OPEN_DATA)",
    )
    p.add_argument(
        "--events",
        action="store_true",
        help="events/*.json 도 적재 (용량·시간 큼)",
    )
    p.add_argument(
        "--clear",
        action="store_true",
        help="StatsBomb 테이블만 비우고 다시 적재",
    )
    args = p.parse_args()

    db_path = args.db or default_db_path()
    root = args.open_data_root
    if root is None:
        env = __import__("os").environ.get("STATSBOMB_OPEN_DATA")
        root = Path(env) if env else _ROOT / "data" / "open-data"

    try:
        data_root = _resolve_data_root(root)
    except FileNotFoundError as e:
        print(str(e), file=sys.stderr)
        return 1

    conn = connect(db_path)
    ensure_schema(conn)
    if args.clear:
        _clear_statsbomb(conn)

    print("StatsBomb -> SQLite")
    print(f"  data root: {data_root}")
    print(f"  db: {db_path.resolve()}")

    n_c = ingest_competitions(conn, data_root)
    print(f"  competitions rows: {n_c}")

    n_m = ingest_matches(conn, data_root)
    print(f"  matches rows: {n_m}")

    n_e = 0
    if args.events:
        conn.execute("DELETE FROM statsbomb_event")
        conn.commit()
        cur = conn.execute("SELECT match_id FROM statsbomb_match")
        mids = {int(r[0]) for r in cur.fetchall()}
        print(f"  ingesting events for {len(mids)} matches ...")
        n_e = ingest_events(conn, data_root, mids)
        print(f"  events rows: {n_e}")
    else:
        print("  (skip events; use --events to load events/*.json)")

    set_meta(conn, "statsbomb_data_root", str(data_root))
    set_meta(conn, "statsbomb_events_loaded", "1" if args.events else "0")
    conn.close()
    print("OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
