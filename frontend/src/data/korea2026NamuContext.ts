/**
 * A조 1·2·3차전 스포트라이트 — 나무위키 링크·킥오프 추정(UTC)·훅 문구.
 * 일정·시각은 FIFA 공식·API가 최종입니다.
 */
export const NAMU_WIKI_2026 = {
  groupA: "https://namu.wiki/w/2026%20FIFA%20%EC%9B%94%EB%93%9C%EC%BB%B5/A%EC%A1%B0",
  hong2026Hub:
    "https://namu.wiki/w/%ED%99%8D%EB%AA%85%EB%B3%B4%ED%98%B8(%EC%84%B1%EC%9D%B8%202%EA%B8%B0)/2026%20FIFA%20%EC%9B%94%EB%93%9C%EC%BB%B5",
  koreaVsCzech:
    "https://namu.wiki/w/%ED%99%8D%EB%AA%85%EB%B3%B4%ED%98%B8(%EC%84%B1%EC%9D%B8%202%EA%B8%B0)/2026%20FIFA%20%EC%9B%94%EB%93%9C%EC%BB%B5/%EC%B2%B4%EC%BD%94%EC%A0%84",
  koreaVsMexico:
    "https://namu.wiki/w/%ED%99%8D%EB%AA%85%EB%B3%B4%ED%98%B8(%EC%84%B1%EC%9D%B8%202%EA%B8%B0)/2026%20FIFA%20%EC%9B%94%EB%93%9C%EC%BB%B5/%EB%A9%95%EC%8B%9C%EC%BD%94%EC%A0%84",
  koreaVsSouthAfrica:
    "https://namu.wiki/w/%ED%99%8D%EB%AA%85%EB%B3%B4%ED%98%B8(%EC%84%B1%EC%9D%B8%202%EA%B8%B0)/2026%20FIFA%20%EC%9B%94%EB%93%9C%EC%BB%B5/%EB%82%A8%EC%95%84%ED%94%84%EB%A6%AC%EC%B9%B4%20%EA%B3%B5%ED%99%94%EA%B5%AD%EC%A0%84",
} as const;

/** API 일정이 없을 때 쓰는 폴백 킥오프(UTC) — FIFA 확정값 (2026-05 기준). */
export const GROUP_A_FALLBACK_KICKOFF_UTC = {
  /** 1차전 vs 체코 — FIFA 확정: 6/11 20:00 UTC-6 (에스타디오 아크론, 사포판) → 6/12 02:00 UTC */
  czechRepublic: "2026-06-12T02:00:00.000Z",
  /** 2차전 vs 멕시코 — FIFA 확정: 6/18 19:00 UTC-6 (에스타디오 아크론, 사포판) → 6/19 01:00 UTC */
  mexico: "2026-06-19T01:00:00.000Z",
  /** 3차전 vs 남아공 — FIFA 확정: 6/24 19:00 UTC-6 (에스타디오 BBVA, 과달루페) → 6/25 01:00 UTC */
  southAfrica: "2026-06-25T01:00:00.000Z",
} as const;

export const CZECH_MATCH_HOOKS_KO = [
  "A조 **1차전** 상대는 **체코**입니다. **UEFA 플레이오프 D**를 통과해 본선에 올라왔으며, 유럽 예선·플레이오프를 거친 **조직력·세트피스**가 강점으로 꼽히는 편입니다.",
  "개최지·경기장은 FIFA·주요 언론 기준 **과달라하라(자포판) 에스타디오 아크론** 일대로 정리되는 경우가 많습니다. **공식 매치센터·API 일정**과 함께 확인하세요.",
  "조별리그 **첫 경기**로, 이후 멕시코·남아공전으로 이어지는 **리듬·컨디션**의 시작점이 됩니다.",
] as const;

export const MEXICO_MATCH_HOOKS_KO = [
  "**[종료] 최종 스코어: 🇰🇷 대한민국 0 - 1 🇲🇽 멕시코** — 2차전 패배.",
  "멕시코의 선제골에 한국이 끝내 동점을 만들지 못하고 0-1로 패배. 멕시코는 2연승(6점)으로 **A조 1위 조기 확정**.",
  "한국은 1승 1패(3점)로 3차전 남아공전에서 **무승부 이상이면 16강 진출 확정**. (체코 1-1 남아공으로 2위 경쟁 지속)",
] as const;

export const SOUTH_AFRICA_MATCH_HOOKS_KO = [
  "**무승부 이상이면 16강 확정!** — 현재 한국 3점·남아공 1점. 한국이 비기면 체코(1점)와 동률이지만 **H2H 상대전적(1차전 2-1 승) 우위**로 A조 2위 확정.",
  "**한국이 이기면 완전 확정**, **비겨도 확정**, **지면 탈락**. 체코 vs 멕시코가 동시에 열리나 결과와 무관하게 한국이 무승부 이상이면 진출.",
  "양국 **첫 A매치** · **에스타디오 BBVA(과달루페, 누에보레온 주)** 개최. 6월 25일 10:00 KST 킥오프.",
] as const;
