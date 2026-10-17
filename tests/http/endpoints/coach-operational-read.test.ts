import { expect, it } from 'vitest';
import * as api from '../../../src/http/index.js';
import { opening, state, definition, snapshot, budget, reservation } from '../../capability/coach-operational-fixtures.js';
import { fixtures as f } from '../../capability/meditation-contract-fixtures.js';
it('uses four full-body scoped read routes without changing legacy GET', () => {
  for (const contract of [api.coachProgramVersionReadContract, api.coachOperationalSessionReadContract, api.coachSessionRevisionsReadContract, api.coachOperationalBudgetReadContract]) { expect(contract.method).toBe('POST'); expect(contract.authType).toBe('secret'); expect(contract.path).toContain('/coach/v2/'); }
  expect(api.CoachProgramVersionReadResultSchema.safeParse({ ok: true, program: opening.program, definition, measureDefinitions: [f.CoachMeasureDefinition] }).success).toBe(true);
  expect(api.CoachOperationalBudgetReadResultSchema.safeParse({ ok: true, budget: { status: 'unknown', reason: 'usage_pending' }, reservation: null }).success).toBe(true);
  expect(api.isCoachOperationalSessionReadForRequest({ ok: true, state }, { opening, expectedRevision: 1 })).toBe(true);
  expect(api.isCoachOperationalSessionReadForRequest({ ok: true, state }, { opening, expectedRevision: 2 })).toBe(false);
  expect(api.CoachOperationalBudgetReadRequestSchema.safeParse({ scope: { ...opening.scope, ownerId: 'foreign' }, program: opening.program }).success).toBe(false);
  expect(api.CoachOperationalBudgetReadResultSchema.safeParse({ ok: true, budget, reservation: { ...reservation, scope: { ...reservation.scope, userId: 'foreign' } } }).success).toBe(false);
});
it('fences ordered revision pages against the same original snapshot and state revision', () => {
  const r = f.CoachSessionPlanRevision, request = { opening, expectedRevision: 3, afterSequence: 0, limit: 1 }, page = { ok: true, opening, asOfRevision: 3, revisions: [r], nextAfterSequence: r.sequence };
  expect(api.isCoachSessionRevisionsPageForRequest(page, request, snapshot)).toBe(true);
  expect(api.isCoachSessionRevisionsPageForRequest({ ...page, asOfRevision: 4 }, request, snapshot)).toBe(false);
  expect(api.isCoachSessionRevisionsPageForRequest(page, { ...request, afterSequence: r.sequence }, snapshot)).toBe(false);
  expect(api.CoachSessionRevisionsReadRequestSchema.safeParse({ ...request, limit: 101 }).success).toBe(false);
  expect(api.CoachSessionRevisionsPageSchema.safeParse({ ...page, revisions: [r, r] }).success).toBe(false);
  expect(api.CoachSessionRevisionsPageSchema.safeParse({ ...page, nextAfterSequence: r.sequence + 1 }).success).toBe(false);
  expect(api.isCoachSessionRevisionsPageForRequest({ ...page, revisions: [{ ...r, snapshotId: 'foreign-snapshot' }] }, request, snapshot)).toBe(false);
});
