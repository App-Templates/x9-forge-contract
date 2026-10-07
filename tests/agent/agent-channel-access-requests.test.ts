import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import * as Agent from '../../src/agent/index.js';
function schema(name: string): z.ZodType { const value: unknown = Reflect.get(Agent, name); expect(value, name).toBeDefined(); return value as z.ZodType; }
function call(name: string, ...args: unknown[]): unknown { const value: unknown = Reflect.get(Agent, name); expect(value, name).toBeTypeOf('function'); return (value as (...args: unknown[]) => unknown)(...args); }
const date = '2026-10-08T00:00:00.000Z', now = Date.parse(date);
const scope = { agentId: 'runtime-a', ownerId: 'owner-a', tenantId: 'tenant-a' };
const identity = { managementAgentId: 'agent-a', runtimeAgentId: 'runtime-a', vaultAgentId: 7 };
const binding = { scope, identity };
const request = { requestId: 'access-00001', chatId: '123', type: 'private', name: 'Synthetic person', requestedAt: date, updateId: 12 };
const queue = { ...binding, kind: 'telegram', version: 3, observedAt: date, requests: [request] };
const policy = { kind: 'telegram', mode: 'approved-chats', chats: [{ chatId: '123', type: 'private', name: 'Synthetic person', admittedAt: date }] };
const changes = { expectedQueueVersion: 3, operations: [{ requestId: request.requestId, action: 'admit' }] };
const command = { action: 'apply-channel', requestId: 'command-00001', desiredVersion: 5, expectedAppliedVersion: 4, requestChanges: changes };
function configuration(applied = false) {
 return { ...binding, kind: 'telegram', desired: { version: 5, state: 'active' }, applied: { version: applied ? 5 : 4, state: 'active' },
 resource: { ...binding, kind: 'telegram', resource: { agent_id: scope.agentId, bot_username: 'synthetic_bot', created_at: date } },
 access: { desiredPolicy: policy, appliedPolicy: applied ? policy : { ...policy, chats: [] } },
 observation: { channelId: 'telegram', kind: 'telegram', state: 'loaded', loaded: true, readiness: 'ready' }, observedAt: date, error: null };
}
function snapshot(applied = false) { return { configuration: configuration(applied), observedAt: date, requests: { status: 'available', queue: applied ? { ...queue, version: 4, requests: [] } : queue }, attestation: null }; }
function receipt(outcome = 'applied') { return { ...binding, kind: 'telegram', ...command, replayed: false, outcome, completedAt: date,
 snapshot: snapshot(outcome === 'applied'), requestResults: [{ ...changes.operations[0], state: outcome }], error: outcome === 'failed' ? 'apply_failed' : null }; }

describe('C1 access requests and queue', () => {
 it('publishes only bounded presentation metadata and exact chat identity', () => {
  expect(schema('AgentTelegramAccessRequestSchema').parse(request)).toEqual(request);
  expect(schema('AgentTelegramAccessRequestQueueSchema').parse(queue)).toEqual(queue);
  expect(schema('AgentTelegramAccessRequestSchema').safeParse({ ...request, chatId: '-123', type: 'supergroup' }).success).toBe(true);
 });
 it.each([
 { ...request, body: '/start payload' }, { ...request, automaticAdmission: true }, { ...request, chatId: '*'},
 { ...request, type: 'channel' }, { ...request, type: 'group' }, { ...request, requestedAt: 'yesterday' },
 { ...request, updateId: -1 }, { ...request, updateId: 1.5 }, { ...request, updateId: Number.MAX_SAFE_INTEGER + 1 },
 ])('refuses invalid or over-collected request %j', input => { expect(schema('AgentTelegramAccessRequestSchema').safeParse(input).success).toBe(false); });
 it.each([
 { ...queue, kind: 'email' }, { ...queue, identity: { ...identity, runtimeAgentId: 'other' } },
 { ...queue, requests: [request, { ...request, chatId: '456', updateId: 13 }] },
 { ...queue, requests: [request, { ...request, requestId: 'access-00002', updateId: 13 }] },
 { ...queue, requests: [request, { ...request, requestId: 'access-00002', chatId: '456' }] },
 { ...queue, requests: Array.from({ length: 513 }, (_, i) => ({ ...request, requestId: `access-${i + 10000}`, chatId: String(i + 10000), updateId: i })) },
 { ...queue, requests: [{ ...request, requestedAt: '2026-10-08T00:00:01Z' }] },
 { ...queue, credentials: {} },
 ])('rejects conflicting, future or cross-door queue %j', input => { expect(schema('AgentTelegramAccessRequestQueueSchema').safeParse(input).success).toBe(false); });
 it('distinguishes a read empty queue from an unavailable producer', () => {
  expect(schema('AgentChannelAccessRequestSourceSchema').safeParse({ status: 'available', queue: { ...queue, requests: [] } }).success).toBe(true);
  expect(schema('AgentChannelAccessRequestSourceSchema').safeParse({ status: 'unavailable', error: 'source_unavailable' }).success).toBe(true);
  expect(schema('AgentChannelAccessRequestSourceSchema').safeParse({ status: 'unavailable', error: 'source_unavailable', queue }).success).toBe(false);
 });
});

