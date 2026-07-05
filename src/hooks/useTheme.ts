import { useCallback, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';
const KEY = 'icml26.theme'; // 의도적으로 userdata와 분리 — 기기 로컬, 백업 제외 (docs/02 §5)

function readTheme(): Theme {
  try {
    const t = localStorage.getItem(KEY);
    return t === 'light' || t === 'dark' ? t : 'system';
  } catch {
    return 'system';
  }
}

function apply(theme: Theme) {
  const dark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
}

// 모듈 레벨 단일 소스 — 훅이 어느 탭에 마운트돼 있든(혹은 아무 데도 없든)
// 시스템 외관 변경을 추적한다 (리뷰 확정 이슈: 훅 내부 리스너는 설정 탭에서만 살아있었음)
let current: Theme = readTheme();
window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', () => {
    if (current === 'system') apply('system');
  });

export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>(current);

  const setTheme = useCallback((t: Theme) => {
    try {
      if (t === 'system') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, t);
    } catch {
      // 무시
    }
    current = t;
    apply(t);
    setThemeState(t);
  }, []);

  return [theme, setTheme];
}
