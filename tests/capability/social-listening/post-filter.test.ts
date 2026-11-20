import { describe, expect, it } from 'vitest';
import {
  SocialPostFilterSchema,
  SocialPostSchema,
  socialPostFilterFromResult,
  type SocialPostFilter,
} from '../../../src/capability/social-listening/index';

const identity = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'x9' };
const timestamp = '2026-11-17T10:30:00+01:00';
const filteredAt = '2026-11-18T07:10:00+01:00';
const post = {
  identity,
  postId: 'p1',
  provider: 'instagram',
  handle: 'alassafi.ai',
  link: 'https://example.com/post/1',
  publishedAt: timestamp,
  kind: 'video',
  caption: 'A caption',
  collectedAt: timestamp,
};

describe('post filter outcome', () => {
  it('(a) accepts a post with a filter outcome and keeps the field', () => {
    const filter: SocialPostFilter = { keep: false, reason: 'pubblicità', filteredAt };
    const parsed = SocialPostSchema.parse({ ...post, filter });
    expect(parsed.filter).toEqual(filter);
  });

  it('(b) accepts a post saved without the filter field (shape of the MVP import)', () => {
    const parsed = SocialPostSchema.parse(post);
    expect(parsed.filter).toBeUndefined();
  });

  it('(c) rejects an extra field, empty or too long reason, and a missing filteredAt', () => {
    const bad = [
      { keep: true, filteredAt, agentId: 'x9' },
      { keep: true, reason: '', filteredAt },
      { keep: true, reason: 'r'.repeat(301), filteredAt },
      { keep: true },
    ];
    for (const filter of bad) {
      expect(SocialPostFilterSchema.safeParse(filter).success).toBe(false);
      expect(SocialPostSchema.safeParse({ ...post, filter }).success).toBe(false);
    }
    expect(SocialPostFilterSchema.safeParse({ keep: true, reason: 'r'.repeat(300), filteredAt }).success).toBe(true);
  });

  it('(d) builds the filter from a filter result, without reason when missing', () => {
    const at = '2026-11-18T07:10:00Z';
    const out = socialPostFilterFromResult({ kind: 'filter', postId: 'p1', keep: true }, at);
    expect(out).toEqual({ keep: true, filteredAt: at });
    expect('reason' in out).toBe(false);
    const withReason = socialPostFilterFromResult({ kind: 'filter', postId: 'p1', keep: false, reason: 'spam' }, at);
    expect(withReason).toEqual({ keep: false, reason: 'spam', filteredAt: at });
  });

  it('(e) throws not_a_filter_result for another result kind', () => {
    expect(() =>
      socialPostFilterFromResult(
        { kind: 'transcribe', postId: 'p1', transcript: 't', language: 'it', durationSec: 3 },
        filteredAt,
      ),
    ).toThrow('not_a_filter_result');
  });

  it('(f) is importable from the source sub-path barrel', async () => {
    const mod = await import('../../../src/capability/social-listening/index');
    expect(typeof mod.SocialPostFilterSchema.parse).toBe('function');
    expect(typeof mod.socialPostFilterFromResult).toBe('function');
  });
});
