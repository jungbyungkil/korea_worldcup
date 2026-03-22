"""대한민국 월드컵 본선 이력 (정적 JSON)."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException

from app.services.korea_wc_tsdb_korea_highlights import fetch_korea_world_cup_match_videos
from app.services.korea_wc_tournament_extras import wc_league_id

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


@router.get("/world-cup-tournament/{year}")
async def korea_world_cup_tournament_detail(year: int) -> dict[str, Any]:
    """대회 연도별 상세 + TheSportsDB: 대한민국이 뛴 본선 경기의 YouTube 링크 위주.

    (결승전 일반 하이라이트가 아니라, 한국 홈/원정 경기 이벤트의 strVideo)
    """
    hist = _load_history()
    tournaments = hist.get("tournaments") or []
    tourn = next((t for t in tournaments if isinstance(t, dict) and t.get("year") == year), None)
    if not tourn:
        raise HTTPException(status_code=404, detail="해당 연도 본선 이력이 없습니다.")

    lid = wc_league_id()
    highlights: list[dict[str, Any]] = []
    tsdb_error: str | None = None

    try:
        highlights, tsdb_error = await fetch_korea_world_cup_match_videos(year, lid)
    except RuntimeError as e:
        tsdb_error = str(e)
    except httpx.HTTPError as e:
        tsdb_error = f"TheSportsDB 연결 오류: {e}"

    return {
        "year": year,
        "tournament": tourn,
        "summary": hist.get("summary"),
        "team": hist.get("team"),
        "fifa_code": hist.get("fifa_code"),
        "tsdb": {
            "query_date": str(year),
            "query_label_ko": f"{year} FIFA 월드컵 · 대한민국 출전 경기 (TheSportsDB)",
            "league_id": lid,
            "source": "thesportsdb.com",
            "highlights": highlights,
            "error": tsdb_error,
            "note_ko": (
                "TheSportsDB에 등록된 경기별 영상(strVideo)입니다. "
                "모든 경기가 있지는 않을 수 있고, 초기 대회·무료 API 한도에 따라 비어 있을 수 있습니다. "
                "지역·저작권에 따라 재생이 제한될 수 있습니다."
            ),
        },
    }
