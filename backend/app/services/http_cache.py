"""여러 외부 API 클라이언트가 공유하는 인메모리 TTL 캐시."""

from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Any

_CACHE: dict[str, "CacheEntry"] = {}


@dataclass(frozen=True)
class CacheEntry:
    value: Any
    expires_at: float


def cache_get(key: str) -> Any | None:
    entry = _CACHE.get(key)
    if not entry:
        return None
    if time.time() >= entry.expires_at:
        _CACHE.pop(key, None)
        return None
    return entry.value


def cache_set(key: str, value: Any, *, ttl_seconds: int) -> None:
    _CACHE[key] = CacheEntry(value=value, expires_at=time.time() + ttl_seconds)
