import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import * as Http from '../../../src/http/index.js';
import * as Agent from '../../../src/agent/index.js';
function value(name: string): unknown { const v: unknown = Reflect.get(Http, name); expect(v, name).toBeDefined(); return v; }
function schema(name: string): z.ZodType { return value(name) as z.ZodType; }
function call(name: string, ...args: unknown[]): unknown { return (value(name) as (...args: unknown[]) => unknown)(...args); }
const date = '2026-10-08T00:00:00.000Z';
const scope = { agentId: 'runtime-a', ownerId: 'owner-a', tenantId: 'tenant-a' };
const identity = { managementAgentId: 'agent-a', runtimeAgentId: 'runtime-a', vaultAgentId: 7 };
const binding = { scope, identity };
const chat = { chatId: '123', type: 'private', name: 'Synthetic person', admittedAt: date };
const policy = { kind: 'telegram', mode: 'approved-chats', chats: [chat] };
const request = { requestId: 'access-00002', chatId: '456', type: 'private', name: 'Other synthetic', requestedAt: date, updateId: 13 };
const snapshot = { configuration: { ...binding, kind: 'telegram', desired: { version: 5, state: 'active' }, applied: { version: 5, state: 'active' },
 resource: { ...binding, kind: 'telegram', resource: { agent_id: scope.agentId, bot_username: 'synthetic_bot', created_at: date } },
 access: { desiredPolicy: policy, appliedPolicy: policy }, observation: { channelId: 'telegram', kind: 'telegram', state: 'loaded', loaded: true, readiness: 'ready' }, observedAt: date, error: null },
 observedAt: date, attestation: null, requests: { status: 'available', queue: { ...binding, kind: 'telegram', version: 3, observedAt: date, requests: [request] } } };
const draft = { requestId: 'draft-00001', expectedDesiredVersion: 5, expectedAppliedVersion: 5, desiredState: 'active', policy: { ...policy, mode: 'anyone' }, requestChanges: null };
const preview = { requestId: draft.requestId, draft, snapshot };

