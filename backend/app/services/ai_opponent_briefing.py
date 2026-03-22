"""A조 상대별 전술·스쿼드 브리핑 — OpenAI JSON (한국·상대 API-Football 요약 입력)."""

from __future__ import annotations

import json
import os
from typing import Any

import httpx

# worldcup2026.py Elo 테이블과 동일한 참고값 (브리핑 맥락용, 공식 아님)
_ELO_HINT: dict[str, int] = {
    "korea": 1760,
    "mexico": 1720,
    "south_africa": 1595,
    "playoff_d_default": 1500,
}


def _openai_base_url() -> str:
    return os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")


def _openai_model() -> str:
    return os.getenv("OPENAI_MODEL", "gpt-4o-mini")


def _slim_korea_context(payload: dict[str, Any]) -> dict[str, Any]:
    players = payload.get("players") or []
    slim_p: list[dict[str, Any]] = []
    for p in players[:26]:
        if not isinstance(p, dict):
            continue
        row = {
            "name": p.get("name"),
            "position": p.get("position"),
            "age": p.get("age"),
            "number": p.get("number"),
        }
        cs = p.get("club_stats_latest")
        if isinstance(cs, dict) and cs:
            row["club_stats_latest"] = {
                "club_name": cs.get("club_name"),
                "appearances": cs.get("appearances"),
                "minutes": cs.get("minutes"),
                "goals_total": cs.get("goals_total"),
                "rating": cs.get("rating"),
            }
        slim_p.append(row)
    inj = payload.get("injuries") or []
    slim_i: list[dict[str, Any]] = []
    for it in inj[:20]:
        if isinstance(it, dict):
            slim_i.append(
                {
                    "player_name": it.get("player_name"),
                    "type": it.get("type"),
                    "reason": it.get("reason"),
                }
            )
    return {
        "squad_size": payload.get("squad_size"),
        "players_sample": slim_p,
        "injuries": slim_i,
        "last_updated": payload.get("last_updated"),
    }


def _slim_opponent_context(opponent_key: str, payload: dict[str, Any]) -> dict[str, Any]:
    if opponent_key == "playoff_d":
        st = payload.get("opponent_status")
        base: dict[str, Any] = {
            "opponent_status": st,
            "team_display_ko": payload.get("team_display_ko"),
            "team": payload.get("team"),
            "note": payload.get("starting_xi_note_ko"),
        }
        if st == "tbd":
            return base
    xi = payload.get("starting_xi") or []
    slim_xi: list[dict[str, Any]] = []
    for row in xi[:11]:
        if not isinstance(row, dict):
            continue
        slim_xi.append(
            {
                "slot": row.get("slot"),
                "player_name": row.get("player_name"),
                "position": row.get("position"),
            }
        )
    players = payload.get("players") or []
    slim_p: list[dict[str, Any]] = []
    for p in players[:18]:
        if not isinstance(p, dict):
            continue
        slim_p.append(
            {
                "name": p.get("player_name") or p.get("name"),
                "slot": p.get("slot"),
                "club_stats_latest": p.get("club_stats_latest"),
            }
        )
    inj = payload.get("injuries") or []
    slim_i: list[dict[str, Any]] = []
    for it in inj[:15]:
        if isinstance(it, dict):
            slim_i.append(
                {
                    "player_name": it.get("player_name"),
                    "type": it.get("type"),
                    "reason": it.get("reason"),
                }
            )
    return {
        "team": payload.get("team"),
        "team_display_ko": payload.get("team_display_ko"),
        "opponent_status": payload.get("opponent_status"),
        "formation_display": payload.get("formation_display"),
        "starting_xi": slim_xi,
        "players_sample": slim_p,
        "injuries": slim_i,
        "squad_size": payload.get("squad_size"),
        "last_updated": payload.get("last_updated"),
    }


def _elo_context(opponent_key: str) -> dict[str, Any]:
    kr = _ELO_HINT["korea"]
    if opponent_key == "mexico":
        opp = _ELO_HINT["mexico"]
    elif opponent_key == "south_africa":
        opp = _ELO_HINT["south_africa"]
    else:
        opp = _ELO_HINT["playoff_d_default"]
    return {
        "korea_elo_hint": kr,
        "opponent_elo_hint": opp,
        "note": "참고용 대략치이며 공식 FIFA/Elo 평가가 아닙니다.",
    }


async def generate_opponent_briefing(
    opponent_key: str,
    *,
    korea_payload: dict[str, Any],
    opponent_payload: dict[str, Any],
    opponent_label_ko: str,
) -> dict[str, Any]:
    key = os.getenv("OPENAI_API_KEY")
    if not key or not key.strip():
        raise RuntimeError("OPENAI_API_KEY가 설정되지 않았습니다. (backend/.env)")

    korea_ctx = _slim_korea_context(korea_payload)
    opp_ctx = _slim_opponent_context(opponent_key, opponent_payload)
    elo_ctx = _elo_context(opponent_key)

    system = (
        "You are a senior football analyst writing in Korean for fans of Korea Republic (South Korea). "
        "2026 FIFA World Cup North America, Group A context. "
        "Use ONLY the JSON data provided — do not invent real-time injuries or transfers not in the data. "
        "If opponent squad is empty or TBD, say so and focus on Korea + generic tactical cautions for that slot. "
        "Return ONLY valid JSON with exactly these keys: "
        "title_ko (short card title), "
        "one_liner_ko (one punchy summary line), "
        "tactics_ko (object with keys: how_they_play_ko, weaknesses_to_target_ko, our_approach_ko — each 2-4 sentences), "
        "squad_ko (object with keys: korea_strengths_ko, opponent_strengths_ko, injury_notes_ko — each 2-4 sentences; "
        "players_to_watch: array of max 6 objects with team \"korea\" or \"opponent\", name string, note_ko string), "
        "key_duels_ko (array of 3-5 short Korean strings), "
        "disclaimer_ko (one line: not official coaching, data may be incomplete, for entertainment). "
        "Tone: analytical but accessible. No betting advice."
    )

    user_obj = {
        "opponent_key": opponent_key,
        "opponent_label_ko": opponent_label_ko,
        "elo_context_hint": elo_ctx,
        "korea": korea_ctx,
        "opponent": opp_ctx,
    }
    user_text = (
        "아래 JSON을 근거로 전술·스쿼드 브리핑을 작성하세요. JSON만 출력.\n\n"
        + json.dumps(user_obj, ensure_ascii=False, default=str)[:32000]
    )

    body = {
        "model": _openai_model(),
        "temperature": 0.45,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user_text},
        ],
        "response_format": {"type": "json_object"},
    }

    url = f"{_openai_base_url()}/chat/completions"
    headers = {"Authorization": f"Bearer {key.strip()}", "Content-Type": "application/json"}

    try:
        async with httpx.AsyncClient(timeout=120) as client:
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

    out = {
        "opponent": opponent_key,
        "opponent_label_ko": opponent_label_ko,
        "title_ko": str(parsed.get("title_ko") or "")[:120],
        "one_liner_ko": str(parsed.get("one_liner_ko") or "")[:240],
        "tactics": parsed.get("tactics_ko") if isinstance(parsed.get("tactics_ko"), dict) else {},
        "squad": parsed.get("squad_ko") if isinstance(parsed.get("squad_ko"), dict) else {},
        "key_duels_ko": parsed.get("key_duels_ko") if isinstance(parsed.get("key_duels_ko"), list) else [],
        "disclaimer_ko": str(parsed.get("disclaimer_ko") or "")[:400],
    }
    return out
