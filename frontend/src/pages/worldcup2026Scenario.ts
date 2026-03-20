import type { KoreaFixtures } from "../api/worldcup2026";

export const AI_BRIEFING_2026 = {
  source: "사용자 제공 Gemini 브리핑",
  verified: false,
  group: "A",
  opponents: ["멕시코", "남아프리카공화국", "유럽 플레이오프 패스 D 승자(미확정)"],
  schedule: [
    {
      round: "1차전",
      date_local: "2026-06-11",
      date_kr: "2026-06-12 (예상)",
      opponent: "유럽 플레이오프 패스 D 승자",
      venue: "아크론 경기장 (과달라하라)",
    },
    {
      round: "2차전",
      date_local: "2026-06-18",
      date_kr: "2026-06-19 (예상)",
      opponent: "멕시코",
      venue: "아크론 경기장 (과달라하라)",
    },
    {
      round: "3차전",
      date_local: "2026-06-24",
      date_kr: "2026-06-25 (예상)",
      opponent: "남아프리카공화국",
      venue: "BBVA 스타디움 (몬테레이)",
    },
  ],
  notes: [
    "48개국 체제(12개 조), 32강 토너먼트 시작",
    "대한민국 11회 연속 월드컵 본선 진출",
    "일부 상대/일정 정보는 미확정 또는 검증 필요",
  ],
};

export type ScenarioScheduleRow = (typeof AI_BRIEFING_2026.schedule)[number];

export function bucketByCompetition(fixtures: NonNullable<KoreaFixtures["fixtures"]>) {
  const qualifiers = fixtures.filter((f) => {
    const v = `${f.league ?? ""} ${f.stage ?? ""}`.toLowerCase();
    return v.includes("qualif") || v.includes("qualification");
  });
  const worldCup = fixtures.filter((f) => {
    const v = `${f.league ?? ""} ${f.stage ?? ""}`.toLowerCase();
    return v.includes("world cup") && !v.includes("qualif");
  });
  const friendlies = fixtures.filter((f) => {
    const v = `${f.league ?? ""} ${f.stage ?? ""}`.toLowerCase();
    return v.includes("friend");
  });
  const known = new Set<number>();
  [...qualifiers, ...worldCup, ...friendlies].forEach((f) => {
    if (typeof f.id === "number") known.add(f.id);
  });
  const other = fixtures.filter((f) => (typeof f.id === "number" ? !known.has(f.id) : true));
  return { qualifiers, worldCup, friendlies, other };
}

function scenarioOpponentMatchKey(opponent: string): string | null {
  const t = opponent.trim();
  if (!t) return null;
  const lower = t.toLowerCase();
  if (
    lower.includes("미확정") ||
    lower.includes("플레이오프") ||
    lower.includes("승자") ||
    lower.includes("유럽")
  ) {
    return null;
  }
  if (/멕시코|메시코/i.test(t)) return "mexico";
  if (/남아프리카|사우스\s*아프리카/i.test(t)) return "south africa";
  if (/일본/i.test(t)) return "japan";
  if (/이란/i.test(t)) return "iran";
  if (/호주|오스트레일리아/i.test(t)) return "australia";
  if (/사우디|사우디아라비아/i.test(t)) return "saudi arabia";
  if (/카타르/i.test(t)) return "qatar";
  if (/우즈벡/i.test(t)) return "uzbekistan";
  return lower.replace(/\s+/g, " ").trim() || null;
}

function officialNameMatchesScenarioKey(officialName: string | undefined, key: string): boolean {
  if (!officialName) return false;
  const o = officialName.toLowerCase();
  if (o === key || o.includes(key) || key.includes(o)) return true;
  const parts = key.split(/\s+/).filter((w) => w.length >= 3);
  if (parts.length) return parts.every((w) => o.includes(w));
  return false;
}

function extractYmdFromScenarioDate(local: string): string | null {
  const m = local.match(/(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

export function compareScenarioVsOfficialDates(
  schedule: ScenarioScheduleRow[],
  worldCupFixtures: NonNullable<KoreaFixtures["fixtures"]>
) {
  const skipped: Array<{ round: string; opponent: string; reason: string }> = [];
  const aligned: Array<{ round: string; opponent: string; scenarioDate: string; officialDate: string }> = [];
  const mismatches: Array<{
    round: string;
    opponent: string;
    scenarioDate: string;
    officialDate: string;
    officialOpponent?: string;
  }> = [];
  const noOfficialMatch: Array<{ round: string; opponent: string; scenarioDate: string }> = [];
  const usedOfficialIds = new Set<number>();

  for (const row of schedule) {
    const ymd = extractYmdFromScenarioDate(row.date_local);
    const key = scenarioOpponentMatchKey(row.opponent);
    if (key === null) {
      skipped.push({ round: row.round, opponent: row.opponent, reason: "미확정·플레이오프 등(자동 비교 제외)" });
      continue;
    }
    if (!ymd) {
      skipped.push({ round: row.round, opponent: row.opponent, reason: "시나리오 날짜 파싱 실패" });
      continue;
    }
    const candidates = worldCupFixtures.filter((f) => officialNameMatchesScenarioKey(f.opponent, key));
    if (!candidates.length) {
      noOfficialMatch.push({ round: row.round, opponent: row.opponent, scenarioDate: ymd });
      continue;
    }
    let best = candidates[0];
    let bestDist = Infinity;
    for (const c of candidates) {
      const cd = c.date && c.date.length >= 10 ? c.date.slice(0, 10) : "";
      if (!cd) continue;
      if (cd === ymd) {
        best = c;
        bestDist = 0;
        break;
      }
      const d0 = new Date(`${ymd}T00:00:00Z`).getTime();
      const d1 = new Date(`${cd}T00:00:00Z`).getTime();
      const dist = Math.abs(d0 - d1);
      if (dist < bestDist) {
        bestDist = dist;
        best = c;
      }
    }
    const od = best.date && best.date.length >= 10 ? best.date.slice(0, 10) : "";
    if (typeof best.id === "number") usedOfficialIds.add(best.id);
    if (od === ymd) {
      aligned.push({ round: row.round, opponent: row.opponent, scenarioDate: ymd, officialDate: od });
    } else if (od) {
      mismatches.push({
        round: row.round,
        opponent: row.opponent,
        scenarioDate: ymd,
        officialDate: od,
        officialOpponent: best.opponent,
      });
    } else {
      noOfficialMatch.push({ round: row.round, opponent: row.opponent, scenarioDate: ymd });
    }
  }

  const officialExtras = worldCupFixtures
    .filter((f) => typeof f.id === "number" && !usedOfficialIds.has(f.id))
    .map((f) => ({
      date: f.date && f.date.length >= 10 ? f.date.slice(0, 10) : "",
      opponent: f.opponent,
      league: f.league,
    }))
    .filter((x) => x.date);

  return { skipped, aligned, mismatches, noOfficialMatch, officialExtras };
}
