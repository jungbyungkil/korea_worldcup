import NationalTeamLightPage from "./NationalTeamLightPage";
import { MEXICO_NAMU_WIKI_URL, mexicoIntroSections } from "../mexicoTeamIntro";

export default function MexicoTeam() {
  return (
    <NationalTeamLightPage
      apiPath="/api/v1/worldcup2026/mexico/player-features"
      loadingLabel="멕시코 데이터 불러오는 중…"
      faultTitle="멕시코 국가대표"
      notFoundError="mexico_team_not_found"
      heading="멕시코 국가대표 · El Tri"
      lead={
        <>
          2026 북중미 월드컵 공동 개최국 <strong>El Tri</strong> — 아래 <strong>예시 23인</strong>·
          <strong>감독 AI 포메이션</strong>은 앱에 포함된 데이터입니다. API-Football이 되면 부상·스쿼드 요약이 아래에
          이어집니다.
        </>
      }
      namuUrl={MEXICO_NAMU_WIKI_URL}
      namuArticleTitle="멕시코 축구 국가대표팀"
      introSections={mexicoIntroSections}
      coreSquadTeamKey="mexico"
    />
  );
}
