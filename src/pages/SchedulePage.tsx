import { PAPERS } from '../data/posters';
import { SESSIONS } from '../data/sessions';
import { useNow } from '../hooks/useNow';

// 콘텐츠 원본: docs/05-conference-info.md (2026-07-05 검증)
interface DayInfo {
  date: string;
  title: string;
  items: { time: string; text: string; strong?: boolean }[];
}

const SCHEDULE: DayInfo[] = [
  {
    date: '2026-07-05',
    title: '7/5 (일) — 사전 등록',
    items: [{ time: '14:00', text: '등록데스크 사전 오픈' }],
  },
  {
    date: '2026-07-06',
    title: '7/6 (월) — Expo · 튜토리얼',
    items: [
      { time: '종일', text: 'Expo 톡·데모, 튜토리얼' },
      { time: '19:00–21:00', text: '이브닝 소셜' },
    ],
  },
  {
    date: '2026-07-07',
    title: '7/7 (화) — 메인 1일차',
    items: [
      { time: '07:30–18:00', text: '등록데스크' },
      { time: '08:30–09:30', text: '키노트 — Pascale Fung (HKUST/AMI Labs) · "Towards AI Agents In the Real World"', strong: true },
      { time: '10:00–11:00', text: 'Oral 세션 (7트랙 병렬)' },
      { time: '10:30–12:15', text: 'Poster Session 1 · Hall A', strong: true },
      { time: '11:00–19:00', text: '전시홀' },
      { time: '14:00–15:45', text: 'Poster Session 2 · Hall A', strong: true },
      { time: '08:00–17:00', text: 'Affinity: LatinX in AI' },
    ],
  },
  {
    date: '2026-07-08',
    title: '7/8 (수) — 메인 2일차',
    items: [
      { time: '07:30–18:00', text: '등록데스크' },
      { time: '08:30–09:30', text: '키노트 — Sham Kakade (Harvard/Kempner) · "How Far Can Quadratics Take Us? Lessons for LLM Pretraining"', strong: true },
      { time: '09:00–18:00', text: '전시홀' },
      { time: '10:00–11:00', text: 'Oral 세션 (7트랙 병렬)' },
      { time: '10:30–12:15', text: 'Poster Session 3 · Hall A', strong: true },
      { time: '14:30–16:15', text: 'Poster Session 4 · Hall A', strong: true },
      { time: '17:00–18:45', text: 'Poster Session 5 · Hall A', strong: true },
      { time: '종일', text: 'Affinity: WiML Symposium' },
    ],
  },
  {
    date: '2026-07-09',
    title: '7/9 (목) — 메인 3일차',
    items: [
      { time: '07:30–18:00', text: '등록데스크' },
      { time: '08:30–09:30', text: '키노트 — Verena Rieser (Google DeepMind) · "From Behavioural Guardrails to Principled Agency"', strong: true },
      { time: '09:00–18:00', text: '전시홀' },
      { time: '10:00–11:00', text: 'Oral 세션 (7트랙 병렬)' },
      { time: '10:30–12:15', text: 'Poster Session 6 · Hall A', strong: true },
      { time: '14:30–16:15', text: 'Poster Session 7 · Hall A', strong: true },
      { time: '17:00–18:45', text: 'Poster Session 8 · Hall A', strong: true },
      { time: '종일', text: 'Affinity: Muslims in ML · GlobalSouthML' },
    ],
  },
  {
    date: '2026-07-10',
    title: '7/10 (금) — 워크숍 1일차',
    items: [{ time: '종일', text: '워크숍' }],
  },
  {
    date: '2026-07-11',
    title: '7/11 (토) — 워크숍 2일차',
    items: [{ time: '종일', text: '워크숍' }],
  },
];

const DAY_SHORT: Record<string, string> = { tue: '화', wed: '수', thu: '목' };

export default function SchedulePage() {
  const now = useNow();
  const myCount = (sid: string) => PAPERS.filter((p) => p.session === sid).length;

  return (
    <div className="space-y-5 px-4 py-5">
      {/* 요약 카드 */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-3 w-fit rounded-lg bg-white p-2 shadow-sm ring-1 ring-zinc-200 dark:ring-0">
          <img
            src={import.meta.env.BASE_URL + 'icml-logo.svg'}
            alt="ICML 2026"
            className="h-10"
          />
        </div>
        <p className="text-[15px] font-bold">ICML 2026 · 서울 COEX</p>
        <p className="mt-0.5 text-[13px] text-zinc-500">
          2026년 7월 6일(월) – 7월 11일(토) · 모든 시간 KST
        </p>
        <p className="mt-0.5 text-[13px] text-zinc-500">
          등록데스크 화–목 07:30–18:00 · 포스터는 전부 Hall A
        </p>
      </div>

      {/* 포스터 세션 표 */}
      <section>
        <h2 className="mb-2 px-1 text-[13px] font-semibold text-zinc-500 dark:text-zinc-400">
          포스터 세션 × 내 관심 편수
        </h2>
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          {SESSIONS.filter((s) => s.id !== 'ORAL1').map((s, i) => (
            <div
              key={s.id}
              className={`flex items-center justify-between px-4 py-2.5 text-[13px] ${
                i > 0 ? 'border-t border-zinc-100 dark:border-zinc-800' : ''
              } ${s.date === now.date ? 'bg-accent/[0.06] dark:bg-accent-dark/[0.08]' : ''}`}
            >
              <span className="font-semibold">{s.id}</span>
              <span className="text-zinc-500">
                {DAY_SHORT[s.day]} {s.start}–{s.end}
              </span>
              <span className="font-mono tabular-nums text-zinc-600 dark:text-zinc-300">
                {myCount(s.id)}편
              </span>
            </div>
          ))}
        </div>
        <p className="mt-1.5 px-1 text-[11px] text-zinc-400">
          + Oral 1편 (화 10:30–10:45 · AUDITORIUM) · 일정 미정 15편
        </p>
      </section>

      {/* 일자별 가이드 */}
      <section className="space-y-3">
        <h2 className="px-1 text-[13px] font-semibold text-zinc-500 dark:text-zinc-400">
          일자별 가이드
        </h2>
        {SCHEDULE.map((d) => {
          const isToday = d.date === now.date;
          return (
            <div
              key={d.date}
              className={`rounded-xl border bg-white p-4 dark:bg-zinc-900 ${
                isToday
                  ? 'border-accent/40 ring-1 ring-accent/30 dark:border-accent-dark/40 dark:ring-accent-dark/30'
                  : 'border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <h3 className="mb-2 flex items-center gap-2 text-[14px] font-bold">
                {d.title}
                {isToday && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white dark:bg-accent-dark dark:text-zinc-900">
                    오늘
                  </span>
                )}
              </h3>
              <ul className="space-y-1.5">
                {d.items.map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed">
                    <span className="w-[86px] shrink-0 font-mono text-[12px] tabular-nums text-zinc-400">
                      {item.time}
                    </span>
                    <span
                      className={
                        item.strong
                          ? 'font-medium text-zinc-800 dark:text-zinc-200'
                          : 'text-zinc-500 dark:text-zinc-400'
                      }
                    >
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <p className="px-1 pb-2 text-[11px] leading-relaxed text-zinc-400">
        일정은 2026-07-05 조사 기준 (icml.cc). 현장 변경은 ICML 공식 앱에서 확인하세요.
      </p>
    </div>
  );
}
