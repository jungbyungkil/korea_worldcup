"""전술(포메이션) 기준 대한민국 국대 베스트 11 — OpenAI JSON 응답."""

from __future__ import annotations

import json
import os
from typing import Any

import httpx

# 슬롯 이름은 프론트 피치 좌표와 반드시 동일해야 함
FORMATION_SLOTS: dict[str, list[str]] = {
    "4-1-4-1": ["GK", "RB", "RCB", "LCB", "LB", "CDM", "RM", "RCM", "LCM", "LM", "ST"],
    "4-4-2": ["GK", "RB", "RCB", "LCB", "LB", "RM", "RCM", "LCM", "LM", "ST_L", "ST_R"],
    "4-3-3": ["GK", "RB", "RCB", "LCB", "LB", "RCM", "CM", "LCM", "RW", "ST", "LW"],
    "3-5-2": ["GK", "RCB", "CB", "LCB", "RWB", "RCM", "CM", "LCM", "LWB", "ST_L", "ST_R"],
    "5-3-2": ["GK", "LWB", "LCB", "CB", "RCB", "RWB", "CM_L", "CM", "CM_R", "ST_L", "ST_R"],
}

FORMATION_HINT_KO: dict[str, str] = {
    "4-1-4-1": "수비형 미드필더 1명으로 수비와 공격을 연결하고, 양쪽 윙과 원톱으로 전개하는 형태.",
    "4-4-2": "공수 밸런스가 좋은 전통적인 포메이션. 미드 4·공격 2.",
    "4-3-3": "윙어(윙 포워드)를 활용한 공격적인 포메이션. 측면 돌파와 폭 활용.",
    "3-5-2": "윙백 비중이 큰 형태. 중원 인원 우위로 수비 시 5백으로 전환하기도 함.",
    "5-3-2": "수비 라인을 두껍게 두는 수비적으로 안정을 꾀하는 포메이션. 윙백이 측면 담당.",
}


def _openai_base_url() -> str:
    return os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")


def _openai_model() -> str:
    return os.getenv("OPENAI_MODEL", "gpt-4o-mini")


def _normalize_squad_entry(raw: Any) -> dict[str, Any] | None:
    if not isinstance(raw, dict):
        return None
    try:
        pid = int(raw.get("id"))
    except (TypeError, ValueError):
        return None
    name = str(raw.get("name") or "").strip()
    if not name:
        return None
    out: dict[str, Any] = {"id": pid, "name": name}
    if raw.get("position") is not None:
        out["position"] = str(raw.get("position"))
    if raw.get("age") is not None:
        try:
            out["age"] = int(raw.get("age"))
        except (TypeError, ValueError):
            pass
    if raw.get("number") is not None:
        out["number"] = raw.get("number")
    for k in ("club", "appearances", "goals", "minutes", "rating"):
        if raw.get(k) is not None:
            out[k] = raw.get(k)
    return out


def _validate_xi(
    xi: list[Any],
    expected_slots: list[str],
    allowed_ids: set[int],
    injured: set[int],
) -> list[dict[str, Any]]:
    if not isinstance(xi, list) or len(xi) != 11:
        raise ValueError("xi는 길이 11인 배열이어야 합니다.")

    seen_slots: set[str] = set()
    seen_ids: set[int] = set()
    out: list[dict[str, Any]] = []

    for row in xi:
        if not isinstance(row, dict):
            raise ValueError("xi 항목은 객체여야 합니다.")
        slot = str(row.get("slot") or "").strip()
        if slot not in expected_slots:
            raise ValueError(f"알 수 없는 슬롯: {slot}")
        if slot in seen_slots:
            raise ValueError(f"슬롯 중복: {slot}")
        seen_slots.add(slot)
        try:
            pid = int(row.get("player_id"))
        except (TypeError, ValueError) as e:
            raise ValueError("player_id가 필요합니다.") from e
        if pid not in allowed_ids:
            raise ValueError(f"스쿼드에 없는 player_id: {pid}")
        if pid in injured:
            raise ValueError(f"부상으로 제외해야 할 선수가 포함됨: {pid}")
        if pid in seen_ids:
            raise ValueError(f"선수 중복: {pid}")
        seen_ids.add(pid)
        pname = str(row.get("player_name") or "").strip()
        out.append({"slot": slot, "player_id": pid, "player_name": pname})

    if seen_slots != set(expected_slots):
        missing = set(expected_slots) - seen_slots
        raise ValueError(f"누락된 슬롯: {sorted(missing)}")

    return out


