/** 32강 와일드카드 — 12개 조 3위 현황 + 한국 경우의 수 (2026-06-25 기준) */

type GroupStatus = "done" | "ongoing";
type Threat = "above" | "competing" | "danger" | "safe";

type ThirdPlaceTeam = {
  group: string;
  flag: string;
  team: string;
  pts: number;
  w: number;
  d: number;
  l: number;
  gamesLeft: number;
  status: GroupStatus;
  highlight?: boolean;
  threat: Threat;
  winOutcome: string;
  drawOutcome: string;
  lossOutcome: string;
};

const THIRD_PLACE_TEAMS: ThirdPlaceTeam[] = [
  {
    group: "A", flag: "🇰🇷", team: "대한민국",
    pts: 3, w: 1, d: 0, l: 2, gamesLeft: 0, status: "done", highlight: true, threat: "competing",
    winOutcome: "—", drawOutcome: "—", lossOutcome: "—",
  },
  {
    group: "B", flag: "🇧🇦", team: "보스니아",
    pts: 4, w: 1, d: 1, l: 1, gamesLeft: 0, status: "done", threat: "above",
    winOutcome: "—", drawOutcome: "—", lossOutcome: "—",
  },
  {
    group: "C", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", team: "스코틀랜드",
    pts: 3, w: 1, d: 0, l: 2, gamesLeft: 0, status: "done", threat: "competing",
    winOutcome: "—", drawOutcome: "—", lossOutcome: "—",
  },
  {
    group: "D", flag: "🇵🇾", team: "파라과이",
    pts: 3, w: 1, d: 0, l: 1, gamesLeft: 1, status: "ongoing", threat: "danger",
    winOutcome: "6pts → 한국 추월", drawOutcome: "4pts → 한국 추월", lossOutcome: "3pts → GD경쟁",
  },
  {
    group: "E", flag: "🇪🇨", team: "에콰도르",
    pts: 1, w: 0, d: 1, l: 1, gamesLeft: 1, status: "ongoing", threat: "safe",
    winOutcome: "4pts → 한국 추월", drawOutcome: "2pts → 한국 안전", lossOutcome: "1pts → 한국 안전",
  },
  {
    group: "F", flag: "🇸🇪", team: "스웨덴",
    pts: 3, w: 1, d: 0, l: 1, gamesLeft: 1, status: "ongoing", threat: "danger",
    winOutcome: "6pts → 한국 추월", drawOutcome: "4pts → 한국 추월", lossOutcome: "3pts → GD경쟁",
  },
  {
    group: "G", flag: "🇧🇪", team: "벨기에",
    pts: 2, w: 0, d: 2, l: 0, gamesLeft: 1, status: "ongoing", threat: "danger",
    winOutcome: "5pts → 한국 추월", drawOutcome: "3pts → GD경쟁", lossOutcome: "2pts → 한국 안전",
  },
  {
    group: "H", flag: "🇨🇻", team: "카보베르데",
    pts: 2, w: 0, d: 2, l: 0, gamesLeft: 1, status: "ongoing", threat: "danger",
    winOutcome: "5pts → 한국 추월", drawOutcome: "3pts → GD경쟁", lossOutcome: "2pts → 한국 안전",
  },
  {
    group: "I", flag: "🇸🇳", team: "세네갈",
    pts: 0, w: 0, d: 0, l: 2, gamesLeft: 1, status: "ongoing", threat: "safe",
    winOutcome: "3pts → GD경쟁", drawOutcome: "1pts → 한국 안전", lossOutcome: "0pts → 한국 안전",
  },
  {
    group: "J", flag: "🇩🇿", team: "알제리",
    pts: 3, w: 1, d: 0, l: 1, gamesLeft: 1, status: "ongoing", threat: "danger",
    winOutcome: "6pts → 한국 추월", drawOutcome: "4pts → 한국 추월", lossOutcome: "3pts → GD경쟁",
  },
  {
    group: "K", flag: "🇨🇩", team: "콩고DR",
    pts: 1, w: 0, d: 1, l: 1, gamesLeft: 1, status: "ongoing", threat: "safe",
    winOutcome: "4pts → 한국 추월", drawOutcome: "2pts → 한국 안전", lossOutcome: "1pts → 한국 안전",
  },
  {
    group: "L", flag: "🇭🇷", team: "크로아티아",
    pts: 3, w: 1, d: 0, l: 1, gamesLeft: 1, status: "ongoing", threat: "danger",
    winOutcome: "6pts → 한국 추월", drawOutcome: "4pts → 한국 추월", lossOutcome: "3pts → GD경쟁",
  },
];

