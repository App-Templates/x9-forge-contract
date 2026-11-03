import { describe, expect, it } from 'vitest';
import * as http from '../../../src/http/index.js';
import { CapabilityAgentParamsSchema } from '../../../src/http/endpoints/internal-capability-agent.js';
import { CapabilityAgentScopeSchema } from '../../../src/capability/capability-call-context.js';
import { DevProductionJobSchema } from '../../../src/capability/dev/production-job.js';
import { DevProductionProgressSchema } from '../../../src/capability/dev/production-progress.js';

const contract = http.getDevProductionProgressContract;
const scope = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
const params = { agentId: scope.agentId, jobId: 'job-1' };
const progress = {
  scope, jobId: params.jobId, requestId: 'request_12345678', projectId: 'project-1',
  reportVersion: 1, reportDigest: 'a'.repeat(64), sequence: 1,
  updatedAt: '2026-10-16T01:02:03Z', phase: 'running',
  message: 'Building the requested product.', tasks: { completed: 1, total: 3 },
};
const valid = (raw: unknown) => contract.responseSchema.safeParse(raw).success;

describe('internal dev progress', () => {
  it('exports exact metadata and domain schema without a body', () => {
    expect(contract.method === 'GET').toBe(true);
    expect(contract.path === '/internal/capability/agents/:agentId/dev/jobs/:jobId/progress').toBe(true);
    expect(contract.authType === 'secret').toBe(true);
    expect(contract.responseSchema === DevProductionProgressSchema).toBe(true);
    expect('bodySchema' in contract).toBe(false);
  });
  it('reuses public parameter and scope schema objects', () => {
    expect(contract.paramsSchema.shape.agentId === CapabilityAgentParamsSchema.shape.agentId).toBe(true);
    expect(contract.paramsSchema.shape.jobId === DevProductionJobSchema.shape.jobId).toBe(true);
    expect(contract.querySchema.shape.scope === CapabilityAgentScopeSchema).toBe(true);
  });
  it('accepts valid parameters and scope', () => {
    expect(contract.paramsSchema.safeParse(params).success).toBe(true);
    expect(contract.querySchema.safeParse({ scope }).success).toBe(true);
  });
  it('rejects missing and empty parameters', () => {
    for (const value of [{}, { agentId: params.agentId }, { jobId: params.jobId },
      { ...params, agentId: '' }, { ...params, jobId: '' }]) {
      expect(contract.paramsSchema.safeParse(value).success).toBe(false);
    }
  });
  it('rejects extra parameters', () => {
    expect(contract.paramsSchema.safeParse({ ...params, extra: true }).success).toBe(false);
  });
  it('rejects missing empty and incomplete scope', () => {
    for (const value of [{}, { scope: {} }, { scope: '' },
      ...Object.keys(scope).flatMap(key => [
        { scope: { ...scope, [key]: '' } },
        { scope: Object.fromEntries(Object.entries(scope).filter(([field]) => field !== key)) },
      ])]) {
      expect(contract.querySchema.safeParse(value).success).toBe(false);
    }
  });
  it('rejects extra query fields', () => {
    expect(contract.querySchema.safeParse({ scope, extra: true }).success).toBe(false);
  });
  it('rejects extra scope fields', () => {
    expect(contract.querySchema.safeParse({ scope: { ...scope, extra: true } }).success).toBe(false);
  });
  it('accepts running and blocked snapshots with real counters', () => {
    for (const phase of ['running', 'blocked']) {
      const raw = { ...progress, phase };
      expect(valid(raw)).toBe(true);
      expect(contract.responseSchema.parse(raw).tasks).toEqual({ completed: 1, total: 3 });
    }
    expect(valid({ ...progress, tasks: { completed: 3, total: 3 } })).toBe(true);
  });
  it('rejects invalid task counters', () => {
    for (const tasks of [{ completed: 4, total: 3 }, { completed: -1, total: 3 },
      { completed: 0, total: 0 }, { completed: 0.5, total: 3 }, { completed: 1, total: 3.5 }]) {
      expect(valid({ ...progress, tasks })).toBe(false);
    }
  });
  it('rejects succeeded results with artifacts', () => {
    expect(valid({ ...progress, phase: 'succeeded', artifacts: [{ name: 'result.zip' }] })).toBe(false);
  });
  it('rejects queued responses without scope and identity', () => {
    expect(valid({ phase: 'queued', message: 'Waiting', tasks: { completed: 0, total: 1 } })).toBe(false);
    for (const field of ['scope', 'jobId', 'requestId', 'projectId', 'reportVersion', 'reportDigest']) {
      const raw = Object.fromEntries(Object.entries({ ...progress, phase: 'queued' }).filter(([key]) => key !== field));
      expect(valid(raw)).toBe(false);
    }
  });
});
