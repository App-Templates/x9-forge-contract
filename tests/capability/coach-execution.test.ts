import { expect, it } from 'vitest';
import { CoachSessionOpeningRefSchema as Opening, CoachSessionExecutionSnapshotSchema as Snapshot, CoachSessionPlanRevisionSchema as Revision, isCoachExecutionSnapshotForOpening as forOpening, isCoachSessionPlanRevisionForSnapshot as forSnapshot } from '../../src/capability/index.js';
import { fixtures as f } from './meditation-contract-fixtures.js';
const s = f.CoachSessionExecutionSnapshot, r = f.CoachSessionPlanRevision;
it('preserves opening, definitive execution and separate applied revision', () => {
  expect(Opening.safeParse(s.opening).success).toBe(true); expect(Snapshot.safeParse(s).success).toBe(true); expect(Revision.safeParse(r).success).toBe(true);
  expect(forOpening(s, s.opening)).toBe(true); expect(forSnapshot(r, s)).toBe(true);
  expect(forOpening(s, Object.fromEntries(Object.entries(s.opening).reverse()))).toBe(true);
});
it.each(['userId', 'tenantId', 'ownerId', 'agentId'])('rejects foreign %s', key => {
  const opening = { ...s.opening, scope: { ...s.opening.scope, [key]: 'foreign' } };
  expect(forOpening(s, opening)).toBe(false);
  expect(forSnapshot({ ...r, scope: { ...r.scope, [key]: 'foreign' } }, s)).toBe(false);
});
it('checks versions, snapshot identity and ordered time', () => {
  expect(Opening.safeParse({ ...s.opening, program: { ...s.opening.program, scope: { ...s.opening.program.scope, ownerId: 'foreign' } } }).success).toBe(false);
  expect(Snapshot.safeParse({ ...s, segments: [{ ...s.segments[0], durationSeconds: 10 }, { ...s.segments[0], segmentId: 'second', offsetSeconds: 1 }] }).success).toBe(false);
  expect(forOpening(s, { ...s.opening, program: { ...s.opening.program, programVersion: 2 } })).toBe(false);
  expect(forSnapshot({ ...r, snapshotId: 'other' }, s)).toBe(false);
  expect(forSnapshot({ ...r, appliedAt: '2000-01-01T00:00:00Z' }, s)).toBe(false);
  expect(forSnapshot({ ...r, effectiveFromSeconds: s.totalSeconds + 1 }, s)).toBe(false);
  expect(Snapshot.safeParse({ ...s, startedAt: '2000-01-01T00:00:00Z' }).success).toBe(false);
  expect(Snapshot.safeParse({ ...s, segments: [s.segments[0], s.segments[0]] }).success).toBe(false);
  expect(Snapshot.safeParse({ ...s, segments: [{ ...s.segments[0], offsetSeconds: s.totalSeconds }] }).success).toBe(false);
  expect(forOpening(null, s.opening)).toBe(false);
});
