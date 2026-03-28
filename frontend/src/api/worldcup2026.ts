import { apiUrl } from "./client";

export interface KoreaOverview {
  last_updated: string;
  team: { id: number | null; name: string };
  status: {
    groups_confirmed: boolean;
    fixtures_confirmed: boolean;
    note?: string;
  };
}

export interface Fixture {
  id?: number;
  date?: string;
  league?: string;
  opponent?: string;
  stage?: string;
  venue?: string;
  city?: string;
  status?: string;
  score?: string;
}

export interface KoreaFixtures {
  last_updated: string;
  team_id: number | null;
  league_source?: "env_fixed" | "auto_discovery" | string;
  league_ids?: number[];
  afc_qualifier_league_ids?: number[];
  afc_discovery_merged_count?: number;
  fixtures: Fixture[];
}

export interface WinProbabilityResponse {
  input: { team: string; opponent: string };
  features: {
    team_elo: number;
    opponent_elo: number;
    elo_diff: number;
    recent_form_points: number | null;
    avg_goals_scored: number | null;
    avg_goals_conceded: number | null;
  };
  probability: { win: number; draw_or_loss: number };
  recent_form: {
    played: number;
    wins: number;
    draws: number;
    losses: number;
    points: number;
    goals_scored: number;
    goals_conceded: number;
    recent_matches: Array<{ date: string; opponent?: string; score?: string; result?: string }>;
  };
  assumptions: string[];
  formula: string;
}

export async function getKoreaOverview(): Promise<KoreaOverview> {
  const res = await fetch(apiUrl("/api/v1/worldcup2026/korea/overview"));
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(body.detail || "2026 개요를 불러오지 못했습니다.");
  }
  return res.json();
}

export async function getKoreaFixtures(): Promise<KoreaFixtures> {
  const res = await fetch(apiUrl("/api/v1/worldcup2026/korea/fixtures"));
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(body.detail || "2026 일정 정보를 불러오지 못했습니다.");
  }
  return res.json();
}

export interface SupplementSources {
  api_football: boolean;
  football_data_org: boolean;
  thesportsdb_custom_key: boolean;
  thesportsdb: boolean;
  sportmonks: boolean;
  notes?: Record<string, string>;
}

export interface TeamMediaSlim {
  id?: string | null;
  name?: string | null;
  badge?: string | null;
  logo?: string | null;
  jersey?: string | null;
  website?: string | null;
  formed?: string | null;
  stadium?: string | null;
  description?: string | null;
}

export interface AGroupMediaResponse {
  source: string;
  teams: Record<string, TeamMediaSlim | null>;
}

export interface FdWcMatchSlim {
  utcDate?: string;
  status?: string;
  stage?: string;
  group?: string;
  matchday?: number | null;
  home?: string | null;
  away?: string | null;
  score_fulltime?: { home?: number | null; away?: number | null } | null;
}

export interface FdWcMatchesResponse {
  source: string;
  competition?: unknown;
  filters?: Record<string, unknown>;
  matches: FdWcMatchSlim[];
}

export async function getSupplementSources(): Promise<SupplementSources> {
  const res = await fetch(apiUrl("/api/v1/worldcup2026/supplement/sources"));
  if (!res.ok) throw new Error("보조 API 상태를 불러오지 못했습니다.");
  return res.json();
}

export async function getSupplementAGroupMedia(): Promise<AGroupMediaResponse> {
  const res = await fetch(apiUrl("/api/v1/worldcup2026/supplement/thesportsdb/a-group-media"));
  if (!res.ok) throw new Error("팀 배지를 불러오지 못했습니다.");
  return res.json();
}

export async function getFootballDataWcMatches(opts?: {
  season?: string;
  status?: string;
  limit?: number;
}): Promise<FdWcMatchesResponse> {
  const q = new URLSearchParams();
  if (opts?.season) q.set("season", opts.season);
  if (opts?.status) q.set("status", opts.status);
  if (opts?.limit != null) q.set("limit", String(opts.limit));
  const res = await fetch(apiUrl(`/api/v1/worldcup2026/supplement/football-data/world-cup/matches?${q}`));
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(body.detail || "Football-Data WC 일정을 불러오지 못했습니다.");
  }
  return res.json();
}

