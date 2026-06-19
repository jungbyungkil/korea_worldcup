/** 3차전(6월 25일) 한국 vs 남아공 결과에 따른 경우의 수 */

type Scenario = {
  id: string;
  result: string;
  resultEmoji: string;
  verdict: string;
  verdictShort: string;
  accentColor: string;
  bgGradient: string;
  borderColor: string;
  verdictColor: string;
  finalRank: string;
  details: string[];
  note?: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: "win",
    result: "한국 승리",
    resultEmoji: "⚽",
    verdict: "16강 확정",
    verdictShort: "진출",
    accentColor: "#059669",
    bgGradient: "linear-gradient(135deg, #064e3b 0%, #047857 100%)",
    borderColor: "#34d399",
    verdictColor: "#34d399",
    finalRank: "A조 2위",
    details: [
      "승점 6점 → 체코·남아공 따라잡기 불가",
      "멕시코(6pts)와 동률이나 득실차로 순위 결정",
      "32강 상대: B조 2위 (소파이 스타디움·LA, 6/29 04:00 KST)",
    ],
    note: undefined,
  },
  {
    id: "draw",
    result: "한국 무승부",
    resultEmoji: "🤝",
    verdict: "16강 확정",
    verdictShort: "진출",
    accentColor: "#3b82f6",
    bgGradient: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
    borderColor: "#93c5fd",
    verdictColor: "#93c5fd",
    finalRank: "A조 2위",
    details: [
      "승점 4점 → 체코와 동률 가능성 있으나",
      "상대전적 우위: 1차전 한국 2-1 체코 승리",
      "FIFA 규정상 H2H 상대전적 먼저 적용 → 한국 2위 확정",
      "남아공 최대 2점 → 역전 불가",
    ],
    note: "체코가 멕시코를 이기더라도 한국이 체코를 앞선 것(H2H)으로 2위 유지",
  },
  {
    id: "loss",
    result: "한국 패배",
    resultEmoji: "💔",
    verdict: "탈락 (사실상)",
    verdictShort: "탈락",
    accentColor: "#dc2626",
    bgGradient: "linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)",
    borderColor: "#f87171",
    verdictColor: "#f87171",
    finalRank: "A조 3위",
    details: [
      "승점 3점 — 남아공이 4점으로 2위 등극",
      "3위권 와일드카드 8팀 중 포함 가능성 희박",
      "득실차 0 이하, 다른 조 3위팀과 비교해 불리",
    ],
    note: "기적을 위해선 남아공에 대패하지 않고 + 다른 조 3위가 전원 부진해야",
  },
];

const CONCURRENT_MATCH = {
  home: "🇨🇿 체코",
  away: "🇲🇽 멕시코",
  venue: "에스타디오 아스테카 · 멕시코시티",
  kst: "6월 25일 10:00 KST",
};

export default function KnockoutScenario() {
  return (
    <div className="panel">
      <h3 className="panel-title" style={{ marginBottom: "0.25rem" }}>
        🎯 3차전 경우의 수 · 한국의 운명
      </h3>
      <p className="muted" style={{ fontSize: "0.85rem", marginTop: 0, marginBottom: "0.5rem" }}>
        6월 25일 10:00 KST · 한국 🇰🇷 vs 남아공 🇿🇦 · 에스타디오 BBVA, 과달루페
      </p>

      {/* 현재 순위 요약 */}
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 10,
          padding: "0.7rem 1rem",
          marginBottom: "1.1rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem 1.5rem",
          fontSize: "0.82rem",
        }}
      >
        <span><strong style={{ color: "#facc15" }}>📊 2차전 후 현황</strong></span>
        <span>🇲🇽 멕시코 <strong style={{ color: "#34d399" }}>6점</strong> (1위 확정)</span>
        <span>🇰🇷 한국 <strong style={{ color: "#60a5fa" }}>3점</strong></span>
        <span>🇨🇿 체코 <strong>1점</strong></span>
        <span>🇿🇦 남아공 <strong>1점</strong></span>
      </div>

      {/* 3개 시나리오 카드 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        {SCENARIOS.map((sc) => (
          <div
            key={sc.id}
            style={{
              borderRadius: 14,
              overflow: "hidden",
              border: `2px solid ${sc.borderColor}`,
            }}
          >
            {/* 헤더 */}
            <div
              style={{
                background: sc.bgGradient,
                color: "#fff",
                padding: "0.75rem 1.1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>{sc.resultEmoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, fontSize: "1.05rem" }}>{sc.result}</div>
                <div style={{ fontSize: "0.78rem", opacity: 0.85 }}>최종 {sc.finalRank} 예상</div>
              </div>
              <div
                style={{
                  background: "rgba(0,0,0,0.25)",
                  borderRadius: 20,
                  padding: "0.3rem 0.85rem",
                  fontWeight: 900,
                  fontSize: "0.95rem",
                  color: sc.verdictColor,
                  border: `1px solid ${sc.borderColor}`,
                  whiteSpace: "nowrap",
                }}
              >
                {sc.verdict}
              </div>
            </div>

            {/* 본문 */}
            <div style={{ padding: "0.85rem 1.1rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {sc.details.map((d, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: "0.83rem",
                    color: "var(--color-text)",
                    lineHeight: 1.5,
                    display: "flex",
                    gap: "0.4rem",
                  }}
                >
                  <span style={{ color: sc.accentColor, fontWeight: 700, flexShrink: 0 }}>·</span>
                  <span>{d}</span>
                </div>
              ))}
              {sc.note && (
                <div
                  style={{
                    marginTop: "0.35rem",
                    background: `${sc.accentColor}18`,
                    border: `1px solid ${sc.accentColor}44`,
                    borderRadius: 8,
                    padding: "0.45rem 0.7rem",
                    fontSize: "0.78rem",
                    color: "var(--color-muted)",
                    lineHeight: 1.5,
                  }}
                >
                  💡 {sc.note}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 동시 진행 경기 안내 */}
      <div
        style={{
          marginTop: "1rem",
          background: "rgba(250,204,21,0.06)",
          border: "1px solid rgba(250,204,21,0.2)",
          borderRadius: 10,
          padding: "0.7rem 1rem",
          fontSize: "0.82rem",
        }}
      >
        <div style={{ fontWeight: 700, color: "#facc15", marginBottom: "0.3rem" }}>⚡ 동시 진행 · {CONCURRENT_MATCH.kst}</div>
        <div style={{ color: "var(--color-text)" }}>
          {CONCURRENT_MATCH.home} vs {CONCURRENT_MATCH.away} · <span className="muted">{CONCURRENT_MATCH.venue}</span>
        </div>
        <div style={{ color: "var(--color-muted)", marginTop: "0.25rem" }}>
          한국이 무승부 이상이면 체코-멕시코 결과 무관하게 16강 확정
        </div>
      </div>

      <p className="muted" style={{ fontSize: "0.76rem", marginTop: "0.6rem" }}>
        * H2H = 상대전적. FIFA 동점 처리: ① H2H 승점 → ② H2H 득실차 → ③ H2H 득점 → ④ 전체 득실차 순 적용.
      </p>
    </div>
  );
}
