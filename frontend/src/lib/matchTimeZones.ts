const TZ_LOCAL_MEXICO_CENTRAL = "America/Mexico_City";
const TZ_KOREA = "Asia/Seoul";
const TZ_ATLANTA = "America/New_York";

export function formatInTimeZone(isoOrDate: Date | string, timeZone: string): string {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone,
    weekday: "short",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export function formatUtc(isoOrDate: Date | string): string {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "UTC",
    weekday: "short",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).format(d);
}

/** 과달라하라·멕시코시티 등 중부 멕시코 */
export function formatMexicoLocal(isoOrDate: Date | string): string {
  return formatInTimeZone(isoOrDate, TZ_LOCAL_MEXICO_CENTRAL);
}

export function formatKoreaTime(isoOrDate: Date | string): string {
  return formatInTimeZone(isoOrDate, TZ_KOREA);
}

/** 경기장 현지 타임존 + KST + UTC + 애틀랜타(참고) */
export function dualTimeRowsForVenue(
  isoUtc: string,
  localTimeZone: string,
  localLabel: string
): Array<{ label: string; value: string }> {
  return [
    { label: localLabel, value: formatInTimeZone(isoUtc, localTimeZone) },
    { label: "한국 (KST)", value: formatKoreaTime(isoUtc) },
    { label: "UTC", value: formatUtc(isoUtc) },
    { label: "애틀랜타(참고·동부)", value: formatInTimeZone(isoUtc, TZ_ATLANTA) },
  ];
}

/** @deprecated dualTimeRowsForVenue(..., "America/Mexico_City", "멕시코(중부) 현지") 사용 권장 */
export function dualTimeRowsForMexicoKickoff(isoUtc: string): Array<{ label: string; value: string }> {
  return dualTimeRowsForVenue(isoUtc, TZ_LOCAL_MEXICO_CENTRAL, "멕시코(중부) 현지");
}

export function countdownParts(target: Date, now: Date): { days: number; hours: number; mins: number; secs: number; ended: boolean } {
  const t = target.getTime();
  const n = now.getTime();
  if (Number.isNaN(t)) return { days: 0, hours: 0, mins: 0, secs: 0, ended: true };
  const diff = t - n;
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, ended: true };
  const secs = Math.floor(diff / 1000);
  return {
    days: Math.floor(secs / 86400),
    hours: Math.floor((secs % 86400) / 3600),
    mins: Math.floor((secs % 3600) / 60),
    secs: secs % 60,
    ended: false,
  };
}
