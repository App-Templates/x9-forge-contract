import { expect, it } from 'vitest';
import { CoachRollingBudgetSchema as Budget, CoachSessionQuotaSchema as Quota, coachRollingRemainingSeconds as remaining } from '../../src/capability/index.js';
import { fixtures as f } from './meditation-contract-fixtures.js';
const b = f.CoachRollingBudget, q = f.CoachSessionQuota;
it('uses explicit rolling window and saturates exhaustion without confusing invalid input', () => {
  expect(Budget.safeParse(b).success).toBe(true); expect(Quota.safeParse(q).success).toBe(true);
  expect(remaining({ ...b, usedSeconds: b.limitSeconds + 1 })).toBe(0); expect(remaining(null)).toBeNull();
  expect(remaining({ ...b, windowSeconds: b.windowSeconds + 1 })).toBeNull();
  expect(Quota.safeParse({ ...q, limitSeconds: q.remainingSeconds + q.shareLimitSeconds + 1 }).success).toBe(false);
  expect(Budget.safeParse({ ...b, windowSeconds: 366 * 86400 + 1 }).success).toBe(false);
});
