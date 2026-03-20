import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="page">
      <section className="hero">
        <h1>대한민국 축구 · 월드컵 허브</h1>
        <p>
          과거 본선 이력부터 2026 북중미 대회 준비, 국대 선수 스탯까지 한곳에서 확인하세요. 백엔드는 FastAPI, 데이터는
          API-Football 등 외부 소스와 연동됩니다.
        </p>
      </section>

      <div className="feature-grid">
        <Link to="/history/worldcup" className="feature-card">
          <div className="feature-card__icon">📜</div>
          <h2 className="feature-card__title">한국 월드컵 이력</h2>
          <p className="feature-card__desc">1954년부터 본선 기록, 최고 성적 4위(2002) 등 대회별 요약과 하이라이트.</p>
        </Link>
        <Link to="/2026/worldcup" className="feature-card">
          <div className="feature-card__icon">🌎</div>
          <h2 className="feature-card__title">2026 월드컵 개요</h2>
          <p className="feature-card__desc">
            북중미 3개국 개최, 48개국·104경기, 대회 형식·상징·시차 메모. 나무위키·FIFA 링크로 이어집니다.
          </p>
        </Link>
        <Link to="/2026/korea" className="feature-card">
          <div className="feature-card__icon">🎯</div>
          <h2 className="feature-card__title">2026 한국 대시보드</h2>
          <p className="feature-card__desc">일정·시나리오 브리핑·공식 데이터 비교·AI 의견·Elo 기반 승률 예측.</p>
        </Link>
        <Link to="/2026/korea/players" className="feature-card">
          <div className="feature-card__icon">👤</div>
          <h2 className="feature-card__title">국대 선수 데이터</h2>
          <p className="feature-card__desc">스쿼드·부상·클럽 시즌 통계 등 API-Football 기반 feature JSON.</p>
        </Link>
      </div>

      <div className="hint-card">
        <strong>로컬 실행</strong> — 백엔드 <code>http://localhost:8000</code> · API 문서{" "}
        <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer">
          /docs
        </a>
        <br />
        <span className="muted">2026 일정·선수 API는 </span>
        <code>API_FOOTBALL_KEY</code>
        <span className="muted"> 가 필요합니다. AI 의견은 </span>
        <code>OPENAI_API_KEY</code>
        <span className="muted"> 가 필요합니다.</span>
      </div>
    </div>
  );
}
