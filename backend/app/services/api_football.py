from __future__ import annotations

import os
from typing import Any

import httpx

from app.services.http_cache import cache_get, cache_set


def _base_url() -> str:
    return os.getenv("API_FOOTBALL_BASE_URL", "https://v3.football.api-sports.io").rstrip("/")


def _key() -> str | None:
    v = os.getenv("API_FOOTBALL_KEY")
    return v.strip() if v else None


async def api_get(path: str, params: dict[str, Any] | None = None, ttl_seconds: int = 900) -> dict[str, Any]:
    """API-Football GET with in-memory cache."""
    key = _key()
    if not key:
        raise RuntimeError("API-Football이 설정되지 않았습니다. (API_FOOTBALL_KEY 필요)")

    url = f"{_base_url()}/{path.lstrip('/')}"
    cache_key = f"af:{url}:{params}"
    cached = cache_get(cache_key)
    if cached is not None:
        return cached

    headers = {"x-apisports-key": key}
    async with httpx.AsyncClient(timeout=25) as client:
        resp = await client.get(url, headers=headers, params=params)
        resp.raise_for_status()
        data = resp.json()

    cache_set(cache_key, data, ttl_seconds=ttl_seconds)
    return data


async def api_get_all_pages(
    path: str,
    params: dict[str, Any] | None = None,
    *,
    ttl_seconds: int = 900,
    max_pages: int = 30,
) -> list[Any]:
    """Fetch all pages (paging.current / paging.total)."""
    base = dict(params or {})
    merged: list[Any] = []
    page = 1
    while page <= max_pages:
        p = {**base, "page": page}
        data = await api_get(path, params=p, ttl_seconds=ttl_seconds)
        chunk = data.get("response") or []
        if isinstance(chunk, list):
            merged.extend(chunk)
        paging = data.get("paging") or {}
        try:
            current = int(paging.get("current") or page)
            total = int(paging.get("total") or 1)
        except (TypeError, ValueError):
            break
        if current >= total:
            break
        page = current + 1
    return merged
