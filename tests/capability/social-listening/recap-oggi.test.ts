import { describe, expect, it } from 'vitest';
import { SocialRecapOutputSchema } from '../../../src/capability/social-listening/index.js';

const topic = (over: Record<string, unknown> = {}) => ({
  topicId: 't1',
  title: 'Agenti che scrivono codice',
  category: 'agenti',
  verdict: 'funziona',
  heat: 7,
  cost: { usd: 0, track: 'mac', uncertain: false },
  ...over,
});

// Shape of the 03/11 round: track mac, 10 posts seen, 0 USD, counts 6/7/0/2.
const recap = {
  verticalId: 'ai',
  day: '2026-11-03',
  track: 'mac',
  finishedAt: '2026-11-03T14:40:00+00:00',
  counts: { funziona: 6, da_provare: 7, non_funziona: 0, fuffa: 2 },
  postsSeen: 10,
  spentUsd: 0,
  topics: [topic()],
};

const ok = (v: unknown) => SocialRecapOutputSchema.safeParse(v).success;
const withTopic = (over: Record<string, unknown>) => ({ ...recap, topics: [topic(over)] });
const fuffa = { reason: 'Promette senza mostrare il prodotto', postLink: 'https://www.instagram.com/reel/abc/' };

describe('s9819 recap-oggi', () => {
  it('(a) accepts post and creator counts with the first creators', () => {
    expect(ok(withTopic({ postCount: 3, creatorCount: 4, creators: ['alassafi.ai', 'simorizzo_ai', 'michelecottiai'] }))).toBe(true);
  });

  it('(b) accepts the fuffa reason with the post link on a fuffa topic', () => {
    expect(ok(withTopic({ verdict: 'fuffa', fuffa }))).toBe(true);
  });

  it('(c) accepts post verdicts up to postsSeen only', () => {
    const postVerdicts = { funziona: 2, da_provare: 6, non_funziona: 0, fuffa: 2 };
    expect(ok({ ...recap, postVerdicts })).toBe(true);
    expect(ok({ ...recap, postsSeen: 9, postVerdicts })).toBe(false);
  });

  it('(d) ties state and endReason', () => {
    expect(ok({ ...recap, state: 'cap_reached', spentUsd: 2 })).toBe(true);
    const endReason = { code: 'meta_credentials_missing', text: 'manca la chiave' };
    expect(ok({ ...recap, state: 'done', endReason })).toBe(false);
    expect(ok({ ...recap, state: 'failed', endReason })).toBe(true);
  });

  it.each([
    ['fuffa on a funziona topic', withTopic({ verdict: 'funziona', fuffa })],
    ['empty reason', withTopic({ verdict: 'fuffa', fuffa: { ...fuffa, reason: '' } })],
    ['201-character reason', withTopic({ verdict: 'fuffa', fuffa: { ...fuffa, reason: 'a'.repeat(201) } })],
    ['non-http postLink', withTopic({ verdict: 'fuffa', fuffa: { ...fuffa, postLink: 'ftp://x.test/a' } })],
    ['postCount 0', withTopic({ postCount: 0 })],
    ['4 creators', withTopic({ creators: ['a', 'b', 'c', 'd'] })],
    ['creators longer than creatorCount', withTopic({ creators: ['a', 'b'], creatorCount: 1 })],
    ['state running', { ...recap, state: 'running' }],
    ['extra key', withTopic({ extra: 1 })],
  ])('(e) rejects %s', (_n, value) => {
    expect(ok(value)).toBe(false);
  });

  it('(f) keeps legacy recaps valid, including the 02/11 and 03/11 production shapes', () => {
    expect(ok(recap)).toBe(true);
    const legacy = {
      ...recap,
      postsSeen: 22,
      topics: Array.from({ length: 15 }, (_, i) => topic({ topicId: `t${i}` })),
    };
    expect(ok(legacy)).toBe(true);
    expect(SocialRecapOutputSchema.parse(legacy)).toEqual(legacy);
    expect(ok({ ...legacy, day: '2026-11-02', finishedAt: '2026-11-02T14:40:00+00:00' })).toBe(true);
  });
});
