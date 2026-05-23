import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { humanizeFetchError } from "../api/client";
import { postAiPlaygroundWarmup } from "../api/aiInsights";
import AiInsightPanel from "../components/AiInsightPanel";
import PlayerAvatar from "../components/PlayerAvatar";
import FormationPitch from "../components/FormationPitch";
import RadarChart from "../components/RadarChart";
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
  { value: "czech_republic", label: "A조 1차전 · 체코", flag: "🇨🇿" },
  { value: "mexico",        label: "A조 2차전 · 멕시코", flag: "🇲🇽" },
  { value: "south_africa",  label: "A조 3차전 · 남아공",  flag: "🇿🇦" },
] as const;

const ACE_DEFAULTS: Record<string, string> = {
  czech_republic: "Patrik Schick",
  mexico: "Santiago Giménez",
  south_africa: "Percy Tau",
};

const RADAR_KEYS = ["pace", "shoot", "pass", "dribble", "defend", "hype"] as const;
const RADAR_KO: Record<string, string> = {
  pace: "스피드", shoot: "슈팅", pass: "패스",
  dribble: "드리블", defend: "수비", hype: "투지",
};

const PERSONA_OPTIONS = [
  { value: "national_hype" as const, label: "🇰🇷 국뽕 1000% 모드", emoji: "🇰🇷" },
  { value: "cold_facts"    as const, label: "🧊 냉철 팩트 모드",    emoji: "🧊" },
  { value: "hype"          as const, label: "📢 호들갑 텐션 모드",  emoji: "📢" },
];

