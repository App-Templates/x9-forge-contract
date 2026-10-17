import { expect, it } from 'vitest';
import { CoachExecutionStartRequestSchema as Request, CoachExecutionStartResultSchema as Start, CoachExecutionEventResultSchema as Event, isCoachExecutionStartResultForRequest as starts, isCoachExecutionEventResultForRequest as eventFor } from '../../src/capability/index.js';
import { metadata, snapshot, projection, response } from './coach-operational-fixtures.js';
import { fixtures as f } from './meditation-contract-fixtures.js';
it('starts only a server-produced definitive plan after mutable drafts', () => {
  const value = { ok: true, requestId: metadata.requestId, replayed: false, snapshot, revision: 1, projection };
  expect(Request.safeParse(metadata).success).toBe(true); expect(starts(value, metadata)).toBe(true);
  expect(Request.safeParse({ ...metadata, snapshot }).success).toBe(false);
  expect(Start.safeParse({ ...value, projection: { ...projection, strategy: { ...projection.strategy, strategyVersion: 'foreign' } } }).success).toBe(false);
  expect(starts({ ...value, snapshot: { ...snapshot, opening: { ...snapshot.opening, scope: { ...snapshot.opening.scope, userId: 'foreign' } } } }, metadata)).toBe(false);
});
it('keeps original execution through events, revisions and late callbacks', () => {
  const request = { ...metadata, event: { kind: 'safety', payload: {} } }, value = { ...response, initialSnapshot: snapshot, appliedRevision: f.CoachSessionPlanRevision, projection, decisionCodes: [] };
  expect(Event.safeParse(value).success).toBe(true); expect(eventFor(value, request, snapshot)).toBe(true);
  expect(eventFor(value, request, { ...snapshot, totalSeconds: snapshot.totalSeconds + 1 })).toBe(false);
  expect(Event.safeParse({ ...value, initialSnapshot: null }).success).toBe(false);
  expect(Event.safeParse({ ...value, initialSnapshot: null, appliedRevision: null }).success).toBe(true);
});
