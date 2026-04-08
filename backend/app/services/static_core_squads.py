"""A조 핵심 3개국 예시 23인 — JSON 정적 데이터 (API-Football 비의존)."""

from __future__ import annotations

import copy
import json
from pathlib import Path
from typing import Any

_BACKEND_ROOT = Path(__file__).resolve().parents[2]
_SQUAD_DIR = _BACKEND_ROOT / "data" / "wc_core_squads"

_TEAM_KEYS = frozenset({"korea", "mexico", "south_africa", "czech_republic"})


def normalize_team_key(raw: str) -> str:
    k = (raw or "").strip().lower().replace("-", "_")
    if k in ("southafrica", "za"):
        return "south_africa"
    if k in ("czech", "czechia", "czech-republic"):
        return "czech_republic"
    return k


def load_core_squad(team_key: str) -> dict[str, Any]:
    k = normalize_team_key(team_key)
    if k not in _TEAM_KEYS:
        raise ValueError(
            f"team은 korea, mexico, south_africa, czech_republic 중 하나여야 합니다. (받음: {team_key!r})"
        )
    path = _SQUAD_DIR / f"{k}_23.json"
    if not path.is_file():
        raise FileNotFoundError(str(path))
    with path.open(encoding="utf-8") as f:
        data = json.load(f)
    return _strip_internal_only_ids(copy.deepcopy(data))


def _strip_internal_only_ids(bundle: dict[str, Any]) -> dict[str, Any]:
    """JSON에 남아 있을 수 있는 ``sofifa_id`` 등 내부용 필드만 제거.

    얼굴 이미지는 프론트 ``public/player-faces/{team_key}/{player_id}.webp`` 등 로컬 파일로 둡니다.
    (SoFIFA CDN 자동 매칭은 오인물 사진 이슈로 사용하지 않음.)
    """
    players = bundle.get("players")
    if not isinstance(players, list):
        return bundle
    for p in players:
        if isinstance(p, dict):
            p.pop("sofifa_id", None)
    return bundle
