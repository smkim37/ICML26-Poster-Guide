import { TIER_BADGE, TIER_LABEL } from '../lib/labels';
import type { Tier } from '../types';

export default function TierBadge({ tier }: { tier: Tier }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${TIER_BADGE[tier]}`}
    >
      {TIER_LABEL[tier]}
    </span>
  );
}
