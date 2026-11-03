import { describe, expect, it } from 'vitest';
import { selectDevProductionJobsPage } from '../../../src/http/endpoints/index.js';

const scope = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
function job(jobId: string, identity: Record<string, string> = scope) {
  return {
    version: 1, scope: identity, jobId, requestId: 'request_12345678', projectId: 'project-1',
    session: { scope: identity, sessionId: 'session-1', target: { kind: 'local', deviceId: 'device-1' }, engines: ['codex', 'claude'] },
    productKind: 'code', instruction: 'Create the requested deliverable.', reportVersion: 1,
    reportDigest: 'a'.repeat(64), configVersion: 0, keyVersion: 1,
    limits: { maxDurationSeconds: 600, maxAttempts: 2, maxTasks: 3 },
  };
}
const jobs = (count: number, identity: Record<string, string> = scope) => Array.from({ length: count }, (_, i) => job(`job-${i + 1}`, identity));

describe('bridge228', () => {
  it('preserves a matching page and cursor', () => {
    const raw = { items: [job('job-2'), job('job-1')], nextCursor: 'opaque-1' };
    const selected = selectDevProductionJobsPage(raw, { scope, cursor: 'c', limit: 2 });
    expect(selected).toEqual(raw);
    expect(selected?.items.map(item => item.jobId)).toEqual(['job-2', 'job-1']);
    expect(selected?.nextCursor).toBe('opaque-1');
  });

  it('rejects each foreign scope component', () => {
    for (const key of ['tenantId', 'ownerId', 'agentId'] as const) {
      const foreign = { ...scope, [key]: `${scope[key]}-other` };
      expect(selectDevProductionJobsPage({ items: jobs(2, foreign), nextCursor: null }, { scope, limit: 5 })).toBeNull();
    }
  });

  it('rejects a page exceeding requested limit', () => {
    expect(selectDevProductionJobsPage({ items: jobs(3), nextCursor: null }, { scope, limit: 2 })).toBeNull();
    expect(selectDevProductionJobsPage({ items: jobs(2), nextCursor: null }, { scope, limit: 2 })).not.toBeNull();
  });

  it('uses canonical default limit', () => {
    expect(selectDevProductionJobsPage({ items: jobs(20), nextCursor: null }, { scope })?.items).toHaveLength(20);
    expect(selectDevProductionJobsPage({ items: jobs(21), nextCursor: null }, { scope })).toBeNull();
  });

  it('distinguishes valid empty page from invalid response', () => {
    const empty = { items: [], nextCursor: null };
    expect(selectDevProductionJobsPage(empty, { scope })).toEqual(empty);
    expect(selectDevProductionJobsPage(empty, { scope: { tenantId: 'tenant-1' } })).toBeNull();
    expect(selectDevProductionJobsPage(empty, { scope, limit: 0 })).toBeNull();
    expect(selectDevProductionJobsPage(empty, { scope, extra: true } as never)).toBeNull();
    expect(selectDevProductionJobsPage({ items: [], nextCursor: null, extra: 1 }, { scope })).toBeNull();
    expect(selectDevProductionJobsPage({ items: [{ jobId: 'x' }], nextCursor: null }, { scope })).toBeNull();
    expect(selectDevProductionJobsPage(null, { scope })).toBeNull();
  });

  it('returns detached data without changing inputs', () => {
    const raw = { items: [job('job-1')], nextCursor: ' opaque ' };
    const query = { scope: { ...scope }, limit: 3 };
    const rawBefore = structuredClone(raw);
    const queryBefore = structuredClone(query);
    const selected = selectDevProductionJobsPage(raw, query);
    expect(selected).not.toBeNull();
    expect(raw).toEqual(rawBefore);
    expect(query).toEqual(queryBefore);
    expect(selected).not.toBe(raw);
    expect(selected?.items[0]).not.toBe(raw.items[0]);
    expect(selected?.items[0]?.scope).not.toBe(raw.items[0]?.scope);
    expect(selected?.nextCursor).toBe('opaque');
    selected!.items[0]!.jobId = 'changed';
    expect(raw.items[0]?.jobId).toBe('job-1');
  });
});
