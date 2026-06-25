import { useState } from "react";

/** 32강 와일드카드 진출 여부 예언 */
const PREDICTIONS = [
  {
    verdict: "진출",
    emoji: "🎟️",
    headline: "32강 진출 확정!",
    score: "와일드카드 TOP 8",
    msg: "문어님 왈: \"다른 조 3위들이 줄줄이 무너진다! 한국, 극적으로 와일드카드 8위 안에 들어 32강 진출!\"",
    color: "#059669",
    border: "#34d399",
    bg: "linear-gradient(135deg, #064e3b, #047857)",
    nextTitle: "다음 상대는 🇩🇪 독일",
    nextDesc: "32강에서 독일을 만난다. 2002의 기적이 다시?",
  },
  {
    verdict: "진출",
    emoji: "🔥",
    headline: "극적 와일드카드 진출!",
    score: "GD 경쟁 통과",
    msg: "문어님 왈: \"득실차로 아슬아슬하게 통과! 8위 안에 딱 들어간다. 독일과의 32강이 기다린다!\"",
    color: "#0284c7",
    border: "#38bdf8",
    bg: "linear-gradient(135deg, #0c4a6e, #0369a1)",
    nextTitle: "🇩🇪 독일 32강 대결!",
    nextDesc: "ELO 150점 차이를 뒤집을 수 있을까? 2002 4강의 기억이 있다.",
  },
  {
    verdict: "진출",
    emoji: "⭐",
    headline: "당당히 32강 진출!",
    score: "3pts · 상위 8팀 입성",
    msg: "문어님 왈: \"3점이지만 충분하다! 한국의 득실차가 다른 3위 팀들보다 나아서 당당하게 32강 티켓 획득!\"",
    color: "#7c3aed",
    border: "#a78bfa",
    bg: "linear-gradient(135deg, #2e1065, #5b21b6)",
    nextTitle: "독일과 한판!",
    nextDesc: "손흥민, 황희찬, 이강인의 총출동으로 독일의 벽에 도전한다.",
  },
  {
    verdict: "탈락",
    emoji: "💔",
    headline: "아쉽게 탈락...",
    score: "9위 이하",
    msg: "문어님 왈: \"너무 아쉽다... 다른 조 3위 팀들이 선전하면서 한국이 32강에 한 발 모자랐다. 4년 뒤를 기약하자.\"",
    color: "#b91c1c",
    border: "#f87171",
    bg: "linear-gradient(135deg, #7f1d1d, #991b1b)",
    nextTitle: null,
    nextDesc: null,
  },
  {
    verdict: "탈락",
    emoji: "😢",
    headline: "GD 1골 차이 탈락",
    score: "9위 (득실차 열세)",
    msg: "문어님 왈: \"득실차 딱 1골 차이로 탈락... 남아공전에서 1골을 더 넣었다면 달라졌을 텐데. 이게 축구의 잔인함이다.\"",
    color: "#b45309",
    border: "#fbbf24",
    bg: "linear-gradient(135deg, #451a03, #78350f)",
    nextTitle: null,
    nextDesc: null,
  },
];

const OCTOPUS_FRAMES = ["🐙", "💫", "🌊", "🐙", "✨", "🌊"];

export default function OctopusOracle() {
  const [revealed, setRevealed] = useState<typeof PREDICTIONS[0] | null>(null);
  const [animating, setAnimating] = useState(false);
  const [frame, setFrame] = useState(0);

  function predict() {
    if (animating) return;
    setAnimating(true);
    setRevealed(null);
    let i = 0;
    const iv = setInterval(() => {
      setFrame((f) => (f + 1) % OCTOPUS_FRAMES.length);
      i++;
      if (i >= 10) {
        clearInterval(iv);
        const pick = PREDICTIONS[Math.floor(Math.random() * PREDICTIONS.length)];
        setRevealed(pick);
        setAnimating(false);
      }
    }, 130);
  }

  return (
    <div className="panel" style={{ textAlign: "center", padding: "1.5rem" }}>
      <h3 className="panel-title" style={{ marginBottom: "0.25rem" }}>
        🐙 문어의 예언 · 32강 와일드카드 진출?
      </h3>
      <p className="muted" style={{ fontSize: "0.85rem", marginTop: 0, marginBottom: "1.25rem" }}>
        파울 선생님의 영광을 잇는 신비의 문어 — 한국의 32강 와일드카드 운명을 예언합니다
      </p>

      <div
        style={{
          fontSize: "4rem",
          lineHeight: 1,
          marginBottom: "1rem",
          transition: "transform 0.12s",
          transform: animating ? "rotate(20deg) scale(1.2)" : "none",
          display: "inline-block",
        }}
        aria-hidden
      >
        {animating ? OCTOPUS_FRAMES[frame] : "🐙"}
      </div>

      {revealed && !animating && (
        <div
          style={{
            background: revealed.bg,
            border: `2px solid ${revealed.border}`,
            borderRadius: 14,
            padding: "1.1rem 1.5rem",
            marginBottom: "1rem",
            color: "#fff",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.2rem" }}>{revealed.emoji}</div>
          <div style={{ fontWeight: 900, fontSize: "1.3rem", marginBottom: "0.2rem" }}>
            {revealed.headline}
          </div>
          <div
            style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.15)",
              borderRadius: 20,
              padding: "0.2rem 0.85rem",
              fontSize: "0.82rem",
              fontWeight: 800,
              marginBottom: "0.75rem",
              border: `1px solid ${revealed.border}`,
            }}
          >
            {revealed.verdict === "진출" ? "🎟️" : "💔"} {revealed.score}
          </div>
          <p style={{ margin: "0 0 0.75rem", fontSize: "0.88rem", fontStyle: "italic", opacity: 0.92, lineHeight: 1.55 }}>
            {revealed.msg}
          </p>
          {revealed.nextTitle && (
            <div
              style={{
                background: "rgba(0,0,0,0.2)",
                borderRadius: 10,
                padding: "0.6rem 0.9rem",
                fontSize: "0.82rem",
                border: `1px solid rgba(255,255,255,0.15)`,
              }}
            >
              <strong>{revealed.nextTitle}</strong>
              <br />
              <span style={{ opacity: 0.8 }}>{revealed.nextDesc}</span>
            </div>
          )}
        </div>
      )}

      {!revealed && !animating && (
        <div style={{ height: "2rem", marginBottom: "1rem" }} />
      )}

      <button
        className="btn btn-primary"
        onClick={predict}
        disabled={animating}
        style={{ fontSize: "1rem", padding: "0.65rem 2rem" }}
      >
        {animating ? "🌊 예언 중..." : "🐙 와일드카드 운명 예언 받기"}
      </button>

      <p className="muted" style={{ fontSize: "0.75rem", marginTop: "0.75rem" }}>
        * 재미로만 즐기는 팬 예언 기능입니다. 실제 결과와 무관합니다 :)
      </p>
    </div>
  );
}
