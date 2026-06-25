/** 32강 (16강 아님) — 한국 vs 독일 잠재 대진 · 와일드카드 진출 시 */

const GERMANY_KEY_PLAYERS = [
  { name: "플로리안 비르츠", pos: "MF", club: "바이에른 뮌헨", note: "현 독일 최고 재능 · 드리블·패스·슈팅 올라운드" },
  { name: "야말 무시알라", pos: "MF", club: "바이에른 뮌헨", note: "속도·기술 겸비, 돌파와 찬스 창출의 핵심" },
  { name: "카이 하베르츠", pos: "FW", club: "아스날", note: "박스 안 결정력 · 세트피스 위협" },
  { name: "토니 크로스", pos: "MF", club: "레알 마드리드", note: "은퇴 후 부재 — 조율 롤 변화 예상" },
  { name: "레로이 자네", pos: "FW", club: "바이에른 뮌헨", note: "좌우 커버, 폭발적 스피드" },
];

const MATCH_FACTS = [
  { label: "예상 날짜", value: "2026년 6월 29일 ~ 7월 1일 (FIFA 일정 확인 필요)" },
  { label: "예상 경기장", value: "미국 내 32강 지정 경기장 (LA·댈러스·뉴욕 등)" },
  { label: "독일 ELO", value: "약 1970 (세계 상위 3위권)" },
  { label: "한국 ELO", value: "약 1820 (세계 약 20위권)" },
  { label: "역대 상대전적", value: "4전 1승 3패 · 2002년 한국 2-1 독일 (4강)" },
  { label: "진출 조건", value: "한국이 3위 와일드카드 8팀 안에 들어야 성립" },
];

const TACTICAL_NOTES = [
  {
    icon: "🛡️",
    title: "독일 압박 스타일",
    body: "게겐프레싱 기반 고강도 전방 압박. 한국의 빌드업 단계에서 실수 유발 노림.",
  },
  {
    icon: "⚡",
    title: "측면 공략",
    body: "비르츠·자네 양 측면이 핵심. 한국 풀백 1대1 수비력이 관건.",
  },
  {
    icon: "🇰🇷",
    title: "한국의 대응 전술",
    body: "중원 압박 차단 + 빠른 역습. 이강인·황희찬의 전환 스피드로 독일 라인 깊이 공략 필요.",
  },
  {
    icon: "📐",
    title: "세트피스 변수",
    body: "독일은 코너·프리킥 위협 높음. 한국도 세트피스 수비 조직력이 승패 변수.",
  },
];

