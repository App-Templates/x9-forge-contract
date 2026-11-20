import { Buffer } from 'node:buffer';
import { describe, expect, it } from 'vitest';
import { DEV_GENERIC_INPUT_MAX_BYTES } from '../../../src/capability/dev/generic-job.js';
import {
  SOCIAL_JOB_TRANSCRIPT_EXCERPT_MAX,
  SocialJobInputSchema,
  SocialJobPostMaterialSchema,
  SocialJobSchema,
  SocialPostSchema,
  socialFilterJobInput,
  socialGenericJobFor,
  socialPostExcerpt,
} from '../../../src/capability/social-listening/index.js';

const identity = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'x9' };
const timestamp = '2026-11-19T07:00:00+01:00';
const post = SocialPostSchema.parse({
  identity, postId: 'p1', provider: 'instagram', handle: 'autore',
  link: 'https://example.com/posts/p1', publishedAt: timestamp,
  kind: 'video', caption: 'A new coding tool.', collectedAt: timestamp,
});
const material = { handle: post.handle, kind: post.kind, caption: post.caption };

describe('filter job post material', () => {
  it('(a) includes the caption without inventing a transcript', () => {
    const input = socialFilterJobInput(post);
    expect(input).toEqual({ kind: 'filter', postId: post.postId, material });
    expect(input).toEqual(SocialJobInputSchema.parse(input));
    if (input.kind !== 'filter') throw new Error('Expected filter input');
    expect(input.material).not.toHaveProperty('transcriptExcerpt');
  });

  it('(b) excerpts ASCII and whole Unicode code points', () => {
    expect(SOCIAL_JOB_TRANSCRIPT_EXCERPT_MAX).toBe(12000);
    const input = socialFilterJobInput(SocialPostSchema.parse({ ...post, transcript: 'a'.repeat(20000) }));
    expect(input).toEqual({
      kind: 'filter', postId: post.postId,
      material: { ...material, transcriptExcerpt: 'a'.repeat(12000) },
    });
    expect(socialPostExcerpt('a😀b', 2)).toBe('a😀');
    expect(socialPostExcerpt('a😀b', 10)).toBe('a😀b');
    expect(socialPostExcerpt('a😀b', 0)).toBe('');
  });

  it('(c) fits emoji material in the generic job UTF-8 budget and round trip', () => {
    const emojiPost = SocialPostSchema.parse({
      ...post, caption: '😀'.repeat(2500), transcript: '😀'.repeat(30000),
    });
    const input = socialFilterJobInput(emojiPost);
    expect(Buffer.byteLength(JSON.stringify(input), 'utf8')).toBeLessThanOrEqual(DEV_GENERIC_INPUT_MAX_BYTES);
    expect(input.kind).toBe('filter');
    if (input.kind !== 'filter') throw new Error('Expected filter input');
    expect(input.material).toEqual({
      handle: post.handle, kind: post.kind, caption: emojiPost.caption,
      transcriptExcerpt: '😀'.repeat(3000),
    });
    const queued = SocialJobSchema.parse({
      identity, jobId: '123e4567-e89b-42d3-a456-426614174000',
      kind: 'filter', state: 'queued', track: 'mac', day: '2026-11-19',
      verticalId: 'ai', postId: post.postId, attempts: 0,
      createdAt: timestamp, updatedAt: timestamp,
    });
    const result = socialGenericJobFor(queued, input, { configVersion: 4, createdAt: timestamp });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);
    expect(result.job.input).toEqual(input);
    expect(result.job.scope).toEqual(identity);
  });

  it('(d) accepts saved references and rejects extra material fields and identity', () => {
    const saved = { kind: 'filter', postId: post.postId };
    expect(SocialJobInputSchema.parse(saved)).toEqual(saved);
    expect(SocialJobPostMaterialSchema.parse(material)).toEqual(material);
    for (const extra of [{ extra: 'untrusted text' }, { identity }]) {
      expect(SocialJobPostMaterialSchema.safeParse({ ...material, ...extra }).success).toBe(false);
      expect(SocialJobInputSchema.safeParse({
        ...saved, material: { ...material, ...extra },
      }).success).toBe(false);
    }
  });

  it('(e) copies no post identity into the executor input', () => {
    const input = socialFilterJobInput(SocialPostSchema.parse({ ...post, transcript: 'A short demo.' }));
    const serialized = JSON.stringify(input);
    for (const value of Object.values(identity)) expect(serialized).not.toContain(value);
    expect(input).not.toHaveProperty('identity');
    expect(input).toEqual({
      kind: 'filter', postId: post.postId,
      material: { ...material, transcriptExcerpt: 'A short demo.' },
    });
  });

  it('reuses caption validation and bounds transcript material', () => {
    expect(SocialJobPostMaterialSchema.shape.caption).toBe(SocialPostSchema.shape.caption);
    expect(SocialJobPostMaterialSchema.safeParse({
      ...material, transcriptExcerpt: 'a'.repeat(12000),
    }).success).toBe(true);
    for (const patch of [
      { handle: '@autore' }, { kind: 'unknown' }, { caption: 'c'.repeat(5001) },
      { transcriptExcerpt: 'a'.repeat(12001) },
    ]) expect(SocialJobPostMaterialSchema.safeParse({ ...material, ...patch }).success).toBe(false);
  });

  it('also respects the UTF-16 schema bound when emoji fit the byte budget', () => {
    const input = socialFilterJobInput(SocialPostSchema.parse({ ...post, transcript: '😀'.repeat(8000) }));
    expect(SocialJobInputSchema.parse(input)).toEqual(input);
    expect(input).toEqual({
      kind: 'filter', postId: post.postId,
      material: { ...material, transcriptExcerpt: '😀'.repeat(4000) },
    });
  });

  it('counts JSON escaping in the byte budget and preserves the caption', () => {
    const escapedPost = SocialPostSchema.parse({
      ...post, caption: '\u0000'.repeat(5000), transcript: '\u0000'.repeat(20000),
    });
    const input = socialFilterJobInput(escapedPost);
    expect(Buffer.byteLength(JSON.stringify(input), 'utf8')).toBeLessThanOrEqual(DEV_GENERIC_INPUT_MAX_BYTES);
    expect(input).toEqual({
      kind: 'filter', postId: post.postId,
      material: { ...material, caption: escapedPost.caption, transcriptExcerpt: '\u0000'.repeat(375) },
    });
  });
});
