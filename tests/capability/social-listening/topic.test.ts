import { describe, it, expect } from 'vitest';
import {
  SocialTopicSchema,
  SocialTopicFactSchema,
  SocialPostSchema,
  SocialVerticalSchema,
  SocialFollowedProfileSchema,
  SOCIAL_VERDICT_TRUTH_SCORE,
  socialCategoryInVertical,
} from '../../../src/capability/social-listening/index';
import { ResearchFindingSchema } from '../../../src/capability/ricerca/index';

const identity = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'x9' };
const url = 'https://example.com/post/1';

const topic = {
  identity,
  topicId: 'cluster-1',
  verticalId: 'ai',
  day: '2026-10-27',
  title: 'Skill di Claude Code e Claude',
  category: 'coding',
  summary: 'Le skill di Claude Code per design, scrittura e montaggio.',
  verdict: 'da_provare',
  facts: [{ text: 'Le skill si installano da una cartella.', sourceUrls: [url] }],
  sources: [{ url, title: 'Post', opened: true }],
  heat: 7.6,
  postIds: ['p1', 'p2', 'p3'],
  creators: ['alassafi.ai', 'davi.d_roberts', 'third_one'],
  cost: { usd: 0, track: 'mac', uncertain: false },
  computedAt: '2026-10-27T14:31:00+00:00',
};

const post = {
  identity,
  postId: 'p1',
  provider: 'instagram',
  handle: 'alassafi.ai',
  link: url,
  publishedAt: '2026-10-27T14:31:00+00:00',
  kind: 'video',
  caption: '',
  collectedAt: '2026-10-27T15:00:00+00:00',
};

describe('social-listening topic', () => {
  it('(a) accepts a full topic', () => {
    expect(SocialTopicSchema.safeParse(topic).success).toBe(true);
  });

  it('(b) title 31 ok, 32 rejected', () => {
    expect(SocialTopicSchema.safeParse({ ...topic, title: 'a'.repeat(31) }).success).toBe(true);
    expect(SocialTopicSchema.safeParse({ ...topic, title: 'a'.repeat(32) }).success).toBe(false);
  });

  it('(c) identity fields required, extra fields rejected', () => {
    for (const k of ['tenantId', 'ownerId', 'agentId'] as const) {
      const { [k]: _omit, ...rest } = identity;
      expect(SocialTopicSchema.safeParse({ ...topic, identity: rest }).success).toBe(false);
      expect(SocialPostSchema.safeParse({ ...post, identity: rest }).success).toBe(false);
    }
    expect(SocialTopicSchema.safeParse({ ...topic, extra: 1 }).success).toBe(false);
  });

  it('(d) old MVP verdicts rejected, new four accepted', () => {
    expect(SocialTopicSchema.safeParse({ ...topic, verdict: 'funzionale' }).success).toBe(false);
    for (const verdict of ['funziona', 'da_provare', 'non_funziona', 'fuffa']) {
      expect(SocialTopicSchema.safeParse({ ...topic, verdict }).success).toBe(true);
    }
  });

  it('(e) fact needs a safe source', () => {
    const bad = (f: object) => SocialTopicSchema.safeParse({ ...topic, facts: [f] }).success;
    expect(bad({ text: 'x', sourceUrls: [] })).toBe(false);
    expect(bad({ text: 'x' })).toBe(false);
    expect(bad({ text: 'x', sourceUrls: ['file:///etc/passwd'] })).toBe(false);
    expect(bad({ text: 'x', sourceUrls: ['javascript:alert(1)'] })).toBe(false);
  });

  it('(f) funziona/da_provare need facts; fuffa does not', () => {
    expect(SocialTopicSchema.safeParse({ ...topic, verdict: 'funziona', facts: [] }).success).toBe(false);
    expect(SocialTopicSchema.safeParse({ ...topic, verdict: 'da_provare', facts: [] }).success).toBe(false);
    expect(SocialTopicSchema.safeParse({ ...topic, verdict: 'fuffa', facts: [] }).success).toBe(true);
  });

  it('(g) heat within 0..10', () => {
    expect(SocialTopicSchema.safeParse({ ...topic, heat: 10.1 }).success).toBe(false);
    expect(SocialTopicSchema.safeParse({ ...topic, heat: -1 }).success).toBe(false);
    expect(SocialTopicSchema.safeParse({ ...topic, heat: 10 }).success).toBe(true);
  });

  it('(h) post provider, kind and handle', () => {
    expect(SocialPostSchema.safeParse(post).success).toBe(true);
    expect(SocialPostSchema.safeParse({ ...post, provider: 'tiktok' }).success).toBe(false);
    expect(SocialPostSchema.safeParse({ ...post, kind: 'story' }).success).toBe(false);
    expect(SocialPostSchema.safeParse({ ...post, handle: 'a b' }).success).toBe(false);
    expect(SocialPostSchema.safeParse({ ...post, handle: '@ab' }).success).toBe(false);
    expect(SocialFollowedProfileSchema.safeParse({
      provider: 'instagram', handle: 'davi.d_roberts', verticalId: 'ai', addedAt: '2026-10-27T14:31:00+00:00',
    }).success).toBe(true);
  });

  it('(i) vertical categories', () => {
    const v = { id: 'ai', label: 'AI', description: '', categories: [{ slug: 'coding', label: 'Coding' }, { slug: 'design', label: 'Design' }] };
    expect(SocialVerticalSchema.safeParse(v).success).toBe(true);
    expect(SocialVerticalSchema.safeParse({ ...v, categories: [v.categories[0], v.categories[0]] }).success).toBe(false);
    expect(SocialVerticalSchema.safeParse({ ...v, categories: [] }).success).toBe(false);
    const parsed = SocialVerticalSchema.parse(v);
    expect(socialCategoryInVertical(parsed, 'coding')).toBe(true);
    expect(socialCategoryInVertical(parsed, 'cooking')).toBe(false);
  });

  it('(j) truth score', () => {
    expect(SOCIAL_VERDICT_TRUTH_SCORE).toEqual({ funziona: 100, da_provare: 50, non_funziona: 0, fuffa: 0 });
  });

  it('(k) fact schema is research finding minus origin', () => {
    const f = { text: 'x', sourceUrls: [url] };
    expect(SocialTopicFactSchema.safeParse(f).success).toBe(true);
    expect(SocialTopicFactSchema.safeParse({ ...f, origin: 'web' }).success).toBe(false);
    expect(ResearchFindingSchema.safeParse({ ...f, origin: 'web' }).success).toBe(true);
  });
});
