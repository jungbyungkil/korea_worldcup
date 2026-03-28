"""SoFIFA CDN 얼굴 이미지 URL 조합 (스크래핑 없음).

EA Sports FC / FIFA 시리즈 렌더 이미지는 SoFIFA CDN에 규칙적인 경로로 노출됩니다.
상업적 이용·재배포·대량 수집은 SoFIFA·EA 이용약관 및 저작권을 반드시 확인하세요.
"""

from __future__ import annotations

import os


def sofifa_portrait_url(
    sofifa_id: int,
    *,
    game_ver: str | None = None,
    size: int = 120,
) -> str:
    """``sofifa_id``(선수 페이지의 숫자 ID)로 PNG 초상 URL을 만듭니다.

    ``game_ver``: FC 에디션 연도 접두(예: 26 → FC26). ``SOFIFA_CDN_IMG_VER`` 환경 변수로 기본값 설정.
    ``size``: 60, 120, 180 중 하나 권장.
    """
    ver = (game_ver or os.getenv("SOFIFA_CDN_IMG_VER", "26")).strip() or "26"
    if size not in (60, 120, 180):
        size = 120
    a = sofifa_id // 1000
    b = sofifa_id % 1000
    return f"https://cdn.sofifa.net/players/{a}/{b}/{ver}_{size}.png"
