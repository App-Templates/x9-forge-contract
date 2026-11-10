import { describe, expect, it } from 'vitest';
import { InternalPaperclipSeatNativeWakeRequestSchema } from '../src/http/endpoints/index.js';

const scope = { tenantId: 't1', ownerId: 'o1', agentId: 'lab-orto' };
const empty = '2c92b7f3-1111-4111-8111-111111111111';
const tech = '8f3b59ca-2222-4222-8222-222222222222';
const request = (event: Record<string, unknown>) => ({
  scope,
  eventId: 'evt-research',
  event: { kind: 'research_done', researchId: empty, state: 'budget_exhausted', question: 'Domanda?', ...event },
});
const parse = (v: unknown) => InternalPaperclipSeatNativeWakeRequestSchema.safeParse(v).success;

describe('research_done dossier', () => {
  it('s6275 dossier-nella-sveglia: accepts the dossier naming the event research and the merged one', () => {
    expect(parse(request({
      dossier: [{ researchId: tech, state: 'completed' }, { researchId: empty, state: 'budget_exhausted' }],
    }))).toBe(true);
  });

  it('(b) accepts the event without dossier', () => {
    expect(parse(request({}))).toBe(true);
  });

  it('(c) rejects an inconsistent dossier', () => {
    const own = { researchId: empty, state: 'budget_exhausted' };
    expect(parse(request({ dossier: [{ researchId: tech, state: 'completed' }] }))).toBe(false);
    expect(parse(request({ dossier: [{ researchId: empty, state: 'completed' }] }))).toBe(false);
    expect(parse(request({ dossier: [own, own] }))).toBe(false);
    expect(parse(request({ dossier: [] }))).toBe(false);
    const many = Array.from({ length: 20 }, (_, i) => ({ researchId: `r${i}`, state: 'completed' }));
    expect(parse(request({ dossier: [own, ...many] }))).toBe(false);
  });
});
