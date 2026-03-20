# Windows에서 Node / npm 이 안 될 때

`node`, `npm` 이 **인식되지 않거나**, **스크립트 실행이 차단**될 때의 체크리스트입니다.

---

## 1. `'node' 용어가 ... 인식되지 않습니다`

**원인**: Node 미설치이거나 **PATH에 없음**.

### 해결

1. [https://nodejs.org](https://nodejs.org) 에서 **LTS** 설치  
2. 설치 마법사에서 **`Add to PATH`** 반드시 선택  
3. **PowerShell / 터미널을 모두 닫았다가** 새로 연다  
4. 확인:
   ```powershell
   node -v
   npm -v
   ```
5. 설치 경로 확인:
   ```powershell
   where.exe node
   ```
   예: `C:\Program Files\nodejs\node.exe`

### 수동 PATH

환경 변수 **Path**에 다음이 있어야 합니다.

`C:\Program Files\nodejs`

(제어판 → 시스템 → 고급 시스템 설정 → 환경 변수)

---

## 2. `npm.ps1 을 로드할 수 없습니다` (Execution Policy)

**원인**: PowerShell이 스크립트 실행을 막음.

### 방법 A — 현재 창만 (가장 안전)

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

창을 닫으면 원래대로 돌아갑니다.

### 방법 B — 사용자 단위 (개발 PC에서 흔함)

관리자 PowerShell:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

확인 후 `Y`.

### 방법 C — npm을 cmd 방식으로

PowerShell 대신 **명 프롬프트(cmd)** 또는 **Git Bash**에서:

```cmd
npm -v
```

`npm.cmd`는 PowerShell 정책과 무관하게 동작하는 경우가 많습니다.

---

## 3. 설치 후에도 `npm` 만 안 될 때

- `C:\Program Files\nodejs\` 에 `npm.cmd` 가 있는지 확인  
- **새 터미널**인지 확인 (PATH는 새 프로세스에만 반영)  
- Cursor / VS Code 터미널이 **오래된 세션**이면 종료 후 재시작  

---

## 4. 프론트 실행 (이 프로젝트)

```powershell
cd C:\Users\kingb\korea_worldcup\frontend
npm install
npm run dev
```

브라우저: [http://localhost:5173](http://localhost:5173)

---

## 5. 추천 버전

- **Node 20 LTS** — Vite 6, React 18과 호환에 무난합니다.
