import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import MemoEditor from '../components/MemoEditor';
import TierBadge from '../components/TierBadge';
import TypeBadge from '../components/TypeBadge';
import { CheckCircleIcon, ExternalIcon, StarIcon } from '../components/icons';
import { PAPER_BY_ID } from '../data/posters';
import { SESSIONS } from '../data/sessions';
import { usePersonalMode } from '../hooks/usePersonalMode';
import { useUserData } from '../hooks/useUserData';

const DAY_FULL: Record<string, string> = {
  tue: '7월 7일 (화)',
  wed: '7월 8일 (수)',
  thu: '7월 9일 (목)',
};

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="w-16 shrink-0 text-[11px] font-semibold text-zinc-400">{label}</span>
      <span className="text-[14px]">{children}</span>
    </div>
  );
}

export default function PaperPage() {
  const { id } = useParams();
  const paper = id ? PAPER_BY_ID.get(id) : undefined;
  const { personal } = usePersonalMode();
  const { get, toggleVisited, toggleStarred } = useUserData();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!paper) {
    return (
      <EmptyState
        message="논문을 찾을 수 없습니다"
        action={
          <Link to="/" className="text-[14px] font-medium text-accent dark:text-accent-dark">
            홈으로
          </Link>
        }
      />
    );
  }

  const session = SESSIONS.find((s) => s.id === paper.session);

  return (
    <div className="space-y-5 px-4 py-5">
      <div>
        <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
          <TierBadge tier={paper.tier} />
          <TypeBadge type={paper.type} />
          {paper.subcategory && (
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              {paper.subcategory}
            </span>
          )}
        </div>
        <h1 className="text-xl font-bold leading-snug">{paper.title}</h1>
      </div>

      <p className="text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
        {paper.intro}
      </p>

      <div className="space-y-2.5 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        {session && paper.day ? (
          <>
            <InfoRow label="일정">
              {DAY_FULL[paper.day]} · {session.start}–{session.end}
            </InfoRow>
            <InfoRow label="세션">{session.label}</InfoRow>
            <InfoRow label="장소">{session.place}</InfoRow>
            <InfoRow label="포스터">
              {paper.posterNum !== null ? (
                <span className="font-mono font-semibold tabular-nums">#{paper.posterNum}</span>
              ) : (
                <span className="text-zinc-400">번호 없음</span>
              )}
            </InfoRow>
          </>
        ) : (
          <InfoRow label="일정">
            <span className="text-zinc-500">미정 — 현장에서 ICML 앱으로 확인</span>
          </InfoRow>
        )}
      </div>

      <div>
        <h2 className="mb-1.5 text-[11px] font-semibold text-zinc-400">저자</h2>
        <p className="text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-300">
          {paper.authors}
        </p>
      </div>

      <div>
        <h2 className="mb-1.5 text-[11px] font-semibold text-zinc-400">소속</h2>
        <div className="flex flex-wrap gap-1.5">
          {paper.affiliations.map((a) => (
            <span
              key={a}
              className="rounded-md bg-zinc-100 px-2 py-1 text-[12px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {a}
            </span>
          ))}
          <span className="rounded-md bg-zinc-100 px-2 py-1 text-[12px] text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
            {paper.instType}
          </span>
        </div>
      </div>

      {personal && (
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => toggleVisited(paper.id)}
          className={`flex h-12 items-center justify-center gap-2 rounded-[10px] border text-[14px] font-semibold transition-colors duration-150 ${
            get(paper.id).visited
              ? 'border-accent bg-accent text-white dark:border-accent-dark dark:bg-accent-dark dark:text-zinc-900'
              : 'border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'
          }`}
        >
          <CheckCircleIcon className="h-5 w-5" filled={!!get(paper.id).visited} />
          {get(paper.id).visited ? '방문 완료' : '방문 체크'}
        </button>
        <button
          onClick={() => toggleStarred(paper.id)}
          className={`flex h-12 items-center justify-center gap-2 rounded-[10px] border text-[14px] font-semibold transition-colors duration-150 ${
            get(paper.id).starred
              ? 'border-tier-reference/40 bg-tier-reference/10 text-tier-reference dark:border-tier-reference-dark/40 dark:bg-tier-reference-dark/10 dark:text-tier-reference-dark'
              : 'border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'
          }`}
        >
          <StarIcon className="h-5 w-5" filled={!!get(paper.id).starred} />
          {get(paper.id).starred ? '별표 됨' : '별표'}
        </button>
      </div>
      )}

      {personal && <MemoEditor paperId={paper.id} />}

      <div className="grid grid-cols-2 gap-2 pb-2">
        <a
          href={paper.openreview}
          target="_blank"
          rel="noopener"
          className="flex h-11 items-center justify-center gap-1.5 rounded-[10px] border border-zinc-200 bg-white text-[14px] font-medium text-accent dark:border-zinc-700 dark:bg-zinc-900 dark:text-accent-dark"
        >
          OpenReview <ExternalIcon className="h-4 w-4" />
        </a>
        <a
          href={paper.icmlUrl}
          target="_blank"
          rel="noopener"
          className="flex h-11 items-center justify-center gap-1.5 rounded-[10px] border border-zinc-200 bg-white text-[14px] font-medium text-accent dark:border-zinc-700 dark:bg-zinc-900 dark:text-accent-dark"
        >
          ICML 페이지 <ExternalIcon className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
