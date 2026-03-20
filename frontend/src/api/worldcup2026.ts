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

export interface AiOpinion {
  ai: {
    summary: string;
    key_points: string[];
    risks: string[];
    watch_matches: string[];
    assumptions: string[];
  };
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

export async function postAiOpinion(payload: { data: unknown; question?: string }): Promise<AiOpinion> {
  const res = await fetch(apiUrl("/api/v1/worldcup2026/ai-opinion"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(body.detail || "AI 의견 생성에 실패했습니다.");
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
