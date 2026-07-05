import { PAPERS } from './data/posters';

// Phase 1 임시 셸 — Phase 2에서 라우터/페이지로 교체
export default function App() {
  const byDay = (d: string | null) => PAPERS.filter((p) => p.day === d).length;
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <img
          src={import.meta.env.BASE_URL + 'icml-logo.svg'}
          alt="ICML"
          className="mx-auto mb-4 h-12 rounded-lg bg-white p-1"
        />
        <h1 className="text-xl font-bold">ICML 2026 Poster Guide</h1>
        <p className="mt-2 text-zinc-500">
          {PAPERS.length}편 로드됨 · 화 {byDay('tue')} / 수 {byDay('wed')} / 목 {byDay('thu')} / 미정 {byDay(null)}
        </p>
        <p className="mt-1 text-sm text-zinc-400">Phase 1 — 스캐폴드 + 데이터 + 배포</p>
      </div>
    </div>
  );
}
