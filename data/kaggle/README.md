# Kaggle 계열 · 국제 A매치 결과 CSV

## `내려받은파일.csv`

- **내용**: 남자 국가대표 풀 A매치 결과 (`date`, `home_team`, `away_team`, `home_score`, `away_score`, `tournament`, `city`, `country`, `neutral`).
- **출처**: [martj42/international_results](https://github.com/martj42/international_results) 저장소의 `results.csv` (원본과 동일 스키마). 라이선스 **CC0**.
- **Kaggle과의 관계**: Kaggle의 *International football results from 1872 to …* 데이터셋과 **같은 계열**입니다. 이 환경에서는 Kaggle 로그인/API 없이 위 GitHub raw URL로 받아 두었습니다.
- **갱신**: 최신본이 필요하면 해당 GitHub의 `results.csv`를 다시 내려받아 이 파일을 덮어쓰면 됩니다.

SQLite 적재:

```bash
python etl/ingest_kaggle.py --csv "data/kaggle/내려받은파일.csv"
```
