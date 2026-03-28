#!/usr/bin/env python3
"""
Kaggle 등에서 받은 FIFA / EA FC 선수 CSV의 ``player_face_url``(또는 유사 컬럼)을
``backend/data/wc_core_squads/korea_23.json`` 등 스쿼드 JSON의 ``photo`` 로 병합합니다.

매칭 순서:
1) 스쿼드 선수의 ``sofifa_id`` 가 CSV의 Sofifa/ID 컬럼과 일치하면 해당 행의 얼굴 URL 사용
2) 그렇지 않으면 ``--aliases`` JSON의 별칭(영문 표기)으로 CSV ``long_name``/``short_name`` 등과 비교
   (행은 ``nationality`` 가 한국 계열일 때만 인덱싱)

예:
  python etl/merge_fifa_csv_faces.py --csv data/kaggle/fifa23_players.csv --dry-run
  python etl/merge_fifa_csv_faces.py --csv data/kaggle/fifa23_players.csv

데이터셋·이미지 URL 이용은 각 Kaggle 데이터셋 라이선스 및 이미지 출처( EA 등 ) 조건을 따르세요.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent


def _norm_header(h: str) -> str:
    s = h.strip().lower()
    s = re.sub(r"\s+", "_", s)
    return s


def _norm_name(s: str) -> str:
    s = s.lower().strip()
    s = re.sub(r"[-'.]", "", s)
    s = re.sub(r"\s+", " ", s)
    return s


def _norm_id_cell(raw: str) -> str | None:
    raw = str(raw).strip()
    if not raw:
        return None
    try:
        return str(int(float(raw)))
    except ValueError:
        return None


def _is_korea_nationality(raw: str) -> bool:
    t = _norm_name(raw)
    if not t:
        return False
    if "north korea" in t or "dpr korea" in t or "democratic people" in t:
        return False
    return (
        "korea republic" in t
        or "south korea" in t
        or t == "korea"
        or t.endswith(" korea")
        or "republic of korea" in t
    )


def _pick_col(norm_headers: list[str], *candidates: str) -> str | None:
    for c in candidates:
        if c in norm_headers:
            return c
    return None


def _detect_columns(norm_headers: list[str]) -> tuple[str | None, str | None, list[str], str | None]:
    face = _pick_col(
        norm_headers,
        "player_face_url",
        "face_url",
        "player_photo_url",
        "photo_url",
        "player_face",
    )
    # ``id`` 는 게임 내부 id일 수 있어 sofifa_id / player_id 를 우선합니다.
    sid = _pick_col(norm_headers, "sofifa_id", "sofifaid", "player_id", "id")
    name_cols = [c for c in ("long_name", "short_name", "name", "player_name", "full_name") if c in norm_headers]
    nat = _pick_col(norm_headers, "nationality", "nation", "country")
    return face, sid, name_cols, nat


def _load_aliases(path: Path) -> dict[str, list[str]]:
    if not path.is_file():
        return {}
    with path.open(encoding="utf-8") as f:
        raw = json.load(f)
    out: dict[str, list[str]] = {}
    if not isinstance(raw, dict):
        return out
    for k, v in raw.items():
        key = str(k).strip()
        if isinstance(v, str):
            out[key] = [v]
        elif isinstance(v, list):
            out[key] = [str(x).strip() for x in v if str(x).strip()]
    return out


def _index_csv(
    csv_path: Path,
    *,
    face_col: str,
    sid_col: str | None,
    name_cols: list[str],
    nat_col: str | None,
    require_korea_nat: bool,
) -> tuple[dict[str, str], dict[str, str]]:
    """Returns (face_by_sofifa_id_str, face_by_norm_name)."""
    by_id: dict[str, str] = {}
    by_name: dict[str, str] = {}

    with csv_path.open(encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            raise SystemExit("CSV에 헤더가 없습니다.")
        row0 = reader.fieldnames
        norm_map = {_norm_header(h): h for h in row0}

        def get(row: dict[str, str], norm_key: str) -> str:
            orig = norm_map.get(norm_key)
            if not orig:
                return ""
            return str(row.get(orig, "") or "").strip()

        for row in reader:
            if nat_col and require_korea_nat:
                nat_raw = get(row, nat_col)
                if not _is_korea_nationality(nat_raw):
                    continue

            face = get(row, face_col)
            if not face or not face.startswith("http"):
                continue

            if sid_col:
                sid_raw = get(row, sid_col)
                if sid_raw.isdigit():
                    by_id[sid_raw] = face

            for nc in name_cols:
                nm = get(row, nc)
                if nm:
                    by_name[_norm_name(nm)] = face

    return by_id, by_name


def run(
    *,
    csv_path: Path,
    squad_path: Path,
    aliases_path: Path,
    dry_run: bool,
    require_korea_nat: bool,
) -> int:
    with csv_path.open(encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        fields = reader.fieldnames or []
    norm_headers = [_norm_header(h) for h in fields]
    face_col, sid_col, name_cols, nat_col = _detect_columns(norm_headers)
    if not face_col:
        raise SystemExit(
            "얼굴 URL 컬럼을 찾지 못했습니다. "
            "``player_face_url``, ``face_url``, ``photo_url`` 등이 있는 CSV인지 확인하세요."
        )
    if not name_cols and not sid_col:
        raise SystemExit("이름 또는 Sofifa ID 컬럼이 필요합니다.")
    if require_korea_nat and not nat_col:
        raise SystemExit(
            "CSV에 nationality(또는 nation) 컬럼이 없습니다. "
            "한국 선수만 골라 인덱싱할 수 없어 종료합니다. "
            "전체 CSV를 이름으로만 매칭하려면 ``--no-nationality-filter`` 를 사용하세요(동명이인 주의)."
        )

    by_id, by_name = _index_csv(
        csv_path,
        face_col=face_col,
        sid_col=sid_col,
        name_cols=name_cols,
        nat_col=nat_col,
        require_korea_nat=require_korea_nat and bool(nat_col),
    )

    aliases = _load_aliases(aliases_path)

    with squad_path.open(encoding="utf-8") as f:
        squad = json.load(f)

    players = squad.get("players")
    if not isinstance(players, list):
        raise SystemExit("스쿼드 JSON에 players 배열이 없습니다.")

    matched = 0
    for p in players:
        if not isinstance(p, dict):
            continue
        pid = str(p.get("id", "")).strip()
        url: str | None = None
        how = ""

        sid = p.get("sofifa_id")
        sid_key = _norm_id_cell(str(sid)) if sid is not None else None
        if sid_key:
            url = by_id.get(sid_key)
            if url:
                how = f"sofifa_id={sid_key}"

        if not url and pid in aliases:
            for alias in aliases[pid]:
                key = _norm_name(alias)
                if key in by_name:
                    url = by_name[key]
                    how = f"alias({alias!r})"
                    break

        if not url:
            print(f"  [skip] id={pid} name={p.get('name')!r} - no match")
            continue

        if dry_run:
            print(f"  [ok]   id={pid} {how} -> {url[:72]}...")
        else:
            p["photo"] = url
        matched += 1

    print(f"matched {matched}/{len(players)} (dry_run={dry_run})")

    if not dry_run and matched:
        squad_path.write_text(json.dumps(squad, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"wrote {squad_path}")

    return 0 if matched else 1


def main() -> None:
    ap = argparse.ArgumentParser(description="FIFA/EA FC 선수 CSV의 얼굴 URL을 스쿼드 JSON에 병합")
    ap.add_argument("--csv", type=Path, required=True, help="Kaggle에서 받은 선수 CSV 경로")
    ap.add_argument(
        "--squad",
        type=Path,
        default=_ROOT / "backend" / "data" / "wc_core_squads" / "korea_23.json",
        help="병합 대상 스쿼드 JSON",
    )
    ap.add_argument(
        "--aliases",
        type=Path,
        default=_ROOT / "backend" / "data" / "wc_core_squads" / "korea_fifa_csv_name_aliases.json",
        help="앱 내 선수 id -> CSV long_name 에 가까운 영문 별칭 목록",
    )
    ap.add_argument("--dry-run", action="store_true", help="파일 쓰기 없이 매칭만 출력")
    ap.add_argument(
        "--no-nationality-filter",
        action="store_true",
        help="nationality 필터를 끕니다(이름 인덱스가 다른 국적과 충돌할 수 있음)",
    )
    args = ap.parse_args()
    if not args.csv.is_file():
        raise SystemExit(f"CSV 없음: {args.csv}")
    if not args.squad.is_file():
        raise SystemExit(f"스쿼드 JSON 없음: {args.squad}")

    sys.exit(
        run(
            csv_path=args.csv.resolve(),
            squad_path=args.squad.resolve(),
            aliases_path=args.aliases.resolve(),
            dry_run=args.dry_run,
            require_korea_nat=not args.no_nationality_filter,
        )
    )


if __name__ == "__main__":
    main()
