"""7단계 엔터용 AI 카드 — OpenAI JSON (공식 분석·베팅 아님)."""

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
        async with httpx.AsyncClient(timeout=60) as client:
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


# --- Step 1: player page ---


async def step1_player(
    sub: str,
    player_blob: dict[str, Any],
    position_candidates: list[dict[str, Any]] | None,
) -> dict[str, Any]:
    sub = (sub or "").strip().lower()
    if sub == "one_liner":
        system = (
            "Korean football fan app. Given one Korea national team player JSON (stats may be incomplete), "
            "return ONLY JSON: line_ko (one punchy fun line, max 90 chars), "
            "disclaimer_ko (one line: not professional scouting, for fun)."
        )
        user = f"선수 데이터:\n{json.dumps(player_blob, ensure_ascii=False)}"
        p = await _chat_json(system, user, 0.88)
        return {
            "sub": "one_liner",
            "line_ko": str(p.get("line_ko") or "")[:200],
            "disclaimer_ko": str(p.get("disclaimer_ko") or "")[:300],
        }
    if sub == "condition":
        system = (
            "Korean copy for a casual 'player condition card'. JSON only: "
            "headline_ko (max 28 chars), body_ko (2 short sentences, max 200 chars total), "
            "mood_emoji (single emoji), disclaimer_ko."
        )
        user = f"선수(부상·출전 데이터 포함 가능):\n{json.dumps(player_blob, ensure_ascii=False)}"
        p = await _chat_json(system, user, 0.85)
        return {
            "sub": "condition",
            "headline_ko": str(p.get("headline_ko") or "")[:80],
            "body_ko": str(p.get("body_ko") or "")[:400],
            "mood_emoji": str(p.get("mood_emoji") or "⚽")[:8],
            "disclaimer_ko": str(p.get("disclaimer_ko") or "")[:300],
        }
    if sub == "position_pick":
        if not position_candidates or len(position_candidates) < 2:
            raise ValueError("position_pick은 같은 포지션 후보 2명 이상이 필요합니다.")
        system = (
            "You are picking one starter for Korea NT for entertainment. "
            "Candidates JSON array has id, name, age, club stats hints. "
            "Return ONLY JSON: chosen_player_id (int, MUST be one of the ids), "
            "reason_ko (2-3 sentences Korean), teaser_ko (one short hype line), disclaimer_ko."
        )
        user = json.dumps({"candidates": position_candidates}, ensure_ascii=False)
        p = await _chat_json(system, user, 0.72)
        chosen = p.get("chosen_player_id")
        try:
            cid = int(chosen)
        except (TypeError, ValueError):
            cid = int(position_candidates[0]["id"])
        ids = {int(c["id"]) for c in position_candidates if c.get("id") is not None}
        if cid not in ids:
            cid = int(position_candidates[0]["id"])
        return {
            "sub": "position_pick",
            "chosen_player_id": cid,
            "reason_ko": str(p.get("reason_ko") or "")[:600],
            "teaser_ko": str(p.get("teaser_ko") or "")[:120],
            "disclaimer_ko": str(p.get("disclaimer_ko") or "")[:300],
        }
    raise ValueError("sub는 one_liner, condition, position_pick 중 하나여야 합니다.")


# --- Step 2: history ---


async def step2_history(
    mode: str,
    ctx: dict[str, Any],
    scenario_hint: str,
) -> dict[str, Any]:
    mode = (mode or "").strip().lower()
    base = json.dumps(ctx, ensure_ascii=False)
    if mode == "summary":
        system = (
            "Korean World Cup history recap for fans. Return ONLY JSON: "
            "sentences_ko (array of exactly 3 strings, each max 100 chars, vivid but factual tone), "
            "disclaimer_ko (data may be incomplete; for entertainment)."
        )
        user = f"대회 맥락:\n{base}"
        p = await _chat_json(system, user, 0.75)
        sents = p.get("sentences_ko")
        if not isinstance(sents, list):
            sents = []
        sents = [str(x)[:160] for x in sents[:3]]
        while len(sents) < 3:
            sents.append("—")
        return {"mode": "summary", "sentences_ko": sents[:3], "disclaimer_ko": str(p.get("disclaimer_ko") or "")[:300]}
    if mode == "scenario":
        hint = (scenario_hint or "").strip() or "VAR, 날씨, 연장전 같은 가상 변수"
        system = (
            "Creative alternate-history football scenario in Korean. NOT claiming real events. "
            "Return ONLY JSON: title_ko (max 40 chars), body_ko (3-4 sentences), "
            "disclaimer_ko (clearly fictional / thought experiment)."
        )
        user = f"대회 맥락:\n{base}\n가상 시나리오 힌트: {hint}"
        p = await _chat_json(system, user, 0.92)
        return {
            "mode": "scenario",
            "title_ko": str(p.get("title_ko") or "")[:80],
            "body_ko": str(p.get("body_ko") or "")[:900],
            "disclaimer_ko": str(p.get("disclaimer_ko") or "")[:400],
        }
    raise ValueError("mode는 summary 또는 scenario 여야 합니다.")


