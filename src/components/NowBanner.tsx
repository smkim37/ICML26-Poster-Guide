import { PAPERS } from '../data/posters';
import { useNow } from '../hooks/useNow';
import { usePersonalMode } from '../hooks/usePersonalMode';
import { useUserData } from '../hooks/useUserData';
import { getSessionStatus } from '../lib/time';
import type { DayId, SessionId } from '../types';

const DAY_SHORT: Record<string, string> = { tue: '화', wed: '수', thu: '목' };

export default function NowBanner({
  onJump,
}: {
  onJump: (day: DayId, sessionId: SessionId) => void;
}) {
  const now = useNow();
  const { personal } = usePersonalMode();
  const { get } = useUserData();
  const status = getSessionStatus(now);

  if (status.phase === 'after') return null;

  const base =
    'mx-4 mb-2 flex w-auto items-center gap-2 rounded-[10px] bg-accent/[0.08] px-3.5 py-2.5 text-left text-[13px] font-medium text-accent dark:bg-accent-dark/10 dark:text-accent-dark';

  if (status.phase === 'before') {
    return (
      <div className={base}>
        <span>
          D-{status.dDays} · ICML 2026 서울 — 7/7(화) 포스터 세션 시작
        </span>
      </div>
    );
  }

  if (status.phase === 'during') {
    const { current, minutesLeft } = status;
    const core = PAPERS.filter((p) => p.session === current.id && p.tier === 'core');
    const coreInfo = personal
      ? `미방문 핵심 ${core.filter((p) => !get(p.id).visited).length}편`
      : `핵심 ${core.length}편`;
    return (
      <button className={`${base} w-[calc(100%-2rem)]`} onClick={() => onJump(current.day, current.id)}>
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
        <span className="min-w-0 truncate">
          지금 {current.label} · 종료까지 {minutesLeft}분 · {coreInfo}
        </span>
      </button>
    );
  }

  const { next, sameDay, minutesUntil } = status;
  return (
    <button className={`${base} w-[calc(100%-2rem)]`} onClick={() => onJump(next.day, next.id)}>
      <span className="min-w-0 truncate">
        다음: {next.label} ·{' '}
        {sameDay ? `${next.start} 시작 (${minutesUntil}분 후)` : `${DAY_SHORT[next.day]} ${next.start} 시작`}
      </span>
    </button>
  );
}
