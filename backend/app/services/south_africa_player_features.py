"""남아프리카 공화국 국가대표 — ``light_national_team_features`` 설정 래퍼."""

from __future__ import annotations

from typing import Any

from app.services.light_national_team_features import LightNationalTeamConfig, build_light_national_team_payload

_SOUTH_AFRICA_CFG = LightNationalTeamConfig(
    team_display="South Africa",
    search_query="South Africa",
    exact_team_names=frozenset({"south africa"}),
    name_bonus_substrings=frozenset({"south africa"}),
    country_bonus=frozenset({"south africa"}),
    error_code="south_africa_team_not_found",
    include_stats_env="API_FOOTBALL_SOUTH_AFRICA_INCLUDE_CLUB_STATS",
    cache_env_documentation="API_FOOTBALL_SOUTH_AFRICA_FEATURES_CACHE_SEC",
    teams_country_fallback="South Africa",
)


async def build_south_africa_player_features_payload() -> dict[str, Any]:
    return await build_light_national_team_payload(_SOUTH_AFRICA_CFG)
