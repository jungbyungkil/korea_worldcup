"""2026 한국 대시보드 · AI 놀이터(재미용, 공식 분석·베팅 아님)."""

from __future__ import annotations

import json
import os
from typing import Any

import httpx

from app.services.ai_best_xi import FORMATION_SLOTS
from app.services.static_core_squads import load_core_squad


def _openai_base_url() -> str:
    return os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")


def _openai_model() -> str:
    return os.getenv("OPENAI_MODEL", "gpt-4o-mini")


async def _chat_json(system: str, user: str, temperature: float = 0.85) -> dict[str, Any]:
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
        async with httpx.AsyncClient(timeout=90) as client:
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


_OPP_BLURB: dict[str, str] = {
    "czech_republic": "A조 1차전 상대 체코(UEFA 플레이오프 D 통과). 유럽 조직력·세트피스·전방 결정력.",
    "mexico": "A조 2차전 상대 멕시코(El Tri). 공동 개최국, 측면·전방 위협이 큼.",
    "south_africa": "A조 3차전 상대 남아프리카 공화국(Bafana Bafana). 역습·체력·압박.",
}


def _squad_by_id(bundle: dict[str, Any]) -> dict[int, dict[str, Any]]:
    out: dict[int, dict[str, Any]] = {}
    for p in bundle.get("players") or []:
        if isinstance(p, dict) and isinstance(p.get("id"), int):
            out[p["id"]] = p
    return out


def _validate_user_xi(formation: str, xi: list[Any], allowed_ids: set[int]) -> list[dict[str, Any]]:
    formation = formation.strip()
    slots = FORMATION_SLOTS.get(formation)
    if not slots:
        allowed = ", ".join(sorted(FORMATION_SLOTS))
        raise ValueError(f"지원 포메이션만 가능합니다: {allowed}")
    if not isinstance(xi, list) or len(xi) != 11:
        raise ValueError("xi는 길이 11인 배열이어야 합니다.")
    seen: set[int] = set()
    out: list[dict[str, Any]] = []
    got_slots: set[str] = set()
    for row in xi:
        if not isinstance(row, dict):
            raise ValueError("xi 항목은 객체여야 합니다.")
        slot = str(row.get("slot") or "").strip()
        if slot not in slots:
            raise ValueError(f"알 수 없는 슬롯: {slot}")
        if slot in got_slots:
            raise ValueError(f"슬롯 중복: {slot}")
        try:
            pid = int(row.get("player_id"))
        except (TypeError, ValueError) as e:
            raise ValueError("player_id는 정수여야 합니다.") from e
        if pid not in allowed_ids:
            raise ValueError(f"스쿼드에 없는 player_id: {pid}")
        if pid in seen:
            raise ValueError("같은 선수를 두 슬롯에 넣을 수 없습니다.")
        seen.add(pid)
        got_slots.add(slot)
        out.append({"slot": slot, "player_id": pid})
    if got_slots != set(slots):
        raise ValueError("모든 슬롯을 한 명씩 채워야 합니다.")
    return out


async def coach_lineup_review(
    formation: str,
    xi_rows: list[dict[str, Any]],
    opponent_key: str,
) -> dict[str, Any]:
    bundle = load_core_squad("korea")
    by_id = _squad_by_id(bundle)
    allowed = set(by_id.keys())
    validated = _validate_user_xi(formation, xi_rows, allowed)
    opp = _OPP_BLURB.get((opponent_key or "").strip().lower())
    if not opp:
        raise ValueError("opponent는 czech_republic, mexico, south_africa 중 하나여야 합니다.")

    lineup = []
    for row in validated:
        p = by_id[row["player_id"]]
        lineup.append(
            {
                "slot": row["slot"],
                "id": p.get("id"),
                "name": p.get("name"),
                "position": p.get("position"),
                "age": p.get("age"),
                "club_ko": p.get("club_ko"),
            }
        )

    system = (
        "You are a witty Korean football pundit AI for a fan app about Korea NT at 2026 World Cup group A. "
        "NOT official analytics or betting. Return ONLY JSON with keys: "
        "win_spirit_percent (integer 0-100, playful 'vibe' not real prediction), "
        "one_liner_ko (one punchy Korean line), "
        "paragraph_ko (2-4 sentences Korean, fun tone, mention synergy and risks), "
        "coach_mode_ko (empty string OR if lineup is absurd e.g. no real GK, all attackers, joke '감독님' rant in Korean), "
        "disclaimer_ko (Korean: for fun only, not real tactics advice)."
    )
    user = json.dumps(
        {
            "formation": formation,
            "opponent_context": opp,
            "user_lineup": lineup,
        },
        ensure_ascii=False,
        default=str,
    )[:24000]

    p = await _chat_json(system, user, 0.88)
    return {
        "formation": formation,
        "opponent": opponent_key.strip().lower(),
        "lineup": lineup,
        "win_spirit_percent": max(0, min(100, int(p.get("win_spirit_percent") or 50))),
        "one_liner_ko": str(p.get("one_liner_ko") or "")[:400],
        "paragraph_ko": str(p.get("paragraph_ko") or "")[:1200],
        "coach_mode_ko": str(p.get("coach_mode_ko") or "")[:500],
        "disclaimer_ko": str(p.get("disclaimer_ko") or "")[:400],
    }


