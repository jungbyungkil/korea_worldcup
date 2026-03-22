"""조별리그 한국전 — 가벼운 엔터테인먼트용 OpenAI JSON (공식 예측 아님).

지원 상대: 멕시코(2차전), 남아공(3차전). 응답의 상대 승률 필드는 opponent_win_pct 로 통일.
"""

from __future__ import annotations

import json
import os
from typing import Any

import httpx

OPPONENT_SPECS: dict[str, dict[str, str]] = {
    "mexico": {
        "en": "Mexico",
        "ko": "멕시코",
        "blurb": (
            "2026 월드컵 조별리그 2차전, Korea Republic vs Mexico. "
            "개최국·관중 분위기는 멕시코 쪽에 유리할 수 있음."
        ),
    },
    "south_africa": {
        "en": "South Africa",
        "ko": "남아프리카 공화국",
        "blurb": (
            "2026 월드컵 조별리그 3차전(최종전), Korea Republic vs South Africa. "
            "몬테레이 BBVA 일대 경기, 순위·토너먼트 향방에 따라 긴장감 큼."
        ),
    },
}


def _openai_base_url() -> str:
    return os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")


def _openai_model() -> str:
    return os.getenv("OPENAI_MODEL", "gpt-4o-mini")


def _norm_opponent(raw: str) -> str:
    k = (raw or "").strip().lower().replace("-", "_")
    if k in ("southafrica", "south_africa", "za"):
        return "south_africa"
    if k == "mexico":
        return "mexico"
    raise ValueError("opponent는 mexico 또는 south_africa 여야 합니다.")


async def group_match_ai_fun(opponent_key: str, mode: str) -> dict[str, Any]:
    key = os.getenv("OPENAI_API_KEY")
    if not key or not key.strip():
        raise RuntimeError("OPENAI_API_KEY가 설정되지 않았습니다. (backend/.env)")

    opp = _norm_opponent(opponent_key)
    spec = OPPONENT_SPECS[opp]
    en_team = spec["en"]
    blurb = spec["blurb"]

    mode = (mode or "").strip().lower()
    if mode not in ("probabilities", "headline", "wildcard"):
        raise ValueError("mode는 probabilities, headline, wildcard 중 하나여야 합니다.")

    if mode == "probabilities":
        system = (
            "You are a witty football fan writing in Korean for a casual app. "
            f"Match context: {blurb} "
            "Return ONLY valid JSON with keys: "
            "korea_win_pct (integer 0-100), draw_pct, opponent_win_pct — the three MUST sum to exactly 100. "
            f"(opponent_win_pct = win probability for {en_team}.) "
            "Keep it playful, not academic. "
            "tagline_ko: one short punchy Korean line (humor OK). "
            "disclaimer_ko: one short Korean line that this is just for fun, not betting or expert advice."
        )
        user = f"한국 vs {en_team} — 승·무·패 퍼센트를 재미있게 뽑아줘. JSON만."
        temperature = 0.75
    elif mode == "headline":
        system = (
            "You write dramatic sports headlines in Korean for social media style cards. "
            f"Match: Korea Republic vs {en_team}, 2026 WC group stage. "
            "Return ONLY valid JSON: title_ko (max 22 chars, catchy), "
            "subtitle_ko (max 45 chars, builds hype), "
            "flair_emoji (single emoji)."
        )
        user = "이 경기용 짧은 헤드라인 카드 문구를 JSON으로."
        temperature = 0.9
    else:
        system = (
            "You are a creative football pundit persona writing in Korean. "
            f"Match: Korea Republic vs {en_team}, 2026 WC. "
            "Return ONLY valid JSON: "
            "card_title_ko (short, e.g. 오늘의 관전 포인트), "
            "bullets_ko (array of exactly 3 strings, each max 60 chars — fun 'what to watch' or mini narratives), "
            "twist_ko (one unexpected funny or spicy Korean line, max 80 chars)."
        )
        user = "클릭할 때마다 다른 느낌이 나게 3개 불릿 + 한 줄 반전. JSON만."
        temperature = 0.95

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
        async with httpx.AsyncClient(timeout=60) as client:
            r = await client.post(url, headers=headers, json=body)
            r.raise_for_status()
            resp = r.json()
    except httpx.HTTPError as e:
        raise RuntimeError("OPENAI_HTTP_ERROR") from e

    try:
        content = resp["choices"][0]["message"]["content"]
        parsed = json.loads(content)
    except (KeyError, IndexError, json.JSONDecodeError) as e:
        raise RuntimeError(f"AI 응답 파싱 실패: {e}") from e

    if mode == "probabilities":
        ow = parsed.get("opponent_win_pct")
        if ow is None and opp == "mexico":
            ow = parsed.get("mexico_win_pct")
        if ow is None and opp == "south_africa":
            ow = parsed.get("south_africa_win_pct") or parsed.get("south_africa_pct")
        try:
            a, b, c = (
                int(parsed.get("korea_win_pct")),
                int(parsed.get("draw_pct")),
                int(ow),
            )
        except (TypeError, ValueError) as e:
            raise RuntimeError("AI가 퍼센트 정수를 주지 않았습니다.") from e
        s = a + b + c
        if s != 100 or s <= 0:
            a, b, c = max(0, a), max(0, b), max(0, c)
            s2 = a + b + c
            if s2 <= 0:
                a, b, c = 34, 33, 33
            else:
                scaled = [a * 100 / s2, b * 100 / s2, c * 100 / s2]
                ia, ib, ic = int(scaled[0]), int(scaled[1]), int(scaled[2])
                rem = 100 - ia - ib - ic
                order = sorted(range(3), key=lambda i: scaled[i] - int(scaled[i]), reverse=True)
                arr = [ia, ib, ic]
                for k in range(max(0, rem)):
                    arr[order[k % 3]] += 1
                a, b, c = arr[0], arr[1], arr[2]
        return {
            "mode": mode,
            "opponent": opp,
            "korea_win_pct": a,
            "draw_pct": b,
            "opponent_win_pct": c,
            "tagline_ko": str(parsed.get("tagline_ko") or ""),
            "disclaimer_ko": str(parsed.get("disclaimer_ko") or "재미용이에요. 공식·베팅 근거가 아닙니다."),
        }

    if mode == "headline":
        return {
            "mode": mode,
            "opponent": opp,
            "title_ko": str(parsed.get("title_ko") or "")[:40],
            "subtitle_ko": str(parsed.get("subtitle_ko") or "")[:80],
            "flair_emoji": str(parsed.get("flair_emoji") or "⚽")[:4],
        }

    bullets = parsed.get("bullets_ko")
    if not isinstance(bullets, list):
        bullets = []
    bullets = [str(x)[:120] for x in bullets[:3]]
    while len(bullets) < 3:
        bullets.append("…")

    return {
        "mode": mode,
        "opponent": opp,
        "card_title_ko": str(parsed.get("card_title_ko") or "관전 카드")[:40],
        "bullets_ko": bullets,
        "twist_ko": str(parsed.get("twist_ko") or "")[:120],
    }
