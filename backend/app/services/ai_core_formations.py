"""정적 23인 스쿼드에 대해 여러 포메이션별 베스트 11을 AI로 생성."""

from __future__ import annotations

from typing import Any

from app.services.ai_best_xi import FORMATION_SLOTS, generate_best_xi
from app.services.static_core_squads import load_core_squad, normalize_team_key

_COACH_BLURB: dict[str, str] = {
    "korea": "Korea Republic national football team",
    "mexico": "Mexico national football team (El Tri)",
    "south_africa": "South Africa national football team (Bafana Bafana)",
    "czech_republic": "Czech Republic national football team",
}

_DEFAULT_FORMATIONS: tuple[str, ...] = tuple(sorted(FORMATION_SLOTS.keys()))


async def recommend_formations_for_core_squad(
    team_key: str,
    formations: list[str] | None = None,
) -> dict[str, Any]:
    k = normalize_team_key(team_key)
    if k not in _COACH_BLURB:
        raise ValueError("team은 korea, mexico, south_africa, czech_republic 중 하나여야 합니다.")

    bundle = load_core_squad(k)
    players = bundle.get("players") or []
    if not isinstance(players, list) or len(players) < 11:
        raise ValueError("정적 스쿼드에 선수가 11명 미만입니다.")

    want = formations if formations else list(_DEFAULT_FORMATIONS)
    ordered: list[str] = []
    for f in want:
        fs = str(f).strip()
        if fs in FORMATION_SLOTS and fs not in ordered:
            ordered.append(fs)
    if not ordered:
        raise ValueError("유효한 포메이션이 없습니다.")

    coach = _COACH_BLURB[k]
    recommendations: list[dict[str, Any]] = []
    for formation in ordered:
        one = await generate_best_xi(formation, players, [], coach_blurb=coach)
        recommendations.append(one)

    return {
        "team_key": k,
        "display_ko": bundle.get("display_ko"),
        "display_en": bundle.get("display_en"),
        "note_ko": bundle.get("note_ko"),
        "squad_size": len(players),
        "formations_requested": ordered,
        "recommendations": recommendations,
    }
