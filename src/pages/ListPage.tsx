import { useCallback, useEffect, useMemo, useState } from 'react';
import DayTabs from '../components/DayTabs';
import EmptyState from '../components/EmptyState';
import FilterSheet from '../components/FilterSheet';
import PosterCard from '../components/PosterCard';
import SearchBar from '../components/SearchBar';
import SessionGroup from '../components/SessionGroup';
import { PAPERS } from '../data/posters';
import { DAYS, SESSIONS, type DayTabId } from '../data/sessions';
import { useUserData } from '../hooks/useUserData';
import { countActiveFilters, EMPTY_FILTERS, filterPapers, type Filters } from '../lib/filter';
import type { Paper, Tier } from '../types';

const DAY_KEY = 'icml26.day';
const SCROLL_KEY = 'icml26.scrollY';
const TIER_ORDER: Record<Tier, number> = { core: 0, related: 1, reference: 2 };

function defaultDay(): DayTabId {
  const saved = sessionStorage.getItem(DAY_KEY);
  if (saved && DAYS.some((d) => d.id === saved)) return saved as DayTabId;
  // 컨퍼런스 기간(KST 기준 오늘이 7/7–7/9)이면 해당 요일 탭
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
  return (DAYS.find((d) => d.date === today)?.id ?? 'tue') as DayTabId;
}

const SESSION_SHORT: Record<string, string> = {
  PS1: 'PS1', PS2: 'PS2', PS3: 'PS3', PS4: 'PS4', PS5: 'PS5',
  PS6: 'PS6', PS7: 'PS7', PS8: 'PS8', ORAL1: 'Oral',
};

export default function ListPage() {
  const [day, setDay] = useState<DayTabId>(defaultDay);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchAllDays, setSearchAllDays] = useState(false);
  const { get } = useUserData();

  // 상세에서 뒤로 왔을 때 스크롤 복원 (unmount 시 저장)
  useEffect(() => {
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved) requestAnimationFrame(() => window.scrollTo(0, Number(saved)));
    return () => sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
  }, []);

  const selectDay = (d: DayTabId) => {
    setDay(d);
    sessionStorage.setItem(DAY_KEY, d);
    sessionStorage.removeItem(SCROLL_KEY);
    window.scrollTo(0, 0);
  };

  const applyFilters = useCallback(
    (papers: Paper[]) => filterPapers(papers, query, filters, get),
    [query, filters, get],
  );

  // 탭 카운트는 필터/검색 적용 후 (docs/01 §3)
  const counts = useMemo(() => {
    const c = { tue: 0, wed: 0, thu: 0, tbd: 0 } as Record<DayTabId, number>;
    for (const p of applyFilters(PAPERS)) c[(p.day ?? 'tbd') as DayTabId]++;
    return c;
  }, [applyFilters]);

  const dayPapers = useMemo(
    () => applyFilters(PAPERS.filter((p) => (day === 'tbd' ? p.day === null : p.day === day))),
    [applyFilters, day],
  );

  const globalResults = useMemo(
    () =>
      query.trim() && searchAllDays
        ? applyFilters(PAPERS)
        : null,
    [applyFilters, query, searchAllDays],
  );

  const tbdSorted = useMemo(
    () => [...dayPapers].sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier]),
    [dayPapers],
  );

  const papersFor = (sessionId: string): Paper[] =>
    dayPapers
      .filter((p) => p.session === sessionId)
      .sort((a, b) => (a.posterNum ?? Infinity) - (b.posterNum ?? Infinity));

  const contextOf = (p: Paper) =>
    p.day
      ? `${DAYS.find((d) => d.id === p.day)?.label} · ${SESSION_SHORT[p.session ?? ''] ?? ''}`
      : '일정 미정';

  return (
    <div>
      <DayTabs value={day} counts={counts} onChange={selectDay} />
      <SearchBar
        onQuery={setQuery}
        activeFilterCount={countActiveFilters(filters)}
        onOpenFilter={() => setSheetOpen(true)}
      />
      {query.trim() && (
        <div className="flex items-center justify-end px-5 pb-1">
          <label className="flex items-center gap-1.5 text-[12px] text-zinc-500">
            <input
              type="checkbox"
              checked={searchAllDays}
              onChange={(e) => setSearchAllDays(e.target.checked)}
              className="h-3.5 w-3.5 accent-[#2A419E]"
            />
            전체 일자에서 검색
          </label>
        </div>
      )}
      <div className="px-4 pt-1">
        {globalResults ? (
          globalResults.length === 0 ? (
            <EmptyState message="검색 결과가 없습니다" />
          ) : (
            <div className="flex flex-col gap-2 pb-4">
              {globalResults.map((p) => (
                <PosterCard key={p.id} paper={p} context={contextOf(p)} />
              ))}
            </div>
          )
        ) : day === 'tbd' ? (
          tbdSorted.length === 0 ? (
            <EmptyState message="조건에 맞는 포스터가 없습니다" />
          ) : (
            <>
              <p className="mb-3 px-1 text-[12px] leading-relaxed text-zinc-400">
                조사 시점(7/5) 세션 미배정 — 현장에서 ICML 앱으로 일정을 확인하세요.
              </p>
              <div className="flex flex-col gap-2 pb-4">
                {tbdSorted.map((p) => (
                  <PosterCard key={p.id} paper={p} />
                ))}
              </div>
            </>
          )
        ) : dayPapers.length === 0 ? (
          <EmptyState message="조건에 맞는 포스터가 없습니다" />
        ) : (
          SESSIONS.filter((s) => s.day === day).map((s) => (
            <SessionGroup key={s.id} session={s} papers={papersFor(s.id)} />
          ))
        )}
      </div>
      <FilterSheet
        open={sheetOpen}
        filters={filters}
        resultCount={dayPapers.length}
        onChange={setFilters}
        onClose={() => setSheetOpen(false)}
      />
    </div>
  );
}
