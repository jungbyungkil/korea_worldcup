"""한국 본선 경기 위주 TheSportsDB 영상 링크 수집 (결승전 일반 하이라이트 아님)."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from app.services import thesportsdb

_DATA = Path(__file__).resolve().parent.parent / "data" / "korea_wc_tsdb_event_searches.json"


def _is_south_korea_side(name: str) -> bool:
    n = (name or "").strip().lower()
    if not n:
        return False
    if "north korea" in n or n == "dpr korea":
        return False
    return "south korea" in n or "korea republic" in n or n in ("korea", "republic of korea")


def _is_korea_match(ev: dict[str, Any]) -> bool:
    h = (ev.get("strHomeTeam") or "").strip()
    a = (ev.get("strAwayTeam") or "").strip()
    return _is_south_korea_side(h) or _is_south_korea_side(a)


def _is_wc_soccer(ev: dict[str, Any], league_id: int) -> bool:
    sp = (ev.get("strSport") or "").strip().lower()
    if sp and sp not in ("soccer", "football"):
        return False
    lid = ev.get("idLeague")
    if lid is None:
        return True
    return str(lid) == str(league_id)


def _load_search_terms(year: int) -> list[str]:
    if not _DATA.is_file():
        return []
    with open(_DATA, encoding="utf-8") as f:
        cfg = json.load(f)
    if not isinstance(cfg, dict):
        return []
    raw = cfg.get(str(year))
    if not isinstance(raw, list):
        return []
    out: list[str] = []
    for x in raw:
        if isinstance(x, str) and x.strip() and not x.startswith("_"):
            out.append(x.strip())
    return out


async def fetch_korea_world_cup_match_videos(year: int, league_id: int) -> tuple[list[dict[str, Any]], str | None]:
    """대한민국이 홈/원정으로 출전한 FIFA WC 경기 중, TheSportsDB에 strVideo 가 있는 항목만."""
    season = str(year)
    by_id: dict[str, dict[str, Any]] = {}
    err: str | None = None

    # 1) 시즌 첫 N경기 안에 들어오는 한국전 (무료 티어 제한 대비)
    try:
        batch = await thesportsdb.fetch_events_season(league_id=league_id, season=season, ttl_seconds=86400)
        for ev in batch:
            if not _is_wc_soccer(ev, league_id) or not _is_korea_match(ev):
                continue
            eid = str(ev.get("idEvent") or "")
            if not eid or not (ev.get("strVideo") or "").strip():
                continue
            by_id[eid] = ev
    except RuntimeError as e:
        err = str(e)
    except Exception:
        pass

    skip_search = bool(err and "한도" in err)

    # 2) 연도별 고정 검색어 (대부분의 한국 경기)
    if skip_search:
        slim = [thesportsdb.slim_tv_highlight(ev) for ev in sorted(by_id.values(), key=lambda x: str(x.get("dateEvent") or ""))]
        return slim, err

    for term in _load_search_terms(year):
        try:
            found = await thesportsdb.search_events(e=term, season=season, ttl_seconds=86400)
        except RuntimeError as e:
            err = err or str(e)
            break
        except Exception:
            continue
        for ev in found:
            if not _is_wc_soccer(ev, league_id) or not _is_korea_match(ev):
                continue
            eid = str(ev.get("idEvent") or "")
            if not eid or not (ev.get("strVideo") or "").strip():
                continue
            by_id[eid] = ev

    def _sort_key(ev: dict[str, Any]) -> str:
        return str(ev.get("dateEvent") or "")

    ordered = sorted(by_id.values(), key=_sort_key)
    slim = [thesportsdb.slim_tv_highlight(ev) for ev in ordered]
    return slim, err
