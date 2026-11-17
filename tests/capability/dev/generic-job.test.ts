import { Buffer } from 'node:buffer';
import { describe, expect, it } from 'vitest';
import * as dev from '../../../src/capability/dev/index';
import {
  DEV_GENERIC_EXECUTORS,
  DEV_GENERIC_INPUT_MAX_BYTES,
  DEV_GENERIC_JOB_TOOLS,
  DEV_GENERIC_OUTPUT_MAX_BYTES,
  DevGenericExecutorSchema,
  DevGenericInputSchema,
  DevGenericJobResultSchema,
  DevGenericJobSchema,
  DevGenericOutputSchema,
  DevGenericToolSchema,
  devGenericResultMatchesJob,
} from '../../../src/capability/dev/index';

const scope = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
const job = {
  version: 1 as const,
  scope,
  jobId: 'job-1',
  capability: 'social-listening',
  kind: 'transcribe_media',
  tool: 'mlx_whisper' as const,
  executor: 'laptop' as const,
  input: { mediaId: 'reel-1', options: { language: 'it', timestamps: true }, tags: [null, 1] },
  configVersion: 0,
  limits: { maxDurationSeconds: 600, maxAttempts: 2 },
  createdAt: '2026-11-17T07:00:00+01:00',
};
const result = {
  version: 1 as const,
  jobId: job.jobId,
  scope,
  tool: job.tool,
  state: 'done' as const,
  output: { text: 'Transcript received.' },
  durationSeconds: 0,
  finishedAt: '2026-11-17T07:01:00+01:00',
};

describe('generic executor jobs', () => {
  it('accepts the two fixed tool names and executor locations', () => {
    expect(DEV_GENERIC_JOB_TOOLS).toEqual(['mlx_whisper', 'claude_p']);
    expect(DEV_GENERIC_EXECUTORS).toEqual(['laptop', 'server']);
    expect(DevGenericJobSchema.parse(job)).toEqual(job);
    expect(DevGenericJobSchema.safeParse({ ...job, tool: 'claude_p', executor: 'server' }).success).toBe(true);
    for (const tool of DEV_GENERIC_JOB_TOOLS) expect(DevGenericToolSchema.safeParse(tool).success).toBe(true);
    for (const executor of DEV_GENERIC_EXECUTORS) expect(DevGenericExecutorSchema.safeParse(executor).success).toBe(true);
  });

  it.each([
    ['arbitrary tool', { tool: 'bash' }],
    ['command line', { tool: 'claude -p' }],
    ['unknown executor', { executor: 'cloud' }],
    ['invalid capability', { capability: 'Social Listening' }],
    ['short capability', { capability: 'a' }],
    ['long capability', { capability: 'a'.repeat(42) }],
    ['invalid kind', { kind: 'transcribe media' }],
    ['empty kind', { kind: '' }],
    ['long kind', { kind: 'a'.repeat(42) }],
    ['missing agent', { scope: { tenantId: scope.tenantId, ownerId: scope.ownerId } }],
    ['extra scope field', { scope: { ...scope, userId: 'person-1' } }],
    ['wrong version', { version: 2 }],
    ['empty job id', { jobId: '' }],
    ['long job id', { jobId: 'a'.repeat(101) }],
    ['negative configuration', { configVersion: -1 }],
    ['fractional configuration', { configVersion: 0.5 }],
    ['missing offset', { createdAt: '2026-11-17T07:00:00' }],
    ['extra field', { command: 'run' }],
  ])('rejects %s', (_label, override) => {
    expect(DevGenericJobSchema.safeParse({ ...job, ...override }).success).toBe(false);
  });

  it.each([
    { maxDurationSeconds: 0 }, { maxDurationSeconds: 3601 }, { maxDurationSeconds: 1.5 },
    { maxAttempts: 0 }, { maxAttempts: 6 }, { maxAttempts: 1.5 }, { extra: true },
  ])('rejects invalid limits %j', (override) => {
    expect(DevGenericJobSchema.safeParse({ ...job, limits: { ...job.limits, ...override } }).success).toBe(false);
  });

  it('accepts inclusive job and limit boundaries', () => {
    for (const limits of [
      { maxDurationSeconds: 1, maxAttempts: 1 },
      { maxDurationSeconds: 3600, maxAttempts: 5 },
    ]) {
      expect(DevGenericJobSchema.safeParse({
        ...job, limits, jobId: 'a'.repeat(100), capability: 'a'.repeat(41), kind: 'a'.repeat(41),
      }).success).toBe(true);
    }
    expect(DevGenericJobSchema.safeParse({ ...job, kind: 'a', createdAt: '2026-11-17T06:00:00Z' }).success).toBe(true);
  });
});

