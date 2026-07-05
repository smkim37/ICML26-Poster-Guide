# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트

ICML 2026 (서울 COEX, 7/7–7/9 포스터 세션) 개인용 포스터 관람 가이드 웹앱. 관심 포스터 137편을 일자·세션·포스터 번호 동선 순으로 보는 모바일 우선(iPhone 16 Pro) 정적 SPA. GitHub Pages 배포: https://smkim37.github.io/ICML26-Poster-Guide/

**기획은 완료 상태다. 스펙이 전부 문서화되어 있으므로 재설계하지 말고 그대로 구현한다.**

## 문서 인덱스 (구현 전 필독 순서)

1. `PLAN.md` — 6페이즈 실행 계획 + acceptance 체크리스트 + 진행 현황 (**작업 후 체크박스 갱신 필수**)
2. `docs/02-architecture.md` — 스택 버전 고정, **금지 목록**, verbatim 설정 블록, 리스크 규칙 R1–R5
3. `docs/01-requirements.md` — 화면·컴포넌트 동작 명세
4. `docs/03-design-system.md` — 컬러/타이포/컴포넌트 시각 스펙
5. `docs/04-data.md` — 스키마·세션 상수 verbatim, 데이터 불변식
6. `docs/05-conference-info.md` — SchedulePage 콘텐츠 원본 (검증된 공식 일정)
7. `docs/06-deploy.md` — Pages 배포 YAML verbatim

## 명령어

```bash
# 데이터 재생성 (엑셀 갱신 시에만; posters.json 손편집 금지)
python3 scripts/excel_to_json.py

# 개발 (스캐폴드 이후)
npm run dev        # SW 비활성이 정상
npm run build      # tsc && vite build
npm run preview    # PWA/오프라인 테스트는 반드시 여기서
```

## 절대 규칙 (요약 — 전체는 docs/02 §1 금지 목록)

- Tailwind **3** 문법(`@tailwind base;...`) / react-router-dom **6** — v4/v7 혼입 금지
- `posters.json`은 정적 import (fetch 금지), 손편집 금지, `excel_to_json.py` 수정 금지
- `localStorage` 접근은 `src/lib/storage.ts` 단일 게이트 (키: `icml26.userdata.v1`)
- 시간 로직은 `src/lib/time.ts` 단일 파일, 세션 문자열로 Date 생성 금지, `?now=` 오버라이드 유지
- 코드에 `/`로 시작하는 URL 금지 (base `/ICML26-Poster-Guide/`) — `import.meta.env.BASE_URL` 사용
- `min-h-dvh` (h-screen 금지), safe-area 패딩 유지, 터치 타깃 ≥44pt
- PWA는 Phase 6에서만, docs/02 §6 설정 verbatim, runtimeCaching 추가 금지
- 상태/UI킷/아이콘/차트 라이브러리 설치 금지

## 작업 프로토콜

- PLAN.md의 페이즈를 순서대로, 페이즈당 acceptance 전 항목 통과 후 다음으로.
- 커밋: `Phase N: <요약>`, 페이즈 완료 시 PLAN.md 체크박스·진행 표 갱신 포함해 push.
- 막히면 docs/02 §9 리스크 규칙(R1–R5)부터 확인.
- 데이터 수치 검증 기준: 137편 = 핵심30/관련52/참고55 = 화41/수35/목46/미정15 (docs/04 §5 불변식).
