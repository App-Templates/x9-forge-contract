import { describe, expect, it } from 'vitest';
import * as dev from '../../../src/capability/dev/index.js';
import { AuthDeviceSignatureSchema } from '../../../src/auth/device-signature.js';
import * as api from '../../../src/http/endpoints/index.js';
import * as routes from '../../../src/http/endpoints/dev-generic-jobs.js';

const claim = {
  version: 1 as const,
  executorId: 'mac-001',
  executor: 'laptop' as const,
  tenantId: 'tenant-1',
  ownerId: 'owner-1',
  capabilities: ['social-listening'],
  tools: ['mlx_whisper'] as const,
};
// Mutable arrays match the public request type without weakening fixture types.
const request = { ...claim, tools: [...claim.tools] };
const job = {
  version: 1 as const,
  jobId: 'job-1',
  scope: { tenantId: claim.tenantId, ownerId: claim.ownerId, agentId: 'agent-1' },
  capability: 'social-listening',
  kind: 'transcribe_media',
  tool: 'mlx_whisper' as const,
  executor: claim.executor,
  input: { mediaId: 'reel-1', language: 'it' },
  configVersion: 0,
  limits: { maxDurationSeconds: 600, maxAttempts: 2 },
  createdAt: '2026-11-17T07:00:00+01:00',
};
const lease = { leaseId: 'lease-1', expiresAt: '2026-11-17T07:10:00+01:00' };
const response = { status: 'job' as const, job, lease };
const heartbeat = { version: 1, executorId: claim.executorId, leaseId: lease.leaseId };
const completion = {
  ...heartbeat,
  result: {
    version: 1,
    jobId: job.jobId,
    scope: job.scope,
    tool: job.tool,
    state: 'done',
    output: { text: 'Transcript received.' },
    durationSeconds: 15,
    finishedAt: '2026-11-17T07:01:00+01:00',
  },
};

describe('generic queue channel', () => {
  it('accepts a valid claim request', () => {
    expect(dev.DevGenericClaimRequestSchema.parse(request)).toEqual(request);
    expect(dev.DevGenericClaimRequestSchema.safeParse({
      ...request, executor: 'server', tools: ['mlx_whisper', 'claude_p'],
      capabilities: Array.from({ length: 10 }, (_, i) => `cap-${i}`),
    }).success).toBe(true);
  });

  it('s3667 accepts a claim with all three tools; repeated or invented ones stay rejected', () => {
    const all = ['mlx_whisper', 'claude_p', 'ig_collect'];
    expect(dev.DevGenericClaimRequestSchema.safeParse({ ...request, tools: all }).success).toBe(true);
    expect(dev.DevGenericClaimRequestSchema.safeParse({ ...request, tools: [...all, 'ig_collect'] }).success).toBe(false);
    expect(dev.DevGenericClaimRequestSchema.safeParse({ ...request, tools: [...all, 'bash'] }).success).toBe(false);
  });

  it.each([
    { capabilities: undefined }, { capabilities: [] },
    { capabilities: Array.from({ length: 11 }, (_, i) => `cap-${i}`) },
    { capabilities: ['Social Listening'] }, { capabilities: ['a'] },
    { capabilities: ['a'.repeat(42)] },
    { tools: [] }, { tools: ['mlx_whisper', 'mlx_whisper'] },
    { tools: ['mlx_whisper', 'claude_p', 'mlx_whisper'] }, { tools: ['bash'] },
    { executorId: 'Mac-001' }, { executor: 'cloud' },
    { ownerId: '' }, { tenantId: '' }, { version: 2 }, { extra: true },
  ])('rejects an invalid claim %j', (override) => {
    expect(dev.DevGenericClaimRequestSchema.safeParse({ ...request, ...override }).success).toBe(false);
  });

  it('accepts empty and leased job responses for both executors', () => {
    expect(dev.DevGenericClaimResponseSchema.parse({ status: 'empty' })).toEqual({ status: 'empty' });
    expect(dev.DevGenericClaimResponseSchema.parse(response)).toEqual(response);
    expect(dev.DevGenericClaimResponseSchema.safeParse({ ...response, job: { ...job, executor: 'server' } }).success).toBe(true);
    expect(dev.DevGenericLeaseSchema.safeParse({ ...lease, leaseId: 'x'.repeat(100) }).success).toBe(true);
  });

  it.each([
    { status: 'job', job }, { status: 'empty', job }, { status: 'empty', lease },
    { status: 'job', job, lease: { ...lease, leaseId: '' } },
    { status: 'job', job, lease: { ...lease, leaseId: 'x'.repeat(101) } },
    { status: 'job', job, lease: { ...lease, expiresAt: 'tomorrow' } },
    { status: 'job', job, lease: { ...lease, extra: true } },
    { ...response, extra: true },
  ])('rejects an invalid claim response %j', (value) => {
    expect(dev.DevGenericClaimResponseSchema.safeParse(value).success).toBe(false);
  });

  it('selects a matching job and preserves its lease or an explicit empty response', () => {
    expect(dev.selectDevGenericClaim(response, request)).toEqual({ ok: true, empty: false, job, lease });
    expect(dev.selectDevGenericClaim({ status: 'empty' }, request)).toEqual({ ok: true, empty: true });
    expect(dev.selectDevGenericClaim({ ...response, job: { ...job, executor: 'server' } }, { ...request, executor: 'server' }))
      .toEqual({ ok: true, empty: false, job: { ...job, executor: 'server' }, lease });
  });

  it.each(['ownerId', 'tenantId'] as const)('rejects foreign %s without turning it into empty', (field) => {
    const foreign = { ...response, job: { ...job, scope: { ...job.scope, [field]: 'other' } } };
    expect(dev.selectDevGenericClaim(foreign, request)).toEqual({ ok: false, error: 'foreign_scope' });
  });

  it.each([
    [{ capability: 'ricerca' }, 'capability_not_requested'],
    [{ tool: 'claude_p' }, 'tool_not_requested'],
    [{ executor: 'server' }, 'wrong_executor'],
  ] as const)('rejects an unrequested job variant %j', (override, error) => {
    expect(dev.selectDevGenericClaim({ ...response, job: { ...job, ...override } }, request)).toEqual({ ok: false, error });
  });

  it.each(['text', null, { status: 'job', job: { jobId: 'job-1' } }])('returns invalid_response without throwing for %j', (raw) => {
    expect(() => dev.selectDevGenericClaim(raw, request)).not.toThrow();
    expect(dev.selectDevGenericClaim(raw, request)).toEqual({ ok: false, error: 'invalid_response' });
  });

  it('validates heartbeat and completion requests and their strict fields', () => {
    expect(dev.DevGenericHeartbeatRequestSchema.parse(heartbeat)).toEqual(heartbeat);
    expect(dev.DevGenericCompleteRequestSchema.parse(completion)).toEqual(completion);
    for (const [schema, body] of [
      [dev.DevGenericHeartbeatRequestSchema, heartbeat],
      [dev.DevGenericCompleteRequestSchema, completion],
    ] as const) {
      for (const override of [
        { version: 2 }, { executorId: 'Mac-001' }, { leaseId: '' },
        { leaseId: 'x'.repeat(101) }, { expiresAt: lease.expiresAt },
      ]) expect(schema.safeParse({ ...body, ...override }).success).toBe(false);
      for (const key of Object.keys(body)) {
        const missing = { ...body };
        Reflect.deleteProperty(missing, key);
        expect(schema.safeParse(missing).success).toBe(false);
      }
    }
    expect(dev.DevGenericCompleteRequestSchema.safeParse({
      ...completion, result: { ...completion.result, output: undefined },
    }).success).toBe(false);
  });

  it('validates all heartbeat and completion response branches', () => {
    for (const value of [{ status: 'extended', expiresAt: lease.expiresAt }, { status: 'lease_expired' }]) {
      expect(dev.DevGenericHeartbeatResponseSchema.parse(value)).toEqual(value);
    }
    for (const value of [{ status: 'accepted' }, { status: 'lease_expired' }, { status: 'rejected', error: 'result_mismatch' }]) {
      expect(dev.DevGenericCompleteResponseSchema.parse(value)).toEqual(value);
    }
    for (const value of [
      { status: 'extended' }, { status: 'extended', expiresAt: 'tomorrow' },
      { status: 'lease_expired', expiresAt: lease.expiresAt }, { status: 'accepted' },
    ]) expect(dev.DevGenericHeartbeatResponseSchema.safeParse(value).success).toBe(false);
    for (const value of [
      { status: 'rejected' }, { status: 'rejected', error: 'other' },
      { status: 'accepted', error: 'result_mismatch' }, { status: 'lease_expired', extra: true },
    ]) expect(dev.DevGenericCompleteResponseSchema.safeParse(value).success).toBe(false);
  });
});

