from __future__ import annotations

import asyncio
import math
import os
from datetime import date, datetime, timezone
from typing import Any

from fastapi import APIRouter, HTTPException

from app.services.api_football import api_get, api_get_all_pages


router = APIRouter(prefix="/worldcup2026", tags=["worldcup2026"])

KOREA_QUERY = "Korea"
_DERIVED_FIXTURES_CACHE: dict[str, Any] = {"expires_at": 0.0, "value": None}

_ELO_BASELINE = 1500
_ELO_TABLE: dict[str, int] = {
    "south korea": 1760,
    "korea republic": 1760,
    "mexico": 1720,
    "south africa": 1595,
    "japan": 1810,
    "iran": 1785,
    "australia": 1775,
    "saudi arabia": 1710,
    "iraq": 1660,
    "uzbekistan": 1700,
    "qatar": 1690,
    "uae": 1660,
}


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _iso(d: date) -> str:
    return d.isoformat()


def _is_worldcup_related_league(league_name: str) -> bool:
    n = league_name.lower()
    return (
        "world cup" in n
        or "qualification" in n
        or "qualifying" in n
        or "friendlies" in n
        or "friendly" in n
        or "international" in n
    )


def _parse_int_csv(v: str | None) -> list[int]:
    if not v:
        return []
    out: list[int] = []
    for token in v.split(","):
        token = token.strip()
        if not token:
            continue
        try:
            out.append(int(token))
        except ValueError:
            continue
    return out


def _fixed_league_ids_from_env() -> list[int]:
    ids: list[int] = []
    seen: set[int] = set()
    singles = [
        os.getenv("API_FOOTBALL_AFC_QUALIFIERS_LEAGUE_ID"),
        os.getenv("API_FOOTBALL_WORLD_CUP_LEAGUE_ID"),
        os.getenv("API_FOOTBALL_FRIENDLIES_LEAGUE_ID"),
    ]
    for s in singles:
        if not s:
            continue
        try:
            i = int(s.strip())
        except ValueError:
            continue
        if i not in seen:
            ids.append(i)
            seen.add(i)
    for i in _parse_int_csv(os.getenv("API_FOOTBALL_LEAGUE_IDS")):
        if i not in seen:
            ids.append(i)
            seen.add(i)
    for i in _parse_int_csv(os.getenv("API_FOOTBALL_AFC_QUALIFIERS_LEAGUE_IDS")):
        if i not in seen:
            ids.append(i)
            seen.add(i)
    return ids


def _afc_league_ids_for_extended_fetch() -> set[int]:
    s: set[int] = set(_parse_int_csv(os.getenv("API_FOOTBALL_AFC_QUALIFIERS_LEAGUE_IDS")))
    single = os.getenv("API_FOOTBALL_AFC_QUALIFIERS_LEAGUE_ID")
    if single:
        try:
            s.add(int(single.strip()))
        except ValueError:
            pass
    return s


async def _discover_afc_qualifier_league_ids() -> list[int]:
    data = await api_get("leagues", params={"search": "World Cup - Qualification"}, ttl_seconds=24 * 3600)
    out: list[int] = []
    seen: set[int] = set()
    for it in data.get("response", []) or []:
        league = (it or {}).get("league") or {}
        name = str(league.get("name") or "").lower()
        lid = league.get("id")
        if not isinstance(lid, int):
            continue
        if lid in seen:
            continue
        if not ("qualif" in name or "qualification" in name or "qualifying" in name):
            continue
        if "asia" not in name and "afc" not in name:
            continue
        out.append(lid)
        seen.add(lid)
    return out


def _parse_score(score: str | None) -> tuple[int, int] | None:
    if not score:
        return None
    import re

    m = re.search(r"(\d+)\s*-\s*(\d+)", score)
    if not m:
        return None
    return int(m.group(1)), int(m.group(2))


def _result_from_score(score: str | None) -> str | None:
    p = _parse_score(score)
    if p is None:
        return None
    gf, ga = p
    if gf > ga:
        return "W"
    if gf < ga:
        return "L"
    return "D"