describe('light JSON payloads', () => {
  it('enforces exact UTF-8 input and output byte limits', () => {
    expect(DEV_GENERIC_INPUT_MAX_BYTES).toBe(32768);
    expect(DEV_GENERIC_OUTPUT_MAX_BYTES).toBe(131072);
    for (const [schema, limit] of [
      [DevGenericInputSchema, 32768], [DevGenericOutputSchema, 131072],
    ] as const) {
      const overhead = Buffer.byteLength(JSON.stringify({ text: '' }), 'utf8');
      const ascii = { text: 'a'.repeat(limit - overhead) };
      const multibyte = { text: 'è'.repeat(Math.floor((limit - overhead) / 2)) + 'a'.repeat((limit - overhead) % 2) };
      for (const payload of [ascii, multibyte]) {
        expect(Buffer.byteLength(JSON.stringify(payload), 'utf8')).toBe(limit);
        expect(schema.safeParse(payload).success).toBe(true);
        const oversized = { text: payload.text + 'a' };
        expect(Buffer.byteLength(JSON.stringify(oversized), 'utf8')).toBe(limit + 1);
        expect(schema.safeParse(oversized).success).toBe(false);
      }
      const escaped = { text: '\n'.repeat(Math.floor((limit - overhead) / 2) + 1) };
      expect(schema.safeParse(escaped).success).toBe(false);
    }
  });

  it.each([
    { value: undefined }, { value: () => 'command' }, { nested: { value: undefined } },
    { values: [undefined] }, { value: Number.NaN }, { value: Infinity },
    { '': 'empty key' }, { ['x'.repeat(101)]: 'long key' }, null, [], 'text',
  ])('rejects non-JSON objects and invalid keys %j', (payload) => {
    expect(DevGenericInputSchema.safeParse(payload).success).toBe(false);
    expect(DevGenericOutputSchema.safeParse(payload).success).toBe(false);
  });

  it('accepts JSON objects including empty objects and maximum key length', () => {
    for (const payload of [{}, { ['x'.repeat(100)]: [null, true, 1, 'text', { nested: false }] }]) {
      expect(DevGenericInputSchema.safeParse(payload).success).toBe(true);
      expect(DevGenericOutputSchema.safeParse(payload).success).toBe(true);
    }
  });
});

