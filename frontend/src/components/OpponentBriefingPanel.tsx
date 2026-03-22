import { useCallback, useState } from "react";
import {
  postKoreaOpponentBriefing,
  type KoreaOpponentBriefingKey,
  type KoreaOpponentBriefingResponse,
} from "../api/worldcup2026";

const TARGETS: { key: KoreaOpponentBriefingKey; label: string; sub: string }[] = [
  { key: "mexico", label: "멕시코", sub: "A조 2차전" },
  { key: "south_africa", label: "남아공", sub: "A조 3차전" },
  { key: "playoff_d", label: "1차전 상대", sub: "UEFA 플레이오프 D" },
];

export default function OpponentBriefingPanel() {
  const [loading, setLoading] = useState<KoreaOpponentBriefingKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<KoreaOpponentBriefingResponse | null>(null);

  const run = useCallback(async (key: KoreaOpponentBriefingKey) => {
    setLoading(key);
    setError(null);
    try {
      const res = await postKoreaOpponentBriefing(key);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류");
      setData(null);
    } finally {
      setLoading(null);
    }
  }, []);

  const t = data?.tactics ?? {};
  const s = data?.squad ?? {};
  const watch = Array.isArray(s.players_to_watch) ? s.players_to_watch : [];

  return (
    <section className="opponent-briefing panel" aria-label="상대별 AI 전술·스쿼드 브리핑">
      <h2 className="panel-title">AI 전술·스쿼드 브리핑</h2>
      <p className="muted opponent-briefing__lead">
        API-Football으로 가져온 <strong>한국 스쿼드·부상</strong>과 <strong>상대 예시 11인·부상</strong>을 요약해 넣습니다. 공식 전술이나
        선발이 아닙니다.
      </p>

      <div className="opponent-briefing__btns" role="group">
        {TARGETS.map(({ key, label, sub }) => {
          const busy = loading === key;
          return (
            <button
              key={key}
              type="button"
              className="btn btn-secondary opponent-briefing__btn"
              disabled={loading !== null}
              onClick={() => void run(key)}
            >
              {busy ? "생성 중…" : `${label}`}
              <span className="opponent-briefing__btn-sub">{sub}</span>
            </button>
          );
        })}
      </div>

      {error ? <p className="text-error opponent-briefing__err">{error}</p> : null}

      {data ? (
        <div className="opponent-briefing__out">
          <header className="opponent-briefing__head">
            <h3 className="opponent-briefing__h3">{data.title_ko}</h3>
            <p className="opponent-briefing__one">{data.one_liner_ko}</p>
            {data.opponent_label_ko ? (
              <p className="muted opponent-briefing__meta">상대: {data.opponent_label_ko}</p>
            ) : null}
          </header>

          <div className="opponent-briefing__grid">
            <article className="opponent-briefing__card">
              <h4 className="opponent-briefing__h4">전술 포인트</h4>
              {t.how_they_play_ko ? (
                <div className="opponent-briefing__block">
                  <strong className="opponent-briefing__k">상대 경기 성향</strong>
                  <p>{t.how_they_play_ko}</p>
                </div>
              ) : null}
              {t.weaknesses_to_target_ko ? (
                <div className="opponent-briefing__block">
                  <strong className="opponent-briefing__k">노릴 만한 지점</strong>
                  <p>{t.weaknesses_to_target_ko}</p>
                </div>
              ) : null}
              {t.our_approach_ko ? (
                <div className="opponent-briefing__block">
                  <strong className="opponent-briefing__k">우리 쪽 접근</strong>
                  <p>{t.our_approach_ko}</p>
                </div>
              ) : null}
            </article>

            <article className="opponent-briefing__card">
              <h4 className="opponent-briefing__h4">스쿼드·주목 선수</h4>
              {s.korea_strengths_ko ? (
                <div className="opponent-briefing__block">
                  <strong className="opponent-briefing__k">🇰🇷 한국</strong>
                  <p>{s.korea_strengths_ko}</p>
                </div>
              ) : null}
              {s.opponent_strengths_ko ? (
                <div className="opponent-briefing__block">
                  <strong className="opponent-briefing__k">상대</strong>
                  <p>{s.opponent_strengths_ko}</p>
                </div>
              ) : null}
              {s.injury_notes_ko ? (
                <div className="opponent-briefing__block">
                  <strong className="opponent-briefing__k">부상·결장 맥락</strong>
                  <p>{s.injury_notes_ko}</p>
                </div>
              ) : null}
              {watch.length > 0 ? (
                <ul className="opponent-briefing__watch">
                  {watch.map((p, i) => (
                    <li key={`${p.name}-${i}`}>
                      <span className="opponent-briefing__tag">
                        {p.team === "opponent" ? "상대" : p.team === "korea" ? "한국" : "—"}
                      </span>{" "}
                      <strong>{p.name}</strong> — {p.note_ko}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          </div>

          {data.key_duels_ko?.length ? (
            <div className="opponent-briefing__duels">
              <h4 className="opponent-briefing__h4">핵심 대결</h4>
              <ul>
                {data.key_duels_ko.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {data.disclaimer_ko ? <p className="muted opponent-briefing__disc">{data.disclaimer_ko}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
