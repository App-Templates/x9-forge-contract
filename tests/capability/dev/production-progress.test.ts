import { describe, expect, it } from 'vitest';
import { DevProductionProgressSchema as schema, isDevProductionProgressForJob as matches } from '../../../src/capability/dev/production-progress.js';
import { DevProductionJobSchema } from '../../../src/capability/dev/production-job.js';

const scope = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
const job = {
  version: 1, scope, jobId: 'job-1', requestId: 'request_12345678', projectId: 'project-1',
  session: { scope, sessionId: 'session-1', target: { kind: 'local', deviceId: 'device-1' }, engines: ['codex'] },
  productKind: 'code', instruction: 'Build the requested product.', reportVersion: 1,
  reportDigest: 'a'.repeat(64), configVersion: 0, keyVersion: 1,
  limits: { maxDurationSeconds: 600, maxAttempts: 1, maxTasks: 3 },
};
const progress = {
  scope, jobId: job.jobId, requestId: job.requestId, projectId: job.projectId,
  reportVersion: job.reportVersion, reportDigest: job.reportDigest,
  sequence: 1, updatedAt: '2026-10-16T01:02:03Z', phase: 'running',
  message: 'Building the requested product.', tasks: { completed: 0, total: 1 },
};

describe('dev production progress', () => {
  it('accepts queued', () => {
    expect(schema.safeParse({ ...progress, phase: 'queued' }).success).toBe(true);
  });

  it('accepts running', () => {
    expect(schema.safeParse({ ...progress, phase: 'running' }).success).toBe(true);
  });

  it('accepts blocked', () => {
    expect(schema.safeParse({ ...progress, phase: 'blocked' }).success).toBe(true);
  });

  it('accepts stopping', () => {
    expect(schema.safeParse({ ...progress, phase: 'stopping' }).success).toBe(true);
  });

  it('accepts zero completed and correlates the job', () => {
    expect(schema.safeParse(progress).success).toBe(true);
    expect(DevProductionJobSchema.safeParse(job).success).toBe(true);
    expect(matches(progress, job)).toBe(true);
  });

  it('accepts one of one still running', () => {
    const candidate = { ...progress, tasks: { completed: 1, total: 1 } };
    expect(schema.safeParse(candidate).success).toBe(true);
  });

  it('trims message', () => {
    expect(schema.parse({ ...progress, message: '  Work  ' }).message === 'Work').toBe(true);
  });

  it('rejects zero total', () => {
    expect(!schema.safeParse({ ...progress, tasks: { completed: 0, total: 0 } }).success).toBe(true);
  });

  it('rejects negative completed', () => {
    expect(!schema.safeParse({ ...progress, tasks: { completed: -1, total: 1 } }).success).toBe(true);
  });

  it('rejects completed fraction', () => {
    expect(!schema.safeParse({ ...progress, tasks: { completed: 0.5, total: 1 } }).success).toBe(true);
  });

  it('rejects total fraction', () => {
    expect(!schema.safeParse({ ...progress, tasks: { completed: 0, total: 1.5 } }).success).toBe(true);
  });

  it('rejects completed exceeds total', () => {
    expect(!schema.safeParse({ ...progress, tasks: { completed: 2, total: 1 } }).success).toBe(true);
  });

  it('rejects task extras', () => {
    expect(!schema.safeParse({ ...progress, tasks: { completed: 0, total: 1, extra: true } }).success).toBe(true);
  });

  it('rejects sequence zero', () => {
    expect(!schema.safeParse({ ...progress, sequence: 0 }).success).toBe(true);
  });

  it('rejects sequence fraction', () => {
    expect(!schema.safeParse({ ...progress, sequence: 1.5 }).success).toBe(true);
  });

  it('rejects invalid timestamp', () => {
    expect(!schema.safeParse({ ...progress, updatedAt: 'yesterday' }).success).toBe(true);
  });

  it('rejects succeeded phase', () => {
    expect(!schema.safeParse({ ...progress, phase: 'succeeded' }).success).toBe(true);
  });

  it('rejects finished phase', () => {
    expect(!schema.safeParse({ ...progress, phase: 'finished' }).success).toBe(true);
  });

  it('rejects empty message', () => {
    expect(!schema.safeParse({ ...progress, message: '' }).success).toBe(true);
  });

  it('rejects blank message', () => {
    expect(!schema.safeParse({ ...progress, message: '   ' }).success).toBe(true);
  });

  it('rejects long message', () => {
    expect(!schema.safeParse({ ...progress, message: 'x'.repeat(1001) }).success).toBe(true);
  });

  it('rejects artifacts', () => {
    expect(!schema.safeParse({ ...progress, artifacts: [] }).success).toBe(true);
  });

  it('accepts maximum message length', () => {
    expect(schema.safeParse({ ...progress, message: 'x'.repeat(1000) }).success).toBe(true);
  });

  it('inherits scope validation', () => {
    expect(!schema.safeParse({ ...progress, scope: { ...scope, tenantId: '' } }).success).toBe(true);
  });

  it('inherits jobId validation', () => {
    expect(!schema.safeParse({ ...progress, jobId: '' }).success).toBe(true);
  });

  it('inherits requestId validation', () => {
    expect(!schema.safeParse({ ...progress, requestId: 'short' }).success).toBe(true);
  });

  it('inherits projectId validation', () => {
    expect(!schema.safeParse({ ...progress, projectId: '' }).success).toBe(true);
  });

  it('inherits reportVersion validation', () => {
    expect(!schema.safeParse({ ...progress, reportVersion: 0 }).success).toBe(true);
  });

  it('inherits reportDigest validation', () => {
    expect(!schema.safeParse({ ...progress, reportDigest: 'not-a-digest' }).success).toBe(true);
  });

  it('rejects different jobId', () => {
    const candidate = { ...progress, jobId: 'job-2' };
    expect(schema.safeParse(candidate).success).toBe(true);
    expect(DevProductionJobSchema.safeParse(job).success).toBe(true);
    expect(!matches(candidate, job)).toBe(true);
  });

  it('rejects different requestId', () => {
    const candidate = { ...progress, requestId: 'request_87654321' };
    expect(schema.safeParse(candidate).success).toBe(true);
    expect(DevProductionJobSchema.safeParse(job).success).toBe(true);
    expect(!matches(candidate, job)).toBe(true);
  });

  it('rejects different projectId', () => {
    const candidate = { ...progress, projectId: 'project-2' };
    expect(schema.safeParse(candidate).success).toBe(true);
    expect(DevProductionJobSchema.safeParse(job).success).toBe(true);
    expect(!matches(candidate, job)).toBe(true);
  });

  it('rejects different reportVersion', () => {
    const candidate = { ...progress, reportVersion: 2 };
    expect(schema.safeParse(candidate).success).toBe(true);
    expect(DevProductionJobSchema.safeParse(job).success).toBe(true);
    expect(!matches(candidate, job)).toBe(true);
  });

  it('rejects different reportDigest', () => {
    const candidate = { ...progress, reportDigest: 'b'.repeat(64) };
    expect(schema.safeParse(candidate).success).toBe(true);
    expect(DevProductionJobSchema.safeParse(job).success).toBe(true);
    expect(!matches(candidate, job)).toBe(true);
  });

  it('rejects different tenantId', () => {
    const candidate = { ...progress, scope: { ...scope, tenantId: 'other' } };
    expect(schema.safeParse(candidate).success).toBe(true);
    expect(DevProductionJobSchema.safeParse(job).success).toBe(true);
    expect(!matches(candidate, job)).toBe(true);
  });

  it('rejects different ownerId', () => {
    const candidate = { ...progress, scope: { ...scope, ownerId: 'other' } };
    expect(schema.safeParse(candidate).success).toBe(true);
    expect(DevProductionJobSchema.safeParse(job).success).toBe(true);
    expect(!matches(candidate, job)).toBe(true);
  });

  it('rejects different agentId', () => {
    const candidate = { ...progress, scope: { ...scope, agentId: 'other' } };
    expect(schema.safeParse(candidate).success).toBe(true);
    expect(DevProductionJobSchema.safeParse(job).success).toBe(true);
    expect(!matches(candidate, job)).toBe(true);
  });

  it('rejects invalid progress before correlation', () => {
    expect(!matches({ ...progress, sequence: 0 }, job)).toBe(true);
  });

  it('rejects invalid job before correlation', () => {
    expect(!matches(progress, { ...job, instruction: '' })).toBe(true);
  });

  it('rejects absent inputs', () => {
    expect(!matches(null, job)).toBe(true);
    expect(!matches(progress, null)).toBe(true);
  });
});
