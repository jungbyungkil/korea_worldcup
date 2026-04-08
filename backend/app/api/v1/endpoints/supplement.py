"""
API-Football 보완: Football-Data.org, TheSportsDB, Sportmonks (선택 토큰).
호출량 분산·UI 메타데이터용 — 각 서비스 약관·쿼터를 준수하세요.
"""

from __future__ import annotations

import os
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException, Query

from app.services import football_data_org, sportmonks_api, thesportsdb

router = APIRouter(prefix="/worldcup2026/supplement", tags=["supplement"])

A_GROUP_TEAMS: dict[str, str] = {
    "korea": "South Korea",
    "czech_republic": "Czech Republic",
    "mexico": "Mexico",
    "south_africa": "South Africa",
}


def _http_from_tsdb_runtime(e: RuntimeError) -> HTTPException:
    msg = str(e)
    if "TheSportsDB 요청 한도" in msg:
        return HTTPException(status_code=429, detail=msg)
    return HTTPException(status_code=502, detail=msg)


def _thesportsdb_custom_key() -> bool:
    """비어 있거나 공식 무료 키(123)·레거시 1이면 커스텀이 아님."""
    k = os.getenv("THESPORTSDB_API_KEY", "").strip()
    if not k:
        return False
    return k not in ("123", "1")


@router.get("/sources")
async def supplement_sources() -> dict[str, Any]:
    return {
        "api_football": bool(os.getenv("API_FOOTBALL_KEY", "").strip()),
        "football_data_org": football_data_org.is_configured(),
        "thesportsdb_custom_key": _thesportsdb_custom_key(),
        "thesportsdb": True,
        "sportmonks": sportmonks_api.is_configured(),
        "notes": {
            "thesportsdb": (
                "v1 무료: THESPORTSDB_API_KEY 비우면 공식 무료 키 123 사용(URL 경로 인증). "
                "프리미엄 키는 THESPORTSDB_API_KEY. 문서: thesportsdb.com/documentation"
            ),
            "football_data_org": "무료 티어는 분당 호출 제한·일부 대회 제한 가능.",
            "sportmonks": "무료 크레딧은 플랜에 따라 다름.",
        },
    }


def _slim_fd_match(m: dict[str, Any]) -> dict[str, Any]:
    ht = m.get("homeTeam") or {}
    at = m.get("awayTeam") or {}
    sc = m.get("score") or {}
    full = sc.get("fullTime") or {}
    return {
        "utcDate": m.get("utcDate"),
        "status": m.get("status"),
        "stage": m.get("stage"),
        "group": m.get("group"),
        "matchday": m.get("matchday"),
        "home": ht.get("shortName") or ht.get("name"),
        "away": at.get("shortName") or at.get("name"),
        "score_fulltime": {
            "home": full.get("home"),
            "away": full.get("away"),
        }
        if full
        else None,
    }


@router.get("/football-data/world-cup/matches")
async def fd_world_cup_matches(
    season: str | None = Query(None, description="시작 연도, 예: 2026"),
    status: str | None = Query(None, description="SCHEDULED | FINISHED 등"),
    limit: int = Query(30, ge=1, le=100),
) -> dict[str, Any]:
    """FIFA World Cup 경기 목록 (competition 코드 WC). 무료 플랜에서 막힐 수 있음."""
    params: dict[str, Any] = {"limit": limit}
    if season:
        params["season"] = season
    if status:
        params["status"] = status
    try:
        raw = await football_data_org.fd_get("competitions/WC/matches", params=params, ttl_seconds=1800)
    except RuntimeError as e:
        raise HTTPException(status_code=501, detail=str(e)) from e
    except httpx.HTTPStatusError as e:
        detail = f"Football-Data.org HTTP {e.response.status_code}"
        try:
            detail = (e.response.json().get("message") or detail) if e.response.content else detail
        except Exception:
            pass
        raise HTTPException(status_code=502, detail=detail) from e
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Football-Data.org 호출 실패: {e}") from e

    matches = raw.get("matches") or []
    if not isinstance(matches, list):
        matches = []
    return {
        "source": "football-data.org",
        "competition": raw.get("competition"),
        "filters": {"season": season, "status": status, "limit": limit},
        "result_set": raw.get("resultSet"),
        "matches": [_slim_fd_match(m) for m in matches if isinstance(m, dict)],
    }


@router.get("/thesportsdb/team-media")
async def tsdb_team_media(
    team: str = Query("korea", description="korea | czech_republic | mexico | south_africa 또는 임의 검색어"),
) -> dict[str, Any]:
    q = A_GROUP_TEAMS.get(team.lower().replace(" ", "_"), team)
    row = await thesportsdb.search_team_first(q)
    if not row:
        return {"query": q, "team": None}
    return {"query": q, "team": thesportsdb.slim_team_media(row)}


@router.get("/thesportsdb/a-group-media")
async def tsdb_a_group_media() -> dict[str, Any]:
    """A조 상대국(체코·멕시코·남아공) + 대한민국 배지(TheSportsDB) — 캐시로 호출 최소화."""
    out: dict[str, Any] = {}
    try:
        for slug, name in A_GROUP_TEAMS.items():
            row = await thesportsdb.search_team_first(name)
            out[slug] = thesportsdb.slim_team_media(row) if row else None
    except RuntimeError as e:
        raise _http_from_tsdb_runtime(e) from e
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"TheSportsDB HTTP 오류: {e}") from e
    return {"source": "thesportsdb.com", "teams": out}


@router.get("/sportmonks/teams/search")
async def sm_teams_search(
    q: str = Query(..., min_length=1, max_length=80),
    limit: int = Query(10, ge=1, le=25),
) -> dict[str, Any]:
    try:
        raw = await sportmonks_api.search_teams(q)
    except RuntimeError as e:
        raise HTTPException(status_code=501, detail=str(e)) from e
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"Sportmonks HTTP {e.response.status_code}") from e
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e)) from e

    data = raw.get("data")
    rows = data if isinstance(data, list) else []
    slim = []
    for r in rows[:limit]:
        if not isinstance(r, dict):
            continue
        slim.append(
            {
                "id": r.get("id"),
                "name": r.get("name"),
                "short_code": r.get("short_code"),
                "image_path": r.get("image_path"),
                "founded": r.get("founded"),
                "type": r.get("type"),
            }
        )
    return {"source": "sportmonks.com", "query": q, "teams": slim}
