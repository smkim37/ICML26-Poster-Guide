import type { DayId, SessionId } from '../types';

export interface Session {
  id: SessionId;
  day: DayId;
  date: string;  // 'YYYY-MM-DD' (KST)
  start: string; // 'HH:MM' (KST)
  end: string;   // 'HH:MM' (KST)
  label: string;
  place: string;
}

// 2026-07-05 icml.cc 검증값 — 엑셀 문자열을 파싱하지 않는다 (docs/04 §2)
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

export type DayTabId = DayId | 'tbd';

export const DAYS: { id: DayTabId; label: string; date?: string }[] = [
  { id: 'tue', label: '화 7/7', date: '2026-07-07' },
  { id: 'wed', label: '수 7/8', date: '2026-07-08' },
  { id: 'thu', label: '목 7/9', date: '2026-07-09' },
  { id: 'tbd', label: '미정' },
];
