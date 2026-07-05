# 01 — 기능 명세 (Requirements)

이 문서는 화면·컴포넌트 단위의 동작 명세다. 기술 결정과 금지 규칙은 `docs/02`, 디자인 토큰은 `docs/03`, 데이터 스키마는 `docs/04` 참조.

## 1. 라우트 (HashRouter, 5개, 중첩 없음)

| Route | 페이지 | 목적 | TabBar |
|---|---|---|---|
| `#/` | ListPage | 일자 탭 + 세션 그룹 포스터 리스트 + 검색/필터 | 포스터 |
| `#/paper/:id` | PaperPage | 포스터 상세 (`:id` = OpenReview forum id) | (없음) |
| `#/schedule` | SchedulePage | ICML 2026 전체 일정 가이드 | 일정 |
| `#/stats` | StatsPage | 관람 진행률 + 분포 통계 | 통계 |
| `#/settings` | SettingsPage | 테마·백업·초기화·정보 | 설정 |

## 2. 앱 셸

- **AppHeader** (모든 페이지 상단, sticky): 좌측 ICML 로고(`icml-navbar-logo.svg`, 24px) + "ICML 2026 Poster Guide" 워드. `pt-[env(safe-area-inset-top)]`, backdrop-blur, 하단 헤어라인. PaperPage에서는 로고 대신 ← 뒤로 버튼(`navigate(-1)`).
- **TabBar** (하단 고정, PaperPage 제외): 포스터 / 일정 / 통계 / 설정. 인라인 SVG 아이콘 22px + 11px 레이블. 활성 = 액센트 색. `pb-[env(safe-area-inset-bottom)]`, backdrop-blur.

## 3. ListPage (`#/`)

구성 순서: DayTabs → NowBanner → SearchBar(+필터 버튼) → SessionGroup 목록.

- **DayTabs**: `화 7/7 · 수 7/8 · 목 7/9 · 미정` 세그먼트 컨트롤. 각 탭에 (필터 적용 후) 편수 표기. 초기값: 오늘(KST)이 7/7–7/9면 해당 요일, 아니면 `화`. 선택값은 `sessionStorage('icml26.day')`에 저장 → 상세에서 뒤로 왔을 때 복원. 스크롤 위치도 sessionStorage로 복원.
- **SessionGroup**: 해당 일자의 세션을 SESSIONS 배열 순서(시간순)로. 헤더: `Poster Session 1 · 10:30–12:15 · Hall A` + 진행률 `방문 x/y` + 얇은 ProgressBar. 미정 탭은 세션 그룹 없이 티어순(핵심→관련→참고) 플랫 리스트 + 상단 안내문("조사 시점(7/5) 세션 미배정 — 현장 앱에서 확인").
- **정렬(동선 최적화)**: 세션 내 `posterNum` 오름차순 고정. 포스터 번호는 Hall A 물리적 배치 순서이므로 낮은 번호부터 한 방향으로 걸으면 된다. 별도의 "경로 계산" 없음 — 이 정렬이 곧 동선이다.
- **PosterCard**: 좌측 `#번호`(모노스페이스) · 티어 색 3px 좌측 보더 · 제목(영문, 2줄 클램프) · 한줄소개(13px, 2줄 클램프) · TierBadge + TypeBadge(Spotlight/Oral만) + 기관유형 표시 · 우측에 방문 체크·별표 버튼(각각 터치 타깃 ≥44×44pt, 카드 탭과 이벤트 분리 — `stopPropagation`). 방문한 카드는 불투명도 55% + 체크 채움. 카드 탭 → `#/paper/:id`.
- **SearchBar**: placeholder "제목·저자·소속·소개 검색", 150ms 디바운스, 우측 클리어 버튼. 검색어가 있으면 "전체 일자에서 검색" 토글 노출(기본 off = 현재 탭 내 검색). 결과 0이면 EmptyState.
- **FilterSheet** (필터 버튼 → 하단 시트): 칩 다중선택 — 티어(핵심/관련/참고), 발표유형(Poster/Spotlight/Oral), 기관유형(학교/학교+기업), 참고분류(4종), 미방문만 토글. **facet 간 AND, facet 내 OR**. 활성 필터 개수를 필터 버튼에 배지로. "초기화" 버튼 포함. 필터 상태는 ListPage 로컬 state(라우트 이동 시 유지 불필요).

## 4. NowBanner (ListPage 상단, `useNow` 30초 갱신)

| 조건 (KST) | 표시 | 동작 |
|---|---|---|
| 7/7 00:00 이전 | `D-n · ICML 2026 서울` | — |
| 세션 진행 중 | `지금 Poster Session N · 종료까지 m분 · 미방문 핵심 k편` | 탭 → 해당 일자 탭 전환 + 세션으로 스크롤 |
| 컨퍼런스 기간 중 세션 사이 | `다음: Poster Session N · HH:MM 시작 (m분 후)` | 탭 → 해당 세션 |
| 7/9 마지막 세션 종료 후 | 렌더하지 않음 | — |

