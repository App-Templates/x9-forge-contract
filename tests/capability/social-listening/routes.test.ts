import { describe, expect, it } from 'vitest';
import {
  SOCIAL_JOB_RESULT_ERRORS,
  SocialJobResultErrorSchema,
  SocialJobSchema,
  SocialRoundQuerySchema,
  SocialRoundReadResponseSchema,
  readSocialGenericJob,
  readSocialGenericOutput,
  selectSocialRound,
  socialJobResultMatches,
  socialRoundPath,
  socialRoundReadContract,
  type SocialJob,
  type SocialJobInput,
  type SocialJobResult,
} from '../../../src/capability/social-listening/index.js';

const identity = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'x9' };
const timestamp = '2026-11-17T07:00:00+01:00';
const query = { scope: identity, verticalId: 'ai', day: '2026-11-17' };
const round = {
  identity, verticalId: 'ai', day: query.day, track: 'mac', state: 'running',
  scheduledFor: timestamp, postsSeen: 2, topicsCount: 0, spentUsd: 0,
};
const inputs: SocialJobInput[] = [
  { kind: 'collect', verticalId: 'ai', handles: ['creator.one'] },
  { kind: 'transcribe', postId: 'p1', link: 'https://example.com/p1' },
  { kind: 'filter', postId: 'p1' },
  { kind: 'verify', topicId: 't1' },
  { kind: 'group', verticalId: 'ai', postIds: ['p1'], categories: ['coding'] },
];
const results: SocialJobResult[] = [
  { kind: 'collect', posts: [], hasMore: false },
  { kind: 'transcribe', postId: 'p1', transcript: 'A creator demonstrates a tool.', language: 'en', durationSec: 12 },
  { kind: 'filter', postId: 'p1', keep: true, reason: 'Relevant demonstration.' },
  {
    kind: 'verify', topicId: 't1', verdict: 'funziona', summary: 'The demo generates code.',
    facts: [{ text: 'The tool generates code.', sourceUrls: ['https://example.com/p1'] }],
    sources: [{ url: 'https://example.com/p1', opened: true }],
  },
  { kind: 'group', topics: [{
    title: 'A coding tool', category: 'coding', summary: 'A new coding demonstration.',
    postIds: ['p1'], creators: ['creator.one'], heat: 7,
  }] },
];

function job(overrides: Partial<SocialJob> = {}): SocialJob {
  return SocialJobSchema.parse({
    identity, jobId: '123e4567-e89b-42d3-a456-426614174000',
    kind: 'filter', state: 'running', track: 'mac', day: query.day,
    verticalId: 'ai', postId: 'p1', topicId: 't1', attempts: 1,
    createdAt: timestamp, updatedAt: timestamp, ...overrides,
  });
}

function generic(input: SocialJobInput = inputs[2]!) {
  return { capability: 'social-listening', kind: input.kind, scope: identity, input };
}

const resultErrors: { error: string; queueJob: SocialJob; result: SocialJobResult }[] = [
  { error: 'kind_mismatch', queueJob: job(), result: results[0]! },
  { error: 'post_mismatch', queueJob: job({ postId: 'p2' }), result: results[2]! },
  { error: 'topic_mismatch', queueJob: job({ kind: 'verify', topicId: 't2' }), result: results[3]! },
  { error: 'job_not_running', queueJob: job({ state: 'queued' }), result: results[2]! },
];

describe('social result errors', () => {
  it('exports exactly the four result errors', () => {
    expect(SOCIAL_JOB_RESULT_ERRORS).toEqual([
      'kind_mismatch', 'post_mismatch', 'topic_mismatch', 'job_not_running',
    ]);
  });

  it.each(resultErrors)('provokes and parses $error without deriving expected values', ({ error, queueJob, result }) => {
    expect(socialJobResultMatches(queueJob, result)).toEqual({ ok: false, error });
    expect(SocialJobResultErrorSchema.safeParse(error)).toEqual({ success: true, data: error });
  });

  it('rejects an unknown result error', () => {
    expect(SocialJobResultErrorSchema.safeParse('invalid_result').success).toBe(false);
  });
});

