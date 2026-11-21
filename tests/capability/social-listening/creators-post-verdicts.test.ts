import { describe, expect, it } from 'vitest';
import {
  SOCIAL_VERDICTS,
  SocialCreatorRankSchema,
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

// Reconstructed production-shaped data matching s9820 (b), not an archive snapshot.
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
const novemberTopics = novemberRows.map((row, i) => topic({
  topicId: `topic-${i}`, postIds: [`post-${i}`],
  creators: [row.handle], verdict: row.verdict, heat: row.heat,
}));
const zeros = { funziona: 0, da_provare: 0, non_funziona: 0, fuffa: 0 };

describe('s9834 creators-post-verdicts', () => {
  it('s9834 (a) counts own post verdicts and leaves unanalyzed posts uncounted', () => {
    const out = rankSocialCreators(novemberTopics, { scope, toDay, posts: [
      { postId: 'post-0', handle: 'alassafi.ai', verdict: 'funziona' },
      { postId: 'post-1', handle: 'alassafi.ai', verdict: 'funziona' },
      { postId: 'post-2', handle: 'alassafi.ai', verdict: 'fuffa' },
      { postId: 'post-3', handle: 'alassafi.ai' },
      { postId: 'outside', handle: 'alassafi.ai', verdict: 'non_funziona' },
    ] });
    const creator = out.creators[0]!;
    expect(creator.handle).toBe('alassafi.ai');
    expect(creator.postVerdicts).toEqual({ ...zeros, funziona: 2, fuffa: 1 });
    expect(creator.postsAnalyzed).toBe(4);
    expect(Object.values(creator.postVerdicts!).reduce((sum, count) => sum + count, 0)).toBe(3);
    expect(creator.counts).toEqual({ ...zeros, funziona: 3, da_provare: 1 });
    expect(creator.truthScore).toBe(87.5);
    for (const row of out.creators) {
      expect(Object.values(row.postVerdicts!).reduce((sum, count) => sum + count, 0)).toBeLessThanOrEqual(row.postsAnalyzed!);
    }
  });

  it('s9834 (b) preserves the entire s9820 output without posts', () => {
    const expected = {
      fromDay: '2026-10-05', toDay,
      creators: [
        { handle: 'alassafi.ai', topics: 4, counts: { funziona: 3, da_provare: 1, non_funziona: 0, fuffa: 0 }, truthScore: 87.5, lastDay: toDay, heatScore: 4, postsAnalyzed: 0 },
        { handle: 'davi.d_roberts', topics: 4, counts: { funziona: 1, da_provare: 3, non_funziona: 0, fuffa: 0 }, truthScore: 62.5, lastDay: toDay, heatScore: 36, postsAnalyzed: 0 },
        { handle: 'third.creator', topics: 3, counts: { funziona: 1, da_provare: 1, non_funziona: 0, fuffa: 1 }, truthScore: 50, lastDay: toDay, heatScore: 15, postsAnalyzed: 0 },
        { handle: 'fourth.creator', topics: 2, counts: { funziona: 0, da_provare: 1, non_funziona: 1, fuffa: 0 }, truthScore: 25, lastDay: toDay, heatScore: 14, postsAnalyzed: 0 },
        { handle: 'fifth.creator', topics: 2, counts: { funziona: 0, da_provare: 0, non_funziona: 0, fuffa: 2 }, truthScore: 0, lastDay: toDay, heatScore: 20, postsAnalyzed: 0 },
      ],
    };
    expect(novemberTopics).toHaveLength(15);
    const out = rankSocialCreators(novemberTopics, { scope, toDay });
    expect(out).toEqual(expected);
    expect(JSON.stringify(out)).toBe(JSON.stringify(expected));
    for (const creator of out.creators) expect(creator).not.toHaveProperty('postVerdicts');
    expect(rankSocialCreators(novemberTopics, { scope, toDay, orderBy: 'truth' })).toEqual(out);
  });

  it('s9834 (c) deduplicates post IDs across topics and post rows', () => {
    const out = rankSocialCreators([
      topic({ postIds: ['shared', 'shared'] }),
      topic({ topicId: 'topic-2', postIds: ['shared'] }),
    ], { scope, toDay, posts: [
      { postId: 'shared', handle: 'alassafi.ai', verdict: 'fuffa' },
      { postId: 'shared', handle: 'alassafi.ai', verdict: 'fuffa' },
    ] });
    expect(out.creators[0]!.postVerdicts).toEqual({ ...zeros, fuffa: 1 });
    expect(out.creators[0]!.postsAnalyzed).toBe(1);
  });

  it('s9834 (d) attributes posts only to their own handle within shared topics', () => {
    const out = rankSocialCreators([topic({
      creators: ['alassafi.ai', 'davi.d_roberts'], postIds: ['own', 'other'],
    })], { scope, toDay, posts: [
      { postId: 'own', handle: 'alassafi.ai', verdict: 'funziona' },
      { postId: 'other', handle: 'davi.d_roberts', verdict: 'fuffa' },
    ] });
    expect(out.creators.map(c => [c.handle, c.postsAnalyzed, c.postVerdicts])).toEqual([
      ['alassafi.ai', 1, { ...zeros, funziona: 1 }],
      ['davi.d_roberts', 1, { ...zeros, fuffa: 1 }],
    ]);
  });

  it('s9834 (e) excludes foreign agent topics from counts and creator membership', () => {
    const out = rankSocialCreators([
      topic({ postIds: ['own'] }),
      topic({ identity: { ...scope, agentId: 'other' }, creators: ['alassafi.ai', 'foreign.creator'], postIds: ['foreign'] }),
    ], { scope, toDay, followed: ['alassafi.ai', 'foreign.creator'], posts: [
      { postId: 'own', handle: 'alassafi.ai', verdict: 'da_provare' },
      { postId: 'foreign', handle: 'alassafi.ai', verdict: 'fuffa' },
      { postId: 'foreign', handle: 'foreign.creator', verdict: 'fuffa' },
    ] });
    expect(out.creators).toEqual([expect.objectContaining({
      handle: 'alassafi.ai', topics: 1, postsAnalyzed: 1,
      postVerdicts: { ...zeros, da_provare: 1 }, heatScore: 6,
    })]);
    expect(out.idle).toEqual(['foreign.creator']);
  });

  it('s9834 (f) accepts old and new output while rejecting invalid post counts', () => {
    const old = rankSocialCreators(novemberTopics, { scope, toDay });
    expect(SocialCreatorsRankOutputSchema.parse(old)).toEqual(old);
    const output = {
      ...old, creators: [{ ...old.creators[0]!, postsAnalyzed: 4, postVerdicts: { ...zeros, funziona: 2, fuffa: 1 } }],
    };
    expect(SocialCreatorsRankOutputSchema.parse(output)).toEqual(output);
    const invalidCounts = [
      { ...zeros, extra: 0 }, { ...zeros, funziona: -1 }, { ...zeros, funziona: 1.5 },
      { funziona: 0, da_provare: 0, fuffa: 0 },
    ];
    for (const postVerdicts of invalidCounts) {
      expect(SocialCreatorsRankOutputSchema.safeParse({
        ...output, creators: [{ ...output.creators[0]!, postVerdicts }],
      }).success).toBe(false);
    }
  });

  it('s9834 (g) derives every post verdict key from SOCIAL_VERDICTS', () => {
    expect(Object.keys(SocialCreatorRankSchema.shape.postVerdicts.unwrap().shape)).toEqual([...SOCIAL_VERDICTS]);
    const out = rankSocialCreators([topic({ postIds: SOCIAL_VERDICTS.map(v => `post-${v}`) })], {
      scope, toDay, posts: SOCIAL_VERDICTS.map(verdict => ({ postId: `post-${verdict}`, handle: 'alassafi.ai', verdict })),
    });
    expect(Object.keys(out.creators[0]!.postVerdicts!)).toEqual([...SOCIAL_VERDICTS]);
    expect(Object.values(out.creators[0]!.postVerdicts!)).toEqual([1, 1, 1, 1]);
    expect(rankSocialCreators([topic()], { scope, toDay, posts: [] }).creators[0]!.postVerdicts).toEqual(zeros);
  });
});
