"""레거시 모듈명 유지: A조 1차전 상대는 체코로 확정되어 ``czech_player_features``와 동일 페이로드를 씁니다."""

from __future__ import annotations

from typing import Any

from app.services.czech_player_features import build_czech_player_features_payload


async def build_playoff_d_opponent_payload() -> dict[str, Any]:
    return await build_czech_player_features_payload()
