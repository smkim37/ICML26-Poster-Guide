import { useEffect, useRef, useState } from 'react';
import { usePersonalMode } from '../hooks/usePersonalMode';
import { useUserData } from '../hooks/useUserData';

export default function MemoEditor({ paperId }: { paperId: string }) {
  const { requirePersonal } = usePersonalMode();
  const { get, setMemo } = useUserData();
  const [value, setValue] = useState(() => get(paperId).memo ?? '');
  const [saved, setSaved] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const latest = useRef({ paperId, value, stored: get(paperId).memo ?? '' });
  latest.current = { paperId, value, stored: get(paperId).memo ?? '' };

  // 다른 논문으로 이동 시 값 동기화
  useEffect(() => {
    setValue(get(paperId).memo ?? '');
    setSaved(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paperId]);

  // blur 없이 이탈(스와이프백 등)해도 저장 유실 방지 — 실제로 바뀐 경우에만 기록
  // (무조건 호출하면 열람만 해도 updatedAt이 갱신되고 저장된 메모가 임의로 trim됨)
  useEffect(
    () => () => {
      const { paperId: id, value: v, stored } = latest.current;
      if (v.trim() !== stored) setMemo(id, v.trim());
    },
    [setMemo],
  );

  const autosize = () => {
    const el = ref.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  };
  useEffect(autosize, [value]);

  const save = () => {
    if (value !== (get(paperId).memo ?? '')) {
      setMemo(paperId, value.trim());
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1000);
    }
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <h2 className="text-[11px] font-semibold text-zinc-400">메모</h2>
        {saved && <span className="text-[11px] text-tier-core dark:text-tier-core-dark">저장됨</span>}
      </div>
      <textarea
        ref={ref}
        value={value}
        onFocus={(e) => {
          // 잠금 상태에서는 입력 대신 안내 팝업 (docs/01 §10)
          if (!requirePersonal()) e.target.blur();
        }}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        rows={2}
        placeholder="메모 (질문할 것, 인상 등)"
        className="w-full resize-none rounded-[10px] border border-zinc-200 bg-white p-3 text-[14px] leading-relaxed outline-none placeholder:text-zinc-400 focus:border-accent dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-accent-dark"
      />
    </div>
  );
}
