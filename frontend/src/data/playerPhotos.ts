/** 한국 대표팀 선수 사진 URL (TheSportsDB CDN) */
export const KOREA_PLAYER_PHOTOS: Record<number, string> = {
  1101: "https://r2.thesportsdb.com/images/media/player/thumb/unbf8w1751085788.jpg",   // 조현우
  1102: "https://www.thesportsdb.com/images/media/player/thumb/zi3nwe1778974469.jpg",  // 송범근
  1103: "https://www.thesportsdb.com/images/media/player/thumb/fxe84i1778971604.jpg",  // 김승규
  1104: "https://www.thesportsdb.com/images/media/player/thumb/flx3cd1778971805.jpg",  // 김민재
  1108: "https://www.thesportsdb.com/images/media/player/thumb/e6nmfe1778973764.jpg",  // 박진섭
  1110: "https://www.thesportsdb.com/images/media/player/thumb/cy4mju1778973897.jpg",  // 설영우
  1111: "https://www.thesportsdb.com/images/media/player/thumb/7xq5l01778973330.jpg",  // 이한범
  1112: "https://www.thesportsdb.com/images/media/player/thumb/7pvfob1778971521.jpg",  // 황인범
  1113: "https://www.thesportsdb.com/images/media/player/thumb/n0hew31778972474.jpg",  // 이강인
  1114: "https://www.thesportsdb.com/images/media/player/thumb/r5abfl1778974278.jpg",  // 손흥민
  1115: "https://www.thesportsdb.com/images/media/player/thumb/c3so0c1778972640.jpg",  // 이재성
  1116: "https://www.thesportsdb.com/images/media/player/thumb/cgr5971778971405.jpg",  // 황희찬
  1117: "https://r2.thesportsdb.com/images/media/player/thumb/7vpkp41747754671.jpg",   // 백승호
  1119: "https://www.thesportsdb.com/images/media/player/thumb/keelj71778970626.jpg",  // 조규성
  1121: "https://www.thesportsdb.com/images/media/player/thumb/5bzf6y1778973507.jpg",  // 오현규
  1125: "https://www.thesportsdb.com/images/media/player/thumb/67ov861778972188.jpg",  // 김태현
  1127: "https://www.thesportsdb.com/images/media/player/thumb/5htf671778973218.jpg",  // 이태석
  1128: "https://www.thesportsdb.com/images/media/player/thumb/bcnyom1778970409.jpg",  // 옌스 카스트로프
  1129: "https://www.thesportsdb.com/images/media/player/thumb/8a8x381778972090.jpg",  // 김문환
  1130: "https://www.thesportsdb.com/images/media/player/thumb/mlrn6y1778974742.jpg",  // 양현준
  1131: "https://www.thesportsdb.com/images/media/player/thumb/xrn3va1778972321.jpg",  // 김진규
  1132: "https://www.thesportsdb.com/images/media/player/thumb/k9nwjc1778970284.jpg",  // 배준호
  1134: "https://www.thesportsdb.com/images/media/player/thumb/ezngq51778972832.jpg",  // 이동경
  // 추가분 (2026-05-23)
  1124: "https://www.thesportsdb.com/images/media/player/thumb/crbx981778974609.jpg",  // 조유민
  1126: "https://www.thesportsdb.com/images/media/player/thumb/1n2klf1778970178.jpg",  // 이기혁
  1133: "https://www.thesportsdb.com/images/media/player/thumb/pxo6q91778972932.jpg",  // 엄지성
};

export function getPlayerPhoto(id: number): string | null {
  return KOREA_PLAYER_PHOTOS[id] ?? null;
}
