/**
 * SVG 헥사곤 레이더 차트
 * 한국 선수(파랑)와 상대(빨강) 두 폴리곤을 오버레이
 */

const CX = 150;
const CY = 145;
const R = 100;
const N = 6;

export type RadarData = Record<string, number>;

interface RadarChartProps {
  korea: RadarData;
  opponent: RadarData;
  keys: readonly string[];
  labels: Record<string, string>;
  krName: string;
  oppName: string;
}

function polarToXY(angle: number, r: number) {
  return [CX + r * Math.cos(angle), CY + r * Math.sin(angle)] as [number, number];
}

function toPolyPoints(data: RadarData, keys: readonly string[], angles: number[]): string {
  return keys
    .map((k, i) => {
      const v = Math.min(100, Math.max(0, data[k] ?? 0)) / 100;
      const [x, y] = polarToXY(angles[i], v * R);
      return `${x},${y}`;
    })
    .join(" ");
}

const GRID_LEVELS = [0.25, 0.5, 0.75, 1.0];
const GRID_LABELS = ["25", "50", "75", "100"];

export default function RadarChart({ korea, opponent, keys, labels, krName, oppName }: RadarChartProps) {
  // 첫 번째 축이 정상단(−90°)이 되도록
  const angles = keys.map((_, i) => -Math.PI / 2 + (i * 2 * Math.PI) / N);

  const krPolyPts = toPolyPoints(korea, keys, angles);
  const oppPolyPts = toPolyPoints(opponent, keys, angles);

  return (
    <div className="radar-wrap">
      {/* 범례 */}
      <div className="radar-legend">
        <span className="radar-legend__kr">🇰🇷 {krName}</span>
        <span className="radar-legend__opp">{oppName}</span>
      </div>

      <svg viewBox="0 0 300 295" className="radar-svg" aria-label="선수 스탯 레이더 차트">
        {/* 배경 격자 다각형 */}
        {GRID_LEVELS.map((level) => {
          const pts = keys.map((_, i) => polarToXY(angles[i], level * R).join(",")).join(" ");
          return (
            <polygon
              key={level}
              points={pts}
              fill="none"
              stroke="var(--radar-grid, #334)"
              strokeWidth="0.8"
              opacity="0.4"
            />
          );
        })}

        {/* 격자 레이블 (오른쪽 위 축에 표시) */}
        {GRID_LEVELS.map((level, gi) => {
          const [x, y] = polarToXY(angles[1], level * R);
          return (
            <text key={level} x={x + 3} y={y} fontSize="8" fill="var(--radar-label, #778)" opacity="0.8">
              {GRID_LABELS[gi]}
            </text>
          );
        })}

        {/* 축 선 */}
        {angles.map((angle, i) => {
          const [x, y] = polarToXY(angle, R);
          return (
            <line
              key={i}
              x1={CX}
              y1={CY}
              x2={x}
              y2={y}
              stroke="var(--radar-grid, #334)"
              strokeWidth="0.8"
              opacity="0.5"
            />
          );
        })}

        {/* 상대 폴리곤 (뒤) */}
        <polygon
          points={oppPolyPts}
          fill="rgba(239,83,80,0.18)"
          stroke="#ef5350"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* 한국 폴리곤 (앞) */}
        <polygon
          points={krPolyPts}
          fill="rgba(30,136,229,0.22)"
          stroke="#1e88e5"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* 한국 데이터 포인트 */}
        {keys.map((k, i) => {
          const v = Math.min(100, Math.max(0, korea[k] ?? 0)) / 100;
          const [x, y] = polarToXY(angles[i], v * R);
          return <circle key={k} cx={x} cy={y} r="4" fill="#1e88e5" />;
        })}

        {/* 상대 데이터 포인트 */}
        {keys.map((k, i) => {
          const v = Math.min(100, Math.max(0, opponent[k] ?? 0)) / 100;
          const [x, y] = polarToXY(angles[i], v * R);
          return <circle key={k} cx={x} cy={y} r="4" fill="#ef5350" />;
        })}

        {/* 축 레이블 */}
        {keys.map((k, i) => {
          const labelR = R + 22;
          const [lx, ly] = polarToXY(angles[i], labelR);
          return (
            <text
              key={k}
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="11.5"
              fontWeight="600"
              fill="var(--radar-text, #bcc)"
            >
              {labels[k] ?? k}
            </text>
          );
        })}

        {/* 중앙 점 */}
        <circle cx={CX} cy={CY} r="2.5" fill="var(--radar-center, #556)" />
      </svg>

      {/* 수치 표 */}
      <div className="radar-stats-row">
        {keys.map((k) => (
          <div key={k} className="radar-stat-cell">
            <span className="radar-stat-label">{labels[k] ?? k}</span>
            <span className="radar-stat-kr">{korea[k] ?? 0}</span>
            <span className="radar-stat-sep">·</span>
            <span className="radar-stat-opp">{opponent[k] ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