describe('C1 compare-and-swap apply and staged request operations', () => {
 it('accepts only a saved channel version with a previous applied version and request id', () => {
  expect(schema('AgentChannelAccessApplyCommandSchema').parse(command)).toEqual(command);
  expect(schema('AgentChannelAccessApplyCommandSchema').safeParse({ ...command, expectedAppliedVersion: null, requestChanges: null }).success).toBe(true);
  expect(schema('AgentChannelAccessApplyCommandSchema').safeParse({ ...command, desiredVersion: 4 }).success).toBe(true);
 });
 it.each([
 { ...command, desiredVersion: 3 }, { ...command, policy }, { ...command, credentials: {} }, { ...command, role: 'sa' },
 { ...command, action: 'restart' }, { ...command, requestId: 'short' },
 { ...command, requestChanges: { ...changes, operations: [] } },
 { ...command, requestChanges: { ...changes, operations: [changes.operations[0], { ...changes.operations[0], action: 'ignore' }] } },
 { ...command, requestChanges: { ...changes, operations: [{ ...changes.operations[0], action: 'allow-everyone' }] } },
 { ...command, requestChanges: { ...changes, chatId: '456' } },
 { ...command, requestChanges: { ...changes, operations: [{ ...changes.operations[0], chatId: '456' }] } },
 { ...command, requestChanges: { ...changes, operations: Array.from({ length: 513 }, (_, i) => ({ requestId: `access-${i + 10000}`, action: 'ignore' })) } },
 ])('refuses unsaved, privileged or inconsistent intent %j', input => { expect(schema('AgentChannelAccessApplyCommandSchema').safeParse(input).success).toBe(false); });
 it('keeps each source variant strict', () => {
  expect(schema('AgentChannelAccessRequestSourceSchema').safeParse({ status: 'available', queue, role: 'sa' }).success).toBe(false);
  expect(schema('AgentChannelAccessRequestSourceSchema').safeParse({ status: 'not-applicable', queue }).success).toBe(false);
 });
 it('validates saved version, applied version, request queue and admission before effects', () => {
  expect(call('isAgentChannelAccessApplyReady', command, snapshot())).toBe(true);
  expect(call('isAgentChannelAccessApplyReady', {}, snapshot())).toBe(false);
  expect(call('isAgentChannelAccessApplyReady', command, { ...snapshot(), configuration: { ...configuration(), access: { ...configuration().access, desiredPolicy: { ...policy, chats: [{ ...policy.chats[0], chatId: '456' }] } } } })).toBe(false);
  expect(call('isAgentChannelAccessApplyReady', command, { ...snapshot(), configuration: { ...configuration(), access: { ...configuration().access, desiredPolicy: { ...policy, chats: [{ ...policy.chats[0], chatId: '-123', type: 'supergroup' }] } } }, requests: { status: 'available', queue: { ...queue, requests: [{ ...request, chatId: '-123', type: 'group' }] } } })).toBe(false);
  expect(call('isAgentChannelAccessApplyReady', { ...command, desiredVersion: 6 }, snapshot())).toBe(false);
  expect(call('isAgentChannelAccessApplyReady', { ...command, expectedAppliedVersion: 3 }, snapshot())).toBe(false);
  expect(call('isAgentChannelAccessApplyReady', { ...command, requestChanges: { ...changes, expectedQueueVersion: 2 } }, snapshot())).toBe(false);
  expect(call('isAgentChannelAccessApplyReady', { ...command, requestChanges: { ...changes, operations: [{ requestId: 'missing-00001', action: 'admit' }] } }, snapshot())).toBe(false);
  expect(call('isAgentChannelAccessApplyReady', command, { ...snapshot(), configuration: { ...configuration(), access: { ...configuration().access, desiredPolicy: { ...policy, chats: [] } } } })).toBe(false);
  expect(call('isAgentChannelAccessApplyReady', command, { ...snapshot(), requests: { status: 'unavailable', error: 'source_unavailable' } })).toBe(false);
  expect(call('isAgentChannelAccessApplyReady', { ...command, requestChanges: null }, { ...snapshot(), requests: { status: 'unavailable', error: 'source_unavailable' } })).toBe(true);
  expect(call('isAgentChannelAccessApplyReady', { ...command, requestChanges: { ...changes, operations: [{ ...changes.operations[0], action: 'ignore' }] } }, snapshot())).toBe(true);
 });
});

