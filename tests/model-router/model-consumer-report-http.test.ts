import { describe, expect, it } from 'vitest';
import { INTERNAL_SECRET_HEADER } from '../../src/auth/index.js';
import {
  internalModelConsumerReportContract as contract,
  internalModelConsumerStateContract,
  internalModelConsumerInstallContract,
  modelConsumerReportPath,
  isModelConsumerReportMatching,
} from '../../src/http/index.js';
import { ModelConsumerRuntimeStateSchema } from '../../src/model-router/index.js';

const report = () => ({
  schemaVersion: 1, identity: { managementAgentId: 'synthetic-agent', runtimeAgentId: 'synthetic-runtime', vaultAgentId: 71 },
  scope: { tenantId: 'synthetic-tenant', ownerId: 'synthetic-owner', agentId: 'synthetic-runtime' },
  slotId: 'memory_embedding', sourceVersion: 'opaque-generation',
  observedAt: '2026-10-13T10:00:00Z', validUntil: '2026-10-13T10:01:00Z',
  status: 'unknown', configVersion: null, requestId: null, settings: null,
  reason: 'Synthetic consumer unavailable', embedding: null,
});

describe('consumer reports sent to agent-core', () => {
  it('publishes the authenticated core route and reuses runtime state validation', () => {
    expect(contract.method).toBe('POST');
    expect(contract.path).toBe('/internal/models/consumer-reports/:slotId');
    expect(contract.authType).toBe('secret');
    expect(contract.authHeader).toBe(INTERNAL_SECRET_HEADER);
    expect(contract.bodySchema).toBe(ModelConsumerRuntimeStateSchema);
    expect(contract.path).not.toBe(internalModelConsumerStateContract.path);
    expect(contract.path).not.toBe(internalModelConsumerInstallContract.path);
    expect(contract.bodySchema.parse(report())).toEqual(report());
    expect(isModelConsumerReportMatching({ slotId: 'memory_embedding' }, report())).toBe(true);
  });
  it('rejects a different route slot even when both slots are registered', () => {
    expect(isModelConsumerReportMatching({ slotId: 'agent_classifier' }, report())).toBe(false);
  });
  it('rejects unknown consumer reports and malformed bodies', () => {
    expect(isModelConsumerReportMatching({ slotId: 'unregistered_slot' }, { ...report(), slotId: 'unregistered_slot' })).toBe(false);
    expect(isModelConsumerReportMatching({ slotId: 'memory_embedding' }, null)).toBe(false);
    expect(isModelConsumerReportMatching({ slotId: 'memory_embedding' }, { ...report(), validUntil: report().observedAt })).toBe(false);
  });
  it('rejects extra route and body properties', () => {
    expect(contract.paramsSchema.safeParse({ slotId: 'memory_embedding', extra: true }).success).toBe(false);
    expect(isModelConsumerReportMatching({ slotId: 'memory_embedding', extra: true }, report())).toBe(false);
    expect(isModelConsumerReportMatching({ slotId: 'memory_embedding' }, { ...report(), extra: true })).toBe(false);
    expect(isModelConsumerReportMatching(null, report())).toBe(false);
  });
  it('accepts only the strict success receipt', () => {
    expect(contract.responseSchema.parse({ ok: true })).toEqual({ ok: true });
    for (const input of [{ ok: false }, {}, { ok: true, extra: true }]) {
      expect(contract.responseSchema.safeParse(input).success).toBe(false);
    }
  });
  it('constructs validated paths without accepting path injection', () => {
    expect(modelConsumerReportPath('memory_embedding')).toBe('/internal/models/consumer-reports/memory_embedding');
    for (const slot of ['', '../memory_embedding', 'memory_embedding?extra=1', 'Uppercase', 'a'.repeat(65)]) {
      expect(() => modelConsumerReportPath(slot)).toThrow();
    }
  });
});
