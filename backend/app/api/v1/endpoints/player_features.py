"""한국·멕시코·남아공 대표팀 선수 feature API (스쿼드·부상·클럽 통계·옵션 라인업)."""

from __future__ import annotations

import asyncio
import os
import time
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException

from app.services.ai_best_xi import generate_best_xi
from app.services.ai_opponent_briefing import generate_opponent_briefing
from app.services.korea_player_features import build_korea_player_features_payload
from app.services.mexico_player_features import build_mexico_player_features_payload
from app.services.playoff_d_opponent_features import build_playoff_d_opponent_payload
from app.services.south_africa_player_features import build_south_africa_player_features_payload

router = APIRouter(prefix="/worldcup2026", tags=["worldcup2026"])

_AGG_CACHE: dict[str, Any] = {"expires_at": 0.0, "value": None}
_MEXICO_AGG_CACHE: dict[str, Any] = {"expires_at": 0.0, "value": None}
_SA_AGG_CACHE: dict[str, Any] = {"expires_at": 0.0, "value": None}
_PLAYOFF_D_AGG_CACHE: dict[str, Any] = {"expires_at": 0.0, "value": None}

_BRIEFING_CACHE: dict[str, Any] = {"expires_at": 0.0, "by_opponent": {}}


def _opponent_briefing_cache_ttl_seconds() -> int:
    try:
        return max(60, int(os.getenv("OPPONENT_BRIEFING_CACHE_SEC", "600")))
    except ValueError:
        return 600


def _cache_ttl_seconds() -> int:
    try:
        return max(30, int(os.getenv("API_FOOTBALL_PLAYER_FEATURES_CACHE_SEC", "300")))
    except ValueError:
        return 300


def _mexico_cache_ttl_seconds() -> int:
    try:
        return max(30, int(os.getenv("API_FOOTBALL_MEXICO_FEATURES_CACHE_SEC", "300")))
    except ValueError:
        return 300


def _south_africa_cache_ttl_seconds() -> int:
    try:
        return max(30, int(os.getenv("API_FOOTBALL_SOUTH_AFRICA_FEATURES_CACHE_SEC", "300")))
    except ValueError:
        return 300


