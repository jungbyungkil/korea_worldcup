import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import KnockoutScenario from "./KnockoutScenario";
import OctopusOracle from "./OctopusOracle";

const SOUTH_AFRICA_KICKOFF_UTC = "2026-06-25T01:00:00.000Z";

function useCountdown(targetIso: string) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = new Date(targetIso).getTime() - now.getTime();
  if (diff <= 0) return null;
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    mins: Math.floor((s % 3600) / 60),
    secs: s % 60,
  };
}

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
];

const SA_TALKING_POINTS = [
  {
    icon: "🏆",
    title: "16강 결정전",
    desc: "무승부 이상이면 16강 확정! 승점 4점으로 H2H 우위 확보. 지금 이 경기가 전부다.",
  },
  {
    icon: "🇿🇦",
    title: "바파나 바파나도 벼랑 끝",
    desc: "남아공도 승점 1점. 반드시 이겨야 하는 두 팀의 사실상 '생사결전'. 집중력이 승패를 가른다.",
  },
  {
    icon: "⚡",
    title: "손흥민·황희찬 반드시 살아야",
    desc: "멕시코전 아쉬움을 딛고 한국의 투 에이스가 남아공 수비를 무너뜨려야 한다. 기회는 지금뿐.",
  },
  {
    icon: "🛡️",
    title: "퍼시 타우 봉쇄 관건",
    desc: "남아공의 핵심 퍼시 타우의 개인기와 빠른 역습을 수비라인이 얼마나 잘 막느냐가 핵심.",
  },
];

