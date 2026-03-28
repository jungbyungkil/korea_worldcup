import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { humanizeFetchError } from "../api/client";
import {
  getCoreSquad,
  postPlaygroundAceMatchup,
  postPlaygroundBiasedCommentary,
  postPlaygroundCoachLineup,
  type CoreSquadBundle,
  type CoreSquadPlayer,
  type PlaygroundAceResult,
  type PlaygroundCoachResult,
  type PlaygroundCommentaryResult,
} from "../api/worldcup2026";
import { FORMATIONS, SLOT_LABEL_KO, slotsForFormation } from "../formationLayouts";

type TabKey = "coach" | "ace" | "commentary";

const OPP_OPTIONS = [
  { value: "group_first", label: "A조 1차전 (플레이오프 D 승자)" },
  { value: "mexico", label: "A조 2차전 · 멕시코" },
  { value: "south_africa", label: "A조 3차전 · 남아공" },
] as const;

const ACE_DEFAULTS: Record<string, string> = {
  mexico: "Santiago Giménez",
  south_africa: "Percy Tau",
  group_first: "상대 플레이메이커 (가상)",
};

const RADAR_KEYS = ["pace", "shoot", "pass", "dribble", "defend", "hype"] as const;
const RADAR_KO: Record<string, string> = {
  pace: "스피드",
  shoot: "슈팅",
  pass: "패스",
  dribble: "드리블",
  defend: "수비",
  hype: "투지(놀이)",
};

const PERSONA_OPTIONS = [
  { value: "national_hype" as const, label: "국뽕 1000% 모드" },
  { value: "cold_facts" as const, label: "냉철 팩트 모드" },
  { value: "hype" as const, label: "호들갑 텐션 모드" },
];

function balancedDefaultLineup(squad: CoreSquadPlayer[], formation: string): Record<string, number> {
  const slots = slotsForFormation(formation);
  const used = new Set<number>();
  const pick = (cands: CoreSquadPlayer[]) => {
    const x = cands.find((p) => !used.has(p.id));
    if (x) used.add(x.id);
    return x?.id ?? 0;
  };
  const gks = squad.filter((p) => p.position === "GK");
  const dfs = squad.filter((p) => p.position === "DF");
  const mfs = squad.filter((p) => p.position === "MF");
  const fws = squad.filter((p) => p.position === "FW");
  const out: Record<string, number> = {};
  for (const slot of slots) {
    let id = 0;
    if (slot === "GK") id = pick(gks);
    else if (/ST|LW|RW/.test(slot)) id = pick(fws.length ? fws : squad);
    else if (/CM|DM|CDM|LM|RM/.test(slot)) id = pick(mfs.length ? mfs : squad);
    else if (/CB|LB|RB|WB/.test(slot)) id = pick(dfs.length ? dfs : squad);
    if (!id) id = pick(squad.filter((p) => !used.has(p.id)));
    if (!id) id = squad[0]?.id ?? 0;
    out[slot] = id;
  }
  return out;
}

