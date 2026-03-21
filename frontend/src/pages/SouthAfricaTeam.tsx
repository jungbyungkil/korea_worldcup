import NationalTeamLightPage from "./NationalTeamLightPage";
import { SOUTH_AFRICA_NAMU_WIKI_URL, southAfricaIntroSections } from "../southAfricaTeamIntro";

export default function SouthAfricaTeam() {
  return (
    <NationalTeamLightPage
      apiPath="/api/v1/worldcup2026/south-africa/player-features"
      loadingLabel="남아공 데이터 불러오는 중…"
      faultTitle="남아프리카 공화국 국가대표"
      notFoundError="south_africa_team_not_found"
      heading="남아프리카 공화국 · Bafana Bafana"
      lead={
        <>
          2026 월드컵에서 한국과 **A조**에서 맞붙는 상대 중 하나로도 알려진 남아공 대표팀 소개와, API 기반{" "}
          <strong>예시 베스트 11</strong>(4-3-3 배치)입니다.
        </>
      }
      namuUrl={SOUTH_AFRICA_NAMU_WIKI_URL}
      namuArticleTitle="남아프리카 공화국 축구 국가대표팀"
      introSections={southAfricaIntroSections}
    />
  );
}