def _calc_recent_form(fixtures: list[dict[str, Any]], limit: int = 5) -> dict[str, Any]:
    rows = []
    for f in fixtures:
        status = str(f.get("status") or "")
        if status not in {"FT", "AET", "PEN"}:
            continue
        parsed = _parse_score(f.get("score"))
        if parsed is None:
            continue
        dt = str(f.get("date") or "")
        rows.append(
            {
                "date": dt,
                "opponent": f.get("opponent"),
                "score": f.get("score"),
                "result": _result_from_score(f.get("score")),
                "gf": parsed[0],
                "ga": parsed[1],
            }
        )
    rows.sort(key=lambda x: x["date"], reverse=True)
    rows = rows[:limit]
    wins = sum(1 for r in rows if r["result"] == "W")
    draws = sum(1 for r in rows if r["result"] == "D")
    losses = sum(1 for r in rows if r["result"] == "L")
    played = len(rows)
    points = wins * 3 + draws
    gf_sum = sum(r["gf"] for r in rows)
    ga_sum = sum(r["ga"] for r in rows)
    return {
        "played": played,
        "wins": wins,
        "draws": draws,
        "losses": losses,
        "points": points,
        "goals_scored": gf_sum,
        "goals_conceded": ga_sum,
        "recent_matches": rows,
    }


def _elo_for(team_name: str) -> int:
    return _ELO_TABLE.get(team_name.strip().lower(), _ELO_BASELINE)


def _win_probability_from_elo(elo_diff: int) -> float:
    return 1.0 / (1.0 + math.pow(10, (-elo_diff / 400)))


async def _find_korea_team_id() -> int | None:
    data = await api_get("teams", params={"search": KOREA_QUERY}, ttl_seconds=24 * 3600)
    candidates = data.get("response", []) or []

    def _score(item: dict[str, Any]) -> int:
        team = (item or {}).get("team") or {}
        name = str(team.get("name") or "").lower()
        country = str(team.get("country") or "").lower()
        national = bool(team.get("national"))
        score = 0
        if national:
            score += 50
        if name in ("korea republic", "south korea"):
            score += 30
        if "korea" in name:
            score += 10
        if country in ("korea", "south korea", "korea republic"):
            score += 10
        return score

    best: dict[str, Any] | None = None
    best_score = -1
    for item in candidates:
        s = _score(item)
        if s > best_score:
            best, best_score = item, s
    if best and best_score > 0:
        team = (best or {}).get("team") or {}
        tid = team.get("id")
        if isinstance(tid, int):
            return tid
    return None


@router.get("/korea/_team-candidates")
async def korea_team_candidates() -> dict[str, Any]:
    try:
        data = await api_get("teams", params={"search": KOREA_QUERY}, ttl_seconds=5 * 60)
    except RuntimeError as e:
        raise HTTPException(status_code=501, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=502, detail="API-Football 호출에 실패했습니다.") from e
    out = []
    for item in (data.get("response", []) or [])[:20]:
        team = (item or {}).get("team") or {}
        out.append(
            {
                "id": team.get("id"),
                "name": team.get("name"),
                "country": team.get("country"),
                "national": team.get("national"),
            }
        )
    return {"candidates": out}


@router.get("/korea/_fixtures-raw")
async def korea_fixtures_raw() -> dict[str, Any]:
    team_id = await _find_korea_team_id()
    if not team_id:
        return {"team_id": None, "results": 0}
    raw = await api_get("fixtures", params={"team": team_id, "timezone": "Asia/Seoul"}, ttl_seconds=60)
    return {"team_id": team_id, "results": raw.get("results"), "errors": raw.get("errors"), "paging": raw.get("paging")}


async def _worldcup_related_league_ids() -> list[int]:
    fixed = _fixed_league_ids_from_env()
    if fixed:
        return fixed
    want_terms = [
        ("Friendlies", ("friendlies",)),
        ("World Cup - Qualification", ("world cup", "qualif")),
        ("World Cup", ("world cup",)),
    ]
    ids: list[int] = []
    seen: set[int] = set()
    for search, must_tokens in want_terms:
        data = await api_get("leagues", params={"search": search}, ttl_seconds=24 * 3600)
        best_id: int | None = None
        best_score = -1
        for it in data.get("response", []) or []:
            league = (it or {}).get("league") or {}
            name = str(league.get("name") or "").lower()
            lid = league.get("id")
            if not isinstance(lid, int) or lid in seen:
                continue
            if not all(tok in name for tok in must_tokens):
                continue
            score = 0
            if "qualification" in name or "qualifying" in name or "qualif" in name:
                score += 5
            if "asia" in name or "afc" in name:
                score += 3
            if "friendlies" in name:
                score += 3
            if "world cup" in name:
                score += 2
            if score > best_score:
                best_id, best_score = lid, score
        if best_id is not None:
            seen.add(best_id)
            ids.append(best_id)
    return ids


