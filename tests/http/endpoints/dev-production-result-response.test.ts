import { describe, expect, it } from 'vitest';
import * as http from '../../../src/http/index.js';
import { DevProductionJobSchema } from '../../../src/capability/dev/production-job.js';
import { DevProductionResultSchema } from '../../../src/capability/dev/production-result.js';

const scope = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
const job = DevProductionJobSchema.parse({
  version: 1, scope, jobId: 'job-1', requestId: 'request_12345678', projectId: 'project-1',
  session: { scope, sessionId: 'session-1', target: { kind: 'local', deviceId: 'device-1' }, engines: ['codex', 'claude'] },
  productKind: 'code', instruction: 'Create the requested deliverable.', reportVersion: 1,
  reportDigest: 'a'.repeat(64), configVersion: 0, keyVersion: 1,
  limits: { maxDurationSeconds: 600, maxAttempts: 2, maxTasks: 3 },
});
const base = {
  scope, jobId: job.jobId, requestId: job.requestId, projectId: job.projectId, sessionId: job.session.sessionId,
  productKind: job.productKind, reportVersion: job.reportVersion, reportDigest: job.reportDigest,
  finishedAt: '2026-10-16T01:02:03Z',
};
const succeeded = {
  ...base, status: 'succeeded',
  artifacts: [{ artifactRef: 'artifact-1', mediaType: 'application/zip', bytes: 128, sha256: 'c'.repeat(64) }],
  verification: { kind: 'tests', passed: 3, total: 3 },
};
const pending = { status: 'pending', jobId: job.jobId, requestId: job.requestId };
const finished = (result: Record<string, unknown>) => ({ status: 'finished', result });
const correlated = (response: unknown, expected: unknown = job) => http.isDevProductionResultResponseForJob(response, expected);

describe('bridge223', () => {
  it('accepts a pending response for the same job and request', () => {
    expect(correlated(pending)).toBe(true);
  });
  it('rejects a pending response with another job id', () => {
    expect(correlated({ ...pending, jobId: 'job-2' })).toBe(false);
  });
  it('rejects a pending response with another request id', () => {
    expect(correlated({ ...pending, requestId: 'request_87654321' })).toBe(false);
  });
  it('rejects a response that breaks the shared response schema', () => {
    expect(correlated({ ...pending, extra: true })).toBe(false);
  });
  it('rejects an invalid expected job', () => {
    expect(DevProductionJobSchema.safeParse({ ...job, extra: true }).success).toBe(false);
    expect(correlated(pending, { ...job, extra: true })).toBe(false);
  });
  it('accepts a finished succeeded result with its proofs', () => {
    expect(DevProductionResultSchema.safeParse(succeeded).success).toBe(true);
    expect(correlated(finished(succeeded))).toBe(true);
  });
  it('keeps failed, blocked, cancelled and uncertain statuses intact', () => {
    for (const status of ['failed', 'blocked', 'cancelled', 'uncertain']) {
      const response = finished({ ...base, status, reason: 'Stopped before delivery' });
      expect(correlated(response)).toBe(true);
      expect(response.result.status).toBe(status);
    }
  });
  it('rejects finished results for a second owner or agent', () => {
    for (const other of [{ ...scope, ownerId: 'owner-2' }, { ...scope, agentId: 'agent-2' }]) {
      expect(correlated(finished({ ...succeeded, scope: other }))).toBe(false);
      expect(correlated(finished({ ...base, scope: other, status: 'failed', reason: 'x' }))).toBe(false);
    }
  });
  it('rejects finished results with a foreign digest or request id', () => {
    expect(correlated(finished({ ...succeeded, reportDigest: 'd'.repeat(64) }))).toBe(false);
    expect(correlated(finished({ ...succeeded, requestId: 'request_87654321' }))).toBe(false);
  });
  it('delegates finished correlation to the result helper', () => {
    const other = DevProductionJobSchema.parse({ ...job, reportDigest: 'd'.repeat(64) });
    expect(correlated(finished(succeeded), other)).toBe(false);
  });
});
