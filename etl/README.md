# ETL: Kaggle CSV + StatsBomb → SQLite

**난이도**: 보통입니다. Python 표준 라이브러리만 사용하며, 데이터는 **직접 받아 둔 파일**만 필요합니다 (API 비용 없음).

## 1. DB 초기화 (최초 1회)

저장소 **루트**에서:

```bash
python etl/init_db.py
```

기본 DB 경로: `data/ml/korea_worldcup_ml.sqlite`  
다른 경로: `python etl/init_db.py --db ./my.sqlite`

## 2. StatsBomb Open Data

### 받기

```bash
git clone https://github.com/statsbomb/open-data.git data/open-data
```

(용량이 있으므로 `.gitignore`에 `data/open-data/` 가 포함되어 있습니다.)

### 적재

```bash
python etl/ingest_statsbomb.py --open-data-root data/open-data
```

- **경기·대회 메타만** (빠름): 위 명령만.
- **이벤트까지** (매우 느리고 DB 커짐): `--events` 추가.

환경 변수로 루트 지정: `STATSBOMB_OPEN_DATA=경로`

다시 받아 넣기: `--clear` (StatsBomb 관련 테이블만 비움)

## 3. Kaggle CSV (국제 경기 결과 등)

1. 저장소에 이미 포함된 경우: `data/kaggle/내려받은파일.csv` (출처·갱신 방법은 `data/kaggle/README.md` 참고).
2. 직접 Kaggle에서 받은 CSV를 쓰려면 같은 폴더에 두고 경로만 맞추면 됩니다.
3. 적재:

```bash
python etl/ingest_kaggle.py --csv "data/kaggle/내려받은파일.csv"
```

같은 파일명으로 덮어쓰기: 기본적으로 해당 `source_file` 이름의 행을 지우고 다시 넣습니다.  
누적만 하려면: `--append`  
원본 컬럼 전체를 JSON으로 남기려면: `--keep-raw`

인식하는 컬럼 예: `date` / `home_team` / `away_team` / `home_score` / `away_score` / `tournament` / `city` / `country` / `neutral` (대소문자·공백 변형 일부 자동 매핑)

## 4. 스키마

`etl/schema.sql` 참고. 주요 테이블:

| 테이블 | 출처 |
|--------|------|
| `statsbomb_competition` | `competitions.json` |
| `statsbomb_match` | `matches/**/*.json` |
| `statsbomb_event` | `events/{match_id}.json` (`--events` 시) |
| `kaggle_intl_match` | CSV |

## 5. 확인

```bash
sqlite3 data/ml/korea_worldcup_ml.sqlite "SELECT COUNT(*) FROM statsbomb_match;"
sqlite3 data/ml/korea_worldcup_ml.sqlite "SELECT COUNT(*) FROM kaggle_intl_match;"
```

Windows에 `sqlite3` CLI가 없으면 [DB Browser for SQLite](https://sqlitebrowser.org/) 등을 사용하세요.
