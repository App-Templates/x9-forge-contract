import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import * as agent from '../../src/agent/index.js';

const master = { agentId: 'runtime-a', ownerId: 'owner-a', tenantId: 'tenant-a', identity: { managementAgentId: 'forge-a', runtimeAgentId: 'runtime-a', vaultAgentId: 17 }, role: 'master' };
const heir = { ...master, role: 'erede', masterAgentId: 'runtime-master' };
const runtime = { credentials: {}, llmConfig: { provider: 'openai', model: 'fixture-model' }, telegramAllowFrom: [], workspacePath: '/fixture/workspace', registryPath: '/fixture/registry', displayName: 'Synthetic', configVersion: 1 };
const exports = ['AgentContextIdentitySchema', 'createAgentContextIdentity', 'AgentContextWithIdentitySchema', 'AgentContextWithIdentityWriteSchema'] as const;
const schema = (name: string): z.ZodType => Reflect.get(agent, name) as z.ZodType | undefined ?? z.unknown();
const construct = (input: unknown): unknown => {
  const fn = Reflect.get(agent, 'createAgentContextIdentity') as ((raw: unknown) => unknown) | undefined;
  expect(fn).toBeTypeOf('function'); return fn!(input);
};
const without = (value: Record<string, unknown>, key: string) => { const copy = { ...value }; delete copy[key]; return copy; };
const invalid: [string, unknown][] = [
  ['missing agent', without(master, 'agentId')], ['null agent', { ...master, agentId: null }], ['blank agent', { ...master, agentId: ' ' }],
  ['missing owner', without(master, 'ownerId')], ['null owner', { ...master, ownerId: null }], ['blank owner', { ...master, ownerId: '\t' }],
  ['missing tenant', without(master, 'tenantId')], ['null tenant', { ...master, tenantId: null }], ['blank tenant', { ...master, tenantId: '\n ' }], ['numeric tenant', { ...master, tenantId: 2 }],
  ['missing identity', without(master, 'identity')], ['null identity', { ...master, identity: null }],
  ['missing management', { ...master, identity: without(master.identity, 'managementAgentId') }], ['blank management', { ...master, identity: { ...master.identity, managementAgentId: ' ' } }],
  ['missing runtime', { ...master, identity: without(master.identity, 'runtimeAgentId') }], ['blank runtime', { ...master, identity: { ...master.identity, runtimeAgentId: ' ' } }],
  ['wrong runtime', { ...master, identity: { ...master.identity, runtimeAgentId: 'other-runtime' } }],
  ['management cannot replace runtime', { ...master, agentId: master.identity.managementAgentId }],
  ['missing vault', { ...master, identity: without(master.identity, 'vaultAgentId') }],
  ...[0, -1, 1.5, '17', null, true, Infinity, Number.MAX_SAFE_INTEGER + 1].map((vaultAgentId, index): [string, unknown] => [`invalid vault ${index}`, { ...master, identity: { ...master.identity, vaultAgentId } }]),
  ['unknown nested identity', { ...master, identity: { ...master.identity, authority: 'invented' } }],
  ['missing role', without(master, 'role')], ['unknown role', { ...master, role: 'child' }], ['null role', { ...master, role: null }],
  ['master with parent', { ...master, masterAgentId: 'runtime-master' }], ['master null parent', { ...master, masterAgentId: null }],
  ['heir without parent', without(heir, 'masterAgentId')], ['heir null parent', { ...heir, masterAgentId: null }], ['heir blank parent', { ...heir, masterAgentId: ' ' }],
  ['heir self runtime', { ...heir, masterAgentId: master.agentId }], ['heir self management', { ...heir, masterAgentId: master.identity.managementAgentId }],
];

