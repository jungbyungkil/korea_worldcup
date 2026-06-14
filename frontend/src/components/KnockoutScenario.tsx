const GROUP_B_TEAMS = [
  { flag: "🇨🇦", name: "캐나다", nameEn: "Canada", note: "개최국" },
  { flag: "🇨🇭", name: "스위스", nameEn: "Switzerland", note: "UEFA" },
  { flag: "🇧🇦", name: "보스니아", nameEn: "Bosnia-Herz.", note: "UEFA" },
  { flag: "🇶🇦", name: "카타르", nameEn: "Qatar", note: "AFC" },
];

const SCENARIOS = [
  {
    rank: "1위",
    rankNum: 1,
    accentColor: "#059669",
    bgGradient: "linear-gradient(135deg, #064e3b 0%, #047857 100%)",
    borderColor: "#34d399",
    kstDate: "7월 1일 (수)",
    kstTime: "10:00",
    matchNo: 79,
    opponentLabel: "C·E·F·H·I조 최상위 3위팀",
    opponentNote: "그룹스테이지 종료 후 확정",
    venue: "에스타디오 아스테카",
    venueEn: "Estadio Azteca",
    city: "멕시코시티",
    capacity: "87,523석",
    venueNote: "세계 최대 월드컵 경기장",
    pros: ["유리한 대진 (이론상 약체 가능성)", "멕시코 원정 연장선에서 연속 경기"],
    cons: ["멕시코시티 고지대(2,240m) 계속 적응 필요", "상대 미확정으로 준비 어려움"],
    possibleOpponents: null,
  },
  {
    rank: "2위",
    rankNum: 2,
    accentColor: "#3b82f6",
    bgGradient: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
    borderColor: "#93c5fd",
    kstDate: "6월 29일 (월)",
    kstTime: "04:00",
    matchNo: 73,
    opponentLabel: "B조 2위",
    opponentNote: "캐나다·스위스·보스니아·카타르 중 1팀",
    venue: "소파이 스타디움",
    venueEn: "SoFi Stadium",
    city: "잉글우드 (LA)",
    capacity: "70,240석",
    venueNote: "NFL 슈퍼볼 홈 경기장",
    pros: ["LA 중립 지역 — 한국 교민 응원단 다수 기대", "B조 현재 4팀 전원 무승부 — 대진 열려 있음"],
    cons: ["1위보다 4일 빠른 6월 29일 출발", "새벽 4시 KST 킥오프"],
    possibleOpponents: GROUP_B_TEAMS,
  },
];

export default function KnockoutScenario() {
  return (
    <div className="panel">
      <h3 className="panel-title" style={{ marginBottom: "0.25rem" }}>
        🏆 32강 진출 시나리오
      </h3>
      <p className="muted" style={{ fontSize: "0.85rem", marginTop: 0, marginBottom: "1.25rem" }}>
        A조 최종 순위에 따라 경기 날짜·경기장·상대가 달라집니다
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
        {SCENARIOS.map((sc) => (
          <div
            key={sc.rank}
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
                padding: "0.85rem 1.1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.65rem",
              }}
            >
              <span style={{ fontSize: "1.6rem" }}>{sc.rankNum === 1 ? "🥇" : "🥈"}</span>
              <div>
                <div style={{ fontWeight: 900, fontSize: "1.05rem" }}>A조 {sc.rank} 진출 시</div>
                <div style={{ fontSize: "0.78rem", opacity: 0.85 }}>32강 매치 #{sc.matchNo}</div>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>KST {sc.kstDate}</div>
                <div style={{ fontSize: "0.8rem", opacity: 0.85 }}>{sc.kstTime} 킥오프</div>
              </div>
            </div>

            {/* 본문 */}
            <div style={{ padding: "1rem 1.1rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>

              {/* 경기장 */}
              <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.3rem", marginTop: "0.05rem" }}>🏟️</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{sc.venue}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>{sc.city} · {sc.capacity}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--color-muted)" }}>{sc.venueNote}</div>
                </div>
              </div>

              {/* 상대 */}
              <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.3rem", marginTop: "0.05rem" }}>⚔️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.3rem" }}>
                    🇰🇷 한국 vs {sc.opponentLabel}
                  </div>
                  {sc.possibleOpponents ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                      {sc.possibleOpponents.map((op) => (
                        <span
                          key={op.nameEn}
                          style={{
                            background: "rgba(59,130,246,0.1)",
                            border: "1px solid rgba(59,130,246,0.3)",
                            borderRadius: 20,
                            padding: "0.2rem 0.55rem",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                          }}
                        >
                          {op.flag} {op.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span
                      style={{
                        background: "rgba(5,150,105,0.1)",
                        border: "1px solid rgba(5,150,105,0.3)",
                        borderRadius: 20,
                        padding: "0.2rem 0.65rem",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: sc.accentColor,
                      }}
                    >
                      🔍 조별리그 종료 후 확정
                    </span>
                  )}
                  <div style={{ fontSize: "0.76rem", color: "var(--color-muted)", marginTop: "0.3rem" }}>
                    {sc.opponentNote}
                  </div>
                </div>
              </div>

              {/* 장단점 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                <div
                  style={{
                    background: "rgba(5,150,105,0.07)",
                    border: "1px solid rgba(5,150,105,0.2)",
                    borderRadius: 8,
                    padding: "0.55rem 0.65rem",
                  }}
                >
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#059669", marginBottom: "0.3rem" }}>✅ 유리한 점</div>
                  {sc.pros.map((p, i) => (
                    <div key={i} style={{ fontSize: "0.76rem", color: "var(--color-text)", lineHeight: 1.45, marginBottom: i < sc.pros.length - 1 ? "0.2rem" : 0 }}>
                      · {p}
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    background: "rgba(239,68,68,0.05)",
                    border: "1px solid rgba(239,68,68,0.15)",
                    borderRadius: 8,
                    padding: "0.55rem 0.65rem",
                  }}
                >
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#dc2626", marginBottom: "0.3rem" }}>⚠️ 고려 사항</div>
                  {sc.cons.map((c, i) => (
                    <div key={i} style={{ fontSize: "0.76rem", color: "var(--color-text)", lineHeight: 1.45, marginBottom: i < sc.cons.length - 1 ? "0.2rem" : 0 }}>
                      · {c}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="muted" style={{ fontSize: "0.76rem", marginTop: "0.75rem" }}>
        * FIFA 공식 32강 대진표 기준. B조 최종 2위는 6월 24일 확정. 3위 상대는 조별리그 전체 종료 후 결정.
      </p>
    </div>
  );
}
