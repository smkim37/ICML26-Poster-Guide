import type { PresType, Tier } from '../types';

export const TIER_LABEL: Record<Tier, string> = {
  core: '핵심',
  related: '관련',
  reference: '참고',
};

export const TYPE_LABEL: Record<PresType, string> = {
  poster: 'Poster',
  spotlight: 'Spotlight',
  oral: 'Oral',
};

// 티어별 Tailwind 클래스 묶음 — 색 클래스 산재 금지 (docs/04 §4)
export const TIER_BORDER: Record<Tier, string> = {
  core: 'border-l-tier-core dark:border-l-tier-core-dark',
  related: 'border-l-tier-related dark:border-l-tier-related-dark',
  reference: 'border-l-tier-reference dark:border-l-tier-reference-dark',
};

export const TIER_BADGE: Record<Tier, string> = {
  core: 'bg-tier-core/10 text-tier-core dark:bg-tier-core-dark/10 dark:text-tier-core-dark',
  related: 'bg-tier-related/10 text-tier-related dark:bg-tier-related-dark/10 dark:text-tier-related-dark',
  reference: 'bg-tier-reference/10 text-tier-reference dark:bg-tier-reference-dark/10 dark:text-tier-reference-dark',
};

export const TIER_BAR: Record<Tier, string> = {
  core: 'bg-tier-core dark:bg-tier-core-dark',
  related: 'bg-tier-related dark:bg-tier-related-dark',
  reference: 'bg-tier-reference dark:bg-tier-reference-dark',
};
