import { Link } from 'react-router-dom';
import { TIER_BORDER } from '../lib/labels';
import type { Paper } from '../types';
import TierBadge from './TierBadge';
import TypeBadge from './TypeBadge';

export default function PosterCard({ paper }: { paper: Paper }) {
  return (
    <Link to={`/paper/${paper.id}`} className="block">
      <article
        className={`flex gap-3 rounded-xl border border-zinc-200 border-l-[3px] bg-white p-3.5 transition-transform duration-150 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 ${TIER_BORDER[paper.tier]}`}
      >
        <div className="w-[52px] shrink-0 pt-0.5 font-mono text-[13px] font-semibold tabular-nums text-zinc-700 dark:text-zinc-300">
          {paper.posterNum !== null ? (
            `#${paper.posterNum}`
          ) : (
            <span className="text-zinc-300 dark:text-zinc-600">—</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
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
      </article>
    </Link>
  );
}