async def generate_best_xi(
    formation: str,
    squad: list[Any],
    injured_player_ids: list[int] | None = None,
) -> dict[str, Any]:
    key = os.getenv("OPENAI_API_KEY")
    if not key or not key.strip():
        raise RuntimeError("OPENAI_API_KEY가 설정되지 않았습니다. (backend/.env)")

    formation = formation.strip()
    if formation not in FORMATION_SLOTS:
        allowed = ", ".join(sorted(FORMATION_SLOTS))
        raise ValueError(f"지원하지 않는 포메이션입니다. 사용 가능: {allowed}")

    slots = FORMATION_SLOTS[formation]
    hint = FORMATION_HINT_KO.get(formation, "")

    normalized: list[dict[str, Any]] = []
    for item in squad:
        n = _normalize_squad_entry(item)
        if n:
            normalized.append(n)

    if len(normalized) < 11:
        raise ValueError("스쿼드에 선수가 11명 미만입니다.")

    injured_set = set(int(x) for x in (injured_player_ids or []) if x is not None)
    allowed_ids = {p["id"] for p in normalized}
    eligible = [p for p in normalized if p["id"] not in injured_set]
    if len(eligible) < 11:
        raise ValueError("부상 제외 후 스쿼드가 11명 미만입니다.")

    system = (
        "You are the head coach of Korea Republic national football team. "
        "Pick the best starting 11 from the given squad for the specified formation. "
        "Use ONLY player ids from the squad list. "
        "Respect typical positional roles (GK must be a goalkeeper; do not put outfield players in GK). "
        "Consider club form (appearances, goals, minutes) when available. "
        "Return ONLY valid JSON with keys: "
        "xi (array of exactly 11 objects, each with slot, player_id, player_name), "
        "notes_ko (one short line), rationale_ko (2-4 sentences in Korean explaining choices)."
    )

    user_payload = {
        "formation": formation,
        "formation_description_ko": hint,
        "slots_in_order": slots,
        "injured_player_ids_to_exclude": sorted(injured_set),
        "squad": normalized,
    }

    user_text = (
        "아래 JSON을 읽고, slots_in_order의 각 슬롯에 정확히 한 명씩 배정하세요. "
        "xi 배열의 길이는 11이고, slot 값은 slots_in_order와 동일한 철자여야 합니다.\n\n"
        + json.dumps(user_payload, ensure_ascii=False, default=str)[:28000]
    )

    body = {
        "model": _openai_model(),
        "temperature": 0.35,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user_text},
        ],
        "response_format": {"type": "json_object"},
    }

    url = f"{_openai_base_url()}/chat/completions"
    headers = {"Authorization": f"Bearer {key.strip()}", "Content-Type": "application/json"}

    async with httpx.AsyncClient(timeout=120) as client:
        r = await client.post(url, headers=headers, json=body)
        r.raise_for_status()
        resp = r.json()

    try:
        content = resp["choices"][0]["message"]["content"]
        parsed = json.loads(content)
    except (KeyError, IndexError, json.JSONDecodeError) as e:
        raise RuntimeError(f"AI 응답 파싱 실패: {e}") from e

    xi_raw = parsed.get("xi")
    try:
        xi_validated = _validate_xi(xi_raw, slots, allowed_ids, injured_set)
    except ValueError as e:
        raise RuntimeError(f"AI 포메이션 검증 실패: {e}") from e

    # 이름은 스쿼드 기준으로 보정 (AI 오타 방지)
    id_to_name = {p["id"]: p["name"] for p in normalized}
    for row in xi_validated:
        row["player_name"] = id_to_name.get(row["player_id"], row["player_name"])

    return {
        "formation": formation,
        "formation_hint_ko": hint,
        "slots": slots,
        "xi": xi_validated,
        "notes_ko": str(parsed.get("notes_ko") or ""),
        "rationale_ko": str(parsed.get("rationale_ko") or ""),
    }