describe('readSocialGenericJob', () => {
  it.each(inputs)('accepts a matching $kind job', input => {
    expect(readSocialGenericJob(generic(input), job({ kind: input.kind }))).toEqual({ ok: true, input });
  });

  it('rejects another capability', () => {
    expect(readSocialGenericJob({ ...generic(), capability: 'dev' }, job()))
      .toEqual({ ok: false, error: 'not_social_job' });
  });

  it.each(['agentId', 'tenantId', 'ownerId'] as const)('rejects a foreign %s', key => {
    expect(readSocialGenericJob({ ...generic(), scope: { ...identity, [key]: 'foreign' } }, job()))
      .toEqual({ ok: false, error: 'foreign_scope' });
  });

  it.each([null, {}, { ...identity, agentId: '' }])('rejects invalid scope %j without throwing', scope => {
    expect(readSocialGenericJob({ ...generic(), scope }, job())).toEqual({ ok: false, error: 'foreign_scope' });
  });

  it('rejects a different channel kind', () => {
    expect(readSocialGenericJob({ ...generic(), kind: 'collect' }, job()))
      .toEqual({ ok: false, error: 'kind_mismatch' });
  });

  it('rejects a different parsed input kind', () => {
    expect(readSocialGenericJob({ ...generic(), input: inputs[0] }, job()))
      .toEqual({ ok: false, error: 'kind_mismatch' });
  });

  it.each(['executor text', null, { ...inputs[2], extra: 'data' }])('rejects malformed input %j', input => {
    expect(readSocialGenericJob({ ...generic(), input }, job())).toEqual({ ok: false, error: 'invalid_input' });
  });

  it.each([
    { kind: 'filter', postId: 'p2' },
    { kind: 'transcribe', postId: 'p2', link: 'https://example.com/p2' },
    { kind: 'verify', topicId: 't2' },
    { kind: 'collect', verticalId: 'other', handles: ['creator.one'] },
    { kind: 'group', verticalId: 'other', postIds: ['p1'], categories: ['coding'] },
  ] satisfies SocialJobInput[])('rejects a mismatching $kind reference', input => {
    expect(readSocialGenericJob(generic(input), job({ kind: input.kind })))
      .toEqual({ ok: false, error: 'input_mismatch' });
  });
});

describe('readSocialGenericOutput', () => {
  it.each(results)('accepts a matching $kind result', result => {
    expect(readSocialGenericOutput(job({ kind: result.kind }), result)).toEqual({ ok: true, result });
  });

  it.each([null, 'executor text', { ...results[2], extra: true }])('rejects malformed output %j', output => {
    expect(readSocialGenericOutput(job(), output)).toEqual({ ok: false, error: 'invalid_result' });
  });

  it.each(results)('rejects executor identity on $kind output', result => {
    expect(readSocialGenericOutput(job({ kind: result.kind }), { ...result, identity }))
      .toEqual({ ok: false, error: 'invalid_result' });
  });

  it.each(resultErrors)('preserves $error from queue correlation', ({ error, queueJob, result }) => {
    expect(readSocialGenericOutput(queueJob, result)).toEqual({ ok: false, error });
  });
});

describe('social round read', () => {
  it('builds the validated agent path', () => {
    expect(socialRoundPath('agent-1')).toBe('/internal/capability/agents/agent-1/social-listening/round');
  });

  it.each(['', 'agent/other'])('rejects invalid path agent %j', agentId => {
    expect(() => socialRoundPath(agentId)).toThrow();
    expect(socialRoundReadContract.paramsSchema.safeParse({ agentId }).success).toBe(false);
  });

  it('accepts a query and rejects extra fields and invalid days', () => {
    expect(SocialRoundQuerySchema.parse(query)).toEqual(query);
    expect(SocialRoundQuerySchema.safeParse({ ...query, extra: true }).success).toBe(false);
    expect(SocialRoundQuerySchema.safeParse({ ...query, day: '2026-02-30' }).success).toBe(false);
  });

  it('represents an absent round as null', () => {
    expect(SocialRoundReadResponseSchema.parse({ round: null })).toEqual({ round: null });
    expect(selectSocialRound({ round: null }, query)).toEqual({ ok: true, round: null });
  });

  it('accepts a round correlated to the request', () => {
    expect(selectSocialRound({ round }, query)).toEqual({ ok: true, round });
  });

  it.each(['agentId', 'tenantId', 'ownerId'] as const)('rejects a round with foreign %s', key => {
    expect(selectSocialRound({ round: { ...round, identity: { ...identity, [key]: 'foreign' } } }, query))
      .toEqual({ ok: false, error: 'foreign_scope' });
  });

  it.each([{ day: '2026-11-16' }, { verticalId: 'other' }])('rejects a mismatching round %j', change => {
    expect(selectSocialRound({ round: { ...round, ...change } }, query))
      .toEqual({ ok: false, error: 'round_mismatch' });
  });

  it.each(['round text', null, {}, { round: { ...round, extra: true } }, { round, extra: true }])(
    'rejects malformed response %j without throwing', raw => {
      expect(selectSocialRound(raw, query)).toEqual({ ok: false, error: 'invalid_response' });
    },
  );

  it('rejects a malformed query even for an absent round', () => {
    expect(selectSocialRound({ round: null }, { ...query, day: 'bad' }))
      .toEqual({ ok: false, error: 'invalid_response' });
  });

  it('declares GET with secret authentication and strict schemas', () => {
    expect(socialRoundReadContract.method).toBe('GET');
    expect(socialRoundReadContract.authType).toBe('secret');
    expect(socialRoundReadContract.path).toBe('/internal/capability/agents/:agentId/social-listening/round');
    expect(socialRoundReadContract.paramsSchema.parse({ agentId: 'x9' })).toEqual({ agentId: 'x9' });
    expect(socialRoundReadContract.paramsSchema.safeParse({ agentId: 'x9', extra: true }).success).toBe(false);
    expect(socialRoundReadContract.querySchema).toBe(SocialRoundQuerySchema);
    expect(socialRoundReadContract.responseSchema).toBe(SocialRoundReadResponseSchema);
  });
});
