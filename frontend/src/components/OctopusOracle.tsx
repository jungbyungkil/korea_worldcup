import { useState } from "react";

const PREDICTIONS = [
  { score: "2 - 0", verdict: "승리", emoji: "🏆", msg: "문어님 왈: \"한국이 남아공을 완벽하게 제압! 승점 6점으로 당당히 16강 진출!\"" },
  { score: "1 - 0", verdict: "승리", emoji: "🔥", msg: "문어님 왈: \"수비 단단히, 한 방으로 결정! 16강 티켓 당당히 따낸다!\"" },
  { score: "2 - 1", verdict: "승리", emoji: "💪", msg: "문어님 왈: \"긴장의 연속이지만 결국 한국이 웃는다. 극적 역전 16강!\"" },
  { score: "1 - 1", verdict: "무승부", emoji: "🤝", msg: "문어님 왈: \"가슴 졸이는 무승부지만 충분해! H2H 우위로 16강 확정!\"" },
  { score: "0 - 0", verdict: "무승부", emoji: "🛡️", msg: "문어님 왈: \"무실점 무승부로 안전하게 16강! 수비가 한국을 구한다.\"" },
  { score: "3 - 1", verdict: "승리", emoji: "🎉", msg: "문어님 왈: \"대폭발! 손흥민·황희찬이 빛을 발하며 통쾌한 16강 진출!\"" },
];

const OCTOPUS_FRAMES = ["🐙", "💫", "🌊", "🐙"];

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
      if (i >= 8) {
        clearInterval(iv);
        const pick = PREDICTIONS[Math.floor(Math.random() * PREDICTIONS.length)];
        setRevealed(pick);
        setAnimating(false);
      }
    }, 150);
  }

  const verdictColor =
    revealed?.verdict === "승리"
      ? "#047857"
      : revealed?.verdict === "무승부"
      ? "#1d4ed8"
      : "#b91c1c";

  return (
    <div className="panel" style={{ textAlign: "center", padding: "1.5rem" }}>
      <h3 className="panel-title" style={{ marginBottom: "0.25rem" }}>
        🐙 문어의 예언 · 남아공전 16강 결정전
      </h3>
      <p className="muted" style={{ fontSize: "0.85rem", marginTop: 0, marginBottom: "1.25rem" }}>
        파울 선생님의 영광을 이을 신비의 문어가 3차전 결과를 예언합니다
      </p>

      <div
        style={{
          fontSize: "4rem",
          lineHeight: 1,
          marginBottom: "1rem",
          transition: "transform 0.15s",
          transform: animating ? "rotate(15deg) scale(1.15)" : "none",
          display: "inline-block",
        }}
        aria-hidden
      >
        {animating ? OCTOPUS_FRAMES[frame] : "🐙"}
      </div>

      {revealed && !animating && (
        <div
          style={{
            background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
            border: "2px solid #93c5fd",
            borderRadius: 12,
            padding: "1rem 1.5rem",
            marginBottom: "1rem",
            animation: "fadeInUp 0.4s ease",
          }}
        >
          <div style={{ fontSize: "2.5rem", fontWeight: 900, letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
            🇰🇷 {revealed.score} 🇿🇦
          </div>
          <div
            style={{
              fontSize: "1.1rem",
              fontWeight: 800,
              color: verdictColor,
              marginBottom: "0.5rem",
            }}
          >
            {revealed.emoji} 한국 {revealed.verdict}
          </div>
          {(revealed.verdict === "승리" || revealed.verdict === "무승부") && (
            <div
              style={{
                display: "inline-block",
                background: "#1d4ed8",
                color: "#fff",
                borderRadius: 20,
                padding: "0.2rem 0.85rem",
                fontSize: "0.82rem",
                fontWeight: 800,
                marginBottom: "0.5rem",
              }}
            >
              🎟️ 16강 진출!
            </div>
          )}
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#374151", fontStyle: "italic" }}>
            {revealed.msg}
          </p>
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
        {animating ? "🌊 예언 중..." : "🐙 예언 받기"}
      </button>

      <p className="muted" style={{ fontSize: "0.75rem", marginTop: "0.75rem" }}>
        * 재미로만 즐기는 팬 예언 기능입니다 :)
      </p>
    </div>
  );
}
