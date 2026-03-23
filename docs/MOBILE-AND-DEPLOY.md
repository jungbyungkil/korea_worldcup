# 모바일 보기 · 무료 클라우드 배포 가이드

실제 휴대폰에서 사이트를 열려면 **인터넷에 공개된 URL**이 필요합니다. 아래는 **무료(또는 무료 한도)** 로 쓰기 쉬운 조합입니다.

## 1. 모바일 UI (이 저장소에 반영됨)

- **뷰포트·노치**: `viewport-fit=cover`, `safe-area-inset` 패딩으로 상·하·좌·우 여백 보정
- **햄버거 메뉴**: 화면 너비 **900px 미만**에서 상단 햄버거 → 오른쪽 드로어 메뉴
- **터치**: 메뉴·버튼 최소 높이 **44~48px** 권장 스타일
- **테마 컬러**: 브라우저 상단 바 색 (`theme-color`)

로컬에서 휴대폰과 같은 Wi‑Fi에 맞춘 뒤 `npm run dev -- --host` 로 같은 네트워크 IP로 접속해 미리 볼 수도 있습니다.

---

## 2. 배포 구조 (권장)

| 구분 | 서비스 예시 | 비고 |
|------|-------------|------|
| **백엔드** (FastAPI) | [Render](https://render.com) Web Service **Free** | 비활성 시 잠들면 **콜드 스타트**(첫 요청이 느릴 수 있음) |
| **프론트** (Vite 정적 파일) | Render **Static Site** Free 또는 [Cloudflare Pages](https://pages.cloudflare.com) | 빌드 시 API 주소가 박히므로 **환경 변수** 설정 필요 |

프론트는 `VITE_API_BASE_URL`에 **배포된 백엔드 URL**(예: `https://xxx.onrender.com`)을 넣고 빌드해야 합니다. (`frontend/src/api/client.ts` 참고)

---

## 3. Render로 올리기 (저장소 루트 `render.yaml` 참고)

### 3-1. 백엔드 먼저

1. [Render Dashboard](https://dashboard.render.com) → **New +** → **Blueprint** 또는 **Web Service**
2. GitHub 저장소 연결: `jungbyungkil/korea_worldcup`
3. **Web Service** 선택 시:
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. **Environment** 에서 `backend/.env.example` 를 참고해 등록 (예시):
   - `API_FOOTBALL_KEY` — 필수에 가깝습니다
   - `OPENAI_API_KEY` — AI 기능 켤 때만
   - 기타 TheSportsDB, Football-Data 등 사용 시 해당 키
5. 배포 후 **HTTPS URL** 복사 (예: `https://korea-worldcup-api.onrender.com`)

> **보안**: API 키는 **절대** 프론트 저장소나 빌드 로그에 넣지 마세요. Render **Environment** (또는 Secrets)만 사용하세요.

### 3-2. 프론트 (Static Site)

1. **New +** → **Static Site** (같은 저장소)
2. **Root Directory**: `frontend`
3. **Build Command**: `npm install && npm run build`
4. **Publish directory**: `dist`
5. **Environment** → **빌드 시** 필요한 변수:
   - `VITE_API_BASE_URL` = 위 백엔드 URL (끝에 `/` 없이)

백엔드 URL을 나중에 바꾸면 **프론트를 다시 빌드/배포**해야 합니다.

### 3-3. Blueprint 한 번에

저장소 루트의 `render.yaml` 을 Render **Blueprint**로 연결하면 서비스 정의를 재사용할 수 있습니다.  
첫 배포 후 Static Site의 `VITE_API_BASE_URL` 은 대시보드에서 실제 API URL로 맞춰 주세요.

---

## 4. 대안 (요약)

- **Cloudflare Pages** (프론트): Git 연동 → Build `npm run build`, Output `frontend/dist`, 환경 변수에 `VITE_API_BASE_URL` 설정
- **Vercel** (프론트): Root `frontend`, 동일하게 환경 변수 설정
- 백엔드만 다른 무료/저가 PaaS (**Fly.io**, **Railway** 등)를 써도 되며, 원칙은 **CORS 허용 + HTTPS URL을 프론트 빌드에 넣기** 동일합니다.

---

## 5. 모바일에서 확인할 것

- [ ] 주소창이 **HTTPS**인지
- [ ] 첫 로딩이 느리면 Render 무료 **슬립 해제** 대기 후 재시도
- [ ] API 키 미설정 시 일부 화면만 에러 — 정상입니다. 필요한 키만 Render에 넣으세요

문제가 있으면 브라우저 **개발자 도구 → Network** 에서 API 호출 URL이 본인 백엔드로 가는지 확인하세요.
