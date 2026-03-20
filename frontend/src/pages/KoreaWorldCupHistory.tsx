import { useEffect, useState } from "react";
import { getKoreaWorldCupHistory, type KoreaWorldCupHistoryResponse } from "../api/history";

export default function KoreaWorldCupHistory() {
  const [data, setData] = useState<KoreaWorldCupHistoryResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getKoreaWorldCupHistory()
      .then(setData)
      .catch((e) => setErr(e instanceof Error ? e.message : "오류"))
      .finally(() => setLoading(false));
  }, []);

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
                <td>{t.host}</td>
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
              <strong>{t.year}</strong> — {t.highlights}
            </li>
          ))}
        </ul>
      </section>

      {data.disclaimer ? <p className="muted" style={{ marginTop: "1.5rem", fontSize: "0.82rem" }}>{data.disclaimer}</p> : null}
    </main>
  );
}
