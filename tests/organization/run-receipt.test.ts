import { describe, expect, it } from 'vitest';
import {
  ConsumptionCapSchema,
  RequestStopResultSchema,
  RunReceiptSchema,
} from '../../src/organization/index.js';
import { ConsumptionSchema } from '../../src/organization/run-outcome.js';
import { StopReasonSchema } from '../../src/organization/operations.js';
import { INTERNAL_SECRET_HEADER } from '../../src/auth/index.js';
import {
  INTERNAL_RUN_STOP_PATH,
  InternalRunStopRequestSchema,
  InternalRunStopResponseSchema,
  internalRunStopContract,
} from '../../src/http/endpoints/index.js';

const consumption = { unit: 'tokens', quantity: 12, state: 'settled', estimated: false };
const receipt = {
  runId: 'run-1',
  state: 'settled',
  consumption,
  updatedAt: '2026-10-14T10:00:00.000Z',
};

describe('RunReceiptSchema', () => {
  it.each(['running', 'stop_requested', 'stopped', 'settled'])('accepts state %s', (state) => {
    expect(RunReceiptSchema.safeParse({ ...receipt, state }).success).toBe(true);
  });

  it('preserves unknown consumption only when explicitly estimated', () => {
    const { estimated: _estimated, ...amount } = consumption;
    expect(RunReceiptSchema.safeParse({
      ...receipt, consumption: { ...amount, state: 'unknown', estimated: true },
    }).success).toBe(true);
    for (const value of [
      { ...amount, state: 'unknown' },
      { ...amount, state: 'unknown', estimated: false },
    ]) {
      expect(RunReceiptSchema.safeParse({ ...receipt, consumption: value }).success).toBe(false);
    }
  });

  it('rejects settled without consumption', () => {
    const { consumption: _consumption, ...missing } = receipt;
    expect(RunReceiptSchema.safeParse(missing).success).toBe(false);
  });

  it('rejects extra fields on the receipt and its consumption', () => {
    expect(RunReceiptSchema.safeParse({ ...receipt, extra: true }).success).toBe(false);
    expect(RunReceiptSchema.safeParse({
      ...receipt, consumption: { ...consumption, extra: true },
    }).success).toBe(false);
  });

  it('validates run identity, state, timestamp and stop reason', () => {
    for (const invalid of [
      { runId: '' }, { state: 'done' }, { updatedAt: 'yesterday' }, { stopReason: 'other' },
    ]) {
      expect(RunReceiptSchema.safeParse({ ...receipt, ...invalid }).success).toBe(false);
    }
    for (const stopReason of StopReasonSchema.options) {
      expect(RunReceiptSchema.safeParse({ ...receipt, stopReason }).success).toBe(true);
    }
    expect(RunReceiptSchema.shape.consumption).toBe(ConsumptionSchema);
  });
});

describe('RequestStopResultSchema', () => {
  it.each(['accepted', 'already_stopped', 'unknown_run'])('accepts strict result %s', (status) => {
    const result = { runId: 'run-1', status };
    expect(RequestStopResultSchema.safeParse(result).success).toBe(true);
    expect(RequestStopResultSchema.safeParse({ ...result, extra: true }).success).toBe(false);
    expect(RequestStopResultSchema.safeParse({ ...result, runId: '' }).success).toBe(false);
  });
  it('rejects missing or unsupported status', () => {
    expect(RequestStopResultSchema.safeParse({ runId: 'run-1' }).success).toBe(false);
    expect(RequestStopResultSchema.safeParse({ runId: 'run-1', status: 'stopped' }).success).toBe(false);
  });
});

describe('ConsumptionCapSchema', () => {
  it('reuses consumption units and accepts absent, zero or positive limits', () => {
    expect(ConsumptionCapSchema.shape.unit).toBe(ConsumptionSchema.shape.unit);
    for (const unit of ConsumptionSchema.shape.unit.options) {
      expect(ConsumptionCapSchema.safeParse({ unit }).success).toBe(true);
      expect(ConsumptionCapSchema.safeParse({ unit, limit: 0 }).success).toBe(true);
      expect(ConsumptionCapSchema.safeParse({ unit, limit: 12 }).success).toBe(true);
    }
  });
  it.each([-1, 0.5, Infinity, NaN, '12', null])('rejects invalid limit %s', (limit) => {
    expect(ConsumptionCapSchema.safeParse({ unit: 'tokens', limit }).success).toBe(false);
  });
  it('rejects extra fields and missing or invalid units', () => {
    expect(ConsumptionCapSchema.safeParse({ unit: 'tokens', limit: 1, extra: true }).success).toBe(false);
    expect(ConsumptionCapSchema.safeParse({ limit: 1 }).success).toBe(false);
    expect(ConsumptionCapSchema.safeParse({ unit: 'credits', limit: 1 }).success).toBe(false);
  });
});

describe('internalRunStopContract', () => {
  it('exposes the secret-auth POST contract and reuses response and reason schemas', () => {
    expect(internalRunStopContract.method).toBe('POST');
    expect(internalRunStopContract.path).toBe(INTERNAL_RUN_STOP_PATH);
    expect(INTERNAL_RUN_STOP_PATH).toBe('/internal/runs/stop');
    expect(internalRunStopContract.authType).toBe('secret');
    expect(internalRunStopContract.authHeader).toBe(INTERNAL_SECRET_HEADER);
    expect(internalRunStopContract.bodySchema).toBe(InternalRunStopRequestSchema);
    expect(internalRunStopContract.responseSchema).toBe(RequestStopResultSchema);
    expect(InternalRunStopResponseSchema).toBe(RequestStopResultSchema);
    expect(InternalRunStopRequestSchema.shape.reason).toBe(StopReasonSchema);
  });
  it('requires a valid run and reason and refuses extra fields', () => {
    for (const reason of StopReasonSchema.options) {
      expect(InternalRunStopRequestSchema.safeParse({ runId: 'run-1', reason }).success).toBe(true);
    }
    for (const invalid of [
      { runId: '', reason: 'owner' }, { runId: 'run-1' }, { reason: 'owner' },
      { runId: 'run-1', reason: 'other' }, { runId: 'run-1', reason: 'owner', extra: true },
    ]) {
      expect(InternalRunStopRequestSchema.safeParse(invalid).success).toBe(false);
    }
  });
});