export default function Round32GermanySpotlight() {
  return (
    <section
      className="panel"
      style={{
        border: "2px solid rgba(250,204,21,0.35)",
        background: "linear-gradient(160deg, rgba(20,20,20,0.95) 0%, rgba(28,20,0,0.95) 100%)",
        position: "relative",
        overflow: "hidden",
      }}
      aria-labelledby="germany-r32-title"
    >
      {/* 배경 워터마크 */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "50%",
          right: "-2rem",
          transform: "translateY(-50%)",
          fontSize: "10rem",
          opacity: 0.04,
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        🦅
      </div>

      {/* 헤더 */}
      <div style={{ marginBottom: "1.1rem" }}>
        <span
          style={{
            display: "inline-block",
            background: "rgba(250,204,21,0.15)",
            border: "1px solid rgba(250,204,21,0.4)",
            borderRadius: 20,
            padding: "0.2rem 0.85rem",
            fontSize: "0.78rem",
            fontWeight: 700,
            color: "#facc15",
            marginBottom: "0.5rem",
          }}
        >
          🎟️ 32강 진출 시 대진 (와일드카드 조건부)
        </span>
        <h2 id="germany-r32-title" style={{ margin: "0 0 0.3rem", fontSize: "1.3rem", fontWeight: 900 }}>
          🇰🇷 대한민국 vs 🇩🇪 독일
        </h2>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-muted)" }}>
          한국이 3위 와일드카드 8팀 안에 들 경우 — 독일(FIFA 강호)과 32강 격돌 예정
        </p>
      </div>

      {/* 경고 배너 */}
      <div
        style={{
          background: "rgba(250,204,21,0.08)",
          border: "1px solid rgba(250,204,21,0.25)",
          borderRadius: 10,
          padding: "0.65rem 1rem",
          marginBottom: "1.1rem",
          fontSize: "0.82rem",
          color: "var(--color-text)",
        }}
      >
        ⚠️ <strong>조건부 대진</strong> — 현재 한국은 3위 와일드카드 대기 중입니다. 다른 조 3위 결과에 따라 진출 여부가 결정됩니다.
        <br />
        <span className="muted">확률 추정: 약 55% (3pts · GD -1 기준)</span>
      </div>

      {/* 핵심 매치 정보 */}
      <h3 style={{ fontSize: "0.95rem", fontWeight: 800, margin: "0 0 0.5rem" }}>📋 예상 경기 정보</h3>
      <div className="table-wrap" style={{ marginBottom: "1.1rem" }}>
        <table className="data-table" style={{ fontSize: "0.82rem" }}>
          <tbody>
            {MATCH_FACTS.map((f) => (
              <tr key={f.label}>
                <td style={{ fontWeight: 700, color: "var(--color-muted)", whiteSpace: "nowrap" }}>{f.label}</td>
                <td>{f.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ELO 비교 바 */}
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12,
          padding: "0.9rem 1.1rem",
          marginBottom: "1.1rem",
        }}
      >
        <h3 style={{ fontSize: "0.9rem", fontWeight: 800, margin: "0 0 0.75rem" }}>⚖️ ELO 전력 비교</h3>
        {/* 독일 */}
        <div style={{ marginBottom: "0.6rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "0.25rem" }}>
            <span>🇩🇪 독일</span>
            <strong style={{ color: "#f87171" }}>1970</strong>
          </div>
          <div style={{ height: 12, background: "rgba(255,255,255,0.08)", borderRadius: 6, overflow: "hidden" }}>
            <div style={{ width: "98.5%", height: "100%", background: "linear-gradient(90deg, #991b1b, #dc2626)", borderRadius: 6 }} />
          </div>
        </div>
        {/* 한국 */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "0.25rem" }}>
            <span>🇰🇷 대한민국</span>
            <strong style={{ color: "#60a5fa" }}>1820</strong>
          </div>
          <div style={{ height: 12, background: "rgba(255,255,255,0.08)", borderRadius: 6, overflow: "hidden" }}>
            <div style={{ width: "91%", height: "100%", background: "linear-gradient(90deg, #1d4ed8, #3b82f6)", borderRadius: 6 }} />
          </div>
        </div>
        <p className="muted" style={{ fontSize: "0.75rem", margin: "0.5rem 0 0" }}>
          ELO 차이 약 150점 — 독일이 강세, 그러나 월드컵 단판 토너먼트에서는 이변 가능
        </p>
      </div>

      {/* 독일 핵심 선수 */}
      <h3 style={{ fontSize: "0.95rem", fontWeight: 800, margin: "0 0 0.5rem" }}>🇩🇪 독일 주요 선수</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.1rem" }}>
        {GERMANY_KEY_PLAYERS.map((p) => (
          <div
            key={p.name}
            style={{
              display: "flex",
              gap: "0.75rem",
              alignItems: "flex-start",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              padding: "0.5rem 0.75rem",
            }}
          >
            <span
              style={{
                background: "rgba(220,38,38,0.2)",
                color: "#fca5a5",
                borderRadius: 6,
                padding: "0.1rem 0.5rem",
                fontSize: "0.72rem",
                fontWeight: 700,
                whiteSpace: "nowrap",
                alignSelf: "center",
              }}
            >
              {p.pos}
            </span>
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.85rem" }}>
                {p.name} <span className="muted" style={{ fontWeight: 400, fontSize: "0.78rem" }}>({p.club})</span>
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--color-muted)" }}>{p.note}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 전술 포인트 */}
      <h3 style={{ fontSize: "0.95rem", fontWeight: 800, margin: "0 0 0.6rem" }}>🎯 관전 포인트</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem", marginBottom: "1rem" }}>
        {TACTICAL_NOTES.map((t) => (
          <div
            key={t.title}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              padding: "0.7rem 0.85rem",
            }}
          >
            <div style={{ fontWeight: 800, fontSize: "0.85rem", marginBottom: "0.3rem" }}>
              {t.icon} {t.title}
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--color-muted)", lineHeight: 1.5 }}>{t.body}</div>
          </div>
        ))}
      </div>

      {/* 역사 카드 — 2002 4강 */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(5,150,105,0.12) 0%, rgba(4,120,87,0.08) 100%)",
          border: "1px solid rgba(16,185,129,0.35)",
          borderRadius: 12,
          padding: "0.85rem 1.1rem",
        }}
      >
        <div style={{ fontWeight: 900, color: "#34d399", fontSize: "0.95rem", marginBottom: "0.4rem" }}>
          🏆 기억하세요 — 2002년 한일 월드컵 4강
        </div>
        <div style={{ fontSize: "0.83rem", color: "var(--color-text)", lineHeight: 1.6 }}>
          대한민국 <strong>2 - 1</strong> 독일 (2002년 6월 25일 · 서울 월드컵 경기장)
          <br />
          <span className="muted">
            차두리·홍명보·박지성의 경기. 오늘(6월 25일)은 그날과 같은 날짜입니다.
            역사가 반복될 수 있습니다 — 먼저 32강 진출을 확정 짓고 맞붙어야 합니다.
          </span>
        </div>
      </div>
    </section>
  );
}
