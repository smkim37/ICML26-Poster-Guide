import { useLocation, useNavigate } from 'react-router-dom';
import { BackIcon } from './icons';

export default function AppHeader() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isDetail = pathname.startsWith('/paper/');

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 pt-[env(safe-area-inset-top)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-12 w-full max-w-[640px] items-center gap-2.5 px-4">
        {isDetail ? (
          <button
            onClick={() => navigate(-1)}
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
      </div>
    </header>
  );
}
