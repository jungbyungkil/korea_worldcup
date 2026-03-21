"""대한민국 국가대표 관련 선수 feature 수집 (API-Football).

- 스쿼드(players/squads)
- 부상/결장(injuries)
- 선수 프로필 + 시즌별 통계(players?id=) — 클럽 리그 기준 출전·분 등
- 최근 대표팀 경기 라인업(fixtures + lineups) — 요청 수가 많아 기본은 끔

개별 호출은 ``api_football.api_get`` 캐시(TTL)를 사용합니다.
집계 응답은 엔드포인트 레벨에서 짧게 캐시합니다.
"""

from __future__ import annotations

import asyncio
import os
import unicodedata
from datetime import datetime, timezone
from typing import Any

from app.services.api_football import api_get, api_get_all_pages

KOREA_QUERY = "Korea"


def _int_env(name: str, default: int) -> int:
    raw = os.getenv(name)
    if not raw:
        return default
    try:
        return int(raw.strip())
    except ValueError:
        return default


def _bool_env(name: str, default: bool = False) -> bool:
    v = (os.getenv(name) or "").strip().lower()
    if not v:
        return default
    return v in ("1", "true", "yes", "on")


def _accent_fold(s: str) -> str:
    """소문자 + 결합분음 부호 제거 (예: México → mexico)."""
    if not s:
        return ""
    nk = unicodedata.normalize("NFKD", s.strip())
    return "".join(c for c in nk if not unicodedata.combining(c)).lower()


def _junior_or_womens_name(folded_name: str) -> bool:
    """U17/U20 등 연령대·여자 대표팀은 시니어 남자 대표팀보다 후순위로 둔다."""
    n = f" {folded_name} "
    if "women" in n or "woman" in n or "female" in n:
        return True
    for token in (" u17", " u18", " u19", " u20", " u21", " u23", " olympic"):
        if token in n:
            return True
    return False


def _score_national_team_candidate(
    item: dict[str, Any],
    *,
    folded_exact: frozenset[str],
    name_bonus_substrings: frozenset[str],
    country_bonus: frozenset[str],
) -> int:
    team = (item or {}).get("team") or {}
    name = _accent_fold(str(team.get("name") or ""))
    country = _accent_fold(str(team.get("country") or ""))
    national = bool(team.get("national"))
    score = 0
    if national:
        score += 50
    if name in folded_exact:
        score += 40
    for sub in name_bonus_substrings:
        fs = _accent_fold(sub)
        if fs and fs in name:
            score += 12
            break
    for c in country_bonus:
        fc = _accent_fold(c)
        if fc and (fc == country or fc in country):
            score += 10
            break
    if national and _junior_or_womens_name(name):
        score -= 55
    return score


def _pick_best_team_id(
    candidates: list[Any],
    *,
    exact_team_names: frozenset[str],
    name_bonus_substrings: frozenset[str],
    country_bonus: frozenset[str],
    min_score: int,
) -> int | None:
    folded_exact = frozenset(_accent_fold(x) for x in exact_team_names)
    best: dict[str, Any] | None = None
    best_score = -10_000
    for item in candidates:
        if not isinstance(item, dict):
            continue
        s = _score_national_team_candidate(
            item,
            folded_exact=folded_exact,
            name_bonus_substrings=name_bonus_substrings,
            country_bonus=country_bonus,
        )
        if s > best_score:
            best, best_score = item, s
    if best is None or best_score < min_score:
        return None
    team = (best or {}).get("team") or {}
    tid = team.get("id")
    return tid if isinstance(tid, int) else None


def _pick_team_id_by_exact_name_no_junior(
    candidates: list[Any],
    *,
    exact_team_names: frozenset[str],
) -> int | None:
    """national 플래그가 빠진 API 대비: 국가명과 정확히 일치하는 시니어 팀 ID."""
    folded_exact = frozenset(_accent_fold(x) for x in exact_team_names)
    for item in candidates:
        if not isinstance(item, dict):
            continue
        team = (item or {}).get("team") or {}
        name = _accent_fold(str(team.get("name") or ""))
        if name in folded_exact and not _junior_or_womens_name(name):
            tid = team.get("id")
            if isinstance(tid, int):
                return tid
    return None


