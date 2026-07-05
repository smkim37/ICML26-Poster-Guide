# ICML 2026 Poster Guide

ICML 2026 (서울 COEX, 2026.7.6–7.11) 개인용 포스터 관람 가이드 웹앱.
직접 큐레이션한 관심 포스터 **137편**(핵심 30 · 관련 52 · 참고 55)을 일자·세션·포스터 번호 동선 순으로 효율적으로 관람하기 위한 도구.

**Live**: https://smkim37.github.io/ICML26-Poster-Guide/

## 기능

- 일자 탭(화·수·목·미정) + 세션별 그룹, **세션 내 포스터 번호순 정렬 = Hall A 동선**
- 검색(제목·저자·소속·소개) + 필터(티어·발표유형·기관유형·참고분류·미방문)
- 방문 체크 · 별표 · 메모 (localStorage, 백업 내보내기/가져오기)
- 지금/다음 세션 실시간 배너 (KST), 세션별 진행률
- ICML 2026 전체 일정 가이드 (키노트·세션·전시홀·부대행사)
- 통계 대시보드 (관람 진행률 + 분포 + ICML 전체 통계)
- 다크모드, PWA 오프라인 지원, iPhone safe-area 대응

## 스택

Vite + React 18 + TypeScript + Tailwind CSS 3 · HashRouter · vite-plugin-pwa · GitHub Pages (Actions)

## 개발

```bash
npm install
npm run dev       # 개발 서버
npm run build     # 프로덕션 빌드
npm run preview   # 빌드 결과 확인 (PWA 테스트는 여기서)
```

기획·구현 문서: [`PLAN.md`](PLAN.md), [`docs/`](docs/), [`CLAUDE.md`](CLAUDE.md)

## 데이터 갱신 (엑셀 재수출 시)

"일정 미정" 논문이 세션 배정을 받는 등 엑셀이 갱신되면:

```bash
# 1. 새 엑셀로 덮어쓰기 (파일명 유지)
cp <새파일>.xlsx "data/ICML2026 Poster Guide.xlsx"
# 2. JSON 재생성 — 세션 변경 diff와 총계가 출력됨
python3 scripts/excel_to_json.py   # requires: pip install openpyxl
# 3. 커밋 & push → Actions가 자동 재배포
```

방문/별표/메모 기록은 OpenReview id 기준이라 데이터 갱신 후에도 유지된다.

## 배포

`main` push 시 GitHub Actions가 자동 빌드·배포한다.
최초 1회만: repo **Settings → Pages → Source를 "GitHub Actions"로** 설정 (절차: [`docs/06-deploy.md`](docs/06-deploy.md)).

---

ICML 로고 저작권은 ICML에 있으며 개인 참관용으로만 사용. 포스터 데이터 조사 기준일: 2026-07-05.
