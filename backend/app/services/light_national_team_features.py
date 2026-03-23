"""멕시코·남아공 등 '경량' 대표팀 페이지 — 휴리스틱 4-3-3 베스트 11 + (옵션) 클럽 통계."""

from __future__ import annotations

import asyncio
import os
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

from app.services.korea_player_features import (
    _bool_env,
    _int_env,
    _pick_latest_statistics_blocks,
    _summarize_stat_block,
    fetch_injuries,
    fetch_player_full,
    fetch_squad,
    find_national_team_id,
)

SLOTS_433: tuple[str, ...] = ("GK", "RB", "RCB", "LCB", "LB", "RCM", "CM", "LCM", "RW", "ST", "LW")


@dataclass(frozen=True)
class LightNationalTeamConfig:
    team_display: str
    search_query: str
    exact_team_names: frozenset[str]
    name_bonus_substrings: frozenset[str]
    country_bonus: frozenset[str]
    error_code: str
    include_stats_env: str
    cache_env_documentation: str
    #: API-Football ``teams?country=`` (검색만으로 대표팀이 안 잡힐 때)
    teams_country_fallback: str | None = None


def _pick_heuristic_xi_433(squad: list[dict[str, Any]]) -> list[dict[str, Any]]:
    valid = [p for p in squad if isinstance(p.get("id"), int)]
    by_pos: dict[str, list[dict[str, Any]]] = {
        "Goalkeeper": [],
        "Defender": [],
        "Midfielder": [],
        "Attacker": [],
    }
    rest: list[dict[str, Any]] = []
    for p in valid:
        pos = str(p.get("position") or "")
        if pos in by_pos:
            by_pos[pos].append(p)
        else:
            rest.append(p)

    parts = (
        by_pos["Goalkeeper"][:1]
        + by_pos["Defender"][:4]
        + by_pos["Midfielder"][:3]
        + by_pos["Attacker"][:3]
    )
    used = {int(p["id"]) for p in parts}

    for p in rest:
        if len(parts) >= 11:
            break
        pid = int(p["id"])
        if pid not in used:
            parts.append(p)
            used.add(pid)

    for p in valid:
        if len(parts) >= 11:
            break
        pid = int(p["id"])
        if pid not in used:
            parts.append(p)
            used.add(pid)

    return parts[:11]


async def build_light_national_team_payload(cfg: LightNationalTeamConfig) -> dict[str, Any]:
    now = datetime.now(timezone.utc).isoformat()
    team_id: int | None = None
    if cfg.team_id_override_env:
        raw = (os.getenv(cfg.team_id_override_env) or "").strip()
        if raw.isdigit():
            team_id = int(raw)

    if team_id is None:
        team_id = await find_national_team_id(
            cfg.search_query,
            exact_team_names=cfg.exact_team_names,
            name_bonus_substrings=cfg.name_bonus_substrings,
            country_bonus=cfg.country_bonus,
            teams_country_fallback=cfg.teams_country_fallback,
        )

    if not team_id:
        return {
            "last_updated": now,
            "team": cfg.team_display,
            "team_id": None,
            "error": cfg.error_code,
            "squad_size": 0,
            "starting_xi": [],
            "players": [],
            "injuries": [],
        }

    season = _int_env("API_FOOTBALL_INJURY_SEASON", datetime.now().year)
    include_stats = _bool_env(cfg.include_stats_env, True)

    squad = await fetch_squad(team_id)
    injuries_raw = await fetch_injuries(team_id, season)

    injuries_normalized: list[dict[str, Any]] = []
    for it in injuries_raw:
        pl = (it or {}).get("player") or {}
        injuries_normalized.append(
            {
                "player_id": pl.get("id"),
                "player_name": pl.get("name"),
                "type": it.get("type"),
                "reason": it.get("reason"),
                "league": ((it or {}).get("league") or {}).get("name"),
            }
        )

    xi_squad_rows = _pick_heuristic_xi_433(squad)
    injured_ids = {int(x) for x in (i.get("player_id") for i in injuries_normalized) if isinstance(x, int)}

    if injured_ids:
        xi_squad_rows = [p for p in xi_squad_rows if int(p["id"]) not in injured_ids]
        used = {int(p["id"]) for p in xi_squad_rows}
        for p in squad:
            if len(xi_squad_rows) >= 11:
                break
            if not isinstance(p.get("id"), int):
                continue
            pid = int(p["id"])
            if pid in injured_ids or pid in used:
                continue
            xi_squad_rows.append(p)
            used.add(pid)

    xi_squad_rows = xi_squad_rows[:11]

    slots = list(SLOTS_433)[: len(xi_squad_rows)]
    sem = asyncio.Semaphore(4)

    async def _one_row(slot: str, p: dict[str, Any]) -> dict[str, Any]:
        pid = int(p["id"])
        row: dict[str, Any] = {
            "slot": slot,
            "player_id": pid,
            "player_name": p.get("name"),
            "number": p.get("number"),
            "position": p.get("position"),
            "age": p.get("age"),
            "photo": p.get("photo"),
        }
        if include_stats:
            async with sem:
                full = await fetch_player_full(pid)
            if full:
                blocks = _pick_latest_statistics_blocks(full)
                if blocks:
                    row["club_stats_latest"] = _summarize_stat_block(blocks[0])
                    row["club_stats_seasons_count"] = len(blocks)
        return row

    starting_xi = await asyncio.gather(
        *[_one_row(slots[i], xi_squad_rows[i]) for i in range(len(xi_squad_rows))]
    )

    return {
        "last_updated": now,
        "team": cfg.team_display,
        "team_id": team_id,
        "formation_display": "4-3-3",
        "starting_xi_note_ko": "API 스쿼드 포지션 비율(1GK·4DF·3MF·3FW)로 뽑은 예시 11인입니다. 공식 선발 명단이 아닙니다.",
        "squad_size": len(squad),
        "starting_xi_count": len(starting_xi),
        "season_used_for_injuries": season,
        "config": {
            "include_club_stats": include_stats,
            "cache_env": cfg.cache_env_documentation,
        },
        "injuries": injuries_normalized,
        "starting_xi": list(starting_xi),
    }