async def find_national_team_id(
    search_query: str,
    *,
    exact_team_names: frozenset[str],
    name_bonus_substrings: frozenset[str] | None = None,
    country_bonus: frozenset[str] | None = None,
    teams_country_fallback: str | None = None,
) -> int | None:
    """API-Football ``teams?search=`` 로 국가대표 팀 ID 탐색.

    검색 결과에 대표팀이 없거나 클럽만 앞에 오는 경우 ``teams?country=`` 로 재시도한다.
    """
    name_bonus_substrings = name_bonus_substrings or frozenset()
    country_bonus = country_bonus or frozenset()

    data = await api_get("teams", params={"search": search_query}, ttl_seconds=24 * 3600)
    candidates = data.get("response", []) or []

    tid = _pick_best_team_id(
        candidates,
        exact_team_names=exact_team_names,
        name_bonus_substrings=name_bonus_substrings,
        country_bonus=country_bonus,
        min_score=50,
    )
    if tid is not None:
        return tid

    if not teams_country_fallback:
        return None

    try:
        extra = await api_get_all_pages(
            "teams",
            params={"country": teams_country_fallback},
            ttl_seconds=24 * 3600,
            max_pages=20,
        )
    except Exception:
        extra = []

    tid = _pick_best_team_id(
        extra,
        exact_team_names=exact_team_names,
        name_bonus_substrings=name_bonus_substrings,
        country_bonus=country_bonus,
        min_score=50,
    )
    if tid is not None:
        return tid

    return _pick_team_id_by_exact_name_no_junior(extra, exact_team_names=exact_team_names)


async def find_korea_national_team_id() -> int | None:
    """국가대표 'Korea Republic' 팀 ID."""
    return await find_national_team_id(
        KOREA_QUERY,
        exact_team_names=frozenset({"korea republic", "south korea"}),
        name_bonus_substrings=frozenset({"korea"}),
        country_bonus=frozenset({"korea", "south korea", "korea republic"}),
    )


async def fetch_squad(team_id: int) -> list[dict[str, Any]]:
    """GET players/squads — 선수 id, 포지션, 번호 등."""
    data = await api_get("players/squads", params={"team": team_id}, ttl_seconds=6 * 3600)
    resp = data.get("response") or []
    if not resp:
        return []
    first = resp[0] if isinstance(resp, list) else resp
    players = (first or {}).get("players") or []
    return players if isinstance(players, list) else []


async def fetch_injuries(team_id: int, season: int) -> list[dict[str, Any]]:
    """GET injuries — 부상/결장 이벤트 (시즌 기준)."""
    data = await api_get("injuries", params={"team": team_id, "season": season}, ttl_seconds=30 * 60)
    return data.get("response") or []


async def fetch_player_full(player_id: int) -> dict[str, Any] | None:
    """GET players?id= — 통계 블록(리그·시즌별) 포함."""
    data = await api_get("players", params={"id": player_id}, ttl_seconds=30 * 60)
    resp = data.get("response") or []
    if not resp:
        return None
    return resp[0] if isinstance(resp, list) else resp


async def fetch_recent_fixture_ids(team_id: int, last: int = 3) -> list[int]:
    """최근 대표팀 경기 fixture id (라인업 조회용)."""
    data = await api_get("fixtures", params={"team": team_id, "last": last}, ttl_seconds=15 * 60)
    out: list[int] = []
    for it in data.get("response") or []:
        fx = (it or {}).get("fixture") or {}
        fid = fx.get("id")
        if isinstance(fid, int):
            out.append(fid)
    return out


async def fetch_lineup_for_fixture(fixture_id: int) -> list[dict[str, Any]]:
    """GET fixtures/lineups — 한 경기의 양 팀 라인업."""
    data = await api_get("fixtures/lineups", params={"fixture": fixture_id}, ttl_seconds=60 * 60)
    return data.get("response") or []


def _pick_latest_statistics_blocks(entry: dict[str, Any]) -> list[dict[str, Any]]:
    stats = entry.get("statistics")
    if not isinstance(stats, list):
        return []
    # 최근 시즌이 뒤에 오는 경우가 많아 역순으로 정렬해 본다
    def _season_key(s: dict[str, Any]) -> int:
        g = s.get("games") or {}
        league = s.get("league") or {}
        # games.appearances 등에서 season 힌트
        for key in ("season",):
            if key in league:
                try:
                    return int(str(league.get(key))[:4])
                except (TypeError, ValueError):
                    pass
        return 0

    sorted_stats = sorted(stats, key=_season_key, reverse=True)
    return sorted_stats


