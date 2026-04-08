import { apiUrl, humanizeFetchError } from "./client";

const BASE = "/api/v1/worldcup2026/ai-insights";

export type AiInsightPayload = {
  lines_ko: string[];
  disclaimer_ko: string;
};

async function postJson<T>(path: string, body: object = {}): Promise<T> {
  const r = await fetch(apiUrl(`${BASE}${path}`), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    let detail = r.statusText;
    try {
      const j = (await r.json()) as { detail?: unknown };
      if (typeof j.detail === "string") detail = j.detail;
    } catch {
      /* ignore */
    }
    throw new Error(`[HTTP ${r.status}] ${detail}`);
  }
  return r.json() as Promise<T>;
}

export function postAiHomeWelcome(): Promise<AiInsightPayload> {
  return postJson<AiInsightPayload>("/home-welcome");
}

export function postAiAGroupLens(): Promise<AiInsightPayload> {
  return postJson<AiInsightPayload>("/a-group-lens");
}

export function postAiSpotlightTeaser(spot: "czech_republic" | "mexico" | "south_africa"): Promise<AiInsightPayload> {
  return postJson<AiInsightPayload>("/spotlight-teaser", { spot });
}

export function postAiHistoryYear(payload: {
  year: number;
  host?: string;
  result_label?: string;
  highlights?: string;
}): Promise<AiInsightPayload> {
  return postJson<AiInsightPayload>("/history-year", payload);
}

export function postAiWc2026Snack(): Promise<AiInsightPayload> {
  return postJson<AiInsightPayload>("/wc2026-snack");
}

export function postAiKoreaNtStory(): Promise<AiInsightPayload> {
  return postJson<AiInsightPayload>("/korea-nt-story");
}

export function postAiPlaygroundWarmup(): Promise<AiInsightPayload> {
  return postJson<AiInsightPayload>("/playground-warmup");
}

export function humanizeAiInsightError(e: unknown): string {
  return humanizeFetchError(e);
}
