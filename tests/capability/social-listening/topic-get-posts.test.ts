import { describe, expect, it } from 'vitest';
import {
  SocialTopicGetOutputSchema,
  SocialTopicPostSchema,
  type SocialTopicPost,
} from '../../../src/capability/social-listening/index';

const url = 'https://example.com/post/1';

// Shape of the first topic of 03/11: heat 7.6, three posts, three creators.
const topic = {
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
  postIds: ['p1', 'p2', 'p3'],
  creators: ['alassafi.ai', 'davi.d_roberts', 'terzo.creator'],
  cost: { usd: 0, track: 'mac', uncertain: false },
  computedAt: '2026-11-03T14:31:00+00:00',
};

const post = (postId: string, over: Record<string, unknown> = {}) => ({
  postId,
  handle: 'alassafi.ai',
  link: `https://www.instagram.com/reel/${postId}/`,
  verdict: 'funziona',
  reason: 'Mostra un flusso che si riproduce in pochi minuti.',
  tools: [],
  ...over,
});

const withPosts = (posts: unknown[]) => ({ ...topic, posts });

describe('s9818 topic-get-posts', () => {
  it('(a) accepts posts with and without tools and returns them unchanged', () => {
    const posts = [
      post('p1', { tools: [{ name: 'Designeer', link: 'https://designeer.example/', whatItDoes: 'genera interfacce' }] }),
      post('p2', { verdict: 'fuffa', tools: [] }),
    ];
    const parsed = SocialTopicGetOutputSchema.parse(withPosts(posts));
    expect(parsed.posts).toEqual(posts);
  });

  it('(b) a topic without posts passes as before', () => {
    const parsed = SocialTopicGetOutputSchema.parse(topic);
    expect(parsed.posts).toBeUndefined();
  });

  it('(c) a tool without link passes', () => {
    const posts = [post('p1', { tools: [{ name: 'StoryScope', whatItDoes: 'analizza storie' }] })];
    expect(SocialTopicGetOutputSchema.safeParse(withPosts(posts)).success).toBe(true);
  });

  it('(d) rejects malformed posts', () => {
    const bad: unknown[][] = [
      [post('p1', { reason: '' })],
      [post('p1', { reason: 'x'.repeat(2001) })],
      [post('p1', { link: 'ftp://example.com/x' })],
      [post('p1', { verdict: 'forse' })],
      [post('p1', { extra: 1 })],
    ];
    for (const posts of bad) {
      expect(SocialTopicGetOutputSchema.safeParse(withPosts(posts)).success).toBe(false);
    }
    const many = Array.from({ length: 101 }, (_, i) => post(`p${i}`));
    const big = { ...topic, postIds: many.map((p) => p.postId), posts: many };
    expect(SocialTopicGetOutputSchema.safeParse(big).success).toBe(false);
    expect(SocialTopicGetOutputSchema.safeParse({ ...big, posts: many.slice(0, 100) }).success).toBe(false);
  });

  it('(d2) the reason of 2000 characters passes', () => {
    expect(SocialTopicGetOutputSchema.safeParse(withPosts([post('p1', { reason: 'x'.repeat(2000) })])).success).toBe(true);
  });

  it('(e) rejects a post outside the topic and a post listed twice', () => {
    const outside = SocialTopicGetOutputSchema.safeParse(withPosts([post('p9')]));
    expect(outside.success).toBe(false);
    if (!outside.success) expect(outside.error.issues.map((i) => i.message)).toContain('post not in topic');
    const twice = SocialTopicGetOutputSchema.safeParse(withPosts([post('p1'), post('p1')]));
    expect(twice.success).toBe(false);
    if (!twice.success) expect(twice.error.issues.map((i) => i.message)).toContain('post listed twice');
  });

  it('(f) schema and type are exported from the index', () => {
    const p: SocialTopicPost = post('p1') as SocialTopicPost;
    expect(SocialTopicPostSchema.safeParse(p).success).toBe(true);
  });

  it('keeps the fact rule on the topic', () => {
    expect(SocialTopicGetOutputSchema.safeParse({ ...withPosts([post('p1')]), facts: [] }).success).toBe(false);
  });
});
