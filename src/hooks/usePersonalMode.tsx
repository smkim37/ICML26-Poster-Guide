import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { clearPersonal, loadPersonalUntil, savePersonalUntil } from '../lib/storage';

// 개인 모드: 방문 체크·별표·메모·백업 UI를 소유자에게만 노출하는 간단 게이트 (docs/01 §10).
// 강력한 보안 아님 — 코드에는 비밀번호의 SHA-256 hex만 둔다. 비밀번호 변경 시 이 상수 교체:
//   node -e "crypto.subtle.digest('SHA-256', new TextEncoder().encode('새비번')).then(b=>console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))"
const PW_HASH = '318aee3fed8c9d040d35a7fc1fa776fb31303833aa2de885354ddf3d44d8fb69';
export const PERSONAL_TTL_MS = 5 * 60 * 1000; // 해제 유지 5분 (사용자 확정)

interface PersonalModeCtx {
  personal: boolean;
  until: number | null;
  unlock: (pw: string) => Promise<boolean>;
  lock: () => void;
}

const Ctx = createContext<PersonalModeCtx | null>(null);

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function validUntil(): number | null {
  const until = loadPersonalUntil();
  return until !== null && until > Date.now() ? until : null;
}

export function PersonalModeProvider({ children }: { children: ReactNode }) {
  const [until, setUntil] = useState<number | null>(validUntil);

  // 만료 자동 잠금 + iOS 홈스크린 재개(visibilitychange) 시 재검사
  useEffect(() => {
    if (until === null) return;
    const timer = window.setTimeout(() => setUntil(validUntil()), until - Date.now() + 250);
    const onVisible = () => {
      if (document.visibilityState === 'visible') setUntil(validUntil());
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [until]);

  const unlock = useCallback(async (pw: string) => {
    if ((await sha256Hex(pw.trim())) !== PW_HASH) return false;
    const next = Date.now() + PERSONAL_TTL_MS;
    savePersonalUntil(next);
    setUntil(next);
    return true;
  }, []);

  const lock = useCallback(() => {
    clearPersonal(); // userdata는 건드리지 않는다 — 숨김일 뿐
    setUntil(null);
  }, []);

  return (
    <Ctx.Provider value={{ personal: until !== null, until, unlock, lock }}>
      {children}
    </Ctx.Provider>
  );
}

export function usePersonalMode(): PersonalModeCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePersonalMode must be used within PersonalModeProvider');
  return ctx;
}
