import { expect, it } from 'vitest';
import { CoachUsageObserveRequestSchema as Request, CoachUsageObserveResultSchema as Result, CoachOperationalSessionReadSchema as Read } from '../../src/capability/index.js';
import { opening, state, budget, reservation, snapshot, accounting } from './coach-operational-fixtures.js';
import { fixtures as f } from './meditation-contract-fixtures.js';
it('preserves usage before guide-start with independent refinement revision', () => {
  const request = { requestId: 'usage-test-1', opening, expectedUsageRevision: null, observation: f.CoachProviderUsage };
  expect(Request.safeParse(request).success).toBe(true);
  expect(Request.safeParse({ ...request, observation: { ...request.observation, openingId: 'foreign' } }).success).toBe(false);
  expect(Result.safeParse({ ok: true, requestId: 'usage-test-1', replayed: true, usage: request.observation, usageRevision: 1, budget, reservation }).success).toBe(true);
  expect(Read.safeParse(state).success).toBe(true);
});
it('distinguishes lifecycle and correlates all evidence and definitions', () => {
  const executing = { ...state, lifecycle: 'executing', initialSnapshot: snapshot, measures: [] };
  expect(Read.safeParse(executing).success).toBe(true);
  expect(Read.safeParse({ ...state, lifecycle: 'executing' }).success).toBe(false);
  expect(Read.safeParse({ ...executing, lifecycle: 'execution_ended' }).success).toBe(false);
  expect(Read.safeParse({ ...executing, lifecycle: 'closed', accounting, practice: accounting.practice }).success).toBe(true);
  expect(Read.safeParse({ ...state, lifecycle: 'closed' }).success).toBe(false);
  expect(Read.safeParse({ ...state, measureDefinitions: [{ ...f.CoachMeasureDefinition, unit: 'foreign' }] }).success).toBe(false);
  expect(Read.safeParse({ ...state, measureDefinitions: [f.CoachMeasureDefinition, f.CoachMeasureDefinition] }).success).toBe(false);
  expect(Read.safeParse({ ...state, reservation: { ...reservation, openingId: 'foreign' } }).success).toBe(false);
});
