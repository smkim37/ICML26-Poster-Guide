# 02 — 아키텍처 & 기술 규칙 (Architecture)

구현 담당 모델을 위한 기술 결정 전문. **여기 적힌 verbatim 블록은 그대로 사용한다. 재설계·개선 금지.**

## 1. 스택 (버전 고정)

Vite 5 + React 18 + TypeScript + Tailwind CSS **3.4** + react-router-dom **6** + vite-plugin-pwa 0.20.

`package.json` 의존성 (이 버전 그대로):

```json
"dependencies": {
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.26.0"
},
"devDependencies": {
  "typescript": "^5.5.0",
  "vite": "^5.4.0",
  "@vitejs/plugin-react": "^4.3.0",
  "tailwindcss": "^3.4.10",
  "postcss": "^8.4.0",
  "autoprefixer": "^10.4.0",
  "vite-plugin-pwa": "^0.20.0"
}
```

### 금지 목록 (절대 규칙)

| 금지 | 이유 / 판별법 |
|---|---|
| Tailwind **v4** 문법 | `@import "tailwindcss"` 를 쓰고 있다면 v4다 — 잘못. v3는 `@tailwind base; @tailwind components; @tailwind utilities;` |
| react-router **v7** | `react-router` 패키지에서 import하면 v7이다 — 잘못. v6는 `react-router-dom`에서 import |
| 상태 라이브러리 (Zustand/Redux/Jotai) | 137레코드에는 hooks + context 1개면 충분 |
| UI 킷 (shadcn/MUI/Chakra), 아이콘 라이브러리 | 손수 Tailwind. 아이콘은 인라인 SVG path ~10개 |
| 차트 라이브러리 | CSS 가로 바(StatBar)로 충분 (docs/01 §7) |
| 웹폰트 다운로드/CDN | 시스템 폰트 스택 (오프라인 필수 요건) |
| `fetch()`로 posters.json 로드 | 정적 `import`만 허용 (base-path/오프라인/race 원천 차단) |
| 수작업 Service Worker (`sw.js`) | vite-plugin-pwa generateSW만 사용 (§6) |
| `localStorage` 직접 접근 | `src/lib/storage.ts` 외의 파일에서 `localStorage` 문자열이 나오면 잘못 (§5) |
| `new Date('2026-07-07 10:30')` 류 문자열 파싱 | Safari에서 Invalid Date. 시간 로직은 `lib/time.ts`만 (§7) |
| `h-screen`/`100vh` | iOS Safari 점프 버그. `min-h-dvh` 사용 |
| 코드에 `/`로 시작하는 절대 URL | base path 깨짐. public/ 자산은 `import.meta.env.BASE_URL + '...'` |

## 2. 폴더 구조

```
├── index.html                     # §8 head 블록
├── vite.config.ts                 # §3 + §6
├── tailwind.config.js             # darkMode:'class', docs/03 토큰
├── .github/workflows/deploy.yml   # docs/06
├── data/ICML2026 Poster Guide.xlsx  # 원본 (커밋됨)
├── scripts/
│   ├── excel_to_json.py           # xlsx → posters.json (이미 작성돼 있음, 수정 금지)
│   └── make_icons.py              # Phase 6에서 작성 (Pillow, 아이콘 4종 생성)
├── public/
│   ├── icml-logo.svg              # 풀 워드마크 (라이트 배경용)
│   ├── icml-navbar-logo.svg       # 정사각 아이콘 (다크 배경용 — 코알라가 #F9F9F9)
│   └── icons/                     # Phase 6: icon-192/512/512-maskable/apple-touch-icon.png
└── src/
    ├── main.tsx                   # createRoot + HashRouter + UserDataProvider
    ├── App.tsx                    # Routes + AppHeader + TabBar 셸
    ├── index.css                  # @tailwind 지시문 + 소량의 전역 CSS
    ├── types.ts                   # docs/04 §1 verbatim
    ├── data/
    │   ├── posters.json           # 생성 산출물 — 손으로 수정 금지
    │   ├── posters.ts             # import + Paper[] 캐스팅 + byId Map export
    │   ├── sessions.ts            # docs/04 §2 verbatim
    │   └── overview.ts            # docs/04 §3
    ├── lib/
    │   ├── time.ts                # §7
    │   ├── filter.ts              # 순수 함수 (papers, query, filters) → papers
    │   ├── labels.ts              # enum → 한국어 표기 + 티어 색 클래스
    │   └── storage.ts             # §5
    ├── hooks/
    │   ├── useUserData.ts         # context + {data, toggleVisited, toggleStarred, setMemo, importData, resetAll}
    │   ├── useNow.ts              # 30초 간격 KST now, 필요한 곳에만 마운트
    │   └── useTheme.ts            # light/dark/system
    ├── components/                # docs/01 인벤토리: AppHeader, TabBar, NowBanner, DayTabs,
    │                              # SearchBar, FilterSheet, SessionGroup, PosterCard, TierBadge,
    │                              # TypeBadge, ProgressBar, StatTile, StatBar, MemoEditor, EmptyState
    └── pages/                     # ListPage, PaperPage, SchedulePage, StatsPage, SettingsPage
```