export async function postWinProbability(payload: { opponent: string }): Promise<WinProbabilityResponse> {
  const res = await fetch(apiUrl("/api/v1/worldcup2026/prediction/win-probability"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(body.detail || "승률 예측 계산에 실패했습니다.");
  }
  return res.json();
}

/* -------- 7-step AI fun (순차 엔터 카드) -------- */

const AI_FUN_SEVEN = "/api/v1/worldcup2026/ai-fun-seven";

function aiSevenErr(res: Response, body: unknown): string {
  const d =
    typeof body === "object" && body !== null && "detail" in body && typeof (body as { detail: unknown }).detail === "string"
      ? (body as { detail: string }).detail.trim()
      : "";
  if (res.status === 501 && d.toLowerCase().includes("openai")) return "AI 기능을 지금은 사용할 수 없습니다. 서버 설정을 확인하세요.";
  return d || "AI 요청에 실패했습니다.";
}

export type AiFunStep1Sub = "one_liner" | "condition" | "position_pick";

export type AiFunStep1OneLiner = { sub: "one_liner"; line_ko: string; disclaimer_ko: string };
export type AiFunStep1Condition = {
  sub: "condition";
  headline_ko: string;
  body_ko: string;
  mood_emoji: string;
  disclaimer_ko: string;
};
export type AiFunStep1PositionPick = {
  sub: "position_pick";
  chosen_player_id: number;
  reason_ko: string;
  teaser_ko: string;
  disclaimer_ko: string;
};

export async function postAiFunStep1Player(body: {
  sub: AiFunStep1Sub;
  player_id: number;
}): Promise<AiFunStep1OneLiner | AiFunStep1Condition | AiFunStep1PositionPick> {
  const res = await fetch(apiUrl(`${AI_FUN_SEVEN}/step1-player`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const b = await res.json().catch(() => ({}));
    throw new Error(aiSevenErr(res, b));
  }
  return res.json();
}

export type AiFunStep2Summary = { mode: "summary"; sentences_ko: string[]; disclaimer_ko: string };
export type AiFunStep2Scenario = { mode: "scenario"; title_ko: string; body_ko: string; disclaimer_ko: string };

export async function postAiFunStep2History(body: {
  mode: "summary" | "scenario";
  context: Record<string, unknown>;
  scenario_hint?: string;
}): Promise<AiFunStep2Summary | AiFunStep2Scenario> {
  const res = await fetch(apiUrl(`${AI_FUN_SEVEN}/step2-history`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const b = await res.json().catch(() => ({}));
    throw new Error(aiSevenErr(res, b));
  }
  return res.json();
}

export type AiFunStep3AGroup = {
  kind: "a_group_qa";
  pairs: { q: string; a: string }[];
  disclaimer_ko: string;
};
export type AiFunStep3Glossary = {
  kind: "glossary";
  term_ko: string;
  explain_ko: string;
  example_ko: string;
  disclaimer_ko: string;
};

export async function postAiFunStep3Guide(body: { kind: "a_group_qa" } | { kind: "glossary"; term: string }): Promise<
  AiFunStep3AGroup | AiFunStep3Glossary
> {
  const res = await fetch(apiUrl(`${AI_FUN_SEVEN}/step3-guide`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const b = await res.json().catch(() => ({}));
    throw new Error(aiSevenErr(res, b));
  }
  return res.json();
}

export type AiFunStep4Supplement = {
  title_ko: string;
  intro_ko: string;
  bullets_ko: string[];
  disclaimer_ko: string;
};

export async function postAiFunStep4Supplement(lines: string[]): Promise<AiFunStep4Supplement> {
  const res = await fetch(apiUrl(`${AI_FUN_SEVEN}/step4-supplement`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lines }),
  });
  if (!res.ok) {
    const b = await res.json().catch(() => ({}));
    throw new Error(aiSevenErr(res, b));
  }
  return res.json();
}

export type AiFunStep5ProbabilityStory = {
  probability_bundle: WinProbabilityResponse;
  story_ko: string;
  disclaimer_ko: string;
};

export async function postAiFunStep5ProbabilityStory(opponent: string): Promise<AiFunStep5ProbabilityStory> {
  const res = await fetch(apiUrl(`${AI_FUN_SEVEN}/step5-probability-story`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ opponent }),
  });
  if (!res.ok) {
    const b = await res.json().catch(() => ({}));
    throw new Error(aiSevenErr(res, b));
  }
  return res.json();
}

/** 정적 23인 + AI 포메이션 추천 */
const WC_BASE = "/api/v1/worldcup2026";

export type CoreSquadPlayer = {
  id: number;
  name: string;
  position: string;
  number?: number;
  age?: number;
  /** 소속 클럽(한글 표기, 예시 데이터) */
  club_ko?: string;
};

