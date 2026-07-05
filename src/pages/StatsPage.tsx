import { useMemo } from 'react';
import ProgressBar from '../components/ProgressBar';
import StatBar from '../components/StatBar';
import StatTile from '../components/StatTile';
import { OVERVIEW } from '../data/overview';
import { PAPERS } from '../data/posters';
import { SESSIONS } from '../data/sessions';
import { useUserData } from '../hooks/useUserData';
import { TIER_BAR, TIER_LABEL } from '../lib/labels';
import type { Tier } from '../types';

function countBy<T extends string>(keys: T[], keyOf: (p: (typeof PAPERS)[number]) => T | null) {
  const m = new Map<T, number>(keys.map((k) => [k, 0]));
  for (const p of PAPERS) {
    const k = keyOf(p);
    if (k !== null && m.has(k)) m.set(k, (m.get(k) ?? 0) + 1);
  }
  return keys.map((k) => ({ key: k, count: m.get(k) ?? 0 }));
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-3 text-[11px] font-semibold text-zinc-400">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export default function StatsPage() {
  const { data, get } = useUserData();

  const my = useMemo(() => {
    const states = PAPERS.map((p) => ({ p, s: get(p.id) }));
    return {
      visited: states.filter(({ s }) => s.visited).length,
      starred: states.filter(({ s }) => s.starred).length,
      memos: states.filter(({ s }) => s.memo).length,
      coreVisited: states.filter(({ p, s }) => p.tier === 'core' && s.visited).length,
      tierVisited: (t: Tier) =>
        states.filter(({ p, s }) => p.tier === t && s.visited).length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const tiers = countBy(['core', 'related', 'reference'] as Tier[], (p) => p.tier);
  const days = countBy(['tue', 'wed', 'thu', 'tbd'], (p) => (p.day ?? 'tbd') as 'tue' | 'wed' | 'thu' | 'tbd');
  const sessions = [
    ...SESSIONS.filter((s) => s.id !== 'ORAL1').map((s) => ({
      key: s.id as string,
      count: PAPERS.filter((p) => p.session === s.id).length,
    })),
    { key: 'Oral', count: PAPERS.filter((p) => p.session === 'ORAL1').length },
    { key: '미정', count: PAPERS.filter((p) => p.session === null).length },
  ];
  const types = countBy(['poster', 'spotlight', 'oral'], (p) => p.type);
  const insts = countBy(['학교', '학교+기업'], (p) => p.instType);
  const subcats = countBy(
    ['멀티모달 융합', '비디오-언어', '생성모델 방법론', '비디오 생성/편집'],
    (p) => p.subcategory as never,
  );

  const DAY_LABELS: Record<string, string> = { tue: '화 7/7', wed: '수 7/8', thu: '목 7/9', tbd: '미정' };
  const TYPE_LABELS: Record<string, string> = { poster: 'Poster', spotlight: 'Spotlight', oral: 'Oral' };
  const maxOf = (arr: { count: number }[]) => Math.max(...arr.map((a) => a.count), 1);

  return (
    <div className="space-y-5 px-4 py-5">
      {/* 관람 진행률 */}
      <section>
        <h2 className="mb-2 px-1 text-[13px] font-semibold text-zinc-500 dark:text-zinc-400">
          관람 진행률
        </h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <StatTile label="방문" value={my.visited} sub={`/${PAPERS.length}`} />
          <StatTile label="핵심 방문" value={my.coreVisited} sub="/30" />
          <StatTile label="별표" value={my.starred} />
          <StatTile label="메모" value={my.memos} />
        </div>
        <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-1 flex items-baseline justify-between text-[13px]">
            <span className="text-zinc-500">전체</span>
            <span className="font-mono tabular-nums text-zinc-500">
              {Math.round((my.visited / PAPERS.length) * 100)}%
            </span>
          </div>
          <ProgressBar value={my.visited / PAPERS.length} />
          <div className="mt-3 space-y-2.5">
            {tiers.map(({ key, count }) => (
              <StatBar
                key={key}
                label={`${TIER_LABEL[key as Tier]} 방문`}
                count={my.tierVisited(key as Tier)}
                max={count}
                colorClass={TIER_BAR[key as Tier]}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 내 리스트 분포 */}
      <section>
        <h2 className="mb-2 px-1 text-[13px] font-semibold text-zinc-500 dark:text-zinc-400">
          내 리스트 분포
        </h2>
        <div className="space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
          <Group title="구분">
            {tiers.map(({ key, count }) => (
              <StatBar
                key={key}
                label={TIER_LABEL[key as Tier]}
                count={count}
                max={maxOf(tiers)}
                colorClass={TIER_BAR[key as Tier]}
              />
            ))}
          </Group>
          <Group title="요일">
            {days.map(({ key, count }) => (
              <StatBar key={key} label={DAY_LABELS[key]} count={count} max={maxOf(days)} />
            ))}
          </Group>
          <Group title="세션">
            {sessions.map(({ key, count }) => (
              <StatBar key={key} label={key} count={count} max={maxOf(sessions)} />
            ))}
          </Group>
          <Group title="발표유형 · 기관유형">
            {types.map(({ key, count }) => (
              <StatBar key={key} label={TYPE_LABELS[key]} count={count} max={maxOf(types)} />
            ))}
            <div className="border-t border-zinc-100 pt-3 dark:border-zinc-800" />
            {insts.map(({ key, count }) => (
              <StatBar key={key} label={key} count={count} max={maxOf(insts)} />
            ))}
          </Group>
          <Group title="참고 분류 (참고 티어)">
            {subcats.map(({ key, count }) => (
              <StatBar key={key} label={key} count={count} max={maxOf(subcats)} />
            ))}
          </Group>
        </div>
      </section>

      {/* ICML 2026 전체 */}
      <section>
        <h2 className="mb-2 px-1 text-[13px] font-semibold text-zinc-500 dark:text-zinc-400">
          ICML 2026 전체
        </h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <StatTile label="Accepted" value={OVERVIEW.icmlAccepted.toLocaleString()} sub="편" />
          <StatTile
            label="내 커버리지"
            value={OVERVIEW.myTotal}
            sub={`편 (${((OVERVIEW.myTotal / OVERVIEW.icmlAccepted) * 100).toFixed(1)}%)`}
          />
          <StatTile label="제출" value={OVERVIEW.icmlSubmissions.toLocaleString()} sub="편" />
          <StatTile
            label="Oral · Spotlight"
            value={`${OVERVIEW.icmlOrals}·${OVERVIEW.icmlSpotlights}`}
          />
        </div>
        <p className="mt-1.5 px-1 text-[11px] text-zinc-400">
          출처: icml.cc 및 공개 집계, {OVERVIEW.surveyDate} 기준
        </p>
      </section>
    </div>
  );
}
