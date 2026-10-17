import { describe, it, expect } from 'vitest';
import {
  RunAttemptSchema,
  EvidenceRefSchema,
  ConsumptionSchema,
  RunOutcomeSchema,
} from '../../src/organization/run-outcome.js';

const base = {
  runId: 'run-1',
  attemptId: 'att-1',
  evidence: [{ kind: 'log', ref: 'log://run-1/1', grantsRead: false }],
  consumption: [{ unit: 'tokens', quantity: 10, state: 'settled', estimated: false }],
  recordedAt: '2026-10-14T10:00:00.000Z',
};
const variants = {
  succeeded: { ...base, status: 'succeeded' },
  failed: { ...base, status: 'failed', failureCode: 'E_TOOL' },
  cancelled: { ...base, status: 'cancelled' },
  uncertain: { ...base, status: 'uncertain', reason: 'timeout' },
};

describe('RunAttemptSchema', () => {
  const attempt = {
    runId: 'run-1',
    attemptId: 'att-1',
    attemptNumber: 1,
    startedAt: '2026-10-14T10:00:00.000Z',
    idempotencyKey: 'k-1',
  };
  it('accepts a valid attempt', () => {
    expect(RunAttemptSchema.safeParse(attempt).success).toBe(true);
  });
  it('rejects attemptNumber 0', () => {
    expect(RunAttemptSchema.safeParse({ ...attempt, attemptNumber: 0 }).success).toBe(false);
  });
  it('rejects an empty idempotencyKey', () => {
    expect(RunAttemptSchema.safeParse({ ...attempt, idempotencyKey: '' }).success).toBe(false);
  });
  it('rejects an extra field', () => {
    expect(RunAttemptSchema.safeParse({ ...attempt, x: 1 }).success).toBe(false);
  });
});

describe('EvidenceRefSchema', () => {
  const ev = { kind: 'commit', ref: 'abc', sha256: 'a'.repeat(64), grantsRead: false };
  it('accepts a valid reference with sha256', () => {
    expect(EvidenceRefSchema.safeParse(ev).success).toBe(true);
  });
  it('rejects grantsRead true', () => {
    expect(EvidenceRefSchema.safeParse({ ...ev, grantsRead: true }).success).toBe(false);
  });
  it('rejects a short sha256', () => {
    expect(EvidenceRefSchema.safeParse({ ...ev, sha256: 'abc' }).success).toBe(false);
  });
  it('rejects a kind outside the list', () => {
    expect(EvidenceRefSchema.safeParse({ ...ev, kind: 'secret' }).success).toBe(false);
  });
});

describe('ConsumptionSchema', () => {
  const c = { unit: 'usd_micros', quantity: 5, state: 'reserved', estimated: false };
  it('accepts a valid consumption', () => {
    expect(ConsumptionSchema.safeParse(c).success).toBe(true);
  });
  it('accepts unknown with estimated true', () => {
    expect(ConsumptionSchema.safeParse({ ...c, state: 'unknown', estimated: true }).success).toBe(true);
  });
  it('rejects unknown with estimated false', () => {
    expect(ConsumptionSchema.safeParse({ ...c, state: 'unknown', estimated: false }).success).toBe(false);
  });
  it('rejects a negative quantity', () => {
    expect(ConsumptionSchema.safeParse({ ...c, quantity: -1 }).success).toBe(false);
  });
});

describe('RunOutcomeSchema', () => {
  it.each(Object.entries(variants))('accepts a valid %s outcome', (_s, v) => {
    expect(RunOutcomeSchema.safeParse(v).success).toBe(true);
  });
  it('rejects uncertain without reason', () => {
    const { reason: _r, ...rest } = variants.uncertain;
    expect(RunOutcomeSchema.safeParse(rest).success).toBe(false);
  });
  it('rejects succeeded carrying a reason (uncertain relabelled)', () => {
    expect(RunOutcomeSchema.safeParse({ ...variants.uncertain, status: 'succeeded' }).success).toBe(false);
  });
  it('rejects failed without failureCode', () => {
    const { failureCode: _f, ...rest } = variants.failed;
    expect(RunOutcomeSchema.safeParse(rest).success).toBe(false);
  });
  it('rejects an uncertain reason outside the list', () => {
    expect(RunOutcomeSchema.safeParse({ ...variants.uncertain, reason: 'who_knows' }).success).toBe(false);
  });
  it('rejects evidence with grantsRead true', () => {
    const evidence = [{ kind: 'log', ref: 'x', grantsRead: true }];
    expect(RunOutcomeSchema.safeParse({ ...variants.succeeded, evidence }).success).toBe(false);
  });
  it('accepts 50 evidence entries and rejects 51', () => {
    const mk = (n: number) =>
      Array.from({ length: n }, (_, i) => ({ kind: 'log', ref: `r${i}`, grantsRead: false }));
    expect(RunOutcomeSchema.safeParse({ ...variants.succeeded, evidence: mk(50) }).success).toBe(true);
    expect(RunOutcomeSchema.safeParse({ ...variants.succeeded, evidence: mk(51) }).success).toBe(false);
  });
  it('rejects more than 10 consumption entries', () => {
    const consumption = Array.from({ length: 11 }, () => base.consumption[0]);
    expect(RunOutcomeSchema.safeParse({ ...variants.succeeded, consumption }).success).toBe(false);
  });
  it('rejects an unknown consumption with estimated false', () => {
    const consumption = [{ unit: 'tokens', quantity: 1, state: 'unknown', estimated: false }];
    expect(RunOutcomeSchema.safeParse({ ...variants.succeeded, consumption }).success).toBe(false);
  });
  it('rejects an extra field', () => {
    expect(RunOutcomeSchema.safeParse({ ...variants.succeeded, token: 'x' }).success).toBe(false);
  });
  it('rejects an unknown status', () => {
    expect(RunOutcomeSchema.safeParse({ ...base, status: 'done' }).success).toBe(false);
  });
});
