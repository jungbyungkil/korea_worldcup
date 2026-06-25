/** 32강 와일드카드 — 12개 조 3위 현황 + 한국 경우의 수 */

type GroupStatus = "done" | "ongoing" | "pending";

type ThirdPlaceTeam = {
  group: string;
  flag: string;
  team: string;
  pts: number | null;
  w: number | null;
  d: number | null;
  l: number | null;
  gf: number | null;
  ga: number | null;
  status: GroupStatus;
  highlight?: boolean;
};

const THIRD_PLACE_TEAMS: ThirdPlaceTeam[] = [
  { group: "A", flag: "🇰🇷", team: "대한민국", pts: 3, w: 1, d: 0, l: 2, gf: 2, ga: 3, status: "done", highlight: true },
  { group: "B", flag: "🏳️", team: "집계 중", pts: null, w: null, d: null, l: null, gf: null, ga: null, status: "pending" },
  { group: "C", flag: "🏳️", team: "집계 중", pts: null, w: null, d: null, l: null, gf: null, ga: null, status: "pending" },
  { group: "D", flag: "🏳️", team: "집계 중", pts: null, w: null, d: null, l: null, gf: null, ga: null, status: "pending" },
  { group: "E", flag: "🏳️", team: "집계 중", pts: null, w: null, d: null, l: null, gf: null, ga: null, status: "pending" },
  { group: "F", flag: "🏳️", team: "집계 중", pts: null, w: null, d: null, l: null, gf: null, ga: null, status: "pending" },
  { group: "G", flag: "🏳️", team: "집계 중", pts: null, w: null, d: null, l: null, gf: null, ga: null, status: "pending" },
  { group: "H", flag: "🏳️", team: "집계 중", pts: null, w: null, d: null, l: null, gf: null, ga: null, status: "pending" },
  { group: "I", flag: "🏳️", team: "집계 중", pts: null, w: null, d: null, l: null, gf: null, ga: null, status: "pending" },
  { group: "J", flag: "🏳️", team: "집계 중", pts: null, w: null, d: null, l: null, gf: null, ga: null, status: "pending" },
  { group: "K", flag: "🏳️", team: "집계 중", pts: null, w: null, d: null, l: null, gf: null, ga: null, status: "pending" },
  { group: "L", flag: "🏳️", team: "집계 중", pts: null, w: null, d: null, l: null, gf: null, ga: null, status: "pending" },
];

const SCENARIOS = [
  {
    id: "safe",
    title: "안전권 진출",
    condition: "나머지 11개 조 3위 팀 중 4점 이상이 ≤ 3팀",
    verdict: "32강 확정",
    verdictColor: "#34d399",
    bg: "linear-gradient(135deg, #064e3b, #047857)",
    border: "#34d399",
    probability: "높음",
    probColor: "#34d399",
    details: [
      "3pts 팀이 하위권에 적을 경우 한국이 자연스럽게 상위 8위 안에 진입",
      "12개 조 중 8팀 진출이므로 4팀만 탈락 → 3pts로도 충분한 경우 많음",
      "득실차(-1)가 낮아도 다른 3위 팀들이 더 낮으면 자동 통과",
    ],
    example: "예: 다른 조 3위들이 전원 1~2점 → 한국 3pts로 안전 진출",
  },
  {
    id: "gd",
    title: "득실차 경쟁",
    condition: "4점 이상 팀이 정확히 4팀 = 한국이 딱 8위권",
    verdict: "GD·득점 비교",
    verdictColor: "#facc15",
    bg: "linear-gradient(135deg, #451a03, #78350f)",
    border: "#fbbf24",
    probability: "중간",
    probColor: "#facc15",
    details: [
      "4점 팀 4팀 + 3pts 팀 중 한국과 동률 경쟁",
      "FIFA 3위팀 순위: ① 승점 → ② 득실차 → ③ 득점 → ④ 페어플레이",
      "한국 득실차 -1 · 득점 2 — 동점 팀 대비 불리한 편",
      "하지만 동률 3pts 팀 중 GD가 -2 이하인 팀이 4팀 이상이면 진출",
    ],
    example: "예: 3pts 동률 팀 중 GD -2, -3 팀이 많으면 한국(GD-1) 통과",
  },
  {
    id: "out",
    title: "탈락 구간",
    condition: "4점 이상 팀이 5팀 이상 = 한국 9위 이하",
    verdict: "조별리그 탈락",
    verdictColor: "#f87171",
    bg: "linear-gradient(135deg, #7f1d1d, #991b1b)",
    border: "#f87171",
    probability: "낮음",
    probColor: "#f87171",
    details: [
      "4점 이상 팀이 5개 이상이면 한국은 수학적으로 9위 이하 확정",
      "또는 동점 3pts 팀이 많고 한국보다 GD/GF 모두 높으면 밀림",
      "2026 World Cup은 48팀이지만 조별리그는 동일한 경쟁 구도",
    ],
    example: "예: B~L 11개 조 중 5개 조 3위가 1승 1무 = 4점 이상 → 한국 탈락",
  },
];

