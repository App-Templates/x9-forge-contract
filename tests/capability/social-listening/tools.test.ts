import { describe, it, expect } from 'vitest';
import {
  SOCIAL_LISTENING_TOOLS,
  SOCIAL_FOLLOWED_PROFILES_MAX,
  SocialListeningToolErrorSchema,
  SocialRecapInputSchema,
  SocialTopicGetInputSchema,
  SocialProfilesListInputSchema,
  SocialProfileFollowInputSchema,
  SocialProfileUnfollowInputSchema,
  SocialVerticalsListInputSchema,
  SocialVerticalSetInputSchema,
  SocialRecapOutputSchema,
  SocialTopicGetOutputSchema,
  SocialProfilesListOutputSchema,
  SocialProfileFollowOutputSchema,
  SocialProfileUnfollowOutputSchema,
  SocialVerticalsListOutputSchema,
  SocialVerticalSetOutputSchema,
} from '../../../src/capability/social-listening/index';
import { capToolCallPath } from '../../../src/http/index';
import { ToolCallErrorResponseSchema } from '../../../src/capability/index';

const identity = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'x9' };
const url = 'https://example.com/post/1';

const vertical = {
  id: 'ai',
  label: 'AI',
  description: 'Novità sull’intelligenza artificiale',
  categories: [
    { slug: 'coding', label: 'Coding' },
    { slug: 'video', label: 'Video' },
  ],
};
const profile = { provider: 'instagram', handle: 'alassafi.ai', verticalId: 'ai', addedAt: '2026-10-27T14:31:00+00:00' };
const topicNoIdentity = {
  topicId: 'cluster-1',
  verticalId: 'ai',
  day: '2026-11-03',
  title: 'Skill di Claude Code e Claude',
  category: 'coding',
  summary: 'Le skill di Claude Code per design, scrittura e montaggio.',
  verdict: 'da_provare',
  facts: [{ text: 'Le skill si installano da una cartella.', sourceUrls: [url] }],
  sources: [{ url, title: 'Post', opened: true }],
  heat: 7.6,
  postIds: ['p1', 'p2'],
  creators: ['alassafi.ai', 'davi.d_roberts'],
  cost: { usd: 0, track: 'mac', uncertain: false },
  computedAt: '2026-11-03T14:31:00+00:00',
};
const summary = (i: number, verdict = 'funziona') => ({
  topicId: `cluster-${i}`,
  title: `Argomento ${i}`,
  category: 'coding',
  verdict,
  heat: 5,
  cost: { usd: 0, track: 'mac', uncertain: false },
});
const recap = {
  verticalId: 'ai',
  day: '2026-11-03',
  track: 'mac',
  finishedAt: '2026-11-03T14:40:00+00:00',
  counts: { funziona: 2, da_provare: 6, non_funziona: 0, fuffa: 2 },
  postsSeen: 10,
  spentUsd: 0,
  topics: [summary(1), summary(2, 'fuffa')],
};

