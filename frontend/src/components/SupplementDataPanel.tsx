import { useEffect, useMemo, useState } from "react";
import {
  getFootballDataWcMatches,
  getSupplementAGroupMedia,
  getSupplementSources,
  type AGroupMediaResponse,
  type FdWcMatchSlim,
  type FdWcMatchesResponse,
  type SupplementSources,
  type TeamMediaSlim,
} from "../api/worldcup2026";

function BadgeCard({ flag, label, media }: { flag: string; label: string; media: TeamMediaSlim | null | undefined }) {
  const src = media?.badge || media?.logo;
  return (
    <div className="supplement-badge-card">
      {src ? (
        <img className="supplement-badge-card__img" src={src} alt="" loading="lazy" width={72} height={72} />
      ) : (
        <div className="supplement-badge-card__ph" aria-hidden>
          ⚽
        </div>
      )}
      <div className="supplement-badge-card__meta">
        <span className="supplement-badge-card__flag" aria-hidden>
          {flag}
        </span>
        <span className="supplement-badge-card__name">{media?.name || label}</span>
      </div>
    </div>
  );
}

export default function SupplementDataPanel() {
  const [sources, setSources] = useState<SupplementSources | null>(null);
  const [media, setMedia] = useState<AGroupMediaResponse | null>(null);
  const [fd, setFd] = useState<FdWcMatchesResponse | null>(null);
  const [fdErr, setFdErr] = useState<string | null>(null);
  const [bootDone, setBootDone] = useState(false);

  useEffect(() => {
    const done = () => setBootDone(true);
    void Promise.allSettled([
      getSupplementSources().then(setSources).catch(() => setSources(null)),
      getSupplementAGroupMedia().then(setMedia).catch(() => setMedia(null)),
      getFootballDataWcMatches({ season: "2026", limit: 24 })
        .then((d) => {
          setFd(d);
          setFdErr(null);
        })
        .catch((e) => {
          setFd(null);
          setFdErr(e instanceof Error ? e.message : "WC 일정 없음");
        }),
    ]).finally(done);
  }, []);

  const koreaRows = useMemo(() => {
    const list = fd?.matches ?? [];
    return list.filter((m: FdWcMatchSlim) => {
      const h = (m.home || "").toLowerCase();
      const a = (m.away || "").toLowerCase();
      return h.includes("korea") || a.includes("korea");
    });
  }, [fd]);

  return (
    <section className="supplement-panel" aria-label="보조 데이터 소스">
      <h2 className="supplement-panel__title">추가 데이터 (호출 분산)</h2>
      {!bootDone ? <p className="supplement-panel__loading muted">TheSportsDB·Football-Data 등 불러오는 중…</p> : null}
      <p className="supplement-panel__lead muted">
        TheSportsDB · Football-Data.org · Sportmonks 토큰을 켜면 API-Football만 쓸 때보다 UI·일정 보강에 유리합니다.{" "}
        <a href="https://www.football-data.org/" target="_blank" rel="noreferrer">
          Football-Data
        </a>
        {" · "}
        <a href="https://www.thesportsdb.com/" target="_blank" rel="noreferrer">
          TheSportsDB
        </a>
        {" · "}
        <a href="https://www.sportmonks.com/" target="_blank" rel="noreferrer">
          Sportmonks
        </a>
      </p>

      {sources ? (
        <ul className="supplement-panel__sources muted">
          <li>API-Football: {sources.api_football ? "설정됨" : "미설정"}</li>
          <li>Football-Data.org: {sources.football_data_org ? "설정됨" : "미설정"}</li>
          <li>TheSportsDB: {sources.thesportsdb_custom_key ? "커스텀 키" : "데모 키(1)"}</li>
          <li>Sportmonks: {sources.sportmonks ? "설정됨" : "미설정"}</li>
        </ul>
      ) : null}

      {media?.teams ? (
        <div className="supplement-panel__badges">
          <h3 className="supplement-panel__h3">A조 팀 배지 (TheSportsDB)</h3>
          <div className="supplement-panel__badge-row">
            <BadgeCard flag="🇰🇷" label="대한민국" media={media.teams.korea} />
            <BadgeCard flag="🇲🇽" label="멕시코" media={media.teams.mexico} />
            <BadgeCard flag="🇿🇦" label="남아공" media={media.teams.south_africa} />
          </div>
        </div>
      ) : null}

      {fd && koreaRows.length > 0 ? (
        <div className="supplement-panel__fd">
          <h3 className="supplement-panel__h3">월드컵 일정 일부 (Football-Data.org · 한국 관련)</h3>
          <div className="supplement-panel__table-wrap">
            <table className="supplement-panel__table">
              <thead>
                <tr>
                  <th>일시(UTC)</th>
                  <th>경기</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {koreaRows.map((m, i) => (
                  <tr key={`${m.utcDate}-${i}`}>
                    <td>{m.utcDate ? new Date(m.utcDate).toLocaleString() : "—"}</td>
                    <td>
                      {m.home ?? "?"} vs {m.away ?? "?"}
                      {m.score_fulltime?.home != null && m.score_fulltime?.away != null
                        ? ` (${m.score_fulltime.home}-${m.score_fulltime.away})`
                        : ""}
                    </td>
                    <td>{m.status ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : fdErr && sources?.football_data_org ? (
        <p className="supplement-panel__fd-err muted">Football-Data WC: {fdErr}</p>
      ) : sources?.football_data_org === false ? (
        <p className="muted supplement-panel__hint">
          <code>FOOTBALL_DATA_ORG_TOKEN</code>을 넣으면 위 표에 FIFA WC 일정이 보일 수 있습니다(플랜에 따라 제한).
        </p>
      ) : null}
    </section>
  );
}