const SCENARIOS = [
  {
    id: "best",
    emoji: "🌟",
    title: "낙관 시나리오",
    condition: "3pts 경쟁팀들이 최종전에서 대부분 패배",
    verdict: "32강 진출 유력",
    verdictColor: "#34d399",
    bg: "linear-gradient(135deg, #064e3b, #065f46)",
    border: "#34d399",
    details: [
      "파라과이·스웨덴·알제리·크로아티아 중 3팀 이상 패배 → 3pts 유지",
      "벨기에·카보베르데도 무승부 이하 → 한국보다 낮거나 같은 승점",
      "한국 3pts 기준 상위 5~6팀 → 6~7위 정도로 32강 진출 가능",
      "스코틀랜드와 GD 비교가 중요 — 한국 GD -1 기준 스코틀랜드보다 좋으면 유리",
    ],
  },
  {
    id: "mid",
    emoji: "⚖️",
    title: "중간 시나리오",
    condition: "3pts 팀 일부는 이기고 일부는 지는 혼조세",
    verdict: "GD 경쟁 · 불확실",
    verdictColor: "#facc15",
    bg: "linear-gradient(135deg, #451a03, #78350f)",
    border: "#fbbf24",
    details: [
      "4pts 이상 팀이 5~7팀 나올 경우 한국은 3pts 순위 경쟁",
      "FIFA 3위팀 순위 기준: 승점 → 득실차(GD) → 득점(GF) → 페어플레이",
      "한국 GD -1 · 득점 2골 — 3pts 동률 팀 대비 GD 불리",
      "스코틀랜드(GD 미확인)와의 비교가 핵심 변수",
    ],
  },
  {
    id: "worst",
    emoji: "💔",
    title: "비관 시나리오",
    condition: "3pts 팀 대부분 무승부 이상 달성",
    verdict: "탈락 가능성 높음",
    verdictColor: "#f87171",
    bg: "linear-gradient(135deg, #7f1d1d, #991b1b)",
    border: "#f87171",
    details: [
      "파라과이·스웨덴·알제리·크로아티아 4팀 모두 무승부 이상 → 전원 4pts+",
      "벨기에·카보베르데도 1팀 이상 승리 → 5pts",
      "한국 위 팀이 6~9팀 → 9~12위 → 탈락",
      "이 경우 한국은 득실차 경쟁 자체가 의미 없어짐",
    ],
  },
];

function threatLabel(t: Threat) {
  if (t === "above") return { text: "이미 상위", color: "#f87171", bg: "rgba(220,38,38,0.15)" };
  if (t === "danger") return { text: "위험", color: "#facc15", bg: "rgba(234,179,8,0.12)" };
  if (t === "competing") return { text: "GD경쟁", color: "#a78bfa", bg: "rgba(139,92,246,0.12)" };
  return { text: "안전", color: "#34d399", bg: "rgba(16,185,129,0.1)" };
}

