import { useEffect, useMemo, useState } from 'react';
import DayTabs from '../components/DayTabs';
import SessionGroup from '../components/SessionGroup';
import PosterCard from '../components/PosterCard';
import EmptyState from '../components/EmptyState';
import { PAPERS } from '../data/posters';
import { DAYS, SESSIONS, type DayTabId } from '../data/sessions';
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

export default function ListPage() {
  const [day, setDay] = useState<DayTabId>(defaultDay);

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

  const counts = useMemo(() => {
    const c = { tue: 0, wed: 0, thu: 0, tbd: 0 } as Record<DayTabId, number>;
    for (const p of PAPERS) c[(p.day ?? 'tbd') as DayTabId]++;
    return c;
  }, []);

  const tbdPapers = useMemo(
    () =>
      PAPERS.filter((p) => p.day === null).sort(
        (a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier],
      ),
    [],
  );

  const papersFor = (sessionId: string): Paper[] =>
    PAPERS.filter((p) => p.day === day && p.session === sessionId).sort(
      (a, b) => (a.posterNum ?? Infinity) - (b.posterNum ?? Infinity),
    );

  return (
    <div>
      <DayTabs value={day} counts={counts} onChange={selectDay} />
      <div className="px-4 pt-2">
        {day === 'tbd' ? (
          <>
            <p className="mb-3 px-1 text-[12px] leading-relaxed text-zinc-400">
              조사 시점(7/5) 세션 미배정 — 현장에서 ICML 앱으로 일정을 확인하세요.
            </p>
            <div className="flex flex-col gap-2 pb-4">
              {tbdPapers.map((p) => (
                <PosterCard key={p.id} paper={p} />
              ))}
            </div>
          </>
        ) : (
          <>
            {SESSIONS.filter((s) => s.day === day).map((s) => (
              <SessionGroup key={s.id} session={s} papers={papersFor(s.id)} />
            ))}
            {SESSIONS.filter((s) => s.day === day).every(
              (s) => papersFor(s.id).length === 0,
            ) && <EmptyState message="이 날짜에 해당하는 포스터가 없습니다" />}
          </>
        )}
      </div>
    </div>
  );
}
