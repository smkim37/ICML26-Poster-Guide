import { useEffect, useRef, useState } from 'react';
import { FilterIcon, SearchIcon, XIcon } from './icons';

export default function SearchBar({
  onQuery,
  activeFilterCount,
  onOpenFilter,
}: {
  onQuery: (q: string) => void;
  activeFilterCount: number;
  onOpenFilter: () => void;
}) {
  const [value, setValue] = useState('');
  const timer = useRef<number>();

  // 150ms 디바운스 (docs/01 §3)
  useEffect(() => {
    timer.current = window.setTimeout(() => onQuery(value), 150);
    return () => window.clearTimeout(timer.current);
  }, [value, onQuery]);

  return (
    <div className="flex items-center gap-2 px-4 pb-2">
      <div className="relative flex-1">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="제목·저자·소속·소개 검색"
          className="h-10 w-full rounded-[10px] border border-zinc-200 bg-white pl-10 pr-9 text-[14px] outline-none placeholder:text-zinc-400 focus:border-accent dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-accent-dark [&::-webkit-search-cancel-button]:hidden"
        />
        {value && (
          <button
            onClick={() => setValue('')}
            aria-label="지우기"
            className="absolute right-0 top-0 flex h-10 w-9 items-center justify-center text-zinc-400"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
      </div>
      <button
        onClick={onOpenFilter}
        aria-label="필터"
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-zinc-200 bg-white text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
      >
        <FilterIcon className="h-5 w-5" />
        {activeFilterCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white dark:bg-accent-dark dark:text-zinc-900">
            {activeFilterCount}
          </span>
        )}
      </button>
    </div>
  );
}
