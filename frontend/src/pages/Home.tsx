import { useCallback } from "react";
import { Link } from "react-router-dom";
import AiInsightPanel from "../components/AiInsightPanel";
import MexicoDashboard from "../components/MexicoDashboard";
import ScorePredictionGame from "../components/ScorePredictionGame";
import { postAiHomeWelcome } from "../api/aiInsights";
import { useScrollReveal } from "../hooks/useScrollReveal";

export default function Home() {
  const fetchHomeWelcome = useCallback(() => postAiHomeWelcome(), []);

  // 스크롤 진입 애니메이션 refs
  const bannerRef = useScrollReveal<HTMLDivElement>();
  const aiRef     = useScrollReveal<HTMLDivElement>();
  const gridRef   = useScrollReveal<HTMLDivElement>();
  const predRef   = useScrollReveal<HTMLDivElement>();
  const hintRef   = useScrollReveal<HTMLDivElement>();

  return (
    <div className="page">
      <section className="hero">
        <p className="hero__kicker">
          <span className="hero__kicker-ico" aria-hidden>
            ✨
          </span>
          Korea NT · World Cup hub
        </p>
        <h1>
          <span className="hero__title-emoji" aria-hidden>
            🇰🇷
          </span>
          대한민국 축구 · 월드컵 허브
        </h1>
        <p>
          <strong style={{ color: "#fbbf24" }}>2차전 멕시코에 패배...</strong>{" "}
          하지만 아직 끝나지 않았습니다!{" "}
          <strong style={{ color: "#86efac" }}>6월 25일 남아공전 무승부 이상이면 16강 확정!</strong>
        </p>
        <div className="hero-chips">
          <span className="hero-chip">✅ 1차전 2-1 승 (체코)</span>
          <span className="hero-chip" style={{ background: "rgba(239,68,68,0.15)", borderColor: "#f87171", color: "#fca5a5" }}>❌ 2차전 패배 (멕시코)</span>
          <span className="hero-chip hero-chip--highlight">🔥 3차전 남아공 · D-6</span>
          <span className="hero-chip">🎟️ 무승부 이상 → 16강!</span>
        </div>
      </section>

      {/* 멕시코전 메인 대시보드 */}
      <div ref={bannerRef} className="scroll-reveal">
        <MexicoDashboard />
      </div>

      <div ref={aiRef} className="scroll-reveal scroll-reveal--d1">
        <AiInsightPanel
          title="AI · 오늘의 월드컵 허브 인사"
          description="OpenAI로 짧은 환영 멘트를 만듭니다. 버튼을 누를 때마다 새로 생성됩니다."
          fetchInsight={fetchHomeWelcome}
        />
      </div>

      <div ref={gridRef} className="scroll-reveal feature-grid">
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
        <Link to="/2026/korea" className="feature-card feature-card--korea">
          <div className="feature-card__icon">🎯</div>
          <h2 className="feature-card__title">2026 한국 대시보드</h2>
          <p className="feature-card__desc">
            A조 순위표·3경기 카운트다운·Elo 승률·킥오프 시각 등 한국 조별리그 중심 화면입니다.
          </p>
          <span className="feature-card__badge">⭐ 핵심</span>
        </Link>
        <Link to="/2026/korea/players" className="feature-card">
          <div className="feature-card__icon">👤</div>
          <h2 className="feature-card__title">한국 대표팀 데이터</h2>
          <p className="feature-card__desc">
            예시 23인 명단·감독 AI 포메이션(4-3-3·4-1-4-1 등)과 슬롯별 선정 이유.
          </p>
        </Link>
        <Link to="/2026/czech-republic" className="feature-card">
          <div className="feature-card__icon">🇨🇿</div>
          <h2 className="feature-card__title">체코 대표팀</h2>
          <p className="feature-card__desc">
            A조 1차전 상대. 예시 23인·감독 AI 포메이션·API 스쿼드(가능 시) + 나무위키 요약.
          </p>
        </Link>
        <Link to="/2026/mexico" className="feature-card">
          <div className="feature-card__icon">🇲🇽</div>
          <h2 className="feature-card__title">멕시코 대표팀</h2>
          <p className="feature-card__desc">
            A조 2차전 상대 (종료). 23인·감독 AI 포메이션·나무위키 요약. A조 1위 확정.
          </p>
        </Link>
        <Link to="/2026/south-africa" className="feature-card feature-card--korea">
          <div className="feature-card__icon">🇿🇦</div>
          <h2 className="feature-card__title">남아공 대표팀</h2>
          <p className="feature-card__desc">
            3차전 상대! 바파나 바파나 23인·포메이션 분석·나무위키 요약. 승리하면 16강 확정!
          </p>
          <span className="feature-card__badge">🔥 3차전</span>
        </Link>
        <Link to="/2026/korea/playground" className="feature-card feature-card--accent">
          <div className="feature-card__icon">🤖</div>
          <h2 className="feature-card__title">AI 놀이터</h2>
          <p className="feature-card__desc">
            내가 감독이라면·가상 에이스 매치업·편파 중계 시뮬 등 OpenAI로 즐기는 A조 맞춤 놀이 공간입니다.
          </p>
        </Link>
      </div>

      {/* 팬 스코어 예측 게임 */}
      <div ref={predRef} className="scroll-reveal scroll-reveal--d1">
        <ScorePredictionGame />
      </div>

      <div ref={hintRef} className="scroll-reveal scroll-reveal--d2 hint-card">
        <strong>로컬 실행</strong> — 백엔드 <code>http://localhost:8000</code> · API 문서{" "}
        <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer">
          /docs
        </a>
        <br />
        <span className="muted">2026 일정·선수 API는 </span>
        <code>API_FOOTBALL_KEY</code>
        <span className="muted"> 가 필요합니다.</span>
      </div>
    </div>
  );
}
