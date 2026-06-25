/** A조 최종 결과 + 32강 와일드카드 진출 현황 */

const WILDCARD_GROUPS = [
  { group: "A조", team: "🇰🇷 대한민국", pts: 3, gd: -1, gf: 2, status: "확정", highlight: true },
  { group: "B조", team: "진행 중", pts: null, gd: null, gf: null, status: "대기" },
  { group: "C조", team: "진행 중", pts: null, gd: null, gf: null, status: "대기" },
  { group: "D조", team: "진행 중", pts: null, gd: null, gf: null, status: "대기" },
  { group: "E조", team: "진행 중", pts: null, gd: null, gf: null, status: "대기" },
  { group: "F조", team: "진행 중", pts: null, gd: null, gf: null, status: "대기" },
  { group: "G조", team: "진행 중", pts: null, gd: null, gf: null, status: "대기" },
  { group: "H조", team: "진행 중", pts: null, gd: null, gf: null, status: "대기" },
  { group: "I조", team: "진행 중", pts: null, gd: null, gf: null, status: "대기" },
  { group: "J조", team: "진행 중", pts: null, gd: null, gf: null, status: "대기" },
  { group: "K조", team: "진행 중", pts: null, gd: null, gf: null, status: "대기" },
  { group: "L조", team: "진행 중", pts: null, gd: null, gf: null, status: "대기" },
];

const HISTORY_REFERENCE = [
  { year: 2022, format: "32팀 8조", threshold: "4점 (4위까지 진출)", pass3rd: "4점 이상 필요" },
  { year: 2026, format: "48팀 12조", threshold: "상위 8/12팀 진출 (66.7%)", pass3rd: "3점도 가능 (GD 중요)" },
];

