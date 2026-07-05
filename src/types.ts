export type Tier = 'core' | 'related' | 'reference'; // 핵심 | 관련 | 참고
export type PresType = 'poster' | 'spotlight' | 'oral';
export type DayId = 'tue' | 'wed' | 'thu';
export type SessionId =
  | 'PS1' | 'PS2' | 'PS3' | 'PS4' | 'PS5' | 'PS6' | 'PS7' | 'PS8'
  | 'ORAL1';

export interface Paper {
  id: string;                 // OpenReview forum id — 불변 PK (localStorage 키)
  tier: Tier;
  day: DayId | null;          // null = 일정 미정
  session: SessionId | null;
  posterNum: number | null;   // null: 미정 15편 + Oral 1편
  type: PresType;
  title: string;              // 영문
  intro: string;              // 한 줄 소개 (한국어)
  authors: string;
  affiliations: string[];
  instType: '학교' | '학교+기업';
  subcategory: string | null; // 참고 티어만
  openreview: string;
  icmlUrl: string;
}

export interface PaperState {
  visited?: boolean;
  starred?: boolean;
  memo?: string;
}

export interface UserData {
  version: 1;
  updatedAt: string; // ISO
  papers: Record<string, PaperState>; // key = Paper.id, sparse
}
