import { Link } from 'react-router-dom';
import { usePersonalMode } from '../hooks/usePersonalMode';
import { useUserData } from '../hooks/useUserData';
import { TIER_BORDER } from '../lib/labels';
import type { Paper } from '../types';
import TierBadge from './TierBadge';
import TypeBadge from './TypeBadge';
import { CheckCircleIcon, StarIcon } from './icons';

export default function PosterCard({ paper, context }: { paper: Paper; context?: string }) {
  const { personal } = usePersonalMode();
  const { get, toggleVisited, toggleStarred } = useUserData();
  const state = personal ? get(paper.id) : {};

  const act = (e: React.MouseEvent, fn: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    fn();
  };

  return (
    <Link to={`/paper/${paper.id}`} className="block">
      <article
        className={`flex gap-3 rounded-xl border border-zinc-200 border-l-[3px] bg-white p-3.5 pr-1.5 transition-[transform,opacity] duration-150 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 ${TIER_BORDER[paper.tier]} ${state.visited ? 'opacity-55' : ''}`}
      >
        <div className="w-[52px] shrink-0 pt-0.5 font-mono text-[13px] font-semibold tabular-nums text-zinc-700 dark:text-zinc-300">
          {paper.posterNum !== null ? (
            `#${paper.posterNum}`
          ) : (
            <span className="text-zinc-300 dark:text-zinc-600">—</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          {context && (
            <p className="mb-0.5 text-[11px] font-medium text-zinc-400">{context}</p>
          )}
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-[1.35]">
            {paper.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-[13px] leading-[1.55] text-zinc-500 dark:text-zinc-400">
            {paper.intro}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <TierBadge tier={paper.tier} />
            <TypeBadge type={paper.type} />
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
              {paper.instType}
            </span>
          </div>
        </div>
        {personal && (
        <div className="-my-1.5 flex shrink-0 flex-col items-center justify-center">
          <button
            onClick={(e) => act(e, () => toggleVisited(paper.id))}
            aria-label={state.visited ? '방문 취소' : '방문 완료'}
            className={`flex h-11 w-11 items-center justify-center ${
              state.visited
                ? 'text-accent dark:text-accent-dark'
                : 'text-zinc-300 dark:text-zinc-600'
            }`}
          >
            <CheckCircleIcon className="h-[22px] w-[22px]" filled={!!state.visited} />
          </button>
          <button
            onClick={(e) => act(e, () => toggleStarred(paper.id))}
            aria-label={state.starred ? '별표 해제' : '별표'}
            className={`flex h-11 w-11 items-center justify-center ${
              state.starred
                ? 'text-tier-reference dark:text-tier-reference-dark'
                : 'text-zinc-300 dark:text-zinc-600'
            }`}
          >
            <StarIcon className="h-[22px] w-[22px]" filled={!!state.starred} />
          </button>
        </div>
        )}
      </article>
    </Link>
  );
}
