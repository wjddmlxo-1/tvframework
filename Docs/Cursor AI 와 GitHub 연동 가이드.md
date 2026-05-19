# Cursor AI 와 GitHub 연동 가이드

tvframework 프로젝트를 Cursor에서 개발하고 GitHub(`wjddmlxo-1/tvframework`)에 올릴 때 겪었던 이슈와 해결 방법을 정리한 문서입니다.

---

## 1. 사전 준비

| 항목 | 내용 |
|------|------|
| GitHub 저장소 | [https://github.com/wjddmlxo-1/tvframework](https://github.com/wjddmlxo-1/tvframework) |
| 로컬 경로 | `D:\tvframework` |
| 기본 브랜치 | `main` |
| 원격 이름 | `origin` |

### GitHub에서 저장소 만들 때

- **README 추가**로 생성하면 원격에 초기 커밋이 생깁니다.
- 로컬에서 `git init` 후 첫 커밋을 만들었다면, push 시 **이력이 달라 거절**될 수 있습니다. (아래 [3.2](#32-push-거절-fetch-first) 참고)

### Cursor / 터미널

- 프로젝트 루트에서 Git 명령 실행: `D:\tvframework`
- Cursor 내장 터미널 또는 PowerShell 사용 가능

---

## 2. 원격 저장소(origin) 연결

### 최초 1회

```powershell
cd D:\tvframework
git remote add origin https://github.com/wjddmlxo-1/tvframework.git
```

### 이미 origin이 있을 때

```
error: remote origin already exists.
```

**의미:** `origin`이 이미 등록되어 있어 `add`가 아니라 **URL 변경**이 필요합니다.

```powershell
git remote set-url origin https://github.com/wjddmlxo-1/tvframework.git
git remote -v
```

### URL 확인 시 주의 (오타)

| 잘못된 예 | 올바른 예 |
|-----------|-----------|
| `wjddmlx-1` (o 누락) | `wjddmlxo-1` |

계정명이 틀리면 저장소가 있어도 아래와 같은 메시지가 납니다.

```
remote: Repository not found.
fatal: repository 'https://github.com/...' not found
```

---

## 3. 자주 나오는 오류와 해결

### 3.1 Repository not found

**원인 (저장소가 실제로 있을 때)**

- 원격 URL 오타
- GitHub에 **다른 계정**으로 로그인된 Windows 자격 증명
- private 저장소인데 권한 없음

**조치**

1. 브라우저에서 `wjddmlxo-1` 계정으로 저장소 접속 가능한지 확인
2. `git remote -v`로 URL 확인
3. Windows **자격 증명 관리자** → `git:https://github.com` 삭제 후 `git push` 시 재로그인
4. 또는 SSH 사용:

```powershell
git remote set-url origin git@github.com:wjddmlxo-1/tvframework.git
```

> **참고:** 이 메시지는 반드시 "GitHub에 저장소를 먼저 만들라"는 뜻만은 아닙니다. 저장소가 있어도 인증/URL 문제면 동일하게 표시됩니다.

---

### 3.2 push 거절 (fetch first)

```
! [rejected] main -> main (fetch first)
hint: Updates were rejected because the remote contains work that you do not have locally.
```

**원인**

- GitHub에 README 등 **초기 커밋**이 있고
- 로컬에도 **별도의 Initial commit**이 있어
- 두 이력이 **같은 뿌리가 아님**

**해결 (README 유지하며 합치기)**

```powershell
git pull origin main --allow-unrelated-histories
# 충돌 시 README 등 정리 후
git add .
git commit -m "Merge remote README with local project"
git push origin main
```

**해결 (원격 README 버리고 로컬만 올리기 — 협업 전 단독 작업 시)**

```powershell
git push -u origin main --force
```

`--force`는 원격 `main`을 덮어씁니다. 다른 사람과 공유 중인 브랜치에서는 사용하지 마세요.

> **협업 중** 같은 메시지가 나오면 초기 이력 문제가 아니라 **남이 먼저 push**한 경우가 많습니다. → [5. push 전에 원격 변경 받기](#5-push-전에-원격-변경-받기-협업) 참고.

---

### 3.3 Everything up-to-date

```
branch 'main' set up to track 'origin/main'.
Everything up-to-date
```

**의미**

- push는 **성공**
- 로컬 `main`과 `origin/main`이 **이미 동일**해서 올릴 새 커밋이 없음

로컬에서 파일을 수정했는데도 이 메시지만 나오면:

- `git add` / `git commit`을 하지 않았거나
- (과거 구조) 변경이 `frontend` **내부 Git**에만 있는 경우

---

### 3.4 commit이 안 됨 (no changes added to commit)

```
Changes not staged for commit:
        modified:   frontend (modified content)
no changes added to commit (use "git add" and/or "git commit -a")
```

**원인**

1. **`git add` 없이 `git commit`만 실행**
2. **`frontend`가 별도 Git 저장소(서브모듈)** 로 들어가 있어, 실제 수정은 `frontend\.git` 안에만 존재

**당시 구조**

```
tvframework/          ← 상위 Git (frontend는 커밋 해시만 추적)
  frontend/
    .git/             ← 하위 Git (실제 소스 수정 위치)
```

이 구조에서는 상위에서 `git commit`만으로는 프론트 변경이 커밋되지 않습니다.

---

## 4. 한 저장소로 통합 (적용 완료)

프로젝트는 **B안(한 repo로 합치기)** 를 적용했습니다.

### 수행 내용

1. `git rm --cached frontend` — 서브모듈 링크 제거
2. `frontend\.git` 폴더 삭제 — 중첩 Git 제거
3. `git add frontend` — 일반 폴더로 추적
4. 커밋: `frontend를 상위 저장소에 통합 (중첩 .git 제거)`

### 현재 구조

```
tvframework/          ← 이 저장소 하나만 사용
  frontend/           ← 일반 폴더 (별도 .git 없음)
  src/
  Docs/
  ...
```

### 이후 일상 작업

```powershell
cd D:\tvframework
git pull origin main          # 작업 시작 시 또는 push 직전 (다른 사람 변경 반영)
git status
git add .
git commit -m "변경 내용 설명"
git pull origin main          # push 직전 한 번 더 권장
git push origin main
```

`frontend` 폴더 안에서 별도 `git commit` 할 필요 **없습니다**.

### 제외되는 경로

`frontend/.gitignore`에 의해 다음은 커밋되지 않습니다.

- `frontend/node_modules`
- `frontend/dist`, `frontend/build`

---

## 5. push 전에 원격 변경 받기 (협업)

로컬에서 작업하는 동안 **다른 사람이 GitHub에 push**했을 수 있습니다.  
그 상태에서 바로 `git push`하면 아래처럼 **거절**될 수 있습니다.

```
! [rejected] main -> main (fetch first)
hint: Updates were rejected because the remote contains work that you do not have locally.
```

**의미:** 원격에 내가 아직 받지 않은 커밋이 있으므로, **먼저 가져와 합친 뒤** push해야 합니다.

### 5.1 기본 순서 (가장 많이 사용)

```powershell
cd D:\tvframework

git pull origin main    # 원격 main을 가져와 로컬 main에 병합
git push origin main    # 충돌 없으면 push
```

| 명령 | 의미 |
|------|------|
| `git fetch origin` | 원격 변경만 **다운로드** (로컬 파일은 아직 그대로) |
| `git pull origin main` | fetch + **내 `main`에 병합** |
| `git push origin main` | 병합된 결과를 GitHub에 업로드 |

### 5.2 권장 작업 흐름

**작업 시작할 때** 한 번 pull 하면 push 시 문제가 줄어듭니다.

```powershell
git pull origin main
# → 코드 수정 → git add . → git commit -m "..."
git pull origin main    # push 직전에 한 번 더
git push origin main
```

### 5.3 충돌(conflict)이 났을 때

`git pull` 후 `CONFLICT`가 보이면, **같은 파일의 같은 부분**을 둘 다 수정한 경우입니다.

1. Cursor에서 충돌 파일 열기 (`<<<<<<<`, `=======`, `>>>>>>>` 표시 확인)
2. **남길 코드**만 남기고 충돌 표시 제거 후 저장
3. 아래 실행:

```powershell
git add .
git commit -m "Merge remote main and resolve conflicts"
git push origin main
```

### 5.4 커밋하지 않은 변경이 있을 때 pull

작업 중인 파일이 있으면 pull 전에 **커밋**하거나 **임시 저장(stash)** 하세요.

```powershell
git stash
git pull origin main
git stash pop
# 충돌 나면 해결 후 add → commit
```

### 5.5 주의 사항

- **`git push --force`**: 원격 커밋을 덮어쓸 수 있어 **팀 작업 시 일반적으로 금지**합니다. 보통은 `pull` → 충돌 해결 → `push`만 사용합니다.
- **3.2 fetch first**와 달리, 협업 중 `pull` 거절은 대개 “남이 먼저 올린 정상 커밋”이 있어서이며, `--allow-unrelated-histories`는 **초기 이력 합칠 때만** 사용합니다.

---

## 6. GitHub에 올리기 (체크리스트)

```powershell
cd D:\tvframework

# 1) 원격 확인
git remote -v
# → https://github.com/wjddmlxo-1/tvframework.git

# 2) 원격 최신 반영 (다른 사람 변경 가능성)
git pull origin main

# 3) 변경 스테이징 & 커밋
git add .
git commit -m "작업 내용"

# 4) push 직전 다시 pull (권장)
git pull origin main

# 5) push
git push origin main
```

### push 후 GitHub에서 확인

- `frontend/src/...` 등 **실제 파일 트리**가 보여야 합니다.
- `frontend`가 **회색 서브모듈 링크**(폴더만 있고 내용 없음)로만 보이면, 통합 전 상태가 push된 것입니다.

---

## 7. Cursor AI 활용 팁

| 작업 | Cursor에서 |
|------|------------|
| 코드 수정 | 채팅/에이전트로 파일 편집 후 저장 |
| 커밋 전 확인 | 터미널에서 `git status`, `git diff` |
| 커밋 메시지 | 변경 범위를 에이전트에 요청해 초안 작성 가능 |
| push 오류 | 터미널 로그를 채팅에 붙여 원인 분석 요청 |

에이전트가 수정한 뒤에는 반드시 **루트(`D:\tvframework`)에서** `git add` → `commit` → `push` 하세요.

---

## 8. 문제 해결 요약표

| 메시지 | 주된 원인 | 조치 |
|--------|-----------|------|
| Repository not found | URL 오타, 로그인 계정 불일치 | `remote set-url`, 자격 증명 재설정 |
| remote origin already exists | origin 중복 등록 시도 | `remote set-url` 사용 |
| fetch first / rejected (초기) | 원격·로컬 **첫 이력** 불일치 | `pull --allow-unrelated-histories` 또는 협의 후 force |
| fetch first / rejected (협업) | 다른 사람이 먼저 push | `git pull origin main` 후 충돌 해결 → `push` |
| Everything up-to-date | 이미 동기화됨 | 로컬에서 commit 했는지 확인 |
| no changes added to commit | `git add` 누락 | `git add .` 후 commit |
| modified: frontend (submodule) | 중첩 Git (과거) | **통합 완료** — 루트에서만 commit |

---

## 9. 참고 링크

- 저장소: [https://github.com/wjddmlxo-1/tvframework](https://github.com/wjddmlxo-1/tvframework)
- 프론트 개발 환경: [frontend/Docs/development-env-setting.md](../frontend/Docs/development-env-setting.md)

---

*문서 작성: tvframework Git/GitHub 연동 작업(원격 URL 수정, 서브모듈 통합, push·commit·pull 협업 흐름) 기준*
