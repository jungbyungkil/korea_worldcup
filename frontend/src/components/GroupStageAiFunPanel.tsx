import { useCallback, useState } from "react";
import {
  postGroupMatchAiFun,
  type GroupMatchAiFunMode,
  type GroupMatchAiFunResponse,
  type GroupMatchAiOpponent,
} from "../api/worldcup2026";

export type GroupStageAiFunPanelProps = {
  opponent: GroupMatchAiOpponent;
  /** 예: "멕시코전 · AI 재미 패널" */
  panelTitle: string;
  opponentFlag: string;
  /** 짧은 상대 이름 (퍼센트 카드용) */
  opponentShortLabel: string;
  /** 스포트라이트 톤에 맞춘 버튼 그라데이션 */
  theme?: "mexico" | "south-africa";
};

function ResultBlock({
  result,
  opponentFlag,
  opponentShortLabel,
}: {
  result: GroupMatchAiFunResponse;
  opponentFlag: string;
  opponentShortLabel: string;
}) {
  if (result.mode === "probabilities") {
    return (
      <div className="mexico-ai-fun__card mexico-ai-fun__card--prob">
        <div className="mexico-ai-fun__pcts">
          <div className="mexico-ai-fun__pct mexico-ai-fun__pct--kr">
            <span className="mexico-ai-fun__pct-flag" aria-hidden>
              🇰🇷
            </span>
            <span className="mexico-ai-fun__pct-val">{result.korea_win_pct}%</span>
            <span className="mexico-ai-fun__pct-lbl">한국</span>
          </div>
          <div className="mexico-ai-fun__pct mexico-ai-fun__pct--draw">
            <span className="mexico-ai-fun__pct-flag" aria-hidden>
              🤝
            </span>
            <span className="mexico-ai-fun__pct-val">{result.draw_pct}%</span>
            <span className="mexico-ai-fun__pct-lbl">무</span>
          </div>
          <div className="mexico-ai-fun__pct mexico-ai-fun__pct--opp">
            <span className="mexico-ai-fun__pct-flag" aria-hidden>
              {opponentFlag}
            </span>
            <span className="mexico-ai-fun__pct-val">{result.opponent_win_pct}%</span>
            <span className="mexico-ai-fun__pct-lbl">{opponentShortLabel}</span>
          </div>
        </div>
        <p className="mexico-ai-fun__tagline">{result.tagline_ko}</p>
        <p className="mexico-ai-fun__disclaimer">{result.disclaimer_ko}</p>
      </div>
    );
  }

  if (result.mode === "headline") {
    return (
      <div className="mexico-ai-fun__card mexico-ai-fun__card--headline">
        <div className="mexico-ai-fun__headline-emoji" aria-hidden>
          {result.flair_emoji || "⚽"}
        </div>
        <p className="mexico-ai-fun__headline-title">{result.title_ko}</p>
        <p className="mexico-ai-fun__headline-sub">{result.subtitle_ko}</p>
      </div>
    );
  }

  return (
    <div className="mexico-ai-fun__card mexico-ai-fun__card--wildcard">
      <h4 className="mexico-ai-fun__wildcard-h">{result.card_title_ko}</h4>
      <ul className="mexico-ai-fun__wildcard-list">
        {result.bullets_ko.map((line, i) => (
          <li key={`${i}-${line.slice(0, 12)}`}>{line}</li>
        ))}
      </ul>
      <p className="mexico-ai-fun__twist">{result.twist_ko}</p>
    </div>
  );
}

const BTNS: { mode: GroupMatchAiFunMode; label: string; emoji: string; desc: string }[] = [
  { mode: "probabilities", label: "승·무·패 맛보기", emoji: "🎲", desc: "AI가 오늘 기분으로 % 뽑기" },
  { mode: "headline", label: "한 줄 헤드라인", emoji: "📰", desc: "SNS 각 잡은 카피" },
  { mode: "wildcard", label: "관전 랜덤 카드", emoji: "🃏", desc: "포인트 3개 + 반전 한 줄" },
];

export default function GroupStageAiFunPanel({
  opponent,
  panelTitle,
  opponentFlag,
  opponentShortLabel,
  theme = "mexico",
}: GroupStageAiFunPanelProps) {
  const [loading, setLoading] = useState<GroupMatchAiFunMode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GroupMatchAiFunResponse | null>(null);

  const run = useCallback(
    async (mode: GroupMatchAiFunMode) => {
      setLoading(mode);
      setError(null);
      try {
        const data = await postGroupMatchAiFun(mode, opponent);
        setResult(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "알 수 없는 오류");
        setResult(null);
      } finally {
        setLoading(null);
      }
    },
    [opponent],
  );

  const rootClass =
    theme === "south-africa" ? "mexico-ai-fun mexico-ai-fun--south-africa" : "mexico-ai-fun";

  return (
    <div className={rootClass}>
      <div className="mexico-ai-fun__intro">
        <span className="mexico-ai-fun__spark" aria-hidden>
          ✨
        </span>
        <div>
          <strong className="mexico-ai-fun__title">{panelTitle}</strong>
          <p className="mexico-ai-fun__sub">공식 예측이 아니라, 클릭 한 번에 분위기 타보는 용도예요.</p>
        </div>
      </div>

      <div className="mexico-ai-fun__btns" role="group" aria-label="AI 재미 카드 종류">
        {BTNS.map(({ mode, label, emoji, desc }) => {
          const busy = loading === mode;
          return (
            <button
              key={mode}
              type="button"
              className="mexico-ai-fun__btn"
              disabled={loading !== null}
              onClick={() => void run(mode)}
              title={desc}
            >
              <span className="mexico-ai-fun__btn-emoji" aria-hidden>
                {busy ? "⏳" : emoji}
              </span>
              <span className="mexico-ai-fun__btn-label">{busy ? "생성 중…" : label}</span>
              <span className="mexico-ai-fun__btn-desc">{desc}</span>
            </button>
          );
        })}
      </div>

      {error ? <p className="mexico-ai-fun__err">{error}</p> : null}
      {result ? (
        <ResultBlock
          result={result}
          opponentFlag={opponentFlag}
          opponentShortLabel={opponentShortLabel}
        />
      ) : null}
    </div>
  );
}
