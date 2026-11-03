import { expect, it } from 'vitest';
import { CoachOpeningRequestSchema as Request, CoachOpeningResultSchema as Result, CoachOperationalBudgetStateSchema as Budget, CoachReservationSchema as Reservation } from '../../src/capability/index.js';
import { opening, budget, reservation } from './coach-operational-fixtures.js';
const request = { requestId: 'open-test', scope: opening.scope, program: opening.program, appliedConfigVersion: opening.appliedConfigVersion }, result = { ok: true, replayed: false, opening, revision: 0, budget, reservation };
it('opens before execution using known reserved scoped quota', () => {
  expect(Request.safeParse(request).success).toBe(true); expect(Result.safeParse(result).success).toBe(true);
  expect(Budget.safeParse({ status: 'unknown', reason: 'usage_pending' }).success).toBe(true);
  expect(Budget.safeParse({ status: 'unknown', reason: 'usage_pending', usedSeconds: 0 }).success).toBe(false);
});
it('denies client authority, unknown budget, incoherent quota and foreign opening', () => {
  expect(Request.safeParse({ ...request, openedAt: opening.openedAt }).success).toBe(false);
  expect(Request.safeParse({ ...request, scope: { ...opening.scope, ownerId: 'foreign' } }).success).toBe(false);
  expect(Result.safeParse({ ...result, budget: { status: 'unknown', reason: 'usage_pending' } }).success).toBe(false);
  expect(Result.safeParse({ ...result, reservation: { ...reservation, openingId: 'foreign' } }).success).toBe(false);
  expect(Budget.safeParse({ ...budget, quota: { ...budget.quota, remainingSeconds: 1 } }).success).toBe(false);
  expect(Budget.safeParse({ ...budget, quota: { ...budget.quota, remainingSeconds: budget.quota.remainingSeconds + 1 } }).success).toBe(false);
  expect(Result.safeParse({ ...result, reservation: { ...reservation, limitSeconds: budget.quota.limitSeconds + 1 } }).success).toBe(false);
  expect(Reservation.safeParse({ ...reservation, limitSeconds: 0 }).success).toBe(false);
  expect(Reservation.safeParse({ ...reservation, updatedAt: '2000-01-01T00:00:00Z' }).success).toBe(false);
});
