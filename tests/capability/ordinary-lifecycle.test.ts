import { describe, expect, it } from 'vitest';
import { CapabilityOrdinaryLifecycleRequestSchema, CapabilityOrdinaryLifecycleReceiptSchema, parseCapabilityOrdinaryLifecycle, parseCapabilityOrdinaryLifecycleReceipt } from '../../src/capability/ordinary-lifecycle.js';
const scope = { tenantId: 'tenant-a', ownerId: 'owner-a', agentId: 'runtime-a' };
const identity = { managementAgentId: 'management-a', runtimeAgentId: 'runtime-a' };
const from = { appliedVersion: 6, sha256: 'a'.repeat(64) }, to = { appliedVersion: 7, sha256: 'b'.repeat(64) };
const request = { format: 'ordinary-lifecycle-v1', requestId: 'lifecycle-request-a', scope, identity, capability: 'cap-news', phase: 'prepare', transition: { from, to }, targetMembership: 'enabled' };
const emptyState = { scope, capability: request.capability, desired: null, runtimeState: 'unknown', applied: null, failed: null, effectiveParameters: [] };
const authority = { scope, identity, capability: request.capability, requestId: request.requestId, bundle: to, current: from, membership: 'enabled', configuration: null, transaction: null };
const transaction = { request, state: 'prepared', operationId: 'operation-test-a', fence: 1, receipts: [], previousState: emptyState, previousMembership: 'unknown' };
const receipt = { request, operationId: transaction.operationId, fence: 1, status: 'complete', outcome: 'ok', replayed: false, ordinaryState: emptyState, membershipEffective: 'unknown', observedAt: null };

describe('ordinary lifecycle authoritative binding', () => {
  it('rejects forged capability despite valid scoped syntax', () => {
    expect(() => parseCapabilityOrdinaryLifecycle({ ...request, capability: 'cap-other' }, authority)).toThrow();
  });
});