export type CoreSquadBundle = {
  team_key: string;
  display_ko: string;
  display_en: string;
  note_ko?: string;
  players: CoreSquadPlayer[];
};

export type CoreFormationXiRow = {
  slot: string;
  player_id: number;
  player_name: string;
};

export type CoreSlotReasonKo = {
  slot: string;
  player_id?: number;
  player_name?: string;
  reason_ko: string;
};

export type CoreFormationRecommendation = {
  formation: string;
  formation_hint_ko: string;
  slots: string[];
  xi: CoreFormationXiRow[];
  slot_reasons_ko?: CoreSlotReasonKo[];
  notes_ko: string;
  rationale_ko: string;
};

export type CoreAiFormationsResponse = {
  team_key: string;
  display_ko?: string;
  display_en?: string;
  note_ko?: string;
  squad_size: number;
  formations_requested: string[];
  recommendations: CoreFormationRecommendation[];
};

export type CoreSquadTabKey = "korea" | "mexico" | "south_africa";

export function coreSquadPathForTab(tab: CoreSquadTabKey): string {
  if (tab === "south_africa") return "south-africa";
  return tab;
}

export async function getCoreSquad(tab: CoreSquadTabKey): Promise<CoreSquadBundle> {
  const pathSeg = coreSquadPathForTab(tab);
  const res = await fetch(apiUrl(`${WC_BASE}/core-squad/${pathSeg}`));
  if (!res.ok) {
    const b = await res.json().catch(() => ({})) as { detail?: string };
    throw new Error(typeof b.detail === "string" ? b.detail : res.statusText);
  }
  return res.json();
}

export async function postCoreSquadAiFormations(
  team: CoreSquadTabKey,
  formations?: string[],
): Promise<CoreAiFormationsResponse> {
  const res = await fetch(apiUrl(`${WC_BASE}/core-squad/ai-formations`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      team,
      ...(formations?.length ? { formations } : {}),
    }),
  });
  if (!res.ok) {
    const b = await res.json().catch(() => ({})) as { detail?: string };
    throw new Error(typeof b.detail === "string" ? b.detail : res.statusText);
  }
  return res.json();
}

/* -------- AI 놀이터 (한국 A조 재미용) -------- */

const AI_PLAYGROUND = `${WC_BASE}/ai-playground`;

export type PlaygroundCoachLineupRow = { slot: string; player_id: number };

export type PlaygroundCoachResult = {
  formation: string;
  opponent: string;
  lineup: Array<{
    slot: string;
    id?: number;
    name?: string;
    position?: string;
    age?: number;
    club_ko?: string;
  }>;
  win_spirit_percent: number;
  one_liner_ko: string;
  paragraph_ko: string;
  coach_mode_ko: string;
  disclaimer_ko: string;
};

export async function postPlaygroundCoachLineup(body: {
  formation: string;
  opponent: string;
  xi: PlaygroundCoachLineupRow[];
}): Promise<PlaygroundCoachResult> {
  const res = await fetch(apiUrl(`${AI_PLAYGROUND}/coach-lineup`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const b = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(typeof b.detail === "string" ? b.detail : res.statusText);
  }
  return res.json();
}

export type PlaygroundAceResult = {
  korea_player: { id?: number; name?: string; position?: string };
  opponent: string;
  opponent_ace_name: string;
  opponent_ace_ai_picked?: boolean;
  radar_korea: Record<string, number>;
  radar_opponent: Record<string, number>;
  story_ko: string;
  disclaimer_ko: string;
};

export async function postPlaygroundAceMatchup(body: {
  korea_player_id: number;
  opponent: string;
  opponent_ace_name?: string;
}): Promise<PlaygroundAceResult> {
  const res = await fetch(apiUrl(`${AI_PLAYGROUND}/ace-matchup`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const b = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(typeof b.detail === "string" ? b.detail : res.statusText);
  }
  return res.json();
}

export type PlaygroundCommentaryResult = {
  persona: string;
  situation_ko: string;
  lines_ko: string[];
  disclaimer_ko: string;
};

export async function postPlaygroundBiasedCommentary(body: {
  situation_ko: string;
  persona: "national_hype" | "cold_facts" | "hype";
}): Promise<PlaygroundCommentaryResult> {
  const res = await fetch(apiUrl(`${AI_PLAYGROUND}/biased-commentary`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const b = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(typeof b.detail === "string" ? b.detail : res.statusText);
  }
  return res.json();
}
