import { describe, expect, it } from 'vitest';
import {
  SocialCreatorRankSchema,
  SocialCreatorsRankInputSchema,
  SocialCreatorsRankOutputSchema,
  SocialTopicSchema,
  rankSocialCreators,
  type SocialTopic,
} from '../../../src/capability/social-listening/index';

const scope = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'x9' };
const toDay = '2026-11-03';

function topic(over: Partial<SocialTopic> = {}): SocialTopic {
  return SocialTopicSchema.parse({
    identity: scope,
    topicId: 'topic-1',
    verticalId: 'ai',
    day: toDay,
    title: 'A tested AI workflow',
    category: 'tools',
    summary: 'A workflow backed by an analyzed source post.',
    verdict: 'funziona',
    facts: [{ text: 'The source demonstrates the workflow.', sourceUrls: ['https://example.com/post'] }],
    sources: [],
    heat: 6,
    postIds: ['post-1'],
    creators: ['alassafi.ai'],
    cost: { usd: 0, track: 'mac', uncertain: false },
    computedAt: '2026-11-03T14:31:00+00:00',
    ...over,
  });
}

// Reconstructed from the task's November 3 constraints, not an archive snapshot:
// 15 production-shaped topics, five creators, alassafi.ai first at 87.5.
const novemberRows: { handle: string; verdict: SocialTopic['verdict']; heat: number }[] = [
  { handle: 'alassafi.ai', verdict: 'funziona', heat: 1 },
  { handle: 'alassafi.ai', verdict: 'funziona', heat: 1 },
  { handle: 'alassafi.ai', verdict: 'funziona', heat: 1 },
  { handle: 'alassafi.ai', verdict: 'da_provare', heat: 1 },
  { handle: 'davi.d_roberts', verdict: 'funziona', heat: 9 },
  { handle: 'davi.d_roberts', verdict: 'da_provare', heat: 9 },
  { handle: 'davi.d_roberts', verdict: 'da_provare', heat: 9 },
  { handle: 'davi.d_roberts', verdict: 'da_provare', heat: 9 },
  { handle: 'third.creator', verdict: 'funziona', heat: 5 },
  { handle: 'third.creator', verdict: 'da_provare', heat: 5 },
  { handle: 'third.creator', verdict: 'fuffa', heat: 5 },
  { handle: 'fourth.creator', verdict: 'da_provare', heat: 7 },
  { handle: 'fourth.creator', verdict: 'non_funziona', heat: 7 },
  { handle: 'fifth.creator', verdict: 'fuffa', heat: 10 },
  { handle: 'fifth.creator', verdict: 'fuffa', heat: 10 },
];

