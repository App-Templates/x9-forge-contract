import { describe, expect, it } from 'vitest';
import {
  SOCIAL_META_MEDIA_FIELDS,
  SocialMetaMediaSchema,
  socialMetaBusinessDiscoveryFields,
  socialPostFromMetaMedia,
} from '../../../src/capability/social-listening/import.js';
import { SocialPostSchema } from '../../../src/capability/social-listening/post.js';

const context = { handle: 'alassafi.ai', collectedAt: '2026-11-19T08:00:00+00:00' };
const media = {
  id: '18120247597964526',
  caption: 'A demonstration of a tool.',
  media_type: 'VIDEO',
  media_product_type: 'REELS',
  media_url: 'https://cdn.example.com/video.mp4',
  permalink: 'https://www.instagram.com/reel/DfAE1wJTJGF/',
  timestamp: '2026-11-19T07:12:33+0000',
  like_count: 12,
  comments_count: 3,
};
const invalid = { ok: false, error: 'invalid_media' };

describe('Meta media collection', () => {
  it('(a) preserves the Meta media id used by the Mac', () => {
    const result = socialPostFromMetaMedia(media, context);
    expect(result).toEqual({
      ok: true,
      post: {
        postId: media.id,
        provider: 'instagram',
        handle: context.handle,
        link: media.permalink,
        publishedAt: '2026-11-19T07:12:33+00:00',
        kind: 'video',
        caption: media.caption,
        collectedAt: context.collectedAt,
      },
      videoUrl: media.media_url,
    });
    if (!result.ok) throw new Error(result.error);
    expect(SocialPostSchema.omit({ identity: true }).strict().safeParse(result.post).success).toBe(true);
    expect(result.post).not.toHaveProperty('identity');
  });

  it('(b) reuses legacy offset normalization and refuses a missing timezone', () => {
    const result = socialPostFromMetaMedia(media, context);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.post.publishedAt).toBe('2026-11-19T07:12:33+00:00');
    expect(socialPostFromMetaMedia({ ...media, timestamp: '2026-11-19T07:12:33' }, context)).toEqual(invalid);
    expect(socialPostFromMetaMedia({ ...media, timestamp: '2026-02-30T07:12:33+0000' }, context)).toEqual(invalid);
  });

  it('(c) maps images and carousels without a video URL and defaults the caption', () => {
    const { caption: _caption, ...withoutCaption } = media;
    for (const [mediaType, kind] of [['IMAGE', 'image'], ['CAROUSEL_ALBUM', 'carousel']] as const) {
      const result = socialPostFromMetaMedia({ ...withoutCaption, media_type: mediaType }, context);
      expect(result.ok).toBe(true);
      if (!result.ok) throw new Error(result.error);
      expect(result.post.kind).toBe(kind);
      expect(result.post.caption).toBe('');
      expect(result).not.toHaveProperty('videoUrl');
    }
  });

  it('(c) keeps a video without a file available for caption analysis', () => {
    const { media_url: _url, ...withoutFile } = media;
    const result = socialPostFromMetaMedia(withoutFile, context);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.post.caption).toBe(media.caption);
    expect(result).not.toHaveProperty('videoUrl');
  });

  it('(d) rejects unknown fields, nonnumeric ids and unsafe permalinks', () => {
    for (const patch of [{ username: context.handle }, { id: 'DfAE1wJTJGF' }, { permalink: 'javascript:alert(1)' }]) {
      expect(socialPostFromMetaMedia({ ...media, ...patch }, context)).toEqual(invalid);
    }
  });

  it('(d) converts throwing accessors and invalid inputs into invalid_media', () => {
    const throwing = {
      ...media,
      get caption(): string { throw new Error('untrusted accessor'); },
    };
    for (const raw of [throwing, null, undefined, [], 'media']) {
      expect(socialPostFromMetaMedia(raw, context)).toEqual(invalid);
    }
  });

  it('(d) validates the caller handle and collection timestamp at the post boundary', () => {
    expect(socialPostFromMetaMedia(media, { ...context, handle: 'a){x}' })).toEqual(invalid);
    expect(socialPostFromMetaMedia(media, { ...context, collectedAt: 'invalid' })).toEqual(invalid);
    expect(socialPostFromMetaMedia(media, {
      ...context,
      get handle(): string { throw new Error('untrusted context'); },
    })).toEqual(invalid);
  });

  it('(d) enforces Meta field bounds and metric types', () => {
    expect(SocialMetaMediaSchema.safeParse(media).success).toBe(true);
    for (const patch of [
      { id: '' }, { id: '1'.repeat(31) }, { caption: 'c'.repeat(5001) },
      { media_type: 'REEL' }, { media_product_type: '' }, { media_product_type: 'r'.repeat(31) },
      { media_url: 'file:///video.mp4' }, { like_count: -1 }, { like_count: 1.5 },
      { comments_count: -1 }, { comments_count: 1.5 },
    ]) {
      expect(SocialMetaMediaSchema.safeParse({ ...media, ...patch }).success).toBe(false);
      expect(socialPostFromMetaMedia({ ...media, ...patch }, context)).toEqual(invalid);
    }
    const minimal = { id: '1'.repeat(30), media_type: 'IMAGE', permalink: media.permalink, timestamp: media.timestamp };
    expect(SocialMetaMediaSchema.safeParse(minimal).success).toBe(true);
    expect(socialPostFromMetaMedia(minimal, context).ok).toBe(true);
  });

  it('(e) builds the exact business discovery selection with nine fixed fields', () => {
    expect(SOCIAL_META_MEDIA_FIELDS).toEqual([
      'id', 'caption', 'media_type', 'media_product_type', 'media_url',
      'permalink', 'timestamp', 'like_count', 'comments_count',
    ]);
    expect(socialMetaBusinessDiscoveryFields('alassafi.ai', 25)).toBe(
      'business_discovery.username(alassafi.ai){media.limit(25){id,caption,media_type,media_product_type,media_url,permalink,timestamp,like_count,comments_count}}',
    );
    for (const limit of [1, 50]) {
      expect(socialMetaBusinessDiscoveryFields(' alassafi.ai ', limit)).toContain(`username(alassafi.ai){media.limit(${limit})`);
    }
  });

  it('(e) rejects query injection and limits outside the integer range', () => {
    const calls = [
      () => socialMetaBusinessDiscoveryFields('a){x}', 25),
      ...[0, 51, 2.5, NaN, Infinity].map(limit => () => socialMetaBusinessDiscoveryFields(context.handle, limit)),
    ];
    for (const call of calls) {
      expect(call).toThrow(new TypeError('invalid_meta_query'));
    }
  });

  it('(e) never introduces access_token into queries, mapped outputs or errors', () => {
    const outputs = [
      socialMetaBusinessDiscoveryFields(context.handle, 25),
      JSON.stringify(socialPostFromMetaMedia(media, context)),
      JSON.stringify(socialPostFromMetaMedia({ ...media, access_token: 'untrusted-field' }, context)),
    ];
    try {
      socialMetaBusinessDiscoveryFields('a){access_token}', 25);
      throw new Error('expected query rejection');
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError);
      if (!(error instanceof TypeError)) throw error;
      outputs.push(error.message);
    }
    for (const output of outputs) expect(output).not.toContain('access_token');
  });
});
