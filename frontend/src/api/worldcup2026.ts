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