describe('C1 Forge session facade', () => {
 it.each([
 ['forgeAgentChannelAccessSnapshotContract', 'GET', '/api/agents/:agentId/channels/:kind/access'],
 ['forgeAgentChannelAccessPreviewContract', 'POST', '/api/agents/:agentId/channels/:kind/access/preview'],
 ['forgeAgentChannelAccessApplyContract', 'POST', '/api/agents/:agentId/channels/:kind/access/apply'],
 ])('declares authenticated owner/SA facade %s', (name, method, path) => {
  expect(value(name)).toMatchObject({ method, path, authentication: 'forge-session', authorization: 'sa-or-agent-owner' });
  expect(value(name)).not.toHaveProperty('authType');
 });
 it('reuses canonical snapshot, result and draft contracts', () => {
  expect(value('forgeAgentChannelAccessSnapshotContract')).toMatchObject({ responseSchema: Agent.AgentChannelAccessSnapshotSchema });
  expect(value('forgeAgentChannelAccessPreviewContract')).toMatchObject({ bodySchema: value('ForgeAgentChannelAccessDraftSchema'), responseSchema: value('ForgeAgentChannelAccessPreviewSchema') });
  expect(value('forgeAgentChannelAccessApplyContract')).toMatchObject({ bodySchema: value('ForgeAgentChannelAccessDraftSchema'), responseSchema: Agent.AgentChannelAccessApplyResultSchema });
 });
 it('builds only canonical agent/door paths', () => {
  expect(call('forgeAgentChannelAccessPath', 'agent-a', 'telegram')).toBe('/api/agents/agent-a/channels/telegram/access');
  expect(call('forgeAgentChannelAccessPreviewPath', 'agent-a', 'email')).toBe('/api/agents/agent-a/channels/email/access/preview');
  expect(call('forgeAgentChannelAccessApplyPath', 'agent-a', 'telegram')).toBe('/api/agents/agent-a/channels/telegram/access/apply');
  for (const name of ['forgeAgentChannelAccessPath', 'forgeAgentChannelAccessPreviewPath', 'forgeAgentChannelAccessApplyPath']) {
   expect(() => call(name, '../another', 'telegram')).toThrow(); expect(() => call(name, 'agent-a', 'voice')).toThrow();
  }
 });
 it('authorizes only the trusted SA or exactly the resolved owner and tenant', () => {
  const access = { role: 'owner', ownerId: scope.ownerId, tenantId: scope.tenantId };
  expect(call('isAgentChannelAccessWithinForgeAuthorization', snapshot, { role: 'sa' })).toBe(true);
  expect(call('isAgentChannelAccessWithinForgeAuthorization', snapshot, access)).toBe(true);
  for (const bad of [undefined, { ...access, ownerId: 'other' }, { ...access, tenantId: 'other' }, { role: 'owner', ownerId: scope.ownerId }, { role: 'anonymous' }, { role: 'sa', credentials: {} }]) {
   expect(call('isAgentChannelAccessWithinForgeAuthorization', snapshot, bad)).toBe(false);
  }
  expect(call('isAgentChannelAccessWithinForgeAuthorization', {}, { role: 'sa' })).toBe(false);
 });
 it('keeps desired change validation pure and scoped to a fresh server snapshot', () => {
  const before = JSON.stringify(snapshot);
  expect(schema('ForgeAgentChannelAccessDraftSchema').parse(draft)).toEqual(draft);
  expect(call('isForgeAgentChannelAccessDraftForSnapshot', draft, snapshot)).toBe(true);
  expect(schema('ForgeAgentChannelAccessPreviewSchema').parse(preview)).toEqual(preview);
  expect(call('isForgeAgentChannelAccessPreviewForDraft', draft, preview)).toBe(true);
  expect(JSON.stringify(snapshot)).toBe(before);
 });
 it.each([
 { ...draft, role: 'sa' }, { ...draft, credentials: {} }, { ...draft, resource: {} }, { ...draft, url: 'http://synthetic.invalid' },
 { ...draft, expectedAppliedVersion: 6 }, { ...draft, desiredState: 'restart' }, { ...draft, policy: {} },
 ])('rejects privileged, unversioned or malformed browser draft %j', input => { expect(schema('ForgeAgentChannelAccessDraftSchema').safeParse(input).success).toBe(false); });
 it.each([
 { ...draft, expectedDesiredVersion: 4 }, { ...draft, expectedAppliedVersion: 4 }, { ...draft, policy: { kind: 'email', mode: 'anyone' } },
 ])('refuses a stale or wrong-door draft %j', input => { expect(call('isForgeAgentChannelAccessDraftForSnapshot', input, snapshot)).toBe(false); });
 it('accepts admit/ignore only for the current queue and the proposed exact chat policy', () => {
  const changes = { expectedQueueVersion: 3, operations: [{ requestId: request.requestId, action: 'admit' }] };
  const proposal = { ...draft, policy: { ...policy, chats: [chat, { ...chat, chatId: request.chatId }] }, requestChanges: changes };
  expect(call('isForgeAgentChannelAccessDraftForSnapshot', proposal, snapshot)).toBe(true);
  for (const invalid of [{ ...proposal, requestChanges: { ...changes, expectedQueueVersion: 2 } }, { ...proposal, policy }, { ...proposal, requestChanges: { ...changes, operations: [{ requestId: 'missing-00001', action: 'admit' }] } }]) {
   expect(call('isForgeAgentChannelAccessDraftForSnapshot', invalid, snapshot)).toBe(false);
  }
  expect(call('isForgeAgentChannelAccessDraftForSnapshot', { ...draft, requestChanges: { ...changes, operations: [{ requestId: request.requestId, action: 'ignore' }] } }, snapshot)).toBe(true);
  expect(call('isForgeAgentChannelAccessDraftForSnapshot', proposal, { ...snapshot, requests: { status: 'unavailable', error: 'source_unavailable' } })).toBe(false);
  expect(call('isForgeAgentChannelAccessDraftForSnapshot', {}, snapshot)).toBe(false);
 });
 it('does not publish a mismatched preview or confuse it with saved/applied state', () => {
  for (const invalid of [{ ...preview, requestId: 'another-draft' }, { ...preview, draft: { ...draft, expectedDesiredVersion: 4 } }, { ...preview, applied: true }]) {
   expect(schema('ForgeAgentChannelAccessPreviewSchema').safeParse(invalid).success).toBe(false);
  }
  expect(call('isForgeAgentChannelAccessPreviewForDraft', { ...draft, policy }, preview)).toBe(false);
  expect(call('isForgeAgentChannelAccessPreviewForDraft', draft, {})).toBe(false);
 });
});

