"""TheSportsDB v1 — 팀 배지·로고 등 UI 메타데이터 (API-Football 호출 절약용).

무료 키 `1`은 데모용(느릴 수 있음). Patreon 키는 THESPORTSDB_API_KEY 로 설정.
"""

from __future__ import annotations

import os
from typing import Any
from urllib.parse import quote

import httpx

from app.services.http_cache import cache_get, cache_set

BASE = "https://www.thesportsdb.com/api/v1/json"


def _api_key() -> str:
    return (os.getenv("THESPORTSDB_API_KEY") or "1").strip() or "1"


async def tsdb_get_json(path: str, *, ttl_seconds: int = 86400) -> dict[str, Any]:
    """path 예: searchteams.php?t=South%20Korea"""
    key = _api_key()
    url = f"{BASE}/{key}/{path.lstrip('/')}"
    cache_key = f"tsdb:{url}"
    hit = cache_get(cache_key)
    if hit is not None:
        return hit

    async with httpx.AsyncClient(timeout=25) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        data = resp.json()

    cache_set(cache_key, data, ttl_seconds=ttl_seconds)
    return data


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
