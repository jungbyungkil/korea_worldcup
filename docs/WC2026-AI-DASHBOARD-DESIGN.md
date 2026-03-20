# 2026 월드컵 · 한국 경기 AI 대시보드 설계

React + FastAPI + **Claude**(Anthropic) + 외부 축구 API를 전제로 한 **MVP → 확장** 로드맵입니다.  
이 레포에는 이미 **FastAPI**, **API-Football**, **Vite+React** 일부가 있습니다.

---

## 1. 시스템 아키텍처

```
사용자 (브라우저)
    ↓
React (Vite) — 대시보드 / 예측 게임 / 해설 UI
    ↓
FastAPI — API 게이트웨이, 캐시, 비즈니스 로직
    ↓
┌─────────────────────┬──────────────────┐
│ Data                │ AI               │
│ API-Football 등     │ Claude Messages  │
│ (경기·통계·라인업)   │ (해설·요약·코멘트) │
└─────────────────────┴──────────────────┘
```

- **실시간**: 초기에는 **Polling**(예: 30초)로 충분. 트래픽·안정성 필요 시 **WebSocket** 검토.
- **캐싱**: 경기 스냅샷 짧은 TTL, AI 응답은 더 긴 TTL(비용·레이트 제한).

---

## 2. MVP 기능 (4가지)

| # | 기능 | 설명 |
|---|------|------|
| 1 | **실시간 경기 상황** | 스코어, 시간, 점유·슈팅·(가능 시) xG — API 제공 범위 내 |
| 2 | **AI 승리 확률** | 단순 휴리스틱 또는 별도 확률 API + Claude로 설명 문구 |
| 3 | **AI 해설** | 스냅샷 통계 → Claude 프롬프트 → 짧은 라이브 톤 코멘트 |
| 4 | **팬 점수 예측 게임** | 로컬/세션 저장으로도 MVP 가능, 이후 서버 랭킹 |

---

## 3. 화면 구조 (React)

| 화면 | 주요 컴포넌트 |
|------|----------------|
| 메인 / 대시보드 | `MatchHeader`, `ScoreBoard`, `MatchStats` |
| AI 영역 | `WinProbability`, `AICommentary` |
| 흐름 분석 | `xgChart`, `eventsTimeline` — Recharts 등 |
| 예측 | `PredictionGame`, 랭킹(후순위) |

**스택 제안**: Vite, React, TypeScript, **Recharts**(그래프), 선택 **Tailwind**.

---

## 4. FastAPI API 스케치

| 메서드 | 경로 | 역할 |
|--------|------|------|
| `GET` | `/matches` 또는 `/match/{id}` | 경기 메타·스코어·진행 시간 |
| `GET` | `/match/{id}/stats` | 점유, 슈팅, (가능 시) xG |
| `POST` | `/ai/commentary` | 통계 JSON → Claude → 해설 텍스트 |
| `POST` | `/ai/match-analysis` | 승/무/패 분포 + 요약 (휴리스틱 + LLM) |
| `POST` | `/predictions/score` | 사용자 예측 제출 (MVP는 메모리/로컬) |

실제 필드명은 **API-Football 응답**에 맞춰 매핑 레이어를 둡니다.

---

## 5. Claude 연동 요약

- **환경변수**: `ANTHROPIC_API_KEY` (백엔드 `.env`, Git에 커밋 금지)
- **SDK**: `anthropic` Python 패키지 — `messages.create`
- **프롬프트 골격**:
  - 역할: 전문 해설/분석
  - 규칙: 2~3문장, 전술 위주, 숫자 나열 반복 금지
  - 입력: 홈/원정, 스코어, 분, 점유, 슈팅, xG, 최근 이벤트 요약
  - 출력: 한국어 또는 이중 언어(제품 정책에 따름)

모델명은 배포 시점 **Anthropic 문서** 기준 최신 권장 모델로 교체합니다.

---

## 6. 승리 확률 (단계적)

1. **MVP**: 가중 점수식 (xG 차, 슈팅 차, 점유, 현재 스코어) → 소프트맥스로 승/무/패.
2. **확장**: 역사 데이터 CSV + **Logistic Regression / XGBoost** (별도 학습 파이프라인).
3. **재미**: **Monte Carlo** 시뮬레이션(랜덤 골 모델) — “1000회 시뮬” UI용.

---

## 7. 데이터 소스

상세·약관은 **[DATA-SOURCES.md](./DATA-SOURCES.md)** 참고.

- **1순위**: API-Football (이미 연동 가능)
- **보강**: 배당/배당 API, Sportmonks 등(비용·키 별도)

---

## 8. 확장 아이디어 (대시보드 이후)

- AI 전술 질문 (“4-2-3-1 → 4-3-3이면?”)
- AI 페르소나(감독 / 팬 / 중립 해설)
- 경기 후 MOM·3줄 요약
- Redis 캐시, Docker Compose로 로컬 일원화

---

## 9. 이 레포와 맞추기

| 이미 있음 | 다음 작업 예시 |
|-----------|----------------|
| `GET .../korea/player-features` | 대시보드에 “주축 컨디션” 카드 |
| API-Football 클라이언트 | `fixtures`, `fixtures/statistics`, `fixtures/events` 매핑 |
| 프론트 Vite | `/dashboard` 라우트 + Recharts |

---

## 10. 개발 순서 제안

1. 특정 `fixture_id`(또는 한국 경기 검색)으로 **스냅샷 JSON** 고정 → UI 목업  
2. FastAPI에서 해당 스냅샷 제공 + **Claude 해설** 1엔드포인트  
3. 승률 휴리스틱 + 차트  
4. 예측 게임 + (선택) 저장소  

---

*문서 버전: 초안 — 제품 스코프에 맞게 API 경로·필드는 조정하세요.*
