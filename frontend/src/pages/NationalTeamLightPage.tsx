import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiUrl, humanizeFetchError } from "../api/client";
import {
  postAiFunStep6TeamFanLines,
  type AiFunStep6FanLines,
  type AiFunTeamFanKey,
} from "../api/worldcup2026";
import FormationPitch from "../components/FormationPitch";

export type IntroSection = { title: string; paragraphs: string[] };

export interface NtStartingPlayer {
  slot: string;
  player_id: number;
  player_name?: string;
  number?: number | null;
  position?: string;
  age?: number;
  photo?: string;
  club_stats_latest?: {
    club_name?: string;
    appearances?: number | string | null;
    goals_total?: number | null;
  };
}

export interface NtLightPayload {
  last_updated: string;
  team?: string;
  team_id: number | null;
  error?: string;
  /** UEFA 플레이오프 D 등 — 미확정/확정 */
  opponent_status?: "tbd" | "confirmed";
  playoff_slot?: string;
  team_display_ko?: string;
  formation_display?: string;
  starting_xi_note_ko?: string;
  squad_size?: number;
  starting_xi?: NtStartingPlayer[];
  injuries?: { player_id?: number; player_name?: string; type?: string; reason?: string }[];
}

export type NationalTeamLightPageProps = {
  apiPath: string;
  loadingLabel: string;
  faultTitle: string;
  notFoundError: string;
  heading: string;
  /** API 응답으로 제목을 바꿀 때 (예: 상대 확정 후 팀명) */
  resolveHeading?: (data: NtLightPayload) => string;
  lead: ReactNode;
  namuUrl: string;
  namuArticleTitle: string;
  introSections: IntroSection[];
  /** 팀 미발견 시 추가 안내 */
  teamNotFoundHint?: ReactNode;
  /** 팬 시점 한 줄 (멕시코/남아공/플레이오프 D) */
  aiFanLinesTeamKey?: AiFunTeamFanKey;
};

function TeamFanLinesPanel({ team }: { team: AiFunTeamFanKey }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [out, setOut] = useState<AiFunStep6FanLines | null>(null);

  const run = () => {
    setLoading(true);
    setErr(null);
    setOut(null);
    void postAiFunStep6TeamFanLines(team)
      .then(setOut)
      .catch((e) => setErr(humanizeFetchError(e)))
      .finally(() => setLoading(false));
  };

  return (
    <section className="panel ai-seven-panel">
      <h2 className="panel-title">팬 시점 한 줄</h2>
      <p className="muted" style={{ marginTop: 0, fontSize: "0.88rem" }}>
        멕시코팬·남아공팬·A조 1차전 상대 팬 vs 한국 팬 톤으로 짧은 한 줄씩. 놀이용입니다.
      </p>
      <button type="button" className="btn btn-primary" disabled={loading} onClick={run}>
        {loading ? "생성 중…" : "한 줄씩 생성"}
      </button>
      {err ? <p className="text-error">{err}</p> : null}
      {out ? (
        <div className="ai-seven-result" style={{ marginTop: "0.65rem" }}>
          <p>
            <strong>상대 팬:</strong> {out.opponent_fan_line_ko}
          </p>
          <p>
            <strong>한국 팬:</strong> {out.korea_fan_line_ko}
          </p>
          <p className="muted ai-seven-disclaimer">{out.disclaimer_ko}</p>
        </div>
      ) : null}
    </section>
  );
}

function renderParagraph(para: string) {
  return para.split(/(\*\*[^*]+\*\*)/g).map((chunk, j) => {
    const m = chunk.match(/^\*\*([^*]+)\*\*$/);
    return m ? (
      <strong key={j}>{m[1]}</strong>
    ) : (
      <span key={j}>{chunk}</span>
    );
  });
}

