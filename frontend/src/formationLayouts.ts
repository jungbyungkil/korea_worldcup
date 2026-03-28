/** Must match backend ai_best_xi.FORMATION_SLOTS slot ids (순서 = AI 놀이터 슬롯 선택 UI) */

export const FORMATION_SLOT_ORDER: Record<string, string[]> = {
  "4-1-4-1": ["GK", "RB", "RCB", "LCB", "LB", "CDM", "RM", "RCM", "LCM", "LM", "ST"],
  "4-4-2": ["GK", "RB", "RCB", "LCB", "LB", "RM", "RCM", "LCM", "LM", "ST_L", "ST_R"],
  "4-3-3": ["GK", "RB", "RCB", "LCB", "LB", "RCM", "CM", "LCM", "RW", "ST", "LW"],
  "3-5-2": ["GK", "RCB", "CB", "LCB", "RWB", "RCM", "CM", "LCM", "LWB", "ST_L", "ST_R"],
  "5-3-2": ["GK", "LWB", "LCB", "CB", "RCB", "RWB", "CM_L", "CM", "CM_R", "ST_L", "ST_R"],
};

export const FORMATIONS: { id: string; label: string; desc: string }[] = [
  {
    id: "4-1-4-1",
    label: "4-1-4-1",
    desc: "수비형 미드 1명이 중앙을 잡고, 양쪽 윙·2선 미드·원톱으로 연결하는 형태.",
  },
  {
    id: "4-4-2",
    label: "4-4-2",
    desc: "공수 밸런스가 좋은 전통적인 포메이션.",
  },
  {
    id: "4-3-3",
    label: "4-3-3",
    desc: "윙어를 활용한 공격적인 포메이션.",
  },
  {
    id: "3-5-2",
    label: "3-5-2",
    desc: "윙백 비중이 높은 수비 전환·중원 우위를 노리는 포메이션.",
  },
  {
    id: "5-3-2",
    label: "5-3-2",
    desc: "수비 라인을 두껍게 두는 수비적으로 안정을 꾀하는 포메이션.",
  },
];

const COORDS: Record<string, Record<string, { left: number; top: number }>> = {
  "4-1-4-1": {
    ST: { left: 50, top: 7 },
    LM: { left: 11, top: 22 },
    LCM: { left: 33, top: 24 },
    RCM: { left: 67, top: 24 },
    RM: { left: 89, top: 22 },
    /* LCM/RCM 아래로 충분히 내림 — 카드 높이 고려해 겹침 방지 */
    CDM: { left: 50, top: 47 },
    LB: { left: 15, top: 56 },
    LCB: { left: 35, top: 58 },
    RCB: { left: 65, top: 58 },
    /* translate(-50%) 반폭이 피치 밖으로 나가지 않게 안쪽 배치 */
    RB: { left: 85, top: 56 },
    GK: { left: 50, top: 82 },
  },
  "4-4-2": {
    ST_L: { left: 36, top: 8 },
    ST_R: { left: 64, top: 8 },
    LM: { left: 12, top: 30 },
    LCM: { left: 34, top: 34 },
    RCM: { left: 66, top: 34 },
    RM: { left: 88, top: 30 },
    LB: { left: 14, top: 58 },
    LCB: { left: 35, top: 60 },
    RCB: { left: 65, top: 60 },
    RB: { left: 86, top: 58 },
    GK: { left: 50, top: 84 },
  },
  "4-3-3": {
    LW: { left: 14, top: 10 },
    ST: { left: 50, top: 12 },
    RW: { left: 86, top: 10 },
    LCM: { left: 30, top: 36 },
    CM: { left: 50, top: 38 },
    RCM: { left: 70, top: 36 },
    LB: { left: 13, top: 58 },
    LCB: { left: 36, top: 60 },
    RCB: { left: 64, top: 60 },
    RB: { left: 87, top: 58 },
    GK: { left: 50, top: 84 },
  },
  "3-5-2": {
    ST_L: { left: 38, top: 9 },
    ST_R: { left: 62, top: 9 },
    LWB: { left: 10, top: 32 },
    LCM: { left: 32, top: 34 },
    CM: { left: 50, top: 36 },
    RCM: { left: 68, top: 34 },
    RWB: { left: 90, top: 32 },
    LCB: { left: 28, top: 60 },
    CB: { left: 50, top: 62 },
    RCB: { left: 72, top: 60 },
    GK: { left: 50, top: 86 },
  },
  "5-3-2": {
    ST_L: { left: 38, top: 9 },
    ST_R: { left: 62, top: 9 },
    CM_L: { left: 30, top: 38 },
    CM: { left: 50, top: 40 },
    CM_R: { left: 70, top: 38 },
    LWB: { left: 8, top: 52 },
    LCB: { left: 26, top: 58 },
    CB: { left: 50, top: 60 },
    RCB: { left: 74, top: 58 },
    RWB: { left: 92, top: 52 },
    GK: { left: 50, top: 88 },
  },
};

export function getSlotCoords(formation: string, slot: string): { left: number; top: number } {
  return COORDS[formation]?.[slot] ?? { left: 50, top: 45 };
}

/** 백엔드 ``FORMATION_SLOTS`` 와 동일한 슬롯 배열 */
export function slotsForFormation(formationId: string): string[] {
  return FORMATION_SLOT_ORDER[formationId] ?? [];
}

export const SLOT_LABEL_KO: Record<string, string> = {
  GK: "골키퍼",
  RB: "RB",
  RCB: "RCB",
  LCB: "LCB",
  LB: "LB",
  CDM: "CDM",
  RM: "RM",
  RCM: "RCM",
  LCM: "LCM",
  LM: "LM",
  ST: "ST",
  ST_L: "좌 ST",
  ST_R: "우 ST",
  CM: "CM",
  RW: "RW",
  LW: "LW",
  RWB: "RWB",
  LWB: "LWB",
  CM_L: "좌 CM",
  CM_R: "우 CM",
};
