"""멕시코 국가대표 — ``light_national_team_features`` 설정 래퍼."""

from __future__ import annotations

from typing import Any

from app.services.light_national_team_features import LightNationalTeamConfig, build_light_national_team_payload

_MEXICO_CFG = LightNationalTeamConfig(
    team_display="Mexico",
    search_query="Mexico",
    exact_team_names=frozenset({"mexico"}),
    name_bonus_substrings=frozenset({"mexico"}),
    country_bonus=frozenset({"mexico"}),
    error_code="mexico_team_not_found",
    include_stats_env="API_FOOTBALL_MEXICO_INCLUDE_CLUB_STATS",
    cache_env_documentation="API_FOOTBALL_MEXICO_FEATURES_CACHE_SEC",
    teams_country_fallback="Mexico",
    # API-Sports 남자 국가대표팀은 보통 id=16 (검색 페이지 밀림·플랜 제한 시 .env에 숫자만 설정)
    team_id_override_env="API_FOOTBALL_TEAM_ID_MEXICO",
)


async def build_mexico_player_features_payload() -> dict[str, Any]:
    return await build_light_national_team_payload(_MEXICO_CFG)
