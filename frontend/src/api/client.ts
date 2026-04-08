/**
 * - 미설정: 로컬 개발 기본값 `http://localhost:8000`
 * - 빈 문자열 ``: 현재 페이지와 동일 출처로 요청 → 배포 시 호스트에서 `/api`를 백엔드로 프록시할 때 사용
 */
const envBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
const API_BASE =
  envBase === ""
    ? ""
    : (envBase ?? "http://localhost:8000").replace(/\/$/, "");

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (API_BASE === "") {
    return p;
  }
  return `${API_BASE}${p}`;
}

/** 빌드 시 박힌 API 베이스(비밀 아님) — 연결 실패 시 사용자 안내용 */
export function getConfiguredApiBase(): string {
  if (API_BASE === "") {
    return `${typeof window !== "undefined" ? window.location.origin : ""}(동일 출처 /api)`;
  }
  return API_BASE;
}

function _isHttpsPageCallingLocalhostApi(): boolean {
  if (typeof window === "undefined") return false;
  if (window.location.protocol !== "https:") return false;
  return API_BASE.startsWith("http://localhost") || API_BASE.startsWith("http://127.0.0.1");
}

/**
 * fetch가 네트워크 단계에서 실패할 때(백엔드 URL 오설정·Mixed content·슬립 등)
 * 브라우저 기본 메시지 "Failed to fetch" 대신 배포 환경에 맞는 안내로 바꿉니다.
 */
export function humanizeFetchError(error: unknown): string {
  if (!(error instanceof Error)) {
    return "요청 중 오류가 발생했습니다.";
  }
  const raw = (error.message || "").trim();
  const m = raw.toLowerCase();
  if (
    m === "failed to fetch" ||
    m.includes("networkerror") ||
    m.includes("load failed") ||
    m.includes("network request failed")
  ) {
    const base = getConfiguredApiBase();
    const mixed = _isHttpsPageCallingLocalhostApi();
    const head = mixed
      ? "지금 HTTPS 사이트인데 API가 http://localhost 로 박혀 있습니다. 브라우저가 막거나(Mixed content) 사용자 PC의 로컬 서버를 찾으려 해 연결이 실패합니다."
      : "서버에 연결할 수 없습니다.";
    return [
      head,
      `현재 이 앱이 호출하는 API: ${base}`,
      mixed
        ? "해결: 프론트를 다시 빌드할 때 .env.production 등에 VITE_API_BASE_URL=https://(백엔드 HTTPS 주소) 를 넣으세요. 끝에 / 없음. 그다음 정적 호스팅에 새 dist를 올립니다."
        : "배포(HTTPS)에서는 빌드 시 VITE_API_BASE_URL을 공개 백엔드 HTTPS 주소(예: https://○○.onrender.com)로 넣거나, 호스트에서 /api 를 백엔드로 넘기고 빌드 시 VITE_API_BASE_URL=(빈 값)으로 두는 방식을 쓸 수 있습니다.",
      "로컬 개발이면 백엔드(uvicorn)가 8000에서 떠 있는지, 방화벽·VPN을 확인하세요. Render 무료는 미사용 시 슬립되면 첫 요청이 느리거나 실패할 수 있습니다.",
      "휴대폰에서 같은 Wi-Fi로 테스트할 때는 빌드 시 VITE_API_BASE_URL을 PC의 사설 IP(http://192.168.x.x:8000)로 두고, uvicorn은 --host 0.0.0.0 으로 실행하세요.",
    ].join(" ");
  }
  return raw;
}
