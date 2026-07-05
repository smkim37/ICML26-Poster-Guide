import { NavLink } from 'react-router-dom';
import { CalendarIcon, ChartIcon, GearIcon, GridIcon } from './icons';

const TABS = [
  { to: '/', label: '포스터', Icon: GridIcon },
  { to: '/schedule', label: '일정', Icon: CalendarIcon },
  { to: '/stats', label: '통계', Icon: ChartIcon },
  { to: '/settings', label: '설정', Icon: GearIcon },
];

export default function TabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200 bg-white/80 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto grid h-[52px] w-full max-w-[640px] grid-cols-4">
        {TABS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors duration-150 ${
                isActive
                  ? 'text-accent dark:text-accent-dark'
                  : 'text-zinc-400 dark:text-zinc-500'
              }`
            }
          >
            <Icon className="h-[22px] w-[22px]" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
