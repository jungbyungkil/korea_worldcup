from __future__ import annotations

import os
import time
from dataclasses import dataclass
from typing import Any

import httpx


@dataclass(frozen=True)
class CacheEntry:
    value: Any
    expires_at: float


_CACHE: dict[str, CacheEntry] = {}


def _base_url() -> str:
    return os.getenv("API_FOOTBALL_BASE_URL", "https://v3.football.api-sports.io").rstrip("/")


def _key() -> str | None:
    v = os.getenv("API_FOOTBALL_KEY")
    return v.strip() if v else None


def _get_cached(key: str) -> Any | None:
    entry = _CACHE.get(key)
    if not entry:
        return None
    if time.time() >= entry.expires_at:
        _CACHE.pop(key, None)
        return None
    return entry.value


def _set_cached(key: str, value: Any, ttl_seconds: int) -> None:
    _CACHE[key] = CacheEntry(value=value, expires_at=time.time() + ttl_seconds)


async def api_get(path: str, params: dict[str, Any] | None = None, ttl_seconds: int = 900) -> dict[str, Any]:
    """API-Football GET with in-memory cache."""
    key = _key()
    if not key:
        raise RuntimeError("API-Football이 설정되지 않았습니다. (API_FOOTBALL_KEY 필요)")

    url = f"{_base_url()}/{path.lstrip('/')}"
    cache_key = f"GET:{url}:{params}"
    cached = _get_cached(cache_key)
    if cached is not None:
        return cached

    headers = {"x-apisports-key": key}
    async with httpx.AsyncClient(timeout=25) as client:
        resp = await client.get(url, headers=headers, params=params)
        resp.raise_for_status()
        data = resp.json()

    _set_cached(cache_key, data, ttl_seconds=ttl_seconds)
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