describe('authoritative context identity public contract', () => {
  for (const name of exports) it(`BI01 public ${name}`, () => expect(Reflect.get(agent, name)).toBeDefined());
  for (const [name, input] of invalid) {
    it(`BI02 authority rejects ${name}`, () => expect(schema('AgentContextIdentitySchema').safeParse(input).success).toBe(false));
    it(`BI03 constructor rejects ${name}`, () => expect(() => construct(input)).toThrow());
  }
  for (const value of [master, heir, { ...master, agentId: '17', identity: { ...master.identity, managementAgentId: '18', runtimeAgentId: '17', vaultAgentId: 19 } }]) {
    it(`BI04 accepts explicit mapping ${value.role} ${value.agentId}`, () => {
      expect(schema('AgentContextIdentitySchema').parse(value)).toEqual(value); expect(construct(value)).toEqual(value);
    });
  }
  it('BI05 authority rejects unknown root fields rather than trusting a second identity', () => expect(schema('AgentContextIdentitySchema').safeParse({ ...master, authority: 'invented' }).success).toBe(false));
  it('BI06 constructor detaches nested identity from its caller', () => {
    const input = structuredClone(master); const snapshot = structuredClone(input); const result = construct(input) as typeof master;
    result.identity.vaultAgentId = 99; expect(input).toEqual(snapshot);
  });
  it('BI07 two owners and tenants keep their independent mapping with no cache', () => {
    const b = { ...heir, agentId: 'runtime-b', ownerId: 'owner-b', tenantId: 'tenant-b', identity: { managementAgentId: 'forge-b', runtimeAgentId: 'runtime-b', vaultAgentId: 29 }, masterAgentId: 'master-b' };
    expect(construct(master)).toEqual(master); expect(construct(b)).toEqual(b); expect(construct(master)).toEqual(master);
  });
  it('BI08 Wanted, channel mapping, numeric slugs and credentials cannot supply missing root authority', () => {
    const impostor = { ...without(master, 'identity'), modelConfiguration: { identity: master.identity }, channelConfigurations: [{ identity: master.identity }], credentials: { OPENAI_API_KEY: 'fixture-only' }, vaultAgentId: 17 };
    expect(() => construct(impostor)).toThrow();
  });
  for (const name of ['AgentContextWithIdentitySchema', 'AgentContextWithIdentityWriteSchema']) {
    it(`BI09 ${name} keeps exact authority and unrelated runtime fields`, () => {
      const input = { ...runtime, ...heir, modelConfiguration: { fixture: 'preserved' }, workspace: { fixture: 'preserved' }, futureField: [1, 2] };
      expect(schema(name).parse(input)).toEqual(input);
    });
    for (const [label, invalidInput] of invalid) it(`BI10 ${name} rejects ${label}`, () => expect(schema(name).safeParse({ ...runtime, ...invalidInput as object }).success).toBe(false));
    it(`BI11 ${name} rejects missing root authority even with valid Wanted`, () => expect(schema(name).safeParse({ ...runtime, agentId: 'runtime-a', ownerId: 'owner-a', modelConfiguration: { identity: master.identity } }).success).toBe(false));
    it(`BI12 ${name} preserves existing full context requirements`, () => expect(schema(name).safeParse({ ...master, ...without(runtime, 'workspacePath') }).success).toBe(false));
    it(`BI13 ${name} preserves channel scope validation`, () => {
      const channel = { kind: 'telegram', scope: { agentId: 'runtime-b', ownerId: 'owner-b', tenantId: 'tenant-b' }, identity: { managementAgentId: 'forge-b', runtimeAgentId: 'runtime-b' }, desired: { version: 1, state: 'paused' }, applied: null, resource: null, observation: null, observedAt: null, error: null };
      expect(schema(name).safeParse({ ...runtime, ...master, channelConfigurations: [channel] }).success).toBe(false);
    });
  }
  it('BI14 modern reader accepts historical platform credentials, writer rejects them', () => {
    const input = { ...runtime, ...master, credentials: { TELEGRAM_SESSION_STRING: 'fixture-only' } };
    expect(schema('AgentContextWithIdentitySchema').safeParse(input).success).toBe(true);
    expect(schema('AgentContextWithIdentityWriteSchema').safeParse(input).success).toBe(false);
  });
  it('BI15 legacy reader and writer remain byte-compatible without authority defaults', () => {
    const input = { ...runtime, agentId: 'legacy', ownerId: 'legacy-owner' };
    expect(agent.AgentContextFileSchema.parse(input)).toEqual(input); expect(agent.AgentContextFileWriteSchema.parse(input)).toEqual(input);
    expect(agent.AgentContextWithChannelsSchema.parse(input)).toEqual(input);
  });
});
