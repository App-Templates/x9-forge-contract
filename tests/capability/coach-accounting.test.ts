import { expect, it } from 'vitest';
import { CoachProviderUsageSchema as Usage, CoachPracticeObservationSchema as Practice, CoachSessionAccountingSchema as Accounting } from '../../src/capability/index.js';
import { fixtures as f } from './meditation-contract-fixtures.js';
const u = f.CoachProviderUsage, p = f.CoachPracticeObservation, a = f.CoachSessionAccounting;
it('preserves intake-only usage without invented practice or credit', () => {
  expect(Usage.safeParse(u).success).toBe(true); expect(Practice.safeParse(p).success).toBe(true); expect(Accounting.safeParse(a).success).toBe(true);
  expect(Accounting.safeParse({ ...a, snapshotId: null, practice: null, progressionCredit: false, usage: { ...u, snapshotId: null }, outcome: 'abandoned' }).success).toBe(true);
});
it('does not promote estimates or unavailable evidence to billing', () => {
  expect(Usage.safeParse({ ...u, source: 'estimate', billableSeconds: 1 }).success).toBe(false);
  expect(Usage.safeParse({ ...u, source: 'pending', billableSeconds: null, durationSeconds: null, confidence: null }).success).toBe(true);
  expect(Usage.safeParse({ ...u, source: 'pending', billableSeconds: null }).success).toBe(false);
  expect(Usage.safeParse({ ...u, source: 'provider-report', billableSeconds: null }).success).toBe(true);
  expect(Usage.safeParse({ ...u, source: 'provider-report', billableSeconds: 0 }).success).toBe(true);
  expect(Usage.safeParse({ ...u, observedAt: '2000-01-01T00:00:00Z' }).success).toBe(false);
});
it('requires actual bounded guided practice and matching original references', () => {
  const guided = { ...a, snapshotId: p.snapshotId, practice: p, usage: { ...u, snapshotId: p.snapshotId }, outcome: 'completed', progressionCredit: true };
  expect(Accounting.safeParse(guided).success).toBe(true);
  expect(Accounting.safeParse({ ...guided, outcome: 'interrupted' }).success).toBe(false);
  expect(Accounting.safeParse({ ...guided, practice: null }).success).toBe(false);
  expect(Practice.safeParse({ ...p, guidedSeconds: 100000 }).success).toBe(false);
  expect(Accounting.safeParse({ ...a, outcome: 'interrupted', progressionCredit: true }).success).toBe(false);
  expect(Accounting.safeParse({ ...a, practice: null, progressionCredit: true }).success).toBe(false);
  expect(Accounting.safeParse({ ...a, usage: { ...u, openingId: 'foreign' } }).success).toBe(false);
  expect(Accounting.safeParse({ ...a, practice: { ...p, scope: { ...p.scope, userId: 'foreign' } } }).success).toBe(false);
});
