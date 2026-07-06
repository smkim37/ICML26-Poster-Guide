# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트

ICML 2026 (서울 COEX, 7/7–7/9 포스터 세션) 포스터 관람 가이드 웹앱. 관심 포스터 137편을 일자·세션·포스터 번호 동선 순으로 보는 모바일 우선(iPhone 16 Pro) 정적 SPA.

- **상태**: 완성·배포·운영 중 (Phase 1–8 완료, 이력은 PLAN.md). 남은 작업 유형 = 유지보수(데이터 갱신, 소소한 수정).
- **Live**: https://sumin-kim.com/ICML26-Poster-Guide/ (= smkim37.github.io/ICML26-Poster-Guide, 커스텀 도메인 301)
- 링크 공유용 공개 앱. UI는 전원 공개, 개인화 액션(체크·별표·메모·백업)은 **개인 모드** 게이트 (docs/01 §10) — 해제 상수·해시는 `src/hooks/usePersonalMode.tsx`의 `PW_HASH`/`PERSONAL_TTL_MS`.

## 문서 인덱스

1. `docs/01-requirements.md` — 화면·컴포넌트 동작 명세 (개인 모드 §10 포함)
2. `docs/02-architecture.md` — 스택 버전 고정, **금지 목록**, verbatim 설정, 리스크 규칙 R1–R5
3. `docs/03-design-system.md` — 컬러/타이포/컴포넌트 시각 스펙
4. `docs/04-data.md` — 스키마·세션 상수, 데이터 불변식, 재수출 플로우
5. `docs/05-conference-info.md` — 검증된 ICML 2026 공식 일정 (SchedulePage 원본)
6. `docs/06-deploy.md` — Pages 배포·트러블슈팅
7. `PLAN.md` — 구현 이력 (전 페이즈 완료 기록)

## 명령어

```bash
# 로컬 Node는 20 필요 — 시스템 node가 16이면:
export PATH=/data/projects/sumin/ICML2026/.tools/node-v20.19.0-linux-x64/bin:$PATH

npm run dev        # SW 비활성이 정상
npm run build      # tsc && vite build
npm run preview    # PWA/오프라인 테스트는 반드시 여기서

# 데이터 재생성 (엑셀 갱신 시에만; posters.json 손편집 금지)
python3 scripts/excel_to_json.py
```

## 절대 규칙 (요약 — 전체는 docs/02 §1 금지 목록)

- Tailwind **3** 문법(`@tailwind base;...`) / react-router-dom **6** — v4/v7 혼입 금지
- `posters.json`은 정적 import (fetch 금지), 손편집 금지, `excel_to_json.py` 임의 수정 금지
- `localStorage` 접근은 `src/lib/storage.ts` 단일 게이트 (예외: useTheme의 `icml26.theme`, index.html 인라인 no-flash 스크립트)
- 시간 로직은 `src/lib/time.ts` 단일 파일, 세션 문자열로 Date 생성 금지, `?now=` 오버라이드 유지
- 코드에 `/`로 시작하는 URL 금지 (base `/ICML26-Poster-Guide/`) — `import.meta.env.BASE_URL` 사용
- `min-h-dvh` (h-screen 금지), safe-area 패딩 유지, 터치 타깃 ≥44pt
- PWA 설정은 docs/02 §6 verbatim 유지, runtimeCaching 추가 금지
- 상태/UI킷/아이콘/차트 라이브러리 설치 금지
- 개인화 액션 핸들러는 첫 줄에서 `usePersonalMode().requirePersonal()` 호출 (잠금 시 안내 팝업)

## 운영 메모

- 배포: main push → Actions 자동. "Deployment failed, try again later"는 Pages 일시 장애 — rerun-failed-jobs로 재시도.
- 데이터 수치 검증 기준: 137편 = 핵심30/관련52/참고55 = 화41/수35/목46/미정15 (docs/04 §5 불변식).
- "일정 미정" 15편: 2026-07-06 icml.cc 개별 재확인 — 전원 미배정. 배정 확인 시 docs/04 §6 플로우로 반영.
