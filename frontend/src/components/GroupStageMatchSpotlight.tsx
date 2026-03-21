import { useEffect, useMemo, useState, type ReactNode } from "react";
import { countdownParts, dualTimeRowsForVenue } from "../lib/matchTimeZones";

export type GroupMatchSpotlightVariant = "first-match" | "mexico" | "south-africa";

type Props = {
  variant: GroupMatchSpotlightVariant;
  badge: string;
  title: string;
  subtitle: string;
  officialKickoffIso?: string | null;
  fallbackKickoffIso: string;
  officialVenue?: string;
  officialCity?: string;
  defaultPlaceLine: string;
  /** IANA (예: America/Mexico_City, America/Monterrey) */
  localTimeZone: string;
  localTimeLabel: string;
  hooksTitle: string;
  hooks: readonly string[];
  actions: ReactNode;
  ariaTitleId: string;
  /** 카드 하단(메인 그리드 뒤)·작은 보조 UI */
  footer?: ReactNode;
};

function renderHookLine(line: string) {
  const parts = line.split(/(\*\*.+?\*\*)/g);
  return parts.map((part, i) => {
    const m = part.match(/^\*\*(.+)\*\*$/);
    if (m) return <strong key={i}>{m[1]}</strong>;
    return <span key={i}>{part}</span>;
  });
}

export default function GroupStageMatchSpotlight({
  variant,
  badge,
  title,
  subtitle,
  officialKickoffIso,
  fallbackKickoffIso,
  officialVenue,
  officialCity,
  defaultPlaceLine,
  localTimeZone,
  localTimeLabel,
  hooksTitle,
  hooks,
  actions,
  ariaTitleId,
  footer,
}: Props) {
  const [now, setNow] = useState(() => new Date());

  const kickoffIso = officialKickoffIso?.trim() || fallbackKickoffIso;
  const source = officialKickoffIso ? "api" : "fallback";

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const target = useMemo(() => new Date(kickoffIso), [kickoffIso]);
  const cd = useMemo(() => countdownParts(target, now), [target, now]);
  const rows = useMemo(
    () => dualTimeRowsForVenue(kickoffIso, localTimeZone, localTimeLabel),
    [kickoffIso, localTimeZone, localTimeLabel]
  );

  const placeLine = [officialVenue, officialCity].filter(Boolean).join(" · ") || defaultPlaceLine;

  const rootClass = `group-match-spotlight group-match-spotlight--${variant}`;

  return (
    <section className={rootClass} aria-labelledby={ariaTitleId}>
      <div className="group-match-spotlight__header">
        <span className="group-match-spotlight__badge">{badge}</span>
        <h2 id={ariaTitleId} className="group-match-spotlight__title">
          {title}
        </h2>
        <p className="group-match-spotlight__sub">{subtitle}</p>
      </div>

      <div className="group-match-spotlight__grid">
        <div className="group-match-spotlight__countdown">
          {cd.ended ? (
            <p className="group-match-spotlight__countdown-done">
              표시된 시각 기준 킥오프 시점에 도달했거나, 일정을 다시 확인해 주세요.
            </p>
          ) : (
            <>
              <p className="group-match-spotlight__countdown-label">킥오프까지 (대시보드 시계 기준)</p>
              <div className="group-match-spotlight__countdown-digits" role="timer" aria-live="polite">
                <span>
                  <strong>{cd.days}</strong>
                  <small>일</small>
                </span>
                <span>
                  <strong>{String(cd.hours).padStart(2, "0")}</strong>
                  <small>시</small>
                </span>
                <span>
                  <strong>{String(cd.mins).padStart(2, "0")}</strong>
                  <small>분</small>
                </span>
                <span>
                  <strong>{String(cd.secs).padStart(2, "0")}</strong>
                  <small>초</small>
                </span>
              </div>
            </>
          )}
          <p className="group-match-spotlight__source muted">
            시각 출처: <strong>{source === "api" ? "API-Football 일정" : "앱 내 추정(피파 공식 확인 필요)"}</strong>
          </p>
          <p className="muted" style={{ margin: "0.5rem 0 0", fontSize: "0.82rem" }}>
            장소(표시): <strong>{placeLine}</strong>
          </p>
        </div>

        <div className="group-match-spotlight__times">
          <h3 className="group-match-spotlight__h3">현지 · 한국 · UTC</h3>
          <ul className="group-match-spotlight__time-list">
            {rows.map((r) => (
              <li key={r.label}>
                <span className="muted">{r.label}</span>
                <span className="group-match-spotlight__time-value">{r.value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="group-match-spotlight__story">
          <h3 className="group-match-spotlight__h3">{hooksTitle}</h3>
          <ul className="group-match-spotlight__hooks">
            {hooks.map((line) => (
              <li key={line}>{renderHookLine(line)}</li>
            ))}
          </ul>
          <div className="group-match-spotlight__actions">{actions}</div>
        </div>
      </div>
      {footer ? <div className="group-match-spotlight__footer">{footer}</div> : null}
    </section>
  );
}
