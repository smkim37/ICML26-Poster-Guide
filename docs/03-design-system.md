# 03 — 디자인 시스템 (Design System)

컨셉: **"컨퍼런스 필드 가이드"** — 담백하고 간결하고 세련되게. 에디토리얼한 절제, 여백, 헤어라인. 장식은 티어 색 3px 보더와 액센트 하나로 끝낸다. 그림자·그라데이션·과한 애니메이션 금지.

## 1. 컬러 토큰

Tailwind 기본 팔레트(zinc/stone) + 커스텀 3색. `tailwind.config.js`의 `theme.extend.colors`:

```js
colors: {
  accent: { DEFAULT: '#2A419E', dark: '#8B9FE8' },   // ICML 로고 블루 / 다크모드용 밝은 변형
  tier: {
    core:      { DEFAULT: '#059669', dark: '#34d399' },  // 핵심 (에메랄드)
    related:   { DEFAULT: '#2563eb', dark: '#60a5fa' },  // 관련 (블루)
    reference: { DEFAULT: '#d97706', dark: '#fbbf24' },  // 참고 (앰버)
  },
}
```

| 역할 | 라이트 | 다크 |
|---|---|---|
| 페이지 배경 | `stone-50` #FAFAF9 | `zinc-950` #09090B |
| 카드/시트 표면 | `white` | `zinc-900` |
| 헤어라인 보더 | `zinc-200` | `zinc-800` |
| 본문 텍스트 | `zinc-900` | `zinc-100` |
| 보조 텍스트 (소개, 메타) | `zinc-500` | `zinc-400` |
| 액센트 (활성 탭, 링크, 포커스) | `accent` #2A419E | `accent-dark` #8B9FE8 |
| 헤더/탭바 배경 | `white/80` + backdrop-blur | `zinc-950/80` + backdrop-blur |

- 티어 색 사용처는 **딱 3곳**: 카드 좌측 3px 보더, TierBadge, 통계 바. 그 외 남용 금지.
- TierBadge: 색 텍스트 + 동일 색 10% 배경 틴트 (`bg-tier-core/10 text-tier-core` 방식). 배경 전체 칠하기 금지.
- ICML 로고 팔레트의 빨강/주황은 UI에 쓰지 않는다 (로고 안에서만 존재).
- 대비: 본문 ≥4.5:1 유지. 다크모드에서 티어 색은 반드시 `dark` 변형 사용.

## 2. 타이포그래피

시스템 폰트 스택 (웹폰트 다운로드 금지 — 오프라인 요건):

```js
fontFamily: {
  sans: ['-apple-system', 'BlinkMacSystemFont', '"Apple SD Gothic Neo"',
         '"Pretendard Variable"', 'Pretendard', '"Noto Sans KR"',
         '"Segoe UI"', 'Roboto', 'sans-serif'],
  mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
}
```

| 용도 | 스펙 |
|---|---|
| 페이지 타이틀 | 20px / 700 / zinc-900 |
| 섹션 헤더 (세션명 등) | 13px / 600 / zinc-500, letter-spacing 0.01em |
| 카드 제목 (영문 논문명) | 15px / 600 / 1.35, 2줄 클램프 (`line-clamp-2`) |
| 본문·한줄소개 | 13px / 400 / 1.55 / zinc-500 (상세에서는 15px zinc-700) |
| 포스터 번호 | `font-mono` 13px / 600, `tabular-nums` |
| 배지·레이블 | 11px / 600 |
| 통계 큰 숫자 | 28px / 700, `tabular-nums` |

기본 body: 15px, `antialiased`, `line-height 1.5`. `word-break: keep-all` (한국어 줄바꿈 품질).

## 3. 레이아웃 & 스페이싱

- 4px 그리드. 화면 좌우 패딩 16px. 카드 내부 패딩 14px. 카드 간 간격 8px. 섹션 간 24px.
- 리스트 콘텐츠 `max-w-[640px] mx-auto`. StatsPage는 `md:grid-cols-2` (≥768px).
- 라운딩: 카드 12px, 배지 pill(full), 버튼 10px, 바텀시트 상단 16px.
- AppHeader 높이 48px + `pt-[env(safe-area-inset-top)]`. TabBar 높이 52px + `pb-[env(safe-area-inset-bottom)]`.
- 본문 스크롤 영역은 TabBar에 가리지 않게 `pb-[calc(52px+env(safe-area-inset-bottom)+8px)]`.
- 전체 높이는 `min-h-dvh` (`h-screen`/`100vh` 금지).

## 4. 핵심 컴포넌트 스펙

