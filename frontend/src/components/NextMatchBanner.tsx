import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

interface MatchInfo {
  opponent: string;
  opponentFlag: string;
  kickoffIso: string;
  label: string;
  linkTo: string;
  variant: "czech" | "mexico" | "south-africa";
}

const MATCHES: MatchInfo[] = [
  {
    opponent: "체코",
    opponentFlag: "🇨🇿",
    kickoffIso: "2026-06-12T02:00:00.000Z",
    label: "A조 1차전",
    linkTo: "/2026/korea",
    variant: "czech",
  },
  {
    opponent: "멕시코",
    opponentFlag: "🇲🇽",
    kickoffIso: "2026-06-19T01:00:00.000Z",
    label: "A조 2차전",
    linkTo: "/2026/korea",
    variant: "mexico",
  },
  {
    opponent: "남아공",
    opponentFlag: "🇿🇦",
    kickoffIso: "2026-06-25T01:00:00.000Z",
    label: "A조 3차전",
    linkTo: "/2026/korea",
    variant: "south-africa",
  },
];

function countdownParts(target: Date, now: Date) {
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return { ended: true, days: 0, hours: 0, mins: 0, secs: 0 };
  const totalSecs = Math.floor(diff / 1000);
  const days = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  return { ended: false, days, hours, mins, secs };
}

export default function NextMatchBanner() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // 아직 킥오프 전인 가장 가까운 경기 찾기
  const nextMatch = useMemo(() => {
    for (const m of MATCHES) {
      const t = new Date(m.kickoffIso);
      if (t.getTime() > now.getTime()) return m;
    }
    return null; // 모든 경기 종료
  }, [now]);

  if (!nextMatch) {
    return (
      <div className="next-match-banner next-match-banner--done">
        <span>🏆 A조 조별리그 3경기 모두 완료!</span>
      </div>
    );
  }

  const target = new Date(nextMatch.kickoffIso);
  const cd = countdownParts(target, now);

  // 한국 시간(UTC+9) 표시
  const krTime = target.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Link
      to={nextMatch.linkTo}
      className={`next-match-banner next-match-banner--${nextMatch.variant}`}
      aria-label={`다음 경기: ${nextMatch.label} 한국 vs ${nextMatch.opponent} — ${nextMatch.linkTo}으로 이동`}
    >
      <div className="next-match-banner__inner">
        <div className="next-match-banner__label">{nextMatch.label}</div>
        <div className="next-match-banner__matchup">
          <span>🇰🇷</span>
          <span className="next-match-banner__vs">vs</span>
          <span>{nextMatch.opponentFlag}</span>
          <span className="next-match-banner__opp">{nextMatch.opponent}</span>
        </div>
        <div className="next-match-banner__cd" role="timer" aria-live="polite">
          <span>
            <strong>{cd.days}</strong>
            <small>일</small>
          </span>
          <span className="next-match-banner__sep">:</span>
          <span>
            <strong>{String(cd.hours).padStart(2, "0")}</strong>
            <small>시</small>
          </span>
          <span className="next-match-banner__sep">:</span>
          <span>
            <strong>{String(cd.mins).padStart(2, "0")}</strong>
            <small>분</small>
          </span>
          <span className="next-match-banner__sep">:</span>
          <span>
            <strong>{String(cd.secs).padStart(2, "0")}</strong>
            <small>초</small>
          </span>
        </div>
        <div className="next-match-banner__time">🇰🇷 한국 시간: {krTime}</div>
      </div>
      <div className="next-match-banner__arrow" aria-hidden>›</div>
    </Link>
  );
}
