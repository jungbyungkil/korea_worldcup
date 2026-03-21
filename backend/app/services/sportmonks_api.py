"""Sportmonks Football API v3 — 토큰 설정 시 팀 검색 등 (API-Football 보완).

문서: https://docs.sportmonks.com/v3/
"""

from __future__ import annotations

import os
from typing import Any
from urllib.parse import quote

import httpx

from app.services.http_cache import cache_get, cache_set

BASE = "https://api.sportmonks.com/v3/football"


def _token() -> str | None:
    v = os.getenv("SPORTMONKS_API_TOKEN", "").strip()
    return v or None


async def sm_get(path: str, params: dict[str, Any] | None = None, *, ttl_seconds: int = 3600) -> dict[str, Any]:
    token = _token()
    if not token:
        raise RuntimeError("Sportmonks가 설정되지 않았습니다. (SPORTMONKS_API_TOKEN)")

    q = dict(params or {})
    q["api_token"] = token
    url = f"{BASE}/{path.lstrip('/')}"
    cache_key = f"sm:{url}:{q}"
    hit = cache_get(cache_key)
    if hit is not None:
        return hit

    async with httpx.AsyncClient(timeout=25) as client:
        resp = await client.get(url, params=q)
        resp.raise_for_status()
        data = resp.json()

    cache_set(cache_key, data, ttl_seconds=ttl_seconds)
    return data


async def search_teams(query: str) -> dict[str, Any]:
    safe = quote(query.strip(), safe="")
    return await sm_get(f"teams/search/{safe}", ttl_seconds=1800)


def is_configured() -> bool:
    return _token() is not None
