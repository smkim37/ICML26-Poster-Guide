import type { PresType } from '../types';

// Poster는 렌더하지 않는다 — Spotlight/Oral만 마커 (docs/03 §4)
export default function TypeBadge({ type }: { type: PresType }) {
  if (type === 'poster') return null;
  const cls =
    type === 'spotlight'
      ? 'bg-accent/10 text-accent dark:bg-accent-dark/10 dark:text-accent-dark'
      : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>
      {type === 'spotlight' ? 'Spotlight' : 'Oral'}
    </span>
  );
}