# --- Step 3: guide ---


async def step3_guide(kind: str, term: str) -> dict[str, Any]:
    kind = (kind or "").strip().lower()
    if kind == "a_group_qa":
        system = (
            "2026 FIFA World Cup group A primer for Korean beginners. "
            "Return ONLY JSON: pairs (array of exactly 4 objects, each {q: string, a: string} in Korean), "
            "disclaimer_ko (schedule/teams can change)."
        )
        user = "한국, 체코(A조 1차전), 멕시코, 남아공 등 A조 입문용 Q&A."
        p = await _chat_json(system, user, 0.78)
        pairs = p.get("pairs")
        out: list[dict[str, str]] = []
        if isinstance(pairs, list):
            for it in pairs[:6]:
                if isinstance(it, dict):
                    out.append(
                        {
                            "q": str(it.get("q") or "")[:200],
                            "a": str(it.get("a") or "")[:400],
                        }
                    )
        return {"kind": "a_group_qa", "pairs": out, "disclaimer_ko": str(p.get("disclaimer_ko") or "")[:300]}
    if kind == "glossary":
        t = (term or "").strip()
        if len(t) < 2:
            raise ValueError("glossary는 term(2자 이상)이 필요합니다.")
        system = (
            "Explain one football term for Korean casual readers. Return ONLY JSON: "
            "term_ko (short title), explain_ko (2-3 sentences, simple), example_ko (one optional short example), "
            "disclaimer_ko."
        )
        user = f"용어: {t}"
        p = await _chat_json(system, user, 0.65)
        return {
            "kind": "glossary",
            "term_ko": str(p.get("term_ko") or t)[:80],
            "explain_ko": str(p.get("explain_ko") or "")[:600],
            "example_ko": str(p.get("example_ko") or "")[:200],
            "disclaimer_ko": str(p.get("disclaimer_ko") or "")[:300],
        }
    raise ValueError("kind는 a_group_qa 또는 glossary 여야 합니다.")


# --- Step 4: supplement curate ---


async def step4_supplement(lines: list[str]) -> dict[str, Any]:
    if not lines:
        raise ValueError("lines 배열에 일정·링크 요약 문자열을 1개 이상 넣어주세요.")
    slim = [str(x)[:300] for x in lines[:24]]
    system = (
            "Curate a fun 'what to watch this week' blurb for a Korea WC app. "
            "Return ONLY JSON: title_ko, intro_ko (one sentence), bullets_ko (array of 3 strings, max 90 chars each), "
            "disclaimer_ko (verify official sources)."
        )
    user = "다음은 앱에서 모은 일정/미디어 줄글입니다:\n" + "\n".join(f"- {s}" for s in slim)
    p = await _chat_json(system, user, 0.8)
    bullets = p.get("bullets_ko")
    if not isinstance(bullets, list):
        bullets = []
    bullets = [str(x)[:150] for x in bullets[:3]]
    while len(bullets) < 3:
        bullets.append("—")
    return {
        "title_ko": str(p.get("title_ko") or "")[:100],
        "intro_ko": str(p.get("intro_ko") or "")[:300],
        "bullets_ko": bullets[:3],
        "disclaimer_ko": str(p.get("disclaimer_ko") or "")[:300],
    }


# --- Step 5: probability story ---


async def step5_probability_story(bundle: dict[str, Any]) -> dict[str, Any]:
    system = (
        "Korean football fan narrator. You receive a JSON bundle with Elo-based win probability (not from you). "
        "Return ONLY JSON: story_ko (2-4 sentences explaining the numbers in plain Korean, no new fake stats), "
        "disclaimer_ko (model is rough; not betting advice)."
    )
    user = f"승률·Elo 묶음:\n{json.dumps(bundle, ensure_ascii=False)}"
    p = await _chat_json(system, user, 0.7)
    return {
        "story_ko": str(p.get("story_ko") or "")[:800],
        "disclaimer_ko": str(p.get("disclaimer_ko") or "")[:300],
    }


