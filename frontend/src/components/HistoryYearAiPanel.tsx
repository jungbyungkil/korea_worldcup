import { useCallback, useMemo, useState } from "react";
import type { KoreaWorldCupTournament } from "../api/history";
import { postAiHistoryYear } from "../api/aiInsights";
import AiInsightPanel from "./AiInsightPanel";

type Props = {
  tournaments: KoreaWorldCupTournament[];
};

export default function HistoryYearAiPanel({ tournaments }: Props) {
  const sorted = useMemo(() => [...tournaments].sort((a, b) => b.year - a.year), [tournaments]);
  const [year, setYear] = useState<number>(() => sorted[0]?.year ?? 0);
  const row = useMemo(() => sorted.find((t) => t.year === year) ?? sorted[0], [sorted, year]);

  const fetcher = useCallback(() => {
    if (!row) {
      return Promise.reject(new Error("이력 데이터가 없습니다."));
    }
    return postAiHistoryYear({
      year: row.year,
      host: row.host,
      result_label: row.result_label,
      highlights: row.highlights,
    });
  }, [row]);

  if (!sorted.length || !row) return null;

  return (
    <div className="history-year-ai-wrap">
      <label className="history-year-ai__label">
        <span className="history-year-ai__label-text">AI 감상용 대회 선택</span>
        <select
          className="history-year-ai__select"
          value={row.year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {sorted.map((t) => (
            <option key={t.year} value={t.year}>
              {t.year}년 ({t.host}) · {t.result_label}
            </option>
          ))}
        </select>
      </label>
      <AiInsightPanel
        key={row.year}
        title="AI · 그해 월드컵 감상"
        description="표에 있는 요약을 바탕으로 팬 톤의 짧은 감상을 만듭니다. 사실 관계는 원문·공식 기록을 확인하세요."
        fetchInsight={fetcher}
      />
    </div>
  );
}
