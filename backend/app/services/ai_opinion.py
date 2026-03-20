"""2026 화면 데이터 기반 AI 의견 (OpenAI 호환 Chat Completions)."""

from __future__ import annotations

import json
import os
from typing import Any

import httpx


def _openai_base_url() -> str:
    return os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")


def _openai_model() -> str:
    return os.getenv("OPENAI_MODEL", "gpt-4o-mini")


async def generate_worldcup2026_opinion(payload: dict[str, Any]) -> dict[str, Any]:
    key = os.getenv("OPENAI_API_KEY")
    if not key or not key.strip():
        raise RuntimeError("OPENAI_API_KEY가 설정되지 않았습니다. (backend/.env)")

    question = str(payload.get("question") or "").strip()
    data = payload.get("data") or {}

    system = (
        "You are a football analyst focused on South Korea (Korea Republic) and FIFA World Cup 2026. "
        "Respond in Korean. Be concise and practical. "
        "Return ONLY valid JSON with keys: summary (string), key_points (array of strings), "
        "risks (array of strings), watch_matches (array of strings), assumptions (array of strings)."
    )
    user_parts = [
        "아래 JSON은 화면에서 수집한 컨텍스트입니다. 이를 근거로 전망·리스크·관전 포인트를 제시하세요.",
        json.dumps(data, ensure_ascii=False, default=str)[:24000],
    ]
    if question:
        user_parts.append(f"사용자 질문: {question}")

    body = {
        "model": _openai_model(),
        "temperature": 0.5,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": "\n\n".join(user_parts)},
        ],
        "response_format": {"type": "json_object"},
    }

    url = f"{_openai_base_url()}/chat/completions"
    headers = {"Authorization": f"Bearer {key.strip()}", "Content-Type": "application/json"}

    async with httpx.AsyncClient(timeout=90) as client:
        r = await client.post(url, headers=headers, json=body)
        r.raise_for_status()
        resp = r.json()

    try:
        content = resp["choices"][0]["message"]["content"]
        parsed = json.loads(content)
    except (KeyError, IndexError, json.JSONDecodeError) as e:
        raise RuntimeError(f"AI 응답 파싱 실패: {e}") from e

    return {
        "summary": str(parsed.get("summary") or ""),
        "key_points": list(parsed.get("key_points") or []),
        "risks": list(parsed.get("risks") or []),
        "watch_matches": list(parsed.get("watch_matches") or []),
        "assumptions": list(parsed.get("assumptions") or []),
    }