describe('s9820 creators-heat', () => {
  it('s9820 (a) divides topic heat and rounds only the final sum', () => {
    const out = rankSocialCreators([
      topic({ creators: ['a', 'b'], heat: 6 }),
      topic({ creators: ['a', 'c', 'd'], heat: 7.6 }),
      topic({ creators: ['a', 'c', 'd'], heat: 7.6 }),
    ], { scope, toDay });
    expect(out.creators.map(c => [c.handle, c.heatScore])).toEqual([
      ['a', 8.1], ['c', 5.1], ['d', 5.1], ['b', 3],
    ]);
    expect(rankSocialCreators([
      topic({ creators: ['a', 'b', 'c'], heat: 7.6 }),
    ], { scope, toDay }).creators.map(c => c.heatScore)).toEqual([2.5, 2.5, 2.5]);
  });

  it('s9820 (b) preserves the default ranking for 15 November 3 topics', () => {
    const topics = novemberRows.map((row, i) => topic({
      topicId: `topic-${i}`, postIds: [`post-${i}`],
      creators: [row.handle], verdict: row.verdict, heat: row.heat,
    }));
    const legacyCreators = [
      { handle: 'alassafi.ai', topics: 4, counts: { funziona: 3, da_provare: 1, non_funziona: 0, fuffa: 0 }, truthScore: 87.5, lastDay: toDay },
      { handle: 'davi.d_roberts', topics: 4, counts: { funziona: 1, da_provare: 3, non_funziona: 0, fuffa: 0 }, truthScore: 62.5, lastDay: toDay },
      { handle: 'third.creator', topics: 3, counts: { funziona: 1, da_provare: 1, non_funziona: 0, fuffa: 1 }, truthScore: 50, lastDay: toDay },
      { handle: 'fourth.creator', topics: 2, counts: { funziona: 0, da_provare: 1, non_funziona: 1, fuffa: 0 }, truthScore: 25, lastDay: toDay },
      { handle: 'fifth.creator', topics: 2, counts: { funziona: 0, da_provare: 0, non_funziona: 0, fuffa: 2 }, truthScore: 0, lastDay: toDay },
    ];
    const legacy = { fromDay: '2026-10-05', toDay, creators: legacyCreators };
    expect(topics).toHaveLength(15);
    const out = rankSocialCreators(topics, { scope, toDay });
    expect(out).toEqual({
      ...legacy,
      creators: legacyCreators.map((c, i) => ({ ...c, heatScore: [4, 36, 15, 14, 20][i], postsAnalyzed: 0 })),
    });
    expect(JSON.stringify({
      ...out,
      creators: out.creators.map(({ heatScore, postsAnalyzed, ...creator }) => {
        expect(heatScore).toBeGreaterThanOrEqual(0);
        expect(postsAnalyzed).toBe(0);
        return creator;
      }),
    })).toBe(JSON.stringify(legacy));
    expect(rankSocialCreators(topics, { scope, toDay, orderBy: 'truth' })).toEqual(out);
  });

  it('s9820 (b2) preserves existing score, topic-count and handle tie-breaks', () => {
    const out = rankSocialCreators([
      topic({ creators: ['a'], verdict: 'funziona' }),
      topic({ creators: ['a'], verdict: 'fuffa' }),
      topic({ creators: ['b'], verdict: 'funziona' }),
      topic({ creators: ['c'], verdict: 'da_provare' }),
    ], { scope, toDay });
    expect(out.creators.map(c => [c.handle, c.truthScore, c.topics])).toEqual([
      ['b', 100, 1], ['a', 50, 2], ['c', 50, 1],
    ]);
    expect(rankSocialCreators([
      topic({ creators: ['c'], verdict: 'da_provare' }),
      topic({ creators: ['z'], verdict: 'da_provare' }),
      topic({ creators: ['z'], verdict: 'da_provare' }),
    ], { scope, toDay }).creators.map(c => c.handle)).toEqual(['z', 'c']);
  });

  it('s9820 (c) orders by heat, truth and handle without a topic-count tie-break', () => {
    const out = rankSocialCreators([
      topic({ creators: ['hottest'], heat: 9, verdict: 'fuffa' }),
      topic({ creators: ['z'], heat: 6 }),
      topic({ creators: ['a'], heat: 6 }),
      topic({ creators: ['b'], heat: 3 }),
      topic({ creators: ['b'], heat: 3 }),
      topic({ creators: ['low-truth'], heat: 6, verdict: 'da_provare' }),
    ], { scope, toDay, orderBy: 'heat' });
    expect(out.creators.map(c => c.handle)).toEqual(['hottest', 'a', 'b', 'z', 'low-truth']);
  });

  it('s9820 (d) counts distinct topic post IDs belonging to the creator', () => {
    const topics = [
      topic({ creators: ['a', 'b'], postIds: ['a1', 'b1', 'missing'] }),
      topic({ creators: ['a'], postIds: ['a1', 'a2', 'b2'] }),
    ];
    const out = rankSocialCreators(topics, { scope, toDay, posts: [
      { postId: 'a1', handle: 'a' }, { postId: 'a1', handle: 'a' },
      { postId: 'a2', handle: 'a' }, { postId: 'b1', handle: 'b' },
      { postId: 'b2', handle: 'b' }, { postId: 'outside', handle: 'a' },
    ] });
    expect(out.creators.map(c => [c.handle, c.postsAnalyzed])).toEqual([['a', 2], ['b', 1]]);
    expect(rankSocialCreators(topics, { scope, toDay }).creators.map(c => c.postsAnalyzed)).toEqual([0, 0]);
  });

  it('s9820 (e) lists only idle followed profiles independently of the ranking limit', () => {
    const topics = [topic(), topic({ creators: ['other'] })];
    expect(rankSocialCreators(topics, {
      scope, toDay, followed: ['kem_glitch', 'alassafi.ai', 'kem_glitch', 'other'], limit: 1,
    }).idle).toEqual(['kem_glitch']);
    const followed = Array.from({ length: 120 }, (_, i) => `idle-${String(i).padStart(3, '0')}`);
    const out = rankSocialCreators([], { scope, toDay, followed: [...followed].reverse().concat(followed), limit: 1 });
    expect(out.idle).toEqual(followed.slice(0, 100));
    expect(SocialCreatorsRankOutputSchema.safeParse(out).success).toBe(true);
    expect(rankSocialCreators(topics, { scope, toDay })).not.toHaveProperty('idle');
    expect(rankSocialCreators(topics, { scope, toDay, followed: [] }).idle).toEqual([]);
  });

  it('s9820 (f) excludes other agents from heat, posts and active followed profiles', () => {
    const out = rankSocialCreators([
      topic({ creators: ['alassafi.ai'], heat: 2, postIds: ['own'] }),
      topic({ identity: { ...scope, agentId: 'other' }, creators: ['alassafi.ai', 'kem_glitch'], heat: 10, postIds: ['foreign'] }),
    ], { scope, toDay, followed: ['kem_glitch', 'alassafi.ai'], posts: [
      { postId: 'own', handle: 'alassafi.ai' }, { postId: 'foreign', handle: 'alassafi.ai' },
    ] });
    expect(out.creators).toEqual([expect.objectContaining({ handle: 'alassafi.ai', heatScore: 2, postsAnalyzed: 1, topics: 1 })]);
    expect(out.idle).toEqual(['kem_glitch']);
  });

  it('s9820 filters heat and idle by the same vertical and inclusive day window', () => {
    const out = rankSocialCreators([
      topic({ creators: ['first'], day: '2026-10-28', heat: 2 }),
      topic({ creators: ['old'], day: '2026-10-27' }),
      topic({ creators: ['future'], day: '2026-11-04' }),
      topic({ creators: ['food'], verticalId: 'food' }),
      topic({ creators: ['last'], heat: 3 }),
    ], { scope, toDay, days: 7, verticalId: 'ai', followed: ['first', 'old', 'future', 'food', 'last'] });
    expect(out.creators.map(c => [c.handle, c.heatScore])).toEqual([['first', 2], ['last', 3]]);
    expect(out.idle).toEqual(['food', 'future', 'old']);
  });

  it('s9820 handles empty creator lists without division by zero', () => {
    expect(rankSocialCreators([{ ...topic(), creators: [] }], { scope, toDay }).creators).toEqual([]);
  });

  it('s9820 (g) accepts legacy output and optional fields with strict bounds', () => {
    const creator = {
      handle: 'alassafi.ai', topics: 1,
      counts: { funziona: 1, da_provare: 0, non_funziona: 0, fuffa: 0 },
      truthScore: 100, lastDay: toDay,
    };
    const legacy = { fromDay: toDay, toDay, creators: [creator] };
    expect(SocialCreatorsRankOutputSchema.parse(legacy)).toEqual(legacy);
    expect(SocialCreatorRankSchema.parse({ ...creator, heatScore: 2.5, postsAnalyzed: 0 })).toEqual({ ...creator, heatScore: 2.5, postsAnalyzed: 0 });
    expect(SocialCreatorRankSchema.safeParse({ ...creator, heatScore: -0.1 }).success).toBe(false);
    expect(SocialCreatorRankSchema.safeParse({ ...creator, postsAnalyzed: -1 }).success).toBe(false);
    expect(SocialCreatorRankSchema.safeParse({ ...creator, postsAnalyzed: 1.5 }).success).toBe(false);
    expect(SocialCreatorsRankOutputSchema.safeParse({ ...legacy, idle: Array.from({ length: 101 }, (_, i) => `creator-${i}`) }).success).toBe(false);
    expect(SocialCreatorsRankOutputSchema.safeParse({ ...legacy, idle: ['@bad'] }).success).toBe(false);
    expect(SocialCreatorsRankInputSchema.parse({ orderBy: 'heat' })).toEqual({ orderBy: 'heat' });
    expect(SocialCreatorsRankInputSchema.parse({ orderBy: 'truth' })).toEqual({ orderBy: 'truth' });
    expect(SocialCreatorsRankInputSchema.parse({})).toEqual({});
    expect(SocialCreatorsRankInputSchema.safeParse({ orderBy: 'x' }).success).toBe(false);
    expect(SocialCreatorsRankInputSchema.safeParse({ extra: true }).success).toBe(false);
    expect(SocialCreatorsRankOutputSchema.safeParse({ ...legacy, extra: true }).success).toBe(false);
    expect(SocialCreatorRankSchema.safeParse({ ...creator, extra: true }).success).toBe(false);
  });
});
