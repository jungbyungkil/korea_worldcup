import { useCallback, useEffect, useRef, useState } from "react";
import type { AiInsightPayload } from "../api/aiInsights";
import { humanizeAiInsightError } from "../api/aiInsights";

type Props = {
  title: string;
  description?: string;
  fetchInsight: () => Promise<AiInsightPayload>;
  className?: string;
  /** true면 첫 마운트 시 자동 1회 호출 */
  autoRun?: boolean;
};

export default function AiInsightPanel({ title, description, fetchInsight, className = "", autoRun = false }: Props) {
  const [loading, setLoading] = useState(autoRun);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<AiInsightPayload | null>(null);
  const didAuto = useRef(false);

  const run = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      setData(await fetchInsight());
    } catch (e) {
      setData(null);
      setErr(humanizeAiInsightError(e));
    } finally {
      setLoading(false);
    }
  }, [fetchInsight]);

  useEffect(() => {
    if (!autoRun || didAuto.current) return;
    didAuto.current = true;
    void run();
  }, [autoRun, run]);

  return (
    <section className={`panel ai-insight-panel ${className}`.trim()}>
      <div className="ai-insight-panel__head">
        <h2 className="panel-title ai-insight-panel__title">{title}</h2>
        <span className="ai-insight-panel__badge" title="OpenAI API">
          <span className="ai-insight-panel__badge-ico" aria-hidden>
            ✨
          </span>
          GPT
        </span>
      </div>
      {description ? (
        <p className="muted ai-insight-panel__desc" style={{ marginTop: 0, fontSize: "0.88rem", lineHeight: 1.55 }}>
          {description}
        </p>
      ) : null}
      <div className="ai-insight-panel__actions">
        <button type="button" className="btn btn-primary" disabled={loading} onClick={() => void run()}>
          <span className="btn__emoji" aria-hidden>
            {loading ? "⏳" : "✨"}
          </span>
          {loading ? "생성 중…" : data ? "다시 생성" : "AI로 생성"}
        </button>
      </div>
      {err ? <p className="text-error ai-insight-panel__err">{err}</p> : null}
      {data ? (
        <>
          <ul className="ai-insight-panel__lines">
            {data.lines_ko.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
          <p className="muted ai-insight-panel__disclaimer">{data.disclaimer_ko}</p>
        </>
      ) : null}
    </section>
  );
}