describe('generic queue route contracts', () => {
  it('exports the three POST routes with device signature headers', () => {
    for (const [name, path, body, responseSchema] of [
      ['claimDevGenericJobContract', '/connect/generic-jobs/claim', dev.DevGenericClaimRequestSchema, dev.DevGenericClaimResponseSchema],
      ['heartbeatDevGenericJobContract', '/connect/generic-jobs/:jobId/heartbeat', dev.DevGenericHeartbeatRequestSchema, dev.DevGenericHeartbeatResponseSchema],
      ['completeDevGenericJobContract', '/connect/generic-jobs/:jobId/complete', dev.DevGenericCompleteRequestSchema, dev.DevGenericCompleteResponseSchema],
    ] as const) {
      expect(api[name]).toBe(routes[name]);
      expect(api[name].method).toBe('POST');
      expect(api[name].path).toBe(path);
      expect(api[name].authType).toBe('device_signature');
      expect(api[name].headersSchema).toBe(AuthDeviceSignatureSchema);
      expect(api[name].bodySchema).toBe(body);
      expect(api[name].responseSchema).toBe(responseSchema);
    }
  });

  it('accepts a job path id and rejects empty ids, slashes and extra fields', () => {
    for (const contract of [api.heartbeatDevGenericJobContract, api.completeDevGenericJobContract]) {
      expect(contract.paramsSchema.parse({ jobId: job.jobId })).toEqual({ jobId: job.jobId });
      expect(contract.paramsSchema.safeParse({ jobId: 'x'.repeat(100) }).success).toBe(true);
      for (const params of [{ jobId: '' }, { jobId: 'job/1' }, { jobId: 'x'.repeat(101) }, { jobId: 'job-1', extra: true }]) {
        expect(contract.paramsSchema.safeParse(params).success).toBe(false);
      }
    }
  });

  it('has no secret-auth route and no path collision with other barrel contracts', () => {
    const contracts = Object.values(routes).filter((value) =>
      typeof value === 'object' && value !== null && 'method' in value && 'path' in value && 'authType' in value);
    expect(contracts).toHaveLength(3);
    expect(new Set(contracts.map((value) => value.path)).size).toBe(3);
    for (const contract of contracts) {
      expect(contract.authType).not.toBe('secret');
      expect(contract.path).toMatch(/^\/connect\/generic-jobs\//);
      const matches = Object.values(api).filter((value) =>
        typeof value === 'object' && value !== null && 'path' in value && value.path === contract.path);
      expect(matches).toEqual([contract]);
    }
  });
});
