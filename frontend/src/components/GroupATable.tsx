/**
 * A조 조별리그 순위표
 * 경기 전 상태: 전 팀 0경기 · 스탯 0
 * 경기가 시작되면 이 컴포넌트를 API 연동으로 업데이트 가능
 */

const GROUP_A_TEAMS = [
  { flag: "🇰🇷", name: "대한민국", nameEn: "Korea Republic", elo: 1820, highlight: true },
  { flag: "🇲🇽", name: "멕시코",   nameEn: "Mexico",         elo: 1775 },
  { flag: "🇨🇿", name: "체코",     nameEn: "Czech Republic", elo: 1670 },
  { flag: "🇿🇦", name: "남아공",   nameEn: "South Africa",   elo: 1620 },
];

const GROUP_A_SCHEDULE = [
  {
    match: 1,
    date: "2026-06-12",
    kstTime: "11:00",
    home: "🇰🇷 대한민국",
    away: "🇨🇿 체코",
    venue: "에스타디오 아크론 · 사포판",
  },
  {
    match: 2,
    date: "2026-06-12",
    kstTime: "미정",
    home: "🇲🇽 멕시코",
    away: "🇿🇦 남아공",
    venue: "미정",
  },
  {
    match: 3,
    date: "2026-06-19",
    kstTime: "10:00",
    home: "🇰🇷 대한민국",
    away: "🇲🇽 멕시코",
    venue: "에스타디오 아크론 · 사포판",
  },
  {
    match: 4,
    date: "2026-06-19",
    kstTime: "미정",
    home: "🇨🇿 체코",
    away: "🇿🇦 남아공",
    venue: "미정",
  },
  {
    match: 5,
    date: "2026-06-25",
    kstTime: "10:00",
    home: "🇰🇷 대한민국",
    away: "🇿🇦 남아공",
    venue: "에스타디오 BBVA · 과달루페",
  },
  {
    match: 6,
    date: "2026-06-25",
    kstTime: "미정",
    home: "🇨🇿 체코",
    away: "🇲🇽 멕시코",
    venue: "미정",
  },
];

export default function GroupATable() {
  return (
    <section className="panel group-a-section">
      <h2 className="panel-title">A조 현황 · 2026 FIFA 월드컵</h2>
      <p className="muted" style={{ marginTop: 0, fontSize: "0.88rem" }}>
        경기 전 기준 — ELO는 eloratings.net 추정치입니다.
      </p>

      {/* 순위표 */}
      <div className="table-wrap" style={{ marginBottom: "1.25rem" }}>
        <table className="data-table group-a-table">
          <thead>
            <tr>
              <th>#</th>
              <th>팀</th>
              <th title="경기 수">경</th>
              <th title="승">승</th>
              <th title="무">무</th>
              <th title="패">패</th>
              <th title="득점">득</th>
              <th title="실점">실</th>
              <th title="득실차">±</th>
              <th title="승점">점</th>
              <th title="ELO 레이팅">ELO</th>
            </tr>
          </thead>
          <tbody>
            {GROUP_A_TEAMS.map((team, idx) => (
              <tr key={team.nameEn} className={team.highlight ? "group-a-table__row--highlight" : ""}>
                <td style={{ fontWeight: 700, color: "var(--color-muted)" }}>{idx + 1}</td>
                <td>
                  <span className="group-a-table__team">
                    <span aria-hidden>{team.flag}</span>
                    <span>{team.name}</span>
                    <span className="muted" style={{ fontSize: "0.78rem" }}>{team.nameEn}</span>
                  </span>
                </td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td style={{ fontWeight: 800 }}>0</td>
                <td>
                  <span className="elo-badge">{team.elo}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 일정표 */}
      <h3 className="panel-title" style={{ fontSize: "1rem" }}>A조 경기 일정</h3>
      <div className="table-wrap">
        <table className="data-table group-a-schedule">
          <thead>
            <tr>
              <th>차전</th>
              <th>날짜</th>
              <th>KST</th>
              <th>홈</th>
              <th></th>
              <th>어웨이</th>
              <th>경기장</th>
            </tr>
          </thead>
          <tbody>
            {GROUP_A_SCHEDULE.map((g) => {
              const isKoreaMatch = g.home.includes("대한민국") || g.away.includes("대한민국");
              return (
                <tr key={g.match} className={isKoreaMatch ? "group-a-schedule__row--korea" : ""}>
                  <td style={{ fontWeight: 700 }}>{g.match}차전</td>
                  <td className="muted" style={{ fontSize: "0.85rem" }}>{g.date}</td>
                  <td style={{ fontWeight: 600 }}>{g.kstTime}</td>
                  <td style={{ textAlign: "right" }}>{g.home}</td>
                  <td style={{ fontWeight: 800, color: "var(--color-muted)", textAlign: "center" }}>vs</td>
                  <td>{g.away}</td>
                  <td className="muted" style={{ fontSize: "0.8rem" }}>{g.venue}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="muted" style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
        * 2·4·6차전 시간·경기장은 FIFA 발표 확인 필요. KST 시간 = 한국 표준시 기준.
      </p>
    </section>
  );
}
