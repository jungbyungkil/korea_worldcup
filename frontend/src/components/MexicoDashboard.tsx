import { Link } from "react-router-dom";
import KnockoutScenario from "./KnockoutScenario";
import OctopusOracle from "./OctopusOracle";

const MATCH_RESULTS = [
  {
    round: "1차전",
    flag1: "🇰🇷",
    score: "2 - 1",
    flag2: "🇨🇿",
    opponent: "체코",
    date: "6월 12일",
    result: "승",
    status: "win" as const,
    pts: "+3점",
  },
  {
    round: "2차전",
    flag1: "🇰🇷",
    score: "0 - 1",
    flag2: "🇲🇽",
    opponent: "멕시코",
    date: "6월 19일",
    result: "패",
    status: "loss" as const,
    pts: "0점",
  },
  {
    round: "3차전",
    flag1: "🇰🇷",
    score: "0 - 1",
    flag2: "🇿🇦",
    opponent: "남아공",
    date: "6월 25일",
    result: "패",
    status: "loss" as const,
    pts: "0점",
  },
];

const WILDCARD_ANALYSIS = [
  {
    icon: "✅",
    color: "#34d399",
    bg: "rgba(6,78,59,0.15)",
    border: "#34d399",
    title: "진출 가능 조건",
    desc: "다른 11개 조의 3위 팀 중 4점 이상인 팀이 4팀 이하 → 한국 32강 진출 유력",
  },
  {
    icon: "⚠️",
    color: "#facc15",
    bg: "rgba(113,63,18,0.2)",
    border: "#ca8a04",
    title: "GD 경쟁 구간",
    desc: "4점 이상 팀이 정확히 4팀이면 → GD(득실차), GF(득점) 비교로 결정",
  },
  {
    icon: "❌",
    color: "#f87171",
    bg: "rgba(127,29,29,0.15)",
    border: "#f87171",
    title: "탈락 조건",
    desc: "다른 조 3위 팀 중 4점 이상이 5팀 이상 → 한국은 3pts로 9위 이하, 탈락",
  },
  {
    icon: "🎟️",
    color: "#a5b4fc",
    bg: "rgba(79,70,229,0.12)",
    border: "#818cf8",
    title: "한국의 현재 스탯",
    desc: "3점 · 득실차 -1 · 득점 2골 — 다른 조 3위들의 결과가 나와야 최종 확정",
  },
];

export default function MexicoDashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* ─── 조별리그 최종 결과 히어로 ─── */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1e3a5f 100%)",
          color: "#fff",
          borderRadius: 14,
          padding: "1.5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "-30% -10% auto auto",
            width: "min(300px, 50vw)",
            height: "min(300px, 50vw)",
            background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
          aria-hidden
        />

        <div style={{ display: "inline-block", background: "rgba(255,255,255,0.12)", borderRadius: 20, padding: "0.2rem 0.85rem", fontSize: "0.78rem", fontWeight: 700, marginBottom: "0.6rem" }}>
          📋 A조 조별리그 완료 · 2026-06-25
        </div>

        <div style={{ fontSize: "clamp(1.1rem, 4vw, 1.6rem)", fontWeight: 900, marginBottom: "0.5rem" }}>
          🇰🇷 대한민국 조별리그 1승 2패 종료
        </div>
        <div style={{ fontSize: "0.85rem", opacity: 0.85, marginBottom: "1rem" }}>
          A조 3위 마감 · 승점 3점 · 득실차 -1 · <strong style={{ color: "#facc15" }}>32강 와일드카드 진출 여부 대기 중</strong>
        </div>

        {/* 3경기 결과 인라인 */}
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "1.1rem" }}>
          {MATCH_RESULTS.map((m) => (
            <div
              key={m.round}
              style={{
                background: m.status === "win" ? "rgba(16,185,129,0.25)" : "rgba(220,38,38,0.2)",
                border: `1.5px solid ${m.status === "win" ? "#34d399" : "#f87171"}`,
                borderRadius: 10,
                padding: "0.5rem 0.85rem",
                textAlign: "center",
                minWidth: "5rem",
                flex: "1 1 5rem",
              }}
            >
              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.15rem" }}>{m.round} · {m.date}</div>
              <div style={{ fontWeight: 900, fontSize: "1rem", letterSpacing: "0.04em" }}>
                {m.flag1} {m.score} {m.flag2}
              </div>
              <div style={{ fontSize: "0.78rem", fontWeight: 800, color: m.status === "win" ? "#6ee7b7" : "#fca5a5", marginTop: "0.1rem" }}>
                {m.result} · {m.opponent}
              </div>
            </div>
          ))}
        </div>

        {/* A조 최종 순위 */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem 1.1rem", fontSize: "0.82rem", marginBottom: "1rem" }}>
          <span style={{ color: "rgba(255,255,255,0.5)" }}>A조 최종:</span>
          <span>🥇 🇲🇽 멕시코 <strong style={{ color: "#fbbf24" }}>9점</strong></span>
          <span>🥈 🇿🇦 남아공 <strong style={{ color: "#e2e8f0" }}>4점</strong></span>
          <span>🥉 🇰🇷 한국 <strong style={{ color: "#93c5fd" }}>3점</strong></span>
          <span>4위 🇨🇿 체코 <strong style={{ color: "rgba(255,255,255,0.4)" }}>1점</strong></span>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-start", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link to="/2026/korea" className="btn" style={{ background: "rgba(255,255,255,0.18)", color: "#fff", border: "1px solid rgba(255,255,255,0.35)", fontWeight: 700 }}>
            A조 상세 대시보드
          </Link>
          <Link to="/2026/south-africa" className="btn" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontWeight: 600 }}>
            남아공 팀 데이터
          </Link>
        </div>
      </div>

      {/* ─── 32강 와일드카드 분석 ─── */}
      <div className="panel">
        <h3 className="panel-title" style={{ marginBottom: "0.25rem" }}>🎟️ 32강 와일드카드 — 한국의 진출 조건</h3>
        <p className="muted" style={{ fontSize: "0.83rem", marginTop: 0, marginBottom: "0.85rem" }}>
          2026 월드컵은 12개 조의 <strong style={{ color: "var(--color-text)" }}>3위 중 상위 8팀</strong>도 32강 진출. 한국은 현재 <strong style={{ color: "#facc15" }}>3점 GD-1</strong>로 대기 중.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "0.65rem" }}>
          {WILDCARD_ANALYSIS.map((w) => (
            <div
              key={w.title}
              style={{
                background: w.bg,
                border: `1px solid ${w.border}44`,
                borderRadius: 10,
                padding: "0.75rem 0.9rem",
              }}
            >
              <div style={{ fontWeight: 800, color: w.color, marginBottom: "0.3rem", fontSize: "0.88rem" }}>
                {w.icon} {w.title}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--color-text)", lineHeight: 1.55 }}>{w.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 문어의 예언 (32강 와일드카드) ─── */}
      <OctopusOracle />

      {/* ─── 12개 조 3위 현황 + 경우의 수 ─── */}
      <KnockoutScenario />

    </div>
  );
}
