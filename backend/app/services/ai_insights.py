"""짧은 한국어 인사이트 카드 — 여러 화면에서 재사용. 공식 분석·베팅 아님."""

from __future__ import annotations

import json
import os
from typing import Any

import httpx


def _openai_base_url() -> str:
    return os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")


def _openai_model() -> str:
    return os.getenv("OPENAI_MODEL", "gpt-4o-mini")


async def _chat_json(system: str, user: str, temperature: float = 0.82) -> dict[str, Any]:
    key = os.getenv("OPENAI_API_KEY")
    if not key or not key.strip():
        raise RuntimeError("OPENAI_API_KEY가 설정되지 않았습니다. (backend/.env)")
    body = {
        "model": _openai_model(),
        "temperature": temperature,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "response_format": {"type": "json_object"},
    }
    url = f"{_openai_base_url()}/chat/completions"
    headers = {"Authorization": f"Bearer {key.strip()}", "Content-Type": "application/json"}
    try:
        async with httpx.AsyncClient(timeout=75.0) as client:
            r = await client.post(url, headers=headers, json=body)
            r.raise_for_status()
            resp = r.json()
    except httpx.HTTPError as e:
        raise RuntimeError("OPENAI_HTTP_ERROR") from e
    try:
        content = resp["choices"][0]["message"]["content"]
        return json.loads(content)
    except (KeyError, IndexError, TypeError, json.JSONDecodeError) as e:
        raise RuntimeError(f"AI 응답 파싱 실패: {e}") from e


def _pack_lines(p: dict[str, Any], min_lines: int = 3, max_lines: int = 6) -> dict[str, Any]:
    raw = p.get("lines_ko")
    lines: list[str] = []
    if isinstance(raw, list):
        for x in raw:
            s = str(x).strip()
            if s:
                lines.append(s[:520])
    while len(lines) < min_lines:
        lines.append("—")
    return {
        "lines_ko": lines[:max_lines],
        "disclaimer_ko": str(p.get("disclaimer_ko") or "AI가 생성한 재미·참고용 문구이며 공식 입장이나 전술 조언이 아닙니다.")[:500],
    }


_BASE_RULES = (
    "Korean football fan hub. Write in Korean. Respectful, no slurs. "
    "Do not present betting odds or claim factual certainty for future match results. "
    "Return ONLY JSON with keys: lines_ko (array of 3-6 strings, each 1-2 sentences), "
    "disclaimer_ko (short Korean disclaimer that this is AI fan content, not official)."
)


async def home_welcome() -> dict[str, Any]:
    system = _BASE_RULES + " You greet visitors to a Korea-focused World Cup mini-site (history + 2026 prep)."
    user = (
        "오늘 날짜 맥락으로 홈 화면 환영 멘트. 2026 북중미 월드컵·한국 대표팀·A조(체코·멕시코·남아공)을 "
        "한 번쯤 자연스럽게 언급. 과장은 가볍게만."
    )
    return _pack_lines(await _chat_json(system, user, 0.88))


async def a_group_fan_lens() -> dict[str, Any]:
    system = _BASE_RULES + " Focus: Korea in World Cup 2026 Group A."
    user = (
        "한국 팬이 A조(체코·멕시코·남아공)를 볼 때의 '관전 렌즈'를 3~6문장으로. "
        "각 상대의 플레이 스타일을 한 줄씩 짚고, 한국이 챙기면 좋은 포인트(전술·멘탈·일정 감 등)를 섞되 "
        "확정적 예언은 피하기."
    )
    return _pack_lines(await _chat_json(system, user, 0.84))


_SPOT_CTX: dict[str, str] = {
    "czech_republic": "A조 1차전 상대 체코. 유럽 조직력·세트피스·전방 결정력 등이 거론되는 편.",
    "mexico": "A조 2차전 상대 멕시코(El Tri). 공동 개최국, 홈 분위기·측면 위협이 자주 언급됨.",
    "south_africa": "A조 3차전 상대 남아공(Bafana Bafana). 역습·체력·압박 등이 이야기거리.",
}


async def spotlight_teaser(spot: str) -> dict[str, Any]:
    k = (spot or "").strip().lower()
    ctx = _SPOT_CTX.get(k)
    if not ctx:
        raise ValueError("spot은 czech_republic, mexico, south_africa 중 하나여야 합니다.")
    system = _BASE_RULES + " Short 'what to watch' for one upcoming group opponent vs Korea."
    user = f"상대 맥락: {ctx}\n한국 팬이 이 경기 전에 읽으면 좋은 짧은 팁 3~6줄."
    return _pack_lines(await _chat_json(system, user, 0.86))


async def history_year_take(year: int, host: str, result_label: str, highlights: str) -> dict[str, Any]:
    if year < 1930 or year > 2100:
        raise ValueError("year가 비정상입니다.")
    system = _BASE_RULES + " Nostalgic but accurate-leaning fan memory of one Korea World Cup finals."
    user = json.dumps(
        {
            "year": year,
            "host": (host or "")[:200],
            "result": (result_label or "")[:200],
            "summary_hint": (highlights or "")[:1200],
        },
        ensure_ascii=False,
    )
    return _pack_lines(await _chat_json(system, user, 0.78))


async def wc2026_snack() -> dict[str, Any]:
    system = _BASE_RULES + " One surprising or delightful fact snack about 2026 format (48 teams, 3 hosts, etc.)."
    user = "2026 북중미 월드컵을 처음 듣는 팬에게 재미있게 풀어줄 '아, 그렇구나' 한 스낵 3~6줄."
    return _pack_lines(await _chat_json(system, user, 0.9))


async def korea_nt_story() -> dict[str, Any]:
    system = _BASE_RULES + " Korea NT narrative toward 2026 — strengths, questions, hope — fan tone."
    user = (
        "2026 본선을 앞둔 대한민국 대표팀 페이지용 짧은 내레이션. "
        "손흥민·이강인 등은 이름만 가볍게 언급 가능하나 허위 전적·확정 발표는 금지. "
        "기대와 숙제를 균형 있게 3~6줄."
    )
    return _pack_lines(await _chat_json(system, user, 0.82))


async def playground_warmup() -> dict[str, Any]:
    system = _BASE_RULES + " Tease the AI playground tabs: fake coach review, ace duel, biased commentary."
    user = "AI 놀이터 페이지 상단용 초대 멘트 3~5줄. 유저가 실험해보고 싶게 가볍게."
    return _pack_lines(await _chat_json(system, user, 0.92))
