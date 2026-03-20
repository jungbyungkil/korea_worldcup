# 프로젝트 복구 기록

일부 파일이 워크스페이스에서 사라지거나, 최소 템플릿으로 덮어쓰이면서 **2026 대시보드·일정 API** 등이 빠진 적이 있습니다.

## 현재 복구된 구성

### Backend (`/api/v1/worldcup2026/…`)

- `korea/overview`, `korea/fixtures` (AFC 확장·페이지네이션 포함)
- `korea/_team-candidates`, `korea/_fixtures-raw`, `korea/_league-candidates` (디버그)
- `ai-opinion` (OpenAI 호환 Chat Completions, `OPENAI_API_KEY`)
- `prediction/win-probability` (Elo + 최근 폼)
- `korea/player-features` (별도 player feature 집계)

### Frontend

- `/` 홈
- `/history/worldcup` — **한국 월드컵 본선 과거 이력** (표 + 하이라이트)
- `/2026/korea` — **2026 한국 대시보드** (일정·브리핑·비교·AI 의견·승률)
- `/2026/korea/players` — 국대 선수 feature JSON

## 앞으로 줄일 손실

1. **Git 초기화 후 자주 커밋**  
   `git init` → `.gitignore`에 `.env`, `node_modules`, `.venv` 제외
2. **백업**: OneDrive/외장디스크에 프로젝트 복사
3. **Cursor Local History**: 파일 우클릭 → 타임라인에서 이전 버전 복원 시도

## 여전히 없을 수 있는 것

이 레포에 없었거나 복구하지 않은 예:

- 2002/2022 토너먼트 상세 페이지·라우터
- Docker Compose
- Claude(Anthropic) 전용 엔드포인트 — 현재 AI 의견은 **OpenAI** 기준 (`ai_opinion.py`)

필요하면 이슈/요청으로 범위를 알려 주세요.
