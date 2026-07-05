import { useLocation, useNavigate } from 'react-router-dom';
import { usePersonalMode } from '../hooks/usePersonalMode';
import { BackIcon } from './icons';

export default function AppHeader() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { personal } = usePersonalMode();
  const isDetail = pathname.startsWith('/paper/');

  // 딥링크로 상세에 직접 진입하면 히스토리가 없어 navigate(-1)이 무동작 → 홈으로 폴백
  const goBack = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate('/', { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 pt-[env(safe-area-inset-top)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-12 w-full max-w-[640px] items-center gap-2.5 px-4">
        {isDetail ? (
          <button
            onClick={goBack}
            aria-label="뒤로"
            className="-ml-3 flex h-11 w-11 items-center justify-center text-zinc-600 dark:text-zinc-300"
          >
            <BackIcon className="h-6 w-6" />
          </button>
        ) : (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-900">
            <img
              src={import.meta.env.BASE_URL + 'icml-navbar-logo.svg'}
              alt=""
              className="h-5 w-5"
            />
          </span>
        )}
        <h1 className="truncate text-[15px] font-bold">
          ICML 2026 <span className="font-normal text-zinc-500">Poster Guide</span>
        </h1>
        {personal && (
          <span
            className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-accent dark:bg-accent-dark"
            aria-label="개인 모드 활성"
          />
        )}
      </div>
    </header>
  );
}
