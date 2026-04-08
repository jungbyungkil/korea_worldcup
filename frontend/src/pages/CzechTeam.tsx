import NationalTeamLightPage from "./NationalTeamLightPage";
import { CZECH_NAMU_WIKI_URL, czechIntroSections } from "../czechTeamIntro";

export default function CzechTeam() {
  return (
    <NationalTeamLightPage
      apiPath="/api/v1/worldcup2026/czech-republic/player-features"
      loadingLabel="체코 데이터 불러오는 중…"
      faultTitle="체코 국가대표"
      notFoundError="czech_republic_team_not_found"
      heading="체코 · A조 1차전 상대"
      lead={
        <>
          한국과 <strong>A조 1차전</strong>에서 맞는 <strong>체코</strong> — <strong>예시 23인</strong>·
          <strong>감독 AI 포메이션·슬롯별 이유</strong>는 앱 내장 데이터입니다. API 연동 시 부상 등이 추가됩니다.
        </>
      }
      namuUrl={CZECH_NAMU_WIKI_URL}
      namuArticleTitle="체코 축구 국가대표팀"
      introSections={czechIntroSections}
      coreSquadTeamKey="czech_republic"
      aiOpponentSpot="czech_republic"
    />
  );
}
