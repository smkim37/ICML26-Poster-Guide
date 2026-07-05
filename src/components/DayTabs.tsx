import { DAYS, type DayTabId } from '../data/sessions';

export default function DayTabs({
  value,
  counts,
  onChange,
}: {
  value: DayTabId;
  counts: Record<DayTabId, number>;
  onChange: (d: DayTabId) => void;
}) {
  return (
    <div className="sticky top-[calc(3rem+env(safe-area-inset-top))] z-10 bg-stone-50/95 px-4 py-2 backdrop-blur dark:bg-zinc-950/95">
      <div className="mx-auto grid max-w-[608px] grid-cols-4 gap-1 rounded-[10px] bg-zinc-100 p-1 dark:bg-zinc-800">
        {DAYS.map((d) => {
          const active = d.id === value;
          return (
            <button
              key={d.id}
              onClick={() => onChange(d.id)}
              className={`flex h-11 flex-col items-center justify-center rounded-lg leading-tight transition-colors duration-150 ${
                active
                  ? 'border border-zinc-200 bg-white font-semibold dark:border-zinc-700 dark:bg-zinc-900'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              <span className="text-[13px]">{d.label}</span>
              <span className={`text-[10px] tabular-nums ${active ? 'text-zinc-400' : 'text-zinc-400/70'}`}>
                {counts[d.id]}편
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
