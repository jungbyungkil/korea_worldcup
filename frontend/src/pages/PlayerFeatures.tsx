import { useCallback, useEffect, useMemo, useState } from "react";
import { apiUrl } from "../api/client";
import FormationPitch from "../components/FormationPitch";
import { FORMATIONS } from "../formationLayouts";
import {
  groupSquadByPosition,
  positionLabel,
  type BestXiResponse,
  type EnrichedPlayer,
  type PlayerFeaturesResponse,
  type SquadPlayer,
} from "../playerFeaturesTypes";

function PlayerCard({ p }: { p: SquadPlayer }) {
  return (
    <div className="player-card">
      {p.photo ? (
        <img className="player-card__photo" src={p.photo} alt="" loading="lazy" decoding="async" />
      ) : (
        <div className="player-card__photo" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
          ⚽
        </div>
      )}
      <div className="player-card__name">{p.name}</div>
      <div className="player-card__meta">
        {p.number != null ? `#${p.number}` : "—"} · 나이 {p.age ?? "—"}
      </div>
    </div>
  );
}

function formatStat(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  return String(v);
}

function buildSquadPayloadForAi(data: PlayerFeaturesResponse): Record<string, unknown>[] {
  const enriched = new Map<number, EnrichedPlayer>();
  for (const p of data.players) {
    enriched.set(p.id, p);
  }
  return data.squad.map((s) => {
    const e = enriched.get(s.id);
    const c = e?.club_stats_latest;
    return {
      id: s.id,
      name: s.name,
      position: s.position,
      age: s.age,
      number: s.number,
      club: c?.club_name,
      appearances: c?.appearances,
      goals: c?.goals_total,
      minutes: c?.minutes,
      rating: c?.rating,
    };
  });
}

