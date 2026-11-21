import { describe, expect, it } from 'vitest';
import {
  SOCIAL_LISTENING_TOOLS,
  SOCIAL_SEEN_TOOLS,
  SOCIAL_SEEN_MAX,
  SocialSeenSchema,
  SocialSeenSetInputSchema,
  SocialSeenListInputSchema,
  SocialSeenSetOutputSchema,
  SocialSeenListOutputSchema,
  SocialSeenToolErrorSchema,
  SocialTopicSchema,
  decideSocialSeenSet,
  listSocialSeen,
  type SocialSeen,
  type SocialSeenSetInput,
  type SocialSeenListInput,
  type SocialSeenSetOutput,
  type SocialSeenListOutput,
  type SocialSeenToolError,
} from '../../../src/capability/social-listening/index';

const scope = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'x9' };
const otherScopes = [
  { ...scope, tenantId: 'tenant-2' },
  { ...scope, ownerId: 'owner-2' },
  { ...scope, agentId: 'another-agent' },
];
const at = '2026-11-03T20:30:00Z';
const row = (topicId: string, seenAt = at, identity = scope): SocialSeen => ({ identity, topicId, seenAt });

// Fifteen topics reconstructed in the shape of the 03/11 import; no live data is read.
const topics = Array.from({ length: 15 }, (_, i) => SocialTopicSchema.parse({
  identity: scope,
  topicId: `cluster-${i + 1}`,
  verticalId: i === 14 ? 'fitness' : 'ai',
  day: '2026-11-03',
  title: `Topic ${i + 1}`,
  category: 'coding',
  summary: 'Reusable local skills.',
  verdict: 'da_provare',
  facts: [{ text: 'Skills can be installed locally.', sourceUrls: ['https://example.com/post/1'] }],
  sources: [{ url: 'https://example.com/post/1', opened: true }],
  heat: 7.6,
  postIds: ['p1', 'p2', 'p3'],
  creators: ['creator.one', 'creator.two', 'creator.three'],
  cost: { usd: 0, track: 'mac', uncertain: true },
  computedAt: '2026-11-03T20:29:03.000Z',
}));

