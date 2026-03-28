# Kaggle / 공개 CSV 데이터

## `내려받은파일.csv`

- **내용**: 남자 국가대표 풀 A매치 결과 (`date`, `home_team`, `away_team`, `home_score`, `away_score`, `tournament`, `city`, `country`, `neutral`).
- **출처**: [martj42/international_results](https://github.com/martj42/international_results) 저장소의 `results.csv` (원본과 동일 스키마). 라이선스 **CC0**.
- **Kaggle과의 관계**: Kaggle의 *International football results from 1872 to …* 데이터셋과 **같은 계열**입니다. 이 환경에서는 Kaggle 로그인/API 없이 위 GitHub raw URL로 받아 두었습니다.
- **갱신**: 최신본이 필요하면 해당 GitHub의 `results.csv`를 다시 내려받아 이 파일을 덮어쓰면 됩니다.

이 파일에는 **`player_face_url` 같은 선수 이미지 컬럼이 없습니다.** 얼굴 URL 병합은 아래 FIFA/EA 선수용 CSV를 따로 받아 사용하세요.

SQLite 적재 (경기 결과용):

```bash
python etl/ingest_kaggle.py --csv "data/kaggle/내려받은파일.csv"
```

---

## FIFA / EA FC 선수 CSV (얼굴 URL)

Kaggle에서 *FIFA 23 players*, *EA FC 24 players*, *complete player database* 등을 검색해 내려받으면, 보통 **`player_face_url`**(또는 `face_url`, `photo_url`)과 **`long_name`**, **`nationality`**, **`sofifa_id`** 등이 함께 있습니다.

1. 받은 CSV를 예: `data/kaggle/fifa_players.csv` 로 저장합니다.
2. 프로젝트 루트에서 **미리보기**:

   ```bash
   python etl/merge_fifa_csv_faces.py --csv data/kaggle/fifa_players.csv --dry-run
   ```

3. 매칭이 괜찮으면 **`korea_23.json`에 `photo` 필드를 쓰기**:

   ```bash
   python etl/merge_fifa_csv_faces.py --csv data/kaggle/fifa_players.csv
   ```

**매칭 방식**

- 스쿼드 JSON에 `sofifa_id`가 있으면 CSV의 동일 ID 행 URL을 우선 사용합니다.
- 없으면 `backend/data/wc_core_squads/korea_fifa_csv_name_aliases.json`의 영문 별칭과 CSV 이름(`long_name` 등)을 맞춥니다. CSV에는 **`nationality`가 한국 계열**인 행만 이름 인덱스에 넣습니다(동명이인 완화).

**주의**: 데이터셋·이미지 URL의 **라이선스·재배포·핫링크** 조건은 각 Kaggle 페이지와 이미지 제공 주체(EA 등) 기준을 따르세요.

로컬 테스트용 최소 CSV는 `etl/fixtures/fifa_korea_minimal.csv` 를 참고하면 됩니다.
