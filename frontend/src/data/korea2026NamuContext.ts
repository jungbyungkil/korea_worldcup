/**
 * A조 1·2·3차전 스포트라이트 — 나무위키 링크·킥오프 추정(UTC)·훅 문구.
 * 일정·시각은 FIFA 공식·API가 최종입니다.
 */
export const NAMU_WIKI_2026 = {
  groupA: "https://namu.wiki/w/2026%20FIFA%20%EC%9B%94%EB%93%9C%EC%BB%B5/A%EC%A1%B0",
  hong2026Hub:
    "https://namu.wiki/w/%ED%99%8D%EB%AA%85%EB%B3%B4%ED%98%B8(%EC%84%B1%EC%9D%B8%202%EA%B8%B0)/2026%20FIFA%20%EC%9B%94%EB%93%9C%EC%BB%B5",
  koreaVsMexico:
    "https://namu.wiki/w/%ED%99%8D%EB%AA%85%EB%B3%B4%ED%98%B8(%EC%84%B1%EC%9D%B8%202%EA%B8%B0)/2026%20FIFA%20%EC%9B%94%EB%93%9C%EC%BB%B5/%EB%A9%95%EC%8B%9C%EC%BD%94%EC%A0%84",
  koreaVsSouthAfrica:
    "https://namu.wiki/w/%ED%99%8D%EB%AA%85%EB%B3%B4%ED%98%B8(%EC%84%B1%EC%9D%B8%202%EA%B8%B0)/2026%20FIFA%20%EC%9B%94%EB%93%9C%EC%BB%B5/%EB%82%A8%EC%95%84%ED%94%84%EB%A6%AC%EC%B9%B4%20%EA%B3%B5%ED%99%94%EA%B5%AD%EC%A0%84",
} as const;

/** API 일정이 없을 때만 쓰는 추정 킥오프(UTC). FIFA에 맞춰 수정 권장. */
export const GROUP_A_FALLBACK_KICKOFF_UTC = {
  /** 1차전: UEFA 플레이오프 D 승자 — 미국 동부 6/11 22:00 ET(EDT) ≈ 6/12 02:00 UTC (FOX·FIFA 스케줄 계열) */
  firstMatch: "2026-06-12T02:00:00.000Z",
  /** 2차전 vs 멕시코: FIFA 확정 — 6/18 과달라하라(에스타디오 아크론) 현지 19:00 (America/Mexico_City, UTC−6) → 6/19 01:00 UTC */
  mexico: "2026-06-19T01:00:00.000Z",
  southAfrica: "2026-06-25T01:00:00.000Z",
} as const;

export const FIRST_MATCH_HOOKS_KO = [
  "A조 **1차전** 상대는 **UEFA 플레이오프 D조**를 통과한 팀입니다. (체코·덴마크·아일랜드·북마케도니아 등이 후보 — **본선 직전 확정**)",
  "개최지·경기장은 FIFA·주요 언론 기준 **과달라하라(자포판) 에스타디오 아크론** 일대로 정리되는 경우가 많습니다. **공식 매치센터·API 일정**과 함께 확인하세요.",
  "조별리그 **첫 경기**로, 이후 멕시코·남아공전으로 이어지는 **리듬·컨디션**의 시작점이 됩니다.",
] as const;

export const MEXICO_MATCH_HOOKS_KO = [
  "A조 2차전에서 **개최국 멕시코**를 만납니다. 관중·기후·일정 리듬이 모두 변수가 될 수 있는 원정 성격의 경기입니다.",
  "대한민국은 과거 월드컵 본선에서 멕시코와 여러 번 조별리그에서 맞대결을 펼쳤습니다. (역대 전적·세부 스코어는 나무위키·FIFA 기록실 참고)",
  "브리핑상 경기지는 **과달라하라 일대(아크론)** 로 정리되는 경우가 많으나, **공식 매치센터·API 일정**을 꼭 함께 확인하세요.",
] as const;

export const SOUTH_AFRICA_MATCH_HOOKS_KO = [
  "A조 **3차전·조별리그 마지막 경기**로, 나무위키 등에서는 **32강(와일드카드) 향방**과 맞물린 분수령으로 자주 다뤄집니다.",
  "양국 **첫 A매치**이며, 브리핑상 **몬테레이 BBVA** 일대에서 치러질 것으로 정리되는 경우가 많습니다. (최종은 FIFA·API)",
  "남아공전 직전 일정이 멕시코·미국 이동 등으로 이어져 **체력·컨디션 관리**가 변수가 될 수 있다는 분석이 있습니다. (위키·언론 브리핑 참고)",
] as const;
