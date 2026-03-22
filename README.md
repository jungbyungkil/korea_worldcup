# 2026 북중미 월드컵 · 대한민국 축구 허브

FastAPI 백엔드 + React(Vite) 프론트엔드. 한국 대표팀 일정·선수 데이터·월드컵 개요·AI 기능 등.

## 구성

| 경로 | 설명 |
|------|------|
| `backend/` | FastAPI, API-Football 연동 |
| `frontend/` | Vite + React Router |
| `docs/` | 데이터 소스·백엔드 설계 등 ([AI 학습: Kaggle·StatsBomb → 로컬 DB](docs/DATA-SOURCES.md#offline-ml-local-db)) |
| `etl/` | Kaggle CSV + StatsBomb JSON → **SQLite** 적재 ([etl/README.md](./etl/README.md)) |

## 빠른 시작

1. **백엔드** — `backend/.env.example` → `backend/.env` 복사 후 `API_FOOTBALL_KEY` 등 설정  
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload --host 0.0.0.0
   ```
2. **프론트** — `frontend/.env.example` 참고 (기본 `VITE_API_BASE_URL=http://localhost:8000`)  
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### 한 번에 / 자동으로 실행하기

| 방법 | 설명 |
|------|------|
| **Cursor·VS Code 작업** | `Ctrl+Shift+B` → 기본 빌드 작업 **「dev: 백엔드 + 프론트 동시 실행」** (터미널 두 개에 uvicorn + Vite). 또는 `F1` → `Tasks: Run Task` 로 같은 작업 선택. |
| **폴더 열 때 자동** | 작업 **「dev: 폴더 열 때 자동 시작 (백+프론트)」** 이 `runOn: folderOpen` 으로 등록되어 있습니다. Cursor/VS Code 설정에서 **`task.allowAutomaticTasks`** 를 **`on`** 으로 두면, 이 워크스페이스를 열 때마다 위 서버들이 자동으로 뜹니다. 끄려면 설정에서 `off` 또는 해당 작업의 `runOptions` 를 제거하세요. |
| **PowerShell 스크립트** | 프로젝트 루트에서 `.\scripts\dev.ps1` — 백·프론트를 **새 창 두 개**로 실행합니다. |

## GitHub에 올리기

[docs/GIT-PUSH.md](./docs/GIT-PUSH.md) 를 참고하세요.

## 라이선스

프로젝트 소유자 기준으로 설정하세요.
