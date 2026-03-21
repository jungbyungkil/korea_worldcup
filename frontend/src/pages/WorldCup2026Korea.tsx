import { useEffect, useMemo, useState } from "react";
import { getKoreaFixtures, getKoreaOverview, type Fixture, type KoreaFixtures, type KoreaOverview } from "../api/worldcup2026";
import FirstGroupMatchSpotlight from "../components/FirstGroupMatchSpotlight";
import MexicoMatchSpotlight from "../components/MexicoMatchSpotlight";
import SouthAfricaMatchSpotlight from "../components/SouthAfricaMatchSpotlight";
import SupplementDataPanel from "../components/SupplementDataPanel";
import { bucketByCompetition } from "../lib/fixtureBuckets";

/** A조에서 멕시코·남아공이 아닌 경기 = 1차전(UEFA 플레이오프 D 승자)로 간주 */
function pickFirstGroupMatch(fixtures: Fixture[]): Fixture | null {
  const isMex = (o: string) => /mexico|méxico|메시코/i.test(o);
  const isSA = (o: string) => /south africa|남아프리카/i.test(o);
  const withDate = fixtures
    .filter((f) => Boolean(f.date?.trim()))
    .sort((a, b) => (a.date as string).localeCompare(b.date as string));
  for (const f of withDate) {
    const o = f.opponent ?? "";
    if (isMex(o) || isSA(o)) continue;
    return f;
  }
  return null;
}

export default function WorldCup2026Korea() {
  const [overview, setOverview] = useState<KoreaOverview | null>(null);
  const [fixtures, setFixtures] = useState<KoreaFixtures | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([getKoreaOverview(), getKoreaFixtures()])
      .then(([o, f]) => {
        setOverview(o);
        setFixtures(f);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "오류 발생"))
      .finally(() => setLoading(false));
  }, []);

  const buckets = useMemo(() => bucketByCompetition(fixtures?.fixtures ?? []), [fixtures]);

  const firstGroupFixture = useMemo(
    () => pickFirstGroupMatch(buckets.worldCup),
    [buckets.worldCup]
  );

  const firstMatchKickoffIso = useMemo(() => {
    const d = firstGroupFixture?.date?.trim();
    if (!d) return null;
    const parsed = new Date(d);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }, [firstGroupFixture]);

  const mexicoFixture = useMemo((): Fixture | null => {
    for (const f of buckets.worldCup) {
      const o = f.opponent ?? "";
      if (/mexico|méxico|메시코/i.test(o)) return f;
    }
    return null;
  }, [buckets.worldCup]);

  const mexicoKickoffIso = useMemo(() => {
    const d = mexicoFixture?.date?.trim();
    if (!d) return null;
    const parsed = new Date(d);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }, [mexicoFixture]);

  const southAfricaFixture = useMemo((): Fixture | null => {
    for (const f of buckets.worldCup) {
      const o = f.opponent ?? "";
      if (/south africa|남아프리카/i.test(o)) return f;
    }
    return null;
  }, [buckets.worldCup]);

  const southAfricaKickoffIso = useMemo(() => {
    const d = southAfricaFixture?.date?.trim();
    if (!d) return null;
    const parsed = new Date(d);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }, [southAfricaFixture]);

  if (loading) return <div className="loading-screen">불러오는 중…</div>;
  if (error)
    return (
      <main className="page">
        <h1 className="page-title">2026 북중미 월드컵 · 대한민국</h1>
        <p className="text-error">{error}</p>
        <div className="alert-box">
          <p style={{ marginTop: 0, fontWeight: 700 }}>설정 체크</p>
          <ol style={{ margin: 0, paddingLeft: "1.1rem" }} className="muted">
            <li>
              <code>backend/.env</code>에 <strong>API_FOOTBALL_KEY</strong>
            </li>
            <li>백엔드 재시작</li>
          </ol>
        </div>
      </main>
    );

  return (
    <main className="page">
      <h1 className="page-title">2026 북중미 월드컵 · 대한민국</h1>
      <p className="page-lead">
        최신 업데이트: {overview?.last_updated ? new Date(overview.last_updated).toLocaleString() : "-"} · A조 (
        {overview?.status.groups_confirmed ? "조편성 확정" : "조편성 미확정"}) · 감독{" "}
        <strong>홍명보</strong> (홍명보호 성인 2기, 나무위키 등 커뮤니티 표기)
      </p>

      <SupplementDataPanel />

      <FirstGroupMatchSpotlight
        officialKickoffIso={firstMatchKickoffIso}
        officialVenue={firstGroupFixture?.venue}
        officialCity={firstGroupFixture?.city}
        opponentFromApi={firstGroupFixture?.opponent}
      />

      <MexicoMatchSpotlight
        officialKickoffIso={mexicoKickoffIso}
        officialVenue={mexicoFixture?.venue}
        officialCity={mexicoFixture?.city}
      />

      <SouthAfricaMatchSpotlight
        officialKickoffIso={southAfricaKickoffIso}
        officialVenue={southAfricaFixture?.venue}
        officialCity={southAfricaFixture?.city}
      />
    </main>
  );
}
