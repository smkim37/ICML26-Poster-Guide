import { useEffect } from 'react';
import { EMPTY_FILTERS, type Filters } from '../lib/filter';
import type { PresType, Tier } from '../types';

const TIERS: { v: Tier; label: string }[] = [
  { v: 'core', label: '핵심' },
  { v: 'related', label: '관련' },
  { v: 'reference', label: '참고' },
];
const TYPES: { v: PresType; label: string }[] = [
  { v: 'poster', label: 'Poster' },
  { v: 'spotlight', label: 'Spotlight' },
  { v: 'oral', label: 'Oral' },
];
const INSTS = ['학교', '학교+기업'];
const SUBCATS = ['비디오-언어', '멀티모달 융합', '비디오 생성/편집', '생성모델 방법론'];

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

function Chip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-11 rounded-full px-4 text-[13px] font-medium transition-colors duration-150 ${
        active
          ? 'bg-accent text-white dark:bg-accent-dark dark:text-zinc-900'
          : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
      }`}
    >
      {label}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-[11px] font-semibold text-zinc-400">{title}</h3>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

export default function FilterSheet({
  open,
  filters,
  resultCount,
  onChange,
  onClose,
}: {
  open: boolean;
  filters: Filters;
  resultCount: number;
  onChange: (f: Filters) => void;
  onClose: () => void;
}) {
  // 시트 열림 동안 배경 스크롤 락
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-30">
      <button
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 animate-fadein bg-black/40"
      />
      <div className="absolute inset-x-0 bottom-0 animate-slideup rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] dark:bg-zinc-900">
        <div className="mx-auto max-h-[80dvh] w-full max-w-[640px] overflow-y-auto overscroll-contain px-5 pb-4 pt-3">
          <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <div className="space-y-4">
            <Section title="구분">
              {TIERS.map((t) => (
                <Chip
                  key={t.v}
                  active={filters.tiers.includes(t.v)}
                  label={t.label}
                  onClick={() => onChange({ ...filters, tiers: toggle(filters.tiers, t.v) })}
                />
              ))}
            </Section>
            <Section title="발표유형">
              {TYPES.map((t) => (
                <Chip
                  key={t.v}
                  active={filters.types.includes(t.v)}
                  label={t.label}
                  onClick={() => onChange({ ...filters, types: toggle(filters.types, t.v) })}
                />
              ))}
            </Section>
            <Section title="기관유형">
              {INSTS.map((i) => (
                <Chip
                  key={i}
                  active={filters.instTypes.includes(i)}
                  label={i}
                  onClick={() => onChange({ ...filters, instTypes: toggle(filters.instTypes, i) })}
                />
              ))}
            </Section>
            <Section title="참고 분류">
              {SUBCATS.map((s) => (
                <Chip
                  key={s}
                  active={filters.subcategories.includes(s)}
                  label={s}
                  onClick={() =>
                    onChange({ ...filters, subcategories: toggle(filters.subcategories, s) })
                  }
                />
              ))}
            </Section>
            <Section title="방문 여부">
              <Chip
                active={filters.unvisitedOnly}
                label="미방문만"
                onClick={() => onChange({ ...filters, unvisitedOnly: !filters.unvisitedOnly })}
              />
            </Section>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={() => onChange(EMPTY_FILTERS)}
              className="flex h-11 shrink-0 items-center px-3 text-[14px] font-medium text-zinc-500"
            >
              초기화
            </button>
            <button
              onClick={onClose}
              className="h-11 flex-1 rounded-[10px] bg-accent text-[15px] font-semibold text-white dark:bg-accent-dark dark:text-zinc-900"
            >
              {resultCount}편 보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
