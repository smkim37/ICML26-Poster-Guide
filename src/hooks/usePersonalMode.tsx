import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { clearPersonal, loadPersonalUntil, savePersonalUntil } from '../lib/storage';

// 개인 모드: 방문 체크·별표·메모·백업은 UI로는 모두에게 보이지만,
// 실제 사용은 소유자만 가능한 간단 게이트 (docs/01 §10). 잠금 상태에서
// 개인화 기능을 시도하면 안내 팝업("설정 → 개인 모드 활성화")을 띄운다.
// 강력한 보안 아님 — 코드에는 비밀번호의 SHA-256 hex만 둔다. 비밀번호 변경 시 이 상수 교체:
//   node -e "crypto.subtle.digest('SHA-256', new TextEncoder().encode('새비번')).then(b=>console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))"
const PW_HASH = '318aee3fed8c9d040d35a7fc1fa776fb31303833aa2de885354ddf3d44d8fb69';
export const PERSONAL_TTL_MS = 10 * 60 * 1000; // 해제 유지 10분

interface PersonalModeCtx {
  personal: boolean;
  until: number | null;
  unlock: (pw: string) => Promise<boolean>;
  lock: () => void;
  /** 개인 모드면 true. 아니면 안내 팝업을 띄우고 false — 개인화 액션 핸들러 첫 줄에서 호출 */
  requirePersonal: () => boolean;
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

function StepChip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md bg-zinc-100 px-2 py-1 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
      {children}
    </span>
  );
}

function GuideModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-6" role="dialog" aria-modal="true">
      <button aria-label="닫기" onClick={onClose} className="absolute inset-0 animate-fadein bg-black/40" />
      <div className="relative w-full max-w-xs animate-slideup rounded-2xl bg-white p-5 dark:bg-zinc-900">
        <h2 className="text-[15px] font-bold">개인 모드 전용 기능</h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">
          방문 체크·별표·메모는 소유자 전용입니다. 사용하려면:
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[12px]">
          <StepChip>설정</StepChip>
          <span className="text-zinc-400">→</span>
          <StepChip>개인 모드</StepChip>
          <span className="text-zinc-400">→</span>
          <StepChip>비밀번호 입력</StepChip>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={onClose}
            className="h-11 rounded-[10px] border border-zinc-200 bg-white text-[14px] font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
          >
            닫기
          </button>
          <button
            onClick={() => {
              onClose();
              navigate('/settings');
              // SPA 탭 전환은 스크롤을 유지하므로 개인 모드 섹션(최상단)으로 명시 이동
              requestAnimationFrame(() => window.scrollTo(0, 0));
            }}
            className="h-11 rounded-[10px] bg-accent text-[14px] font-semibold text-white dark:bg-accent-dark dark:text-zinc-900"
          >
            설정으로 이동
          </button>
        </div>
      </div>
    </div>
  );
}

export function PersonalModeProvider({ children }: { children: ReactNode }) {
  const [until, setUntil] = useState<number | null>(validUntil);
  const [guideOpen, setGuideOpen] = useState(false);
  const personal = until !== null;

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
    clearPersonal(); // userdata는 건드리지 않는다 — 잠금은 숨김일 뿐
    setUntil(null);
  }, []);

  const requirePersonal = useCallback(() => {
    if (personal) return true;
    setGuideOpen(true);
    return false;
  }, [personal]);

  return (
    <Ctx.Provider value={{ personal, until, unlock, lock, requirePersonal }}>
      {children}
      {guideOpen && <GuideModal onClose={() => setGuideOpen(false)} />}
    </Ctx.Provider>
  );
}

export function usePersonalMode(): PersonalModeCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePersonalMode must be used within PersonalModeProvider');
  return ctx;
}