## 3. vite.config.ts (Phase 1 시점 — PWA 제외)

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/ICML26-Poster-Guide/',
  plugins: [react()],
})
```

Phase 6에서 `VitePWA(...)`(§6)를 plugins에 추가한다.

## 4. 라우팅

- `HashRouter` (react-router-dom v6). GitHub Pages는 미지의 경로에 404를 주므로 BrowserRouter+404 핵은 쓰지 않는다. 실제 URL은 `/ICML26-Poster-Guide/index.html` 하나 — PWA scope·오프라인 fallback이 전부 단순해진다.
- 일자 탭·스크롤 복원은 라우터가 아닌 `sessionStorage` (docs/01 §3).

## 5. 클라이언트 상태 / localStorage

**`src/lib/storage.ts`가 유일한 localStorage 게이트.** 키: `icml26.userdata.v1`

```ts
interface UserData {
  version: 1;
  updatedAt: string;                       // ISO
  papers: Record<string, PaperState>;      // key = Paper.id (OpenReview forum id), sparse
}
interface PaperState {
  visited?: boolean;
  starred?: boolean;
  memo?: string;
}
```

- `load()`: 키 없음 / JSON 파싱 실패 / `version !== 1` → 빈 구조 반환 (throw 금지).
- 모든 변이는 동기 write-through (`save(next)`), 137레코드라 디바운스 불필요.
- visited/starred/memo가 모두 빈 값이 된 항목은 map에서 삭제 (백업 파일 청결 유지).
- `useUserData`는 context로 1회 제공 — 카드와 상세가 같은 상태를 본다.
- 포스터별 개별 키(`icml26-<id>`) 절대 금지.
- 테마는 의도적으로 별도 키 `icml26.theme` (`'light'|'dark'|'system'`) — 기기 로컬 설정이라 백업에서 제외.
- 개인 모드 키 `icml26.personal.v1` = `{version:1, until:epoch_ms}` — storage.ts의 `loadPersonalUntil/savePersonalUntil/clearPersonal`로만 접근. 백업에서 제외 (docs/01 §10).
- 내보내기: UserData JSON 그대로 Blob → `URL.createObjectURL` 다운로드. 가져오기: 검증 → confirm → **전체 교체** (merge 구현 금지 — 버그 온상).

## 6. PWA (Phase 6 전용)

```ts
VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['icml-logo.svg', 'icml-navbar-logo.svg'],
  workbox: {
    globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
    navigateFallback: '/ICML26-Poster-Guide/index.html',
  },
  manifest: {
    name: 'ICML 2026 Poster Guide',
    short_name: 'ICML26',
    start_url: '/ICML26-Poster-Guide/',
    scope: '/ICML26-Poster-Guide/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#18181b',
    icons: [
      { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  }
})
```

- **precache-only**: 이 앱은 런타임 네트워크 의존이 0이다(데이터 번들, 시스템 폰트, 로컬 이미지). `runtimeCaching` 추가 금지.
- autoUpdate = skipWaiting+clientsClaim → 배포 후 다음 실행 시 자동 갱신. 업데이트 프롬프트 UI 만들지 않는다.
- dev 서버에선 SW 비활성이 정상. 테스트는 `npm run build && npm run preview`.
- **Escape hatch**: 오프라인 검증이 2회 시도에도 실패하면 `VitePWA()`를 제거하고 배포한다.

## 7. 시간 처리 — `src/lib/time.ts` 스펙

Date 객체로 세션 시각을 만들지 않는다. **(dateStr, minutesSinceMidnight) 튜플 비교**만 사용:

```ts
// 현재 KST를 {date: 'YYYY-MM-DD', minutes: number}로 반환
export function nowKST(now?: Date): { date: string; minutes: number } {
  const d = now ?? new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find(p => p.type === t)!.value;
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: (parseInt(get('hour')) % 24) * 60 + parseInt(get('minute')),
  };
}
```

- 세션 상태 판정: SESSIONS의 `date`/`start`/`end`("HH:MM" → 분 변환)와 위 튜플을 비교. `getSessionStatus(nowTuple)` → `{ phase: 'before'|'during'|'between'|'after', current?, next?, minutesLeft? }`.
- **`?now=` 오버라이드**: `location.search`(hash 앞부분)에서 `now` 파라미터를 읽어 `new Date(value)`로 대체 (`?now=2026-07-08T15:00`은 로컬 파싱이라 개발 시 KST 머신 기준 — 테스트 값은 ISO에 `+09:00`을 붙여 `?now=2026-07-08T15:00:00%2B09:00`도 허용되게 `decodeURIComponent` 처리). Phase 4 acceptance는 이 오버라이드로 검증한다.
- D-day 계산: 날짜 문자열 비교로 충분 (`'2026-07-07'` 대비 일수 차 = Date.UTC(y,m,d) 차 / 86400000 — 날짜 부분만 사용하므로 타임존 안전).

## 8. index.html head 블록 (Phase 1부터)

```html
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="theme-color" content="#fafaf9" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#09090b" media="(prefers-color-scheme: dark)" />
<link rel="icon" type="image/svg+xml" href="/ICML26-Poster-Guide/icml-navbar-logo.svg" />
<link rel="apple-touch-icon" href="/ICML26-Poster-Guide/icons/apple-touch-icon.png" /><!-- Phase 6 -->
<title>ICML 2026 Poster Guide</title>
<script>
  // no-flash 다크모드: React 마운트 전에 클래스 적용
  (function () {
    try {
      var t = localStorage.getItem('icml26.theme');
      var dark = t === '"dark"' || t === 'dark' ||
        ((!t || t.includes('system')) && matchMedia('(prefers-color-scheme: dark)').matches);
      if (dark) document.documentElement.classList.add('dark');
    } catch (e) {}
  })();