describe('s9821 seen', () => {
  it('exports separate fixed tool names and leaves the seven existing tools intact', () => {
    expect(SOCIAL_SEEN_TOOLS).toEqual({ set: 'social_seen_set', list: 'social_seen_list' });
    expect(Object.values(SOCIAL_LISTENING_TOOLS)).toHaveLength(7);
    for (const name of Object.values(SOCIAL_SEEN_TOOLS)) {
      expect(Object.values(SOCIAL_LISTENING_TOOLS)).not.toContain(name);
    }
    expect(SOCIAL_SEEN_MAX).toBe(500);
  });

  it('accepts boolean inputs and rejects invalid IDs, identity and extra keys', () => {
    const input: SocialSeenSetInput = { topicId: 'cluster-1', seen: true };
    expect(SocialSeenSetInputSchema.safeParse(input).success).toBe(true);
    expect(SocialSeenSetInputSchema.safeParse({ ...input, seen: false }).success).toBe(true);
    for (const invalid of [
      { ...input, seen: 'si' }, { ...input, topicId: '' },
      { ...input, topicId: 'x'.repeat(101) }, { topicId: input.topicId },
      { ...input, identity: scope }, { ...input, agentId: scope.agentId },
    ]) expect(SocialSeenSetInputSchema.safeParse(invalid).success).toBe(false);
    const query: SocialSeenListInput = { verticalId: 'ai' };
    expect(SocialSeenListInputSchema.safeParse(query).success).toBe(true);
    expect(SocialSeenListInputSchema.safeParse({}).success).toBe(true);
    expect(SocialSeenListInputSchema.safeParse({ verticalId: '' }).success).toBe(false);
    expect(SocialSeenListInputSchema.safeParse({ identity: scope }).success).toBe(false);
  });

  it('requires a strict archive row with complete identity and a timestamp', () => {
    expect(SocialSeenSchema.safeParse(row('cluster-1')).success).toBe(true);
    for (const invalid of [
      { topicId: 'cluster-1', seenAt: at },
      { ...row('cluster-1'), identity: { ...scope, ownerId: '' } },
      { ...row('cluster-1'), seenAt: 'yesterday' },
      { ...row('cluster-1'), extra: true },
    ]) expect(SocialSeenSchema.safeParse(invalid).success).toBe(false);
  });

  it('joins the fifteen topics, drops orphans and sorts newest first then by ID', () => {
    expect(topics).toHaveLength(15);
    const out: SocialSeenListOutput = listSocialSeen([
      row('cluster-2'), row('cluster-1'),
      row('cluster-3', '2026-11-03T21:00:00Z'), row('missing'),
    ], topics, { scope });
    expect(out).toEqual({ topicIds: ['cluster-3', 'cluster-1', 'cluster-2'] });
    expect(SocialSeenListOutputSchema.safeParse(out).success).toBe(true);
  });

  it.each(otherScopes)('rejects foreign rows and foreign topic joins for scope %j', foreign => {
    const ownTopic = topics[0]!;
    // Colliding IDs must not allow either side of the join to cross the scope.
    expect(listSocialSeen([row(ownTopic.topicId, at, foreign)], topics, { scope }))
      .toEqual({ topicIds: [] });
    expect(listSocialSeen([row(ownTopic.topicId)], [{ ...ownTopic, identity: foreign }], { scope }))
      .toEqual({ topicIds: [] });
    expect(listSocialSeen([row(ownTopic.topicId)], [ownTopic, { ...ownTopic, identity: foreign }], { scope }))
      .toEqual({ topicIds: [ownTopic.topicId] });
  });

  it('filters joined topics by vertical', () => {
    const rows = topics.map(t => row(t.topicId));
    expect(listSocialSeen(rows, topics, { scope, verticalId: 'fitness' }))
      .toEqual({ topicIds: ['cluster-15'] });
    expect(listSocialSeen(rows, topics, { scope, verticalId: 'missing' }))
      .toEqual({ topicIds: [] });
  });

  it('decides insert, delete and idempotent noops', () => {
    expect(decideSocialSeenSet([], scope, 'cluster-1', true)).toEqual({ ok: true, action: 'insert' });
    expect(decideSocialSeenSet([row('cluster-1')], scope, 'cluster-1', true)).toEqual({ ok: true, action: 'noop' });
    expect(decideSocialSeenSet([row('cluster-1')], scope, 'cluster-1', false)).toEqual({ ok: true, action: 'delete' });
    expect(decideSocialSeenSet([], scope, 'cluster-1', false)).toEqual({ ok: true, action: 'noop' });
    for (const foreign of otherScopes) {
      expect(decideSocialSeenSet([row('cluster-1', at, foreign)], scope, 'cluster-1', true))
        .toEqual({ ok: true, action: 'insert' });
      expect(decideSocialSeenSet([row('cluster-1', at, foreign)], scope, 'cluster-1', false))
        .toEqual({ ok: true, action: 'noop' });
    }
  });

  it('counts only the scope at the 500-row limit and allows noops and removals', () => {
    const mine = Array.from({ length: 500 }, (_, i) => row(`t${i}`));
    const foreign = Array.from({ length: 10 }, (_, i) => row(`foreign-${i}`, at, otherScopes[i % 3]!));
    expect(decideSocialSeenSet([...mine, ...foreign.slice(0, 3)], scope, 'new', true))
      .toEqual({ ok: false, error: 'seen_limit_reached' });
    expect(decideSocialSeenSet([...mine.slice(0, 499), ...foreign], scope, 'new', true))
      .toEqual({ ok: true, action: 'insert' });
    expect(decideSocialSeenSet(mine, scope, 't0', true)).toEqual({ ok: true, action: 'noop' });
    expect(decideSocialSeenSet(mine, scope, 't0', false)).toEqual({ ok: true, action: 'delete' });
    expect(decideSocialSeenSet(mine, scope, 'missing', false)).toEqual({ ok: true, action: 'noop' });
  });

  it('caps lists and validates strict outputs and the exact error vocabulary', () => {
    const output: SocialSeenSetOutput = { topicId: 'cluster-1', seen: false };
    expect(SocialSeenSetOutputSchema.safeParse(output).success).toBe(true);
    expect(SocialSeenSetOutputSchema.safeParse({ ...output, seen: true }).success).toBe(true);
    expect(SocialSeenSetOutputSchema.safeParse({ ...output, identity: scope }).success).toBe(false);
    expect(SocialSeenSetOutputSchema.safeParse({ ...output, topicId: '' }).success).toBe(false);
    expect(SocialSeenSetOutputSchema.safeParse({ ...output, seen: 'si' }).success).toBe(false);
    const ids = Array.from({ length: 501 }, (_, i) => `t${i}`);
    expect(SocialSeenListOutputSchema.safeParse({ topicIds: [] }).success).toBe(true);
    expect(SocialSeenListOutputSchema.safeParse({ topicIds: ids.slice(0, 500) }).success).toBe(true);
    expect(SocialSeenListOutputSchema.safeParse({ topicIds: ids }).success).toBe(false);
    expect(SocialSeenListOutputSchema.safeParse({ topicIds: [''] }).success).toBe(false);
    expect(SocialSeenListOutputSchema.safeParse({ topicIds: [], identity: scope }).success).toBe(false);
    const errors: SocialSeenToolError[] = ['invalid_request', 'not_configured', 'unknown_topic', 'seen_limit_reached'];
    expect(SocialSeenToolErrorSchema.options).toEqual(errors);
  });

  it('bounds the pure list output to 500 rows', () => {
    const manyTopics = Array.from({ length: 501 }, (_, i) => ({ ...topics[0]!, topicId: `t${i}` }));
    const result = listSocialSeen(manyTopics.map(t => row(t.topicId)), manyTopics, { scope });
    expect(result.topicIds).toHaveLength(500);
    expect(SocialSeenListOutputSchema.safeParse(result).success).toBe(true);
  });
});
