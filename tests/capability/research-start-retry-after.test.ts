import { describe, it, expect } from 'vitest';
import { ResearchStartOutputSchema } from '../../src/capability/ricerca/tools';

describe('ResearchStartOutputSchema retryAfter', () => {
  it('s6172 lab-fermo-muto: ResearchStartOutputSchema keeps an optional ISO retryAfter only when state is budget_exhausted', () => {
    const out = { researchId: 'r-1', state: 'budget_exhausted', retryAfter: '2026-11-11T00:00:00.000+01:00' };
    expect(ResearchStartOutputSchema.parse(out)).toEqual(out);
    expect(ResearchStartOutputSchema.safeParse({ ...out, retryAfter: 'domani' }).success).toBe(false);
  });

  it('s6172 retryAfter with state queued is refused', () => {
    const r = ResearchStartOutputSchema.safeParse({ researchId: 'r-1', state: 'queued', retryAfter: '2026-11-11T00:00:00Z' });
    expect(r.success).toBe(false);
  });

  it('s6172 the start output cap-ricerca sends today still parses', () => {
    expect(ResearchStartOutputSchema.safeParse({ researchId: 'r-1', state: 'budget_exhausted' }).success).toBe(true);
    expect(ResearchStartOutputSchema.safeParse({ researchId: 'r-2', state: 'queued' }).success).toBe(true);
    expect(ResearchStartOutputSchema.safeParse({ researchId: 'r-2', state: 'queued', extra: 1 }).success).toBe(false);
  });
});
