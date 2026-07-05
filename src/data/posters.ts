import postersJson from './posters.json';
import type { Paper } from '../types';

export const PAPERS = postersJson as Paper[];
export const PAPER_BY_ID = new Map(PAPERS.map((p) => [p.id, p]));
