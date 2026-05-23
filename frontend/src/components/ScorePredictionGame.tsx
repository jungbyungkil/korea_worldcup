import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "wc2026_korea_predictions_v1";

interface MatchPrediction {
  koreaScore: number;
  oppScore: number;
  savedAt?: string;
}

interface Predictions {
  czech: MatchPrediction;
  mexico: MatchPrediction;
  southAfrica: MatchPrediction;
}

const DEFAULT_PREDICTIONS: Predictions = {
  czech: { koreaScore: 2, oppScore: 0 },
  mexico: { koreaScore: 1, oppScore: 1 },
  southAfrica: { koreaScore: 2, oppScore: 0 },
};

const MATCHES = [
  {
    key: "czech" as const,
    label: "A조 1차전",
    date: "2026-06-12 (KST 11:00)",
    opponent: "체코",
    opponentFlag: "🇨🇿",
    variant: "czech",
    kickoffIso: "2026-06-12T02:00:00.000Z",
  },
  {
    key: "mexico" as const,
    label: "A조 2차전",
    date: "2026-06-19 (KST 10:00)",
    opponent: "멕시코",
    opponentFlag: "🇲🇽",
    variant: "mexico",
    kickoffIso: "2026-06-19T01:00:00.000Z",
  },
  {
    key: "southAfrica" as const,
    label: "A조 3차전",
    date: "2026-06-25 (KST 10:00)",
    opponent: "남아공",
    opponentFlag: "🇿🇦",
    variant: "south-africa",
    kickoffIso: "2026-06-25T01:00:00.000Z",
  },
];

function loadPredictions(): Predictions {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREDICTIONS };
    return JSON.parse(raw) as Predictions;
  } catch {
    return { ...DEFAULT_PREDICTIONS };
  }
}

function savePredictions(p: Predictions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // ignore
  }
}

function resultLabel(kr: number, opp: number): { text: string; cls: string } {
  if (kr > opp) return { text: "승", cls: "pred-result--win" };
  if (kr === opp) return { text: "무", cls: "pred-result--draw" };
  return { text: "패", cls: "pred-result--loss" };
}

function ScoreSelector({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="score-selector">
      <button
        type="button"
        className="score-selector__btn"
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={disabled || value <= 0}
        aria-label="1 감소"
      >
        −
      </button>
      <span className="score-selector__val">{value}</span>
      <button
        type="button"
        className="score-selector__btn"
        onClick={() => onChange(Math.min(20, value + 1))}
        disabled={disabled || value >= 20}
        aria-label="1 증가"
      >
        +
      </button>
    </div>
  );
}

export default function ScorePredictionGame() {
  const [preds, setPreds] = useState<Predictions>(() => loadPredictions());
  const [saved, setSaved] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 저장 완료 토스트 자동 해제
  useEffect(() => {
    if (!saved) return;
    const id = window.setTimeout(() => setSaved(false), 2000);
    return () => window.clearTimeout(id);
  }, [saved]);

  function update(key: keyof Predictions, field: "koreaScore" | "oppScore", val: number) {
    setPreds((prev) => ({ ...prev, [key]: { ...prev[key], [field]: val } }));
  }

  function handleSave() {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    const now = new Date().toISOString();
    const withTime: Predictions = {
      czech: { ...preds.czech, savedAt: now },
      mexico: { ...preds.mexico, savedAt: now },
      southAfrica: { ...preds.southAfrica, savedAt: now },
    };
    savePredictions(withTime);
    setPreds(withTime);
    setSaved(true);
  }

  function handleReset() {
    const fresh = { ...DEFAULT_PREDICTIONS };
    setPreds(fresh);
    savePredictions(fresh);
  }

  function handleCopy() {
    const lines = MATCHES.map((m) => {
      const pred = preds[m.key];
      const res = resultLabel(pred.koreaScore, pred.oppScore);
      return `${m.label}: 🇰🇷 한국 ${pred.koreaScore}:${pred.oppScore} ${m.opponentFlag}${m.opponent} (${res.text})`;
    });
    const text = ["[2026 월드컵 A조 내 예측]", ...lines, ""].join("\n");
    navigator.clipboard?.writeText(text).then(() => setSaved(true)).catch(() => {});
  }

  // 완료된 경기는 읽기전용(킥오프 이후) 처리
  const nowMs = Date.now();

  return (
    <section className="pred-game panel">
      <h2 className="panel-title pred-game__title">⚽ 팬 스코어 예측</h2>
      <p className="muted pred-game__desc">
        대한민국 A조 3경기 예상 스코어를 입력하고 저장하세요. 결과는 내 기기에만 저장됩니다.
      </p>

      <div className="pred-game__cards">
        {MATCHES.map((m) => {
          const pred = preds[m.key];
          const isEnded = new Date(m.kickoffIso).getTime() < nowMs;
          const res = resultLabel(pred.koreaScore, pred.oppScore);
          return (
            <div key={m.key} className={`pred-card pred-card--${m.variant}${isEnded ? " pred-card--ended" : ""}`}>
              <div className="pred-card__header">
                <span className="pred-card__label">{m.label}</span>
                <span className="pred-card__date">{m.date}</span>
              </div>
              <div className="pred-card__matchup">
                <span className="pred-card__team">
                  <span aria-hidden>🇰🇷</span> 한국
                </span>
                <div className="pred-card__scores">
                  <ScoreSelector
                    value={pred.koreaScore}
                    onChange={(v) => update(m.key, "koreaScore", v)}
                    disabled={isEnded}
                  />
                  <span className="pred-card__colon">:</span>
                  <ScoreSelector
                    value={pred.oppScore}
                    onChange={(v) => update(m.key, "oppScore", v)}
                    disabled={isEnded}
                  />
                </div>
                <span className="pred-card__team pred-card__team--opp">
                  <span aria-hidden>{m.opponentFlag}</span> {m.opponent}
                </span>
              </div>
              <div className="pred-card__result">
                <span className={`pred-result ${res.cls}`}>{res.text}</span>
                {pred.savedAt ? (
                  <span className="pred-card__saved-at muted">
                    저장: {new Date(pred.savedAt).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                ) : null}
              </div>
              {isEnded ? (
                <p className="pred-card__ended-note muted">킥오프 이후 — 수정 불가</p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="pred-game__actions">
        <button type="button" className="btn btn-primary" onClick={handleSave}>
          {saved ? "✓ 저장 완료!" : "예측 저장"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleCopy} title="예측 텍스트 클립보드 복사">
          📋 복사
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleReset}>
          초기화
        </button>
      </div>

      <p className="muted pred-game__hint">
        💡 예측은 브라우저 로컬스토리지에 저장됩니다. 다른 기기에서는 보이지 않습니다.
      </p>
    </section>
  );
}
