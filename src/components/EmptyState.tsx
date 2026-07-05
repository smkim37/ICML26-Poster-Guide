import type { ReactNode } from 'react';
import { SearchIcon } from './icons';

export default function EmptyState({
  message,
  action,
}: {
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <SearchIcon className="h-10 w-10 text-zinc-300 dark:text-zinc-700" />
      <p className="text-zinc-500">{message}</p>
      {action}
    </div>
  );
}
