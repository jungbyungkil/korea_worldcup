"""AI 놀이터 — 한국 A조 맥락 재미용 LLM."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException

from app.services import ai_playground as ap

router = APIRouter(prefix="/worldcup2026/ai-playground", tags=["ai-playground"])


def _handle_ai_error(e: Exception) -> HTTPException:
    msg = str(e)
    if "OPENAI_API_KEY" in msg:
        return HTTPException(status_code=501, detail=msg)
    if msg == "OPENAI_HTTP_ERROR":
        return HTTPException(status_code=502, detail="AI 서버와 통신하지 못했습니다.")
    return HTTPException(status_code=502, detail=msg)


@router.post("/coach-lineup")
async def playground_coach_lineup(body: dict[str, Any]) -> dict[str, Any]:
    """유저가 짠 한국 베스트11 + 상대 맥락 → 재미용 평가."""
    formation = str(body.get("formation") or "").strip()
    xi = body.get("xi")
    opponent = str(body.get("opponent") or "").strip().lower()
    if not isinstance(xi, list):
        raise HTTPException(status_code=400, detail="xi 배열이 필요합니다.")
    try:
        return await ap.coach_lineup_review(formation, xi, opponent)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except RuntimeError as e:
        raise _handle_ai_error(e) from e


@router.post("/ace-matchup")
async def playground_ace_matchup(body: dict[str, Any]) -> dict[str, Any]:
    """한국 선수 vs 상대 에이스 가상 매치업."""
    try:
        pid = int(body.get("korea_player_id"))
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="korea_player_id(정수)가 필요합니다.") from None
    opponent = str(body.get("opponent") or "").strip().lower()
    ace = str(body.get("opponent_ace_name") or "").strip()
    try:
        return await ap.ace_matchup(pid, opponent, ace)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except RuntimeError as e:
        raise _handle_ai_error(e) from e


@router.post("/biased-commentary")
async def playground_biased_commentary(body: dict[str, Any]) -> dict[str, Any]:
    """편파 중계 시뮬."""
    situation = str(body.get("situation_ko") or "")
    persona = str(body.get("persona") or "").strip().lower()
    try:
        return await ap.biased_commentary(situation, persona)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except RuntimeError as e:
        raise _handle_ai_error(e) from e
