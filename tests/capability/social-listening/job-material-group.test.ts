import { Buffer } from 'node:buffer';
import { describe, expect, it } from 'vitest';
import { DEV_GENERIC_INPUT_MAX_BYTES } from '../../../src/capability/dev/generic-job.js';
import {
  SOCIAL_GROUP_EXCERPT_MAX,
  SocialJobGroupPostSchema,
  SocialJobInputSchema,
  SocialJobSchema,
  SocialPostSchema,
  socialGenericJobFor,
  socialGroupJobInput,
} from '../../../src/capability/social-listening/index.js';

const identity = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'x9' };
const timestamp = '2026-11-19T07:00:00+01:00';
const verticalId = 'ai';
const categories = ['modelli', 'strumenti'];
const mk = (postId: string, extra: Record<string, unknown> = {}) => SocialPostSchema.parse({
  identity, postId, provider: 'instagram', handle: 'autore',
  link: `https://example.com/posts/${postId}`, publishedAt: timestamp,
  kind: 'video', caption: 'A caption.', collectedAt: timestamp, ...extra,
});

describe('group job post material', () => {
  it('(a) excerpts from the transcript, then the caption, else (no text)', () => {
    const input = socialGroupJobInput({
      verticalId, categories,
      posts: [
        mk('p1', { caption: 'caption one', transcript: 'transcript one' }),
        mk('p2', { caption: 'caption two' }),
        mk('p3', { caption: '' }),
      ],
    });
    expect(input).toEqual({
      kind: 'group', verticalId, categories, postIds: ['p1', 'p2', 'p3'],
      posts: [
        { postId: 'p1', handle: 'autore', excerpt: 'transcript one' },
        { postId: 'p2', handle: 'autore', excerpt: 'caption two' },
        { postId: 'p3', handle: 'autore', excerpt: '(no text)' },
      ],
    });
    expect(SOCIAL_GROUP_EXCERPT_MAX).toBe(240);
    const long = socialGroupJobInput({ verticalId, categories, posts: [mk('p1', { transcript: 'a'.repeat(1000) })] });
    if (long.kind !== 'group') throw new Error('Expected group input');
    expect(long.posts?.[0]?.excerpt).toBe('a'.repeat(240));
  });

  it('(b) keeps the received order in posts and postIds', () => {
    const input = socialGroupJobInput({
      verticalId, categories, posts: ['p9', 'p1', 'p5'].map((id) => mk(id)),
    });
    if (input.kind !== 'group') throw new Error('Expected group input');
    expect(input.postIds).toEqual(['p9', 'p1', 'p5']);
    expect(input.posts?.map((p) => p.postId)).toEqual(['p9', 'p1', 'p5']);
  });

  it('(c) shrinks every excerpt together to fit the generic job budget', () => {
    const posts = Array.from({ length: 100 }, (_, i) => mk(`post-${i}`, { caption: '😀'.repeat(2500) }));
    const input = socialGroupJobInput({ verticalId, categories, posts });
    expect(Buffer.byteLength(JSON.stringify(input), 'utf8')).toBeLessThanOrEqual(DEV_GENERIC_INPUT_MAX_BYTES);
    if (input.kind !== 'group') throw new Error('Expected group input');
    const lengths = new Set(input.posts?.map((p) => Array.from(p.excerpt).length));
    expect(lengths.size).toBe(1);
    expect([...lengths][0]).toBeLessThan(240);
    const queued = SocialJobSchema.parse({
      identity, jobId: '123e4567-e89b-42d3-a456-426614174000',
      kind: 'group', state: 'queued', track: 'mac', day: '2026-11-19',
      verticalId, attempts: 0, createdAt: timestamp, updatedAt: timestamp,
    });
    const result = socialGenericJobFor(queued, input, { configVersion: 4, createdAt: timestamp });
    expect(result.ok).toBe(true);
  });

  it('(c2) fails when even the smallest excerpts do not fit', () => {
    const posts = Array.from({ length: 100 }, (_, i) => mk(`${'x'.repeat(90)}${i}`.slice(0, 100), {
      handle: 'h'.repeat(30), caption: '😀'.repeat(300),
    }));
    expect(() => socialGroupJobInput({ verticalId, categories, posts })).toThrow('group_input_too_large');
  });

  it('(d) saved group jobs without posts stay valid; extra fields and empty posts are rejected', () => {
    const saved = { kind: 'group', verticalId, postIds: ['p1'], categories };
    expect(SocialJobInputSchema.parse(saved)).toEqual(saved);
    const entry = { postId: 'p1', handle: 'autore', excerpt: 'text' };
    expect(SocialJobGroupPostSchema.parse(entry)).toEqual(entry);
    expect(SocialJobInputSchema.safeParse({ ...saved, posts: [{ ...entry, extra: 1 }] }).success).toBe(false);
    expect(SocialJobInputSchema.safeParse({ ...saved, posts: [] }).success).toBe(false);
    expect(SocialJobInputSchema.safeParse({ ...saved, posts: [entry] }).success).toBe(true);
  });

  it('(e) rejects no posts and copies no identity', () => {
    expect(() => socialGroupJobInput({ verticalId, categories, posts: [] })).toThrow('no_posts');
    const input = socialGroupJobInput({ verticalId, categories, posts: [mk('p1')] });
    const serialized = JSON.stringify(input);
    for (const value of Object.values(identity)) expect(serialized).not.toContain(value);
  });
});
