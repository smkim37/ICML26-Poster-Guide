# ICML 2026 Poster Guide — 마스터 플랜

관심 포스터 **137편**(핵심 30 / 관련 52 / 참고 55)을 일자·세션·포스터 번호 동선 순으로 관람하기 위한 개인용 모바일 우선 웹앱.

- **라이브 URL**: https://smkim37.github.io/ICML26-Poster-Guide/
- **주 사용 기기**: iPhone 16 Pro (393×852pt) · iPad/노트북/갤럭시 대응
- **컨퍼런스**: ICML 2026, 서울 COEX — 포스터 세션은 7/7(화)–7/9(목), 전부 Hall A

## 실행 프로토콜 (구현 담당 모델은 반드시 준수)

1. 시작 전 `CLAUDE.md`와 `docs/01`~`docs/06`을 읽는다. 스펙이 이미 다 정해져 있다 — **재설계하지 말 것**.
2. 페이즈를 **순서대로, 한 번에 하나씩** 진행한다. 페이즈를 건너뛰거나 병합하지 않는다.
3. 페이즈 완료 조건 = 해당 acceptance **전 항목** 통과. 통과 후 이 파일의 체크박스를 갱신하고 커밋한다.
4. 커밋 메시지: `Phase N: <요약>`. 각 페이즈는 1개 이상의 커밋으로 마무리하고 push한다.
5. 막히면 docs/02 §리스크 규칙(R1–R5)을 먼저 확인한다. 대부분의 함정은 거기 적혀 있다.

---

## Phase 1 — 스캐폴드 + 데이터 연결 + 배포 골격

> 목적: base-path/배포 문제를 프로젝트 첫날에 노출시킨다. UI는 없어도 된다.

- [x] Vite + React + TS 스캐폴드. **의존성 버전은 docs/02 §1의 package.json 그대로** (Tailwind 3.4, react-router-dom 6 — v4/v7 금지)
- [x] Tailwind 3 설정 (`tailwind.config.js` darkMode:'class', postcss) — docs/03 토큰 반영
- [x] `vite.config.ts`: `base: '/ICML26-Poster-Guide/'` (docs/02 §3 verbatim, PWA 플러그인은 아직 넣지 않음)
- [x] `src/types.ts`, `src/data/posters.ts`(JSON 정적 import), `src/data/sessions.ts`, `src/data/overview.ts`, `src/lib/labels.ts` — docs/04 verbatim
- [x] `index.html` head 블록 (viewport-fit=cover 등) — docs/02 §8 verbatim
- [x] 임시 App: "137편 로드됨 · 화 41 / 수 35 / 목 46 / 미정 15" 출력
- [x] `.github/workflows/deploy.yml` — docs/06 verbatim. push 후 Actions 성공 확인

**Acceptance**
- [x] `npm run dev` / `npm run build` 성공, TS 에러 0
- [x] 화면에 137편 카운트가 데이터에서 계산되어 표시됨
- [x] **라이브 URL이 렌더되고 Network 탭에 404 없음** (Pages 소스가 "GitHub Actions"로 설정돼 있어야 함 — docs/06)

## Phase 2 — 리스트 + 상세 (읽기 전용 코어)

- [x] `HashRouter` + 라우트 5개 (docs/01 §1) + `App.tsx` 셸 (AppHeader/TabBar)
- [x] AppHeader(로고+타이틀, safe-area-top) / TabBar(4탭, safe-area-bottom) — docs/03 스펙
- [x] DayTabs(화·수·목·미정) + SessionGroup(세션 헤더: 이름·시간·장소) + PosterCard + TierBadge/TypeBadge
- [x] 정렬: 세션은 시간순(SESSIONS 배열 순서), **세션 내 posterNum 오름차순**, 미정 탭은 티어순(핵심→관련→참고)
- [x] PaperPage: 전체 필드 + OpenReview/ICML 링크 버튼(`target="_blank" rel="noopener"`)

**Acceptance**
- [x] 4개 탭이 각각 41 / 35 / 46 / 15편 표시
- [x] 7/7 탭에 ORAL1(AUDITORIUM, 10:30–10:45)이 별도 그룹으로 표시됨
- [x] 카드 탭 → 상세 → 브라우저 뒤로가기 시 **같은 일자 탭으로 복귀** (sessionStorage)
- [x] 두 외부 링크가 새 탭에서 열림

## Phase 3 — 검색 · 필터 · 유저 데이터

