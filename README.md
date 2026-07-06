# ICML 2026 Poster Guide

ICML 2026 (서울 COEX, 2026.7.6–7.11) 포스터 관람 가이드 웹앱.
직접 큐레이션한 관심 포스터 **137편**(핵심 30 · 관련 52 · 참고 55)을 일자·세션·포스터 번호 동선 순으로 효율적으로 관람하기 위한 도구입니다. 링크로 자유롭게 열람할 수 있습니다.

**Live**: https://sumin-kim.com/ICML26-Poster-Guide/ (= https://smkim37.github.io/ICML26-Poster-Guide/)

## 기능

- **일자 탭** (화·수·목·미정) + 세션별 그룹, **세션 내 포스터 번호순 정렬 = Hall A 동선** — 낮은 번호부터 한 방향으로 걸으면 됩니다
- **검색**(제목·저자·소속·소개) + **필터**(티어·발표유형·기관유형·참고분류·미방문)
- **지금/다음 세션 실시간 배너** (KST) — 진행 중 세션, 남은 시간, 미방문 핵심 편수
- **ICML 2026 전체 일정 가이드** — 키노트·오랄·포스터 세션·전시홀·부대행사 (icml.cc 검증)
- **통계 대시보드** — 관람 진행률 + 리스트 분포 + ICML 2026 전체 통계
- **개인 모드** (소유자 전용): 방문 체크 · 별표 · 메모 · 백업/복원 — UI는 모두에게 보이지만 사용은 설정에서 비밀번호로 해제해야 합니다 (해제 후 3시간 유지)
- 다크모드, **PWA 오프라인 지원**, iPhone safe-area 대응

> **iPhone 팁**: Safari 공유 버튼 → "홈 화면에 추가"로 설치하면 네이티브 앱처럼 전체 화면 + 오프라인으로 동작합니다.

## 기술 스택

Vite 5 + React 18 + TypeScript + Tailwind CSS 3 · HashRouter · vite-plugin-pwa (precache-only) · GitHub Pages (Actions 자동 배포)

외부 런타임 의존성 0 — 데이터는 번들에 포함, 폰트는 시스템 스택, 상태는 localStorage. 번들 ~110KB gzip.

## 개발

```bash
npm install
npm run dev       # 개발 서버 (서비스 워커 비활성이 정상)
npm run build     # 타입체크 + 프로덕션 빌드
npm run preview   # 빌드 결과 확인 (PWA/오프라인 테스트는 여기서)
```

문서: [`CLAUDE.md`](CLAUDE.md) (작업 규칙·인덱스) · [`PLAN.md`](PLAN.md) (구현 이력) · [`docs/`](docs/) (기능 명세 01 / 아키텍처 02 / 디자인 시스템 03 / 데이터 04 / 학회 정보 05 / 배포 06)

## 데이터 갱신

포스터 데이터의 원본은 `data/ICML2026 Poster Guide.xlsx`이며, `src/data/posters.json`은 생성 산출물입니다 (손편집 금지).

```bash
# 1. 새 엑셀로 덮어쓰기 (파일명 유지)
cp <새파일>.xlsx "data/ICML2026 Poster Guide.xlsx"
# 2. JSON 재생성 — 세션 변경 diff와 검증 결과가 출력됨
python3 scripts/excel_to_json.py   # requires: pip install openpyxl
# 3. 커밋 & push → Actions가 자동 재배포
```

방문/별표/메모 기록은 OpenReview id 기준이라 데이터 갱신 후에도 유지됩니다.
"일정 미정" 15편은 2026-07-06 icml.cc 재확인 기준 전원 미배정 상태입니다 (docs/04 §6).

## 배포

`main` push 시 GitHub Actions가 자동 빌드·배포합니다 (`.github/workflows/deploy.yml`).
Pages 배포가 간헐적으로 "Deployment failed, try again later"로 실패하면 Actions에서 재실행하면 됩니다 (docs/06 트러블슈팅).

---

ICML 로고 저작권은 ICML에 있으며 참관 안내용으로만 사용. 포스터 데이터 조사 기준일: 2026-07-05.
