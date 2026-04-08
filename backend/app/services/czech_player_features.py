"""체코 국가대표 — ``light_national_team_features`` 설정 래퍼 (A조 1차전 상대)."""

from __future__ import annotations

from typing import Any

from app.services.light_national_team_features import LightNationalTeamConfig, build_light_national_team_payload

_CZECH_CFG = LightNationalTeamConfig(
    team_display="Czech Republic",
    search_query="Czech Republic",
    exact_team_names=frozenset({"czech republic", "czechia"}),
    name_bonus_substrings=frozenset({"czech", "czechia", "česk"}),
    country_bonus=frozenset({"czech republic", "czechia"}),
    error_code="czech_republic_team_not_found",
    include_stats_env="API_FOOTBALL_CZECH_REPUBLIC_INCLUDE_CLUB_STATS",
    cache_env_documentation="API_FOOTBALL_CZECH_REPUBLIC_FEATURES_CACHE_SEC",
    teams_country_fallback="Czech Republic",
    team_id_override_env="API_FOOTBALL_TEAM_ID_CZECH_REPUBLIC",
)


async def build_czech_player_features_payload() -> dict[str, Any]:
    return await build_light_national_team_payload(_CZECH_CFG)
