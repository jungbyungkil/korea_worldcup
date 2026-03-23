import type { WcTournamentTsdbHighlight } from "../api/history";

/**
 * 2022 FIFA 월드컵 카타르 — 대한민국 본선 4경기
 * FIFA 공식 YouTube 채널(https://www.youtube.com/@fifa) 하이라이트 (watch URL)
 *
 * 모달 표시용 소스는 `backend/app/data/korea_world_cup_history.json` 의 `video_links`와 동기화할 것.
 */
export const KOREA_2022_WC_OFFICIAL_YOUTUBE_HIGHLIGHTS = [
  {
    round: "조별리그 1차전",
    eventName: "Uruguay v Korea Republic",
    date: "2022-11-24",
    scoreKo: "0-0 무",
    youtubeUrl: "https://www.youtube.com/watch?v=TCNVlLl6M9E",
  },
  {
    round: "조별리그 2차전",
    eventName: "Korea Republic v Ghana",
    date: "2022-11-28",
    scoreKo: "2-3 패",
    youtubeUrl: "https://www.youtube.com/watch?v=pb4nQnRaQx8",
  },
  {
    round: "조별리그 3차전",
    eventName: "Korea Republic v Portugal",
    date: "2022-12-02",
    scoreKo: "2-1 승",
    youtubeUrl: "https://www.youtube.com/watch?v=DVNwiAPuPTY",
  },
  {
    round: "16강",
    eventName: "Brazil v Korea Republic",
    date: "2022-12-05",
    scoreKo: "1-4 패",
    youtubeUrl: "https://www.youtube.com/watch?v=c0-ZhEkEFtA",
  },
] as const;

export type Korea2022WcOfficialClip = (typeof KOREA_2022_WC_OFFICIAL_YOUTUBE_HIGHLIGHTS)[number];

/** 모달·TSDB 슬롯과 동일한 형태로 변환 */
export function korea2022OfficialHighlightsAsTsdbShape(): WcTournamentTsdbHighlight[] {
  return KOREA_2022_WC_OFFICIAL_YOUTUBE_HIGHLIGHTS.map((x) => ({
    event_name: `${x.eventName} · ${x.round} · ${x.scoreKo}`,
    video_url: x.youtubeUrl,
    date_event: x.date,
    league: "FIFA World Cup Qatar 2022™",
    season: "2022",
  }));
}
