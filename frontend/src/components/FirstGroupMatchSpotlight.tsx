import { Link } from "react-router-dom";
import GroupStageMatchSpotlight from "./GroupStageMatchSpotlight";
import { FIRST_MATCH_HOOKS_KO, GROUP_A_FALLBACK_KICKOFF_UTC, NAMU_WIKI_2026 } from "../data/korea2026NamuContext";

type Props = {
  officialKickoffIso?: string | null;
  officialVenue?: string;
  officialCity?: string;
  /** API에 상대명이 올라온 경우(플레이오프 승자 확정 후 등) */
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
  const title = useApiName
    ? `🇰🇷 대한민국 vs ${raw}`
    : "🇰🇷 대한민국 vs UEFA 플레이오프 D 승자 (상대 미확정)";

  return (
    <GroupStageMatchSpotlight
      variant="first-match"
      badge="A조 하이라이트 · 1차전"
      title={title}
      subtitle="조별리그 첫 경기 · 과달라하라(아크론) 일대"
      officialKickoffIso={officialKickoffIso}
      fallbackKickoffIso={GROUP_A_FALLBACK_KICKOFF_UTC.firstMatch}
      officialVenue={officialVenue}
      officialCity={officialCity}
      defaultPlaceLine="에스타디오 아크론 · 과달라하라/자포판(브리핑·FIFA 스케줄 계열)"
      localTimeZone="America/Mexico_City"
      localTimeLabel="과달라하라·멕시코(중부) 현지"
      hooksTitle="1차전 포인트"
      hooks={FIRST_MATCH_HOOKS_KO}
      ariaTitleId="first-match-spotlight-title"
      actions={
        <>
          <Link className="btn btn-primary group-match-spotlight__btn" to="/2026/playoff-d">
            플레이오프 D 상대 정보
          </Link>
          <a className="btn btn-secondary group-match-spotlight__btn" href={NAMU_WIKI_2026.groupA} target="_blank" rel="noreferrer">
            나무위키 · A조
          </a>
          <a className="btn btn-secondary group-match-spotlight__btn" href={NAMU_WIKI_2026.hong2026Hub} target="_blank" rel="noreferrer">
            나무위키 · 홍명보호 2026 허브
          </a>
        </>
      }
      footer={
        <div className="group-match-spotlight__footer-note" role="note">
          <p className="group-match-spotlight__footer-note-p">
            <strong>상대 국가</strong>는 UEFA 플레이오프 D 통과 팀으로, 본선 직전 확정됩니다. 확정되면 제목·Elo 시뮬 등을 붙일 수 있습니다.
          </p>
        </div>
      }
    />
  );
}
