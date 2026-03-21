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
          2026 북중미 월드컵 공동 개최국 중 하나인 멕시코 대표팀 소개와, API 기반 <strong>예시 베스트 11</strong>
          (4-3-3 배치)입니다.
        </>
      }
      namuUrl={MEXICO_NAMU_WIKI_URL}
      namuArticleTitle="멕시코 축구 국가대표팀"
      introSections={mexicoIntroSections}
    />
  );
}
