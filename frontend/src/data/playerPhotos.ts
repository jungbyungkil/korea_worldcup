/**
 * 한국 대표팀 선수 사진 URL
 * 출처: 대한축구협회(KFA) 공식 홈페이지 (files.joinkfa.com)
 * 업데이트: 2026-06-09 — 조유민→조위제 교체 반영 (2026-06-01 KFA 발표)
 */
export const KOREA_PLAYER_PHOTOS: Record<number, string> = {
  // GK
  1101: "https://files.joinkfa.com/NAT/2026/PHOTO/S/%EC%82%AC%EC%A7%84_2026033002485565852.jpg",  // 조현우
  1102: "https://files.joinkfa.com/NAT/2026/PHOTO/S/%EC%82%AC%EC%A7%84_202603300248414837.jpg",   // 송범근
  1103: "https://files.joinkfa.com/NAT/2026/PHOTO/S/%EC%82%AC%EC%A7%84_2026033002482776350.jpg",  // 김승규
  // DF
  1104: "https://files.joinkfa.com/NAT/2026/PHOTO/S/%EC%82%AC%EC%A7%84_2026033002493130268.jpg",  // 김민재
  1108: "https://files.joinkfa.com/NAT/2026/PHOTO/S/%EC%82%AC%EC%A7%84_2026033002535338487.jpg",  // 박진섭
  1110: "https://files.joinkfa.com/NAT/2026/PHOTO/S/%EC%82%AC%EC%A7%84_2026033002501629668.jpg",  // 설영우
  1111: "https://files.joinkfa.com/NAT/2026/PHOTO/S/%EC%82%AC%EC%A7%84_2026033002514319670.jpg",  // 이한범
  1124: "https://files.joinkfa.com/NAT/2026/PHOTO/%EC%82%AC%EC%A7%84_2026060213033994769.jpg",  // 조위제
  1125: "https://files.joinkfa.com/NAT/2026/PHOTO/S/%EC%82%AC%EC%A7%84_2026033002495934223.jpg",  // 김태현
  1126: "https://files.joinkfa.com/NAT/2026/PHOTO/S/%EC%82%AC%EC%A7%84_2026051815125158052.jpg",  // 이기혁
  1127: "https://files.joinkfa.com/NAT/2026/PHOTO/S/%EC%82%AC%EC%A7%84_2026033002511410494.jpg",  // 이태석
  1128: "https://files.joinkfa.com/NAT/2026/PHOTO/S/%EC%82%AC%EC%A7%84_2026033002505256652.jpg",  // 옌스 카스트로프
  1129: "https://files.joinkfa.com/NAT/2026/PHOTO/S/%EC%82%AC%EC%A7%84_2026033002491758049.jpg",  // 김문환
  // MF
  1112: "https://files.joinkfa.com/NAT/2026/PHOTO/S/%EC%82%AC%EC%A7%84_2026051815131863094.jpg",  // 황인범
  1113: "https://files.joinkfa.com/NAT/2026/PHOTO/S/%EC%82%AC%EC%A7%84_2026033002590071347.jpg",  // 이강인
  1115: "https://files.joinkfa.com/NAT/2026/PHOTO/S/%EC%82%AC%EC%A7%84_2026033002594479181.jpg",  // 이재성
  1116: "https://files.joinkfa.com/NAT/2026/PHOTO/S/%EC%82%AC%EC%A7%84_2026033003004298993.jpg",  // 황희찬
  1117: "https://files.joinkfa.com/NAT/2026/PHOTO/S/%EC%82%AC%EC%A7%84_2026033002551399843.jpg",  // 백승호
  1130: "https://files.joinkfa.com/NAT/2026/PHOTO/S/%EC%82%AC%EC%A7%84_2026033002554547479.jpg",  // 양현준
  1131: "https://files.joinkfa.com/NAT/2026/PHOTO/S/%EC%82%AC%EC%A7%84_202603300253347636.jpg",   // 김진규
  1132: "https://files.joinkfa.com/NAT/2026/PHOTO/S/%EC%82%AC%EC%A7%84_2026033002543932368.jpg",  // 배준호
  1133: "https://files.joinkfa.com/NAT/2026/PHOTO/S/%EC%82%AC%EC%A7%84_2026033002564811366.jpg",  // 엄지성
  1134: "https://files.joinkfa.com/NAT/2026/PHOTO/S/%EC%82%AC%EC%A7%84_2026051815130675038.jpg",  // 이동경
  // FW
  1114: "https://files.joinkfa.com/NAT/2026/PHOTO/S/%EC%82%AC%EC%A7%84_2026033003005698673.jpg",  // 손흥민
  1119: "https://files.joinkfa.com/NAT/2026/PHOTO/S/%EC%82%AC%EC%A7%84_2026033003013091712.jpg",  // 조규성
  1121: "https://files.joinkfa.com/NAT/2026/PHOTO/S/%EC%82%AC%EC%A7%84_2026033003011051481.jpg",  // 오현규
};

export function getPlayerPhoto(id: number): string | null {
  return KOREA_PLAYER_PHOTOS[id] ?? null;
}
