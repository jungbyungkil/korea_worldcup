import NationalTeamLightPage from "./NationalTeamLightPage";
import { PLAYOFF_D_GROUP_A_NAMU, playoffDIntroSections } from "../playoffDOpponentIntro";
import type { NtLightPayload } from "./NationalTeamLightPage";

function resolvePlayoffDHeading(d: NtLightPayload): string {
  if (d.opponent_status === "confirmed" && d.team) {
    return `${d.team} · A조 1차전 상대`;
  }
  return "UEFA 플레이오프 D 승자 (미확정)";
}

export default function PlayoffDOpponentTeam() {
  return (
    <NationalTeamLightPage
      apiPath="/api/v1/worldcup2026/group-a-playoff-d/player-features"
      loadingLabel="A조 1차전 상대 정보 불러오는 중…"
      faultTitle="UEFA 플레이오프 D (A조 1차전)"
      notFoundError="playoff_d_team_not_found"
      heading="UEFA 플레이오프 D 승자"
      resolveHeading={resolvePlayoffDHeading}
      lead={
        <>
          한국 대표팀 <strong>A조 조별리그 1차전</strong> 상대인 <strong>UEFA 플레이오프 D조 승자</strong> 소개와, 상대가
          확정되면 API-Football 기반 <strong>스쿼드·예시 베스트 11</strong>(4-3-3)입니다.
        </>
      }
      namuUrl={PLAYOFF_D_GROUP_A_NAMU}
      namuArticleTitle="2026 FIFA 월드컵/A조"
      introSections={playoffDIntroSections}
      teamNotFoundHint={
        <p style={{ fontSize: "0.88rem", lineHeight: 1.6 }}>
          <code>GROUP_A_PLAYOFF_D_TEAM_SEARCH</code>(API 검색어)와 선택 항목{" "}
          <code>GROUP_A_PLAYOFF_D_DISPLAY_NAME_KO</code>, <code>GROUP_A_PLAYOFF_D_TEAMS_COUNTRY</code>를{" "}
          <code>backend/.env</code>에서 확인한 뒤 백엔드를 재시작하세요.
        </p>
      }
    />
  );
}
