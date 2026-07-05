# 04 — 데이터 (Data)

## 1. Paper 스키마 — `src/types.ts` (verbatim)

```ts
export type Tier = 'core' | 'related' | 'reference';        // 핵심 | 관련 | 참고
export type PresType = 'poster' | 'spotlight' | 'oral';
export type DayId = 'tue' | 'wed' | 'thu';
export type SessionId = 'PS1'|'PS2'|'PS3'|'PS4'|'PS5'|'PS6'|'PS7'|'PS8'|'ORAL1';

export interface Paper {
  id: string;                 // OpenReview forum id — 불변 PK (localStorage 키)
  tier: Tier;
  day: DayId | null;          // null = 일정 미정
  session: SessionId | null;
  posterNum: number | null;   // null: 미정 15편 + Oral 1편
  type: PresType;
  title: string;              // 영문
  intro: string;              // 한 줄 소개 (한국어, 163–302자)
  authors: string;
  affiliations: string[];
  instType: '학교' | '학교+기업';
  subcategory: string | null; // 참고 티어만: 비디오-언어 | 멀티모달 융합 | 비디오 생성/편집 | 생성모델 방법론
  openreview: string;
  icmlUrl: string;
}
```

`src/data/posters.ts`:

```ts
import postersJson from './posters.json';
import type { Paper } from '../types';

export const PAPERS = postersJson as Paper[];
export const PAPER_BY_ID = new Map(PAPERS.map(p => [p.id, p]));
```

## 2. 세션 상수 — `src/data/sessions.ts` (verbatim, 공식 검증 완료)

엑셀 시간 문자열(en-dash)을 파싱하지 않고 여기 하드코딩한다. 2026-07-05 icml.cc에서 검증된 값.

```ts
import type { DayId, SessionId } from '../types';

export interface Session {
  id: SessionId; day: DayId; date: string;   // 'YYYY-MM-DD' (KST)
  start: string; end: string;                // 'HH:MM' (KST)
  label: string; place: string;
}

export const SESSIONS: Session[] = [
  { id: 'ORAL1', day: 'tue', date: '2026-07-07', start: '10:30', end: '10:45', label: 'Oral 1F Vision-Language Models & Video', place: 'AUDITORIUM' },
  { id: 'PS1',   day: 'tue', date: '2026-07-07', start: '10:30', end: '12:15', label: 'Poster Session 1', place: 'Hall A' },
  { id: 'PS2',   day: 'tue', date: '2026-07-07', start: '14:00', end: '15:45', label: 'Poster Session 2', place: 'Hall A' },
  { id: 'PS3',   day: 'wed', date: '2026-07-08', start: '10:30', end: '12:15', label: 'Poster Session 3', place: 'Hall A' },
  { id: 'PS4',   day: 'wed', date: '2026-07-08', start: '14:30', end: '16:15', label: 'Poster Session 4', place: 'Hall A' },
  { id: 'PS5',   day: 'wed', date: '2026-07-08', start: '17:00', end: '18:45', label: 'Poster Session 5', place: 'Hall A' },
  { id: 'PS6',   day: 'thu', date: '2026-07-09', start: '10:30', end: '12:15', label: 'Poster Session 6', place: 'Hall A' },
  { id: 'PS7',   day: 'thu', date: '2026-07-09', start: '14:30', end: '16:15', label: 'Poster Session 7', place: 'Hall A' },
  { id: 'PS8',   day: 'thu', date: '2026-07-09', start: '17:00', end: '18:45', label: 'Poster Session 8', place: 'Hall A' },
];

export const DAYS: { id: DayId | 'tbd'; label: string; date?: string }[] = [
  { id: 'tue', label: '화 7/7', date: '2026-07-07' },
  { id: 'wed', label: '수 7/8', date: '2026-07-08' },
  { id: 'thu', label: '목 7/9', date: '2026-07-09' },
  { id: 'tbd', label: '미정' },
];
```

주의: ListPage 세션 그룹 표시 순서는 위 배열 순서 그대로 (ORAL1이 PS1보다 먼저 — 시작이 같고 먼저 끝나므로). NowBanner에서 겹칠 땐 포스터 세션 우선 (docs/01 §4).

## 3. 전체 통계 상수 — `src/data/overview.ts`

```ts
export const OVERVIEW = {
  surveyDate: '2026-07-05',        // 조사 기준일
  icmlAccepted: 6341,              // 메인트랙 accepted (엑셀 조사 기준; 공개 집계는 ~6,352)
  icmlSubmissions: 23918,          // 역대 최다
  icmlOrals: 168,
  icmlSpotlights: 536,
  myTotal: 137,
} as const;
```

내 리스트 분포(티어/요일/세션/유형/기관/참고분류)는 상수로 두지 말고 **PAPERS에서 계산**한다 — 엑셀 재수출 시 자동 갱신되고, 계산값과 137 합계가 어긋나면 데이터 문제를 즉시 발견한다.

## 4. 표기 매핑 — `src/lib/labels.ts`

```ts
export const TIER_LABEL   = { core: '핵심', related: '관련', reference: '참고' } as const;
export const TYPE_LABEL   = { poster: 'Poster', spotlight: 'Spotlight', oral: 'Oral' } as const;
export const DAY_LABEL    = { tue: '화 7/7', wed: '수 7/8', thu: '목 7/9' } as const;
// 티어별 Tailwind 클래스 묶음(보더/배지/바)도 여기 모은다 — 색 클래스 산재 금지
```

## 5. 변환 파이프라인

- 원본: `data/ICML2026 Poster Guide.xlsx` (시트: `개요`, `7.7 (화)`, `7.8 (수)`, `7.9 (목)`, `일정 미정`)
- 실행: `python3 scripts/excel_to_json.py` (openpyxl 필요) → `src/data/posters.json` 덮어씀
- 스크립트가 하는 일: 헤더 행 자동 탐색(첫 셀 `구분`), 한국어→enum 매핑, `#1006`→1006 int, OpenReview URL에서 id 추출, affiliations `;` 분리, `(day, session, posterNum)` 정렬, 검증 assertion, 기존 JSON 대비 **세션 변경 diff 출력**.
- **`posters.json`을 손으로 수정 금지. `excel_to_json.py`도 수정 금지** (파서에 시트 구조 특례가 반영돼 있음).

### 검증된 데이터 불변식 (2026-07-05 기준)

- 총 137편 = 핵심 30 + 관련 52 + 참고 55 / 화 41 + 수 35 + 목 46 + 미정 15
- 세션별: PS1 17, PS2 23, PS3 13, PS4 17, PS5 5, PS6 16, PS7 12, PS8 18, ORAL1 1, 미정 15
- 유형: poster 126, spotlight 10, oral 1 / 기관: 학교 79, 학교+기업 58
- `posterNum === null`은 정확히 16편 (미정 15 + Oral 1)
- 참고분류는 reference 티어에서만 등장 (없음 2편 포함)

## 6. 엑셀 재수출 갱신 플로우 (미정 15편이 배정되면)

1. 새 엑셀로 `data/ICML2026 Poster Guide.xlsx` 덮어쓰기 (파일명 유지)
2. `python3 scripts/excel_to_json.py` — 출력에서 **세션 변경 diff와 총계** 확인
3. xlsx + posters.json 함께 커밋 → push → Actions가 자동 재배포
4. 사용자 방문/별표/메모는 OpenReview id 키라 **그대로 유지됨**