export default function NationalTeamLightPage({
  apiPath,
  loadingLabel,
  faultTitle,
  notFoundError,
  heading,
  resolveHeading,
  lead,
  namuUrl,
  namuArticleTitle,
  introSections,
  teamNotFoundHint,
  aiFanLinesTeamKey,
}: NationalTeamLightPageProps) {
  const [data, setData] = useState<NtLightPayload | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setErr(null);
    fetch(apiUrl(apiPath))
      .then(async (r) => {
        if (!r.ok) {
          const b = (await r.json().catch(() => ({}))) as { detail?: string };
          const detail = typeof b.detail === "string" ? b.detail : r.statusText;
          let msg = `[HTTP ${r.status}] ${detail}`;
          if (r.status === 404) {
            msg +=
              " — API 경로가 없습니다. 백엔드를 최신 코드로 저장한 뒤 backend 폴더에서 uvicorn을 다시 실행하세요. http://localhost:8000/docs 에 south-africa / mexico 가 보여야 합니다.";
          }
          throw new Error(msg);
        }
        return r.json() as Promise<NtLightPayload>;
      })
      .then(setData)
      .catch((e) => setErr(humanizeFetchError(e)))
      .finally(() => setLoading(false));
  }, [apiPath]);

  const pitchXi = useMemo(() => {
    const xi = data?.starting_xi ?? [];
    return xi.map((p) => ({
      slot: p.slot,
      player_id: p.player_id,
      player_name: p.player_name ?? String(p.player_id),
    }));
  }, [data?.starting_xi]);

  const photoById = useMemo(() => {
    const m = new Map<number, string | undefined>();
    for (const p of data?.starting_xi ?? []) {
      m.set(p.player_id, p.photo);
    }
    return m;
  }, [data?.starting_xi]);

  if (loading) return <div className="loading-screen">{loadingLabel}</div>;

  if (err)
    return (
      <main className="page">
        <h1 className="page-title">{faultTitle}</h1>
        <p className="text-error">{err}</p>
        <p className="muted">
          <code>backend/.env</code>의 <code>API_FOOTBALL_KEY</code>, 백엔드 주소(<code>VITE_API_BASE_URL</code>)·실행 여부를
          확인하세요. 404면 백엔드 재시작 후{" "}
          <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer">
            /docs
          </a>
          에 해당 경로가 있는지 봅니다.
        </p>
      </main>
    );

  if (!data || data.error === notFoundError)
    return (
      <main className="page">
        <h1 className="page-title">{faultTitle}</h1>
        <p className="text-error">API-Football에서 해당 대표팀을 찾지 못했습니다.</p>
        {teamNotFoundHint ? <div className="muted" style={{ marginTop: "0.75rem" }}>{teamNotFoundHint}</div> : null}
      </main>
    );

  const xi = data.starting_xi ?? [];
  const pageTitle = resolveHeading?.(data) ?? heading;

  return (
    <main className="page wiki-guide">
      <h1 className="page-title">{pageTitle}</h1>
      <p className="page-lead">{lead}</p>

      <aside className="wiki-source-banner" role="note">
        <strong>참고</strong> — 상단 설명은{" "}
        <a href={namuUrl} target="_blank" rel="noreferrer">
          나무위키 「{namuArticleTitle}」
        </a>
        를 바탕으로 요약했습니다. 세부 전적·인명·랭킹은 위키 및 공식 발표를 확인하세요.
      </aside>

      {introSections.map((sec) => (
        <section key={sec.title} className="panel" style={{ marginBottom: "1rem" }}>
          <h2 className="panel-title">{sec.title}</h2>
          {sec.paragraphs.map((para, i) => (
            <p key={i} className="muted" style={{ fontSize: "0.92rem", lineHeight: 1.65, margin: i ? "0.65rem 0 0" : 0 }}>
              {renderParagraph(para)}
            </p>
          ))}
        </section>
      ))}

      {aiFanLinesTeamKey ? <TeamFanLinesPanel team={aiFanLinesTeamKey} /> : null}

      <div className="panel">
        <h2 className="panel-title">API 요약</h2>
        <div className="player-summary-grid">
          {data.opponent_status ? (
            <div className="stat-chip">
              상대 상태
              <strong>{data.opponent_status === "tbd" ? "미확정" : "확정"}</strong>
            </div>
          ) : null}
          <div className="stat-chip">
            팀 ID
            <strong>{data.team_id ?? "—"}</strong>
          </div>
          <div className="stat-chip">
            스쿼드 등록
            <strong>{data.squad_size ?? "—"}명</strong>
          </div>
          <div className="stat-chip">
            예시 선발
            <strong>{xi.length}명</strong>
          </div>
          <div className="stat-chip">
            갱신
            <strong style={{ fontSize: "0.8rem", fontWeight: 600 }}>
              {data.last_updated ? new Date(data.last_updated).toLocaleString() : "—"}
            </strong>
          </div>
        </div>
        {data.starting_xi_note_ko ? (
          <p className="muted" style={{ margin: "0.75rem 0 0", fontSize: "0.86rem" }}>
            {data.starting_xi_note_ko}
          </p>
        ) : null}
      </div>

      {xi.length > 0 ? (
        <div className="panel best-xi-result" style={{ marginTop: "1rem" }}>
          <h2 className="panel-title">베스트 11 (4-3-3 예시)</h2>
          <FormationPitch formation="4-3-3" xi={pitchXi} photoById={photoById} />
          <div className="table-wrap" style={{ marginTop: "1.25rem" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>슬롯</th>
                  <th>선수</th>
                  <th>포지션</th>
                  <th>나이</th>
                  <th>클럽(통계)</th>
                </tr>
              </thead>
              <tbody>
                {xi.map((p) => (
                  <tr key={p.slot}>
                    <td>
                      <strong>{p.slot}</strong>
                    </td>
                    <td>{p.player_name}</td>
                    <td>{p.position ?? "—"}</td>
                    <td>{p.age ?? "—"}</td>
                    <td className="muted" style={{ fontSize: "0.85rem" }}>
                      {p.club_stats_latest?.club_name ?? "—"}
                      {p.club_stats_latest?.appearances != null
                        ? ` · 출전 ${p.club_stats_latest.appearances}`
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-error">선발 11명을 구성할 수 없습니다.</p>
      )}

      {data.injuries && data.injuries.length > 0 ? (
        <div className="panel" style={{ marginTop: "1rem" }}>
          <h2 className="panel-title">부상·결장 (API)</h2>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>선수</th>
                  <th>유형</th>
                  <th>사유</th>
                </tr>
              </thead>
              <tbody>
                {data.injuries.map((inj, i) => (
                  <tr key={`${inj.player_id}-${i}`}>
                    <td>{inj.player_name ?? inj.player_id}</td>
                    <td>{inj.type ?? "—"}</td>
                    <td>{inj.reason ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <p style={{ marginTop: "1.5rem" }}>
        <Link to="/2026/korea">2026 한국 대시보드</Link>
        {" · "}
        <Link to="/2026/korea/players">한국 대표팀 데이터</Link>
        {" · "}
        <Link to="/2026/mexico">멕시코 대표</Link>
        {" · "}
        <Link to="/2026/south-africa">남아공 대표</Link>
        {" · "}
        <Link to="/2026/playoff-d">A조 1차전 상대(플레이오프 D)</Link>
      </p>
    </main>
  );
}
