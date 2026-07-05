import type { Paper, PaperState, PresType, Tier } from '../types';

export interface Filters {
  tiers: Tier[];
  types: PresType[];
  instTypes: string[];
  subcategories: string[];
  unvisitedOnly: boolean;
}

export const EMPTY_FILTERS: Filters = {
  tiers: [],
  types: [],
  instTypes: [],
  subcategories: [],
  unvisitedOnly: false,
};

export function countActiveFilters(f: Filters): number {
  return (
    f.tiers.length + f.types.length + f.instTypes.length + f.subcategories.length +
    (f.unvisitedOnly ? 1 : 0)
  );
}

// facet 간 AND, facet 내 OR. 빈 facet은 전체 허용 (docs/01 §3)
export function filterPapers(
  papers: Paper[],
  query: string,
  f: Filters,
  getState: (id: string) => PaperState,
): Paper[] {
  const q = query.trim().toLowerCase();
  return papers.filter((p) => {
    if (f.tiers.length && !f.tiers.includes(p.tier)) return false;
    if (f.types.length && !f.types.includes(p.type)) return false;
    if (f.instTypes.length && !f.instTypes.includes(p.instType)) return false;
    if (f.subcategories.length && !(p.subcategory && f.subcategories.includes(p.subcategory)))
      return false;
    if (f.unvisitedOnly && getState(p.id).visited) return false;
    if (q) {
      const haystack = `${p.title} ${p.intro} ${p.authors} ${p.affiliations.join(' ')}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}
