import { useCallback } from "react";
import { Link } from "react-router-dom";
import { postAiKoreaNtStory } from "../api/aiInsights";
import AiInsightPanel from "../components/AiInsightPanel";
import CoreSquadSection from "../components/CoreSquadSection";

/**
 * 한국 대표팀 — 앱에 포함된 예시 23인 + 감독 AI 포메이션 (API-Football 불필요).
 */
export default function PlayerFeatures() {
  const fetchNt = useCallback(() => postAiKoreaNtStory(), []);

  return (
    <main className="page">
      <h1 className="page-title">한국 대표팀 데이터</h1>
      <p className="page-lead">
        아래는 <strong>2026-05-16 홍명보 감독 발표 확정 26인 명단</strong>과 AI 기반 <strong>포메이션별 베스트 11·슬롯별 선정 이유</strong>입니다.
        등번호·나이는 참고값이며, 공식 발표·경기 직전 최종 명단을 함께 확인하세요.
      </p>

      <AiInsightPanel
        title="AI · 2026 향하는 한국 대표팀"
        description="본선을 앞둔 내러티브를 팬 톤으로 짧게 써 봅니다."
        fetchInsight={fetchNt}
      />

      <CoreSquadSection teamKey="korea" headingPrefix="한국 대표팀" />

      <p className="muted" style={{ marginTop: "1.5rem", fontSize: "0.9rem" }}>
        <Link to="/2026/korea">2026 한국 대시보드</Link>
        {" · "}
        <Link to="/2026/czech-republic">체코 대표</Link>
        {" · "}
        <Link to="/2026/mexico">멕시코 대표</Link>
        {" · "}
        <Link to="/2026/south-africa">남아공 대표</Link>
      </p>
    </main>
  );
}