_OPP_SQUAD_KEY: dict[str, str] = {
    "mexico": "mexico",
    "south_africa": "south_africa",
}


def _opponent_player_candidates(opponent_key: str) -> list[dict[str, Any]]:
    sk = _OPP_SQUAD_KEY.get((opponent_key or "").strip().lower())
    if not sk:
        return []
    bundle = load_core_squad(sk)
    out: list[dict[str, Any]] = []
    for row in bundle.get("players") or []:
        if isinstance(row, dict) and str(row.get("name") or "").strip():
            out.append(
                {
                    "name": str(row["name"]).strip(),
                    "position": str(row.get("position") or "").strip(),
                }
            )
    return out


def _fallback_ace_name(candidates: list[dict[str, Any]]) -> str:
    if not candidates:
        return "유럽 에이스 (가상)"
    for pos in ("FW", "MF"):
        for c in candidates:
            if c.get("position") == pos:
                return str(c["name"])
    return str(candidates[0]["name"])


def _match_candidate_name(raw: str, candidates: list[dict[str, Any]]) -> str | None:
    raw = raw.strip()
    if not raw:
        return None
    by_exact = {c["name"]: c["name"] for c in candidates}
    if raw in by_exact:
        return raw
    rl = raw.lower()
    for c in candidates:
        if c["name"].lower() == rl:
            return c["name"]
    return None


def _norm_radar_block(raw: Any) -> dict[str, int]:
    raw = raw if isinstance(raw, dict) else {}
    out: dict[str, int] = {}
    for k in ("pace", "shoot", "pass", "dribble", "defend", "hype"):
        try:
            v = int(raw.get(k, 50))
        except (TypeError, ValueError):
            v = 50
        out[k] = max(1, min(99, v))
    return out


