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

export interface WcTournamentTsdbHighlight {
  id_event?: string | null;
  event_name?: string | null;
  video_url?: string | null;
  thumb_url?: string | null;
  poster_url?: string | null;
  season?: string | null;
  league?: string | null;
  /** YYYY-MM-DD */
  date_event?: string | null;
}

export interface KoreaWcTournamentDetailResponse {
  year: number;
  tournament: KoreaWorldCupTournament;
  team?: string;
  fifa_code?: string;
  summary?: KoreaWorldCupHistoryResponse["summary"];
  tsdb: {
    query_date: string;
    query_label_ko?: string;
    league_id: number;
    source: string;
    highlights: WcTournamentTsdbHighlight[];
    error: string | null;
    note_ko: string;
  };
}

export async function getKoreaWorldCupTournamentDetail(year: number): Promise<KoreaWcTournamentDetailResponse> {
  const res = await fetch(apiUrl(`/api/v1/korea/world-cup-tournament/${year}`));
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(body.detail || "대회 상세를 불러오지 못했습니다.");
  }
  return res.json();
}

/** YouTube watch / youtu.be → embed용 video id */
export function youtubeVideoIdFromUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const href = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    const u = new URL(href);
    if (u.hostname === "youtu.be" || u.hostname.endsWith(".youtu.be")) {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id || null;
    }
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const embed = u.pathname.match(/\/embed\/([^/?]+)/);
      if (embed) return embed[1];
      const shorts = u.pathname.match(/\/shorts\/([^/?]+)/);
      if (shorts) return shorts[1];
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function youtubeEmbedUrl(url: string | null | undefined): string | null {
  const id = youtubeVideoIdFromUrl(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}
