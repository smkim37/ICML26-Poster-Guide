import { useRef, useState } from 'react';
import { OVERVIEW } from '../data/overview';
import { PAPERS } from '../data/posters';
import { useTheme, type Theme } from '../hooks/useTheme';
import { useUserData } from '../hooks/useUserData';
import { downloadBackup, parseBackup } from '../lib/storage';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-[13px] font-semibold text-zinc-500 dark:text-zinc-400">
        {title}
      </h2>
      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        {children}
      </div>
    </section>
  );
}

const THEMES: { v: Theme; label: string }[] = [
  { v: 'system', label: '시스템' },
  { v: 'light', label: '라이트' },
  { v: 'dark', label: '다크' },
];

export default function SettingsPage() {
  const [theme, setTheme] = useTheme();
  const { data, importData, resetAll } = useUserData();
  const fileRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const flash = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(null), 2000);
  };

  const onImportFile = async (file: File) => {
    const parsed = parseBackup(await file.text());
    if (!parsed) {
      alert('유효한 백업 파일이 아닙니다.');
      return;
    }
    const n = Object.keys(parsed.papers).length;
    if (confirm(`현재 기록을 백업 파일 내용(${n}개 항목)으로 교체합니다. 계속할까요?`)) {
      importData(parsed);
      flash('가져오기 완료');
    }
  };

  const markedCount = Object.keys(data.papers).length;

  return (
    <div className="space-y-5 px-4 py-5">
      <Section title="테마">
        <div className="grid grid-cols-3 gap-1 rounded-[10px] bg-zinc-100 p-1 dark:bg-zinc-800">
          {THEMES.map((t) => (
            <button
              key={t.v}
              onClick={() => setTheme(t.v)}
              className={`h-9 rounded-lg text-[13px] font-medium transition-colors duration-150 ${
                theme === t.v
                  ? 'border border-zinc-200 bg-white font-semibold dark:border-zinc-700 dark:bg-zinc-900'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="백업">
        <p className="mb-3 text-[13px] leading-relaxed text-zinc-500">
          방문·별표·메모 기록({markedCount}개 항목)을 JSON 파일로 보관하거나 다른 기기로 옮길 수
          있습니다.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              downloadBackup(data);
              flash('백업 파일 다운로드됨');
            }}
            className="h-11 rounded-[10px] bg-accent text-[14px] font-semibold text-white dark:bg-accent-dark dark:text-zinc-900"
          >
            내보내기
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="h-11 rounded-[10px] border border-zinc-200 bg-white text-[14px] font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            가져오기
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onImportFile(f);
            e.target.value = '';
          }}
        />
        {notice && (
          <p className="mt-2 text-center text-[12px] text-tier-core dark:text-tier-core-dark">
            {notice}
          </p>
        )}
      </Section>

      <Section title="데이터 초기화">
        <button
          onClick={() => {
            if (
              confirm('방문·별표·메모 기록을 전부 삭제합니다.') &&
              confirm('정말 삭제할까요? 되돌릴 수 없습니다. (내보내기로 백업을 권장)')
            ) {
              resetAll();
              flash('초기화 완료');
            }
          }}
          className="h-11 w-full rounded-[10px] border border-red-200 bg-white text-[14px] font-semibold text-red-600 dark:border-red-900/50 dark:bg-zinc-900 dark:text-red-400"
        >
          모든 기록 삭제
        </button>
      </Section>

      <Section title="정보">
        <dl className="space-y-2 text-[13px]">
          <div className="flex justify-between">
            <dt className="text-zinc-400">앱 버전</dt>
            <dd>1.0.0</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-400">포스터 데이터</dt>
            <dd>
              {PAPERS.length}편 · {OVERVIEW.surveyDate} 기준
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-400">소스</dt>
            <dd>
              <a
                href="https://github.com/smkim37/ICML26-Poster-Guide"
                target="_blank"
                rel="noopener"
                className="font-medium text-accent dark:text-accent-dark"
              >
                GitHub
              </a>
            </dd>
          </div>
        </dl>
        <p className="mt-3 border-t border-zinc-100 pt-3 text-[12px] leading-relaxed text-zinc-400 dark:border-zinc-800">
          엑셀 갱신 → <code className="font-mono">python3 scripts/excel_to_json.py</code> → push
          하면 데이터가 재배포됩니다 (README 참조). 기록은 논문 ID 기준이라 유지됩니다.
        </p>
      </Section>
    </div>
  );
}
