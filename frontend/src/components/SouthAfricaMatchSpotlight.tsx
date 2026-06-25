import { Link } from "react-router-dom";
import GroupStageMatchSpotlight from "./GroupStageMatchSpotlight";
import KoreaOpponentEloStrip from "./KoreaOpponentEloStrip";
import { GROUP_A_FALLBACK_KICKOFF_UTC, NAMU_WIKI_2026, SOUTH_AFRICA_MATCH_HOOKS_KO } from "../data/korea2026NamuContext";

type Props = {
  officialKickoffIso?: string | null;
  officialVenue?: string;
  officialCity?: string;
};

export default function SouthAfricaMatchSpotlight({ officialKickoffIso, officialVenue, officialCity }: Props) {
  return (
    <GroupStageMatchSpotlight
      variant="south-africa"
      badge="A조 3차전 · 최종 결과"
      badgeEmoji="📋"
      title="🇰🇷 대한민국 0 - 1 🇿🇦 남아프리카 공화국"
      subtitle="[종료] 1승 2패 · A조 3위 · 32강 와일드카드 진출 여부 대기 중"
      officialKickoffIso={officialKickoffIso}
      fallbackKickoffIso={GROUP_A_FALLBACK_KICKOFF_UTC.southAfrica}
      officialVenue={officialVenue}
      officialCity={officialCity}
      defaultPlaceLine="에스타디오 BBVA · 과달루페(FIFA 확정 2026-05)"
      localTimeZone="America/Monterrey"
      localTimeLabel="과달루페·몬테레이(중부) 현지"
      hooksTitle="최종 결과 · 3위 와일드카드 현황"
      hooks={SOUTH_AFRICA_MATCH_HOOKS_KO}
      ariaTitleId="south-africa-spotlight-title"
      actions={
        <>
          <a
            className="btn btn-primary group-match-spotlight__btn"
            href={NAMU_WIKI_2026.koreaVsSouthAfrica}
            target="_blank"
            rel="noreferrer"
          >
            나무위키 · 남아공전
          </a>
          <Link className="btn btn-secondary group-match-spotlight__btn" to="/2026/south-africa">
            남아공 대표팀 데이터
          </Link>
          <a className="btn btn-secondary group-match-spotlight__btn" href={NAMU_WIKI_2026.groupA} target="_blank" rel="noreferrer">
            나무위키 · A조
          </a>
        </>
      }
      footer={
        <KoreaOpponentEloStrip
          opponentQuery="South Africa"
          opponentFlag="🇿🇦"
          opponentNameKo="남아프리카 공화국"
          visualVariant="south-africa"
        />
      }
    />
  );
}
