import { useCallback, useEffect, useMemo, useState } from "react";
import {
  postAiFunStep1Player,
  type AiFunStep1Condition,
  type AiFunStep1OneLiner,
  type AiFunStep1PositionPick,
  type AiFunStep1Sub,
} from "../api/worldcup2026";
import { groupSquadByPosition, positionLabel, type PlayerFeaturesResponse, type SquadPlayer } from "../playerFeaturesTypes";

type Props = { data: PlayerFeaturesResponse };

export default function PlayerAiStep1Panel({ data }: Props) {
  const [playerId, setPlayerId] = useState<number | null>(null);
  const [posKey, setPosKey] = useState<string>("Midfielder");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<AiFunStep1OneLiner | AiFunStep1Condition | AiFunStep1PositionPick | null>(null);

  const byPosition = useMemo(
    () => (data.squad ? groupSquadByPosition(data.squad) : new Map<string, SquadPlayer[]>()),
    [data.squad],
  );

  const squadOptions = useMemo(() => [...(data.squad ?? [])].sort((a, b) => (a.name || "").localeCompare(b.name || "")), [data.squad]);

  useEffect(() => {
    if (playerId == null && squadOptions.length) {
      setPlayerId(squadOptions[0].id);
    }
  }, [playerId, squadOptions]);

  const firstInPosId = useMemo(() => {
    const list = byPosition.get(posKey) ?? [];
    return list[0]?.id ?? null;
  }, [byPosition, posKey]);

  const posCount = byPosition.get(posKey)?.length ?? 0;

  const run = useCallback(
    async (sub: AiFunStep1Sub) => {
      const pid = sub === "position_pick" ? firstInPosId : playerId;
      if (pid == null) {
        setErr(sub === "position_pick" ? "해당 포지션에 선수가 없습니다." : "선수를 선택하세요.");
        return;
      }
      setLoading(true);
      setErr(null);
      setResult(null);
      try {
        const r = await postAiFunStep1Player({ sub, player_id: pid });
        setResult(r);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "요청 실패");
      } finally {
        setLoading(false);
      }
    },
    [playerId, firstInPosId, posCount],
  );

  return (
    <div className="panel ai-seven-panel">
      <h2 className="panel-title">① AI 재미 · 선수/포지션</h2>
      <p className="muted" style={{ marginTop: 0, fontSize: "0.88rem", lineHeight: 1.55 }}>
        스쿼드 데이터를 바탕으로 짧은 한 줄 평·컨디션 카드·같은 포지션 내 &quot;감독 픽&quot; 놀이를 생성합니다.{" "}
        <code>OPENAI_API_KEY</code> 필요.
      </p>

      <div className="ai-seven-row">
        <label className="ai-seven-label">
          선수 (한 줄 / 컨디션)
          <select
            className="ai-seven-select"
            value={playerId ?? ""}
            onChange={(e) => setPlayerId(Number(e.target.value) || null)}
          >
            {squadOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <div className="ai-seven-btn-row">
          <button type="button" className="btn btn-secondary" disabled={loading} onClick={() => void run("one_liner")}>
            오늘의 한 줄
          </button>
          <button type="button" className="btn btn-secondary" disabled={loading} onClick={() => void run("condition")}>
            컨디션 카드
          </button>
        </div>
      </div>

      <div className="ai-seven-row" style={{ marginTop: "0.85rem" }}>
        <label className="ai-seven-label">
          포지션 (감독 픽)
          <select className="ai-seven-select" value={posKey} onChange={(e) => setPosKey(e.target.value)}>
            {Array.from(byPosition.keys()).map((k) => (
              <option key={k} value={k}>
                {positionLabel(k)} ({byPosition.get(k)?.length ?? 0}명)
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="btn btn-primary"
          disabled={loading || firstInPosId == null || posCount < 2}
          onClick={() => void run("position_pick")}
        >
          이 포지션 AI 감독 픽
        </button>
      </div>

      {err ? <p className="text-error ai-seven-err">{err}</p> : null}
      {loading ? <p className="muted">생성 중…</p> : null}

      {result && result.sub === "one_liner" ? (
        <div className="ai-seven-result">
          <p className="ai-seven-line">{result.line_ko}</p>
          <p className="muted ai-seven-disclaimer">{result.disclaimer_ko}</p>
        </div>
      ) : null}
      {result && result.sub === "condition" ? (
        <div className="ai-seven-result">
          <p className="ai-seven-headline">
            <span aria-hidden>{result.mood_emoji}</span> {result.headline_ko}
          </p>
          <p>{result.body_ko}</p>
          <p className="muted ai-seven-disclaimer">{result.disclaimer_ko}</p>
        </div>
      ) : null}
      {result && result.sub === "position_pick" ? (
        <div className="ai-seven-result">
          <p className="ai-seven-teaser">{result.teaser_ko}</p>
          <p>{result.reason_ko}</p>
          <p className="muted" style={{ fontSize: "0.82rem" }}>
            선택 ID: {result.chosen_player_id}
          </p>
          <p className="muted ai-seven-disclaimer">{result.disclaimer_ko}</p>
        </div>
      ) : null}
    </div>
  );
}
