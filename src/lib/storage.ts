// localStorage 유일 게이트 (docs/02 §5) — 이 파일 밖에서 localStorage 접근 금지
// (예외: index.html no-flash 인라인 스크립트, useTheme의 icml26.theme 키)
import type { UserData } from '../types';

const KEY = 'icml26.userdata.v1';

export function emptyUserData(): UserData {
  return { version: 1, updatedAt: new Date().toISOString(), papers: {} };
}

function isValid(d: unknown): d is UserData {
  return (
    typeof d === 'object' && d !== null &&
    (d as UserData).version === 1 &&
    typeof (d as UserData).papers === 'object' && (d as UserData).papers !== null
  );
}

export function loadUserData(): UserData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyUserData();
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : emptyUserData();
  } catch {
    return emptyUserData();
  }
}

export function saveUserData(d: UserData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {
    // 저장 실패(용량 등)는 조용히 무시 — 메모리 상태는 유지됨
  }
}

export function parseBackup(text: string): UserData | null {
  try {
    const parsed: unknown = JSON.parse(text);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function downloadBackup(d: UserData): void {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const name = `icml26-backup-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}.json`;
  const blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
