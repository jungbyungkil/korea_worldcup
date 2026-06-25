/**
 * 32강 와일드카드 — 12개 조 3위 현황 + D~L조 최종전 결과 예측
 * A~C조는 확정, D~L조는 팀 강도·현재 승점 기반 예측치
 */

type GroupStatus = "done" | "predicted";
type Threat = "above" | "gd-battle" | "gd-weak" | "safe";

type ThirdPlaceTeam = {
  group: string;
  flag: string;
  team: string;
  pts: number;
  predictedPts: number;
  w: number;
  d: number;
  l: number;
  status: GroupStatus;
  highlight?: boolean;
  threat: Threat;
  predictedNote: string;
};

type FinalGamePrediction = {
  group: string;
  game1: { home: string; score: string; away: string };
  game2: { home: string; score: string; away: string };
  impact: string;
  impactColor: string;
};

const FINAL_PREDICTIONS: FinalGamePrediction[] = [
  {
    group: "D",
    game1: { home: "🇺🇸 미국", score: "3 - 1", away: "🇹🇷 튀르키예" },
    game2: { home: "🇦🇺 호주", score: "2 - 1", away: "🇵🇾 파라과이" },
    impact: "파라과이 3pts 유지 → 한국과 GD 경쟁",
    impactColor: "#facc15",
  },
  {
    group: "E",
    game1: { home: "🇩🇪 독일", score: "2 - 0", away: "🇨🇮 코트디부아르" },
    game2: { home: "🇪🇨 에콰도르", score: "2 - 1", away: "🇸🇽 쿠라소" },
    impact: "에콰도르 4pts 2위 → 코트디부아르 3pts 3위 → GD 경쟁",
    impactColor: "#facc15",
  },
  {
    group: "F",
    game1: { home: "🇳🇱 네덜란드", score: "2 - 1", away: "🇸🇪 스웨덴" },
    game2: { home: "🇯🇵 일본", score: "3 - 0", away: "🇹🇳 튀니지" },
    impact: "스웨덴 3pts 유지 → 한국과 GD 경쟁",
    impactColor: "#facc15",
  },
  {
    group: "G",
    game1: { home: "🇪🇬 이집트", score: "2 - 0", away: "🇳🇿 뉴질랜드" },
    game2: { home: "🇧🇪 벨기에", score: "2 - 1", away: "🇮🇷 이란" },
    impact: "이란 2pts 3위 → 한국보다 낮음 ✅ 안전",
    impactColor: "#34d399",
  },
  {
    group: "H",
    game1: { home: "🇪🇸 스페인", score: "3 - 0", away: "🇸🇦 사우디" },
    game2: { home: "🇺🇾 우루과이", score: "2 - 0", away: "🇨🇻 카보베르데" },
    impact: "카보베르데 2pts 유지 → 한국보다 낮음 ✅ 안전",
    impactColor: "#34d399",
  },
  {
    group: "I",
    game1: { home: "🇫🇷 프랑스", score: "1 - 1", away: "🇳🇴 노르웨이" },
    game2: { home: "🇸🇳 세네갈", score: "2 - 1", away: "🇮🇶 이라크" },
    impact: "세네갈 3pts → 한국과 GD 경쟁 (단, 프랑스·노르웨이에 대패 → GD 최악 예상)",
    impactColor: "#a78bfa",
  },
  {
    group: "J",
    game1: { home: "🇦🇷 아르헨티나", score: "4 - 0", away: "🇯🇴 요르단" },
    game2: { home: "🇦🇹 오스트리아", score: "1 - 0", away: "🇩🇿 알제리" },
    impact: "알제리 3pts 유지 → 한국과 GD 경쟁",
    impactColor: "#facc15",
  },
  {
    group: "K",
    game1: { home: "🇨🇴 콜롬비아", score: "3 - 0", away: "🇺🇿 우즈베키스탄" },
    game2: { home: "🇵🇹 포르투갈", score: "3 - 0", away: "🇨🇩 콩고DR" },
    impact: "콩고DR 1pts → 한국보다 낮음 ✅ 안전",
    impactColor: "#34d399",
  },
  {
    group: "L",
    game1: { home: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 잉글랜드", score: "4 - 0", away: "🇵🇦 파나마" },
    game2: { home: "🇭🇷 크로아티아", score: "2 - 1", away: "🇬🇭 가나" },
    impact: "크로아티아 6pts 2위 → 가나 4pts 3위 ⚠️ 한국 추월!",
    impactColor: "#f87171",
  },
];

const THIRD_PLACE_TEAMS: ThirdPlaceTeam[] = [
  {
    group: "A", flag: "🇰🇷", team: "대한민국",
    pts: 3, predictedPts: 3, w: 1, d: 0, l: 2,
    status: "done", highlight: true, threat: "gd-battle",
    predictedNote: "확정 · GD -1 · GF 2",
  },
  {
    group: "B", flag: "🇧🇦", team: "보스니아",
    pts: 4, predictedPts: 4, w: 1, d: 1, l: 1,
    status: "done", threat: "above",
    predictedNote: "확정 · 한국보다 1점 위",
  },
  {
    group: "C", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", team: "스코틀랜드",
    pts: 3, predictedPts: 3, w: 1, d: 0, l: 2,
    status: "done", threat: "gd-battle",
    predictedNote: "확정 · GD 미공개, 한국과 동점",
  },
  {
    group: "D", flag: "🇵🇾", team: "파라과이",
    pts: 3, predictedPts: 3, w: 1, d: 0, l: 2,
    status: "predicted", threat: "gd-battle",
    predictedNote: "예측 · 호주에 패배 → 3pts 유지",
  },
  {
    group: "E", flag: "🇨🇮", team: "코트디부아르",
    pts: 3, predictedPts: 3, w: 1, d: 0, l: 2,
    status: "predicted", threat: "gd-battle",
    predictedNote: "예측 · 독일에 패배, 에콰도르가 2위 → 3위",
  },
  {
    group: "F", flag: "🇸🇪", team: "스웨덴",
    pts: 3, predictedPts: 3, w: 1, d: 0, l: 2,
    status: "predicted", threat: "gd-battle",
    predictedNote: "예측 · 네덜란드에 패배 → 3pts 유지",
  },
  {
    group: "G", flag: "🇮🇷", team: "이란",
    pts: 2, predictedPts: 2, w: 0, d: 2, l: 1,
    status: "predicted", threat: "safe",
    predictedNote: "예측 · 벨기에에 패배 → 2pts ✅ 한국 안전",
  },
  {
    group: "H", flag: "🇨🇻", team: "카보베르데",
    pts: 2, predictedPts: 2, w: 0, d: 2, l: 1,
    status: "predicted", threat: "safe",
    predictedNote: "예측 · 우루과이에 패배 → 2pts ✅ 한국 안전",
  },
  {
    group: "I", flag: "🇸🇳", team: "세네갈",
    pts: 0, predictedPts: 3, w: 1, d: 0, l: 2,
    status: "predicted", threat: "gd-weak",
    predictedNote: "예측 · 이라크 승리 → 3pts, 단 GD 최악 (프랑스·노르웨이에 대패)",
  },
  {
    group: "J", flag: "🇩🇿", team: "알제리",
    pts: 3, predictedPts: 3, w: 1, d: 0, l: 2,
    status: "predicted", threat: "gd-battle",
    predictedNote: "예측 · 오스트리아에 패배 → 3pts 유지",
  },
  {
    group: "K", flag: "🇨🇩", team: "콩고DR",
    pts: 1, predictedPts: 1, w: 0, d: 1, l: 2,
    status: "predicted", threat: "safe",
    predictedNote: "예측 · 포르투갈에 패배 → 1pt ✅ 한국 안전",
  },
  {
    group: "L", flag: "🇬🇭", team: "가나",
    pts: 4, predictedPts: 4, w: 1, d: 1, l: 1,
    status: "predicted", threat: "above",
    predictedNote: "예측 · 크로아티아에 패배 → 4pts로 3위 ⚠️ 위험",
  },
];

function threatInfo(t: Threat) {
  if (t === "above") return { label: "한국 위", color: "#f87171", bg: "rgba(220,38,38,0.14)" };
  if (t === "gd-battle") return { label: "GD경쟁", color: "#facc15", bg: "rgba(234,179,8,0.12)" };
  if (t === "gd-weak") return { label: "GD불리", color: "#a78bfa", bg: "rgba(139,92,246,0.1)" };
  return { label: "한국 아래", color: "#34d399", bg: "rgba(16,185,129,0.1)" };
}

export default function KnockoutScenario() {
  const koreaChance = 65;

  const aboveCount = THIRD_PLACE_TEAMS.filter(t => !t.highlight && t.threat === "above").length;
  const gdBattleCount = THIRD_PLACE_TEAMS.filter(t => t.threat === "gd-battle").length;
  const safeCount = THIRD_PLACE_TEAMS.filter(t => t.threat === "safe").length;

  // For sorted ranking display
  const sorted = [...THIRD_PLACE_TEAMS].sort((a, b) => b.predictedPts - a.predictedPts);

  return (
    <div className="panel">
      <h3 className="panel-title" style={{ marginBottom: "0.2rem" }}>
        🌐 32강 와일드카드 · 12개 조 최종 예측
      </h3>
      <div
        style={{
          display: "inline-block",
          background: "rgba(250,204,21,0.12)",
          border: "1px solid rgba(250,204,21,0.35)",
          borderRadius: 20,
          padding: "0.15rem 0.75rem",
          fontSize: "0.75rem",
          fontWeight: 700,
          color: "#facc15",
          marginBottom: "0.8rem",
        }}
      >
        ⚡ A~C조 확정 · D~L조 최종전 결과 AI 예측 (비공식)
      </div>

      {/* 한국 진출 확률 */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(29,78,216,0.18), rgba(59,130,246,0.1))",
          border: "2px solid #3b82f6",
          borderRadius: 12,
          padding: "0.85rem 1.1rem",
          marginBottom: "1rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.55rem" }}>
          <div>
            <span style={{ fontWeight: 900, color: "#93c5fd", fontSize: "1rem" }}>🇰🇷 한국 · A조 3위 확정</span>
            <span style={{ fontSize: "0.78rem", color: "var(--color-muted)", marginLeft: "0.6rem" }}>3pts · GD -1 · GF 2</span>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 900, fontSize: "1.5rem", color: "#facc15", lineHeight: 1 }}>{koreaChance}%</div>
            <div style={{ fontSize: "0.7rem", color: "var(--color-muted)" }}>예측 기반 진출 확률</div>
          </div>
        </div>
        <div style={{ width: "100%", height: 14, background: "rgba(255,255,255,0.08)", borderRadius: 7, overflow: "hidden", position: "relative" }}>
          <div style={{ width: `${koreaChance}%`, height: "100%", background: "linear-gradient(90deg, #1d4ed8, #3b82f6)", borderRadius: 7 }} />
          <div style={{ position: "absolute", left: "66.7%", top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.3)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--color-muted)", marginTop: "0.25rem" }}>
          <span>탈락</span>
          <span>← 수학 기댓값 66.7%</span>
          <span>진출</span>
        </div>
        <p className="muted" style={{ fontSize: "0.75rem", margin: "0.45rem 0 0" }}>
          예측 시나리오: 7팀이 3pts 동률 → GD 경쟁 (한국이 세네갈보다 GD 좋으면 진출 유력)
        </p>
      </div>

      {/* 위험도 요약 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", marginBottom: "1rem" }}>
        <div style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 10, padding: "0.6rem 0.7rem", textAlign: "center" }}>
          <div style={{ fontWeight: 900, fontSize: "1.3rem", color: "#f87171" }}>{aboveCount}팀</div>
          <div style={{ fontSize: "0.72rem", color: "#fca5a5", fontWeight: 700 }}>한국 위 (4pts)</div>
          <div style={{ fontSize: "0.68rem", color: "var(--color-muted)" }}>보스니아 · 가나</div>
        </div>
        <div style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.25)", borderRadius: 10, padding: "0.6rem 0.7rem", textAlign: "center" }}>
          <div style={{ fontWeight: 900, fontSize: "1.3rem", color: "#facc15" }}>{gdBattleCount}팀</div>
          <div style={{ fontSize: "0.72rem", color: "#fde68a", fontWeight: 700 }}>GD 경쟁 (3pts)</div>
          <div style={{ fontSize: "0.68rem", color: "var(--color-muted)" }}>한국 포함 7팀 동률</div>
        </div>
        <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "0.6rem 0.7rem", textAlign: "center" }}>
          <div style={{ fontWeight: 900, fontSize: "1.3rem", color: "#34d399" }}>{safeCount}팀</div>
          <div style={{ fontSize: "0.72rem", color: "#6ee7b7", fontWeight: 700 }}>한국 아래</div>
          <div style={{ fontSize: "0.68rem", color: "var(--color-muted)" }}>이란·카보베르데·콩고</div>
        </div>
      </div>

      {/* D~L조 최종전 예측 */}
      <h4 style={{ fontSize: "0.9rem", fontWeight: 800, margin: "0 0 0.5rem" }}>⚽ D~L조 최종전 예측 결과</h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", marginBottom: "1.1rem" }}>
        {FINAL_PREDICTIONS.map((p) => (
          <div
            key={p.group}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 9,
              padding: "0.55rem 0.8rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap", marginBottom: "0.3rem" }}>
              <span style={{ fontWeight: 800, fontSize: "0.8rem", color: "var(--color-muted)", minWidth: "2rem" }}>{p.group}조</span>
              <span style={{ fontSize: "0.78rem" }}>{p.game1.home} <strong>{p.game1.score}</strong> {p.game1.away}</span>
              <span style={{ color: "var(--color-muted)", fontSize: "0.72rem" }}>|</span>
              <span style={{ fontSize: "0.78rem" }}>{p.game2.home} <strong>{p.game2.score}</strong> {p.game2.away}</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: p.impactColor, fontWeight: 600, paddingLeft: "2.6rem" }}>
              → {p.impact}
            </div>
          </div>
        ))}
      </div>

      {/* 예측 최종 순위표 (승점순) */}
      <h4 style={{ fontSize: "0.9rem", fontWeight: 800, margin: "0 0 0.5rem" }}>
        📊 예측 최종 3위 랭킹 (8위까지 32강 진출)
      </h4>
      <div className="table-wrap" style={{ marginBottom: "1rem" }}>
        <table className="data-table" style={{ fontSize: "0.78rem" }}>
          <thead>
            <tr>
              <th>예상순위</th>
              <th>조</th>
              <th>팀</th>
              <th>점</th>
              <th>승</th>
              <th>무</th>
              <th>패</th>
              <th>상태</th>
              <th>판정</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t, idx) => {
              const ti = threatInfo(t.threat);
              const rank = idx + 1;
              const isIn = rank <= 8;
              return (
                <tr
                  key={t.group}
                  style={
                    t.highlight
                      ? { background: "rgba(59,130,246,0.14)", fontWeight: 700 }
                      : rank === 9
                      ? { background: "rgba(127,29,29,0.15)" }
                      : undefined
                  }
                >
                  <td style={{ fontWeight: 900, color: isIn ? "#34d399" : "#f87171" }}>
                    {rank}위 {rank <= 8 ? "🎟️" : "❌"}
                  </td>
                  <td style={{ fontWeight: 700 }}>{t.group}조</td>
                  <td>
                    {t.flag} {t.team}
                    {t.highlight && <span style={{ marginLeft: "0.3rem", fontSize: "0.7rem", color: "#93c5fd" }}>★</span>}
                  </td>
                  <td
                    style={{
                      fontWeight: 900,
                      color: t.predictedPts >= 4 ? "#f87171" : t.predictedPts === 3 ? "#facc15" : "var(--color-muted)",
                    }}
                  >
                    {t.predictedPts}
                    {t.status === "predicted" && (
                      <span style={{ fontSize: "0.65rem", color: "var(--color-muted)", marginLeft: "0.2rem" }}>예측</span>
                    )}
                  </td>
                  <td>{t.w}</td>
                  <td>{t.d}</td>
                  <td>{t.l}</td>
                  <td>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        color: t.status === "done" ? "#34d399" : "#facc15",
                        background: t.status === "done" ? "rgba(16,185,129,0.12)" : "rgba(234,179,8,0.1)",
                        borderRadius: 5,
                        padding: "0.1rem 0.4rem",
                      }}
                    >
                      {t.status === "done" ? "확정" : "예측"}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        color: ti.color,
                        background: ti.bg,
                        borderRadius: 5,
                        padding: "0.1rem 0.4rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ti.label}
                    </span>
                  </td>
                </tr>
              );
            })}
            {/* 구분선 */}
            <tr>
              <td
                colSpan={9}
                style={{
                  background: "rgba(220,38,38,0.2)",
                  border: "1px dashed #f87171",
                  textAlign: "center",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#f87171",
                  padding: "0.3rem",
                }}
              >
                ─── 이 선 아래는 탈락 ───
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 핵심 분석: 세네갈 GD가 관건 */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(109,40,217,0.06))",
          border: "1px solid rgba(139,92,246,0.35)",
          borderRadius: 12,
          padding: "0.85rem 1.1rem",
          marginBottom: "0.85rem",
        }}
      >
        <div style={{ fontWeight: 900, color: "#c4b5fd", fontSize: "0.95rem", marginBottom: "0.5rem" }}>
          🔑 핵심 변수 — 세네갈의 GD가 한국의 운명을 가른다
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.8rem" }}>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <span style={{ color: "#34d399", fontWeight: 700, flexShrink: 0 }}>✅</span>
            <span>세네갈이 프랑스·노르웨이(세계 최강급)에 대패 → GD -4 이하 예상 → <strong>한국(GD -1) 자동 진출</strong></span>
          </div>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <span style={{ color: "#facc15", fontWeight: 700, flexShrink: 0 }}>⚠️</span>
            <span>세네갈 GD가 -1과 같다면 → GF(득점) 비교. 한국 GF 2골 기준 세네갈이 3골 이상 넣었다면 역전당할 수 있음</span>
          </div>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <span style={{ color: "#a78bfa", fontWeight: 700, flexShrink: 0 }}>📊</span>
            <span>다른 3pts 팀(스코틀랜드·파라과이·코트디부아르·스웨덴·알제리)과의 GD 비교도 병행</span>
          </div>
        </div>
      </div>

      {/* 규칙 요약 */}
      <div
        style={{
          background: "rgba(250,204,21,0.05)",
          border: "1px solid rgba(250,204,21,0.18)",
          borderRadius: 10,
          padding: "0.7rem 1rem",
          fontSize: "0.78rem",
        }}
      >
        <div style={{ fontWeight: 700, color: "#facc15", marginBottom: "0.35rem" }}>📐 FIFA 3위팀 순위 결정 (동점 시)</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem 1rem", color: "var(--color-text)" }}>
          {["① 승점", "② 득실차(GD)", "③ 총득점(GF)", "④ 페어플레이", "⑤ 추첨"].map(r => (
            <span key={r}>{r}</span>
          ))}
        </div>
        <div style={{ color: "var(--color-muted)", marginTop: "0.4rem", fontSize: "0.73rem" }}>
          ※ 한국 GD -1 · GF 2 · 7팀 동률 중 6팀이 32강 진출. 세네갈이 가장 GD 불리할 것으로 예측.
        </div>
      </div>
      <p className="muted" style={{ fontSize: "0.73rem", marginTop: "0.5rem" }}>
        * D~L조 예측은 팀 전력·현재 순위 기반 추정치입니다. 실제 결과와 다를 수 있습니다.
      </p>
    </div>
  );
}
