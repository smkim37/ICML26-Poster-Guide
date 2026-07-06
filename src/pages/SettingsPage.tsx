import { useRef, useState } from 'react';
import { OVERVIEW } from '../data/overview';
import { PAPERS } from '../data/posters';
import { usePersonalMode } from '../hooks/usePersonalMode';
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

// 개인 모드 잠금/해제 (docs/01 §10) — 소유자 전용 기능의 간단 게이트
function PersonalSection() {
  const { personal, until, unlock, lock } = usePersonalMode();
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  if (personal) {
    const hhmm = until
      ? new Date(until).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
      : '';
    return (
      <Section title="개인 모드">
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-zinc-600 dark:text-zinc-300">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-tier-core align-middle dark:bg-tier-core-dark" />
            활성 · {hhmm}까지 유지
          </p>
          <button
            onClick={lock}
            className="flex h-11 items-center rounded-[10px] border border-zinc-200 bg-white px-4 text-[13px] font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
          >
            잠금
          </button>
        </div>
      </Section>
    );
  }

  const submit = async () => {
    if (!pw || busy) return;
    setBusy(true);
    const ok = await unlock(pw);
    setBusy(false);
    if (!ok) {
      setError(true);
      setPw('');
    }
  };

  return (
    <Section title="개인 모드">
      <p className="mb-3 text-[13px] leading-relaxed text-zinc-500">
        방문 체크·별표·메모 기능은 소유자 전용입니다.
      </p>
      <div className="flex gap-2">
        <input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          enterKeyHint="done"
          value={pw}
          onChange={(e) => {
            setPw(e.target.value);
            setError(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          placeholder="비밀번호"
          className="h-11 min-w-0 flex-1 rounded-[10px] border border-zinc-200 bg-white px-3.5 text-[14px] outline-none placeholder:text-zinc-400 focus:border-accent dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-accent-dark"
        />
        <button
          onClick={submit}
          disabled={busy}
          className="h-11 shrink-0 rounded-[10px] bg-accent px-5 text-[14px] font-semibold text-white disabled:opacity-50 dark:bg-accent-dark dark:text-zinc-900"
        >
          해제
        </button>
      </div>
      {error && (
        <p className="mt-2 text-[12px] text-red-500 dark:text-red-400">
          비밀번호가 올바르지 않습니다.
        </p>
      )}
    </Section>
  );
}

export default function SettingsPage() {
  const [theme, setTheme] = useTheme();
  const { requirePersonal } = usePersonalMode();
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
      {/* 팝업 "설정으로 이동"이 최상단으로 오므로 개인 모드가 첫 섹션 */}
      <PersonalSection />

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
              if (!requirePersonal()) return;
              downloadBackup(data);
              flash('백업 파일 다운로드됨');
            }}
            className="h-11 rounded-[10px] bg-accent text-[14px] font-semibold text-white dark:bg-accent-dark dark:text-zinc-900"
          >
            내보내기
          </button>
          <button
            onClick={() => requirePersonal() && fileRef.current?.click()}
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
            if (!requirePersonal()) return;
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
