"""짧은 LLM 인사이트 카드 — 여러 화면 공통."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services import ai_insights as svc

router = APIRouter(prefix="/worldcup2026/ai-insights", tags=["ai-insights"])


def _handle_ai_error(e: Exception) -> HTTPException:
    msg = str(e)
    if "OPENAI_API_KEY" in msg:
        return HTTPException(status_code=501, detail=msg)
    if msg == "OPENAI_HTTP_ERROR":
        return HTTPException(status_code=502, detail="AI 서버와 통신하지 못했습니다.")
    return HTTPException(status_code=502, detail=msg)


@router.post("/home-welcome")
async def insight_home_welcome() -> dict[str, Any]:
    try:
        return await svc.home_welcome()
    except RuntimeError as e:
        raise _handle_ai_error(e) from e


@router.post("/a-group-lens")
async def insight_a_group_lens() -> dict[str, Any]:
    try:
        return await svc.a_group_fan_lens()
    except RuntimeError as e:
        raise _handle_ai_error(e) from e


class SpotlightBody(BaseModel):
    spot: str = Field(..., description="czech_republic | mexico | south_africa")


@router.post("/spotlight-teaser")
async def insight_spotlight_teaser(body: SpotlightBody) -> dict[str, Any]:
    try:
        return await svc.spotlight_teaser(body.spot)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except RuntimeError as e:
        raise _handle_ai_error(e) from e


class HistoryYearBody(BaseModel):
    year: int
    host: str = ""
    result_label: str = ""
    highlights: str = ""


@router.post("/history-year")
async def insight_history_year(body: HistoryYearBody) -> dict[str, Any]:
    try:
        return await svc.history_year_take(body.year, body.host, body.result_label, body.highlights)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except RuntimeError as e:
        raise _handle_ai_error(e) from e


@router.post("/wc2026-snack")
async def insight_wc2026_snack() -> dict[str, Any]:
    try:
        return await svc.wc2026_snack()
    except RuntimeError as e:
        raise _handle_ai_error(e) from e


@router.post("/korea-nt-story")
async def insight_korea_nt_story() -> dict[str, Any]:
    try:
        return await svc.korea_nt_story()
    except RuntimeError as e:
        raise _handle_ai_error(e) from e


@router.post("/playground-warmup")
async def insight_playground_warmup() -> dict[str, Any]:
    try:
        return await svc.playground_warmup()
    except RuntimeError as e:
        raise _handle_ai_error(e) from e
