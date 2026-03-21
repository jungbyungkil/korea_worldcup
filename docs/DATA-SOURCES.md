# 축구 데이터 소스 가이드

예측 모델·대시보드에 쓸 **선수·팀 통계**를 어디서 가져올지 정리한 문서입니다.  
**법적·약관 해석은 법률 자문이 아닙니다.** 상업 서비스·대규모 수집 전에는 각 사이트/API의 **이용약관·robots.txt·라이선스**를 반드시 확인하세요.

---

## 이 프로젝트(`korea_worldcup`)와의 관계

| 구분 | 현재 활용 | 확장 아이디어 |
|------|-----------|----------------|
| API | **API-Football** + 보조 **Football-Data.org / TheSportsDB / Sportmonks** (`/api/v1/worldcup2026/supplement/*`, 아래 §2) | 토큰·캐시로 쿼터 분산 |
| 오프라인 학습 | **`etl/`** → SQLite | **Kaggle CSV + StatsBomb JSON** 적재 후 모델 학습 (**API 비용 0**) — §3·[etl/README.md](../etl/README.md) |
| 크롤링 | 미사용 | 연구·오프라인 학습용 데이터셋 구축 시 검토 |
| 프론트 정적 요약 | **나무위키·FIFA 링크** (`/2026/worldcup`) | 대회 개요는 수동 요약·외부 링크만 (위키 본문 미복제) |

구현 참고: **[PLAYER_FEATURES_BACKEND.md](./PLAYER_FEATURES_BACKEND.md)** — `GET /api/v1/worldcup2026/korea/player-features` (스쿼드·부상·클럽 통계·옵션 라인업).

대시보드·Claude·MVP 로드맵: **[WC2026-AI-DASHBOARD-DESIGN.md](./WC2026-AI-DASHBOARD-DESIGN.md)**  
Windows에서 `node`/`npm` 오류 시: **[WINDOWS-NODE-NPM.md](./WINDOWS-NODE-NPM.md)**.  
복구 이력·현재 구성: **[PROJECT-RESTORE.md](./PROJECT-RESTORE.md)**.

---

## 1. 크롤링이 상대적으로 많이 쓰이는 통계 사이트

BeautifulSoup, Selenium 등으로 HTML을 파싱하는 방식입니다.  
**무료·풍부**한 반면, **약관 위반·IP 제한·마크업 변경** 리스크가 큽니다.

### FBref (Sports Reference)

| 항목 | 내용 |
|------|------|
| **강점** | Opta 기반 상세 스탯(xG, 패스, 압박, 태클 등). 팬·데이터 사이언스 튜토리얼에서 자주 인용됨. |
| **난이도** | 중~상 (표 구조·페이지 수 많음, 구조 변경 가능) |
| **주의** | **이용약관·재배포 정책** 확인. 상업적 이용·대량 자동 수집은 제한될 수 있음. robots.txt 준수. |

### Transfermarkt

| 항목 | 내용 |
|------|------|
| **강점** | **시장 가치(몸값)**, 이적·부상 맥락. 단기 대회(월드컵)에서 핵심 선수 **가용성·부담** feature로 활용 가능. |
| **난이도** | 중 (차단·레이트 리밋에 민감한 편) |
| **주의** | 크롤링 정책·법적 논의 이슈가 종종 거론됨. **공식 API/데이터 라이선스** 없이 서비스 연동은 비권장. |

### SoFIFA / EA FC 계열 DB

| 항목 | 내용 |
|------|------|
| **강점** | 게임 능력치이지만 스카우트 반영 등 **단일 숫자 지표**로 모델 입력(feature) 만들기 쉬움. 학술·팬 프로젝트에서 참고 지표로 인용되는 경우 있음. |
| **난이도** | 하~중 (사이트·포맷 의존) |
| **주의** | **실제 경기 퍼포먼스와 괴리** 가능. 패치·시즌 업데이트에 따라 값이 바뀜. |

---

## 2. 정식 API (안정성·서비스 연동에 적합)

JSON 응답, 문서, 과금/쿼터가 명확한 편입니다.

### API-Football (API-Sports)

