import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getKoreaWorldCupHistory,
  getKoreaWorldCupTournamentDetail,
  youtubeEmbedUrl,
  type KoreaWorldCupHistoryResponse,
  type KoreaWcTournamentDetailResponse,
} from "../api/history";
import { korea2022OfficialHighlightsAsTsdbShape } from "../data/korea2022WcOfficialYoutubeHighlights";
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

      <p className="muted wc-history-hint" style={{ marginBottom: "0.65rem", fontSize: "0.88rem" }}>
        💡 <strong>개최국</strong> 이름을 누르면 그 대회 요약과 TheSportsDB에서 가져온{" "}
        <strong>대한민국 경기 하이라이트(YouTube)</strong>를 볼 수 있어요.
      </p>

      <div className="table-wrap" style={{ marginBottom: "1.5rem" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>연도</th>
              <th>개최국</th>
              <th>성적</th>
              <th>경기</th>
              <th>승·무·패</th>
              <th>득실</th>
            </tr>
          </thead>
          <tbody>
            {[...tournaments].reverse().map((t) => (
              <tr key={t.year}>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="panel">
        <h2 className="panel-title">대회별 하이라이트</h2>
        <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: 1.65 }}>
          {[...tournaments].reverse().map((t) => (
            <li key={`h-${t.year}`} style={{ marginBottom: "0.45rem" }}>
              <button type="button" className="wc-history-inline-btn" onClick={() => setOpenYear(t.year)}>
                <strong>{t.year}</strong>
              </button>
              {" — "}
              {t.highlights}
            </li>
          ))}
        </ul>
      </section>

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
    <section className="wc-tournament-modal__ai ai-seven-panel" aria-label="AI 재미 2단계">
      <h3 className="wc-tournament-modal__h3">② AI · 대회 요약 / 가상 시나리오</h3>
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

function WcTournamentModalBody({ detail }: { detail: KoreaWcTournamentDetailResponse }) {
  const t = detail.tournament;
  const { tsdb } = detail;
  const useOfficial2022 = detail.year === 2022;
  const highlights = useOfficial2022 ? korea2022OfficialHighlightsAsTsdbShape() : tsdb.highlights;

  const embedIdx = highlights.findIndex((h) => youtubeEmbedUrl(h.video_url));
  let primary = highlights[0];
  let rest = highlights.slice(1);
  if (embedIdx >= 0) {
    primary = highlights[embedIdx];
    rest = highlights.filter((_, i) => i !== embedIdx);
  }
  const embedPrimary = primary ? youtubeEmbedUrl(primary.video_url) : null;

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

      <section className="wc-tournament-modal__video" aria-label="대한민국 경기 하이라이트 영상">
        <h3 className="wc-tournament-modal__h3">
          🎬 대한민국 경기 하이라이트
          {useOfficial2022 ? " · FIFA 공식 YouTube" : " (TheSportsDB)"}
        </h3>
        <p className="muted wc-tournament-modal__tsdb-meta">
          {useOfficial2022 ? (
            <>
              <code>youtube.com/@fifa</code> 공식 하이라이트 4경기 · 프로젝트에 내장
            </>
          ) : (
            <>
              {tsdb.query_label_ko ?? `${tsdb.query_date} 시즌`} · 리그 ID {tsdb.league_id} · 출처 {tsdb.source}
            </>
          )}
        </p>
        {!useOfficial2022 && tsdb.error ? (
          <div className="callout wc-tournament-modal__warn" role="status">
            {tsdb.error}
          </div>
        ) : null}
        <p className="muted" style={{ fontSize: "0.78rem", lineHeight: 1.5 }}>
          {useOfficial2022
            ? "저작권·지역 제한으로 재생이 안 될 수 있습니다. 링크는 FIFA 공식 채널 기준입니다."
            : tsdb.note_ko}
        </p>

        {!highlights.length && !tsdb.error && !useOfficial2022 ? (
          <p className="muted">이 날짜·리그 조합으로는 하이라이트가 없습니다. (초기 대회는 데이터가 비어 있는 경우가 많아요.)</p>
        ) : null}

        {embedPrimary ? (
          <div className="wc-tournament-modal__embed-wrap">
            <iframe
              title={primary?.event_name || "World Cup highlight"}
              src={embedPrimary}
              className="wc-tournament-modal__iframe"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
            {primary?.event_name ? (
              <p className="wc-tournament-modal__video-cap">
                {primary.event_name}
                {primary.date_event ? (
                  <span className="muted" style={{ fontWeight: 400, marginLeft: "0.35rem" }}>
                    ({primary.date_event})
                  </span>
                ) : null}
              </p>
            ) : null}
          </div>
        ) : null}

        {rest.length > 0 ? (
          <div className="wc-tournament-modal__more">
            <h4 className="wc-tournament-modal__h4">추가 클립</h4>
            <ul className="wc-tournament-modal__clip-list">
              {rest.map((h, i) => {
                const emb = youtubeEmbedUrl(h.video_url);
                return (
                  <li key={h.id_event || `${i}-${h.event_name}`} className="wc-tournament-modal__clip-item">
                    {h.thumb_url ? (
                      <a
                        href={h.video_url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="wc-tournament-modal__thumb-link"
                      >
                        <img src={h.thumb_url} alt="" className="wc-tournament-modal__thumb" loading="lazy" />
                      </a>
                    ) : null}
                    <div>
                      <a href={h.video_url || "#"} target="_blank" rel="noopener noreferrer" className="wc-tournament-modal__clip-title">
                        {h.event_name || "YouTube 열기"}
                      </a>
                      {emb ? (
                        <details className="wc-tournament-modal__details">
                          <summary>여기서 재생</summary>
                          <div className="wc-tournament-modal__embed-wrap wc-tournament-modal__embed-wrap--sm">
                            <iframe
                              title={h.event_name || `clip-${i}`}
                              src={emb}
                              className="wc-tournament-modal__iframe"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            />
                          </div>
                        </details>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </section>
    </div>
  );
}