export default function KnockoutScenario() {
  const confirmedAbove = THIRD_PLACE_TEAMS.filter(t => !t.highlight && t.status === "done" && t.pts > 3).length;
  const dangerTeams = THIRD_PLACE_TEAMS.filter(t => !t.highlight && t.threat === "danger").length;
  const safeTeams = THIRD_PLACE_TEAMS.filter(t => t.threat === "safe").length;
  const koreaChance = 40;

  return (
    <div className="panel">
      <h3 className="panel-title" style={{ marginBottom: "0.2rem" }}>
        🌐 32강 와일드카드 — 12개 조 3위 현황
      </h3>
      <p className="muted" style={{ fontSize: "0.83rem", marginTop: 0, marginBottom: "0.9rem" }}>
        A~C조 완료 · D~L조 최종전 1경기 남음 · 12개 조 3위 중 <strong style={{ color: "var(--color-text)" }}>상위 8팀</strong> 32강 진출
      </p>

      {/* 한국 현재 스탯 + 확률 */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(29,78,216,0.18), rgba(59,130,246,0.1))",
          border: "2px solid #3b82f6",
          borderRadius: 12,
          padding: "0.85rem 1.1rem",
          marginBottom: "1rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.6rem" }}>
          <span style={{ fontWeight: 900, color: "#93c5fd", fontSize: "1rem" }}>🇰🇷 한국 · A조 3위 확정</span>
          <span style={{ fontWeight: 900, fontSize: "1.4rem", color: "#facc15" }}>{koreaChance}%</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem 1.2rem", fontSize: "0.82rem", marginBottom: "0.6rem" }}>
          <span>승점 <strong style={{ color: "#facc15" }}>3점</strong></span>
          <span>1승 0무 2패</span>
          <span>득실차 <strong style={{ color: "#f87171" }}>-1</strong></span>
          <span>득점 <strong>2골</strong></span>
          <span>실점 <strong>3골</strong></span>
        </div>
        {/* 확률 바 */}
        <div style={{ width: "100%", height: 14, background: "rgba(255,255,255,0.08)", borderRadius: 7, overflow: "hidden", position: "relative" }}>
          <div style={{ width: `${koreaChance}%`, height: "100%", background: "linear-gradient(90deg, #d97706, #f59e0b)", borderRadius: 7 }} />
          <div style={{ position: "absolute", left: "66.7%", top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.35)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--color-muted)", marginTop: "0.25rem" }}>
          <span>0%</span>
          <span>← 66.7% 수학적 기댓값</span>
          <span>100%</span>
        </div>
        <p className="muted" style={{ fontSize: "0.76rem", margin: "0.4rem 0 0" }}>
          ※ 나머지 9개 조 최종전 결과 반영 전 추정치. 실시간 변동됩니다.
        </p>
      </div>

      {/* 위험도 요약 칩 */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <div style={{ flex: "1 1 120px", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 10, padding: "0.55rem 0.8rem", textAlign: "center" }}>
          <div style={{ fontWeight: 900, fontSize: "1.2rem", color: "#f87171" }}>{confirmedAbove}팀</div>
          <div style={{ fontSize: "0.72rem", color: "#fca5a5" }}>이미 한국 추월 확정</div>
          <div style={{ fontSize: "0.7rem", color: "var(--color-muted)" }}>보스니아 (4pts)</div>
        </div>
        <div style={{ flex: "1 1 120px", background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.25)", borderRadius: 10, padding: "0.55rem 0.8rem", textAlign: "center" }}>
          <div style={{ fontWeight: 900, fontSize: "1.2rem", color: "#facc15" }}>{dangerTeams}팀</div>
          <div style={{ fontSize: "0.72rem", color: "#fde68a" }}>위험 · 최종전 남음</div>
          <div style={{ fontSize: "0.7rem", color: "var(--color-muted)" }}>무승부만 해도 추월</div>
        </div>
        <div style={{ flex: "1 1 120px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "0.55rem 0.8rem", textAlign: "center" }}>
          <div style={{ fontWeight: 900, fontSize: "1.2rem", color: "#34d399" }}>{safeTeams}팀</div>
          <div style={{ fontSize: "0.72rem", color: "#6ee7b7" }}>한국에 유리</div>
          <div style={{ fontSize: "0.7rem", color: "var(--color-muted)" }}>이겨도 4pts 이하</div>
        </div>
      </div>

      {/* 12개 조 3위 테이블 */}
      <h4 style={{ fontSize: "0.9rem", fontWeight: 800, margin: "0 0 0.5rem" }}>📊 전체 3위팀 현황</h4>
      <div className="table-wrap" style={{ marginBottom: "1.1rem" }}>
        <table className="data-table" style={{ fontSize: "0.78rem" }}>
          <thead>
            <tr>
              <th>조</th>
              <th>3위 팀</th>
              <th>점</th>
              <th>승</th>
              <th>무</th>
              <th>패</th>
              <th>남은경기</th>
              <th>상태</th>
              <th>위험도</th>
            </tr>
          </thead>
          <tbody>
            {THIRD_PLACE_TEAMS.map((t) => {
              const tl = threatLabel(t.threat);
              return (
                <tr
                  key={t.group}
                  style={t.highlight ? { background: "rgba(59,130,246,0.13)", fontWeight: 700 } : undefined}
                >
                  <td style={{ fontWeight: 800 }}>{t.group}조</td>
                  <td>
                    {t.flag} {t.team}
                    {t.highlight && <span style={{ marginLeft: "0.3rem", fontSize: "0.7rem", color: "#93c5fd" }}>★ 한국</span>}
                  </td>
                  <td
                    style={{
                      fontWeight: 900,
                      color: t.pts > 3 ? "#f87171" : t.pts === 3 ? "#facc15" : t.pts === 2 ? "#a78bfa" : undefined,
                    }}
                  >
                    {t.pts}
                  </td>
                  <td>{t.w}</td>
                  <td>{t.d}</td>
                  <td>{t.l}</td>
                  <td style={{ textAlign: "center" }}>
                    {t.gamesLeft === 0 ? (
                      <span style={{ color: "var(--color-muted)", fontSize: "0.72rem" }}>완료</span>
                    ) : (
                      <span style={{ color: "#facc15", fontWeight: 700 }}>+{t.gamesLeft}</span>
                    )}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: t.status === "done" ? "#34d399" : "#facc15",
                        background: t.status === "done" ? "rgba(16,185,129,0.12)" : "rgba(234,179,8,0.1)",
                        borderRadius: 5,
                        padding: "0.1rem 0.45rem",
                      }}
                    >
                      {t.status === "done" ? "완료" : "진행"}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: tl.color,
                        background: tl.bg,
                        borderRadius: 5,
                        padding: "0.1rem 0.45rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tl.text}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 위험 팀 최종전 결과별 영향 */}
      <h4 style={{ fontSize: "0.9rem", fontWeight: 800, margin: "0 0 0.5rem" }}>
        ⚡ 위험 팀 최종전 결과별 한국에 미치는 영향
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", marginBottom: "1.1rem" }}>
        {THIRD_PLACE_TEAMS.filter(t => t.threat === "danger" || t.threat === "safe").map((t) => (
          <div
            key={t.group}
            style={{
              display: "grid",
              gridTemplateColumns: "5.5rem 1fr 1fr 1fr",
              gap: "0.3rem",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 8,
              padding: "0.45rem 0.7rem",
              fontSize: "0.76rem",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: 700 }}>{t.flag} {t.team}<br /><span style={{ color: "var(--color-muted)", fontWeight: 400 }}>현재 {t.pts}pts</span></span>
            <span style={{ color: "#f87171", fontSize: "0.72rem" }}>⚽ 승: {t.winOutcome}</span>
            <span style={{ color: "#facc15", fontSize: "0.72rem" }}>🤝 무: {t.drawOutcome}</span>
            <span style={{ color: "#34d399", fontSize: "0.72rem" }}>💔 패: {t.lossOutcome}</span>
          </div>
        ))}
      </div>

      {/* 3가지 시나리오 */}
      <h4 style={{ fontSize: "0.9rem", fontWeight: 800, margin: "0 0 0.6rem" }}>🎯 한국의 세 가지 운명</h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem", marginBottom: "1rem" }}>
        {SCENARIOS.map((sc) => (
          <div key={sc.id} style={{ borderRadius: 12, overflow: "hidden", border: `2px solid ${sc.border}` }}>
            <div
              style={{
                background: sc.bg,
                color: "#fff",
                padding: "0.65rem 1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.65rem",
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: "1.3rem" }}>{sc.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, fontSize: "0.95rem" }}>{sc.title}</div>
                <div style={{ fontSize: "0.76rem", opacity: 0.8, marginTop: "0.1rem" }}>{sc.condition}</div>
              </div>
              <span
                style={{
                  background: "rgba(0,0,0,0.25)",
                  borderRadius: 20,
                  padding: "0.2rem 0.75rem",
                  fontWeight: 900,
                  fontSize: "0.85rem",
                  color: sc.verdictColor,
                  border: `1px solid ${sc.border}`,
                  whiteSpace: "nowrap",
                }}
              >
                {sc.verdict}
              </span>
            </div>
            <div style={{ padding: "0.7rem 1rem", display: "flex", flexDirection: "column", gap: "0.28rem" }}>
              {sc.details.map((d, i) => (
                <div key={i} style={{ fontSize: "0.79rem", display: "flex", gap: "0.4rem", lineHeight: 1.5 }}>
                  <span style={{ color: sc.verdictColor, fontWeight: 700, flexShrink: 0 }}>·</span>
                  <span>{d}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 핵심 수식 */}
      <div
        style={{
          background: "rgba(250,204,21,0.05)",
          border: "1px solid rgba(250,204,21,0.18)",
          borderRadius: 10,
          padding: "0.75rem 1rem",
          fontSize: "0.79rem",
        }}
      >
        <div style={{ fontWeight: 700, color: "#facc15", marginBottom: "0.4rem" }}>📐 핵심 규칙</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", color: "var(--color-text)" }}>
          <div>· 8개 조 와일드카드 → 한국보다 높은 팀이 <strong>8팀 이상</strong>이면 탈락</div>
          <div>· 현재 확정 위: <strong style={{ color: "#f87171" }}>1팀</strong> (보스니아) · 위험 팀: <strong style={{ color: "#facc15" }}>6팀</strong></div>
          <div>· FIFA 동점 처리: ① 승점 → ② 득실차 → ③ 득점 → ④ 페어플레이 → ⑤ 추첨</div>
          <div style={{ color: "var(--color-muted)", fontSize: "0.74rem", marginTop: "0.2rem" }}>
            ※ 한국 GD -1 · GF 2 — 3pts 동률 팀 대비 GD 불리. D~L조 최종전 결과가 모두 반영되어야 최종 확정.
          </div>
        </div>
      </div>
    </div>
  );
}
