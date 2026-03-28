import { Link } from "react-router-dom";
import CoreSquadSection from "../components/CoreSquadSection";

/**
 * 한국 대표팀 — 앱에 포함된 예시 23인 + 감독 AI 포메이션 (API-Football 불필요).
 */
export default function PlayerFeatures() {
  return (
    <main className="page">
      <h1 className="page-title">한국 대표팀 데이터</h1>
      <p className="page-lead">
        아래는 <strong>예시 23인 명단</strong>과 OpenAI 기반 <strong>포메이션별 베스트 11·슬롯별 선정 이유</strong>입니다.
        실제 본선 명단·공식 발표와 다를 수 있으며 참고·놀이용입니다.
      </p>

      <CoreSquadSection teamKey="korea" headingPrefix="한국 대표팀" />

      <p className="muted" style={{ marginTop: "1.5rem", fontSize: "0.9rem" }}>
        <Link to="/2026/korea">2026 한국 대시보드</Link>
        {" · "}
        <Link to="/2026/mexico">멕시코 대표</Link>
        {" · "}
        <Link to="/2026/south-africa">남아공 대표</Link>
      </p>
    </main>
  );
}
