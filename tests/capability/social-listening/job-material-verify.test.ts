import { Buffer } from 'node:buffer';
import { describe, expect, it } from 'vitest';
import { DEV_GENERIC_INPUT_MAX_BYTES } from '../../../src/capability/dev/generic-job.js';
import {
  SOCIAL_VERIFY_EXCERPT_MAX,
  SOCIAL_VERIFY_POSTS_MAX,
  SocialFactSchema,
  SocialJobInputSchema,
  SocialJobSchema,
  SocialJobVerifyMaterialSchema,
  SocialPostSchema,
  socialGenericJobFor,
  socialVerifyJobInput,
} from '../../../src/capability/social-listening/index.js';

const identity = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'x9' };
const timestamp = '2026-11-19T07:00:00+01:00';
const topic = {
  topicId: 't1', title: 'New model release', category: 'modelli',
  summary: 'A model release and its capabilities.', postIds: ['p3', 'p1'],
};
const mk = (postId: string, extra: Record<string, unknown> = {}) => SocialPostSchema.parse({
  identity, postId, provider: 'instagram', handle: 'autore',
  link: `https://example.com/posts/${postId}`, publishedAt: timestamp,
  kind: 'video', caption: `Caption ${postId}`, collectedAt: timestamp, ...extra,
});

describe('verify job topic material', () => {
  it('(a) follows topic post order and includes title, category and summary', () => {
    const input = socialVerifyJobInput({
      topic, posts: [mk('p1'), mk('p2'), mk('p3', { transcript: 'Transcript p3' })],
    });
    expect(input).toEqual({
      kind: 'verify', topicId: topic.topicId,
      material: {
        title: topic.title, category: topic.category, summary: topic.summary,
        posts: [
          { postId: 'p3', handle: 'autore', excerpt: 'Transcript p3' },
          { postId: 'p1', handle: 'autore', excerpt: 'Caption p1' },
        ],
      },
    });
    expect(SOCIAL_VERIFY_EXCERPT_MAX).toBe(1500);
    expect(SOCIAL_VERIFY_POSTS_MAX).toBe(10);
    expect(SocialJobInputSchema.parse(input)).toEqual(input);
  });

  it('(b) excludes unrelated posts, caps matched posts and rejects missing topic posts', () => {
    const posts = Array.from({ length: 12 }, (_, i) => mk(`p${i}`));
    const input = socialVerifyJobInput({
      topic: { ...topic, postIds: ['missing', ...posts.map(p => p.postId).reverse()] }, posts,
    });
    if (input.kind !== 'verify') throw new Error('Expected verify input');
    expect(input.material?.posts.map(p => p.postId)).toEqual(
      posts.map(p => p.postId).reverse().slice(0, 10),
    );
    const selected = socialVerifyJobInput({ topic, posts: [mk('p1'), mk('p2'), mk('p3')] });
    if (selected.kind !== 'verify') throw new Error('Expected verify input');
    expect(selected.material?.posts.map(p => p.postId)).not.toContain('p2');
    expect(() => socialVerifyJobInput({ topic, posts: [mk('p2')] }))
      .toThrow(new TypeError('no_topic_posts'));
  });

  it('(c) shrinks all excerpts within the byte budget while preserving all 20 facts', () => {
    const posts = Array.from({ length: 10 }, (_, i) => mk(`p${i}`, { transcript: '😀'.repeat(30000) }));
    const knownFacts = Array.from({ length: 20 }, (_, i) => SocialFactSchema.parse({
      text: `Verified fact ${i}`, sourceUrls: [`https://example.com/facts/${i}`],
    }));
    const input = socialVerifyJobInput({ topic: { ...topic, postIds: posts.map(p => p.postId) }, posts, knownFacts });
    expect(Buffer.byteLength(JSON.stringify(input), 'utf8')).toBeLessThanOrEqual(DEV_GENERIC_INPUT_MAX_BYTES);
    if (input.kind !== 'verify') throw new Error('Expected verify input');
    expect(input.knownFacts).toEqual(knownFacts);
    expect(input.knownFacts).toHaveLength(20);
    expect(input.material?.posts.map(p => p.excerpt)).toEqual(Array(10).fill('😀'.repeat(750)));
    const queued = SocialJobSchema.parse({
      identity, jobId: '123e4567-e89b-42d3-a456-426614174000',
      kind: 'verify', verticalId: 'ai', topicId: topic.topicId, state: 'queued', track: 'mac', day: '2026-11-19',
      attempts: 0, createdAt: timestamp, updatedAt: timestamp,
    });
    expect(socialGenericJobFor(queued, input, { configVersion: 4, createdAt: timestamp }).ok).toBe(true);
  });

  it('(c2) rejects an input when preserved facts alone exceed the byte budget', () => {
    const knownFacts = Array.from({ length: 20 }, () => SocialFactSchema.parse({
      text: 'Verified fact', sourceUrls: Array(20).fill(`https://example.com/${'x'.repeat(100)}`),
    }));
    expect(() => socialVerifyJobInput({ topic, posts: [mk('p1')], knownFacts }))
      .toThrow(new TypeError('verify_input_too_large'));
  });

  it('(d) accepts saved jobs without material and rejects empty or non-strict material', () => {
    const saved = { kind: 'verify', topicId: topic.topicId };
    expect(SocialJobInputSchema.parse(saved)).toEqual(saved);
    const entry = { postId: 'p1', handle: 'autore', excerpt: 'Text' };
    const material = { title: topic.title, category: topic.category, summary: topic.summary, posts: [entry] };
    expect(SocialJobVerifyMaterialSchema.parse(material)).toEqual(material);
    for (const invalid of [
      { ...material, posts: [] }, { ...material, extra: 1 },
      { ...material, posts: [{ ...entry, extra: 1 }] },
      { ...material, posts: Array(11).fill(entry) },
      { ...material, posts: [{ ...entry, excerpt: 'x'.repeat(1501) }] },
    ]) {
      expect(SocialJobInputSchema.safeParse({ ...saved, material: invalid }).success).toBe(false);
    }
  });

  it('(e) copies no identity into the input JSON', () => {
    const input = socialVerifyJobInput({ topic: { ...topic, ...identity }, posts: [mk('p1')] });
    const serialized = JSON.stringify(input);
    for (const value of Object.values(identity)) expect(serialized).not.toContain(value);
  });

  it('(f) bounds text and falls back from empty transcripts to captions and no text', () => {
    const input = socialVerifyJobInput({
      topic: { ...topic, postIds: ['p1', 'p2', 'p3'] },
      posts: [
        mk('p1', { transcript: 'a'.repeat(3000) }),
        mk('p2', { transcript: '', caption: 'Caption fallback' }),
        mk('p3', { transcript: '', caption: '' }),
      ],
    });
    if (input.kind !== 'verify') throw new Error('Expected verify input');
    expect(input.material?.posts.map(p => p.excerpt))
      .toEqual(['a'.repeat(1500), 'Caption fallback', '(no text)']);
    const unicode = socialVerifyJobInput({ topic, posts: [mk('p1', { transcript: '😀'.repeat(1500) })] });
    expect(SocialJobInputSchema.parse(unicode)).toEqual(unicode);
  });
});
