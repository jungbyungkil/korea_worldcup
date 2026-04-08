import { Link } from "react-router-dom";
import GroupStageMatchSpotlight from "./GroupStageMatchSpotlight";
import KoreaOpponentEloStrip from "./KoreaOpponentEloStrip";
import { CZECH_MATCH_HOOKS_KO, GROUP_A_FALLBACK_KICKOFF_UTC, NAMU_WIKI_2026 } from "../data/korea2026NamuContext";

type Props = {
  officialKickoffIso?: string | null;
  officialVenue?: string;
  officialCity?: string;
  /** API에 상대명이 올라온 경우 */
  opponentFromApi?: string | null;
};

function isMexicoOrSa(name: string): boolean {
  const n = name.toLowerCase();
  return /mexico|méxico|메시코/.test(n) || /south africa|남아프리카/.test(n);
}

export default function FirstGroupMatchSpotlight({
  officialKickoffIso,
  officialVenue,
  officialCity,
  opponentFromApi,
}: Props) {
  const raw = opponentFromApi?.trim();
  const useApiName = raw && !isMexicoOrSa(raw);
  const title = useApiName ? `🇰🇷 대한민국 vs ${raw}` : "🇰🇷 대한민국 vs 🇨🇿 체코";

  return (
    <GroupStageMatchSpotlight
      variant="czech"
      badge="A조 하이라이트 · 1차전"
      badgeEmoji="🏟️"
      title={title}
      subtitle="조별리그 첫 경기 · 과달라하라(아크론) 일대"
      officialKickoffIso={officialKickoffIso}
      fallbackKickoffIso={GROUP_A_FALLBACK_KICKOFF_UTC.czechRepublic}
      officialVenue={officialVenue}
      officialCity={officialCity}
      defaultPlaceLine="에스타디오 아크론 · 과달라하라/자포판(브리핑·FIFA 스케줄 계열)"
      localTimeZone="America/Mexico_City"
      localTimeLabel="과달라하라·멕시코(중부) 현지"
      hooksTitle="1차전 포인트"
      hooks={CZECH_MATCH_HOOKS_KO}
      ariaTitleId="czech-spotlight-title"
      actions={
        <>
          <a className="btn btn-primary group-match-spotlight__btn" href={NAMU_WIKI_2026.koreaVsCzech} target="_blank" rel="noreferrer">
            나무위키 · 체코전
          </a>
          <Link className="btn btn-secondary group-match-spotlight__btn" to="/2026/czech-republic">
            체코 대표팀 데이터
          </Link>
          <a className="btn btn-secondary group-match-spotlight__btn" href={NAMU_WIKI_2026.groupA} target="_blank" rel="noreferrer">
            나무위키 · A조
          </a>
        </>
      }
      footer={
        <KoreaOpponentEloStrip
          opponentQuery="Czech Republic"
          opponentFlag="🇨🇿"
          opponentNameKo="체코"
          visualVariant="czech"
        />
      }
    />
  );
}