| 항목 | 내용 |
|------|------|
| **강점** | 다수 리그·국가대표, 경기·라인업·선수·이벤트 등 **폭넓은 엔드포인트**. 본 레포 백엔드에서 이미 사용. |
| **무료 티어** | 일일 요청 한도 있음 → **캐시**, **필요한 호출만**, 배치/지연 로딩 권장. |
| **문서** | [API-Sports Football](https://www.api-football.com/documentation-v3) |

### Sportmonks

| 항목 | 내용 |
|------|------|
| **강점** | 응답 속도·데이터 품질·문서화 평가가 좋은 편인 경우가 많음. |
| **비용** | 무료 한도가 작거나 없음 → **유료 플랜** 전제인 경우가 많음. |
| **활용 (본 레포)** | `SPORTMONKS_API_TOKEN` 설정 시 `GET /api/v1/worldcup2026/supplement/sportmonks/teams/search?q=` — 팀 검색·`image_path` 등. |
| **문서** | [Sportmonks](https://www.sportmonks.com/) 공식 문서 참고 |

### Football-Data.org

| 항목 | 내용 |
|------|------|
| **강점** | REST **v4** 문서가 정돈됨. 무료 티어 **분당 호출 제한**이 있어도 개인·MVP에 쓰기 좋은 편. |
| **활용 (본 레포)** | `FOOTBALL_DATA_ORG_TOKEN` 설정 시 `GET /api/v1/worldcup2026/supplement/football-data/world-cup/matches` — FIFA WC(`WC`) 일정 보강. **플랜에 따라 일부 대회 제한** 가능. |
| **문서** | [football-data.org](https://www.football-data.org/) · [API Reference](https://docs.football-data.org/) |

### TheSportsDB

| 항목 | 내용 |
|------|------|
| **강점** | **팀 배지·로고·저지** 등 UI 메타데이터. 크라우드소싱 기반, 기본 키로도 실험 가능. |
| **활용 (본 레포)** | `GET .../supplement/thesportsdb/a-group-media` — A조(한·멕시코·남아공) 배지. `THESPORTSDB_API_KEY` 비우면 공개 데모 키 `1` (느릴 수 있음). |
| **문서** | [TheSportsDB](https://www.thesportsdb.com/) |

---

<a id="offline-ml-local-db"></a>

## 3. 과거 데이터 (AI 학습용): 로컬 적재 → **API 호출 비용 0**

실시간 예측 API 대신, **한 번 내려받은 파일**만으로 모델을 학습·실험할 때의 권장 흐름입니다.  

**이 레포**: `etl/` 에서 **SQLite까지 적재**할 수 있습니다 → **[etl/README.md](../etl/README.md)** (표준 라이브러리만 사용, API 비용 없음).

### 3.1 왜 로컬 DB인가

| 방식 | 장점 |
|------|------|
| **CSV/JSON 다운로드 → PostgreSQL 또는 SQLite** | 반복 학습·하이퍼파라미터 탐색 시 **외부 API 과금·쿼터 없음** |
| **스키마 정리** | 매치 단위(Kaggle)와 이벤트 단위(StatsBomb)를 **테이블로 분리**해 조인·피처 추출이 쉬움 |
| **재현성** | 데이터 스냅샷 버전·해시를 기록하면 실험 재현 가능 |

### 3.2 데이터 소스 (다운로드)

| 소스 | 형식 | 용도 예시 |
|------|------|-----------|
| **[Kaggle](https://www.kaggle.com/)** | 주로 **CSV** | 국제 A매치 결과, 날짜·홈/어웨이·스코어 → **승·무·패 / Elo·랭킹 차이** 기반 베이스라인 |
| **[StatsBomb Open Data](https://github.com/statsbomb/open-data)** | **JSON** (이벤트) | 패스·슈팅·xG·압박 등 → **전술·상황 피처**, 월드컵 등 특정 대회 심층 분석 |

각 제공처의 **라이선스·인용 조건**(특히 StatsBomb)을 준수하세요.

### 3.3 적재 파이프라인 (권장 단계)

1. **다운로드**  
   - Kaggle: 데이터셋 페이지에서 CSV 저장 (또는 Kaggle CLI `kaggle datasets download`).  
   - StatsBomb: Git clone 또는 릴리스 ZIP — `data/` 아래 경기·이벤트 JSON 구조 유지.
2. **정규화**  
   - 팀명·국가 코드 매핑 테이블(예: `South Korea` ↔ `Korea Republic`)을 두어 소스 간 조인 오류를 줄임.
3. **DB 적재**  
   - **SQLite (본 레포 구현)**: `python etl/init_db.py` 후 `ingest_statsbomb.py` / `ingest_kaggle.py` — 자세한 절차는 **[etl/README.md](../etl/README.md)**.  
   - **PostgreSQL**: 팀 단위로 데이터가 커지거나 여러 실험자가 공유할 때 유리 — 동일 스키마를 `schema.sql` 기준으로 이식 가능.
4. **스키마 (SQLite에 반영됨)** — `etl/schema.sql`  
   - `kaggle_intl_match` — CSV 매치 결과  
   - `statsbomb_competition`, `statsbomb_match`, `statsbomb_event`(옵션)  
   - 학습용 파생 테이블·뷰는 이후 `features_match_level` 등으로 확장
5. **학습**  
   - DB에서 SQL 또는 ORM으로 피처 행을 뽑아 **오프라인**에서만 학습; 프로덕션 추론 시에만 필요하면 API·캐시 사용.

### 3.4 이 프로젝트 백엔드와의 관계

- 현재 **Elo 승률 시뮬** 등은 **코드 내 Elo 테이블 + API-Football 최근 전적**에 가깝습니다.  
- 위 로컬 DB 적재는 **별도 ML 파이프라인**으로 두고, 성숙해지면 “학습된 모델 가중치” 또는 “주기적으로 갱신된 피처 테이블”만 서버에 반영하는 방식이 **비용·안정성** 면에서 유리합니다.

---

## 4. 2026 국가대표 예측·feature 설계 팁

다음을 조합하면 **Elo·최근 대표팀 전적만**보다 설명력을 높이기 쉽습니다.

1. **클럽 시즌 부하**  
   주축(예: 손흥민, 이강인, 김민재 등)의 **최근 1시즌 출전 시간·연속 출전** → 혹사·피로도 proxy.
2. **최근 폼**  
   클럽 **최근 N경기** 평점/기여 지표 + 대표팀 **최근 N경기**를 함께 쓰면 “컨디션 지수” 같은 **파생 변수** 설계 가능.
3. **가용성**  
   직전 부상·결장 이력(출처와 신뢰도 명시)은 단기 토너먼트에서 변동성이 큼.

---

## 5. 권장 워크플로 (요약)

| 목적 | 권장 경로 |
|------|-----------|
| **실서비스·프로덕션** | 정식 API + 캐시 + 명확한 출처 표기 |
| **AI/ML 학습 (과거 데이터, 비용 최소)** | **Kaggle·StatsBomb 파일 → PostgreSQL/SQLite 적재** (§3) — 학습 루프에서 외부 API 미사용 |
| **논문·개인 실험·오프라인 모델** | 공개 데이터셋·API 샘플·약관 허용 범위 내 크롤링 검토 |
| **상업적 재배포·대규모 스크래핑** | **각 제공자 라이선스·법무 검토** 필수 |

---

## 6. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-03-18 | 초안 작성 (크롤링 소스·API·대표팀 feature 팁·주의사항) |
| 2026-03-18 | `PLAYER_FEATURES_BACKEND.md` 링크 — API-Football 한국 대표팀 선수 feature 엔드포인트 |
| 2026-03-20 | `WC2026-AI-DASHBOARD-DESIGN.md`, `WINDOWS-NODE-NPM.md` 추가 |
| 2026-03-18 | §3 추가 — Kaggle/StatsBomb → PostgreSQL·SQLite 오프라인 학습 가이드 (API 비용 0) |
| 2026-03-18 | `etl/` — SQLite 적재 스크립트·`etl/schema.sql`·`etl/README.md` 추가 |
| 2026-03-18 | Football-Data.org·TheSportsDB·Sportmonks 보조 연동 (`/worldcup2026/supplement/*`) |