async def ace_matchup(
    korea_player_id: int,
    opponent_key: str,
    opponent_ace_name: str,
) -> dict[str, Any]:
    bundle = load_core_squad("korea")
    by_id = _squad_by_id(bundle)
    if korea_player_id not in by_id:
        raise ValueError("한국 스쿼드에 없는 player_id 입니다.")
    kp = by_id[korea_player_id]
    ok = (opponent_key or "").strip().lower()
    opp = _OPP_BLURB.get(ok)
    if not opp:
        raise ValueError("opponent는 czech_republic, mexico, south_africa 중 하나여야 합니다.")

    user_ace = (opponent_ace_name or "").strip()
    candidates = _opponent_player_candidates(ok)
    ace_resolved: str
    ai_pick = not bool(user_ace)

    if user_ace:
        ace_resolved = user_ace
        system = (
            "Korean fan app: fictional 1v1 'ace matchup' for fun. NOT real stats. "
            "Return ONLY JSON: "
            "radar_korea object with keys pace,shoot,pass,dribble,defend,hype each integer 1-99 (playful), "
            "radar_opponent same keys for the named opponent ace, "
            "story_ko (3-5 short sentences Korean, use the opponent ace's actual name in the story), "
            "disclaimer_ko (Korean)."
        )
        user_payload: dict[str, Any] = {
            "korea_player": kp,
            "opponent_context": opp,
            "opponent_ace_name": ace_resolved,
        }
    elif candidates:
        system = (
            "Korean fan app: fictional 1v1 'ace matchup' for fun. NOT real stats. "
            "The user did NOT pick an opponent ace — you MUST choose one. "
            "Return ONLY JSON with keys: "
            "opponent_ace_name (string, MUST be EXACTLY one of the spellings in candidate_names — character-for-character), "
            "radar_korea (pace,shoot,pass,dribble,defend,hype integers 1-99), "
            "radar_opponent (same keys for the chosen ace), "
            "story_ko (3-5 sentences Korean, clearly fictional, use the chosen ace's name), "
            "disclaimer_ko (Korean)."
        )
        user_payload = {
            "korea_player": kp,
            "opponent_context": opp,
            "candidate_players": candidates,
            "candidate_names": [c["name"] for c in candidates],
            "pick_hint": "Pick the most 'ace-like' star (usually forward or creative midfielder) for a fun duel vs the Korea player.",
        }
        ace_resolved = ""  # filled after AI
    else:
        system = (
            "Korean fan app: fictional 1v1 matchup; opponent ace not from fixed candidate list. "
            "Return ONLY JSON: "
            "opponent_ace_name (one short plausible European NT-style player name, may be fictional), "
            "radar_korea, radar_opponent (same 6 keys 1-99), story_ko, disclaimer_ko (Korean)."
        )
        user_payload = {
            "korea_player": kp,
            "opponent_context": opp,
        }
        ace_resolved = ""

    user = json.dumps(user_payload, ensure_ascii=False, default=str)[:12000]
    p = await _chat_json(system, user, 0.9)

    if ai_pick:
        raw_pick = str(p.get("opponent_ace_name") or "").strip()
        if candidates:
            matched = _match_candidate_name(raw_pick, candidates)
            ace_resolved = matched if matched else _fallback_ace_name(candidates)
        else:
            ace_resolved = raw_pick[:120] if raw_pick else _fallback_ace_name([])

    return {
        "korea_player": {"id": kp.get("id"), "name": kp.get("name"), "position": kp.get("position")},
        "opponent": ok,
        "opponent_ace_name": ace_resolved,
        "opponent_ace_ai_picked": ai_pick,
        "radar_korea": _norm_radar_block(p.get("radar_korea")),
        "radar_opponent": _norm_radar_block(p.get("radar_opponent")),
        "story_ko": str(p.get("story_ko") or "")[:1600],
        "disclaimer_ko": str(p.get("disclaimer_ko") or "")[:400],
    }


_PERSONA: dict[str, str] = {
    "national_hype": "극도로 한국 편인 '국뽕 1000%' 해설자. 과장·감정 과잉 OK. 한국 선수는 항상 피해자거나 영웅.",
    "cold_facts": "냉정한 팩트 위주. 짧고 건조하게. 과장 금지, 가능하면 중립적 톤.",
    "hype": "호들갑·텐션 최고의 중계석. 감탄사·느낌표 많이.",
}


async def biased_commentary(situation_ko: str, persona_key: str) -> dict[str, Any]:
    sit = (situation_ko or "").strip()
    if len(sit) < 8:
        raise ValueError("상황 설명을 8자 이상 적어 주세요.")
    persona = _PERSONA.get((persona_key or "").strip().lower())
    if not persona:
        raise ValueError("persona는 national_hype, cold_facts, hype 중 하나여야 합니다.")

    system = (
        "You write short Korean live-commentary lines for a fan simulator. "
        "Return ONLY JSON: lines_ko (array of 4-6 strings, each max 120 chars Korean), "
        "disclaimer_ko (Korean: fictional parody, not real broadcast)."
    )
    user = f"페르소나: {persona}\n경기 상황: {sit}"

    p = await _chat_json(system, user, 0.92)
    lines = p.get("lines_ko")
    if not isinstance(lines, list):
        lines = []
    lines_out = [str(x).strip()[:200] for x in lines[:8] if str(x).strip()]
    while len(lines_out) < 3:
        lines_out.append("—")

    return {
        "persona": persona_key.strip().lower(),
        "situation_ko": sit[:800],
        "lines_ko": lines_out,
        "disclaimer_ko": str(p.get("disclaimer_ko") or "")[:400],
    }