- "미방문 핵심 k편" = 지금 세션에 배정된 tier=core 중 visited=false 개수.
- 동시에 두 세션이 겹치는 경우(PS1과 ORAL1)는 포스터 세션을 우선 표시.

## 5. PaperPage (`#/paper/:id`)

위→아래: TierBadge+TypeBadge → 제목(영문 전체) → 한줄소개 전체 → 세션 정보 블록(요일·세션명·시간·장소·`#번호` — 미정이면 "일정 미정, 현장 앱 확인") → 저자 → 소속 칩(affiliations 배열) → 참고분류(있으면) → 액션 영역: 방문 체크 토글 + 별표 토글(큰 버튼) → MemoEditor → 외부 링크 버튼 2개(OpenReview / ICML 페이지, `target="_blank" rel="noopener"`).

- **MemoEditor**: autosize textarea, placeholder "메모 (질문할 것, 인상 등)", blur 시 저장. 저장 직후 "저장됨" 마이크로 피드백(1초).
- 존재하지 않는 id → "논문을 찾을 수 없습니다" EmptyState + 홈 버튼.

## 6. SchedulePage (`#/schedule`)

콘텐츠 원본은 `docs/05-conference-info.md` (하드코딩, 데이터 파일 아님 — JSX에 직접 작성해도 됨).

- 상단: 컨퍼런스 요약 카드 (7/6–7/11 · COEX 서울 · 등록데스크 화–목 07:30–18:00).
- **일자별 아코디언 또는 섹션** (7/5 일 ~ 7/11 토): 각 날의 주요 이벤트 타임라인. 메인 3일은 키노트(08:30–09:30, 연사·제목) / Oral(10:00–11:00) / 포스터 세션(시간·Hall A) / 전시홀 시간 / affinity 이벤트.
- **포스터 세션 전체 표**: PS1–8 × (요일·시간·내 관심 편수 — posters.json에서 계산).
- 오늘(KST)에 해당하는 날 자동 강조/펼침.
- 하단 각주: "일정은 2026-07-05 조사 기준. 현장 변경은 ICML 공식 앱 확인."

## 7. StatsPage (`#/stats`)

1. **관람 진행률**: StatTile 4개 — 방문 n/137 · 핵심 방문 n/30 · 별표 n · 메모 n. 전체 ProgressBar + 티어별 미니 바 3개.
2. **내 리스트 분포** (StatBar 그룹, 각 바에 수치 표기):
   - 티어: 핵심 30 / 관련 52 / 참고 55 (티어 색 사용)
   - 요일: 화 41 / 수 35 / 목 46 / 미정 15
   - 세션별: PS1 17 / PS2 23 / PS3 13 / PS4 17 / PS5 5 / PS6 16 / PS7 12 / PS8 18 / ORAL 1 / 미정 15
   - 발표유형: Poster 126 / Spotlight 10 / Oral 1
   - 기관유형: 학교 79 / 학교+기업 58
   - 참고분류: 멀티모달 융합 19 / 비디오-언어 14 / 생성모델 방법론 11 / 비디오 생성/편집 9
3. **ICML 2026 전체** (StatTile): accepted 6,341편(조사 기준) · 내 커버리지 137편(2.2%) · 제출 23,918편 · Oral 168 / Spotlight 536. 각주 "출처: icml.cc 및 공개 집계, 2026-07-05 기준".

분포 수치는 하드코딩하지 말고 **posters.json에서 계산** (검증 겸용). ICML 전체 수치만 `overview.ts` 상수.

## 8. SettingsPage (`#/settings`)

- **테마**: 시스템 / 라이트 / 다크 3-세그먼트.
- **백업**: "내보내기" → `icml26-backup-YYYYMMDD-HHmm.json` 다운로드. "가져오기" → 파일 선택 → 유효성 검사(version===1, papers가 object) → `confirm("현재 기록을 백업 파일 내용으로 교체합니다")` → 전체 교체(merge 아님).
- **초기화**: 방문/별표/메모 전체 삭제 (confirm 2단계 문구).
- **정보**: 앱 버전, 데이터 기준일(2026-07-05), 137편 요약, GitHub 링크, "데이터 갱신 방법" 짧은 안내(README 참조).

## 9. 공통 UX 규칙

- 모든 인터랙티브 요소 터치 타깃 ≥44×44pt.
- 트랜지션 150–200ms ease, 과한 애니메이션 금지 (담백·간결·세련 — 디테일은 docs/03).
- 외부 링크는 항상 새 탭. 데이터 로딩 스피너 불필요(정적 import — 로딩 상태가 존재하지 않음).
- 한국어 UI, 논문 제목·저자·기관은 원문(영문). 날짜/시간 표기는 항상 KST 기준(표기에 "KST" 명시는 SchedulePage 요약 카드 1회면 충분).
