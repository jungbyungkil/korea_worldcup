import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getCoreSquad,
  postCoreSquadAiFormations,
  type CoreAiFormationsResponse,
  type CoreFormationRecommendation,
  type CoreSquadBundle,
  type CoreSquadTabKey,
} from "../api/worldcup2026";
import { humanizeFetchError } from "../api/client";
import FormationPitch from "./FormationPitch";
import { FORMATIONS } from "../formationLayouts";

const POS_LABEL_KO: Record<string, string> = {
  GK: "골키퍼",
  DF: "수비",
  MF: "미드필더",
  FW: "공격",
};

function positionLabelKo(code: string): string {
  return POS_LABEL_KO[code] ?? code;
}

export type CoreSquadSectionProps = {
  teamKey: CoreSquadTabKey;
  /** 섹션 제목 앞 접두 (예: "한국 대표") */
  headingPrefix?: string;
};

export default function CoreSquadSection({ teamKey, headingPrefix }: CoreSquadSectionProps) {
  const [bundle, setBundle] = useState<CoreSquadBundle | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [loadingSquad, setLoadingSquad] = useState(true);

  const [aiOut, setAiOut] = useState<CoreAiFormationsResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiErr, setAiErr] = useState<string | null>(null);
  const [pickedFormation, setPickedFormation] = useState<string>(() => FORMATIONS[0]?.id ?? "");

  useEffect(() => {
    setLoadingSquad(true);
    setLoadErr(null);
    setBundle(null);
    setAiOut(null);
    setAiErr(null);
    setPickedFormation(FORMATIONS[0]?.id ?? "");
    void getCoreSquad(teamKey)
      .then(setBundle)
      .catch((e) => setLoadErr(humanizeFetchError(e)))
      .finally(() => setLoadingSquad(false));
  }, [teamKey]);

  const runAi = useCallback(() => {
    if (!pickedFormation.trim()) {
      setAiErr("포메이션을 선택하세요.");
      return;
    }
    setAiLoading(true);
    setAiErr(null);
    setAiOut(null);
    void postCoreSquadAiFormations(teamKey, [pickedFormation])
      .then(setAiOut)
      .catch((e) => setAiErr(humanizeFetchError(e)))
      .finally(() => setAiLoading(false));
  }, [teamKey, pickedFormation]);

  const sectionTitle = headingPrefix
    ? `${headingPrefix} · 예시 23인 & 감독 AI 포메이션`
    : `${bundle?.display_ko ?? ""} · 예시 23인 & 감독 AI 포메이션`;

  return (
    <div className="core-squad-section">
      <section className="panel">
        <h2 className="panel-title">{bundle ? sectionTitle : "예시 23인 & 감독 AI 포메이션"}</h2>
        <p className="muted" style={{ marginTop: 0, fontSize: "0.88rem", lineHeight: 1.55 }}>
          앱에 포함된 <strong>예시 23인</strong>과, OpenAI가 감독 관점에서 뽑는 <strong>포메이션별 베스트 11</strong>·
          <strong>슬롯별 선정 이유</strong>입니다. 실제 본선 명단과 다를 수 있습니다.
        </p>
      </section>

      {loadingSquad ? <p className="muted">23인 불러오는 중…</p> : null}
      {loadErr ? <p className="text-error">{loadErr}</p> : null}

      {bundle ? (
        <>
          <section className="panel" style={{ marginTop: "0.75rem" }}>
            <h3 className="panel-title" style={{ fontSize: "1.05rem" }}>
              명단 <span className="muted">({bundle.display_en})</span>
            </h3>
            {bundle.note_ko ? (
              <p className="muted" style={{ fontSize: "0.88rem", lineHeight: 1.6 }}>
                {bundle.note_ko}
              </p>
            ) : null}
            <div className="table-wrap" style={{ marginTop: "0.65rem" }}>
              <table className="data-table core-squad-table">
                <thead>
                  <tr>
                    <th>번호</th>
                    <th>이름</th>
                    <th>포지션</th>
                    <th>나이</th>
                    <th>소속(클럽)</th>
                  </tr>
                </thead>
                <tbody>
                  {bundle.players.map((p) => (
                    <tr key={p.id}>
                      <td>{p.number ?? "—"}</td>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td>
                        <span title={p.position}>{positionLabelKo(p.position)}</span>
                        <span className="muted" style={{ fontSize: "0.78rem", marginLeft: "0.35rem" }}>
                          ({p.position})
                        </span>
                      </td>
                      <td>{p.age != null ? `${p.age}` : "—"}</td>
                      <td className="muted" style={{ fontSize: "0.88rem" }}>
                        {p.club_ko?.trim() ? p.club_ko : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel ai-seven-panel" style={{ marginTop: "1rem" }}>
            <h3 className="panel-title" style={{ fontSize: "1.05rem" }}>
              감독 AI — 포메이션별 선발 11 & 슬롯 이유
            </h3>
            <p className="muted" style={{ marginTop: 0, fontSize: "0.86rem" }}>
              선택한 포메이션에 대해 AI를 한 번 호출합니다. 시간이 걸릴 수 있습니다.
            </p>
            <div className="formation-select-wrap">
              <label htmlFor={`core-squad-formation-${teamKey}`}>포메이션</label>
              <select
                id={`core-squad-formation-${teamKey}`}
                className="formation-select"
                value={pickedFormation}
                onChange={(e) => setPickedFormation(e.target.value)}
                disabled={aiLoading}
              >
                {FORMATIONS.map((f) => (
                  <option key={f.id} value={f.id} title={f.desc}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" className="btn btn-primary" style={{ marginTop: "0.75rem" }} disabled={aiLoading} onClick={runAi}>
              {aiLoading ? "AI 생성 중…" : "이 포메이션으로 추천 받기"}
            </button>
            {aiErr ? <p className="text-error" style={{ marginTop: "0.65rem" }}>{aiErr}</p> : null}
          </section>

          {aiOut?.recommendations?.length ? (
            <div style={{ marginTop: "1rem" }}>
              {aiOut.recommendations.map((rec) => (
                <FormationBlock key={rec.formation} rec={rec} />
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function FormationBlock({ rec }: { rec: CoreFormationRecommendation }) {
  const reasons = rec.slot_reasons_ko ?? [];
  const reasonBySlot = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of reasons) {
      if (r.slot) m.set(r.slot, r.reason_ko ?? "");
    }
    return m;
  }, [reasons]);

  return (
    <section className="panel best-xi-result" style={{ marginBottom: "1.25rem" }}>
      <h3 className="panel-title" style={{ fontSize: "1.05rem" }}>
        {rec.formation}{" "}
        <span className="muted" style={{ fontSize: "0.82rem", fontWeight: 500 }}>
          {rec.formation_hint_ko}
        </span>
      </h3>
      {rec.notes_ko ? <p className="muted">{rec.notes_ko}</p> : null}
      <FormationPitch formation={rec.formation} xi={rec.xi} />
      {rec.rationale_ko ? (
        <div className="best-xi-rationale" style={{ marginTop: "0.75rem" }}>
          <h4 className="best-xi-rationale__title">전체 전술 요약 (감독)</h4>
          <p>{rec.rationale_ko}</p>
        </div>
      ) : null}
      <div className="table-wrap" style={{ marginTop: "1rem" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>슬롯</th>
              <th>선수</th>
              <th>감독 코멘트 (슬롯별)</th>
            </tr>
          </thead>
          <tbody>
            {rec.xi.map((row) => (
              <tr key={row.slot}>
                <td>
                  <strong>{row.slot}</strong>
                </td>
                <td>{row.player_name}</td>
                <td className="muted" style={{ fontSize: "0.88rem", lineHeight: 1.5 }}>
                  {reasonBySlot.get(row.slot) || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