function gdDisplay(gf: number | null, ga: number | null): string {
  if (gf == null || ga == null) return "—";
  const gd = gf - ga;
  return gd > 0 ? `+${gd}` : String(gd);
}

function statusBadge(status: GroupStatus) {
  if (status === "done") return { label: "완료", color: "#34d399", bg: "rgba(16,185,129,0.15)" };
  if (status === "ongoing") return { label: "진행 중", color: "#facc15", bg: "rgba(234,179,8,0.12)" };
  return { label: "대기", color: "var(--color-muted)", bg: "rgba(255,255,255,0.05)" };
}

export default function KnockoutScenario() {
  const confirmedBetter = THIRD_PLACE_TEAMS.filter(
    (t) => !t.highlight && t.pts != null && t.pts > 3
  ).length;
  const pendingCount = THIRD_PLACE_TEAMS.filter((t) => t.status === "pending").length;

  return (
    <div className="panel">
      <h3 className="panel-title" style={{ marginBottom: "0.2rem" }}>
        🌐 32강 와일드카드 · 12개 조 3위 현황
      </h3>
      <p className="muted" style={{ fontSize: "0.83rem", marginTop: 0, marginBottom: "1rem" }}>
        12개 조의 3위 팀 중 <strong style={{ color: "var(--color-text)" }}>상위 8팀</strong>이 32강 진출 · 4팀 탈락
      </p>

      {/* 한국 현재 스탯 하이라이트 */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(29,78,216,0.2), rgba(59,130,246,0.12))",
          border: "2px solid #3b82f6",
          borderRadius: 12,
          padding: "0.75rem 1.1rem",
          marginBottom: "1rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem 1.5rem",
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: 900, color: "#93c5fd", fontSize: "0.95rem" }}>🇰🇷 한국 현재 스탯</span>
        <span>승점 <strong style={{ color: "#facc15" }}>3점</strong></span>
        <span>득실차 <strong style={{ color: "#f87171" }}>-1</strong></span>
        <span>득점 <strong>2골</strong></span>
        <span>실점 <strong>3골</strong></span>
        <span style={{ fontSize: "0.78rem", color: "var(--color-muted)" }}>
          A조 확정 · 나머지 {pendingCount}개 조 대기 중
        </span>
      </div>

      {/* 12개 조 3위팀 테이블 */}
      <div className="table-wrap" style={{ marginBottom: "1.25rem" }}>
        <table className="data-table" style={{ fontSize: "0.8rem" }}>
          <thead>
            <tr>
              <th>조</th>
              <th>3위 팀</th>
              <th title="승점">점</th>
              <th title="승">승</th>
              <th title="무">무</th>
              <th title="패">패</th>
              <th title="득점">득</th>
              <th title="실점">실</th>
              <th title="득실차">±</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {THIRD_PLACE_TEAMS.map((t) => {
              const badge = statusBadge(t.status);
              const gd = t.gf != null && t.ga != null ? t.gf - t.ga : null;
              return (
                <tr
                  key={t.group}
                  style={
                    t.highlight
                      ? { background: "rgba(59,130,246,0.13)", fontWeight: 700 }
                      : undefined
                  }
                >
                  <td style={{ fontWeight: 800 }}>{t.group}조</td>
                  <td>
                    {t.flag} {t.team}
                    {t.highlight && (
                      <span style={{ marginLeft: "0.3rem", fontSize: "0.7rem", color: "#93c5fd" }}>★</span>
                    )}
                  </td>
                  <td style={{ fontWeight: t.pts != null ? 800 : 400, color: t.pts != null ? (t.pts >= 4 ? "#34d399" : t.pts === 3 ? "#facc15" : undefined) : undefined }}>
                    {t.pts ?? "—"}
                  </td>
                  <td>{t.w ?? "—"}</td>
                  <td>{t.d ?? "—"}</td>
                  <td>{t.l ?? "—"}</td>
                  <td>{t.gf ?? "—"}</td>
                  <td>{t.ga ?? "—"}</td>
                  <td
                    style={{
                      fontWeight: 700,
                      color: gd == null ? undefined : gd > 0 ? "#34d399" : gd < 0 ? "#f87171" : undefined,
                    }}
                  >
                    {gdDisplay(t.gf, t.ga)}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: badge.color,
                        background: badge.bg,
                        borderRadius: 6,
                        padding: "0.12rem 0.5rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {badge.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 현재 확인된 상위 팀 수 요약 */}
      <div
        style={{
          display: "flex",
          gap: "0.6rem",
          flexWrap: "wrap",
          marginBottom: "1.25rem",
        }}
      >
        {[
          { label: "4점 이상 확정 팀", val: confirmedBetter, color: "#f87171", note: "이미 한국보다 유리" },
          { label: "현재 한국 예상 순위", val: `≥ ${confirmedBetter + 1}위`, color: "#facc15", note: "나머지 집계 후 확정" },
          { label: "남은 확인 필요 조", val: `${pendingCount}개 조`, color: "#93c5fd", note: "B조~L조 진행 중" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              flex: "1 1 140px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              padding: "0.65rem 0.85rem",
              textAlign: "center",
            }}
          >
            <div style={{ fontWeight: 900, fontSize: "1.3rem", color: item.color }}>{item.val}</div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700 }}>{item.label}</div>
            <div style={{ fontSize: "0.72rem", color: "var(--color-muted)" }}>{item.note}</div>
          </div>
        ))}
      </div>

      {/* 경우의 수 3가지 시나리오 */}
      <h4 style={{ fontSize: "0.95rem", fontWeight: 800, margin: "0 0 0.65rem" }}>
        🎯 경우의 수 — 한국의 세 가지 운명
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
        {SCENARIOS.map((sc) => (
          <div
            key={sc.id}
            style={{
              borderRadius: 12,
              overflow: "hidden",
              border: `2px solid ${sc.border}`,
            }}
          >
            <div
              style={{
                background: sc.bg,
                color: "#fff",
                padding: "0.7rem 1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, fontSize: "1rem" }}>{sc.title}</div>
                <div style={{ fontSize: "0.78rem", opacity: 0.85, marginTop: "0.1rem" }}>{sc.condition}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.2rem" }}>
                <span
                  style={{
                    background: "rgba(0,0,0,0.25)",
                    borderRadius: 20,
                    padding: "0.2rem 0.8rem",
                    fontWeight: 900,
                    fontSize: "0.88rem",
                    color: sc.verdictColor,
                    border: `1px solid ${sc.border}`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {sc.verdict}
                </span>
                <span style={{ fontSize: "0.72rem", color: sc.probColor, fontWeight: 700 }}>
                  가능성: {sc.probability}
                </span>
              </div>
            </div>
            <div style={{ padding: "0.75rem 1rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              {sc.details.map((d, i) => (
                <div key={i} style={{ fontSize: "0.8rem", display: "flex", gap: "0.4rem", lineHeight: 1.5 }}>
                  <span style={{ color: sc.verdictColor, fontWeight: 700, flexShrink: 0 }}>·</span>
                  <span>{d}</span>
                </div>
              ))}
              <div
                style={{
                  marginTop: "0.3rem",
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 7,
                  padding: "0.4rem 0.65rem",
                  fontSize: "0.77rem",
                  color: "var(--color-muted)",
                  border: `1px solid rgba(255,255,255,0.08)`,
                }}
              >
                💡 {sc.example}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3위팀 순위 결정 기준 */}
      <div
        style={{
          background: "rgba(250,204,21,0.05)",
          border: "1px solid rgba(250,204,21,0.18)",
          borderRadius: 10,
          padding: "0.75rem 1rem",
          fontSize: "0.8rem",
        }}
      >
        <div style={{ fontWeight: 700, color: "#facc15", marginBottom: "0.4rem" }}>
          📐 FIFA 3위팀 순위 결정 기준 (동점 시)
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem 1rem", color: "var(--color-text)" }}>
          {["① 승점", "② 득실차 (GD)", "③ 총 득점 (GF)", "④ 페어플레이 점수", "⑤ 추첨"].map((rule) => (
            <span key={rule} style={{ fontSize: "0.78rem" }}>{rule}</span>
          ))}
        </div>
        <div style={{ color: "var(--color-muted)", marginTop: "0.4rem", fontSize: "0.76rem" }}>
          ※ 한국의 현재 스탯: 3pts · GD -1 · GF 2 — 같은 3pts 팀 대비 GD가 낮아 불리한 편
        </div>
      </div>

      <p className="muted" style={{ fontSize: "0.76rem", marginTop: "0.6rem" }}>
        * 다른 조 결과가 집계되는 대로 업데이트 예정. 현재 A조만 완료.
      </p>
    </div>
  );
}
