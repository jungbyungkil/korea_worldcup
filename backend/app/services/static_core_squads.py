"""A조 핵심 3개국 예시 23인 — JSON 정적 데이터 (API-Football 비의존)."""

from __future__ import annotations

import copy
import json
from pathlib import Path
from typing import Any

from app.services.sofifa_cdn import sofifa_portrait_url

_BACKEND_ROOT = Path(__file__).resolve().parents[2]
_SQUAD_DIR = _BACKEND_ROOT / "data" / "wc_core_squads"

_TEAM_KEYS = frozenset({"korea", "mexico", "south_africa"})


def normalize_team_key(raw: str) -> str:
    k = (raw or "").strip().lower().replace("-", "_")
    if k in ("southafrica", "za"):
        return "south_africa"
    return k


def load_core_squad(team_key: str) -> dict[str, Any]:
    k = normalize_team_key(team_key)
    if k not in _TEAM_KEYS:
        raise ValueError(f"team은 korea, mexico, south_africa 중 하나여야 합니다. (받음: {team_key!r})")
    path = _SQUAD_DIR / f"{k}_23.json"
    if not path.is_file():
        raise FileNotFoundError(str(path))
    with path.open(encoding="utf-8") as f:
        data = json.load(f)
    return _apply_sofifa_photos(copy.deepcopy(data))


def _apply_sofifa_photos(bundle: dict[str, Any]) -> dict[str, Any]:
    """JSON의 ``sofifa_id``로 ``photo`` URL을 채우고, 응답에서는 ``sofifa_id``를 제거."""
    players = bundle.get("players")
    if not isinstance(players, list):
        return bundle
    for p in players:
        if not isinstance(p, dict):
            continue
        raw_sid = p.pop("sofifa_id", None)
        if p.get("photo"):
            continue
        if raw_sid is None:
            continue
        try:
            sid = int(raw_sid)
        except (TypeError, ValueError):
            continue
        if sid <= 0:
            continue
        p["photo"] = sofifa_portrait_url(sid)
    return bundle
