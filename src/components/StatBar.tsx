export default function StatBar({
  label,
  count,
  max,
  colorClass,
}: {
  label: string;
  count: number;
  max: number;
  colorClass?: string; // 미지정 시 액센트
}) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-[13px] text-zinc-600 dark:text-zinc-300">{label}</span>
        <span className="font-mono text-[13px] tabular-nums text-zinc-500">{count}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${
            colorClass ?? 'bg-accent dark:bg-accent-dark'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