describe('generic job results', () => {
  const { output: _output, ...withoutOutput } = result;

  it('accepts done with output and failed with an error', () => {
    expect(DevGenericJobResultSchema.parse(result)).toEqual(result);
    const failed = { ...withoutOutput, state: 'failed', error: 'Transcription failed.' };
    expect(DevGenericJobResultSchema.parse(failed)).toEqual(failed);
  });

  it.each([
    ['done with error', { ...result, error: 'Unexpected error.' }],
    ['done without output', withoutOutput],
    ['failed without error', { ...withoutOutput, state: 'failed' }],
    ['failed with output', { ...result, state: 'failed', error: 'Failure.' }],
    ['empty error', { ...withoutOutput, state: 'failed', error: '' }],
    ['long error', { ...withoutOutput, state: 'failed', error: 'e'.repeat(501) }],
    ['oversized output', { ...result, output: { text: 'è'.repeat(65536) } }],
    ['negative duration', { ...result, durationSeconds: -1 }],
    ['fractional duration', { ...result, durationSeconds: 0.5 }],
    ['wrong version', { ...result, version: 2 }],
    ['unknown state', { ...result, state: 'running' }],
    ['unknown tool', { ...result, tool: 'bash' }],
    ['extra field', { ...result, command: 'run' }],
    ['missing agent', { ...result, scope: { tenantId: 'tenant-1', ownerId: 'owner-1' } }],
    ['missing offset', { ...result, finishedAt: '2026-11-17T07:01:00' }],
    ['empty job id', { ...result, jobId: '' }],
    ['long job id', { ...result, jobId: 'a'.repeat(101) }],
  ])('rejects %s', (_label, invalid) => {
    expect(DevGenericJobResultSchema.safeParse(invalid).success).toBe(false);
  });

  it('correlates job id, full scope and tool with explicit mismatch reasons', () => {
    expect(devGenericResultMatchesJob(job, result)).toEqual({ ok: true });
    expect(devGenericResultMatchesJob(job, { ...result, jobId: 'job-2' })).toEqual({ ok: false, error: 'job_mismatch' });
    for (const key of ['tenantId', 'ownerId', 'agentId'] as const) {
      expect(devGenericResultMatchesJob(job, { ...result, scope: { ...scope, [key]: 'other' } }))
        .toEqual({ ok: false, error: 'scope_mismatch' });
    }
    expect(devGenericResultMatchesJob(job, { ...result, tool: 'claude_p' })).toEqual({ ok: false, error: 'tool_mismatch' });
    expect(devGenericResultMatchesJob(job, {
      ...result, jobId: 'other', scope: { ...scope, agentId: 'other' }, tool: 'claude_p',
    })).toEqual({ ok: false, error: 'job_mismatch' });
  });
});

describe('saved development and design compatibility', () => {
  const assignment = {
    version: 1, tenantId: 'tenant-1', ownerId: '7', organizationId: 'good-choice',
    companyId: 'good-choice', projectId: 'good-choice-app', businessUnit: { slug: 'sviluppo' },
    requestedBy: { managementAgentId: 'capo-sviluppo', runtimeAgentId: 'capo-sviluppo', vaultAgentId: 62 },
    productKind: 'code', title: 'Modulo A: scansione prodotto', task: 'Build the requested module.',
    miniPlan: '1. Structure. 2. Scan. 3. Test.',
    materials: [{ kind: 'github_link', url: 'https://github.com/App-Templates/gz-mockups/tree/main/home' }],
    destination: { repo: 'App-Templates/goodchoice-backtest' }, createdAt: '2026-10-27T15:00:00+01:00',
  };
  const productionJob = {
    version: 1, scope, jobId: 'job-1', requestId: 'request_12345678', projectId: 'project-1',
    session: { scope, sessionId: 'session-1', target: { kind: 'local', deviceId: 'device-1' }, engines: ['codex', 'claude'] },
    productKind: 'code', instruction: 'Create the requested deliverable.', reportVersion: 1,
    reportDigest: 'a'.repeat(64), configVersion: 0, keyVersion: 1,
    limits: { maxDurationSeconds: 600, maxAttempts: 2, maxTasks: 3 },
  };

  it.each(['code', 'design'])('preserves valid and invalid saved %s assignments and production jobs', (productKind) => {
    const savedAssignment = { ...assignment, productKind };
    const savedProduction = { ...productionJob, productKind };
    expect(dev.DevSessionAssignmentSchema.parse(savedAssignment)).toEqual(savedAssignment);
    expect(dev.DevSessionAssignmentSchema.safeParse({ ...savedAssignment, productKind: 'transcribe' }).success).toBe(false);
    expect(dev.DevProductionJobSchema.parse(savedProduction)).toEqual(savedProduction);
    expect(dev.DevProductionJobSchema.safeParse({ ...savedProduction, version: 2 }).success).toBe(false);
  });

  it('preserves the executor label and existing barrel exports', () => {
    expect(dev.DEV_SESSION_EXECUTOR_LABEL_PREFIX).toBe('esecutore:');
    expect(Object.keys(dev)).toEqual(expect.arrayContaining([
      'DevSignedCommandV2Schema', 'DevProductionJobSchema', 'DevSessionAssignmentSchema', 'DevSessionOutcomeSchema',
    ]));
  });
});
