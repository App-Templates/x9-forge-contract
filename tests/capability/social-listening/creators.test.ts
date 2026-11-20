import { describe, it, expect } from 'vitest';
import {
  SOCIAL_LISTENING_TOOLS,
  SOCIAL_CREATORS_TOOLS,
  SocialCreatorsRankInputSchema,
  SocialCreatorsRankOutputSchema,
  rankSocialCreators,
} from '../../../src/capability/social-listening/index';

const scope = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'x9' };
const toDay = '2026-11-10';

type T = Parameters<typeof rankSocialCreators>[0][number];
function topic(over: Partial<T> & { creators: string[]; verdict: T['verdict'] }): T {
  return { identity: scope, verticalId: 'ai', day: '2026-11-10', ...over } as T;
}

describe('social_creators_rank', () => {
  it('(a) tool name is fixed and distinct from the base tools', () => {
    expect(SOCIAL_CREATORS_TOOLS.rank).toBe('social_creators_rank');
    expect(Object.values(SOCIAL_LISTENING_TOOLS)).not.toContain('social_creators_rank');
  });

  it('(b) input is strict with bounded days and limit', () => {
    expect(SocialCreatorsRankInputSchema.safeParse({}).success).toBe(true);
    expect(SocialCreatorsRankInputSchema.safeParse({ days: 30, limit: 100, verticalId: 'ai' }).success).toBe(true);
    expect(SocialCreatorsRankInputSchema.safeParse({ tenantId: 't' }).success).toBe(false);
    expect(SocialCreatorsRankInputSchema.safeParse({ agentId: 'x9' }).success).toBe(false);
    expect(SocialCreatorsRankInputSchema.safeParse({ days: 31 }).success).toBe(false);
    expect(SocialCreatorsRankInputSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  const three = [
    topic({ creators: ['a'], verdict: 'funziona' }),
    topic({ creators: ['a'], verdict: 'fuffa' }),
    topic({ creators: ['b'], verdict: 'funziona' }),
    topic({ creators: ['c'], verdict: 'da_provare' }),
  ];
  // same score as `c` but more topics and a later handle: only the topics tie-break puts it before `c`
  const tieBreak = [
    topic({ creators: ['c'], verdict: 'da_provare' }),
    topic({ creators: ['z'], verdict: 'da_provare' }),
    topic({ creators: ['z'], verdict: 'da_provare' }),
  ];

  it('(c) averages verdicts and orders by score, topics, handle', () => {
    const out = rankSocialCreators(three, { scope, toDay });
    expect(out.creators.map(c => [c.handle, c.truthScore, c.topics])).toEqual([['b', 100, 1], ['a', 50, 2], ['c', 50, 1]]);
    expect(out.creators[1]!.counts).toEqual({ funziona: 1, da_provare: 0, non_funziona: 0, fuffa: 1 });
    expect(out.creators[1]!.lastDay).toBe('2026-11-10');
  });

  it('(c2) equal score: more topics first, then handle', () => {
    const out = rankSocialCreators(tieBreak, { scope, toDay });
    expect(out.creators.map(c => c.handle)).toEqual(['z', 'c']);
  });

  it('(d) a topic of another owner never counts', () => {
    const out = rankSocialCreators([...three, topic({ identity: { ...scope, ownerId: 'owner-2' }, creators: ['z'], verdict: 'funziona' })], { scope, toDay });
    expect(out.creators.map(c => c.handle)).not.toContain('z');
  });

  it('(e) window includes the first day, excludes the day before', () => {
    const out = rankSocialCreators([
      topic({ creators: ['in'], verdict: 'funziona', day: '2026-11-04' }),
      topic({ creators: ['out'], verdict: 'funziona', day: '2026-11-03' }),
    ], { scope, toDay, days: 7 });
    expect(out.fromDay).toBe('2026-11-04');
    expect(out.toDay).toBe(toDay);
    expect(out.creators.map(c => c.handle)).toEqual(['in']);
  });

  it('(f) a handle repeated in one topic counts once', () => {
    const out = rankSocialCreators([topic({ creators: ['a', 'a'], verdict: 'funziona' })], { scope, toDay });
    expect(out.creators[0]!.topics).toBe(1);
  });

  it('(g) limit truncates and output validates', () => {
    const out = rankSocialCreators(three, { scope, toDay, limit: 1 });
    expect(out.creators.map(c => c.handle)).toEqual(['b']);
    expect(SocialCreatorsRankOutputSchema.safeParse(out).success).toBe(true);
  });

  it('filters by vertical when given', () => {
    const out = rankSocialCreators([...three, topic({ creators: ['v'], verdict: 'funziona', verticalId: 'food' })], { scope, toDay, verticalId: 'food' });
    expect(out.creators.map(c => c.handle)).toEqual(['v']);
  });

  it('(h) output rejects score above 100 and inverted days', () => {
    const base = rankSocialCreators(three, { scope, toDay });
    expect(SocialCreatorsRankOutputSchema.safeParse({ ...base, creators: [{ ...base.creators[0], truthScore: 101 }] }).success).toBe(false);
    expect(SocialCreatorsRankOutputSchema.safeParse({ ...base, fromDay: '2026-11-11' }).success).toBe(false);
  });
});
