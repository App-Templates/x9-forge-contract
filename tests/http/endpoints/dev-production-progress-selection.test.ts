import { describe, expect, it } from 'vitest';
import { selectDevProductionProgressSnapshot as select } from '../../../src/http/index.js';
import * as endpoint from '../../../src/http/endpoints/internal-dev-progress.js';

const scope = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
const job = {
  version: 1, scope, jobId: 'job-1', requestId: 'request_12345678', projectId: 'project-1',
  session: { scope, sessionId: 'session-1', target: { kind: 'local', deviceId: 'device-1' }, engines: ['codex'] },
  productKind: 'code', instruction: 'Build the requested product.', reportVersion: 1,
  reportDigest: 'a'.repeat(64), configVersion: 0, keyVersion: 1,
  limits: { maxDurationSeconds: 600, maxAttempts: 1, maxTasks: 3 },
};
const snap = (sequence: number, extra: Record<string, unknown> = {}) => ({
  scope, jobId: job.jobId, requestId: job.requestId, projectId: job.projectId,
  reportVersion: job.reportVersion, reportDigest: job.reportDigest,
  sequence, updatedAt: '2026-10-16T01:02:03Z', phase: 'running',
  message: 'Building the requested product.', tasks: { completed: 1, total: 3 }, ...extra,
});
const foreign = (sequence: number) => [
  snap(sequence, { scope: { ...scope, ownerId: 'owner-2' } }),
  snap(sequence, { jobId: 'job-2' }),
  snap(sequence, { reportDigest: 'b'.repeat(64) }),
];

describe('bridge224', () => {
  it('exports the selector from the HTTP barrel', () => {
    expect(select === endpoint.selectDevProductionProgressSnapshot).toBe(true);
  });
  it('selects the first valid snapshot from null', () => {
    expect(select(null, snap(1), job)).toEqual(snap(1));
  });
  it('replaces the current snapshot with a higher sequence', () => {
    expect(select(snap(1), snap(2), job)?.sequence).toBe(2);
  });
  it('keeps the current snapshot for an equal sequence', () => {
    const result = select(snap(2, { message: 'Current text.' }), snap(2, { message: 'Other text.' }), job);
    expect(result?.message === 'Current text.').toBe(true);
  });
  it('keeps the current snapshot for a lower sequence with a later timestamp', () => {
    const result = select(snap(3), snap(2, { updatedAt: '2026-10-16T05:00:00Z' }), job);
    expect(result?.sequence === 3).toBe(true);
  });
  it('rejects a higher sequence from another owner, job or report', () => {
    expect(foreign(2).every(variant => select(snap(1), variant, job)?.sequence === 1)).toBe(true);
  });
  it('keeps the current snapshot when the incoming one is malformed', () => {
    const bad = [snap(2, { phase: 'done' }), snap(2, { extra: true }), null, 'text'];
    expect(bad.every(variant => select(snap(1), variant, job)?.sequence === 1)).toBe(true);
  });
  it('does not let a foreign or invalid current block the first valid incoming', () => {
    const blocked = [...foreign(5), snap(5, { sequence: 0 }), 'text'];
    expect(blocked.every(current => select(current, snap(1), job)?.sequence === 1)).toBe(true);
  });
  it('returns null for an invalid expected job', () => {
    expect(select(snap(1), snap(2), { ...job, jobId: '' })).toBe(null);
    expect(select(snap(1), snap(2), null)).toBe(null);
  });
  it('returns null when neither snapshot is usable', () => {
    expect(select(null, snap(1, { phase: 'done' }), job)).toBe(null);
  });
  it('returns independent parsed copies', () => {
    const incoming = snap(2);
    const result = select(snap(1), incoming, job);
    expect(result !== incoming).toBe(true);
    expect(result?.tasks !== incoming.tasks && result?.scope !== incoming.scope).toBe(true);
    const current = snap(3);
    const kept = select(current, snap(2), job);
    expect(kept !== current && kept?.tasks !== current.tasks).toBe(true);
  });
  it('does not mutate its inputs', () => {
    const current = snap(1);
    const incoming = snap(2);
    const frozenJob = structuredClone(job);
    const expected = structuredClone({ current, incoming, frozenJob });
    const result = select(current, incoming, job);
    if (result !== null) result.tasks.completed = 99;
    expect({ current, incoming, frozenJob }).toEqual(expected);
  });
});
