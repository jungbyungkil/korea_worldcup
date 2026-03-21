"""A조 1차전 상대 — UEFA 플레이오프 D 승자. 미확정 시 메타만, 확정 시 ``GROUP_A_PLAYOFF_D_TEAM_SEARCH`` 로 API 조회."""

from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any

from app.services.light_national_team_features import LightNationalTeamConfig, build_light_national_team_payload


def _frozenset_csv(env_name: str) -> frozenset[str]:
    raw = os.getenv(env_name, "") or ""
    return frozenset(x.strip().lower() for x in raw.split(",") if x.strip())


async def build_playoff_d_opponent_payload() -> dict[str, Any]:
    now = datetime.now(timezone.utc).isoformat()
    search = (os.getenv("GROUP_A_PLAYOFF_D_TEAM_SEARCH") or "").strip()

    if not search:
        return {
            "last_updated": now,
            "opponent_status": "tbd",
            "playoff_slot": "UEFA_PATH_D",
            "team": None,
            "team_id": None,
            "team_display_ko": "UEFA 플레이오프 D 승자 (미확정)",
            "squad_size": 0,
            "starting_xi": [],
            "injuries": [],
            "formation_display": None,
            "starting_xi_note_ko": (
                "상대 국가가 확정되면 백엔드 `.env`에 "
                "`GROUP_A_PLAYOFF_D_TEAM_SEARCH`(예: Denmark) 등을 설정하고 서버를 재시작하면 "
                "스쿼드·예시 11인이 표시됩니다."
            ),
            "config": {
                "GROUP_A_PLAYOFF_D_TEAM_SEARCH": "",
                "hint": "확정 후 GROUP_A_PLAYOFF_D_TEAM_SEARCH, GROUP_A_PLAYOFF_D_DISPLAY_NAME_KO, "
                "GROUP_A_PLAYOFF_D_TEAMS_COUNTRY(선택) 설정",
            },
        }

    display_ko = (os.getenv("GROUP_A_PLAYOFF_D_DISPLAY_NAME_KO") or "").strip() or search
    exact = _frozenset_csv("GROUP_A_PLAYOFF_D_EXACT_TEAM_NAMES")
    if not exact:
        exact = frozenset({search.lower()})

    name_bonus = _frozenset_csv("GROUP_A_PLAYOFF_D_NAME_BONUS")
    if not name_bonus:
        name_bonus = frozenset({search.lower()})

    country_bonus = _frozenset_csv("GROUP_A_PLAYOFF_D_COUNTRY_BONUS")
    teams_country = (os.getenv("GROUP_A_PLAYOFF_D_TEAMS_COUNTRY") or "").strip() or None

    cfg = LightNationalTeamConfig(
        team_display=display_ko,
        search_query=search,
        exact_team_names=exact,
        name_bonus_substrings=name_bonus,
        country_bonus=country_bonus,
        error_code="playoff_d_team_not_found",
        include_stats_env="API_FOOTBALL_PLAYOFF_D_INCLUDE_CLUB_STATS",
        cache_env_documentation="API_FOOTBALL_PLAYOFF_D_FEATURES_CACHE_SEC",
        teams_country_fallback=teams_country,
    )
    payload = await build_light_national_team_payload(cfg)
    payload["opponent_status"] = "confirmed"
    payload["playoff_slot"] = "UEFA_PATH_D"
    payload["team_display_ko"] = display_ko
    return payload
