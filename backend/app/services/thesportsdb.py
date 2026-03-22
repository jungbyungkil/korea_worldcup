"""TheSportsDB v1 — 팀 배지·로고 등 UI 메타데이터 (API-Football 호출 절약용).

무료 사용: v1 Base URL + URL 경로에 API 키 삽입 (공식 문서).
  https://www.thesportsdb.com/api/v1/json/123/searchteams.php?t=Arsenal

공식 무료 테스트 키는 ``123``. 프리미엄 키는 프로필의 키를 THESPORTSDB_API_KEY 로 설정.
무료 티어는 분당 요청 제한(429)이 있음 — 문서: https://www.thesportsdb.com/documentation
"""

from __future__ import annotations

import os
from typing import Any
from urllib.parse import quote

import httpx

from app.services.http_cache import cache_get, cache_set

# TheSportsDB v1 (무료) — 문서의 Base URL
BASE = "https://www.thesportsdb.com/api/v1/json"
# 공식 문서에 명시된 무료 API 키
FREE_API_KEY = "123"


def _api_key() -> str:
    raw = (os.getenv("THESPORTSDB_API_KEY") or "").strip()
    if not raw:
        return FREE_API_KEY
    # 예전 예시/오해로 쓰이던 "1" → 공식 무료 키로 통일
    if raw == "1":
        return FREE_API_KEY
    return raw


async def tsdb_get_json(path: str, *, ttl_seconds: int = 86400) -> dict[str, Any]:
    """path 예: searchteams.php?t=South%20Korea"""
    key = _api_key()
    url = f"{BASE}/{key}/{path.lstrip('/')}"
    cache_key = f"tsdb:{url}"
    hit = cache_get(cache_key)
    if hit is not None:
        return hit

    headers = {
        "User-Agent": "KoreaWorldCupApp/1.0 (TheSportsDB v1 JSON client)",
        "Accept": "application/json",
    }

    async with httpx.AsyncClient(timeout=25, headers=headers) as client:
        resp = await client.get(url)
        if resp.status_code == 429:
            raise RuntimeError(
                "TheSportsDB 요청 한도(분당 30회, 무료)에 걸렸습니다. 잠시 후 다시 시도하세요."
            )
        resp.raise_for_status()
        data = resp.json()

    cache_set(cache_key, data, ttl_seconds=ttl_seconds)
    return data


async def fetch_events_season(
    *,
    league_id: int,
    season: str,
    ttl_seconds: int = 86400,
) -> list[dict[str, Any]]:
    """시즌별 경기 목록 (무료 티어는 건수 제한 있음). eventsseason.php"""
    s = season.strip()
    path = f"eventsseason.php?id={int(league_id)}&s={quote(s)}"
    data = await tsdb_get_json(path, ttl_seconds=ttl_seconds)
    raw = data.get("events")
    if not raw:
        return []
    if isinstance(raw, dict):
        return [raw]
    if isinstance(raw, list):
        return [x for x in raw if isinstance(x, dict)]
    return []


async def search_events(
    *,
    e: str,
    season: str | None = None,
    ttl_seconds: int = 86400,
) -> list[dict[str, Any]]:
    """이벤트 이름 검색. searchevents.php — e 는 보통 Home_vs_Away 형식."""
    q = quote(e.strip())
    path = f"searchevents.php?e={q}"
    if season and season.strip():
        path += f"&s={quote(season.strip())}"
    data = await tsdb_get_json(path, ttl_seconds=ttl_seconds)
    raw = data.get("event")
    if raw is None:
        return []
    if isinstance(raw, dict):
        return [raw]
    if isinstance(raw, list):
        return [x for x in raw if isinstance(x, dict)]
    return []


async def fetch_tv_highlights(
    *,
    date_iso: str,
    league_id: int | None = None,
    sport: str = "Soccer",
    ttl_seconds: int = 3600,
) -> list[dict[str, Any]]:
    """TheSportsDB v1 Video — 날짜별 하이라이트(YouTube 링크 등).

    예: FIFA 월드컵 리그 ID(기본 4429) + 결승일 근처 날짜.
    문서: eventshighlights.php?d=YYYY-MM-DD&s=Soccer&l=4429
    """
    d = date_iso.strip()
    path = f"eventshighlights.php?d={quote(d)}&s={quote(sport)}"
    if league_id is not None:
        path += f"&l={int(league_id)}"
    data = await tsdb_get_json(path, ttl_seconds=ttl_seconds)
    raw = data.get("tvhighlights")
    if not raw:
        return []
    if isinstance(raw, dict):
        return [raw]
    if isinstance(raw, list):
        return [x for x in raw if isinstance(x, dict)]
    return []


def slim_tv_highlight(row: dict[str, Any]) -> dict[str, Any | None]:
    out: dict[str, Any | None] = {
        "id_event": row.get("idEvent"),
        "event_name": row.get("strEvent"),
        "video_url": row.get("strVideo"),
        "thumb_url": row.get("strThumb"),
        "poster_url": row.get("strPoster"),
        "season": row.get("strSeason"),
        "league": row.get("strLeague"),
    }
    if row.get("dateEvent"):
        out["date_event"] = row.get("dateEvent")
    return out


async def search_team_first(name: str) -> dict[str, Any] | None:
    q = quote(name.strip())
    data = await tsdb_get_json(f"searchteams.php?t={q}", ttl_seconds=86400)
    teams = data.get("teams")
    if not teams:
        return None
    if isinstance(teams, list) and teams:
        return teams[0]
    if isinstance(teams, dict):
        return teams
    return None


def slim_team_media(row: dict[str, Any]) -> dict[str, Any | None]:
    return {
        "id": row.get("idTeam"),
        "name": row.get("strTeam"),
        "badge": row.get("strTeamBadge"),
        "logo": row.get("strTeamLogo"),
        "jersey": row.get("strTeamJersey"),
        "website": row.get("strWebsite"),
        "formed": row.get("intFormedYear"),
        "stadium": row.get("strStadium"),
        "description": (row.get("strDescriptionEN") or row.get("strDescription"))[:400]
        if (row.get("strDescriptionEN") or row.get("strDescription"))
        else None,
    }
