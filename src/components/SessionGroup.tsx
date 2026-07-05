import type { Session } from '../data/sessions';
import type { Paper } from '../types';
import PosterCard from './PosterCard';

export default function SessionGroup({
  session,
  papers,
}: {
  session: Session;
  papers: Paper[];
}) {
  if (papers.length === 0) return null;
  return (
    <section className="mb-6" id={`session-${session.id}`}>
      <header className="mb-2 flex items-baseline justify-between px-1">
        <h2 className="text-[13px] font-semibold tracking-[0.01em] text-zinc-500 dark:text-zinc-400">
          {session.label}
          <span className="font-normal text-zinc-400 dark:text-zinc-500">
            {' '}· {session.start}–{session.end} · {session.place}
          </span>
        </h2>
        <span className="text-[12px] tabular-nums text-zinc-400">{papers.length}편</span>
      </header>
      <div className="flex flex-col gap-2">
        {papers.map((p) => (
          <PosterCard key={p.id} paper={p} />
        ))}
      </div>
    </section>
  );
}
