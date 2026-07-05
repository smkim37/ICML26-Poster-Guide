export default function StatTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-[11px] font-semibold text-zinc-400">{label}</p>
      <p className="mt-1 text-[28px] font-bold leading-none tabular-nums">
        {value}
        {sub && <span className="ml-0.5 text-[13px] font-medium text-zinc-400">{sub}</span>}
      </p>
    </div>
  );
}
