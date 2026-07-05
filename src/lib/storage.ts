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

// ---- 개인 모드 (docs/01 §10) ----
const PERSONAL_KEY = 'icml26.personal.v1';

export function loadPersonalUntil(): number | null {
  try {
    const raw = localStorage.getItem(PERSONAL_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' && parsed !== null &&
      (parsed as { version?: number }).version === 1 &&
      typeof (parsed as { until?: number }).until === 'number'
    ) {
      return (parsed as { until: number }).until;
    }
    return null;
  } catch {
    return null;
  }
}

export function savePersonalUntil(until: number): void {
  try {
    localStorage.setItem(PERSONAL_KEY, JSON.stringify({ version: 1, until }));
  } catch {
    // 무시
  }
}

export function clearPersonal(): void {
  try {
    localStorage.removeItem(PERSONAL_KEY);
  } catch {
    // 무시
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
  const json = JSON.stringify(d, null, 2);

  // iOS 홈스크린(standalone)에서는 앵커 다운로드가 동작하지 않으므로 공유 시트 우선
  // (사용자 제스처 컨텍스트 안에서 호출됨 — SettingsPage 버튼 onClick)
  const file = new File([json], name, { type: 'application/json' });
  if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
    navigator.share({ files: [file], title: name }).catch(() => {
      // 사용자가 시트를 닫은 경우 등 — 무시
    });
    return;
  }

  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // 즉시 revoke하면 WebKit에서 다운로드가 취소될 수 있음 — 지연 해제
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
