import { apiUrl } from "./client";

export interface KoreaWorldCupTournament {
  year: number;
  host: string;
  stage: string;
  result_label: string;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  highlights: string;
}

export interface KoreaWorldCupHistoryResponse {
  team: string;
  fifa_code: string;
  summary: {
    first_appearance: number;
    total_finals: number;
    best_finish: string;
    best_finish_year: number;
    notes?: string;
  };
  tournaments: KoreaWorldCupTournament[];
  disclaimer?: string;
}

export async function getKoreaWorldCupHistory(): Promise<KoreaWorldCupHistoryResponse> {
  const res = await fetch(apiUrl("/api/v1/korea/world-cup-history"));
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(body.detail || "이력을 불러오지 못했습니다.");
  }
  return res.json();
}