export default function PlayerFeatures() {
  const [data, setData] = useState<PlayerFeaturesResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showJson, setShowJson] = useState(false);
  const [formationPick, setFormationPick] = useState("4-3-3");
  const [bestXi, setBestXi] = useState<BestXiResponse | null>(null);
  const [bestXiLoading, setBestXiLoading] = useState(false);
  const [bestXiErr, setBestXiErr] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setErr(null);
    fetch(apiUrl("/api/v1/worldcup2026/korea/player-features"))
      .then(async (r) => {
        if (!r.ok) {
          const b = (await r.json().catch(() => ({}))) as { detail?: string };
          throw new Error(b.detail || r.statusText);
        }
        return r.json() as Promise<PlayerFeaturesResponse>;
      })
      .then(setData)
      .catch((e) => setErr(e instanceof Error ? e.message : "오류"))
      .finally(() => setLoading(false));
  }, []);

  const byPosition = useMemo(
    () => (data?.squad ? groupSquadByPosition(data.squad) : new Map<string, SquadPlayer[]>()),
    [data?.squad]
  );

  const enrichedById = useMemo(() => {
    const m = new Map<number, EnrichedPlayer>();
    for (const p of data?.players ?? []) {
      m.set(p.id, p);
    }
    return m;
  }, [data?.players]);

  const photoById = useMemo(() => {
    const m = new Map<number, string | undefined>();
    for (const p of data?.squad ?? []) {
      m.set(p.id, p.photo);
    }
    return m;
  }, [data?.squad]);

  const runBestXi = useCallback(async () => {
    if (!data) return;
    setBestXiLoading(true);
    setBestXiErr(null);
    const injured_player_ids = (data.injuries ?? [])
      .map((i) => i.player_id)
      .filter((id): id is number => typeof id === "number");
    try {
      const r = await fetch(apiUrl("/api/v1/worldcup2026/korea/best-xi"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formation: formationPick,
          squad: buildSquadPayloadForAi(data),
          injured_player_ids,
        }),
      });
      const b = (await r.json().catch(() => ({}))) as { detail?: string } & Partial<BestXiResponse>;
      if (!r.ok) {
        throw new Error(typeof b.detail === "string" ? b.detail : r.statusText);
      }
      if (!b.xi || !Array.isArray(b.xi)) {
        throw new Error("응답 형식이 올바르지 않습니다.");
      }
      setBestXi(b as BestXiResponse);
    } catch (e) {
      setBestXi(null);
      setBestXiErr(e instanceof Error ? e.message : "요청 실패");
    } finally {
      setBestXiLoading(false);
    }
  }, [data, formationPick]);

  if (loading) return <div className="loading-screen">불러오는 중…</div>;
  if (err)
    return (
      <main className="page">
        <h1 className="page-title">국대 선수 데이터</h1>
        <p className="text-error">{err}</p>
        <p className="muted">
          <code>backend/.env</code>에 <code>API_FOOTBALL_KEY</code>와 백엔드 실행을 확인하세요.
        </p>
      </main>
    );

  if (!data || data.error === "korea_team_not_found")
    return (
      <main className="page">
        <h1 className="page-title">국대 선수 데이터</h1>
        <p className="text-error">국가대표 팀을 찾지 못했습니다.</p>
      </main>
    );

  const cfg = data.config;

  return (
    <main className="page">
      <h1 className="page-title">국대 선수 · 스쿼드 &amp; 클럽 스탯</h1>
      <p className="page-lead">
        API-Football 기준 스쿼드 목록과, 설정된 인원까지 클럽 리그 통계 요약입니다.{" "}
        <span className="muted">
          <code>GET /api/v1/worldcup2026/korea/player-features</code>
        </span>
      </p>

      <div className="panel">
        <h2 className="panel-title">요약</h2>
        <div className="player-summary-grid">
          <div className="stat-chip">
            팀 ID
            <strong>{data.team_id ?? "—"}</strong>
          </div>
          <div className="stat-chip">
            스쿼드 등록
            <strong>{data.squad_size ?? data.squad.length}명</strong>
          </div>
          <div className="stat-chip">
            통계 보강 인원
            <strong>{data.players_enriched ?? data.players.length}명</strong>
          </div>
          <div className="stat-chip">
            부상 API 시즌
            <strong>{data.season_used_for_injuries ?? "—"}</strong>
          </div>
          <div className="stat-chip">
            갱신 시각
            <strong style={{ fontSize: "0.8rem", fontWeight: 600 }}>
              {data.last_updated ? new Date(data.last_updated).toLocaleString() : "—"}
            </strong>
          </div>
        </div>
        {cfg ? (
          <p className="muted" style={{ margin: 0, fontSize: "0.82rem" }}>
            설정: limit {cfg.player_limit ?? "—"} · 클럽스탯 {cfg.include_club_stats ? "ON" : "OFF"} · 라인업{" "}
            {cfg.include_lineups ? "ON" : "OFF"}
            {cfg.lineup_fixtures ? ` (${cfg.lineup_fixtures}경기)` : ""}
          </p>
        ) : null}
      </div>

      <div className="panel best-xi-panel">
        <h2 className="panel-title">AI 베스트 11</h2>
        <p className="muted" style={{ marginTop: 0, fontSize: "0.88rem", lineHeight: 1.55 }}>
          전술(포메이션)만 고르면 OpenAI가 현재 스쿼드·클럽 스탯·부상 제외를 반영해 선발 11명을 제안합니다.{" "}
          <code>OPENAI_API_KEY</code>가 백엔드에 설정되어 있어야 합니다.
        </p>
        <div className="formation-picker">
          {FORMATIONS.map((f) => (
            <label key={f.id} className={`formation-option${formationPick === f.id ? " formation-option--on" : ""}`}>
              <input
                type="radio"
                name="formation"
                value={f.id}
                checked={formationPick === f.id}
                onChange={() => {
                  setFormationPick(f.id);
                  setBestXi(null);
                  setBestXiErr(null);
                }}
              />
              <span className="formation-option__main">
                <strong>{f.label}</strong>
                <span className="formation-option__desc">{f.desc}</span>
              </span>
            </label>
          ))}
        </div>
        <div className="best-xi-actions">
          <button type="button" className="btn btn-primary" disabled={bestXiLoading} onClick={() => void runBestXi()}>
            {bestXiLoading ? "AI 선발 구성 중…" : "AI로 베스트 11 뽑기"}
          </button>
        </div>
        {bestXiErr ? <p className="text-error" style={{ marginTop: "0.75rem" }}>{bestXiErr}</p> : null}
        {bestXi ? (
          <div className="best-xi-result">
            <p className="best-xi-notes">
              <strong>{bestXi.formation}</strong>
              {bestXi.notes_ko ? ` — ${bestXi.notes_ko}` : null}
            </p>
            <FormationPitch formation={bestXi.formation} xi={bestXi.xi} photoById={photoById} />
            {bestXi.rationale_ko ? (
              <div className="best-xi-rationale">
                <h3 className="best-xi-rationale__title">선택 이유</h3>
                <p>{bestXi.rationale_ko}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {data.injuries.length > 0 ? (
        <div className="panel">
          <h2 className="panel-title">부상 · 결장 ({data.injuries.length})</h2>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>선수</th>
                  <th>유형</th>
                  <th>사유</th>
                  <th>리그</th>
                </tr>
              </thead>
              <tbody>
                {data.injuries.map((inj, i) => (
                  <tr key={`${inj.player_id}-${i}`}>
                    <td>{inj.player_name ?? inj.player_id}</td>
                    <td>{inj.type ?? "—"}</td>
                    <td>{inj.reason ?? "—"}</td>
                    <td>{inj.league ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="callout" style={{ marginBottom: "1rem" }}>
          현재 시즌·팀 기준으로 표시할 부상 레코드가 없습니다. (API 커버리지에 따라 비어 있을 수 있습니다.)
        </div>
      )}

      {data.players.some((p) => p.club_stats_latest) ? (
        <div className="panel">
          <h2 className="panel-title">클럽 시즌 통계 (보강된 선수)</h2>
          <div className="enriched-table-wrap table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>선수</th>
                  <th>포지션</th>
                  <th>클럽</th>
                  <th>리그</th>
                  <th>출전</th>
                  <th>분</th>
                  <th>골</th>
                </tr>
              </thead>
              <tbody>
                {data.players.map((p) => {
                  const c = p.club_stats_latest;
                  if (!c) return null;
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td>{p.position ?? "—"}</td>
                      <td>{c.club_name ?? "—"}</td>
                      <td>
                        {c.league_name ?? "—"}
                        {c.league_season != null ? ` (${c.league_season})` : ""}
                      </td>
                      <td>{formatStat(c.appearances)}</td>
                      <td>{formatStat(c.minutes)}</td>
                      <td>{formatStat(c.goals_total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div className="panel" style={{ marginBottom: "1rem" }}>
        <h2 className="panel-title">전체 스쿼드 (포지션별)</h2>
        <p className="muted" style={{ marginTop: 0, fontSize: "0.86rem" }}>
          카드 순서는 골키퍼 → 수비 → 미드필더 → 공격입니다.
        </p>
        {Array.from(byPosition.entries()).map(([pos, list]) => (
          <section key={pos} className="position-section">
            <h3 className="position-heading">
              {positionLabel(pos)} <span className="muted">({list.length})</span>
            </h3>
            <div className="player-grid">
              {list.map((p) => (
                <div key={p.id}>
                  <PlayerCard p={p} />
                  {enrichedById.get(p.id)?.club_stats_latest ? (
                    <div className="club-stats-row">
                      {enrichedById.get(p.id)!.club_stats_latest!.club_name ?? ""}{" "}
                      {enrichedById.get(p.id)!.club_stats_latest!.appearances != null
                        ? `· 출전 ${enrichedById.get(p.id)!.club_stats_latest!.appearances}`
                        : ""}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="toggle-json">
        <button type="button" className="btn btn-secondary" onClick={() => setShowJson((v) => !v)}>
          {showJson ? "JSON 접기" : "원본 JSON 보기"}
        </button>
        {showJson ? <pre className="code-block" style={{ marginTop: "0.75rem" }}>{JSON.stringify(data, null, 2)}</pre> : null}
      </div>
    </main>
  );
}