@router.get("/korea/player-features")
async def korea_player_features() -> dict[str, Any]:
    """API-Football 기반 한국 대표팀 선수 feature (캐시됨).

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


@router.get("/mexico/player-features")
async def mexico_player_features() -> dict[str, Any]:
    """멕시코 대표팀 — 스쿼드에서 휴리스틱 베스트 11(4-3-3 슬롯) + (옵션) 클럽 통계.

    한국 페이지와 달리 전체 스쿼드 테이블 대신 ``starting_xi`` 중심 응답.
    """
    now = time.time()
    ttl = _mexico_cache_ttl_seconds()
    cached = _MEXICO_AGG_CACHE.get("value")
    if cached is not None and float(_MEXICO_AGG_CACHE.get("expires_at") or 0) > now:
        return cached

    try:
        payload = await build_mexico_player_features_payload()
    except RuntimeError as e:
        raise HTTPException(status_code=501, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"멕시코 선수 데이터 조회 실패: {e!s}") from e

    _MEXICO_AGG_CACHE["value"] = payload
    _MEXICO_AGG_CACHE["expires_at"] = now + ttl
    return payload


@router.post("/mexico/player-features/invalidate-cache")
async def invalidate_mexico_player_features_cache() -> dict[str, str]:
    _MEXICO_AGG_CACHE["value"] = None
    _MEXICO_AGG_CACHE["expires_at"] = 0.0
    return {"status": "ok"}


@router.get("/south-africa/player-features")
async def south_africa_player_features() -> dict[str, Any]:
    """남아프리카 공화국 대표팀 — 휴리스틱 베스트 11(4-3-3) + (옵션) 클럽 통계."""
    now = time.time()
    ttl = _south_africa_cache_ttl_seconds()
    cached = _SA_AGG_CACHE.get("value")
    if cached is not None and float(_SA_AGG_CACHE.get("expires_at") or 0) > now:
        return cached

    try:
        payload = await build_south_africa_player_features_payload()
    except RuntimeError as e:
        raise HTTPException(status_code=501, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"남아공 선수 데이터 조회 실패: {e!s}") from e

    _SA_AGG_CACHE["value"] = payload
    _SA_AGG_CACHE["expires_at"] = now + ttl
    return payload


@router.post("/south-africa/player-features/invalidate-cache")
async def invalidate_south_africa_player_features_cache() -> dict[str, str]:
    _SA_AGG_CACHE["value"] = None
    _SA_AGG_CACHE["expires_at"] = 0.0
    return {"status": "ok"}


@router.get("/group-a-playoff-d/player-features")
async def group_a_playoff_d_player_features() -> dict[str, Any]:
    """A조 1차전 상대(UEFA 플레이오프 D 승자).

    - ``GROUP_A_PLAYOFF_D_TEAM_SEARCH`` 가 비어 있으면 ``opponent_status: tbd`` 와 메타만 반환.
    - 값이 있으면 해당 팀을 API-Football로 검색해 멕시코·남아공과 동일 형태의 경량 페이로드.
    """
    now = time.time()
    ttl = _playoff_d_cache_ttl_seconds()
    cached = _PLAYOFF_D_AGG_CACHE.get("value")
    if cached is not None and float(_PLAYOFF_D_AGG_CACHE.get("expires_at") or 0) > now:
        return cached

    try:
        payload = await build_playoff_d_opponent_payload()
    except RuntimeError as e:
        raise HTTPException(status_code=501, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"플레이오프 D 상대 데이터 조회 실패: {e!s}") from e

    _PLAYOFF_D_AGG_CACHE["value"] = payload
    _PLAYOFF_D_AGG_CACHE["expires_at"] = now + ttl
    return payload


@router.post("/group-a-playoff-d/player-features/invalidate-cache")
async def invalidate_playoff_d_player_features_cache() -> dict[str, str]:
    _PLAYOFF_D_AGG_CACHE["value"] = None
    _PLAYOFF_D_AGG_CACHE["expires_at"] = 0.0
    return {"status": "ok"}


def _normalize_opponent_briefing_key(raw: str) -> str | None:
    k = raw.strip().lower().replace("-", "_")
    if k in ("mexico", "méxico"):
        return "mexico"
    if k in ("south_africa", "southafrica", "sa", "남아공"):
        return "south_africa"
    if k in ("playoff_d", "playoffd", "first_match", "group_a_first", "1차전", "플레이오프"):
        return "playoff_d"
    return None


@router.post("/korea/opponent-briefing")
async def korea_opponent_briefing(body: dict[str, Any]) -> dict[str, Any]:
    """한국 스쿼드·부상 + 상대(멕시코/남아공/플레이오프 D) 요약을 넣어 AI 전술·스쿼드 브리핑(JSON).

    Body: ``{ "opponent": "mexico" | "south_africa" | "playoff_d" }``
    """
    opp_key = _normalize_opponent_briefing_key(str(body.get("opponent") or ""))
    if not opp_key:
        raise HTTPException(
            status_code=400,
            detail="opponent는 mexico, south_africa, playoff_d 중 하나여야 합니다.",
        )

    labels_ko = {
        "mexico": "멕시코",
        "south_africa": "남아프리카 공화국",
        "playoff_d": "A조 1차전 (UEFA 플레이오프 D 승자)",
    }
    label = labels_ko[opp_key]

    now = time.time()
    ttl = _opponent_briefing_cache_ttl_seconds()
    bucket = _BRIEFING_CACHE["by_opponent"]
    cached = bucket.get(opp_key)
    if isinstance(cached, dict) and float(cached.get("expires_at") or 0) > now:
        return cached["value"]

    try:
        if opp_key == "mexico":
            korea_p, opp_p = await asyncio.gather(
                build_korea_player_features_payload(),
                build_mexico_player_features_payload(),
            )
        elif opp_key == "south_africa":
            korea_p, opp_p = await asyncio.gather(
                build_korea_player_features_payload(),
                build_south_africa_player_features_payload(),
            )
        else:
            korea_p, opp_p = await asyncio.gather(
                build_korea_player_features_payload(),
                build_playoff_d_opponent_payload(),
            )
    except RuntimeError as e:
        raise HTTPException(status_code=501, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"선수 데이터 조회 실패: {e!s}") from e

    if korea_p.get("error") == "korea_team_not_found":
        raise HTTPException(status_code=502, detail="한국 대표팀 스쿼드를 찾지 못했습니다.")

    try:
        result = await generate_opponent_briefing(
            opp_key,
            korea_payload=korea_p,
            opponent_payload=opp_p,
            opponent_label_ko=label,
        )
    except RuntimeError as e:
        msg = str(e)
        if "OPENAI_API_KEY" in msg:
            raise HTTPException(status_code=501, detail=msg) from e
        if msg == "OPENAI_HTTP_ERROR":
            raise HTTPException(status_code=502, detail="AI 서버와 통신하지 못했습니다.") from e
        raise HTTPException(status_code=502, detail=msg) from e
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"AI HTTP 오류: {e}") from e

    bucket[opp_key] = {"expires_at": now + ttl, "value": result}
    _BRIEFING_CACHE["by_opponent"] = bucket
    return result


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
