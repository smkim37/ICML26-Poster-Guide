// 시간 로직 유일 파일 (docs/02 §7) — 세션 시각 문자열로 Date를 만들지 않는다.
// 비교는 (dateStr, minutesSinceMidnight) 튜플로만 한다.
import { SESSIONS, type Session } from '../data/sessions';

export interface KstNow {
  date: string;    // 'YYYY-MM-DD' (KST)
  minutes: number; // 자정 이후 분 (KST)
}

export function toMinutes(hm: string): number {
  const [h, m] = hm.split(':').map(Number);
  return h * 60 + m;
}

export function nowKST(now?: Date): KstNow {
  const d = now ?? new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00';
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: (parseInt(get('hour'), 10) % 24) * 60 + parseInt(get('minute'), 10),
  };
}

// ?now=2026-07-08T15:00 오버라이드 — pre-hash(search)와 hash 내부 ?를 모두 지원
// (URLSearchParams가 이미 디코드하므로 decodeURIComponent를 다시 걸지 않는다 — 이중 디코드는 URIError)
export function getNowOverride(): Date | undefined {
  const pick = (qs: string) => new URLSearchParams(qs).get('now');
  const raw =
    pick(window.location.search) ??
    (window.location.hash.includes('?') ? pick(window.location.hash.slice(window.location.hash.indexOf('?'))) : null);
  if (!raw) return undefined;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? undefined : d;
}

const FIRST_DATE = '2026-07-07';
const LAST = SESSIONS[SESSIONS.length - 1]; // PS8

export type SessionPhase =
  | { phase: 'before'; dDays: number }
  | { phase: 'during'; current: Session; minutesLeft: number }
  | { phase: 'between'; next: Session; sameDay: boolean; minutesUntil: number }
  | { phase: 'after' };

// 날짜 문자열만 사용 — 타임존 안전 (docs/02 §7)
export function diffDays(from: string, to: string): number {
  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000);
}

export function getSessionStatus(t: KstNow): SessionPhase {
  if (t.date < FIRST_DATE) return { phase: 'before', dDays: diffDays(t.date, FIRST_DATE) };
  if (t.date > LAST.date || (t.date === LAST.date && t.minutes >= toMinutes(LAST.end)))
    return { phase: 'after' };

  const active = SESSIONS.filter(
    (s) => s.date === t.date && toMinutes(s.start) <= t.minutes && t.minutes < toMinutes(s.end),
  );
  if (active.length > 0) {
    // ORAL1과 PS1이 겹치면 포스터 세션 우선 (docs/01 §4)
    const current = active.find((s) => s.id !== 'ORAL1') ?? active[0];
    return { phase: 'during', current, minutesLeft: toMinutes(current.end) - t.minutes };
  }

  const upcoming = SESSIONS.filter(
    (s) => s.date > t.date || (s.date === t.date && toMinutes(s.start) > t.minutes),
  );
  if (upcoming.length === 0) return { phase: 'after' };
  // 동시 시작(ORAL1·PS1)이면 포스터 세션을 '다음'으로 안내 (docs/01 §4와 일관)
  const first = upcoming[0];
  const sameSlot = upcoming.filter(
    (s) => s.date === first.date && s.start === first.start,
  );
  const next = sameSlot.find((s) => s.id !== 'ORAL1') ?? first;
  const sameDay = next.date === t.date;
  return {
    phase: 'between',
    next,
    sameDay,
    minutesUntil: sameDay ? toMinutes(next.start) - t.minutes : 0,
  };
}