const SITUATION_PRESETS = [
  "후반 추가시간, 한국이 역습으로 페널티박스 근처 프리킥을 얻었다.",
  "전반 35분, 한국 GK가 1대1 상황에서 슈퍼세이브로 막아냈다.",
  "손흥민이 드리블로 수비수 2명을 제치고 왼발 슈팅을 날렸다!",
  "한국이 선제골을 넣었다! 골 직후 선수들이 코너 깃발 앞에서 단체 세리머니.",
  "상대가 동점골을 넣고 한국 수비진이 멍하게 서 있는 상황.",
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

function copyText(text: string) {
  void navigator.clipboard.writeText(text).catch(() => {/* ignore */});
}

function WinGauge({ pct }: { pct: number }) {
  // 원형 게이지 — conic-gradient
  const color = pct >= 70 ? "#4caf50" : pct >= 50 ? "#ff9800" : "#ef5350";
  return (
    <div className="win-gauge" aria-label={`승기 지수 ${pct}%`}>
      <div
        className="win-gauge__ring"
        style={{
          background: `conic-gradient(${color} ${pct}%, var(--win-gauge-bg, #1e2235) ${pct}%)`,
        }}
      >
        <div className="win-gauge__inner">
          <span className="win-gauge__pct" style={{ color }}>{pct}%</span>
          <span className="win-gauge__lbl">승기 지수</span>
        </div>
      </div>
    </div>
  );
}

export default function KoreaAiPlayground() {
  const fetchWarmup = useCallback(() => postAiPlaygroundWarmup(), []);

  const [tab, setTab]         = useState<TabKey>("coach");
  const [bundle, setBundle]   = useState<CoreSquadBundle | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  // ─── 감독 탭 ────────────────────────────────────────────────────────────
  const [formation, setFormation] = useState("4-3-3");
  const [opponent,  setOpponent]  = useState<(typeof OPP_OPTIONS)[number]["value"]>("mexico");
  const [slotPicks, setSlotPicks] = useState<Record<string, number>>({});
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachErr,  setCoachErr]  = useState<string | null>(null);
  const [coachOut,  setCoachOut]  = useState<PlaygroundCoachResult | null>(null);
  const [coachCopied, setCoachCopied] = useState(false);

  // ─── 에이스 매치업 ──────────────────────────────────────────────────────
  const [aceKoreaId, setAceKoreaId] = useState<number>(0);
  const [aceOpp,  setAceOpp]   = useState<(typeof OPP_OPTIONS)[number]["value"]>("mexico");
  const [aceName, setAceName]  = useState("");
  const [aceLoading, setAceLoading] = useState(false);
  const [aceErr,  setAceErr]   = useState<string | null>(null);
  const [aceOut,  setAceOut]   = useState<PlaygroundAceResult | null>(null);
  const [aceCopied, setAceCopied] = useState(false);

  // ─── 편파 중계 ──────────────────────────────────────────────────────────
  const [situation, setSituation] = useState(SITUATION_PRESETS[0]);
  const [persona,   setPersona]   = useState<(typeof PERSONA_OPTIONS)[number]["value"]>("national_hype");
  const [comLoading, setComLoading] = useState(false);
  const [comErr,  setComErr]  = useState<string | null>(null);
  const [comOut,  setComOut]  = useState<PlaygroundCommentaryResult | null>(null);
  const [comCopied, setComCopied] = useState(false);

  useEffect(() => {
    void getCoreSquad("korea")
      .then((b) => { setBundle(b); setLoadErr(null); })
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

  // 실시간 피치용 xi
  const pitchXi = useMemo(() => {
    if (!bundle) return [];
    const idToPlayer = new Map(bundle.players.map((p) => [p.id, p]));
    return slots.map((slot) => {
      const pid = slotPicks[slot] ?? 0;
      const p = idToPlayer.get(pid);
      return { slot, player_id: pid, player_name: p?.name ?? "" };
    });
  }, [bundle, slots, slotPicks]);

  const runCoach = useCallback(async () => {
    if (!bundle) return;
    const xi = slots.map((slot) => ({ slot, player_id: slotPicks[slot] || 0 })).filter((r) => r.player_id);
    if (xi.length !== 11) { setCoachErr("11개 슬롯 모두 선수를 선택하세요."); return; }
    setCoachLoading(true); setCoachErr(null); setCoachOut(null); setCoachCopied(false);
    try {
      const r = await postPlaygroundCoachLineup({ formation, opponent, xi });
      setCoachOut(r);
    } catch (e) { setCoachErr(e instanceof Error ? e.message : "오류"); }
    finally { setCoachLoading(false); }
  }, [bundle, formation, opponent, slotPicks, slots]);

  const runAce = useCallback(async () => {
    if (!aceKoreaId) return;
    setAceLoading(true); setAceErr(null); setAceOut(null); setAceCopied(false);
    try {
      const r = await postPlaygroundAceMatchup({
        korea_player_id: aceKoreaId,
        opponent: aceOpp,
        opponent_ace_name: aceName.trim(),
      });
      setAceOut(r);
    } catch (e) { setAceErr(e instanceof Error ? e.message : "오류"); }
    finally { setAceLoading(false); }
  }, [aceKoreaId, aceName, aceOpp]);

  const runCom = useCallback(async () => {
    setComLoading(true); setComErr(null); setComOut(null); setComCopied(false);
    try {
      const r = await postPlaygroundBiasedCommentary({ situation_ko: situation, persona });
      setComOut(r);
    } catch (e) { setComErr(e instanceof Error ? e.message : "오류"); }
    finally { setComLoading(false); }
  }, [persona, situation]);

  // ─── 공유 텍스트 생성 ──────────────────────────────────────────────────
  const coachShareText = coachOut
    ? `🇰🇷 나의 감독 라인업 (${formation} vs ${OPP_OPTIONS.find(o=>o.value===opponent)?.label})\n승기 지수 ${coachOut.win_spirit_percent}%\n${coachOut.one_liner_ko}\n\n${coachOut.paragraph_ko}\n\n#한국 #월드컵2026 #AI놀이터`
    : "";

  const aceShareText = aceOut
    ? `⚔️ 에이스 매치업\n🇰🇷 ${aceOut.korea_player.name} vs ${aceOut.opponent_ace_name}\n\n${aceOut.story_ko}\n\n#한국 #월드컵2026 #AI에이스매치업`
    : "";

  const comShareText = comOut
    ? `🎙️ AI 편파 중계\n상황: ${situation}\n\n${comOut.lines_ko.join("\n")}\n\n#한국 #월드컵2026 #편파중계`
    : "";

  if (loadErr) return (
    <main className="page">
      <h1 className="page-title">AI 놀이터</h1>
      <p className="text-error">{loadErr}</p>
    </main>
  );

  if (!bundle) return (
    <main className="page"><p className="muted">스쿼드 불러오는 중…</p></main>
  );

  const oppFlag = (v: string) => OPP_OPTIONS.find(o => o.value === v)?.flag ?? "";

  return (
    <main className="page wiki-guide">
      <h1 className="page-title">AI 놀이터 · 대한민국 A조</h1>
      <p className="page-lead">
        조별리그 맥락에서 <strong>재미·상상</strong>을 돕는 LLM 놀이입니다.{" "}
        <span className="muted">전술·승률·스탯은 공식 분석·베팅이 아닙니다.</span>
      </p>

      <AiInsightPanel
        title="AI · 오늘의 워밍업"
        description="아래 탭들로 들어가기 전에 분위기를 살짝 올려줍니다."
        fetchInsight={fetchWarmup}
      />

      {/* ─── 탭 ────────────────────────────────────────────── */}
      <div className="pg-tabs" role="tablist" aria-label="AI 놀이터 메뉴">
        {(
          [
            { key: "coach",      icon: "⚽", label: "내가 감독" },
            { key: "ace",        icon: "⚔️", label: "에이스 매치업" },
            { key: "commentary", icon: "🎙️", label: "편파 중계" },
          ] as const
        ).map(({ key, icon, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={"pg-tab" + (tab === key ? " pg-tab--on" : "")}
            onClick={() => setTab(key)}
          >
            <span className="pg-tab__icon">{icon}</span>
            <span className="pg-tab__label">{label}</span>
          </button>
        ))}
      </div>

      {/* ═══════════════════════ 감독 탭 ═══════════════════════ */}
      {tab === "coach" ? (
        <div className="pg-panel">
          <h2 className="panel-title">⚽ 내가 국가대표 감독이라면?</h2>
          <p className="muted pg-desc">
            포메이션과 선수를 고른 뒤 AI가 <strong>재치 있는 평가</strong>와 놀이용 승기 지수를 줍니다.
          </p>

          {/* 컨트롤 행 */}
          <div className="pg-control-row">
            <label className="pg-label">
              <span>포메이션</span>
              <select className="pg-select" value={formation} onChange={(e) => setFormation(e.target.value)} disabled={coachLoading}>
                {FORMATIONS.map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </label>
            <label className="pg-label">
              <span>상대 시나리오</span>
              <select
                className="pg-select"
                value={opponent}
                onChange={(e) => setOpponent(e.target.value as (typeof OPP_OPTIONS)[number]["value"])}
                disabled={coachLoading}
              >
                {OPP_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.flag} {o.label}</option>
                ))}
              </select>
            </label>
          </div>

          {/* 피치 + 슬롯 선택 */}
          <div className="pg-coach-layout">
            {/* 왼쪽: 실시간 피치 */}
            <div className="pg-coach-pitch">
              <p className="pg-pitch-hint muted">선택 즉시 반영됩니다</p>
              <FormationPitch formation={formation} xi={pitchXi} />
            </div>

            {/* 오른쪽: 슬롯 선택 */}
            <div className="pg-slot-grid">
              {slots.map((slot) => {
                const pickedPlayer = bundle.players.find((p) => p.id === slotPicks[slot]);
                return (
                  <div key={slot} className="pg-slot-card">
                    <span className="pg-slot-card__pos">{SLOT_LABEL_KO[slot] ?? slot}</span>
                    <div className="pg-slot-card__avatar">
                      {pickedPlayer ? (
                        <PlayerAvatar playerId={pickedPlayer.id} playerName={pickedPlayer.name} size={36} />
                      ) : (
                        <div className="pg-slot-card__avatar-ph" />
                      )}
                    </div>
                    <select
                      className="pg-slot-select"
                      value={slotPicks[slot] ?? ""}
                      onChange={(e) => setSlot(slot, Number(e.target.value))}
                      disabled={coachLoading}
                    >
                      {bundle.players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.position})
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pg-btn-row">
            <button type="button" className="btn btn-primary pg-run-btn" disabled={coachLoading} onClick={() => void runCoach()}>
              {coachLoading ? <><span className="pg-spinner" />AI 분석 중…</> : "🤖 AI 평가 받기"}
            </button>
          </div>
          {coachErr ? <p className="text-error">{coachErr}</p> : null}

          {/* 결과 카드 */}
          {coachOut ? (
            <div className="pg-result-card pg-result-card--coach">
              <div className="pg-result-card__top">
                <WinGauge pct={coachOut.win_spirit_percent} />
                <div className="pg-result-card__text">
                  <p className="pg-one-liner">"{coachOut.one_liner_ko}"</p>
                  <p className="pg-paragraph">{coachOut.paragraph_ko}</p>
                </div>
              </div>
              {coachOut.coach_mode_ko ? (
                <aside className="pg-easter">
                  💬 {coachOut.coach_mode_ko}
                </aside>
              ) : null}
              <div className="pg-result-card__footer">
                <p className="muted pg-disclaimer">{coachOut.disclaimer_ko}</p>
                <button
                  type="button"
                  className="btn btn-secondary pg-share-btn"
                  onClick={() => { copyText(coachShareText); setCoachCopied(true); setTimeout(() => setCoachCopied(false), 2000); }}
                >
                  {coachCopied ? "✅ 복사됨!" : "📋 결과 복사"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ═══════════════════════ 에이스 매치업 탭 ═══════════════════════ */}
      {tab === "ace" ? (
        <div className="pg-panel">
          <h2 className="panel-title">⚔️ 가상 에이스 매치업</h2>
          <p className="muted pg-desc">
            한국 선수와 상대 에이스를 골라 <strong>헥사곤 스탯 레이더</strong>와 가상 시나리오를 받습니다.
          </p>

          <div className="pg-control-row">
            <label className="pg-label">
              <span>🇰🇷 한국 선수</span>
              <div className="pg-select-with-avatar">
                {bundle.players.find(p => p.id === aceKoreaId) && (
                  <PlayerAvatar
                    playerId={aceKoreaId}
                    playerName={bundle.players.find(p => p.id === aceKoreaId)?.name ?? ""}
                    size={32}
                    className="pg-select-avatar"
                  />
                )}
                <select
                  className="pg-select"
                  value={aceKoreaId || ""}
                  onChange={(e) => setAceKoreaId(Number(e.target.value))}
                  disabled={aceLoading}
                >
                  {bundle.players.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.position})</option>
                  ))}
                </select>
              </div>
            </label>
            <label className="pg-label">
              <span>상대 팀</span>
              <select
                className="pg-select"
                value={aceOpp}
                onChange={(e) => setAceOpp(e.target.value as (typeof OPP_OPTIONS)[number]["value"])}
                disabled={aceLoading}
              >
                {OPP_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.flag} {o.label}</option>
                ))}
              </select>
            </label>
            <label className="pg-label">
              <span>상대 에이스 (비우면 AI가 고름)</span>
              <input
                className="pg-input"
                value={aceName}
                onChange={(e) => setAceName(e.target.value)}
                placeholder={ACE_DEFAULTS[aceOpp] ? `예: ${ACE_DEFAULTS[aceOpp]}` : "비우면 AI 추천"}
                disabled={aceLoading}
              />
            </label>
          </div>

          <div className="pg-btn-row">
            <button type="button" className="btn btn-primary pg-run-btn" disabled={aceLoading} onClick={() => void runAce()}>
              {aceLoading ? <><span className="pg-spinner" />생성 중…</> : "⚔️ 매치업 생성"}
            </button>
          </div>
          {aceErr ? <p className="text-error">{aceErr}</p> : null}

          {/* 결과 카드 */}
          {aceOut ? (
            <div className="pg-result-card pg-result-card--ace">
              {/* 헤더: 두 선수 사진 */}
              <div className="pg-ace-header">
                <div className="pg-ace-side pg-ace-side--kr">
                  <PlayerAvatar playerId={aceOut.korea_player.id ?? 0} playerName={aceOut.korea_player.name ?? "선수"} size={72} className="pg-ace-avatar" />
                  <span className="pg-ace-name">🇰🇷 {aceOut.korea_player.name}</span>
                </div>
                <span className="pg-ace-vs">⚔️</span>
                <div className="pg-ace-side pg-ace-side--opp">
                  <div className="pg-ace-opp-avatar">{oppFlag(aceOpp)}</div>
                  <span className="pg-ace-name">
                    {aceOut.opponent_ace_name}
                    {aceOut.opponent_ace_ai_picked ? <span className="muted pg-ai-picked"> AI추천</span> : null}
                  </span>
                </div>
              </div>

              {/* 헥사곤 레이더 차트 */}
              <RadarChart
                korea={aceOut.radar_korea as Record<string, number>}
                opponent={aceOut.radar_opponent as Record<string, number>}
                keys={RADAR_KEYS}
                labels={RADAR_KO}
                krName={aceOut.korea_player.name ?? "한국"}
                oppName={aceOut.opponent_ace_name}
              />

              {/* 스토리 */}
              <div className="pg-ace-story">
                <p>{aceOut.story_ko}</p>
              </div>

              <div className="pg-result-card__footer">
                <p className="muted pg-disclaimer">{aceOut.disclaimer_ko}</p>
                <button
                  type="button"
                  className="btn btn-secondary pg-share-btn"
                  onClick={() => { copyText(aceShareText); setAceCopied(true); setTimeout(() => setAceCopied(false), 2000); }}
                >
                  {aceCopied ? "✅ 복사됨!" : "📋 결과 복사"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ═══════════════════════ 편파 중계 탭 ═══════════════════════ */}
      {tab === "commentary" ? (
        <div className="pg-panel">
          <h2 className="panel-title">🎙️ 편파 중계 시뮬레이터</h2>
          <p className="muted pg-desc">
            경기 상황을 적고 페르소나를 고르면 <strong>생생한 중계 멘트</strong>가 나옵니다. 패러디·놀이용!
          </p>

          {/* 프리셋 버튼 */}
          <div className="pg-presets">
            <span className="pg-presets__label muted">빠른 선택:</span>
            {SITUATION_PRESETS.map((s, i) => (
              <button
                key={i}
                type="button"
                className={"pg-preset-btn" + (situation === s ? " pg-preset-btn--on" : "")}
                onClick={() => setSituation(s)}
                disabled={comLoading}
              >
                {s.slice(0, 18)}…
              </button>
            ))}
          </div>

          <label className="pg-label pg-label--block">
            <span>상황 설명</span>
            <textarea
              className="pg-textarea"
              rows={3}
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              disabled={comLoading}
            />
          </label>

          {/* 페르소나 카드 */}
          <div className="pg-persona-row">
            {PERSONA_OPTIONS.map((p) => (
              <button
                key={p.value}
                type="button"
                className={"pg-persona-card" + (persona === p.value ? " pg-persona-card--on" : "")}
                onClick={() => setPersona(p.value)}
                disabled={comLoading}
              >
                <span className="pg-persona-emoji">{p.emoji}</span>
                <span className="pg-persona-label">{p.label.replace(/^[^ ]+ /, "")}</span>
              </button>
            ))}
          </div>

          <div className="pg-btn-row">
            <button type="button" className="btn btn-primary pg-run-btn" disabled={comLoading} onClick={() => void runCom()}>
              {comLoading ? <><span className="pg-spinner" />생성 중…</> : "🎙️ 중계 멘트 생성"}
            </button>
          </div>
          {comErr ? <p className="text-error">{comErr}</p> : null}

          {/* 결과 카드 */}
          {comOut ? (
            <div className="pg-result-card pg-result-card--commentary">
              <div className="pg-commentary-mic">🎙️</div>
              <ol className="pg-commentary-list">
                {comOut.lines_ko.map((line, i) => (
                  <li key={i} className="pg-commentary-line">
                    <span className="pg-commentary-n">{i + 1}</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ol>
              <div className="pg-result-card__footer">
                <p className="muted pg-disclaimer">{comOut.disclaimer_ko}</p>
                <button
                  type="button"
                  className="btn btn-secondary pg-share-btn"
                  onClick={() => { copyText(comShareText); setComCopied(true); setTimeout(() => setComCopied(false), 2000); }}
                >
                  {comCopied ? "✅ 복사됨!" : "📋 결과 복사"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <p className="muted" style={{ marginTop: "1.5rem", fontSize: "0.9rem" }}>
        <Link to="/2026/korea">한국 대시보드</Link>
        {" · "}
        <Link to="/2026/korea/players">한국 대표팀 데이터</Link>
      </p>
    </main>
  );
}