export default function KoreaAiPlayground() {
  const [tab, setTab] = useState<TabKey>("coach");
  const [bundle, setBundle] = useState<CoreSquadBundle | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  const [formation, setFormation] = useState("4-3-3");
  const [opponent, setOpponent] = useState<(typeof OPP_OPTIONS)[number]["value"]>("mexico");
  const [slotPicks, setSlotPicks] = useState<Record<string, number>>({});
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachErr, setCoachErr] = useState<string | null>(null);
  const [coachOut, setCoachOut] = useState<PlaygroundCoachResult | null>(null);

  const [aceKoreaId, setAceKoreaId] = useState<number>(0);
  const [aceOpp, setAceOpp] = useState<(typeof OPP_OPTIONS)[number]["value"]>("mexico");
  const [aceName, setAceName] = useState("");
  const [aceLoading, setAceLoading] = useState(false);
  const [aceErr, setAceErr] = useState<string | null>(null);
  const [aceOut, setAceOut] = useState<PlaygroundAceResult | null>(null);

  const [situation, setSituation] = useState("후반 추가시간, 한국이 역습으로 페널티박스 근처 프리킥을 얻었다.");
  const [persona, setPersona] = useState<(typeof PERSONA_OPTIONS)[number]["value"]>("national_hype");
  const [comLoading, setComLoading] = useState(false);
  const [comErr, setComErr] = useState<string | null>(null);
  const [comOut, setComOut] = useState<PlaygroundCommentaryResult | null>(null);

  useEffect(() => {
    void getCoreSquad("korea")
      .then((b) => {
        setBundle(b);
        setLoadErr(null);
      })
      .catch((e) => setLoadErr(humanizeFetchError(e)));
  }, []);

  const slots = useMemo(() => slotsForFormation(formation), [formation]);

  useEffect(() => {
    if (!bundle?.players.length) return;
    setSlotPicks(balancedDefaultLineup(bundle.players, formation));
  }, [bundle, formation]);

  useEffect(() => {
    if (bundle?.players.length && !aceKoreaId) {
      const son = bundle.players.find((p) => p.name.includes("손흥민"));
      setAceKoreaId(son?.id ?? bundle.players[0].id);
    }
  }, [bundle, aceKoreaId]);

  const setSlot = useCallback((slot: string, playerId: number) => {
    setSlotPicks((prev) => ({ ...prev, [slot]: playerId }));
  }, []);

  const runCoach = useCallback(async () => {
    if (!bundle) return;
    const xi = slots.map((slot) => ({ slot, player_id: slotPicks[slot] || 0 })).filter((r) => r.player_id);
    if (xi.length !== 11) {
      setCoachErr("11개 슬롯 모두 선수를 선택하세요.");
      return;
    }
    setCoachLoading(true);
    setCoachErr(null);
    setCoachOut(null);
    try {
      const r = await postPlaygroundCoachLineup({ formation, opponent, xi });
      setCoachOut(r);
    } catch (e) {
      setCoachErr(e instanceof Error ? e.message : "오류");
    } finally {
      setCoachLoading(false);
    }
  }, [bundle, formation, opponent, slotPicks, slots]);

  const runAce = useCallback(async () => {
    if (!aceKoreaId) return;
    setAceLoading(true);
    setAceErr(null);
    setAceOut(null);
    try {
      const r = await postPlaygroundAceMatchup({
        korea_player_id: aceKoreaId,
        opponent: aceOpp,
        opponent_ace_name: aceName.trim(),
      });
      setAceOut(r);
    } catch (e) {
      setAceErr(e instanceof Error ? e.message : "오류");
    } finally {
      setAceLoading(false);
    }
  }, [aceKoreaId, aceName, aceOpp]);

  const runCom = useCallback(async () => {
    setComLoading(true);
    setComErr(null);
    setComOut(null);
    try {
      const r = await postPlaygroundBiasedCommentary({ situation_ko: situation, persona });
      setComOut(r);
    } catch (e) {
      setComErr(e instanceof Error ? e.message : "오류");
    } finally {
      setComLoading(false);
    }
  }, [persona, situation]);

  if (loadErr)
    return (
      <main className="page">
        <h1 className="page-title">AI 놀이터</h1>
        <p className="text-error">{loadErr}</p>
      </main>
    );

  if (!bundle)
    return (
      <main className="page">
        <p className="muted">스쿼드 불러오는 중…</p>
      </main>
    );

  return (
    <main className="page wiki-guide">
      <h1 className="page-title">AI 놀이터 · 대한민국 A조</h1>
      <p className="page-lead">
        조별리그 맥락에서 <strong>재미·상상</strong>을 돕는 LLM 놀이입니다. 전술·승률·스탯은{" "}
        <strong>공식 분석·베팅·실제 예측이 아닙니다.</strong>
      </p>

      <div className="ai-playground-tabs" role="tablist" aria-label="AI 놀이터 메뉴">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "coach"}
          className={"ai-playground-tab" + (tab === "coach" ? " ai-playground-tab--on" : "")}
          onClick={() => setTab("coach")}
        >
          내가 감독이라면
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "ace"}
          className={"ai-playground-tab" + (tab === "ace" ? " ai-playground-tab--on" : "")}
          onClick={() => setTab("ace")}
        >
          가상 에이스 매치업
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "commentary"}
          className={"ai-playground-tab" + (tab === "commentary" ? " ai-playground-tab--on" : "")}
          onClick={() => setTab("commentary")}
        >
          편파 중계 시뮬
        </button>
      </div>

      {tab === "coach" ? (
        <section className="panel ai-seven-panel" style={{ marginTop: "1rem" }}>
          <h2 className="panel-title">⚽ 내가 국가대표 감독이라면?</h2>
          <p className="muted" style={{ marginTop: 0, fontSize: "0.88rem" }}>
            포메이션과 슬롯별 선수를 고른 뒤 AI가 <strong>재치 있는 평가</strong>와 놀이용 승기 지수(%)를 줍니다. 극단적인 배치면
            &quot;감독님&quot; 모드 한마디가 붙을 수 있습니다.
          </p>
          <div className="ai-playground-row">
            <label className="ai-seven-label">
              포메이션
              <select
                className="ai-seven-select"
                value={formation}
                onChange={(e) => setFormation(e.target.value)}
                disabled={coachLoading}
              >
                {FORMATIONS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="ai-seven-label">
              상대 시나리오
              <select
                className="ai-seven-select"
                value={opponent}
                onChange={(e) => setOpponent(e.target.value as (typeof OPP_OPTIONS)[number]["value"])}
                disabled={coachLoading}
              >
                {OPP_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="ai-playground-slot-grid">
            {slots.map((slot) => (
              <label key={slot} className="ai-playground-slot">
                <span className="ai-playground-slot__lbl">{SLOT_LABEL_KO[slot] ?? slot}</span>
                <select
                  className="ai-seven-select"
                  value={slotPicks[slot] ?? ""}
                  onChange={(e) => setSlot(slot, Number(e.target.value))}
                  disabled={coachLoading}
                >
                  {bundle.players.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.number ?? "—"} {p.name} ({p.position})
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div className="ai-seven-btn-row">
            <button type="button" className="btn btn-primary" disabled={coachLoading} onClick={() => void runCoach()}>
              {coachLoading ? "AI 분석 중…" : "AI 평가 받기"}
            </button>
          </div>
          {coachErr ? <p className="text-error">{coachErr}</p> : null}
          {coachOut ? (
            <div className="ai-playground-result">
              <p className="ai-playground-spirit">
                승기 지수 <strong>{coachOut.win_spirit_percent}%</strong>
                <span className="muted" style={{ fontSize: "0.82rem", marginLeft: "0.5rem" }}>
                  (놀이용, 실제 승률 아님)
                </span>
              </p>
              <p className="ai-playground-oneliner">{coachOut.one_liner_ko}</p>
              <p style={{ lineHeight: 1.65 }}>{coachOut.paragraph_ko}</p>
              {coachOut.coach_mode_ko ? (
                <aside className="ai-playground-easter" role="note">
                  {coachOut.coach_mode_ko}
                </aside>
              ) : null}
              <p className="muted ai-seven-disclaimer">{coachOut.disclaimer_ko}</p>
            </div>
          ) : null}
        </section>
      ) : null}

      {tab === "ace" ? (
        <section className="panel ai-seven-panel" style={{ marginTop: "1rem" }}>
          <h2 className="panel-title">⚔️ 가상 에이스 매치업</h2>
          <p className="muted" style={{ marginTop: 0, fontSize: "0.88rem" }}>
            한국 선수와 상대 에이스를 골라 <strong>놀이용 육각 스탯</strong>과 짧은 <strong>가상 시나리오</strong>를 받습니다.
          </p>
          <div className="ai-playground-row">
            <label className="ai-seven-label">
              한국 선수
              <select
                className="ai-seven-select"
                value={aceKoreaId || ""}
                onChange={(e) => setAceKoreaId(Number(e.target.value))}
                disabled={aceLoading}
              >
                {bundle.players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.position})
                  </option>
                ))}
              </select>
            </label>
            <label className="ai-seven-label">
              상대 팀
              <select
                className="ai-seven-select"
                value={aceOpp}
                onChange={(e) => setAceOpp(e.target.value as (typeof OPP_OPTIONS)[number]["value"])}
                disabled={aceLoading}
              >
                {OPP_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="ai-seven-label">
              상대 에이스 이름 (비우면 데이터에서 AI가 고름)
              <input
                className="ai-seven-input"
                value={aceName}
                onChange={(e) => setAceName(e.target.value)}
                placeholder={ACE_DEFAULTS[aceOpp] ? `예: ${ACE_DEFAULTS[aceOpp]}` : "비우면 AI 추천"}
                disabled={aceLoading}
              />
            </label>
          </div>
          <div className="ai-seven-btn-row">
            <button type="button" className="btn btn-primary" disabled={aceLoading} onClick={() => void runAce()}>
              {aceLoading ? "생성 중…" : "매치업 생성"}
            </button>
          </div>
          {aceErr ? <p className="text-error">{aceErr}</p> : null}
          {aceOut ? (
            <div className="ai-playground-result">
              <p>
                <strong>{aceOut.korea_player.name}</strong> vs <strong>{aceOut.opponent_ace_name}</strong>
                {aceOut.opponent_ace_ai_picked ? (
                  <span className="muted" style={{ fontSize: "0.82rem", marginLeft: "0.45rem" }}>
                    (AI 추천)
                  </span>
                ) : null}
              </p>
              <div className="ai-playground-radar-grid">
                <div>
                  <h4 className="ai-playground-radar-h">🇰🇷 {aceOut.korea_player.name}</h4>
                  {RADAR_KEYS.map((k) => (
                    <div key={k} className="ai-playground-bar">
                      <span>{RADAR_KO[k]}</span>
                      <div className="ai-playground-bar__track">
                        <div className="ai-playground-bar__fill ai-playground-bar__fill--kr" style={{ width: `${aceOut.radar_korea[k]}%` }} />
                      </div>
                      <span className="ai-playground-bar__n">{aceOut.radar_korea[k]}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="ai-playground-radar-h">{aceOut.opponent_ace_name}</h4>
                  {RADAR_KEYS.map((k) => (
                    <div key={k} className="ai-playground-bar">
                      <span>{RADAR_KO[k]}</span>
                      <div className="ai-playground-bar__track">
                        <div className="ai-playground-bar__fill ai-playground-bar__fill--opp" style={{ width: `${aceOut.radar_opponent[k]}%` }} />
                      </div>
                      <span className="ai-playground-bar__n">{aceOut.radar_opponent[k]}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p style={{ lineHeight: 1.7, marginTop: "1rem" }}>{aceOut.story_ko}</p>
              <p className="muted ai-seven-disclaimer">{aceOut.disclaimer_ko}</p>
            </div>
          ) : null}
        </section>
      ) : null}

      {tab === "commentary" ? (
        <section className="panel ai-seven-panel" style={{ marginTop: "1rem" }}>
          <h2 className="panel-title">🎙️ 편파 중계 시뮬레이터</h2>
          <p className="muted" style={{ marginTop: 0, fontSize: "0.88rem" }}>
            경기 상황을 적고 페르소나를 고르면 <strong>짧은 중계 멘트</strong>가 연속으로 나옵니다. 패러디·놀이용입니다.
          </p>
          <label className="ai-seven-label" style={{ display: "block", marginBottom: "0.75rem" }}>
            상황 설명
            <textarea
              className="ai-playground-textarea"
              rows={4}
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              disabled={comLoading}
            />
          </label>
          <label className="ai-seven-label">
            모드
            <select
              className="ai-seven-select"
              value={persona}
              onChange={(e) => setPersona(e.target.value as (typeof PERSONA_OPTIONS)[number]["value"])}
              disabled={comLoading}
            >
              {PERSONA_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <div className="ai-seven-btn-row">
            <button type="button" className="btn btn-primary" disabled={comLoading} onClick={() => void runCom()}>
              {comLoading ? "생성 중…" : "중계 멘트 생성"}
            </button>
          </div>
          {comErr ? <p className="text-error">{comErr}</p> : null}
          {comOut ? (
            <ul className="ai-playground-commentary">
              {comOut.lines_ko.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          ) : null}
          {comOut ? <p className="muted ai-seven-disclaimer">{comOut.disclaimer_ko}</p> : null}
        </section>
      ) : null}

      <p className="muted" style={{ marginTop: "1.5rem", fontSize: "0.9rem" }}>
        <Link to="/2026/korea">한국 대시보드</Link>
        {" · "}
        <Link to="/2026/korea/players">한국 대표팀 데이터</Link>
      </p>
    </main>
  );
}
