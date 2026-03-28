import { Link } from "react-router-dom";
import GroupStageMatchSpotlight from "./GroupStageMatchSpotlight";
import KoreaOpponentEloStrip from "./KoreaOpponentEloStrip";
import { GROUP_A_FALLBACK_KICKOFF_UTC, MEXICO_MATCH_HOOKS_KO, NAMU_WIKI_2026 } from "../data/korea2026NamuContext";

type Props = {
  officialKickoffIso?: string | null;
  officialVenue?: string;
  officialCity?: string;
};

export default function MexicoMatchSpotlight({ officialKickoffIso, officialVenue, officialCity }: Props) {
  return (
    <GroupStageMatchSpotlight
      variant="mexico"
      badge="A조 하이라이트 · 2차전"
      title="🇰🇷 대한민국 vs 🇲🇽 멕시코"
      subtitle="개최국과의 조별리그"
      officialKickoffIso={officialKickoffIso}
      fallbackKickoffIso={GROUP_A_FALLBACK_KICKOFF_UTC.mexico}
      officialVenue={officialVenue}
      officialCity={officialCity}
      defaultPlaceLine="과달라하라 일대(브리핑 기준)"
      localTimeZone="America/Mexico_City"
      localTimeLabel="멕시코(중부) 현지"
      hooksTitle="왜 멕시코 전이 뜨거운가"
      hooks={MEXICO_MATCH_HOOKS_KO}
      ariaTitleId="mexico-spotlight-title"
      actions={
        <>
          <a className="btn btn-primary group-match-spotlight__btn" href={NAMU_WIKI_2026.koreaVsMexico} target="_blank" rel="noreferrer">
            나무위키 · 멕시코전
          </a>
          <Link className="btn btn-secondary group-match-spotlight__btn" to="/2026/mexico">
            멕시코 대표팀 데이터
          </Link>
          <a className="btn btn-secondary group-match-spotlight__btn" href={NAMU_WIKI_2026.groupA} target="_blank" rel="noreferrer">
            나무위키 · A조
          </a>
        </>
      }
      footer={
        <KoreaOpponentEloStrip
          opponentQuery="Mexico"
          opponentFlag="🇲🇽"
          opponentNameKo="멕시코"
          visualVariant="mexico"
        />
      }
    />
  );
}
