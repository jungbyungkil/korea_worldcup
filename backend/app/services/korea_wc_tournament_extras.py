"""한국 월드컵 이력 상세 — TheSportsDB 하이라이트 조회용 메타데이터."""

from __future__ import annotations

import os

# TheSportsDB의 FIFA World Cup 리그 ID (팀 조회 JSON 등에서 확인). 필요 시 .env 로 덮어쓰기.
WC_LEAGUE_ID_DEFAULT = 4429


def wc_league_id() -> int:
    raw = os.getenv("THESPORTSDB_WC_LEAGUE_ID", "").strip()
    if not raw:
        return WC_LEAGUE_ID_DEFAULT
    try:
        return int(raw)
    except ValueError:
        return WC_LEAGUE_ID_DEFAULT


# 대회별 결승(또는 막바지) 날짜 — eventshighlights.php 의 d= 파라미터용
# 카타르 2022는 겨울 개최
WC_HIGHLIGHT_QUERY_DATE: dict[int, str] = {
    1954: "1954-07-04",
    1986: "1986-06-29",
    1990: "1990-07-08",
    1994: "1994-07-17",
    1998: "1998-07-12",
    2002: "2002-06-30",
    2006: "2006-07-09",
    2010: "2010-07-11",
    2014: "2014-07-13",
    2018: "2018-07-15",
    2022: "2022-12-18",
}


def highlight_query_date_for_year(year: int) -> str:
    if year in WC_HIGHLIGHT_QUERY_DATE:
        return WC_HIGHLIGHT_QUERY_DATE[year]
    return f"{year}-07-10"
