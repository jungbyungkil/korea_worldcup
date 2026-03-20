import { useEffect, useMemo, useState } from "react";
import {
  getKoreaFixtures,
  getKoreaOverview,
  postAiOpinion,
  postWinProbability,
  type AiOpinion,
  type KoreaFixtures,
  type KoreaOverview,
  type WinProbabilityResponse,
} from "../api/worldcup2026";
import {
  AI_BRIEFING_2026,
  bucketByCompetition,
  compareScenarioVsOfficialDates,
} from "./worldcup2026Scenario";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel">
      <h2 className="panel-title">{title}</h2>
      {children}
    </section>
  );
}

function FixtureList({ items }: { items: NonNullable<KoreaFixtures["fixtures"]> }) {
  function parseScore(score?: string): { gf?: number; ga?: number } {
    if (!score) return {};
    const m = score.match(/(\d+)\s*-\s*(\d+)/);
    if (!m) return {};
    return { gf: Number(m[1]), ga: Number(m[2]) };
  }
  function resultFromScore(score?: string): { label: "승" | "무" | "패" | "예정"; cls: string } {
    const { gf, ga } = parseScore(score);
    if (gf === undefined || ga === undefined) return { label: "예정", cls: "badge badge-sched" };
    if (gf > ga) return { label: "승", cls: "badge badge-win" };
    if (gf < ga) return { label: "패", cls: "badge badge-loss" };
    return { label: "무", cls: "badge badge-draw" };
  }
  function matchNarrative(opponent?: string, score?: string): string {
    const opp = opponent ?? "상대팀";
    const r = resultFromScore(score);
    if (r.label === "예정") return `${opp}전이 예정되어 있습니다.`;
    return `대한민국이 ${opp}를 상대로 ${score} ${r.label}를 기록했습니다.`;
  }
  if (!items.length) return <p className="muted" style={{ margin: 0 }}>데이터 없음</p>;
  return (
    <ul className="fixture-list">
      {items.map((f, idx) => {
        const dt = f.date ? new Date(f.date).toLocaleString() : "";
        const meta = [f.league, f.stage, f.status].filter(Boolean).join(" · ");
        const place = [f.venue, f.city].filter(Boolean).join(", ");
        const result = resultFromScore(f.score);
        return (
          <li key={`${f.id ?? idx}`}>
            <div className="fixture-row">
              <span className={result.cls}>{result.label}</span>
              <span>
                {f.opponent ?? "상대 미정"} {f.score ? `(${f.score})` : ""}
              </span>
            </div>
            <div className="fixture-meta">
              {dt ? `${dt} · ` : ""}
              {meta || "대회 정보 미상"}
              {place ? ` · ${place}` : ""}
            </div>
            <div className="fixture-narrative">{matchNarrative(f.opponent, f.score)}</div>
          </li>
        );
      })}
    </ul>
  );
}