export default function MexicoDashboard() {
  const cd = useCountdown(SOUTH_AFRICA_KICKOFF_UTC);

  const krTime = useMemo(() => {
    const d = new Date(SOUTH_AFRICA_KICKOFF_UTC);
    return d.toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
      month: "long",
      day: "numeric",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* ─── 경기 결과 요약 (1·2차전) ─── */}
      <div className="panel">
        <h3 className="panel-title" style={{ marginBottom: "0.75rem" }}>
          📋 조별리그 경과 · A조 한국
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {MATCH_RESULTS.map((m) => (
            <div
              key={m.round}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.8rem 1rem",
                borderRadius: 10,
                background:
                  m.status === "win"
                    ? "linear-gradient(135deg, rgba(6,78,59,0.25), rgba(4,120,87,0.15))"
                    : "linear-gradient(135deg, rgba(127,29,29,0.25), rgba(185,28,28,0.15))",
                border: `1.5px solid ${m.status === "win" ? "#34d399" : "#f87171"}`,
              }}
            >
              <span
                style={{
                  minWidth: "3.8rem",
                  fontWeight: 800,
                  fontSize: "0.82rem",
                  color: m.status === "win" ? "#34d399" : "#f87171",
                }}
              >
                {m.round}
              </span>
              <span style={{ fontSize: "1.1rem" }}>{m.flag1}</span>
              <span style={{ fontWeight: 900, fontSize: "1rem", letterSpacing: "0.05em", minWidth: "5rem", textAlign: "center" }}>
                {m.score}
              </span>
              <span style={{ fontSize: "1.1rem" }}>{m.flag2}</span>
              <span style={{ fontSize: "0.85rem", flex: 1 }}>{m.opponent}</span>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: "0.9rem",
                    color: m.status === "win" ? "#34d399" : "#f87171",
                    background: m.status === "win" ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.12)",
                    borderRadius: 20,
                    padding: "0.2rem 0.7rem",
                    border: `1px solid ${m.status === "win" ? "#34d399" : "#f87171"}`,
                  }}
                >
                  {m.result}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--color-muted)", marginTop: "0.15rem" }}>{m.date}</div>
              </div>
            </div>
          ))}

          {/* 현재 순위 요약 */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem 1.25rem",
              padding: "0.7rem 1rem",
              borderRadius: 10,
              background: "rgba(250,204,21,0.06)",
              border: "1px solid rgba(250,204,21,0.22)",
              fontSize: "0.82rem",
              marginTop: "0.1rem",
            }}
          >
            <span><strong style={{ color: "#facc15" }}>📊 현재 순위</strong></span>
            <span>🇲🇽 멕시코 <strong style={{ color: "#f87171" }}>6점</strong> (1위)</span>
            <span>🇰🇷 한국 <strong style={{ color: "#60a5fa" }}>3점</strong> (2위*)</span>
            <span>🇨🇿 체코 <strong>1점</strong></span>
            <span>🇿🇦 남아공 <strong>1점</strong></span>
          </div>
        </div>
      </div>

      {/* ─── 3차전 카운트다운 히어로 ─── */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)",
          color: "#fff",
          borderRadius: 14,
          padding: "1.75rem 1.5rem",
          textAlign: "center",
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
            background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "inline-block",
            background: "rgba(255,255,255,0.15)",
            borderRadius: 20,
            padding: "0.25rem 0.9rem",
            fontSize: "0.8rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            marginBottom: "0.5rem",
          }}
        >
          🔥 A조 3차전 · 16강 결정전
        </div>

        <div style={{ fontSize: "clamp(1.5rem, 5vw, 2.2rem)", fontWeight: 900, marginBottom: "0.4rem" }}>
          🇰🇷 대한민국 vs 🇿🇦 남아공
        </div>
        <div style={{ fontSize: "0.9rem", opacity: 0.85, marginBottom: "0.35rem" }}>
          🕙 {krTime} (한국 시간) · 에스타디오 BBVA, 과달루페
        </div>
        <div style={{ fontSize: "0.82rem", opacity: 0.75, marginBottom: "1.25rem" }}>
          무승부 이상이면 <strong style={{ color: "#a5b4fc" }}>16강 확정</strong> · 반드시 잡아야 할 경기!
        </div>

        {cd ? (
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            {[
              { val: cd.days, label: "일" },
              { val: cd.hours, label: "시" },
              { val: cd.mins, label: "분" },
              { val: cd.secs, label: "초" },
            ].map(({ val, label }, i) => (
              <div key={label}>
                {i > 0 && <span style={{ fontSize: "1.5rem", fontWeight: 900, opacity: 0.5, marginRight: "0.5rem" }}>:</span>}
                <div
                  style={{
                    display: "inline-flex",
                    flexDirection: "column",
                    alignItems: "center",
                    background: "rgba(0,0,0,0.3)",
                    borderRadius: 10,
                    padding: "0.5rem 0.75rem",
                    minWidth: "3.5rem",
                  }}
                >
                  <span style={{ fontSize: "clamp(1.6rem, 5vw, 2.4rem)", fontWeight: 900, lineHeight: 1 }}>
                    {String(val).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: "0.7rem", opacity: 0.7, marginTop: "0.15rem" }}>{label}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: "1.4rem", fontWeight: 800 }}>⚽ 경기 시작!</div>
        )}

        <div style={{ marginTop: "1.25rem", display: "flex", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link to="/2026/south-africa" className="btn" style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.35)", fontWeight: 700 }}>
            남아공 팀 분석
          </Link>
          <Link to="/2026/korea" className="btn" style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.35)", fontWeight: 700 }}>
            A조 대시보드
          </Link>
        </div>
      </div>

      {/* ─── 문어 예언 ─── */}
      <OctopusOracle />

      {/* ─── 3차전 경우의 수 ─── */}
      <KnockoutScenario />

      {/* ─── 3차전 관전 포인트 ─── */}
      <div className="panel">
        <h3 className="panel-title" style={{ marginBottom: "0.85rem" }}>🔍 남아공전 관전 포인트</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.75rem" }}>
          {SA_TALKING_POINTS.map((p) => (
            <div
              key={p.title}
              style={{
                background: "rgba(0,0,0,0.03)",
                border: "1px solid var(--color-border)",
                borderRadius: 10,
                padding: "0.9rem",
              }}
            >
              <div style={{ fontSize: "1.5rem", marginBottom: "0.35rem" }}>{p.icon}</div>
              <div style={{ fontWeight: 700, fontSize: "0.92rem", marginBottom: "0.25rem" }}>{p.title}</div>
              <div style={{ fontSize: "0.82rem", color: "var(--color-muted)", lineHeight: 1.5 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
