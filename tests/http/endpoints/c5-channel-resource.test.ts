import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import * as Http from '../../../src/http/endpoints/index.js';
import * as Agent from '../../../src/agent/index.js';

function value(name: string): unknown { const result: unknown = Reflect.get(Http, name); expect(result, name).toBeDefined(); return result; }
function schema(name: string): z.ZodType { return value(name) as z.ZodType; }
function call(name: string, ...args: unknown[]): unknown { const result = value(name); expect(result, name).toBeTypeOf('function'); return (result as (...input: unknown[]) => unknown)(...args); }
function contract(name: string): Record<string, unknown> { return value(name) as Record<string, unknown>; }
const scope = { agentId: 'runtime-a', ownerId: 'owner-a', tenantId: 'tenant-a' };
const identity = { managementAgentId: 'managed-a', runtimeAgentId: 'runtime-a', vaultAgentId: 7 };
const binding = { scope, identity };
const command = { action: 'create-resource', requestId: 'resource-00001', expectedDesiredVersion: 4, expectedAppliedVersion: null };
const intent = { ...binding, kind: 'telegram', command, previousResource: null };
const params = { agentId: identity.managementAgentId, kind: 'telegram', requestId: command.requestId };
const owner = { role: 'owner', ownerId: scope.ownerId, tenantId: scope.tenantId };
const configuration = { ...binding, kind: 'telegram', desired: { version: 4, state: 'active' }, applied: null, resource: null, observation: null, observedAt: null, error: null };
const result = { intent, configuration, outcome: 'pending', replayed: false, startedAt: '2026-10-08T20:00:00Z', updatedAt: '2026-10-08T20:00:01Z', error: null };

describe('C5 browser resource facades', () => {
  it('declares the creation/rotation boundary using the existing session and canonical schemas', () => {
    expect(contract('forgeAgentChannelResourceContract')).toMatchObject({ method: 'POST', path: '/api/agents/:agentId/channels/:kind/resource', authentication: 'forge-session', authorization: 'sa-or-agent-owner' });
    const descriptor = contract('forgeAgentChannelResourceContract');
    expect(descriptor.paramsSchema).toBe(Http.AgentChannelAccessParamsSchema);
    expect(descriptor.bodySchema).toBe(Agent.AgentChannelResourceCommandSchema);
    expect(descriptor.responseSchema).toBe(Agent.AgentChannelResourceResultSchema);
    expect(descriptor.errorResponseSchema).toBe(Agent.AgentChannelAccessErrorResponseSchema);
    expect(descriptor).not.toHaveProperty('authType');
    expect((descriptor.bodySchema as z.ZodType).parse(command)).toEqual(command);
  });
  it('declares read-only progress scoped to one management agent, door and request id', () => {
    const descriptor = contract('forgeAgentChannelResourceProgressContract');
    expect(descriptor).toMatchObject({ method: 'GET', path: '/api/agents/:agentId/channels/:kind/resource/operations/:requestId', authentication: 'forge-session', authorization: 'sa-or-agent-owner' });
    expect(descriptor.paramsSchema).toBe(value('ForgeAgentChannelResourceProgressParamsSchema'));
    expect(descriptor.responseSchema).toBe(Agent.AgentChannelResourceResultSchema);
    expect(descriptor.errorResponseSchema).toBe(Agent.AgentChannelAccessErrorResponseSchema);
    expect(descriptor).not.toHaveProperty('bodySchema');
    expect(descriptor).not.toHaveProperty('authType');
  });
  it.each(['telegram', 'email'])('builds the resource path for %s and retains exact request identity', kind => {
    expect(call('forgeAgentChannelResourcePath', 'managed-a', kind)).toBe(`/api/agents/managed-a/channels/${kind}/resource`);
    expect(call('forgeAgentChannelResourceProgressPath', 'managed-a', kind, 'resource:00001')).toBe(`/api/agents/managed-a/channels/${kind}/resource/operations/resource%3A00001`);
    expect(schema('ForgeAgentChannelResourceProgressParamsSchema').parse({ ...params, kind })).toEqual({ ...params, kind });
  });
  it.each([
    ['foreign door', { ...params, kind: 'phone' }],
    ['path agent injection', { ...params, agentId: '../managed-b' }],
    ['path request injection', { ...params, requestId: 'resource/00001' }],
    ['short request', { ...params, requestId: 'short' }],
    ['missing request', { agentId: params.agentId, kind: params.kind }],
    ['client owner', { ...params, ownerId: scope.ownerId }],
    ['client endpoint', { ...params, endpoint: 'https://example.test' }],
  ])('rejects invalid progress parameters: %s', (_label, raw) => {
    expect(schema('ForgeAgentChannelResourceProgressParamsSchema').safeParse(raw).success).toBe(false);
  });
  it('does not build paths from malformed parameters', () => {
    expect(value('forgeAgentChannelResourcePath')).toBeTypeOf('function');
    expect(value('forgeAgentChannelResourceProgressPath')).toBeTypeOf('function');
    expect(() => call('forgeAgentChannelResourcePath', '../managed-a', 'telegram')).toThrow();
    expect(() => call('forgeAgentChannelResourceProgressPath', 'managed-a', 'email', 'short')).toThrow();
    expect(() => call('forgeAgentChannelResourceProgressPath', 'managed-a', 'phone', command.requestId)).toThrow();
  });
});

