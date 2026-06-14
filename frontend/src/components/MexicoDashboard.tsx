import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import OctopusOracle from "./OctopusOracle";

const MEXICO_KICKOFF_UTC = "2026-06-19T01:00:00.000Z";

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

const RIVALRY_HISTORY = [
  {
    year: 1998,
    tournament: "프랑스 월드컵",
    group: "E조",
    score: "1 - 3",
    result: "패",
    highlight: "블랑코·에르난데스의 멕시코 압승. 첫 징크스 시작.",
  },
  {
    year: 2014,
    tournament: "브라질 월드컵",
    group: "A조",
    score: "2 - 4",
    result: "패",
    highlight: "한국 최다 실점 패배. 지오·에르난데스 등 대거 실점.",
  },
  {
    year: 2026,
    tournament: "북중미 월드컵",
    group: "A조",
    score: "?",
    result: "예정",
    highlight: "개최국 홈 분위기 속 한국이 28년 징크스를 깰 기회!",
    isCurrent: true,
  },
];

const TALKING_POINTS = [
  {
    icon: "🔥",
    title: "개최국 원정 압박",
    desc: "멕시코는 사실상 홈 팬 6만여 명 앞에서 경기. 한국은 체코전 승리 기세로 맞선다.",
  },
  {
    icon: "⚡",
    title: "황희찬·손흥민 듀오",
    desc: "체코전 활약한 공격진이 멕시코 수비를 어떻게 흔드느냐가 핵심 변수.",
  },
  {
    icon: "🛡️",
    title: "멕시코 중원 vs 한국 압박",
    desc: "차베스·알바레스 등 강한 멕시코 미드필더 진을 한국의 고강도 압박으로 차단 가능한가.",
  },
  {
    icon: "🏟️",
    title: "고지대·기후 적응",
    desc: "과달라하라 일대는 해발 약 1,500m. 한국의 체력 관리와 교체 타이밍이 중요.",
  },
];

export default function MexicoDashboard() {
  const cd = useCountdown(MEXICO_KICKOFF_UTC);

  const krTime = useMemo(() => {
    const d = new Date(MEXICO_KICKOFF_UTC);
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

      {/* ─── 1차전 결과 배너 ─── */}
      <div
        style={{
          background: "linear-gradient(135deg, #064e3b 0%, #047857 100%)",
          color: "#fff",
          borderRadius: 14,
          padding: "1rem 1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: "1.75rem" }}>✅</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>1차전 승리! 🇰🇷 대한민국 2 - 1 🇨🇿 체코</div>
          <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>2026-06-12 · 에스타디오 아크론 · 사포판</div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontWeight: 900, fontSize: "1.4rem" }}>A조 1위</div>
          <div style={{ fontSize: "0.8rem", opacity: 0.85 }}>승점 3점</div>
        </div>
      </div>

      {/* ─── 2차전 카운트다운 히어로 ─── */}
      <div
        style={{
          background: "linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)",
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
            background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ fontSize: "0.85rem", fontWeight: 600, opacity: 0.85, marginBottom: "0.25rem", letterSpacing: "0.08em" }}>
          A조 2차전 · 개최국 원정
        </div>
        <div style={{ fontSize: "clamp(1.5rem, 5vw, 2.2rem)", fontWeight: 900, marginBottom: "0.5rem" }}>
          🇰🇷 대한민국 vs 🇲🇽 멕시코
        </div>
        <div style={{ fontSize: "0.9rem", opacity: 0.8, marginBottom: "1.25rem" }}>
          🕙 {krTime} (한국 시간)
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
                {i > 0 && <span style={{ fontSize: "1.5rem", fontWeight: 900, opacity: 0.6, marginRight: "0.5rem" }}>:</span>}
                <div
                  style={{
                    display: "inline-flex",
                    flexDirection: "column",
                    alignItems: "center",
                    background: "rgba(0,0,0,0.25)",
                    borderRadius: 10,
                    padding: "0.5rem 0.75rem",
                    minWidth: "3.5rem",
                  }}
                >
                  <span style={{ fontSize: "clamp(1.6rem, 5vw, 2.4rem)", fontWeight: 900, lineHeight: 1 }}>
                    {String(val).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: "0.7rem", opacity: 0.75, marginTop: "0.15rem" }}>{label}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: "1.4rem", fontWeight: 800 }}>⚽ 경기 시작!</div>
        )}

        <div style={{ marginTop: "1.25rem", display: "flex", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link to="/2026/mexico" className="btn" style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.35)", fontWeight: 700 }}>
            멕시코 팀 분석
          </Link>
          <Link to="/2026/korea" className="btn" style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.35)", fontWeight: 700 }}>
            A조 대시보드
          </Link>
        </div>
      </div>

      {/* ─── 역대 라이벌리 ─── */}
      <div className="panel">
        <h3 className="panel-title" style={{ marginBottom: "0.75rem" }}>
          📜 한국 vs 멕시코 · 월드컵 역사
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          {RIVALRY_HISTORY.map((item) => (
            <div
              key={item.year}
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "flex-start",
                padding: "0.85rem 1rem",
                borderRadius: 10,
                background: item.isCurrent
                  ? "linear-gradient(135deg, #fef3c7, #fde68a)"
                  : "rgba(0,0,0,0.03)",
                border: item.isCurrent ? "1.5px solid #f59e0b" : "1px solid var(--color-border)",
              }}
            >
              <div
                style={{
                  minWidth: "3.2rem",
                  textAlign: "center",
                  fontWeight: 900,
                  fontSize: "1.15rem",
                  color: item.isCurrent ? "#92400e" : "var(--color-text)",
                }}
              >
                {item.year}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "0.92rem", marginBottom: "0.15rem" }}>
                  {item.tournament} · {item.group}
                  {" "}
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: "1.05rem",
                      color: item.result === "패" ? "var(--color-accent)" : item.result === "예정" ? "#b45309" : "var(--color-success)",
                      marginLeft: "0.4rem",
                    }}
                  >
                    {item.result === "예정" ? "🔥 D-DAY" : `${item.score} (${item.result})`}
                  </span>
                </div>
                <div style={{ fontSize: "0.83rem", color: "var(--color-muted)" }}>{item.highlight}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="muted" style={{ fontSize: "0.78rem", marginTop: "0.65rem" }}>
          * 역대 전적은 나무위키·FIFA 기록실에서 확인 권장. 스코어는 참고 기준입니다.
        </p>
      </div>

      {/* ─── 문어 예언 ─── */}
      <OctopusOracle />

      {/* ─── 관전 포인트 ─── */}
      <div className="panel">
        <h3 className="panel-title" style={{ marginBottom: "0.85rem" }}>🔍 멕시코전 관전 포인트</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.75rem" }}>
          {TALKING_POINTS.map((p) => (
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