export default function WorldCup2026Korea() {
  const [overview, setOverview] = useState<KoreaOverview | null>(null);
  const [fixtures, setFixtures] = useState<KoreaFixtures | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [ai, setAi] = useState<AiOpinion | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [opponent, setOpponent] = useState("Japan");
  const [predLoading, setPredLoading] = useState(false);
  const [predError, setPredError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<WinProbabilityResponse | null>(null);
  const [factorsText, setFactorsText] = useState(
    "황희찬 부상/컨디션 관리 여부\n조규성 활용(선발/조커) 전략\n손흥민 중심 공격 전개와 중원 압박 밸런스"
  );

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([getKoreaOverview(), getKoreaFixtures()])
      .then(([o, f]) => {
        setOverview(o);
        setFixtures(f);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "오류 발생"))
      .finally(() => setLoading(false));
  }, []);

  const externalFactors = useMemo(
    () =>
      factorsText
        .split("\n")
        .map((v) => v.trim())
        .filter(Boolean),
    [factorsText]
  );

  const payloadData = useMemo(
    () => ({
      overview,
      fixtures,
      external_factors: externalFactors,
      ai_briefing_scenario: AI_BRIEFING_2026,
    }),
    [overview, fixtures, externalFactors]
  );

  const buckets = useMemo(() => bucketByCompetition(fixtures?.fixtures ?? []), [fixtures]);
  const latestFive = useMemo(() => {
    const items = [...(fixtures?.fixtures ?? [])];
    items.sort((a, b) => (new Date(b.date ?? 0).getTime() || 0) - (new Date(a.date ?? 0).getTime() || 0));
    return items.slice(0, 5);
  }, [fixtures]);

  const yearCounts = useMemo(() => {
    let y2025 = 0;
    let y2026 = 0;
    for (const f of fixtures?.fixtures ?? []) {
      if (!f.date) continue;
      const y = new Date(f.date).getFullYear();
      if (y === 2025) y2025 += 1;
      if (y === 2026) y2026 += 1;
    }
    return { y2025, y2026 };
  }, [fixtures]);

  const scenarioMismatch = useMemo(() => {
    const officialOpp = new Set((fixtures?.fixtures ?? []).map((f) => (f.opponent ?? "").toLowerCase()));
    const missing: string[] = [];
    for (const opp of AI_BRIEFING_2026.opponents) {
      const norm = opp.toLowerCase();
      if (norm.includes("미확정") || norm.includes("플레이오프")) continue;
      const hit = Array.from(officialOpp).some((o) => o.includes(norm) || norm.includes(o));
      if (!hit) missing.push(opp);
    }
    return { missingOpponentsInOfficial: missing, officialCount: fixtures?.fixtures?.length ?? 0 };
  }, [fixtures]);

  const scenarioDateCompare = useMemo(
    () => compareScenarioVsOfficialDates(AI_BRIEFING_2026.schedule, buckets.worldCup),
    [buckets.worldCup]
  );

  async function onGenerateOpinion() {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await postAiOpinion({ data: payloadData, question: question.trim() || undefined });
      setAi(res);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "AI 의견 오류");
    } finally {
      setAiLoading(false);
    }
  }

  async function onPredictWinProb() {
    setPredLoading(true);
    setPredError(null);
    try {
      const res = await postWinProbability({ opponent: opponent.trim() });
      setPrediction(res);
    } catch (e) {
      setPredError(e instanceof Error ? e.message : "예측 오류");
    } finally {
      setPredLoading(false);
    }
  }

  if (loading) return <div className="loading-screen">불러오는 중…</div>;
  if (error)
    return (
      <main className="page">
        <h1 className="page-title">2026 북중미 월드컵 · 대한민국</h1>
        <p className="text-error">{error}</p>
        <div className="alert-box">
          <p style={{ marginTop: 0, fontWeight: 700 }}>설정 체크</p>
          <ol style={{ margin: 0, paddingLeft: "1.1rem" }} className="muted">
            <li>
              <code>backend/.env</code>에 <strong>API_FOOTBALL_KEY</strong>
            </li>
            <li>백엔드 재시작</li>
          </ol>
        </div>
      </main>
    );

  return (
    <main className="page">
      <h1 className="page-title">2026 북중미 월드컵 · 대한민국</h1>
      <p className="page-lead">
        최신 업데이트: {overview?.last_updated ? new Date(overview.last_updated).toLocaleString() : "-"}
      </p>

      <div className="grid-2">
        <Card title="현황">
          <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
            <li>조편성: {overview?.status.groups_confirmed ? "확정" : "미확정"}</li>
            <li>일정: {overview?.status.fixtures_confirmed ? "확정" : "미확정"}</li>
            {overview?.status.note ? <li className="muted">{overview.status.note}</li> : null}
          </ul>
        </Card>

        <Card title="AI 의견 (OpenAI)">
          <p className="muted" style={{ marginTop: 0 }}>
            OPENAI_API_KEY 필요
          </p>
          <textarea
            className="textarea"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
          />
          <button type="button" className="btn btn-primary" onClick={onGenerateOpinion} disabled={aiLoading} style={{ marginTop: "0.75rem" }}>
            {aiLoading ? "생성 중…" : "AI 의견 생성"}
          </button>
          {aiError ? <p className="text-error">{aiError}</p> : null}
          {ai ? (
            <div style={{ marginTop: "0.75rem" }}>
              <p>{ai.ai.summary}</p>
              <ul>
                {ai.ai.key_points?.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </Card>
      </div>

      <section style={{ marginTop: "1rem" }}>
        <Card title="승률 예측 (Elo)">
          <input className="input" value={opponent} onChange={(e) => setOpponent(e.target.value)} placeholder="예: Japan" />
          <button type="button" className="btn btn-primary" onClick={onPredictWinProb} disabled={predLoading} style={{ marginTop: "0.5rem" }}>
            승률 계산
          </button>
          {predError ? <p className="text-error">{predError}</p> : null}
          {prediction ? (
            <p>
              승률: {(prediction.probability.win * 100).toFixed(1)}% (Elo diff {prediction.features.elo_diff})
            </p>
          ) : null}
        </Card>
      </section>

      <section style={{ marginTop: "1rem" }}>
        <Card title="AI 시나리오 브리핑">
          <ul>
            {AI_BRIEFING_2026.opponents.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </Card>
      </section>

      <section style={{ marginTop: "1rem" }}>
        <Card title="공식 vs 시나리오">
          <p>경기 수: {scenarioMismatch.officialCount}</p>
          {scenarioDateCompare.mismatches.map((r) => (
            <p key={r.round} className="text-error">
              {r.round}: {r.scenarioDate} vs {r.officialDate}
            </p>
          ))}
          {scenarioMismatch.missingOpponentsInOfficial.map((o) => (
            <p key={o}>미매칭: {o}</p>
          ))}
        </Card>
      </section>

      <section style={{ marginTop: "1rem" }}>
        <Card title="팀 이슈">
          <textarea className="textarea" value={factorsText} onChange={(e) => setFactorsText(e.target.value)} rows={4} />
        </Card>
      </section>

      <section style={{ marginTop: "1rem" }}>
        <Card title="일정">
          <p className="muted" style={{ marginTop: 0 }}>
            소스: <strong>{fixtures?.league_source}</strong>
            {fixtures?.afc_qualifier_league_ids?.length ? ` · AFC ID: ${fixtures.afc_qualifier_league_ids.join(",")}` : ""}
          </p>
          <p className="muted">
            2025: <strong>{yearCounts.y2025}</strong>건 · 2026: <strong>{yearCounts.y2026}</strong>건
          </p>
          <h3 className="subheading">최신 5경기</h3>
          <FixtureList items={latestFive} />
          <h3 className="subheading">AFC ({buckets.qualifiers.length})</h3>
          <FixtureList items={buckets.qualifiers} />
          <h3 className="subheading">친선 ({buckets.friendlies.length})</h3>
          <FixtureList items={buckets.friendlies} />
          <h3 className="subheading">본선 ({buckets.worldCup.length})</h3>
          <FixtureList items={buckets.worldCup} />
        </Card>
      </section>
    </main>
  );
}
