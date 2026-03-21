# Backend (FastAPI)

## 실행

```powershell
cd backend
.\.venv\Scripts\activate
pip install -r requirements.txt
# .env 에 API_FOOTBALL_KEY 설정 (필수)
# 선택: FOOTBALL_DATA_ORG_TOKEN, THESPORTSDB_API_KEY, SPORTMONKS_API_TOKEN — 보조 API
uvicorn app.main:app --reload --host 0.0.0.0
```

- 문서: http://localhost:8000/docs  
- 한국 월드컵 본선 이력: http://localhost:8000/api/v1/korea/world-cup-history  
- 한국 대표팀 선수 feature: http://localhost:8000/api/v1/worldcup2026/korea/player-features  
- A조 1차전 상대(UEFA 플레이오프 D): http://localhost:8000/api/v1/worldcup2026/group-a-playoff-d/player-features  

## 한국 대표팀 선수·부상·클럽 스탯 API

상세: [`../docs/PLAYER_FEATURES_BACKEND.md`](../docs/PLAYER_FEATURES_BACKEND.md)  
환경 변수 예시: `.env.example`

## 2026 AI 대시보드(Claude·경기 UI) 설계

[`../docs/WC2026-AI-DASHBOARD-DESIGN.md`](../docs/WC2026-AI-DASHBOARD-DESIGN.md) — FastAPI·React·Claude·데이터 계층 MVP 로드맵.

## 기존에 다른 라우터가 있었다면

이 폴더의 `app/main.py`가 **전체 앱의 유일한 진입점**이 아닐 수 있습니다.  
다른 엔드포인트(예: 토너먼트, 2026 fixtures)를 이미 쓰고 있다면 **`app/api/v1/router.py`에 `player_features.router`만 추가**하고, 기존 `main.py`는 유지하세요.
