import type { Fixture } from "../api/worldcup2026";

/** 본선·예선·친선 등으로 경기 목록 분류 (대시보드 스포트라이트용) */
export function bucketByCompetition(fixtures: Fixture[]) {
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