describe('C5 trusted Forge authorization', () => {
  it('accepts only this server-derived owner/tenant or the trusted SA role', () => {
    expect(call('isAgentChannelResourceWithinForgeAuthorization', intent, owner)).toBe(true);
    expect(call('isAgentChannelResourceWithinForgeAuthorization', intent, { role: 'sa' })).toBe(true);
  });
  it.each([
    ['foreign owner', { ...owner, ownerId: 'owner-b' }],
    ['foreign tenant', { ...owner, tenantId: 'tenant-b' }],
    ['anonymous', null],
    ['role only', { role: 'owner' }],
    ['client SA extra fields', { role: 'sa', ownerId: scope.ownerId }],
    ['unrecognized role', { ...owner, role: 'admin' }],
  ])('rejects untrusted or foreign access: %s', (_label, trusted) => {
    expect(call('isAgentChannelResourceWithinForgeAuthorization', intent, trusted)).toBe(false);
  });
  it('rejects malformed resolved intents even for an SA', () => {
    expect(call('isAgentChannelResourceWithinForgeAuthorization', {}, { role: 'sa' })).toBe(false);
    expect(call('isAgentChannelResourceWithinForgeAuthorization', { ...intent, token: 'forbidden' }, owner)).toBe(false);
  });
});

describe('C5 progress route correlation', () => {
  it('accepts only the exact request scoped through its management identity', () => {
    expect(call('isForgeAgentChannelResourceResultForRoute', result, params, binding)).toBe(true);
    expect(call('isForgeAgentChannelResourceResultForRoute', { ...result, replayed: true }, params, binding)).toBe(true);
  });
  it.each([
    ['runtime id used as management', { ...params, agentId: identity.runtimeAgentId }],
    ['foreign management', { ...params, agentId: 'managed-b' }],
    ['foreign door', { ...params, kind: 'email' }],
    ['foreign request', { ...params, requestId: 'resource-00002' }],
    ['invalid params', {}],
  ])('rejects a receipt for another route: %s', (_label, route) => {
    expect(call('isForgeAgentChannelResourceResultForRoute', result, route, binding)).toBe(false);
  });
  it.each([
    ['owner', { ...binding, scope: { ...scope, ownerId: 'owner-b' } }],
    ['tenant', { ...binding, scope: { ...scope, tenantId: 'tenant-b' } }],
    ['management identity', { ...binding, identity: { ...identity, managementAgentId: 'managed-b' } }],
    ['runtime identity', { scope: { ...scope, agentId: 'runtime-b' }, identity: { ...identity, runtimeAgentId: 'runtime-b' } }],
    ['vault identity', { ...binding, identity: { ...identity, vaultAgentId: 8 } }],
    ['missing binding', {}],
  ])('rejects a receipt for another trusted binding: %s', (_label, expected) => {
    expect(call('isForgeAgentChannelResourceResultForRoute', result, params, expected)).toBe(false);
  });
  it('does not authorize malformed or over-collected public receipts', () => {
    expect(call('isForgeAgentChannelResourceResultForRoute', {}, params, binding)).toBe(false);
    expect(call('isForgeAgentChannelResourceResultForRoute', { ...result, rawProviderResponse: {} }, params, binding)).toBe(false);
  });
});
