import { describe, expect, it } from 'vitest';
import { DevGenericJobSchema } from '../../../src/capability/dev/generic-job.js';
import {
  SOCIAL_JOB_LIMITS,
  SOCIAL_JOB_TOOL,
  SOCIAL_TRACK_EXECUTOR,
  SocialJobSchema,
  readSocialGenericJob,
  socialGenericJobFor,
  type SocialJob,
  type SocialJobInput,
} from '../../../src/capability/social-listening/index.js';

const identity = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'x9' };
const timestamp = '2026-11-19T07:00:00+01:00';
const options = { configVersion: 4, createdAt: timestamp };
const cases = [
  {
    input: { kind: 'collect', verticalId: 'ai', handles: ['creator.one'] },
    tool: 'ig_collect', seconds: 900, attempts: 3,
  },
  {
    input: { kind: 'transcribe', postId: 'p1', link: 'https://example.com/posts/p1' },
    tool: 'mlx_whisper', seconds: 900, attempts: 3,
  },
  { input: { kind: 'filter', postId: 'p1' }, tool: 'claude_p', seconds: 300, attempts: 3 },
  {
    input: { kind: 'verify', topicId: 't1', knownFacts: [] },
    tool: 'claude_p', seconds: 900, attempts: 2,
  },
  {
    input: { kind: 'group', verticalId: 'ai', postIds: ['p1'], categories: ['coding'] },
    tool: 'claude_p', seconds: 600, attempts: 2,
  },
] satisfies { input: SocialJobInput; tool: string; seconds: number; attempts: number }[];

function queueJob(overrides: Partial<SocialJob> = {}): SocialJob {
  return SocialJobSchema.parse({
    identity, jobId: '123e4567-e89b-42d3-a456-426614174000',
    kind: 'filter', state: 'queued', track: 'mac', day: '2026-11-19',
    verticalId: 'ai', postId: 'p1', topicId: 't1', attempts: 0,
    createdAt: timestamp, updatedAt: timestamp, ...overrides,
  });
}

describe('socialGenericJobFor', () => {
  for (const { track, executor } of [
    { track: 'mac', executor: 'laptop' },
    { track: 'server', executor: 'server' },
  ] as const) {
    it.each(cases)(`maps $input.kind on ${track} and round-trips the queued input`, ({ input, tool, seconds, attempts }) => {
      const queued = queueJob({ kind: input.kind, track });
      const result = socialGenericJobFor(queued, input, options);
      expect(result.ok).toBe(true);
      if (!result.ok) throw new Error(result.error);
      const limits = { maxDurationSeconds: seconds, maxAttempts: attempts };
      expect(SOCIAL_JOB_TOOL[input.kind]).toBe(tool);
      expect(SOCIAL_TRACK_EXECUTOR[track]).toBe(executor);
      expect(SOCIAL_JOB_LIMITS[input.kind]).toEqual(limits);
      expect(result.job).toEqual({
        version: 1, scope: queued.identity, jobId: queued.jobId,
        capability: 'social-listening', kind: queued.kind, input,
        tool, executor, limits, ...options,
      });
      expect(DevGenericJobSchema.parse(result.job)).toEqual(result.job);
      expect(readSocialGenericJob(result.job, queued)).toEqual({ ok: true, input });
    });
  }

  it.each(cases)('uses queue identity and rejects caller identity for $input.kind', ({ input }) => {
    const queued = queueJob({ kind: input.kind, identity: { ...identity, agentId: 'queue-agent' } });
    const result = socialGenericJobFor(queued, input, options);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);
    expect(result.job.scope).toEqual(queued.identity);
    for (const extra of [
      { agentId: 'foreign-agent' },
      { identity: { ...identity, agentId: 'foreign-agent' } },
      { scope: { ...identity, agentId: 'foreign-agent' } },
    ]) {
      expect(socialGenericJobFor(queued, { ...input, ...extra }, options))
        .toEqual({ ok: false, error: 'invalid_input' });
    }
  });

  it('rejects a valid input of another kind', () => {
    expect(socialGenericJobFor(queueJob(), cases[0]!.input, options))
      .toEqual({ ok: false, error: 'kind_mismatch' });
  });

  it.each([
    { kind: 'transcribe', postId: 'other', link: 'https://example.com/posts/other' },
    { kind: 'filter', postId: 'other' },
    { kind: 'verify', topicId: 'other' },
    { kind: 'collect', verticalId: 'other', handles: ['creator.one'] },
    { kind: 'group', verticalId: 'other', postIds: ['p1'], categories: ['coding'] },
  ] satisfies SocialJobInput[])('rejects a mismatching $kind reference', input => {
    expect(socialGenericJobFor(queueJob({ kind: input.kind }), input, options))
      .toEqual({ ok: false, error: 'input_mismatch' });
  });

  it.each([null, 'executor text', {}, { kind: 'filter' }, { kind: 'unknown' }])(
    'rejects malformed input %j', input => {
      expect(socialGenericJobFor(queueJob(), input, options))
        .toEqual({ ok: false, error: 'invalid_input' });
    },
  );

  it.each([
    { configVersion: -1, createdAt: timestamp },
    { configVersion: 1.5, createdAt: timestamp },
    { configVersion: 4, createdAt: '2026-11-19T07:00:00' },
  ])('rejects invalid generic metadata %j', metadata => {
    expect(socialGenericJobFor(queueJob(), { kind: 'filter', postId: 'p1' }, metadata))
      .toEqual({ ok: false, error: 'invalid_job' });
  });

  it('rejects an invalid queue job before mapping it', () => {
    expect(socialGenericJobFor({ ...queueJob(), jobId: 'not-a-uuid' }, { kind: 'filter', postId: 'p1' }, options))
      .toEqual({ ok: false, error: 'invalid_job' });
  });
});
