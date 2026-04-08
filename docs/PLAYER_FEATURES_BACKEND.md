# 한국 대표팀 등 선수 feature 백엔드 (API-Football)

## 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/v1/worldcup2026/korea/player-features` | 스쿼드·부상·(옵션) 클럽 통계·(옵션) 최근 라인업 |
| `POST` | `/api/v1/worldcup2026/korea/best-xi` | 전술(포메이션) + 스쿼드 JSON → OpenAI 베스트 11 (`OPENAI_API_KEY`) |
| `POST` | `/api/v1/worldcup2026/korea/player-features/invalidate-cache` | 집계 응답 캐시 무효화 |
| `GET` | `/api/v1/worldcup2026/mexico/player-features` | 멕시코 대표팀 — 휴리스틱 베스트 11(4-3-3) + (옵션) 클럽 통계 |
| `POST` | `/api/v1/worldcup2026/mexico/player-features/invalidate-cache` | 멕시코 집계 캐시 무효화 |
| `GET` | `/api/v1/worldcup2026/south-africa/player-features` | 남아공 대표팀 — 휴리스틱 베스트 11(4-3-3) + (옵션) 클럽 통계 |
| `POST` | `/api/v1/worldcup2026/south-africa/player-features/invalidate-cache` | 남아공 집계 캐시 무효화 |
| `GET` | `/api/v1/worldcup2026/czech-republic/player-features` | 체코 대표팀 — A조 1차전 상대(UEFA 플레이오프 D 통과), 멕시코·남아공과 동일 형태 |
| `POST` | `/api/v1/worldcup2026/czech-republic/player-features/invalidate-cache` | 체코 집계 캐시 무효화 |
| `GET` | `/api/v1/worldcup2026/group-a-playoff-d/player-features` | 레거시 URL — 위 체코 엔드포인트와 동일 캐시·페이로드 |
| `POST` | `/api/v1/worldcup2026/group-a-playoff-d/player-features/invalidate-cache` | 체코 캐시 무효화(별칭) |

## 캐시

1. **HTTP 호출 단위**: `app.services.api_football.api_get` — 엔드포인트·파라미터·TTL별 메모리 캐시.
2. **집계 응답**: `GET .../player-features` 전체 JSON — `API_FOOTBALL_PLAYER_FEATURES_CACHE_SEC`(기본 300초).

## 환경 변수

`backend/.env.example` 참고. 요약:

- `API_FOOTBALL_KEY` (필수)
- `API_FOOTBALL_INJURY_SEASON` — 부상 조회 시즌 연도
- `API_FOOTBALL_PLAYER_FEATURE_LIMIT` — 클럽 통계를 붙일 스쿼드 상한 인원 (기본 **26** — 2026 WC 본선 명단 최대 26명에 맞춤, 무료 플랜은 호출 수 주의)
- `API_FOOTBALL_PLAYER_INCLUDE_CLUB_STATS` — `true`/`1` 이면 선수별 `players?id=` 호출
- `API_FOOTBALL_PLAYER_INCLUDE_LINEUPS` — 켜면 `fixtures` + `fixtures/lineups` 추가 호출
- `API_FOOTBALL_LINEUP_FIXTURES` — 라인업 가져올 최근 경기 수
- `OPENAI_API_KEY` / `OPENAI_MODEL` — 베스트 11 생성 시 사용 (`ai_best_xi.py`)
- **체코 (A조 1차전)** — `API_FOOTBALL_TEAM_ID_CZECH_REPUBLIC`(선택)·`API_FOOTBALL_CZECH_REPUBLIC_INCLUDE_CLUB_STATS` 등 → `backend/.env.example` 참고

`POST .../korea/best-xi` 요청 본문 예: `{ "formation": "4-3-3", "squad": [ { "id", "name", "position", ... } ], "injured_player_ids": [] }`  
지원 포메이션: `4-1-4-1`, `4-4-2`, `4-3-3`, `3-5-2`, `5-3-2`.

## 기존 FastAPI 앱에 붙이기

이 레포에 **이미 `app.main`·`api/v1/router`가 있다면** `app/main.py`를 덮어쓰지 말고, 라우터만 합치세요.

```python
# app/api/v1/router.py (예시)
from app.api.v1.endpoints import player_features

api_router.include_router(player_features.router)
```

`player_features.router` 의 `prefix`는 이미 `/worldcup2026` 입니다.

## 응답 필드 요약

- `squad`: `players/squads` 원본
- `players`: 각 선수에 `club_stats_latest`(출전·분·골 등 요약) 선택적 포함
- `injuries`: 정규화된 부상 목록 (대표팀 팀 기준 데이터가 없으면 빈 배열일 수 있음)
- `recent_lineups`: 옵션 — 최근 N경기 `fixtures/lineups` raw

## 한계

- **대표팀** `injuries`는 API 커버리지에 따라 비어 있을 수 있음 (클럽 위주인 경우).
- **클럽 통계**는 선수의 **소속 리그 시즌** 기준이며, 대표팀 경기와 직접 대응하지 않음.
- 무료 플랜 **일일 요청 한도** — `API_FOOTBALL_PLAYER_FEATURE_LIMIT` 를 낮추거나 캐시 TTL을 늘리세요.