def _summarize_stat_block(block: dict[str, Any]) -> dict[str, Any]:
    """통계 블록에서 출전·골 등 추출 (API 필드명은 버전에 따라 다를 수 있음)."""
    league = block.get("league") or {}
    team = block.get("team") or {}
    games = block.get("games") or {}
    goals = block.get("goals") or {}
    # API는 종종 "appearences" 철자 사용
    apps = games.get("appearences") or games.get("appearances")
    minutes = games.get("minutes")
    return {
        "league_id": league.get("id"),
        "league_name": league.get("name"),
        "league_season": league.get("season"),
        "club_id": team.get("id"),
        "club_name": team.get("name"),
        "appearances": apps,
        "minutes": minutes,
        "goals_total": goals.get("total"),
        "position": games.get("position"),
        "rating": games.get("rating"),
    }


async def build_korea_player_features_payload() -> dict[str, Any]:
    """스쿼드 + 부상 + (옵션) 선수별 최근 시즌 통계 요약 + (옵션) 최근 라인업."""
    team_id = await find_korea_national_team_id()
    now = datetime.now(timezone.utc).isoformat()
    if not team_id:
        return {
            "last_updated": now,
            "team_id": None,
            "error": "korea_team_not_found",
            "squad": [],
            "injuries": [],
            "players": [],
            "recent_lineups": [],
        }

    season = _int_env("API_FOOTBALL_INJURY_SEASON", datetime.now().year)
    # 2026 북중미 WC 본선 명단 상한 26명(FIFA, 최소 23~최대 26)에 맞춘 기본값
    limit = max(1, min(_int_env("API_FOOTBALL_PLAYER_FEATURE_LIMIT", 26), 100))
    include_stats = _bool_env("API_FOOTBALL_PLAYER_INCLUDE_CLUB_STATS", True)
    include_lineups = _bool_env("API_FOOTBALL_PLAYER_INCLUDE_LINEUPS", False)
    lineup_fixtures = _int_env("API_FOOTBALL_LINEUP_FIXTURES", 2)

    squad = await fetch_squad(team_id)
    injuries_raw = await fetch_injuries(team_id, season)

    injuries_normalized: list[dict[str, Any]] = []
    for it in injuries_raw:
        pl = (it or {}).get("player") or {}
        injuries_normalized.append(
            {
                "player_id": pl.get("id"),
                "player_name": pl.get("name"),
                "type": it.get("type"),
                "reason": it.get("reason"),
                "league": ((it or {}).get("league") or {}).get("name"),
            }
        )

    squad_slice = [p for p in squad[:limit] if isinstance(p.get("id"), int)]
    sem = asyncio.Semaphore(4)

    async def _one_player(p: dict[str, Any]) -> dict[str, Any]:
        pid = int(p["id"])
        row: dict[str, Any] = {
            "id": pid,
            "name": p.get("name"),
            "number": p.get("number"),
            "position": p.get("position"),
            "age": p.get("age"),
        }
        if include_stats:
            async with sem:
                full = await fetch_player_full(pid)
            if full:
                blocks = _pick_latest_statistics_blocks(full)
                if blocks:
                    row["club_stats_latest"] = _summarize_stat_block(blocks[0])
                    row["club_stats_seasons_count"] = len(blocks)
        return row

    players_out = await asyncio.gather(*[_one_player(p) for p in squad_slice])

    lineups_out: list[dict[str, Any]] = []
    if include_lineups:
        fids = await fetch_recent_fixture_ids(team_id, last=max(1, min(lineup_fixtures, 10)))
        for fid in fids:
            lu = await fetch_lineup_for_fixture(fid)
            lineups_out.append({"fixture_id": fid, "lineups": lu})

    return {
        "last_updated": now,
        "team_id": team_id,
        "season_used_for_injuries": season,
        "squad_size": len(squad),
        "players_enriched": len(players_out),
        "config": {
            "player_limit": limit,
            "include_club_stats": include_stats,
            "include_lineups": include_lineups,
            "lineup_fixtures": lineup_fixtures if include_lineups else 0,
        },
        "squad": squad,
        "injuries": injuries_normalized,
        "players": players_out,
        "recent_lineups": lineups_out,
    }