@router.get("/korea/_league-candidates")
async def korea_league_candidates() -> dict[str, Any]:
    searches = ["World Cup", "Qualification", "Friendlies"]
    rows: list[dict[str, Any]] = []
    seen: set[int] = set()
    for q in searches:
        data = await api_get("leagues", params={"search": q}, ttl_seconds=6 * 3600)
        for it in data.get("response", []) or []:
            league = (it or {}).get("league") or {}
            lid = league.get("id")
            name = str(league.get("name") or "")
            if not isinstance(lid, int) or not name or lid in seen:
                continue
            if not _is_worldcup_related_league(name):
                continue
            rows.append({"id": lid, "name": name, "search": q})
            seen.add(lid)
            if len(rows) >= 40:
                break
        if len(rows) >= 40:
            break
    return {"candidates": rows}


@router.get("/korea/overview")
async def korea_overview() -> dict[str, Any]:
    try:
        team_id = await _find_korea_team_id()
    except RuntimeError as e:
        raise HTTPException(status_code=501, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=502, detail="API-Football 호출에 실패했습니다.") from e
    return {
        "last_updated": _now_iso(),
        "team": {"id": team_id, "name": "대한민국" if team_id else "대한민국(미확인)"},
        "status": {
            "groups_confirmed": False,
            "fixtures_confirmed": False,
            "note": "2026 월드컵 본선 조/일정은 확정 전일 수 있습니다. (API 제공 범위에 따라 업데이트)",
        },
    }


@router.get("/korea/fixtures")
async def korea_fixtures() -> dict[str, Any]:
    try:
        team_id = await _find_korea_team_id()
    except RuntimeError as e:
        raise HTTPException(status_code=501, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=502, detail="API-Football 호출에 실패했습니다.") from e

    if not team_id:
        return {"last_updated": _now_iso(), "team_id": None, "fixtures": []}

    now_ts = datetime.now(timezone.utc).timestamp()
    cached = _DERIVED_FIXTURES_CACHE.get("value")
    if cached is not None and float(_DERIVED_FIXTURES_CACHE.get("expires_at") or 0) > now_ts:
        return cached

    today = date.today()
    from_d = date(2023, 1, 1)
    to_d = date(2026, 12, 31)

    try:
        league_ids = list(await _worldcup_related_league_ids())
    except RuntimeError as e:
        raise HTTPException(status_code=501, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=502, detail="API-Football 리그 검색에 실패했습니다.") from e

    afc_discovered: list[int] = []
    skip_merge = os.getenv("API_FOOTBALL_SKIP_AFC_LEAGUE_DISCOVERY", "").strip().lower() in ("1", "true", "yes")
    if not skip_merge:
        try:
            afc_discovered = await _discover_afc_qualifier_league_ids()
        except Exception:
            afc_discovered = []
    seen_lids: set[int] = set(league_ids)
    for lid in afc_discovered:
        if lid not in seen_lids:
            league_ids.append(lid)
            seen_lids.add(lid)

    afc_extended_ids: set[int] = _afc_league_ids_for_extended_fetch() | set(afc_discovered)
    seasons_default = [2024, 2025, 2026]
    seasons_afc = [2023, 2024, 2025, 2026]
    combined: list[Any] = []

    try:
        async def _fetch_one(lid: int, season: int) -> list[Any]:
            base = {"league": lid, "season": season, "team": team_id, "timezone": "Asia/Seoul"}
            if lid in afc_extended_ids:
                return await api_get_all_pages("fixtures", base, ttl_seconds=30 * 60)
            raw = await api_get("fixtures", params=base, ttl_seconds=30 * 60)
            return raw.get("response", []) or []

        sem = asyncio.Semaphore(4)

        async def _guarded(lid: int, season: int) -> list[Any]:
            async with sem:
                return await _fetch_one(lid, season)

        tasks: list[Any] = []
        for lid in league_ids:
            seasons = seasons_afc if lid in afc_extended_ids else seasons_default
            for season in seasons:
                tasks.append(_guarded(lid, season))
        for chunk in await asyncio.gather(*tasks, return_exceptions=True):
            if isinstance(chunk, Exception):
                continue
            combined.extend(chunk)
    except RuntimeError as e:
        raise HTTPException(status_code=501, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=502, detail="API-Football 호출에 실패했습니다.") from e

    items: list[dict[str, Any]] = []
    seen: set[int] = set()
    for it in combined:
        league = (it or {}).get("league") or {}
        league_name = str(league.get("name") or "")
        if league_name and not _is_worldcup_related_league(league_name):
            continue
        fixture = (it or {}).get("fixture") or {}
        fid = fixture.get("id")
        if isinstance(fid, int):
            if fid in seen:
                continue
            seen.add(fid)
        teams = (it or {}).get("teams") or {}
        home = (teams or {}).get("home") or {}
        away = (teams or {}).get("away") or {}
        venue = (fixture or {}).get("venue") or {}
        opponent = None
        if int(home.get("id") or 0) == team_id:
            opponent = away.get("name")
        elif int(away.get("id") or 0) == team_id:
            opponent = home.get("name")
        stage = league.get("round") or league_name
        goals = (it or {}).get("goals") or {}
        hg = goals.get("home")
        ag = goals.get("away")
        score = None
        if hg is not None and ag is not None:
            if int(home.get("id") or 0) == team_id:
                score = f"{hg}-{ag}"
            else:
                score = f"{ag}-{hg}"
        dt = fixture.get("date")
        if isinstance(dt, str) and len(dt) >= 10:
            d = dt[:10]
            if d < _iso(from_d) or d > _iso(to_d):
                continue
        status = ((fixture.get("status") or {}) if isinstance(fixture.get("status"), dict) else {}) or {}
        status_short = status.get("short")
        items.append(
            {
                "id": fixture.get("id"),
                "date": dt,
                "league": league_name,
                "stage": stage,
                "opponent": opponent,
                "venue": venue.get("name"),
                "city": venue.get("city"),
                "status": status_short,
                "score": score,
            }
        )

    def _key(x: dict[str, Any]) -> tuple[int, str]:
        dts = str(x.get("date") or "")
        is_past = 1
        try:
            is_past = 1 if dts[:10] < _iso(today) else 0
        except Exception:
            is_past = 1
        return (is_past, dts)

    items.sort(key=_key)
    fixed_ids = _fixed_league_ids_from_env()
    payload = {
        "last_updated": _now_iso(),
        "team_id": team_id,
        "window": {"from": _iso(from_d), "to": _iso(to_d)},
        "league_source": "env_fixed" if fixed_ids else "auto_discovery",
        "league_ids": league_ids,
        "afc_qualifier_league_ids": sorted(afc_extended_ids & seen_lids),
        "afc_discovery_merged_count": len(afc_discovered),
        "fixtures": items,
    }
    _DERIVED_FIXTURES_CACHE["value"] = payload
    _DERIVED_FIXTURES_CACHE["expires_at"] = now_ts + 600
    return payload