</script>
```

(참고: `index.html` 안의 절대 경로는 Vite가 base로 재작성하지 않으므로 위처럼 base를 포함해 직접 쓴다. src 코드 안에서는 반대로 `/`로 시작하는 경로 금지 — `import.meta.env.BASE_URL` 사용.)

## 9. 리스크 규칙 R1–R5 (막히면 여기부터)

- **R1 · base path**: dev는 되는데 Pages에서 백지/404 → `base` 설정, 절대 URL, `import.meta.env.BASE_URL` 누락 순으로 확인. Phase 1 acceptance가 라이브 URL인 이유다.
- **R2 · 타임존**: now/next가 이상하면 무조건 `lib/time.ts` 밖에서 Date를 만들었는지부터 의심. 세션 시각 문자열 파싱 금지, KST 머신이 아닌 환경에서도 `?now=`로 3개 시점(진행중/사이/사전) 테스트.
- **R3 · SW 스테일**: "배포했는데 안 바뀜" → runtimeCaching을 추가했거나 sw를 손으로 만졌는지 확인. §6 설정 외 금지. dev에서 SW 없는 게 정상.
- **R4 · localStorage 드리프트**: `grep -r localStorage src/` 결과가 `lib/storage.ts`(와 index.html 인라인 스크립트, useTheme) 외에 나오면 리팩토링. 가져오기는 교체+confirm, merge 금지.
- **R5 · safe-area**: 헤더가 Dynamic Island에 겹치거나 TabBar가 홈 인디케이터에 깔림 → `viewport-fit=cover` 메타 + `env(safe-area-inset-*)` 패딩 확인. `min-h-dvh`만 사용.

### 소소한 함정
- 포스터 번호는 **숫자 정렬** (`posterNum: number` — `"#1006" < "#202"` 문자열 정렬 버그 차단이 스키마에 이미 반영됨).
- `excel_to_json.py` 재실행 시 `일정 미정` 시트만 헤더가 2행째임 — 스크립트가 이미 처리하므로 스크립트를 수정하지 말 것.
- JSON은 `ensure_ascii=False`로 생성됨 — 한글이 이스케이프 없이 보이는 게 정상.