it('prepare requires the current from snapshot, but first activation permits null', () => {
  expect(parseCapabilityOrdinaryLifecycle(request, authority).replay).toBeNull();
  expect(() => parseCapabilityOrdinaryLifecycle(request, { ...authority, current: to })).toThrow('from');
  const first = { ...request, transition: { from: null, to } };
  expect(parseCapabilityOrdinaryLifecycle(first, { ...authority, current: null }).request).toEqual(first);
});
it.each(['tenantId', 'ownerId', 'agentId'] as const)('rejects lifecycle scope substitution of %s', key => {
  expect(() => parseCapabilityOrdinaryLifecycle(request, { ...authority, scope: { ...scope, [key]: 'other' } })).toThrow('scope');
});
it('rejects identity, requestId, candidate hash/version and membership substitutions', () => {
  for (const changes of [{ identity: { ...identity, managementAgentId: 'other' } }, { requestId: 'request-other-001' }, { bundle: { ...to, sha256: 'c'.repeat(64) } }, { bundle: { ...to, appliedVersion: 8 } }, { membership: 'disabled' }]) expect(() => parseCapabilityOrdinaryLifecycle(request, { ...authority, ...changes })).toThrow();
  expect(CapabilityOrdinaryLifecycleRequestSchema.safeParse({ ...request, scope: { ...scope, agentId: identity.managementAgentId } }).success).toBe(false);
});
it('requires retained phases and refuses pending or ambiguous work', () => {
  expect(() => parseCapabilityOrdinaryLifecycle({ ...request, phase: 'activate' }, authority)).toThrow('transaction');
  expect(() => parseCapabilityOrdinaryLifecycle({ ...request, phase: 'activate' }, { ...authority, transaction })).toThrow('order');
  expect(parseCapabilityOrdinaryLifecycle({ ...request, phase: 'suspend' }, { ...authority, transaction }).replay).toBeNull();
  expect(parseCapabilityOrdinaryLifecycle({ ...request, phase: 'activate' }, { ...authority, transaction: { ...transaction, state: 'suspended' } }).replay).toBeNull();
  for (const state of ['pending', 'ambiguous']) expect(() => parseCapabilityOrdinaryLifecycle({ ...request, phase: 'activate' }, { ...authority, transaction: { ...transaction, state } })).toThrow('in-progress');
  expect(() => parseCapabilityOrdinaryLifecycle(request, { ...authority, transaction: { ...transaction, receipts: [{ ...receipt, status: 'pending', outcome: 'in-progress' }] } })).toThrow('in-progress');
});
it('resolves exact durable replay before CAS without executing it again', () => {
  const result = parseCapabilityOrdinaryLifecycle(request, { ...authority, current: to, transaction: { ...transaction, receipts: [receipt] } });
  expect(result.replay).toEqual({ ...receipt, replayed: true });
});
it('binds a transaction across phases and isolates the same requestId by capability', () => {
  const suspended = { ...authority, transaction: { ...transaction, state: 'suspended' } };
  for (const changes of [{ transition: { from, to: { ...to, sha256: 'c'.repeat(64) } } }, { targetMembership: 'disabled' }, { capability: 'cap-other' }]) expect(() => parseCapabilityOrdinaryLifecycle({ ...request, phase: 'activate', ...changes }, suspended)).toThrow();
  const otherRequest = { ...request, capability: 'cap-other' };
  expect(parseCapabilityOrdinaryLifecycle(otherRequest, { ...authority, capability: 'cap-other' }).request.capability).toBe('cap-other');
  expect(() => parseCapabilityOrdinaryLifecycle({ ...request, phase: 'activate' }, { ...suspended, transaction: { ...transaction, state: 'suspended', request: { ...request, requestId: 'newer-request-001' } } })).toThrow('transaction');
});
it('binds whole candidate configuration including keyset/value/version, not syntax alone', () => {
  const definition = { key: 'limit', type: 'integer', label: 'Limit', description: 'Limit', status: 'decided', reference: 'consumer', appliesWhen: 'next_apply', consumes: true, optional: false, editableBy: ['owner'] };
  const configuration = { format: 'ordinary-v2', scope, capability: request.capability, version: 7, parameters: [{ parameter: definition, origin: { kind: 'agent_override' }, value: 7 }] };
  const candidateRequest = { ...request, configuration }, trusted = { ...authority, configuration };
  expect(parseCapabilityOrdinaryLifecycle(candidateRequest, trusted).request).toEqual(candidateRequest);
  for (const value of [{ ...configuration, version: 8 }, { ...configuration, parameters: [] }, { ...configuration, parameters: [{ ...configuration.parameters[0], value: 8 }] }]) expect(() => parseCapabilityOrdinaryLifecycle({ ...candidateRequest, configuration: value }, trusted)).toThrow('candidate');
  expect(() => parseCapabilityOrdinaryLifecycle(request, trusted)).toThrow('candidate');
  expect(CapabilityOrdinaryLifecycleRequestSchema.safeParse({ ...candidateRequest, targetMembership: 'disabled' }).success).toBe(false);
});
it('allows rollback of retained prepared/suspended/activated and first null transition', () => {
  const rollback = { ...request, phase: 'rollback' };
  for (const state of ['prepared', 'suspended', 'activated']) expect(parseCapabilityOrdinaryLifecycle(rollback, { ...authority, current: state === 'activated' ? to : from, transaction: { ...transaction, state } }).replay).toBeNull();
  const first = { ...rollback, transition: { from: null, to } };
  expect(parseCapabilityOrdinaryLifecycle(first, { ...authority, current: to, transaction: { ...transaction, request: { ...first, phase: 'prepare' }, state: 'activated' } }).replay).toBeNull();
  expect(() => parseCapabilityOrdinaryLifecycle(rollback, { ...authority, current: { appliedVersion: 8, sha256: 'c'.repeat(64) }, transaction: { ...transaction, state: 'activated' } })).toThrow('changed');
});
it('refuses stale fence and receipts from another scope or phase transaction', () => {
  for (const changes of [{ fence: 2 }, { operationId: 'other-operation-001' }, { request: { ...request, transition: { from: null, to } } }]) expect(() => parseCapabilityOrdinaryLifecycle(request, { ...authority, transaction: { ...transaction, receipts: [{ ...receipt, ...changes }] } })).toThrow('receipt');
});
it('requires consumer evidence and never attests preparation or inactive loading', () => {
  expect(CapabilityOrdinaryLifecycleReceiptSchema.safeParse(receipt).success).toBe(true);
  expect(CapabilityOrdinaryLifecycleReceiptSchema.safeParse({ ...receipt, membershipEffective: 'enabled', observedAt: '2026-10-09T20:00:00Z' }).success).toBe(false);
  expect(CapabilityOrdinaryLifecycleReceiptSchema.safeParse({ ...receipt, request: { ...request, phase: 'activate' } }).success).toBe(false);
  expect(CapabilityOrdinaryLifecycleReceiptSchema.safeParse({ ...receipt, request: { ...request, phase: 'activate', targetMembership: 'disabled' }, membershipEffective: 'disabled', observedAt: '2026-10-09T20:00:00Z', ordinaryState: { ...emptyState, runtimeState: 'loaded' } }).success).toBe(false);
});
it('accepts consumer mixed immediate8/next_apply7 without model or whole applied claim', () => {
  const definition = { key: 'limit', type: 'integer', label: 'Limit', description: 'Limit', status: 'decided', reference: 'consumer', appliesWhen: 'next_apply', consumes: true, optional: false, editableBy: ['owner'] };
  const next = { parameter: definition, origin: { kind: 'agent_override' }, value: 7 }, immediate = { ...next, parameter: { ...definition, key: 'fresh', appliesWhen: 'immediate' } };
  const configuration = { format: 'ordinary-v2', scope, capability: request.capability, version: 7, parameters: [next, immediate] };
  const activated = { ...request, phase: 'activate', configuration }, observedAt = '2026-10-09T20:00:00Z';
  const desired = { ...configuration, version: 8, parameters: [next, { ...immediate, value: 8 }] };
  const ordinaryState = { ...emptyState, desired, runtimeState: 'loaded', effectiveParameters: [{ scope, capability: request.capability, key: 'limit', value: 7, mode: 'next_apply', sourceConfigVersion: 7, observedAt }, { scope, capability: request.capability, key: 'fresh', value: 8, mode: 'immediate', sourceConfigVersion: 8, observedAt }] };
  const result = { ...receipt, request: activated, ordinaryState, membershipEffective: 'enabled', observedAt };
  expect(parseCapabilityOrdinaryLifecycleReceipt(result, activated, transaction).ordinaryState.applied).toBeNull();
  expect(() => parseCapabilityOrdinaryLifecycleReceipt({ ...result, ordinaryState: { ...ordinaryState, effectiveParameters: ordinaryState.effectiveParameters.slice(1) } }, activated, transaction)).toThrow('next_apply');
  expect(() => parseCapabilityOrdinaryLifecycleReceipt({ ...result, fence: 2 }, activated, transaction)).toThrow('fence');
});
it('prepare cannot attest a changed candidate; rollback first activation restores absence', () => {
  expect(() => parseCapabilityOrdinaryLifecycleReceipt({ ...receipt, ordinaryState: { ...emptyState, runtimeState: 'loaded' } }, request, transaction)).toThrow('Preparation');
  const rollback = { ...request, phase: 'rollback', transition: { from: null, to } }, observedAt = '2026-10-09T20:00:00Z';
  const firstTransaction = { ...transaction, request: { ...rollback, phase: 'prepare' }, previousMembership: 'removed' };
  const result = { ...receipt, request: rollback, ordinaryState: { ...emptyState, runtimeState: 'unloaded' }, membershipEffective: 'removed', observedAt };
  expect(parseCapabilityOrdinaryLifecycleReceipt(result, rollback, firstTransaction)).toEqual(result);
  expect(() => parseCapabilityOrdinaryLifecycleReceipt({ ...result, ordinaryState: { ...emptyState, runtimeState: 'loaded' }, membershipEffective: 'enabled' }, rollback, { ...firstTransaction, previousMembership: 'enabled' })).toThrow('absence');
});
