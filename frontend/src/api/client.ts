const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE.replace(/\/$/, "")}${p}`;
}

/** 빌드 시 박힌 API 베이스(비밀 아님) — 연결 실패 시 사용자 안내용 */
export function getConfiguredApiBase(): string {
  return API_BASE.replace(/\/$/, "");
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
    return [
      "서버에 연결할 수 없습니다.",
      `현재 이 앱이 호출하는 API 주소: ${base}`,
      "배포된 사이트(HTTPS)에서 볼 때는 프론트를 빌드할 때 VITE_API_BASE_URL을 실제 백엔드 HTTPS 주소(예: Render의 https://○○.onrender.com, 끝에 / 없이)로 넣었는지 확인하세요.",
      "https 페이지에서 http://localhost 또는 http API만 쓰면 브라우저가 요청을 막을 수 있습니다(Mixed content).",
      "백엔드가 꺼져 있거나(Render 무료는 미사용 시 슬립) 주소가 틀린 경우에도 같은 메시지가 납니다.",
    ].join(" ");
  }
  return raw;
}