describe('social-listening tools', () => {
  it('(a) names are the declared ones, distinct, and routed by capToolCallPath', () => {
    expect(SOCIAL_LISTENING_TOOLS).toEqual({
      recap: 'social_recap',
      topicGet: 'social_topic_get',
      profilesList: 'social_profiles_list',
      profileFollow: 'social_profile_follow',
      profileUnfollow: 'social_profile_unfollow',
      verticalsList: 'social_verticals_list',
      verticalSet: 'social_vertical_set',
    });
    const names = Object.values(SOCIAL_LISTENING_TOOLS);
    expect(new Set(names).size).toBe(7);
    for (const n of names) expect(capToolCallPath(n)).toContain(n);
  });

  it('(b) every input rejects tenantId, ownerId and agentId', () => {
    const inputs: Array<[{ safeParse: (v: unknown) => { success: boolean } }, Record<string, unknown>]> = [
      [SocialRecapInputSchema, {}],
      [SocialTopicGetInputSchema, { topicId: 'cluster-1' }],
      [SocialProfilesListInputSchema, {}],
      [SocialProfileFollowInputSchema, { provider: 'instagram', handle: 'a.b', verticalId: 'ai' }],
      [SocialProfileUnfollowInputSchema, { provider: 'instagram', handle: 'a.b' }],
      [SocialVerticalsListInputSchema, {}],
      [SocialVerticalSetInputSchema, vertical],
    ];
    for (const [schema, ok] of inputs) {
      expect(schema.safeParse(ok).success).toBe(true);
      for (const key of ['tenantId', 'ownerId', 'agentId']) {
        expect(schema.safeParse({ ...ok, [key]: 'x' }).success).toBe(false);
      }
    }
  });

  it('(c) recap input: empty and valid day pass, impossible day fails', () => {
    expect(SocialRecapInputSchema.safeParse({}).success).toBe(true);
    expect(SocialRecapInputSchema.safeParse({ day: '2026-11-17' }).success).toBe(true);
    expect(SocialRecapInputSchema.safeParse({ day: '2026-02-30' }).success).toBe(false);
  });

  it('(d) recap output: real MVP-shaped round passes; missing count key or 51 topics fail', () => {
    expect(SocialRecapOutputSchema.safeParse(recap).success).toBe(true);
    expect(SocialRecapOutputSchema.safeParse({ ...recap, finishedAt: null }).success).toBe(true);
    const { fuffa: _f, ...counts } = recap.counts;
    expect(SocialRecapOutputSchema.safeParse({ ...recap, counts }).success).toBe(false);
    const many = Array.from({ length: 51 }, (_, i) => summary(i));
    expect(SocialRecapOutputSchema.safeParse({ ...recap, topics: many }).success).toBe(false);
    expect(SocialRecapOutputSchema.safeParse({ ...recap, topics: many.slice(0, 50) }).success).toBe(true);
    expect(SocialRecapOutputSchema.safeParse({ ...recap, postsSeen: -1 }).success).toBe(false);
  });

  it('(e) topic output has no identity', () => {
    expect(SocialTopicGetOutputSchema.safeParse(topicNoIdentity).success).toBe(true);
    expect(SocialTopicGetOutputSchema.safeParse({ ...topicNoIdentity, identity }).success).toBe(false);
  });

  it('(f) follow rejects unknown provider and handle with @', () => {
    const ok = { provider: 'instagram', handle: 'alassafi.ai', verticalId: 'ai' };
    expect(SocialProfileFollowInputSchema.safeParse(ok).success).toBe(true);
    expect(SocialProfileFollowInputSchema.safeParse({ ...ok, provider: 'tiktok' }).success).toBe(false);
    expect(SocialProfileFollowInputSchema.safeParse({ ...ok, handle: '@alassafi.ai' }).success).toBe(false);
    expect(SocialProfileUnfollowInputSchema.safeParse({ provider: 'tiktok', handle: 'a' }).success).toBe(false);
  });

  it('(g) error codes are the seven declared and valid tool-call error texts', () => {
    expect(SocialListeningToolErrorSchema.options).toEqual([
      'invalid_request',
      'not_configured',
      'unknown_vertical',
      'unknown_topic',
      'profile_already_followed',
      'profile_not_found',
      'profile_limit_reached',
    ]);
    for (const error of SocialListeningToolErrorSchema.options) {
      expect(ToolCallErrorResponseSchema.safeParse({ callId: 'c1', status: 'error', error, code: 'TOOL_EXEC_FAILED' }).success).toBe(true);
    }
    expect(SOCIAL_FOLLOWED_PROFILES_MAX).toBe(100);
  });

  it('(h) vertical set rejects duplicate category slugs', () => {
    const dup = { ...vertical, categories: [{ slug: 'coding', label: 'A' }, { slug: 'coding', label: 'B' }] };
    expect(SocialVerticalSetInputSchema.safeParse(dup).success).toBe(false);
  });

  it('other outputs: profiles, follow, unfollow, verticals, vertical set', () => {
    expect(SocialProfilesListOutputSchema.safeParse({ profiles: [profile] }).success).toBe(true);
    expect(SocialProfilesListOutputSchema.safeParse({ profiles: Array.from({ length: 101 }, () => profile) }).success).toBe(false);
    expect(SocialProfileFollowOutputSchema.safeParse({ profile }).success).toBe(true);
    expect(SocialProfileUnfollowOutputSchema.safeParse({ profile }).success).toBe(true);
    expect(SocialProfileUnfollowOutputSchema.safeParse({}).success).toBe(false);
    expect(SocialVerticalsListOutputSchema.safeParse({ verticals: [vertical] }).success).toBe(true);
    expect(SocialVerticalsListOutputSchema.safeParse({ verticals: Array.from({ length: 21 }, () => vertical) }).success).toBe(false);
    expect(SocialVerticalSetOutputSchema.safeParse({ vertical }).success).toBe(true);
  });
});
