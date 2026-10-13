import { describe, expect, it } from 'vitest';
import { AgentModelsPendingWorkSchema as pendingSchema, AgentModelsStateSchema, registeredModelConsumers } from '../../src/model-router/index.js';

const identity = { managementAgentId: 'synthetic-agent', runtimeAgentId: 'synthetic-runtime', vaultAgentId: 71 };
const pending = () => ({
  requestId: 'synthetic-request-0001', kind: 'initial', desiredVersion: 1, phase: 'accepted',
  startedAt: '2026-10-13T10:00:00Z', updatedAt: '2026-10-13T10:00:00Z',
  slots: [{ slotId: 'memory_embedding', status: 'waiting' }],
});
const state = () => ({ identity, versions: null, saved: null, runtime: null });
const saved = () => ({
  schemaVersion: 1, identity, configVersion: 2,
  selections: [{ slotId: 'agent_classifier', settings: {
    capability: 'agent-core', function: 'reasoning', catalogVersion: 'synthetic-catalog',
    requirements: { tools: false, stream: false, structuredOutput: false },
    mode: 'single', descriptor: { provider: 'openai', modelId: 'synthetic-model', protocol: 'responses', adapterId: 'synthetic-adapter' },
  } }],
});
const invalid: [string, unknown][] = [
  ['duplicate slots', { ...pending(), slots: [pending().slots[0], pending().slots[0]] }],
  ['unregistered slot', { ...pending(), slots: [{ slotId: 'unregistered_slot', status: 'waiting' }] }],
  ['invalid slot syntax', { ...pending(), slots: [{ slotId: '../memory', status: 'waiting' }] }],
  ['progress exceeds total', { ...pending(), slots: [{ ...pending().slots[0], progress: { completed: 2, total: 1 } }] }],
  ['negative progress', { ...pending(), slots: [{ ...pending().slots[0], progress: { completed: -1, total: 1 } }] }],
  ['fractional progress', { ...pending(), slots: [{ ...pending().slots[0], progress: { completed: 0.5, total: 1 } }] }],
  ['negative total', { ...pending(), slots: [{ ...pending().slots[0], progress: { completed: 0, total: -1 } }] }],
  ['fractional total', { ...pending(), slots: [{ ...pending().slots[0], progress: { completed: 0, total: 1.5 } }] }],
  ['update before start', { ...pending(), updatedAt: '2026-10-13T09:59:59Z' }],
  ['failed without failure', { ...pending(), phase: 'failed' }],
  ['failure without failed', { ...pending(), failure: { slotId: null, code: 'timeout' } }],
  ['initial after version one', { ...pending(), desiredVersion: 2 }],
  ['unregistered failure slot', { ...pending(), phase: 'failed', failure: { slotId: 'unregistered_slot', code: 'timeout' } }],
  ['unknown failure code', { ...pending(), phase: 'failed', failure: { slotId: null, code: 'unregistered_code' } }],
  ['extra work field', { ...pending(), privateJob: true }],
  ['extra slot field', { ...pending(), slots: [{ ...pending().slots[0], privateJob: true }] }],
  ['extra progress field', { ...pending(), slots: [{ ...pending().slots[0], progress: { completed: 0, total: 1, extra: true } }] }],
  ['extra failure field', { ...pending(), phase: 'failed', failure: { slotId: null, code: 'timeout', extra: true } }],
  ['invalid kind', { ...pending(), kind: 'reload' }],
  ['invalid phase', { ...pending(), phase: 'finished' }],
  ['invalid status', { ...pending(), slots: [{ ...pending().slots[0], status: 'finished' }] }],
  ['invalid request id', { ...pending(), requestId: 'bad' }],
  ['invalid desired version', { ...pending(), kind: 'apply', desiredVersion: 0 }],
  ['invalid timestamp', { ...pending(), startedAt: 'not-a-time' }],
];

describe('additive pending model work', () => {
  it('round trips legacy, null and pending states without inventing work', () => {
    expect(AgentModelsStateSchema.safeParse(state()).success).toBe(true);
    expect(AgentModelsStateSchema.parse(state())).toEqual(state());
    expect(AgentModelsStateSchema.safeParse({ ...state(), pending: null }).success).toBe(true);
    expect(AgentModelsStateSchema.parse({ ...state(), pending: null })).toEqual({ ...state(), pending: null });
    expect(AgentModelsStateSchema.parse({ ...state(), pending: pending() })).toEqual({ ...state(), pending: pending() });
  });
  it('allows pending work beside a read-only initial source', () => {
    const initialSource = {
      schemaVersion: 1, identity, scope: { agentId: identity.runtimeAgentId, ownerId: 'synthetic-owner', tenantId: 'synthetic-tenant' },
      authority: 'runtime-loaded', sourceVersion: 'opaque-source',
      observedAt: pending().startedAt, validUntil: '2026-10-13T10:01:00Z',
      coverage: 'partial', selections: [], missingSlots: registeredModelConsumers().map(consumer => consumer.slotId),
    };
    const value = { ...state(), initialSource, pending: pending() };
    expect(AgentModelsStateSchema.parse(value)).toEqual(value);
  });
  it('allows apply work only with saved authority', () => {
    const work = { ...pending(), kind: 'apply', desiredVersion: 2 };
    const value = { ...state(), saved: saved(), versions: { desired: 2, applied: null, failed: null }, pending: work };
    expect(AgentModelsStateSchema.parse(value)).toEqual(value);
    expect(AgentModelsStateSchema.safeParse({ ...state(), pending: work }).success).toBe(false);
  });
  it('rejects initial work with saved authority', () => {
    expect(AgentModelsStateSchema.safeParse({ ...state(), saved: saved(), versions: { desired: 2, applied: null, failed: null }, pending: pending() }).success).toBe(false);
  });
  it.each(invalid)('rejects %s', (_label, value) => {
    expect(pendingSchema.safeParse(value).success).toBe(false);
    expect(AgentModelsStateSchema.safeParse({ ...state(), pending: value }).success).toBe(false);
  });
  it('accepts every declared phase and slot status with optional progress', () => {
    for (const phase of ['accepted', 'installing', 'publishing', 'failed']) {
      for (const status of ['waiting', 'installed', 'pending', 'failed']) {
        const value = { ...pending(), phase, slots: [{ slotId: 'memory_embedding', status, progress: { completed: 490, total: 490 } }],
          ...(phase === 'failed' ? { failure: { slotId: null, code: 'timeout' } } : {}) };
        expect(pendingSchema.parse(value)).toEqual(value);
      }
    }
    expect(pendingSchema.safeParse({ ...pending(), phase: 'failed', failure: { slotId: 'memory_embedding', code: 'timeout' } }).success).toBe(true);
  });
  it('allows zero progress and an empty accepted job', () => {
    expect(pendingSchema.safeParse({ ...pending(), slots: [] }).success).toBe(true);
    expect(pendingSchema.safeParse({ ...pending(), slots: [{ slotId: 'memory_embedding', status: 'pending', progress: { completed: 0, total: 0 } }] }).success).toBe(true);
  });
  it('compares timestamp instants rather than timezone text', () => {
    expect(pendingSchema.safeParse({ ...pending(), updatedAt: '2026-10-13T12:00:00+02:00' }).success).toBe(true);
  });
});