describe('C1 effective snapshots and correlated receipts', () => {
 it('preserves older effective access as pending and dates actual runtime evidence', () => {
  expect(schema('AgentChannelAccessSnapshotSchema').safeParse(snapshot()).success).toBe(true);
  expect(call('isAgentChannelAccessSnapshotCurrent', snapshot(), binding, 'telegram', now)).toBe(false);
  const { access: _access, ...legacy } = configuration(true);
  expect(call('isAgentChannelAccessSnapshotCurrent', { ...snapshot(true), configuration: legacy }, binding, 'telegram', now)).toBe(false);
  expect(call('isAgentChannelAccessSnapshotCurrent', snapshot(true), binding, 'telegram', now)).toBe(true);
  expect(call('isAgentChannelAccessSnapshotCurrent', {}, binding, 'telegram', now)).toBe(false);
  expect(call('isAgentChannelAccessSnapshotCurrent', snapshot(true), binding, 'email', now)).toBe(false);
  expect(call('isAgentChannelAccessSnapshotCurrent', snapshot(true), { ...binding, scope: { ...scope, ownerId: 'other' } }, 'telegram', now)).toBe(false);
  expect(call('isAgentChannelAccessSnapshotCurrent', snapshot(true), binding, 'telegram', now + 60_001)).toBe(false);
  expect(call('isAgentChannelAccessSnapshotCurrent', snapshot(true), binding, 'telegram', now - 1)).toBe(false);
  expect(call('isAgentChannelAccessSnapshotCurrent', snapshot(true), binding, 'telegram', now, Infinity)).toBe(false);
 });
 it.each([
 { ...snapshot(), attestation: { scope, identity, channel: { channelId: 'email', kind: 'email', state: 'paused', loaded: false, readiness: 'not-ready' }, applied: { version: 5, state: 'paused' }, observedAt: date, error: null } },
 { ...snapshot(), requests: { status: 'not-applicable' } },
 { ...snapshot(), requests: { status: 'available', queue: { ...queue, scope: { ...scope, ownerId: 'other' } } } },
 { ...snapshot(), observedAt: '2026-10-07T23:59:59Z' }, { ...snapshot(), rawProviderEvent: {} },
 { ...snapshot(), requests: { status: 'available', queue: { ...queue, observedAt: '2026-10-08T00:00:01Z' } } },
 { ...snapshot(), configuration: { ...configuration(), observedAt: '2026-10-08T00:00:01Z' } },
 { ...snapshot(), configuration: { ...configuration(), observation: null, observedAt: null }, attestation: { ...binding, channel: { channelId: 'email', kind: 'email', state: 'loaded', loaded: true, readiness: 'ready' }, applied: { version: 4, state: 'active' }, observedAt: date, error: null } },
 ])('rejects wrong source, future observation and raw details %j', input => { expect(schema('AgentChannelAccessSnapshotSchema').safeParse(input).success).toBe(false); });
 it('requires real email attestation rather than borrowing Telegram evidence', () => {
  const config = { ...configuration(true), kind: 'email', resource: { ...binding, kind: 'email', resource: { agent_id: scope.agentId, provider_inbox_id: 'synthetic-inbox', address: 'agent@example.test', display_name: null, created_at: date } },
    access: { desiredPolicy: { kind: 'email', mode: 'anyone' }, appliedPolicy: { kind: 'email', mode: 'anyone' } }, observation: { channelId: 'email', kind: 'email', state: 'loaded', loaded: true, readiness: 'ready' } };
  const attestation = { ...binding, channel: config.observation, applied: config.applied, observedAt: date, error: null };
  const actual = { configuration: config, requests: { status: 'not-applicable' }, attestation, observedAt: date };
  expect(schema('AgentChannelAccessSnapshotSchema').safeParse(actual).success).toBe(true);
  for (const changed of [null, { ...attestation, scope: { ...scope, ownerId: 'other' } }, { ...attestation, applied: { version: 4, state: 'active' } }, { ...attestation, observedAt: '2026-10-07T23:59:59Z' }, { ...attestation, channel: { ...attestation.channel, readiness: 'unknown' } }, { ...attestation, error: { code: 'provider_unavailable', retryable: true } }]) {
    expect(schema('AgentChannelAccessSnapshotSchema').safeParse({ ...actual, attestation: changed }).success).toBe(false);
  }
  expect(schema('AgentChannelAccessSnapshotSchema').safeParse({ ...actual, requests: { status: 'available', queue } }).success).toBe(false);
  expect(schema('AgentChannelAccessSnapshotSchema').safeParse({ ...actual, configuration: { ...config, observation: null, observedAt: null }, attestation: { ...attestation, observedAt: '2026-10-08T00:00:01Z' } }).success).toBe(false);
 });
 it.each(['applied', 'pending', 'failed'])('accepts a truthful %s receipt', outcome => {
  expect(schema('AgentChannelAccessApplyResultSchema').safeParse(receipt(outcome)).success).toBe(true);
  expect(call('isAgentChannelAccessResultForCommand', command, receipt(outcome), binding, 'telegram')).toBe(true);
 });
 it.each([
 { ...receipt(), snapshot: snapshot() }, { ...receipt(), error: 'apply_failed' },
 { ...receipt('failed'), error: null }, { ...receipt(), kind: 'email' },
 { ...receipt(), identity: { ...identity, managementAgentId: 'other' } },
 { ...receipt(), completedAt: '2026-10-07T23:59:59Z' },
 { ...receipt(), requestResults: [] }, { ...receipt(), requestResults: [{ ...changes.operations[0], state: 'failed' }] },
 { ...receipt(), requestResults: [{ ...changes.operations[0], state: 'applied' }, { ...changes.operations[0], state: 'applied' }] },
 { ...receipt(), snapshot: { ...snapshot(true), requests: { status: 'available', queue } } },
 { ...receipt(), snapshot: { ...snapshot(true), requests: { status: 'available', queue: { ...queue, version: 4 } } } },
 { ...receipt(), desiredVersion: 6 }, { ...receipt(), rawError: 'provider message' },
 { ...receipt(), expectedAppliedVersion: 6 }, { ...receipt(), outcome: 'unknown' },
 { ...receipt('pending'), requestResults: [{ ...changes.operations[0], state: 'failed' }] },
 { ...receipt(), requestResults: [{ ...changes.operations[0], state: 'unknown' }] },
 { ...receipt(), requestResults: [{ ...changes.operations[0], state: 'pending' }] },
 { ...receipt(), requestResults: [{ requestId: 'unknown-00001', action: 'admit', state: 'applied' }] },
 { ...receipt(), snapshot: { ...snapshot(true), configuration: configuration() } },
 { ...receipt(), snapshot: { ...snapshot(true), requests: { status: 'unavailable', error: 'source_unavailable' } } },
 { ...receipt(), snapshot: { ...snapshot(true), requests: { status: 'available', queue: { ...queue, requests: [] } } } },
 ])('rejects false success or uncorrelated result %j', input => { expect(schema('AgentChannelAccessApplyResultSchema').safeParse(input).success).toBe(false); });
 it('refuses start operations on an otherwise valid pending email receipt', () => {
  const config = { ...configuration(true), kind: 'email', resource: { ...binding, kind: 'email', resource: { agent_id: scope.agentId, provider_inbox_id: 'synthetic-inbox', address: 'agent@example.test', display_name: null, created_at: date } },
    access: { desiredPolicy: { kind: 'email', mode: 'anyone' }, appliedPolicy: { kind: 'email', mode: 'anyone' } }, observation: null, observedAt: null };
  const emailSnapshot = { configuration: config, requests: { status: 'not-applicable' }, attestation: null, observedAt: date };
  const pending = { ...receipt('pending'), kind: 'email', snapshot: emailSnapshot };
  expect(schema('AgentChannelAccessApplyResultSchema').safeParse(pending).success).toBe(false);
  expect(schema('AgentChannelAccessApplyResultSchema').safeParse({ ...pending, requestChanges: null, requestResults: [] }).success).toBe(true);
 });
 it('requires a unique, complete operation set and an explicit applied policy', () => {
  const extra = { requestId: 'access-00002', action: 'ignore' };
  const pair = { ...receipt(), requestChanges: { ...changes, operations: [changes.operations[0], extra] }, requestResults: [{ ...changes.operations[0], state: 'applied' }, { ...changes.operations[0], state: 'applied' }] };
  expect(schema('AgentChannelAccessApplyResultSchema').safeParse(pair).success).toBe(false);
  const validPair = { ...pair, requestResults: [{ ...changes.operations[0], state: 'applied' }, { ...extra, state: 'applied' }] };
  expect(schema('AgentChannelAccessApplyResultSchema').safeParse(validPair).success).toBe(true);
  expect(call('isAgentChannelAccessResultForCommand', command, validPair, binding, 'telegram')).toBe(false);
  const { access: _access, ...legacy } = configuration(true);
  expect(schema('AgentChannelAccessApplyResultSchema').safeParse({ ...receipt(), snapshot: { ...snapshot(true), configuration: legacy } }).success).toBe(false);
  expect(schema('AgentChannelAccessApplyResultSchema').safeParse({ ...receipt(), kind: 'email', requestChanges: null, requestResults: [] }).success).toBe(false);
 });
 it('matches complete operation identity as well as route agent and desired version', () => {
  for (const mismatch of [{ ...command, requestId: 'another-command' }, { ...command, desiredVersion: 6 }, { ...command, expectedAppliedVersion: 3 }, { ...command, requestChanges: null }, { ...command, requestChanges: { ...changes, expectedQueueVersion: 2 } }, { ...command, requestChanges: { ...changes, operations: [{ ...changes.operations[0], action: 'ignore' }] } }]) {
   expect(call('isAgentChannelAccessResultForCommand', mismatch, receipt(), binding, 'telegram')).toBe(false);
  }
  expect(call('isAgentChannelAccessResultForCommand', command, receipt(), { ...binding, identity: { ...identity, vaultAgentId: 9 } }, 'telegram')).toBe(false);
  expect(call('isAgentChannelAccessResultForCommand', command, receipt(), binding, 'email')).toBe(false);
  expect(call('isAgentChannelAccessResultForCommand', command, {}, binding, 'telegram')).toBe(false);
 });
 it('returns only finite error codes and a current version exactly for stale-version responses', () => {
  expect(schema('AgentChannelAccessErrorResponseSchema').safeParse({ ok: false, error: 'stale_version', currentVersion: null }).success).toBe(true);
  expect(schema('AgentChannelAccessErrorResponseSchema').safeParse({ ok: false, error: 'source_unavailable' }).success).toBe(true);
  for (const input of [{ ok: false, error: 'stale_version' }, { ok: false, error: 'source_unavailable', currentVersion: 4 }, { ok: false, error: 'raw-provider-error' }, { ok: false, error: 'source_unavailable', detail: 'secret-like-provider-body' }]) {
   expect(schema('AgentChannelAccessErrorResponseSchema').safeParse(input).success).toBe(false);
  }
 });
});
