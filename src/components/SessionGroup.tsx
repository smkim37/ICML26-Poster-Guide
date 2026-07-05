import { useUserData } from '../hooks/useUserData';
import type { Session } from '../data/sessions';
import type { Paper } from '../types';
import PosterCard from './PosterCard';
import ProgressBar from './ProgressBar';

export default function SessionGroup({
  session,
  papers,
}: {
  session: Session;
  papers: Paper[];
}) {
  const { get } = useUserData();
  if (papers.length === 0) return null;
  const visited = papers.filter((p) => get(p.id).visited).length;

  return (
    <section className="mb-6 scroll-mt-[calc(7.5rem+env(safe-area-inset-top))]" id={`session-${session.id}`}>
      <header className="mb-1.5 flex items-baseline justify-between px-1">
        <h2 className="text-[13px] font-semibold tracking-[0.01em] text-zinc-500 dark:text-zinc-400">
          {session.label}
          <span className="font-normal text-zinc-400 dark:text-zinc-500">
            {' '}· {session.start}–{session.end} · {session.place}
          </span>
        </h2>
        <span className="shrink-0 text-[12px] tabular-nums text-zinc-400">
          {visited}/{papers.length}
        </span>
      </header>
      <div className="mb-2 px-1">
        <ProgressBar value={papers.length ? visited / papers.length : 0} />
      </div>
      <div className="flex flex-col gap-2">
        {papers.map((p) => (
          <PosterCard key={p.id} paper={p} />
        ))}
      </div>
    </section>
  );
}
