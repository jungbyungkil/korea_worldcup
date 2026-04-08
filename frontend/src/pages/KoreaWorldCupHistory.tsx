import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getKoreaWorldCupHistory,
  getKoreaWorldCupTournamentDetail,
  type KoreaWorldCupHistoryResponse,
  type KoreaWcTournamentDetailResponse,
  type KoreaWcVideoLink,
  type WcTournamentTsdbHighlight,
} from "../api/history";
import HistoryYearAiPanel from "../components/HistoryYearAiPanel";
import { postAiFunStep2History, type AiFunStep2Scenario, type AiFunStep2Summary } from "../api/worldcup2026";

export default function KoreaWorldCupHistory() {
  const [data, setData] = useState<KoreaWorldCupHistoryResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [openYear, setOpenYear] = useState<number | null>(null);
  const [detail, setDetail] = useState<KoreaWcTournamentDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailErr, setDetailErr] = useState<string | null>(null);

  useEffect(() => {
    getKoreaWorldCupHistory()
      .then(setData)
      .catch((e) => setErr(e instanceof Error ? e.message : "오류"))
      .finally(() => setLoading(false));
  }, []);

  const closeModal = useCallback(() => {
    setOpenYear(null);
    setDetail(null);
    setDetailErr(null);
    setDetailLoading(false);
  }, []);

  useEffect(() => {
    if (openYear == null) return;
    setDetail(null);
    setDetailErr(null);
    setDetailLoading(true);
    getKoreaWorldCupTournamentDetail(openYear)
      .then(setDetail)
      .catch((e) => setDetailErr(e instanceof Error ? e.message : "오류"))
      .finally(() => setDetailLoading(false));
  }, [openYear]);

  useEffect(() => {
    if (openYear == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openYear, closeModal]);

  useEffect(() => {
    if (openYear != null) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
    document.body.style.overflow = "";
    return undefined;
  }, [openYear]);

  if (loading) return <div className="loading-screen">불러오는 중…</div>;
  if (err || !data)
    return (
      <main className="page">
        <h1 className="page-title">한국 월드컵 이력</h1>
        <p className="text-error">{err ?? "데이터 없음"}</p>
        <p className="muted">백엔드가 실행 중인지 확인하세요.</p>
      </main>
    );

  const { summary, tournaments } = data;
  const modalTitleId = "wc-tournament-modal-title";

  return (
    <main className="page">
      <h1 className="page-title">
        🇰🇷 {data.team} · FIFA 월드컵 본선 이력
      </h1>
      <p className="page-lead">
        첫 본선 <strong>{summary.first_appearance}</strong>년 · 총 <strong>{summary.total_finals}</strong>회 본선 · 역대 최고{" "}
        <strong className="text-success">
          {summary.best_finish} ({summary.best_finish_year})
        </strong>
      </p>
      {summary.notes ? <div className="callout" style={{ marginBottom: "1.25rem" }}>{summary.notes}</div> : null}

      <HistoryYearAiPanel tournaments={tournaments} />

      <p className="muted wc-history-hint" style={{ marginBottom: "0.65rem", fontSize: "0.88rem" }}>
        💡 <strong>맨 오른쪽 열</strong>에 경기별 스코어 요약이 한 줄(한 행)에 모여 있습니다.{" "}
        <strong>개최국</strong>을 누르면 모달에서 동일 요약·<strong>영상 URL(새 탭)</strong>을 볼 수 있습니다.
      </p>

      <div className="table-wrap wc-history-table-wrap" style={{ marginBottom: "1.5rem" }}>
        <table className="data-table wc-history-main-table">
          <thead>
            <tr>
              <th>연도</th>
              <th>개최국</th>
              <th>성적</th>
              <th>경기</th>
              <th>승·무·패</th>
              <th>득실</th>
              <th>대회 요약·경기 결과</th>
            </tr>
          </thead>
          <tbody>
            {[...tournaments].reverse().map((t) => (
              <tr key={t.year} className="wc-history-main-table__row">
                <td style={{ fontWeight: 700 }}>{t.year}</td>
                <td>
                  <button
                    type="button"
                    className="wc-host-btn"
                    onClick={() => setOpenYear(t.year)}
                    aria-haspopup="dialog"
                    aria-expanded={openYear === t.year}
                  >
                    {t.host}
                  </button>
                </td>
                <td>
                  <span className={t.result_label.includes("4위") ? "highlight-stat" : ""}>{t.result_label}</span>
                  <div className="muted" style={{ fontSize: "0.8rem", marginTop: "0.2rem" }}>
                    {t.stage}
                  </div>
                </td>
                <td>{t.matches_played}</td>
                <td>
                  {t.wins}승 {t.draws}무 {t.losses}패
                </td>
                <td>
                  {t.goals_for}-{t.goals_against}
                </td>
                <td className="wc-history-main-table__summary-cell">
                  <p className="wc-history-main-table__summary-text">{t.highlights}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.disclaimer ? <p className="muted" style={{ marginTop: "1.5rem", fontSize: "0.82rem" }}>{data.disclaimer}</p> : null}

      {openYear != null ? (
        <div
          className="wc-tournament-modal__backdrop"
          role="presentation"
          onClick={closeModal}
          onKeyDown={(e) => e.key === "Escape" && closeModal()}
        >
          <div
            className="wc-tournament-modal__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalTitleId}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="wc-tournament-modal__head">
              <h2 id={modalTitleId} className="wc-tournament-modal__title">
                {openYear} 월드컵 · 상세
              </h2>
              <button type="button" className="wc-tournament-modal__close" onClick={closeModal} aria-label="닫기">
                ✕
              </button>
            </div>

            {detailLoading ? (
              <p className="wc-tournament-modal__loading">불러오는 중…</p>
            ) : detailErr ? (
              <p className="text-error">{detailErr}</p>
            ) : detail ? (
              <WcTournamentModalBody detail={detail} />
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}

function HistoryAiFunStep2({ detail }: { detail: KoreaWcTournamentDetailResponse }) {
  const ctx = useMemo(
    () => ({
      year: detail.year,
      host: detail.tournament.host,
      stage: detail.tournament.stage,
      result_label: detail.tournament.result_label,
      matches_played: detail.tournament.matches_played,
      wins: detail.tournament.wins,
      draws: detail.tournament.draws,
      losses: detail.tournament.losses,
      goals_for: detail.tournament.goals_for,
      goals_against: detail.tournament.goals_against,
      highlights: detail.tournament.highlights,
    }),
    [detail],
  );
  const [hint, setHint] = useState("VAR, 연장, 득점 장면 등");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [out, setOut] = useState<AiFunStep2Summary | AiFunStep2Scenario | null>(null);

  const run = async (mode: "summary" | "scenario") => {
    setLoading(true);
    setErr(null);
    setOut(null);
    try {
      const r = await postAiFunStep2History({
        mode,
        context: ctx,
        scenario_hint: mode === "scenario" ? hint : undefined,
      });
      setOut(r);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "오류");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="wc-tournament-modal__ai ai-seven-panel" aria-label="한국 대표팀 대회 요약·가상 시나리오">
      <h3 className="wc-tournament-modal__h3">한국 대표팀 대회 요약 / 가상 시나리오</h3>
      <p className="muted" style={{ fontSize: "0.78rem", marginTop: 0 }}>
        엔터용이며 사실과 다를 수 있습니다. 시나리오는 허구입니다.
      </p>
      <div className="ai-seven-btn-row" style={{ flexWrap: "wrap", gap: "0.5rem" }}>
        <button type="button" className="btn btn-secondary" disabled={loading} onClick={() => void run("summary")}>
          3문장 요약
        </button>
        <button type="button" className="btn btn-secondary" disabled={loading} onClick={() => void run("scenario")}>
          가상 시나리오
        </button>
      </div>
      <label className="ai-seven-label" style={{ marginTop: "0.5rem", display: "block" }}>
        시나리오 힌트 (선택)
        <input
          className="ai-seven-input"
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          placeholder="예: VAR 판정이 달랐다면"
        />
      </label>
      {loading ? <p className="muted">생성 중…</p> : null}
      {err ? <p className="text-error">{err}</p> : null}
      {out && out.mode === "summary" ? (
        <ul className="ai-seven-list">
          {out.sentences_ko.map((s: string, i: number) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      ) : null}
      {out && out.mode === "scenario" ? (
        <div className="ai-seven-result">
          <p className="ai-seven-headline">{out.title_ko}</p>
          <p>{out.body_ko}</p>
          <p className="muted ai-seven-disclaimer">{out.disclaimer_ko}</p>
        </div>
      ) : null}
      {out && out.mode === "summary" ? <p className="muted ai-seven-disclaimer">{out.disclaimer_ko}</p> : null}
    </section>
  );
}

function mergeWcYoutubeLinks(
  staticLinks: KoreaWcVideoLink[] | undefined,
  tsdbHighlights: WcTournamentTsdbHighlight[],
): KoreaWcVideoLink[] {
  const out: KoreaWcVideoLink[] = [];
  const seen = new Set<string>();
  for (const x of staticLinks ?? []) {
    const u = (x.url || "").trim();
    if (!u.startsWith("http")) continue;
    if (seen.has(u)) continue;
    seen.add(u);
    out.push({ label: (x.label || "").trim() || "YouTube 링크", url: u });
  }
  for (const h of tsdbHighlights) {
    const u = (h.video_url || "").trim();
    if (!u.startsWith("http")) continue;
    if (seen.has(u)) continue;
    seen.add(u);
    const label = (h.event_name || "").trim() || "TheSportsDB 클립";
    const date = (h.date_event || "").trim();
    out.push({ label: date ? `${label} (${date})` : label, url: u });
  }
  return out;
}

function WcTournamentModalBody({ detail }: { detail: KoreaWcTournamentDetailResponse }) {
  const t = detail.tournament;
  const { tsdb } = detail;
  const linkRows = useMemo(
    () => mergeWcYoutubeLinks(t.video_links, tsdb.highlights ?? []),
    [t.video_links, tsdb.highlights],
  );

  return (
    <div className="wc-tournament-modal__body">
      <section className="wc-tournament-modal__stats" aria-label="대한민국 본선 기록">
        <h3 className="wc-tournament-modal__h3">🇰🇷 이번 대회 기록</h3>
        <ul className="wc-tournament-modal__stat-list">
          <li>
            <span>개최국</span> <strong>{t.host}</strong>
          </li>
          <li>
            <span>성적</span> <strong>{t.result_label}</strong> ({t.stage})
          </li>
          <li>
            <span>경기</span> {t.matches_played}경기 · {t.wins}승 {t.draws}무 {t.losses}패
          </li>
          <li>
            <span>득실</span> {t.goals_for}-{t.goals_against}
          </li>
        </ul>
        <p className="wc-tournament-modal__narrative muted">{t.highlights}</p>
      </section>

      <HistoryAiFunStep2 detail={detail} />

      <section className="wc-tournament-modal__links" aria-label="대한민국 경기 영상 링크">
        <h3 className="wc-tournament-modal__h3">🔗 대한민국 경기 · 영상 URL (새 탭)</h3>
        <p className="muted wc-tournament-modal__tsdb-meta">
          FIFA·YouTube 등이 <strong>다른 사이트 안에서 재생(embed)하는 것을 막는 경우</strong>가 많아, 여기서는{" "}
          <strong>링크만</strong> 제공합니다. 항목을 누르면 새 탭에서 열립니다.
        </p>
        <p className="muted wc-tournament-modal__tsdb-meta" style={{ marginTop: "0.35rem" }}>
          {detail.year === 2022 ? (
            <>
              2022: <code>youtube.com/@fifa</code> 기준 하이라이트 URL · 이력 JSON <code>video_links</code>
            </>
          ) : (
            <>
              {tsdb.query_label_ko ?? `${tsdb.query_date} 시즌`} · 리그 ID {tsdb.league_id} · 출처 {tsdb.source}
              {t.video_links?.length ? " · 이력 JSON video_links 병합" : null}
            </>
          )}
        </p>
        {tsdb.error ? (
          <div className="callout wc-tournament-modal__warn" role="status">
            TheSportsDB: {tsdb.error}
          </div>
        ) : null}
        <p className="muted" style={{ fontSize: "0.78rem", lineHeight: 1.5, marginTop: "0.5rem" }}>
          링크가 없는 연도는 <code>backend/app/data/korea_world_cup_history.json</code>의 <code>video_links</code>에 항목을 추가하거나,{" "}
          <a
            href={`https://www.youtube.com/results?search_query=FIFA+World+Cup+${detail.year}+Korea+Republic`}
            target="_blank"
            rel="noreferrer"
          >
            YouTube에서 &quot;FIFA World Cup {detail.year} Korea Republic&quot; 검색
          </a>
          을 이용해 보세요.
        </p>

        {linkRows.length > 0 ? (
          <ol className="wc-tournament-modal__url-list">
            {linkRows.map((row, i) => (
              <li key={`${row.url}-${i}`}>
                <div className="wc-tournament-modal__url-list-label">{row.label}</div>
                <a className="wc-tournament-modal__url-list-href" href={row.url} target="_blank" rel="noopener noreferrer">
                  {row.url}
                </a>
              </li>
            ))}
          </ol>
        ) : (
          <p className="muted wc-tournament-modal__url-list-empty">
            등록된 영상 URL이 없습니다. (TheSportsDB에 링크가 없거나, 아직 JSON에 <code>video_links</code>가 비어 있을 수 있습니다.)
          </p>
        )}
      </section>
    </div>
  );
}
