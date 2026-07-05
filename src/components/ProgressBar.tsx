export default function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  const complete = pct >= 100;
  return (
    <div className="h-[3px] w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
      <div
        className={`h-full rounded-full transition-[width] duration-300 ${
          complete
            ? 'bg-tier-core dark:bg-tier-core-dark'
            : 'bg-accent dark:bg-accent-dark'
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
