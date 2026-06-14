import { useState } from "react";

const PREDICTIONS = [
  { score: "2 - 1", verdict: "승리", emoji: "🏆", msg: "문어님 왈: \"한국이 체코전 기세를 이어간다! 이번엔 멕시코 원정도 문제없어!\"" },
  { score: "1 - 0", verdict: "승리", emoji: "🔥", msg: "문어님 왈: \"수비 집중, 한 방! 조직력으로 개최국을 잠재운다.\"" },
  { score: "2 - 0", verdict: "승리", emoji: "💪", msg: "문어님 왈: \"1998·2014 징크스 완전 파괴! 역사를 새로 쓴다!\"" },
  { score: "1 - 1", verdict: "무승부", emoji: "🤝", msg: "문어님 왈: \"양 팀 모두 조심스럽게... 그래도 포인트 하나는 챙긴다.\"" },
  { score: "3 - 2", verdict: "승리", emoji: "🎉", msg: "문어님 왈: \"스릴 넘치는 명승부! 한국이 극적으로 뒤집는다!\"" },
  { score: "2 - 2", verdict: "무승부", emoji: "⚡", msg: "문어님 왈: \"치열한 접전 끝에 무승부. 남아공전 승리면 16강 확정!\"" },
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
      ? "#b45309"
      : "#b91c1c";

  return (
    <div className="panel" style={{ textAlign: "center", padding: "1.5rem" }}>
      <h3 className="panel-title" style={{ marginBottom: "0.25rem" }}>
        🐙 문어의 예언 · 멕시코전
      </h3>
      <p className="muted" style={{ fontSize: "0.85rem", marginTop: 0, marginBottom: "1.25rem" }}>
        파울 선생님의 영광을 이을 신비의 문어가 예언을 내립니다
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
            background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)",
            border: "2px solid #6ee7b7",
            borderRadius: 12,
            padding: "1rem 1.5rem",
            marginBottom: "1rem",
            animation: "fadeInUp 0.4s ease",
          }}
        >
          <div style={{ fontSize: "2.5rem", fontWeight: 900, letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
            🇰🇷 {revealed.score} 🇲🇽
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
