import { getSlotCoords, SLOT_LABEL_KO } from "../formationLayouts";

export interface XiPlayer {
  slot: string;
  player_id: number;
  player_name: string;
}

type Props = {
  formation: string;
  xi: XiPlayer[];
};

export default function FormationPitch({ formation, xi }: Props) {
  return (
    <div className="formation-pitch-wrap">
      <div className="formation-pitch" aria-label={`${formation} 베스트 11`}>
        <div className="formation-pitch__grass" />
        <div className="formation-pitch__line formation-pitch__line--half" />
        <div className="formation-pitch__circle" />
        {xi.map((row) => {
          const { left, top } = getSlotCoords(formation, row.slot);
          const slotKo = SLOT_LABEL_KO[row.slot] ?? row.slot;
          return (
            <div
              key={row.slot}
              className="formation-mark"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              <div className="formation-mark__card">
                <div className="formation-mark__slot">{slotKo}</div>
                <div className="formation-mark__name">{row.player_name}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
