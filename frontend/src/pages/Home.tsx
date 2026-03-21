import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="page">
      <section className="hero">
        <h1>대한민국 축구 · 월드컵 허브</h1>
        <p>
          과거 본선 이력부터 2026 북중미 대회 준비, 한국 대표팀 선수 스탯까지 한곳에서 확인하세요. 백엔드는 FastAPI, 데이터는
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
          <p className="feature-card__desc">
            A조 하이라이트(1·2·3차전)·Elo 승률 스트립·킥오프 시각. 1차전 상대(UEFA 플레이오프 D) 전용 페이지로도
            이어집니다.
          </p>
        </Link>
        <Link to="/2026/playoff-d" className="feature-card">
          <div className="feature-card__icon">🏴</div>
          <h2 className="feature-card__title">A조 1차전 · 플레이오프 D</h2>
          <p className="feature-card__desc">
            UEFA 플레이오프 D 승자(미확정) 브리핑. 상대 확정 후 `.env` 설정으로 스쿼드·예시 11인을 채울 수 있습니다.
          </p>
        </Link>
        <Link to="/2026/korea/players" className="feature-card">
          <div className="feature-card__icon">👤</div>
          <h2 className="feature-card__title">한국 대표팀 데이터</h2>
          <p className="feature-card__desc">스쿼드·부상·클럽 시즌 통계 등 API-Football 기반 feature JSON.</p>
        </Link>
        <Link to="/2026/mexico" className="feature-card">
          <div className="feature-card__icon">🇲🇽</div>
          <h2 className="feature-card__title">멕시코 대표팀</h2>
          <p className="feature-card__desc">
            나무위키 요약 소개 + API 기반 예시 베스트 11(4-3-3). 2026 공동 개최국 El Tri.
          </p>
        </Link>
        <Link to="/2026/south-africa" className="feature-card">
          <div className="feature-card__icon">🇿🇦</div>
          <h2 className="feature-card__title">남아공 대표팀</h2>
          <p className="feature-card__desc">
            나무위키 요약 + Bafana Bafana 소개. API 기반 예시 베스트 11(4-3-3).
          </p>
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
        <span className="muted"> 가 필요합니다. 베스트 11 등 일부 기능은 </span>
        <code>OPENAI_API_KEY</code>
        <span className="muted"> 가 필요합니다.</span>
      </div>
    </div>
  );
}