// Independent witnesses isolate guards that can otherwise mask each other.
describe('C1 Forge isolated counterexamples', () => {
 it.each(['forgeAgentChannelAccessSnapshotContract', 'forgeAgentChannelAccessPreviewContract', 'forgeAgentChannelAccessApplyContract'])('binds params and errors on %s', name => {
  expect(value(name)).toMatchObject({ paramsSchema: value('AgentChannelAccessParamsSchema'), errorResponseSchema: Agent.AgentChannelAccessErrorResponseSchema });
 });
 it('rejects invalid source and intent before field access', () => {
  expect(call('isForgeAgentChannelAccessDraftForSnapshot', draft, {})).toBe(false);
  expect(call('isForgeAgentChannelAccessPreviewForDraft', {}, preview)).toBe(false);
 });
 it('compares group type separately from chat identity', () => {
  const groupRequest = { ...request, chatId: '-123', type: 'group' };
  const server = { ...snapshot, requests: { status: 'available', queue: { ...snapshot.requests.queue, requests: [groupRequest] } } };
  const proposal = { ...draft, policy: { ...policy, chats: [{ ...chat, chatId: '-123', type: 'supergroup' }] }, requestChanges: { expectedQueueVersion: 3, operations: [{ requestId: request.requestId, action: 'admit' }] } };
  expect(Agent.AgentChannelAccessSnapshotSchema.safeParse(server).success).toBe(true);
  expect(schema('ForgeAgentChannelAccessDraftSchema').safeParse(proposal).success).toBe(true);
  expect(call('isForgeAgentChannelAccessDraftForSnapshot', proposal, server)).toBe(false);
 });
 it('requires every operation and accepts reversed proposal order', () => {
  const other = { ...request, requestId: 'another-00002', chatId: '789', updateId: 14 };
  const server = { ...snapshot, requests: { status: 'available', queue: { ...snapshot.requests.queue, requests: [request, other] } } };
  const changes = { expectedQueueVersion: 3, operations: [request, other].map(item => ({ requestId: item.requestId, action: 'admit' })) };
  const proposal = { ...draft, requestChanges: changes, policy: { ...policy, chats: [{ ...chat, chatId: request.chatId }] } };
  expect(call('isForgeAgentChannelAccessDraftForSnapshot', proposal, server)).toBe(false);
  expect(call('isForgeAgentChannelAccessDraftForSnapshot', { ...proposal, policy: { ...policy, chats: [{ ...chat, chatId: other.chatId }, { ...chat, chatId: request.chatId }] } }, server)).toBe(true);
 });
 it('handles never-applied channel as null without claiming application', () => {
  const server = { ...snapshot, configuration: { ...snapshot.configuration, applied: null, access: { desiredPolicy: policy, appliedPolicy: null }, observation: null, observedAt: null } };
  const initial = { ...draft, expectedAppliedVersion: null, desiredState: 'paused' };
  expect(call('isForgeAgentChannelAccessDraftForSnapshot', initial, server)).toBe(true);
  expect(call('isForgeAgentChannelAccessDraftForSnapshot', initial, snapshot)).toBe(false);
  expect(call('isForgeAgentChannelAccessDraftForSnapshot', draft, server)).toBe(false);
 });
 it('strictly parses trusted roles, complete versions and preview components', () => {
  expect(schema('ForgeAgentChannelAccessAuthorizationSchema').safeParse({ role: 'owner', ownerId: scope.ownerId, tenantId: scope.tenantId, roleOverride: 'sa' }).success).toBe(false);
  expect(schema('ForgeAgentChannelAccessAuthorizationSchema').safeParse({ role: 'owner', ownerId: scope.ownerId, tenantId: '' }).success).toBe(false);
  expect(schema('ForgeAgentChannelAccessDraftSchema').safeParse({ ...draft, expectedDesiredVersion: 0 }).success).toBe(false);
  expect(schema('ForgeAgentChannelAccessDraftSchema').safeParse({ ...draft, requestId: '' }).success).toBe(false);
  expect(schema('ForgeAgentChannelAccessPreviewSchema').safeParse({ ...preview, draft: {} }).success).toBe(false);
  expect(schema('ForgeAgentChannelAccessPreviewSchema').safeParse({ ...preview, snapshot: {} }).success).toBe(false);
 });
});

describe('C1 Forge independent version witnesses', () => {
 it('validates the desired version even without applied evidence', () => {
  expect(schema('ForgeAgentChannelAccessDraftSchema').safeParse({ ...draft, expectedAppliedVersion: null, expectedDesiredVersion: -1 }).success).toBe(false);
  expect(schema('ForgeAgentChannelAccessDraftSchema').safeParse({ ...draft, expectedAppliedVersion: null, expectedDesiredVersion: 1.5 }).success).toBe(false);
 });
 it('rejects a future desired CAS without an independent monotonicity failure', () => {
  const future = { ...draft, expectedDesiredVersion: 6 };
  expect(schema('ForgeAgentChannelAccessDraftSchema').safeParse(future).success).toBe(true);
  expect(call('isForgeAgentChannelAccessDraftForSnapshot', future, snapshot)).toBe(false);
  expect(schema('ForgeAgentChannelAccessPreviewSchema').safeParse({ ...preview, draft: future }).success).toBe(false);
 });
});
