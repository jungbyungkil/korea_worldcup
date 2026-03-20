# GitHub에 소스 올리기 (jungbyungkil/korea_worldcup)

원격: https://github.com/jungbyungkil/korea_worldcup

## 사전 확인

- Git 설치: https://git-scm.com/download/win (설치 후 터미널 재시작)
- `.gitignore`로 `backend/.env`, `env정보.txt`, `node_modules`, `.venv` 등은 제외됩니다.

### API 키 주의

`env정보.txt`에 키를 적었다면 GitHub에 올리기 전에 **키 재발급(rotate)** 을 권장합니다.

## 명령어 (프로젝트 루트)

```bash
cd c:\Users\kingb\korea_worldcup

git init
git branch -M main
git remote add origin https://github.com/jungbyungkil/korea_worldcup.git

git add .
git status
git commit -m "Initial commit: 2026 WC hub (FastAPI + Vite)"

git push -u origin main
```

이미 `origin`이 있으면:

```bash
git remote set-url origin https://github.com/jungbyungkil/korea_worldcup.git
```

## 인증

- HTTPS: GitHub **Personal Access Token**을 비밀번호 대신 사용
- SSH: `git remote set-url origin git@github.com:jungbyungkil/korea_worldcup.git`

## GitHub에 README만 있는 경우

```bash
git pull origin main --rebase
git push -u origin main
```
