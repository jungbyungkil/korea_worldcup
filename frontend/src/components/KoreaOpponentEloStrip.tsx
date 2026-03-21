import { useCallback, useEffect, useState } from "react";
import { postWinProbability, type WinProbabilityResponse } from "../api/worldcup2026";

export type EloStripVisualVariant = "mexico" | "south-africa";

type Props = {
  /** `postWinProbability`에 넘기는 상대 이름 (백엔드 Elo 키와 맞출 것) */
  opponentQuery: string;
  opponentFlag: string;
  /** 접근성·라벨용 */
  opponentNameKo: string;
  visualVariant: EloStripVisualVariant;
};

/**
 * 스포트라이트 하단 · 한국 vs 지정 상대 Elo 승률 스트립
 */
export default function KoreaOpponentEloStrip({ opponentQuery, opponentFlag, opponentNameKo, visualVariant }: Props) {
  const [prediction, setPrediction] = useState<WinProbabilityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPred = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await postWinProbability({ opponent: opponentQuery });
      setPrediction(res);
    } catch (e) {
      setPrediction(null);
      setError(e instanceof Error ? e.message : "오류");
    } finally {
      setLoading(false);
    }
  }, [opponentQuery]);

  useEffect(() => {
    void fetchPred();
  }, [fetchPred]);

  const winPct = prediction ? Math.round(prediction.probability.win * 1000) / 10 : 0;
  const otherPct = prediction ? Math.round(prediction.probability.draw_or_loss * 1000) / 10 : 0;
  const krElo = prediction?.features.team_elo;
  const oppElo = prediction?.features.opponent_elo;
  const diff = prediction?.features.elo_diff;

  const rootClass = `spotlight-elo-strip spotlight-elo-strip--${visualVariant}`;

  return (
    <div className={rootClass} aria-label={`대한민국 대 ${opponentNameKo} Elo 승률`}>
      <div className="spotlight-elo-strip__label">
        <span>Elo 승률 시뮬</span>
        <button type="button" className="spotlight-elo-strip__refresh" onClick={() => void fetchPred()} disabled={loading} title="다시 계산">
          {loading ? "…" : "↻"}
        </button>
      </div>
      <div className="spotlight-elo-strip__row">
        <span className="spotlight-elo-strip__side">
          <span aria-hidden>🇰🇷</span> <strong>{krElo ?? (loading ? "…" : "—")}</strong>
        </span>
        <div className="spotlight-elo-strip__bar-wrap">
          <div className="spotlight-elo-strip__bar">
            {prediction ? (
              <>
                <div className="spotlight-elo-strip__seg spotlight-elo-strip__seg--kr" style={{ width: `${winPct}%` }} />
                <div className="spotlight-elo-strip__seg spotlight-elo-strip__seg--opp" style={{ width: `${otherPct}%` }} />
              </>
            ) : (
              <div className="spotlight-elo-strip__bar-ph" />
            )}
          </div>
        </div>
        <span className="spotlight-elo-strip__side spotlight-elo-strip__side--right">
          <strong>{oppElo ?? (loading ? "…" : "—")}</strong> <span aria-hidden>{opponentFlag}</span>
        </span>
      </div>
      <div className="spotlight-elo-strip__pct">
        {prediction ? (
          <>
            <span className="spotlight-elo-strip__pct-kr">한국 승 {winPct}%</span>
            <span className="spotlight-elo-strip__sep">·</span>
            <span className="spotlight-elo-strip__pct-opp">무·패 {otherPct}%</span>
            {diff != null ? (
              <span className="spotlight-elo-strip__diff"> (Δ {diff > 0 ? `+${diff}` : diff})</span>
            ) : null}
          </>
        ) : loading ? (
          <span className="spotlight-elo-strip__muted">계산 중…</span>
        ) : (
          <span className="spotlight-elo-strip__muted">—</span>
        )}
      </div>
      {error ? <p className="spotlight-elo-strip__err">{error}</p> : null}
      <p className="spotlight-elo-strip__hint">통계 모델(Elo)·생성형 AI 아님 · 상대: {opponentNameKo}</p>
    </div>
  );
}
