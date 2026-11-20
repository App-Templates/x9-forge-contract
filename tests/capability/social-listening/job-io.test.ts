import { Buffer } from 'node:buffer';
import { describe, expect, it } from 'vitest';
import {
  SOCIAL_JOB_KINDS,
  SocialJobInputSchema,
  SocialJobResultSchema,
  SocialJobSchema,
  SocialTopicSchema,
  socialJobResultMatches,
  type SocialJob,
} from '../../../src/capability/social-listening/index.js';

const identity = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'x9' };
const timestamp = '2026-11-17T07:00:00+01:00';
const post = {
  postId: 'p1', provider: 'instagram', handle: 'creator.one',
  link: 'https://example.com/posts/p1', publishedAt: timestamp,
  kind: 'video', caption: 'A tool demonstrated by its creator.', collectedAt: timestamp,
};
const topic = {
  title: 'A new coding tool', category: 'coding', summary: 'The demo shows code generation.',
  postIds: ['p1'], creators: ['creator.one'], heat: 7,
};
const inputs = [
  { kind: 'collect', verticalId: 'ai', handles: ['creator.one'] },
  { kind: 'transcribe', postId: 'p1', link: post.link },
  { kind: 'filter', postId: 'p1' },
  { kind: 'verify', topicId: 't1' },
  { kind: 'group', verticalId: 'ai', postIds: ['p1'], categories: ['coding'] },
] as const;
const results = [
  { kind: 'collect', posts: [post], hasMore: false },
  { kind: 'transcribe', postId: 'p1', transcript: 'The demo works.', language: 'en', durationSec: 12 },
  { kind: 'filter', postId: 'p1', keep: true, reason: 'Relevant to coding.' },
  {
    kind: 'verify', topicId: 't1', verdict: 'funziona', summary: topic.summary,
    facts: [{ text: 'The demo generates code.', sourceUrls: [post.link] }],
    sources: [{ url: post.link, opened: true }],
  },
  { kind: 'group', topics: [topic] },
] as const;

function job(overrides: Partial<SocialJob> = {}): SocialJob {
  return SocialJobSchema.parse({
    identity, jobId: '123e4567-e89b-42d3-a456-426614174000',
    kind: 'transcribe', state: 'running', track: 'mac', day: '2026-11-17',
    verticalId: 'ai', postId: 'p1', attempts: 1, createdAt: timestamp, updatedAt: timestamp,
    ...overrides,
  });
}

describe('social job inputs', () => {
  it('(a) accepts one lightweight input for each existing job kind', () => {
    expect(inputs.map(input => input.kind)).toEqual(SOCIAL_JOB_KINDS);
    for (const input of inputs) expect(SocialJobInputSchema.parse(input)).toEqual(input);
  });

  it('(a) rejects missing references, oversized arrays, unknown kinds and invalid references', () => {
    const invalid = [
      { kind: 'transcribe', link: post.link },
      { ...inputs[0], handles: Array(101).fill('creator.one') },
      { ...inputs[0], handles: [] },
      { ...inputs[0], handles: ['invalid handle'] },
      { ...inputs[1], link: 'file:///reel.mp4' },
      { ...inputs[2], postId: '' },
      { ...inputs[3], topicId: '' },
      { ...inputs[4], categories: Array(31).fill('coding') },
      { ...inputs[4], categories: [] },
      { ...inputs[4], categories: ['Not a slug'] },
      { ...inputs[4], postIds: [] },
      { ...inputs[4], postIds: Array(101).fill('p1') },
      { kind: 'unknown' },
    ];
    for (const input of invalid) expect(SocialJobInputSchema.safeParse(input).success).toBe(false);
    expect(SocialJobInputSchema.safeParse({
      ...inputs[0], handles: Array(100).fill('creator.one'),
    }).success).toBe(true);
    expect(SocialJobInputSchema.safeParse({
      ...inputs[4], postIds: Array(100).fill('p1'), categories: Array(30).fill('coding'),
    }).success).toBe(true);
  });

  it('(a) rejects caller-supplied identity on all five input variants', () => {
    for (const input of inputs) {
      for (const extra of [{ identity }, { tenantId: 'other' }, { agentId: 'other' }]) {
        expect(SocialJobInputSchema.safeParse({ ...input, ...extra }).success).toBe(false);
      }
    }
  });
});

