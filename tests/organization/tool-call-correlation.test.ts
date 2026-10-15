import { describe, it, expect } from 'vitest';
import {
  OrganizationToolCallContextSchema,
  ToolCallReceiptSchema,
} from '../../src/organization/tool-call-correlation.js';

const run = {
  schemaVersion: 1,
  runId: 'run-1',
  organizationId: 'org-1',
  ownerId: 'owner-1',
  identity: { managementAgentId: 'x9', runtimeAgentId: 'agent-x9', vaultAgentId: 7 },
  issuer: 'x9',
  issuedAt: '2026-10-14T10:00:00.000Z',
  expiresAt: '2026-10-14T11:00:00.000Z',
};
const attempt = {
  runId: 'run-1',
  attemptId: 'att-1',
  attemptNumber: 1,
  startedAt: '2026-10-14T10:01:00.000Z',
  idempotencyKey: 'idem-1',
};
const ctx = { organizationRun: run, attempt, tenantId: 'tenant-1' };
const receipt = {
  runId: 'run-1',
  attemptId: 'att-1',
  callId: 'call-1',
  status: 'succeeded',
  consumption: [],
  evidence: [],
  recordedAt: '2026-10-14T10:02:00.000Z',
};

describe('OrganizationToolCallContextSchema', () => {
  it('accepts a coherent context', () => {
    expect(OrganizationToolCallContextSchema.safeParse(ctx).success).toBe(true);
  });
  it('rejects an attempt of another run', () => {
    const r = OrganizationToolCallContextSchema.safeParse({ ...ctx, attempt: { ...attempt, runId: 'run-2' } });
    expect(r.success).toBe(false);
  });
  it('rejects an empty tenant', () => {
    expect(OrganizationToolCallContextSchema.safeParse({ ...ctx, tenantId: '' }).success).toBe(false);
  });
  it('rejects an extra field', () => {
    expect(OrganizationToolCallContextSchema.safeParse({ ...ctx, token: 'x' }).success).toBe(false);
  });
});

describe('ToolCallReceiptSchema', () => {
  it('accepts a succeeded receipt', () => {
    expect(ToolCallReceiptSchema.safeParse(receipt).success).toBe(true);
  });
  it('accepts an uncertain receipt with unknown estimated consumption', () => {
    const r = ToolCallReceiptSchema.safeParse({
      ...receipt,
      status: 'uncertain',
      consumption: [{ unit: 'tokens', quantity: 0, state: 'unknown', estimated: true }],
    });
    expect(r.success).toBe(true);
  });
  it('rejects unknown consumption not flagged as estimated', () => {
    const r = ToolCallReceiptSchema.safeParse({
      ...receipt,
      consumption: [{ unit: 'tokens', quantity: 0, state: 'unknown', estimated: false }],
    });
    expect(r.success).toBe(false);
  });
  it('rejects a failed receipt without failureCode', () => {
    expect(ToolCallReceiptSchema.safeParse({ ...receipt, status: 'failed' }).success).toBe(false);
  });
  it('accepts a failed receipt with failureCode', () => {
    const r = ToolCallReceiptSchema.safeParse({ ...receipt, status: 'failed', failureCode: 'upstream_5xx' });
    expect(r.success).toBe(true);
  });
  it('rejects a status outside the list', () => {
    expect(ToolCallReceiptSchema.safeParse({ ...receipt, status: 'cancelled' }).success).toBe(false);
  });
  it('rejects an extra field and a missing callId', () => {
    expect(ToolCallReceiptSchema.safeParse({ ...receipt, extra: 1 }).success).toBe(false);
    const { callId: _c, ...rest } = receipt;
    expect(ToolCallReceiptSchema.safeParse(rest).success).toBe(false);
  });
});