export default function KnockoutScenario() {
  const koreaChance = 55; // 3pts, GD-1 기준 추정 확률 (%)

  return (
    <div className="panel">
      {/* 조별리그 최종 결과 배너 */}
      <div
        style={{
          background: "linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)",
          border: "2px solid #f87171",
          borderRadius: 14,
          padding: "1rem 1.25rem",
          marginBottom: "1.25rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: "2rem" }}>💔</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, fontSize: "1.1rem", color: "#fca5a5" }}>
            조별리그 탈락 · A조 3위 마감
          </div>
          <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.8)", marginTop: "0.25rem" }}>
            1승 2패 · 승점 3점 · 득실차 -1 · 득점 2 · 실점 3
          </div>
        </div>
        <div
          style={{
            background: "rgba(0,0,0,0.3)",
            borderRadius: 10,
            padding: "0.5rem 1rem",
            textAlign: "center",
            border: "1px solid #f87171",
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "#fca5a5" }}>최종 스코어</div>
          <div style={{ fontWeight: 900, fontSize: "1.3rem", color: "#fff" }}>
            🇰🇷 0 – 1 🇿🇦
          </div>
          <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)" }}>vs 남아공 (6월 25일)</div>
        </div>
      </div>

      <h3 className="panel-title" style={{ marginBottom: "0.25rem" }}>
        🎟️ 32강 와일드카드 진출 가능성
      </h3>
      <p className="muted" style={{ fontSize: "0.85rem", marginTop: 0, marginBottom: "1rem" }}>
        2026 월드컵은 12개 조 3위 중 <strong style={{ color: "var(--color-text)" }}>상위 8팀</strong>도 32강 진출 · 한국은 현재 3위 후보 중 <strong style={{ color: "#facc15" }}>A조 3위 확정</strong>
      </p>

      {/* 확률 시각화 */}
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 12,
          padding: "1rem 1.25rem",
          marginBottom: "1.1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.6rem",
          }}
        >
          <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>🇰🇷 한국 32강 진출 추정 확률</span>
          <span
            style={{
              fontWeight: 900,
              fontSize: "1.4rem",
              color: koreaChance >= 60 ? "#34d399" : koreaChance >= 40 ? "#facc15" : "#f87171",
            }}
          >
            {koreaChance}%
          </span>
        </div>
        {/* 프로그레스 바 */}
        <div
          style={{
            width: "100%",
            height: 18,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 9,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${koreaChance}%`,
              height: "100%",
              background: "linear-gradient(90deg, #d97706 0%, #f59e0b 100%)",
              borderRadius: 9,
              transition: "width 0.6s ease",
            }}
          />
          {/* 50% 기준선 */}
          <div
            style={{
              position: "absolute",
              left: "66.7%",
              top: 0,
              bottom: 0,
              width: 2,
              background: "rgba(255,255,255,0.4)",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.72rem",
            color: "var(--color-muted)",
            marginTop: "0.3rem",
          }}
        >
          <span>0%</span>
          <span style={{ marginLeft: "55%" }}>← 66.7% (수학적 기대)</span>
          <span>100%</span>
        </div>
        <p className="muted" style={{ fontSize: "0.78rem", margin: "0.6rem 0 0" }}>
          ※ 3pts·GD -1 기준 역대 월드컵 유사 사례 비교 추정치 (실시간 변동). 다른 조 3위 결과에 따라 크게 달라짐.
        </p>
      </div>

      {/* 조건 설명 카드들 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.7rem", marginBottom: "1.1rem" }}>
        <div
          style={{
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.3)",
            borderRadius: 10,
            padding: "0.75rem",
          }}
        >
          <div style={{ fontWeight: 800, color: "#34d399", marginBottom: "0.3rem", fontSize: "0.88rem" }}>
            ✅ 유리한 조건
          </div>
          <ul style={{ margin: 0, paddingLeft: "1rem", fontSize: "0.8rem", color: "var(--color-text)", lineHeight: 1.6 }}>
            <li>8/12팀 진출 → 기본 66.7%</li>
            <li>3pts는 역대 진출 충분 사례 다수</li>
            <li>A매치 실력팀(ELO 1820)</li>
          </ul>
        </div>
        <div
          style={{
            background: "rgba(220,38,38,0.08)",
            border: "1px solid rgba(220,38,38,0.3)",
            borderRadius: 10,
            padding: "0.75rem",
          }}
        >
          <div style={{ fontWeight: 800, color: "#f87171", marginBottom: "0.3rem", fontSize: "0.88rem" }}>
            ⚠️ 불리한 조건
          </div>
          <ul style={{ margin: 0, paddingLeft: "1rem", fontSize: "0.8rem", color: "var(--color-text)", lineHeight: 1.6 }}>
            <li>GD -1 · 득점 2골</li>
            <li>3pts로 탈락한 사례 존재</li>
            <li>4점 이상 3위팀에 밀릴 수 있음</li>
          </ul>
        </div>
      </div>

      {/* 12조 3위팀 현황 */}
      <h4 style={{ fontSize: "0.9rem", fontWeight: 700, margin: "0 0 0.5rem" }}>
        📊 12개 조 3위팀 현황 (8팀 진출, 4팀 탈락)
      </h4>
      <div className="table-wrap" style={{ marginBottom: "1rem" }}>
        <table className="data-table" style={{ fontSize: "0.8rem" }}>
          <thead>
            <tr>
              <th>조</th>
              <th>3위 팀</th>
              <th>승점</th>
              <th>득실차</th>
              <th>득점</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {WILDCARD_GROUPS.map((g) => (
              <tr
                key={g.group}
                style={g.highlight ? { background: "rgba(59,130,246,0.12)", fontWeight: 700 } : undefined}
              >
                <td style={{ fontWeight: 700 }}>{g.group}</td>
                <td>{g.team}</td>
                <td>{g.pts ?? "—"}</td>
                <td>{g.gd != null ? (g.gd > 0 ? `+${g.gd}` : g.gd) : "—"}</td>
                <td>{g.gf ?? "—"}</td>
                <td>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: g.status === "확정" ? "#60a5fa" : "var(--color-muted)",
                      background: g.status === "확정" ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.05)",
                      borderRadius: 6,
                      padding: "0.15rem 0.5rem",
                    }}
                  >
                    {g.status === "확정" ? "📌 확정" : "⏳ 대기"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 포맷 비교 */}
      <div
        style={{
          background: "rgba(250,204,21,0.06)",
          border: "1px solid rgba(250,204,21,0.2)",
          borderRadius: 10,
          padding: "0.75rem 1rem",
          fontSize: "0.8rem",
        }}
      >
        <div style={{ fontWeight: 700, color: "#facc15", marginBottom: "0.4rem" }}>
          💡 2026 포맷 vs 2022 비교
        </div>
        {HISTORY_REFERENCE.map((h) => (
          <div
            key={h.year}
            style={{
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
              marginBottom: "0.25rem",
              color: "var(--color-text)",
            }}
          >
            <strong style={{ color: "#facc15", minWidth: "3rem" }}>{h.year}</strong>
            <span className="muted">{h.format}</span>
            <span>{h.pass3rd}</span>
          </div>
        ))}
      </div>

      <p className="muted" style={{ fontSize: "0.76rem", marginTop: "0.6rem" }}>
        * 3위팀 순위 결정: ① 승점 → ② 득실차 → ③ 득점 → ④ 페어플레이 점수 → ⑤ 추첨 (FIFA 규정 기준).
      </p>
    </div>
  );
}
