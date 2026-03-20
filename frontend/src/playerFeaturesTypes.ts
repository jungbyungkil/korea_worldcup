/** GET /api/v1/worldcup2026/korea/player-features */

export interface SquadPlayer {
  id: number;
  name: string;
  age?: number;
  number?: number | null;
  position?: string;
  photo?: string;
}

export interface ClubStatsLatest {
  league_id?: number;
  league_name?: string;
  league_season?: number;
  club_id?: number;
  club_name?: string;
  appearances?: number | string | null;
  minutes?: number | string | null;
  goals_total?: number | null;
  position?: string;
  rating?: string | number | null;
}

export interface EnrichedPlayer {
  id: number;
  name: string;
  number?: number | null;
  position?: string;
  age?: number;
  club_stats_latest?: ClubStatsLatest;
  club_stats_seasons_count?: number;
}

export interface InjuryRow {
  player_id?: number;
  player_name?: string;
  type?: string;
  reason?: string;
  league?: string;
}

export interface PlayerFeaturesConfig {
  player_limit?: number;
  include_club_stats?: boolean;
  include_lineups?: boolean;
  lineup_fixtures?: number;
}

/** POST /api/v1/worldcup2026/korea/best-xi */
export interface BestXiPlayer {
  slot: string;
  player_id: number;
  player_name: string;
}

export interface BestXiResponse {
  formation: string;
  formation_hint_ko: string;
  slots: string[];
  xi: BestXiPlayer[];
  notes_ko: string;
  rationale_ko: string;
}

export interface PlayerFeaturesResponse {
  last_updated: string;
  team_id: number | null;
  season_used_for_injuries?: number;
  squad_size?: number;
  players_enriched?: number;
  config?: PlayerFeaturesConfig;
  error?: string;
  squad: SquadPlayer[];
  injuries: InjuryRow[];
  players: EnrichedPlayer[];
  recent_lineups?: unknown[];
}

const POSITION_ORDER = ["Goalkeeper", "Defender", "Midfielder", "Attacker"] as const;
const POSITION_LABEL_KO: Record<string, string> = {
  Goalkeeper: "골키퍼",
  Defender: "수비",
  Midfielder: "미드필더",
  Attacker: "공격",
};

export function positionLabel(pos: string | undefined): string {
  if (!pos) return "기타";
  return POSITION_LABEL_KO[pos] ?? pos;
}

export function groupSquadByPosition(squad: SquadPlayer[]): Map<string, SquadPlayer[]> {
  const map = new Map<string, SquadPlayer[]>();
  for (const p of squad) {
    const key = p.position || "Other";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  }
  const ordered = new Map<string, SquadPlayer[]>();
  for (const key of POSITION_ORDER) {
    if (map.has(key)) ordered.set(key, map.get(key)!);
  }
  for (const [k, v] of map) {
    if (!ordered.has(k)) ordered.set(k, v);
  }
  return ordered;
}
