import { useEffect, useState } from 'react';
import { getNowOverride, nowKST, type KstNow } from '../lib/time';

// 30초 간격 KST 시계 — NowBanner 등 필요한 곳에만 마운트 (docs/02 폴더 구조)
export function useNow(): KstNow {
  const [now, setNow] = useState<KstNow>(() => nowKST(getNowOverride()));
  useEffect(() => {
    const id = window.setInterval(() => setNow(nowKST(getNowOverride())), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}
