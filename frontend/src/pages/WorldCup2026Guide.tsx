import { useState } from "react";
import { Link } from "react-router-dom";
import { postAiFunStep3Guide, type AiFunStep3AGroup, type AiFunStep3Glossary } from "../api/worldcup2026";

const NAMU_WIKI_URL =
  "https://namu.wiki/w/2026%20FIFA%20%EC%9B%94%EB%93%9C%EC%BB%B5";
const FIFA_URL =
  "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026";

function GuideAiStep3Panel() {
  const [term, setTerm] = useState("오프사이드");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [out, setOut] = useState<AiFunStep3AGroup | AiFunStep3Glossary | null>(null);

  const runA = async () => {
    setLoading(true);
    setErr(null);
    setOut(null);
    try {
      setOut(await postAiFunStep3Guide({ kind: "a_group_qa" }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "오류");
    } finally {
      setLoading(false);
    }
  };

  const runG = async () => {
    setLoading(true);
    setErr(null);
    setOut(null);
    try {
      setOut(await postAiFunStep3Guide({ kind: "glossary", term: term.trim() || "오프사이드" }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "오류");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel ai-seven-panel">
      <h2 className="panel-title">③ AI · A조 입문 Q&amp;A / 용어</h2>
      <p className="muted" style={{ marginTop: 0, fontSize: "0.88rem" }}>
        2026 대회 맥락의 가벼운 설명입니다. 일정·명단은 공식 발표를 확인하세요.
      </p>
      <div className="ai-seven-btn-row">
        <button type="button" className="btn btn-primary" disabled={loading} onClick={() => void runA()}>
          A조 입문 Q&amp;A 생성
        </button>
      </div>
      <div className="ai-seven-row" style={{ marginTop: "0.75rem" }}>
        <label className="ai-seven-label">
          용어 검색
          <input className="ai-seven-input" value={term} onChange={(e) => setTerm(e.target.value)} />
        </label>
        <button type="button" className="btn btn-secondary" disabled={loading} onClick={() => void runG()}>
          용어 풀이
        </button>
      </div>
      {loading ? <p className="muted">생성 중…</p> : null}
      {err ? <p className="text-error">{err}</p> : null}
      {out && out.kind === "a_group_qa" ? (
        <ul className="ai-seven-faq">
          {out.pairs.map((p, i) => (
            <li key={i}>
              <strong>{p.q}</strong>
              <p className="muted" style={{ margin: "0.25rem 0 0", fontSize: "0.88rem" }}>
                {p.a}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
      {out && out.kind === "glossary" ? (
        <div className="ai-seven-result">
          <p className="ai-seven-headline">{out.term_ko}</p>
          <p>{out.explain_ko}</p>
          {out.example_ko ? <p className="muted">{out.example_ko}</p> : null}
          <p className="muted ai-seven-disclaimer">{out.disclaimer_ko}</p>
        </div>
      ) : null}
      {out && out.kind === "a_group_qa" ? <p className="muted ai-seven-disclaimer">{out.disclaimer_ko}</p> : null}
    </section>
  );
}

export default function WorldCup2026Guide() {
  return (
    <main className="page wiki-guide">
      <h1 className="page-title">2026 FIFA 월드컵 북중미 개최 요약</h1>
      <p className="page-lead">
        캐나다·멕시코·미국 공동 개최, 48개국·104경기 체제 등 이번 대회의 핵심만 정리했습니다. 상세·최신 정보는 아래{" "}
        <strong>참고 링크</strong>를 확인하세요.
      </p>

      <aside className="wiki-source-banner" role="note">
        <strong>참고</strong> — 이 화면은{" "}
        <a href={NAMU_WIKI_URL} target="_blank" rel="noreferrer">
          나무위키 「2026 FIFA 월드컵」
        </a>
        ,{" "}
        <a href={FIFA_URL} target="_blank" rel="noreferrer">
          FIFA 공식 페이지
        </a>
        등 공개 자료를 바탕으로 앱용으로 요약한 것이며, 편집·일정은 언제든 바뀔 수 있습니다.
      </aside>

      <section className="panel wiki-hero-stats" aria-label="대회 한눈에">
        <h2 className="panel-title">대회 한눈에</h2>
        <ul className="wiki-stat-chips">
          <li>
            <span className="wiki-stat-chips__label">기간</span>
            <span className="wiki-stat-chips__value">2026년 6월 11일 ~ 7월 19일</span>
          </li>
          <li>
            <span className="wiki-stat-chips__label">개최</span>
            <span className="wiki-stat-chips__value">캐나다 · 멕시코 · 미국 (역대 최초 3개국 공동)</span>
          </li>
          <li>
            <span className="wiki-stat-chips__label">본선 규모</span>
            <span className="wiki-stat-chips__value">48개국 · 총 104경기</span>
          </li>
          <li>
            <span className="wiki-stat-chips__label">슬로건</span>
            <span className="wiki-stat-chips__value">WE ARE 26</span>
          </li>
          <li>
            <span className="wiki-stat-chips__label">공식 브랜드</span>
            <span className="wiki-stat-chips__value">FIFA World Cup 26 (국명 미포함 브랜딩)</span>
          </li>
          <li>
            <span className="wiki-stat-chips__label">유치 확정</span>
            <span className="wiki-stat-chips__value">2018년 6월 13일</span>
          </li>
        </ul>
      </section>

      <section className="panel">
        <h2 className="panel-title">개최국·경기 분담</h2>
        <div className="wiki-host-grid">
          <div className="wiki-host-card">
            <h3>캐나다</h3>
            <p>남자 월드컵 본선은 사상 첫 개최. 경기 수는 미국보다 적고, 토론토·밴쿠버 등에서 일부 경기를 치릅니다.</p>
          </div>
          <div className="wiki-host-card">
            <h3>멕시코</h3>
            <p>1970·1986년에 이은 세 번째 월드컵 개최. 멕시코시티·과달라하라·몬테레이 등이 후보지로 거론됩니다.</p>
          </div>
          <div className="wiki-host-card">
            <h3>미국</h3>
            <p>1994년 대회 이후 두 번째. 전체 경기의 대부분(약 3/4 수준)이 미국 도시에서 열리는 형태로 정리됩니다.</p>
          </div>
        </div>
        <p className="muted wiki-footnote">
          개막전·결승 등 주요 경기 장소는 FIFA·개최위원회 발표를 기준으로 하며, 나무위키 본문에도 멕시코시티·LA 등 후보가
          함께 정리되어 있습니다.
        </p>
      </section>

      <section className="panel">
        <h2 className="panel-title">대회 형식 (48개국)</h2>
        <ul className="wiki-bullet-list">
          <li>기존 32개국에서 <strong>48개국</strong>으로 확대된 첫 월드컵입니다.</li>
          <li>
            조별 리그는 <strong>12개 조(A~L)</strong>, 조당 4팀 구성이 일반적으로 소개됩니다.
          </li>
          <li>
            각 조 <strong>1·2위</strong>와, 조 <strong>3위 중 성적 상위 8팀</strong>이 <strong>32강</strong> 토너먼트로
            진행됩니다. (이후 16강, 8강, 준결승, 결승)
          </li>
          <li>경기 수가 늘어나 대회 일정·로테이션이 이전 대회보다 길어집니다.</li>
        </ul>
      </section>

      <section className="panel">
        <h2 className="panel-title">상징</h2>
        <dl className="wiki-dl">
          <dt>마스코트</dt>
          <dd>
            2025년 9월 공개. 3개국을 상징하는 캐릭터 3체로 소개됩니다 —{" "}
            <strong>메이플</strong>(캐나다·무스), <strong>자유</strong>(멕시코·재규어), <strong>클러치</strong>
            (미국·흰머리수리).
          </dd>
          <dt>공인구</dt>
          <dd>
            이름 <strong>트리온다(Trionda)</strong>. 패널 4장 구조 등이 특징으로 설명됩니다.
          </dd>
          <dt>엠블럼</dt>
          <dd>실제 월드컵 트로피 이미지를 강조한 디자인이며, 3국 공동 개최를 반영해 국명을 넣지 않은 브랜딩입니다.</dd>
        </dl>
      </section>

      <section className="panel">
        <h2 className="panel-title">한국 팬 관점 메모</h2>
        <ul className="wiki-bullet-list">
          <li>
            <strong>대한민국 대표팀</strong> 일정·조 편성 등은{" "}
            <Link to="/2026/korea">2026 한국 대시보드</Link>와 나무위키의 홍명보호/대회 문서를 함께 보는 것이 좋습니다.
          </li>
          <li>
            개최지 시차 때문에 <strong>한국 시간 기준</strong>으로는 새벽~낮대에 걸친 킥오프가 많이 잡히는 편입니다. 나무위키
            본문에는 대략 <strong>새벽 1시~오후 1시 전후</strong>처럼 요약된 구간도 나옵니다(경기별 상이).
          </li>
          <li>아시아 지역 예선 쿼터 확대 등 지역별 본선 배당 변화도 2026 대회의 큰 변화 중 하나입니다.</li>
        </ul>
      </section>

      <GuideAiStep3Panel />

      <section className="panel">
        <h2 className="panel-title">더 보기</h2>
        <div className="wiki-link-row">
          <a className="btn btn-primary" href={NAMU_WIKI_URL} target="_blank" rel="noreferrer">
            나무위키 문서 열기
          </a>
          <a className="btn btn-secondary" href={FIFA_URL} target="_blank" rel="noreferrer">
            FIFA 공식
          </a>
          <Link className="btn btn-secondary" to="/2026/korea">
            한국 대시보드
          </Link>
        </div>
      </section>
    </main>
  );
}
