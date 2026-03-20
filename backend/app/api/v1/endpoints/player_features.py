"""국대 선수 feature API (스쿼드·부상·클럽 통계·옵션 라인업)."""

from __future__ import annotations

import os
import time
from typing import Any

from fastapi import APIRouter, HTTPException

from app.services.ai_best_xi import generate_best_xi
from app.services.korea_player_features import build_korea_player_features_payload

router = APIRouter(prefix="/worldcup2026", tags=["worldcup2026"])

_AGG_CACHE: dict[str, Any] = {"expires_at": 0.0, "value": None}


def _cache_ttl_seconds() -> int:
    try:
        return max(30, int(os.getenv("API_FOOTBALL_PLAYER_FEATURES_CACHE_SEC", "300")))
    except ValueError:
        return 300


@router.get("/korea/player-features")
async def korea_player_features() -> dict[str, Any]:
    """API-Football 기반 대한민국 국대 선수 feature (캐시됨).

    - ``squad``: 전체 스쿼드 원본
    - ``players``: 상위 N명에 클럽 시즌 통계 요약(옵션)
    - ``injuries``: 부상/결장 (시즌은 ``API_FOOTBALL_INJURY_SEASON``)
    - ``recent_lineups``: 최근 경기 라인업 (``API_FOOTBALL_PLAYER_INCLUDE_LINEUPS=1`` 일 때)
    """
    now = time.time()
    ttl = _cache_ttl_seconds()
    cached = _AGG_CACHE.get("value")
    if cached is not None and float(_AGG_CACHE.get("expires_at") or 0) > now:
        return cached

    try:
        payload = await build_korea_player_features_payload()
    except RuntimeError as e:
        raise HTTPException(status_code=501, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"선수 feature 조회 실패: {e!s}") from e

    _AGG_CACHE["value"] = payload
    _AGG_CACHE["expires_at"] = now + ttl
    return payload


@router.post("/korea/player-features/invalidate-cache")
async def invalidate_player_features_cache() -> dict[str, str]:
    """집계 캐시만 비웁니다 (api_get 단위 캐시는 유지)."""
    _AGG_CACHE["value"] = None
    _AGG_CACHE["expires_at"] = 0.0
    return {"status": "ok"}


@router.post("/korea/best-xi")
async def korea_best_xi(body: dict[str, Any]) -> dict[str, Any]:
    """전술(포메이션)을 주면 스쿼드에서 베스트 11을 AI가 고릅니다.

    요청 JSON 예:
    - ``formation``: ``4-3-3``, ``4-4-2``, ``4-1-4-1``, ``3-5-2``, ``5-3-2``
    - ``squad``: ``[{ "id", "name", "position", "age", ... }]`` (프론트가 player-features 기준으로 구성)
    - ``injured_player_ids`` (선택): 부상 선수 ``player_id`` 목록
    """
    formation = str(body.get("formation") or "").strip()
    squad = body.get("squad") or []
    raw_injured = body.get("injured_player_ids") or []
    injured_ids: list[int] = []
    for x in raw_injured if isinstance(raw_injured, list) else []:
        try:
            injured_ids.append(int(x))
        except (TypeError, ValueError):
            continue

    if not isinstance(squad, list) or not squad:
        raise HTTPException(status_code=400, detail="squad 배열이 필요합니다.")

    try:
        result = await generate_best_xi(formation, squad, injured_ids)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except RuntimeError as e:
        msg = str(e)
        if "OPENAI_API_KEY" in msg:
            raise HTTPException(status_code=501, detail=msg) from e
        raise HTTPException(status_code=502, detail=msg) from e
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"베스트 11 생성 실패: {e!s}") from e

    return result
