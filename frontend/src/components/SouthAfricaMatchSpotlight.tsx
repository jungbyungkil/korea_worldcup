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
      badge="A조 하이라이트 · 3차전"
      title="🇰🇷 대한민국 vs 🇿🇦 남아프리카 공화국"
      subtitle="조별리그 최종전 · 몬테레이"
      officialKickoffIso={officialKickoffIso}
      fallbackKickoffIso={GROUP_A_FALLBACK_KICKOFF_UTC.southAfrica}
      officialVenue={officialVenue}
      officialCity={officialCity}
      defaultPlaceLine="에스타디오 BBVA · 몬테레이(브리핑·나무위키 기준)"
      localTimeZone="America/Monterrey"
      localTimeLabel="몬테레이 현지"
      hooksTitle="3차전이 왜 중요한가"
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
