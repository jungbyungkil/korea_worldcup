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
          한국과 <strong>A조</strong>에서 맞을 수 있는 <strong>Bafana Bafana</strong> — <strong>예시 23인</strong>·
          <strong>감독 AI 포메이션·슬롯별 이유</strong>는 앱 내장 데이터입니다. API 연동 시 부상 등이 추가됩니다.
        </>
      }
      namuUrl={SOUTH_AFRICA_NAMU_WIKI_URL}
      namuArticleTitle="남아프리카 공화국 축구 국가대표팀"
      introSections={southAfricaIntroSections}
      coreSquadTeamKey="south_africa"
    />
  );
}