### PosterCard
```
┌─────────────────────────────────────────────┐
│▌ #1006   Foresee-to-Ground: From Predic…   ○☆│   ▌= 티어색 3px 좌측 보더
│▌         Video Temporal Grounding을 타임…     │   ○= 방문 체크(44pt), ☆= 별표(44pt)
│▌         [핵심] [Spotlight] 학교+기업          │
└─────────────────────────────────────────────┘
```
- 표면: `bg-white dark:bg-zinc-900`, 헤어라인 보더, radius 12px, 그림자 없음.
- 번호 열 고정폭(~52px) `font-mono` — 번호끼리 세로 정렬되어 동선 스캔이 쉬워야 한다. 번호 없으면(미정/Oral) `—`.
- 방문 시: 카드 전체 `opacity-55` + 체크 아이콘 채움(티어 색 아님, `accent`). 취소선 금지(제목은 계속 읽혀야 함).
- 탭 피드백: `active:scale-[0.98] transition-transform duration-150`.

### TierBadge / TypeBadge
- `[핵심]` `[관련]` `[참고]` — 11px pill, §1 틴트 방식.
- TypeBadge는 Spotlight(`accent` 틴트)·Oral(zinc-900 반전)만 렌더, Poster는 렌더 안 함.

### DayTabs (세그먼트 컨트롤)
- 컨테이너: `bg-zinc-100 dark:bg-zinc-800` radius 10px, 내부 버튼 4개 균등.
- 활성: `bg-white dark:bg-zinc-900` + 얇은 보더 + 텍스트 600. 미정 탭 레이블은 `미정 15`처럼 편수 병기.
- 헤더 아래 sticky (`top-[calc(48px+env(safe-area-inset-top))]`).

### NowBanner
- `accent/8` 배경 틴트 + `accent` 텍스트, radius 10px, 13px. 좌측에 라이브 도트(진행 중일 때만, `animate-pulse` 6px 원).

### TabBar
- 4탭, 아이콘 22px 인라인 SVG(stroke 1.8) + 11px 레이블. 활성 = `accent`, 비활성 = zinc-400.
- 상단 헤어라인, backdrop-blur. 아이콘: 격자(포스터)/달력(일정)/막대차트(통계)/톱니(설정) — 단순한 path로 직접 작성.

### FilterSheet (바텀시트)
- 오버레이 `black/40`, 시트는 하단에서 슬라이드업 200ms, 상단 라운드 16px + 그랩바(36×4px zinc-300).
- 칩: 미선택 `bg-zinc-100 dark:bg-zinc-800`, 선택 `accent` 배경 + 흰 텍스트. 높이 36px.
- 시트 하단 "N편 보기" 확인 버튼(풀폭, accent) + "초기화" 텍스트 버튼. `pb-[env(safe-area-inset-bottom)]`.

### StatBar
- 행: 레이블(13px) ··· 수치(13px mono) 위, 아래 6px 트랙(`zinc-100 dark:bg-zinc-800`, radius full) + 채움 바(티어/액센트 색, `transition-[width] duration-300`).

### StatTile
- 카드 표면에 레이블(11px zinc-500) + 큰 숫자(28px/700) + 보조(11px, 예: `/137`).

### ProgressBar (세션 헤더용)
- 3px 트랙, 채움은 `accent`. 세션 방문 완료 시 `tier-core` 색으로 전환.

### EmptyState
- 중앙 정렬: 아이콘(zinc-300, 40px) + 문구 1줄(zinc-500) + (선택) 액션 버튼. 과장 금지.

## 5. 로고 사용

- **AppHeader**: `icml-navbar-logo.svg`(정사각) 24px — 단, 이 SVG는 코알라가 #F9F9F9라 라이트 모드에서 안 보인다. **라이트 모드에서는 CSS filter 대신 로고를 감싸는 `bg-zinc-900` 라운드(6px) 28px 타일 위에 얹는다** (다크·라이트 공통, 일관성). 옆에 "ICML 2026" 15px/700 + "Poster Guide" 15px/400 zinc-500.
- **SchedulePage 요약 카드**: `icml-logo.svg`(풀 워드마크)를 라이트 모드에서만 그대로, 다크 모드에서는 `invert` 필터 없이 → 흰 라운드 타일(패딩 12px) 위에 얹는다 (워드마크가 #100F0D라 다크 배경에서 안 보임).
- 로고 SVG 파일 수정 금지 (원본 유지).

## 6. 모션

- 전 컴포넌트 150–200ms `ease-out` 하나로 통일. 페이지 전환 애니메이션 없음.
- `animate-pulse`는 NowBanner 라이브 도트 한 곳만.
- iOS 탭 하이라이트 제거: `-webkit-tap-highlight-color: transparent` (index.css).

## 7. 다크모드

- `darkMode: 'class'`. `useTheme`: `'system'`(기본)이면 `matchMedia` 리스너로 추적, 수동 선택 시 `icml26.theme` 저장.
- index.html 인라인 스크립트(docs/02 §8)가 첫 페인트 전에 `.dark`를 박아 플래시 방지.
- `theme-color` 메타 2개(라이트/다크)로 iOS 상태바 색 일치.