@router.post("/prediction/win-probability")
async def win_probability(payload: dict[str, Any]) -> dict[str, Any]:
    opponent = str(payload.get("opponent") or "").strip()
    if not opponent:
        raise HTTPException(status_code=400, detail="opponent가 필요합니다.")
    try:
        fixtures_payload = await korea_fixtures()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail="최근 경기 데이터를 불러오지 못했습니다.") from e

    korea_recent_form = _calc_recent_form(fixtures_payload.get("fixtures") or [], limit=5)
    korea_elo = _elo_for("South Korea")
    opponent_elo = _elo_for(opponent)
    elo_diff = korea_elo - opponent_elo
    win_prob = _win_probability_from_elo(elo_diff)
    assumptions: list[str] = []
    if opponent_elo == _ELO_BASELINE and opponent.strip().lower() not in _ELO_TABLE:
        assumptions.append("상대팀 Elo는 기본값(1500)을 사용했습니다.")
    if not korea_recent_form.get("played"):
        assumptions.append("최근 경기 데이터가 부족해 Elo 중심으로 계산했습니다.")

    return {
        "input": {"team": "South Korea", "opponent": opponent},
        "features": {
            "team_elo": korea_elo,
            "opponent_elo": opponent_elo,
            "elo_diff": elo_diff,
            "recent_form_points": korea_recent_form.get("points"),
            "avg_goals_scored": (
                round(korea_recent_form["goals_scored"] / korea_recent_form["played"], 3)
                if korea_recent_form.get("played")
                else None
            ),
            "avg_goals_conceded": (
                round(korea_recent_form["goals_conceded"] / korea_recent_form["played"], 3)
                if korea_recent_form.get("played")
                else None
            ),
        },
        "probability": {"win": round(win_prob, 4), "draw_or_loss": round(1 - win_prob, 4)},
        "recent_form": korea_recent_form,
        "assumptions": assumptions,
        "formula": "win_probability = 1 / (1 + 10 ^ (-elo_diff / 400))",
    }