describe('social job results', () => {
  it('(b) accepts one result for each existing job kind', () => {
    expect(results.map(result => result.kind)).toEqual(SOCIAL_JOB_KINDS);
    for (const result of results) expect(SocialJobResultSchema.parse(result)).toEqual(result);
    expect(SocialJobResultSchema.safeParse({ kind: 'collect', posts: [], hasMore: true }).success).toBe(true);
    expect(SocialJobResultSchema.safeParse({ kind: 'filter', postId: 'p1', keep: false }).success).toBe(true);
  });

  it('(b) rejects identities on all results and nested posts and topics', () => {
    for (const result of results) {
      for (const extra of [{ identity }, { agentId: 'other' }, { tenantId: 'other' }]) {
        expect(SocialJobResultSchema.safeParse({ ...result, ...extra }).success).toBe(false);
      }
    }
    for (const extra of [{ identity }, { agentId: 'other' }, { tenantId: 'other' }]) {
      expect(SocialJobResultSchema.safeParse({ ...results[0], posts: [{ ...post, ...extra }] }).success).toBe(false);
      expect(SocialJobResultSchema.safeParse({ ...results[4], topics: [{ ...topic, ...extra }] }).success).toBe(false);
    }
  });

  it('(b) enforces text, language, duration and collection limits and requires hasMore', () => {
    for (const patch of [
      { transcript: '' }, { transcript: 't'.repeat(60001) }, { language: 'eng' },
      { language: 'e1' }, { durationSec: -1 }, { durationSec: 1.5 },
    ]) expect(SocialJobResultSchema.safeParse({ ...results[1], ...patch }).success).toBe(false);
    expect(SocialJobResultSchema.safeParse({
      ...results[1], transcript: 't'.repeat(60000), language: 'it', durationSec: 0,
    }).success).toBe(true);
    expect(SocialJobResultSchema.safeParse({ ...results[0], posts: Array(21).fill(post) }).success).toBe(false);
    expect(SocialJobResultSchema.safeParse({ kind: 'collect', posts: [] }).success).toBe(false);
    expect(SocialJobResultSchema.safeParse({ ...results[0], hasMore: 'yes' }).success).toBe(false);
    expect(SocialJobResultSchema.safeParse({ ...results[2], reason: '' }).success).toBe(false);
    expect(SocialJobResultSchema.safeParse({ ...results[2], reason: 'r'.repeat(301) }).success).toBe(false);
    expect(SocialJobResultSchema.safeParse({ kind: 'unknown' }).success).toBe(false);
  });

  it('(b) bounds grouped topics and their short titles', () => {
    for (const topics of [[], Array(31).fill(topic), [{ ...topic, title: 't'.repeat(32) }]]) {
      expect(SocialJobResultSchema.safeParse({ ...results[4], topics }).success).toBe(false);
    }
    expect(SocialJobResultSchema.safeParse({
      ...results[4], topics: Array(30).fill({ ...topic, title: 't'.repeat(31) }),
    }).success).toBe(true);
  });

  it('(c) fits twenty posts with 5000-character captions below 131072 UTF-8 bytes', () => {
    const result = SocialJobResultSchema.parse({
      kind: 'collect', hasMore: true,
      posts: Array.from({ length: 20 }, (_, i) => ({ ...post, postId: `p${i + 1}`, caption: 'c'.repeat(5000) })),
    });
    expect(Buffer.byteLength(JSON.stringify(result), 'utf8')).toBeLessThan(131072);
  });

  it('(e) reuses the exact topic field schemas for verification and grouping', () => {
    const verify = SocialJobResultSchema.options[3];
    const group = SocialJobResultSchema.options[4].shape.topics.element;
    for (const key of ['verdict', 'summary', 'facts', 'sources'] as const) {
      expect(verify.shape[key]).toBe(SocialTopicSchema.shape[key]);
    }
    for (const key of ['title', 'category', 'summary', 'postIds', 'creators', 'heat'] as const) {
      expect(group.shape[key]).toBe(SocialTopicSchema.shape[key]);
    }
    const summary = 's'.repeat(2001);
    expect(SocialTopicSchema.shape.summary.safeParse(summary).success).toBe(false);
    expect(SocialJobResultSchema.safeParse({ ...results[3], summary }).success).toBe(false);
    expect(SocialJobResultSchema.safeParse({ ...results[4], topics: [{ ...topic, summary }] }).success).toBe(false);
    expect(SocialTopicSchema.shape.category.safeParse('Not a slug').success).toBe(false);
    expect(SocialJobResultSchema.safeParse({
      ...results[4], topics: [{ ...topic, category: 'Not a slug' }],
    }).success).toBe(false);
  });
});

describe('socialJobResultMatches', () => {
  it('(d) accepts a running job and matching result for each kind', () => {
    for (const raw of results) {
      const result = SocialJobResultSchema.parse(raw);
      expect(socialJobResultMatches(job({ kind: result.kind, topicId: 't1' }), result)).toEqual({ ok: true });
    }
  });

  it('(d) rejects results for another post for both transcribe and filter', () => {
    for (const raw of [results[1], results[2]]) {
      const result = SocialJobResultSchema.parse({ ...raw, postId: 'p2' });
      expect(socialJobResultMatches(job({ kind: result.kind }), result)).toEqual({ ok: false, error: 'post_mismatch' });
    }
  });

  it('(d) rejects a different kind and a different or missing topic', () => {
    expect(socialJobResultMatches(job(), SocialJobResultSchema.parse(results[2]))).toEqual({ ok: false, error: 'kind_mismatch' });
    for (const topicId of ['t2', undefined]) {
      expect(socialJobResultMatches(job({ kind: 'verify', topicId }), SocialJobResultSchema.parse(results[3])))
        .toEqual({ ok: false, error: 'topic_mismatch' });
    }
  });

  it('(d) rejects every non-running job without throwing', () => {
    for (const state of ['queued', 'done', 'failed', 'cancelled'] as const) {
      const current = job({ state, ...(state === 'failed' ? { error: 'Download failed' } : {}) });
      expect(socialJobResultMatches(current, SocialJobResultSchema.parse(results[1])))
        .toEqual({ ok: false, error: 'job_not_running' });
    }
  });
});