- [x] `lib/filter.ts` (순수 함수) + SearchBar(150ms 디바운스) + FilterSheet(티어/발표유형/기관유형/참고분류/미방문)
- [x] `lib/storage.ts` (localStorage 유일 게이트, `icml26.userdata.v1`) + `useUserData` 컨텍스트 — docs/02 §5 스키마 verbatim
- [x] 카드에서 방문 체크·별표 (터치 타깃 ≥44pt), 상세에서 방문·별표·메모(MemoEditor, blur 시 저장)
- [x] 세션 헤더에 진행률 (방문 x/y + ProgressBar)

**Acceptance**
- [x] "grounding" 검색 → 제목/소개/저자/소속 대소문자 무시 매칭
- [x] 필터는 facet 간 AND 결합, 칩 다중 선택 가능
- [x] 방문/별표/메모가 강력 새로고침 후 유지, localStorage 키가 정확히 `icml26.userdata.v1` 하나
- [x] 방문한 카드는 시각적으로 가라앉음(불투명도 55%), 결과 없으면 EmptyState

## Phase 4 — 시간 인지 + 일정 가이드 + 통계

- [x] `lib/time.ts` (Asia/Seoul, `?now=` 오버라이드) + `useNow`(30초 갱신) — docs/02 §7 스펙 그대로
- [x] NowBanner 4상태 (D-n / 지금 세션 / 다음 세션 / 종료 후 숨김) — docs/01 §4
- [x] SchedulePage: docs/05 내용으로 7/5–7/11 일자별 가이드 + 포스터 세션 표 + 키노트
- [x] StatsPage: StatTile(방문 n/137, 핵심 n/30, 별표, 메모) + StatBar 분포 6종 + ICML 전체 통계

**Acceptance**
- [x] `?now=2026-07-08T15:00` → "지금 Poster Session 4" / `?now=2026-07-08T13:00` → 다음 세션 카운트다운 / `?now=2026-06-20T10:00` → D-17
- [x] 통계 수치가 30/52/55, 41/35/46/15, 79/58, 19/14/11/9와 일치
- [x] NowBanner의 "지금" 상태에서 탭 → 해당 세션으로 스크롤

## Phase 5 — 다크모드 + 설정 + 반응형 폴리시

- [x] `useTheme`(light/dark/system, `icml26.theme` 키) + index.html 인라인 no-flash 스크립트
- [x] SettingsPage: 테마 토글, 백업 내보내기/가져오기(replace-with-confirm), 데이터 초기화, 앱 정보
- [x] safe-area 전수 점검 (`pt-[env(safe-area-inset-top)]`, `pb-[env(safe-area-inset-bottom)]`, `min-h-dvh`)
- [x] 반응형: 리스트 max-w 640px 중앙 정렬, 통계 ≥768px 2컬럼, 1280px 데스크톱 점검

**Acceptance**
- [x] 테마 전환·유지, 새로고침 시 흰 화면 플래시 없음
- [x] 내보낸 JSON을 초기화된 브라우저에 가져오기 → 모든 마크 복원
- [x] 393px 뷰포트에서 가로 스크롤 0, 홈 인디케이터와 TabBar 겹침 없음
- [x] 라이트/다크 모두에서 대비 점검 (본문 대비 ≥4.5:1)

## Phase 6 — PWA + 최종 QA

- [ ] `vite-plugin-pwa` 추가 — **docs/02 §6 설정 verbatim, runtimeCaching 추가 금지**
- [ ] `scripts/make_icons.py`(Pillow)로 아이콘 180/192/512/512-maskable 생성 → `public/icons/` 커밋
- [ ] iOS 메타 (apple-touch-icon, status-bar-style) 확인
- [ ] 오프라인 테스트: `npm run build && npm run preview` → 1회 로드 → DevTools 오프라인 → 전 라우트 동작
- [ ] 재배포 후 재실행 시 새 버전 반영(autoUpdate) 확인

**Acceptance**
- [ ] 오프라인에서 전 라우트 + 데이터 + 로고 정상
- [ ] Chrome 설치 프롬프트 / iOS 홈 화면 추가 시 아이콘·이름 정상
- [ ] **Escape hatch**: 이 페이즈가 2회 시도에도 실패하면 `VitePWA()`를 vite.config.ts에서 제거하고 배포한다. 앱은 PWA에 인질로 잡히지 않는다.

---

## 페이즈 진행 현황

| Phase | 상태 | 커밋 |
|---|---|---|
| 0. 기획·데이터·자산 (이 repo의 초기 상태) | ✅ 완료 | initial commit |
| 1. 스캐폴드+데이터+배포 | ✅ 완료 | 0add237 |
| 2. 리스트+상세 | ✅ 완료 | (this) |
| 3. 검색·필터·유저데이터 | ✅ 완료 | |
| 4. 시간·일정·통계 | ✅ 완료 | |
| 5. 다크모드·설정·반응형 | ✅ 완료 | |
| 6. PWA·QA | ⬜ | |
