"""Football-Data.org v4 — API-Football 보완용 (무료 티어는 분당 호출 제한 → 캐시 권장)."""

from __future__ import annotations

import os
from typing import Any

import httpx

from app.services.http_cache import cache_get, cache_set

BASE = "https://api.football-data.org/v4"


def _token() -> str | None:
    v = os.getenv("FOOTBALL_DATA_ORG_TOKEN", "").strip()
    return v or None


async def fd_get(path: str, params: dict[str, Any] | None = None, *, ttl_seconds: int = 1800) -> dict[str, Any]:
    token = _token()
    if not token:
        raise RuntimeError("Football-Data.org이 설정되지 않았습니다. (FOOTBALL_DATA_ORG_TOKEN)")

    url = f"{BASE}/{path.lstrip('/')}"
    cache_key = f"fd:{url}:{params}"
    hit = cache_get(cache_key)
    if hit is not None:
        return hit

    headers = {"X-Auth-Token": token}
    async with httpx.AsyncClient(timeout=25) as client:
        resp = await client.get(url, headers=headers, params=params)
        resp.raise_for_status()
        data = resp.json()

    cache_set(cache_key, data, ttl_seconds=ttl_seconds)
    return data


def is_configured() -> bool:
    return _token() is not None
