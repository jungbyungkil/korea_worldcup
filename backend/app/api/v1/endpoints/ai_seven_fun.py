"""7단계 순차 AI 재미 카드 — worldcup2026 하위 경로."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException

from app.api.v1.endpoints import worldcup2026 as wc
from app.services import ai_seven_fun as s7
from app.services.korea_player_features import build_korea_player_features_payload

router = APIRouter(prefix="/worldcup2026/ai-fun-seven", tags=["ai-fun-seven"])


def _handle_ai_error(e: Exception) -> HTTPException:
    msg = str(e)
    if "OPENAI_API_KEY" in msg:
        return HTTPException(status_code=501, detail=msg)
    if msg == "OPENAI_HTTP_ERROR":
        return HTTPException(status_code=502, detail="AI 서버와 통신하지 못했습니다.")
    return HTTPException(status_code=502, detail=msg)


def _player_blob_from_payload(payload: dict[str, Any], player_id: int) -> tuple[dict[str, Any], list[dict[str, Any]] | None]:
    squad = payload.get("squad") or []
    players = payload.get("players") or []
    injuries = payload.get("injuries") or []
    enriched: dict[int, dict[str, Any]] = {}
    for p in players:
        if isinstance(p, dict) and isinstance(p.get("id"), int):
            enriched[p["id"]] = p
    row = next((x for x in squad if isinstance(x, dict) and x.get("id") == player_id), None)
    if not row:
        raise ValueError(f"스쿼드에 player_id={player_id} 가 없습니다.")
    e = enriched.get(player_id) or {}
    c = (e.get("club_stats_latest") or {}) if isinstance(e.get("club_stats_latest"), dict) else {}
    inj = next((i for i in injuries if isinstance(i, dict) and i.get("player_id") == player_id), None)
    blob: dict[str, Any] = {
        "id": player_id,
        "name": row.get("name"),
        "position": row.get("position"),
        "age": row.get("age"),
        "number": row.get("number"),
        "club": c.get("club_name"),
        "appearances": c.get("appearances"),
        "goals": c.get("goals_total"),
        "minutes": c.get("minutes"),
        "rating": c.get("rating"),
        "injury": inj,
    }
    pos = str(row.get("position") or "").strip()
    candidates: list[dict[str, Any]] | None = None
    if pos:
        cand_rows = [
            x
            for x in squad
            if isinstance(x, dict) and str(x.get("position") or "").strip() == pos and x.get("id") != player_id
        ]
        cand_rows = [row] + cand_rows
        candidates = []
        for x in cand_rows[:8]:
            pid = x.get("id")
            if not isinstance(pid, int):
                continue
            ee = enriched.get(pid) or {}
            cc = (ee.get("club_stats_latest") or {}) if isinstance(ee.get("club_stats_latest"), dict) else {}
            candidates.append(
                {
                    "id": pid,
                    "name": x.get("name"),
                    "age": x.get("age"),
                    "appearances": cc.get("appearances"),
                    "goals": cc.get("goals_total"),
                    "minutes": cc.get("minutes"),
                }
            )
        if len(candidates) < 2:
            candidates = None
    return blob, candidates


@router.post("/step1-player")
async def ai_fun_step1_player(body: dict[str, Any]) -> dict[str, Any]:
    """sub: one_liner | condition (player_id 필수) | position_pick (player_id + position 후보 구성)."""
    sub = str(body.get("sub") or "").strip().lower()
    try:
        pid_raw = body.get("player_id")
        player_id = int(pid_raw)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="player_id(정수)가 필요합니다.") from None

    try:
        payload = await build_korea_player_features_payload()
    except RuntimeError as e:
        raise HTTPException(status_code=501, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"선수 데이터 조회 실패: {e!s}") from e

    if payload.get("error") == "korea_team_not_found" or not payload.get("squad"):
        raise HTTPException(status_code=502, detail="한국 대표팀 스쿼드를 찾지 못했습니다.")

    try:
        blob, candidates = _player_blob_from_payload(payload, player_id)
        if sub == "position_pick":
            if not candidates or len(candidates) < 2:
                raise ValueError("같은 포지션 후보가 2명 미만입니다. 다른 포지션을 선택하세요.")
            result = await s7.step1_player(sub, blob, candidates)
        else:
            result = await s7.step1_player(sub, blob, None)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except RuntimeError as e:
        raise _handle_ai_error(e) from e
    return result


@router.post("/step2-history")
async def ai_fun_step2_history(body: dict[str, Any]) -> dict[str, Any]:
    mode = str(body.get("mode") or "").strip().lower()
    ctx = body.get("context")
    if not isinstance(ctx, dict):
        raise HTTPException(status_code=400, detail="context 객체가 필요합니다 (year, host, result_label 등).")
    hint = str(body.get("scenario_hint") or "")
    try:
        return await s7.step2_history(mode, ctx, hint)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except RuntimeError as e:
        raise _handle_ai_error(e) from e


@router.post("/step3-guide")
async def ai_fun_step3_guide(body: dict[str, Any]) -> dict[str, Any]:
    kind = str(body.get("kind") or "").strip().lower()
    term = str(body.get("term") or "")
    try:
        return await s7.step3_guide(kind, term)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except RuntimeError as e:
        raise _handle_ai_error(e) from e


@router.post("/step4-supplement")
async def ai_fun_step4_supplement(body: dict[str, Any]) -> dict[str, Any]:
    lines = body.get("lines")
    if not isinstance(lines, list):
        raise HTTPException(status_code=400, detail="lines 문자열 배열이 필요합니다.")
    try:
        return await s7.step4_supplement([str(x) for x in lines])
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except RuntimeError as e:
        raise _handle_ai_error(e) from e


@router.post("/step5-probability-story")
async def ai_fun_step5_probability_story(body: dict[str, Any]) -> dict[str, Any]:
    opponent = str(body.get("opponent") or "").strip()
    if not opponent:
        raise HTTPException(status_code=400, detail="opponent가 필요합니다.")
    try:
        fixtures_payload = await wc.korea_fixtures()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"일정 조회 실패: {e!s}") from e
    bundle = wc.build_win_probability_from_fixtures(opponent, fixtures_payload)
    try:
        story = await s7.step5_probability_story(bundle)
    except RuntimeError as e:
        raise _handle_ai_error(e) from e
    return {"probability_bundle": bundle, **story}
