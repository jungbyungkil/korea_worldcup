"""대한민국 월드컵 본선 이력 (정적 JSON)."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from fastapi import APIRouter

router = APIRouter(prefix="/korea", tags=["korea"])

_DATA_PATH = Path(__file__).resolve().parent.parent.parent.parent / "data" / "korea_world_cup_history.json"
_CACHE: dict[str, Any] | None = None


def _load_history() -> dict[str, Any]:
    global _CACHE
    if _CACHE is not None:
        return _CACHE
    with open(_DATA_PATH, encoding="utf-8") as f:
        _CACHE = json.load(f)
    return _CACHE


@router.get("/world-cup-history")
def korea_world_cup_history() -> dict[str, Any]:
    """한국 축구 국가대표 FIFA 월드컵 본선 출전 이력 (요약 + 대회별)."""
    return _load_history()
