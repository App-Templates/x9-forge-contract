import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import * as router from '../../src/model-router/index.js';

const schema = (name: string): z.ZodType => Reflect.get(router, name) as z.ZodType | undefined ?? z.unknown();
const construct = (value: unknown): unknown => {
  const fn = Reflect.get(router, 'createAgentModelsConfigurationWithProvenance') as ((input: unknown) => unknown) | undefined;
  expect(fn).toBeTypeOf('function');
  return fn!(value);
};
const identity = { managementAgentId: 'forge-heir', runtimeAgentId: 'runtime-heir', vaultAgentId: 21 };
const sourceIdentity = { managementAgentId: 'forge-master', runtimeAgentId: 'runtime-master', vaultAgentId: 31 };
const scope = { agentId: identity.runtimeAgentId, ownerId: 'owner-a', tenantId: 'tenant-a' };
const descriptor = { provider: 'openai', modelId: 'synthetic-only', protocol: 'responses', adapterId: 'synthetic-adapter' };
const settings = { capability: 'agent-core', function: 'reasoning', catalogVersion: 'synthetic-catalog', requirements: { tools: true, stream: false, structuredOutput: false }, mode: 'pin', pin: descriptor, tiers: { standard: descriptor, advanced: descriptor, reasoning: descriptor }, fallback: descriptor };
const source = () => ({ identity: { ...sourceIdentity }, sourceVersion: 19 });
const config = () => ({ schemaVersion: 1, identity: { ...identity }, configVersion: 4,
  selections: [{ slotId: 'agent_chat', settings: structuredClone(settings) }, { slotId: 'other_slot', settings: structuredClone(settings) }],
  provenance: { scope: { ...scope }, bindings: [{ slotId: 'agent_chat', origin: 'master', source: source() }, { slotId: 'other_slot', origin: 'custom' }] },
});
const context = () => ({ agentId: identity.runtimeAgentId, ownerId: scope.ownerId, tenantId: scope.tenantId,
  identity: { ...identity }, role: 'erede', masterAgentId: sourceIdentity.runtimeAgentId,
  credentials: {}, llmConfig: { provider: 'openai', model: 'synthetic-legacy' }, telegramAllowFrom: [], displayName: 'Synthetic',
  workspacePath: '/synthetic/workspace', registryPath: '/synthetic/registry', configVersion: 4, modelConfiguration: config(), futureField: ['keep'],
});
const without = (value: Record<string, unknown>, key: string) => { const result = structuredClone(value); delete result[key]; return result; };
const changed = (fn: (value: ReturnType<typeof config>) => void): unknown => { const value = config(); fn(value); return value; };
const invalidConfigurations: [string, unknown][] = [
  ['missing provenance', without(config(), 'provenance')], ['null provenance', { ...config(), provenance: null }],
  ['unknown provenance metadata', { ...config(), provenance: { ...config().provenance, token: 'fixture-only' } }],
  ['missing scope', { ...config(), provenance: without(config().provenance, 'scope') }],
  ...['agentId', 'ownerId', 'tenantId'].flatMap(key => [
    [`missing scope ${key}`, { ...config(), provenance: { ...config().provenance, scope: without(scope, key) } }],
    [`blank scope ${key}`, { ...config(), provenance: { ...config().provenance, scope: { ...scope, [key]: ' \t' } } }],
    [`null scope ${key}`, { ...config(), provenance: { ...config().provenance, scope: { ...scope, [key]: null } } }],
  ] as [string, unknown][]),
  ['scope uses management alias', changed(value => { value.provenance.scope.agentId = identity.managementAgentId; })],
  ['empty bindings', changed(value => { value.provenance.bindings = []; })],
  ['duplicate binding', changed(value => { value.provenance.bindings.push(value.provenance.bindings[0]!); })],
  ['missing binding', changed(value => { value.provenance.bindings.pop(); })],
  ['unselected binding', changed(value => { value.provenance.bindings.push({ slotId: 'unselected', origin: 'custom' }); })],
  ['wrong slot binding', changed(value => { value.provenance.bindings[0]!.slotId = 'unknown_slot'; })],
  ['unknown origin', changed(value => { value.provenance.bindings[0]!.origin = 'inferred'; })],
  ['missing source', changed(value => { delete value.provenance.bindings[0]!.source; })],
  ['custom carrying source', changed(value => { value.provenance.bindings[0]!.origin = 'custom'; })],
  ['null custom source', changed(value => { Object.assign(value.provenance.bindings[1]!, { source: null }); })],
  ['unknown binding metadata', changed(value => { Object.assign(value.provenance.bindings[0]!, { credential: 'fixture-only' }); })],
  ['unknown source metadata', changed(value => { Object.assign(value.provenance.bindings[0]!.source!, { group: 'not-built' }); })],
  ...[0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, null, '19', Infinity].map((sourceVersion, i): [string, unknown] => [`source version invalid ${i}`, changed(value => { Object.assign(value.provenance.bindings[0]!.source!, { sourceVersion }); })]),
  ['missing source version', changed(value => { delete (value.provenance.bindings[0]!.source as Partial<ReturnType<typeof source>>).sourceVersion; })],
  ...['managementAgentId', 'runtimeAgentId', 'vaultAgentId'].flatMap(key => [
    [`missing target ${key}`, changed(value => { delete (value.identity as unknown as Record<string, unknown>)[key]; })],
    [`missing source ${key}`, changed(value => { delete (value.provenance.bindings[0]!.source!.identity as unknown as Record<string, unknown>)[key]; })],
  ] as [string, unknown][]),
  ...[0, -1, 1.1, Number.MAX_SAFE_INTEGER + 1, '21'].flatMap((vaultAgentId, i) => [
    [`invalid target Vault ${i}`, changed(value => { Object.assign(value.identity, { vaultAgentId }); })],
    [`invalid source Vault ${i}`, changed(value => { Object.assign(value.provenance.bindings[0]!.source!.identity, { vaultAgentId }); })],
  ] as [string, unknown][]),
  ...['managementAgentId', 'runtimeAgentId'].flatMap(key => [
    [`blank target ${key}`, changed(value => { Object.assign(value.identity, { [key]: ' ' }); })],
    [`blank source ${key}`, changed(value => { Object.assign(value.provenance.bindings[0]!.source!.identity, { [key]: '\t' }); })],
  ] as [string, unknown][]),
  ['self source runtime', changed(value => { value.provenance.bindings[0]!.source!.identity.runtimeAgentId = identity.runtimeAgentId; })],
  ['self source management', changed(value => { value.provenance.bindings[0]!.source!.identity.managementAgentId = identity.managementAgentId; })],
  ['self source cross alias', changed(value => { value.provenance.bindings[0]!.source!.identity.runtimeAgentId = identity.managementAgentId; })],
  ['self source Vault', changed(value => { value.provenance.bindings[0]!.source!.identity.vaultAgentId = identity.vaultAgentId; })],
  ['conflicting source mapping', changed(value => { value.provenance.bindings[1] = { slotId: 'other_slot', origin: 'master', source: { ...source(), identity: { ...sourceIdentity, vaultAgentId: 32 } } }; })],
];

describe('C5 model provenance public boundary', () => {
  for (const name of ['AgentModelSourceSchema', 'AgentModelBindingSchema', 'AgentModelsProvenanceSchema', 'AgentModelsConfigurationWithProvenanceSchema', 'AgentContextWithModelProvenanceSchema', 'AgentContextWithModelProvenanceWriteSchema', 'createAgentModelsConfigurationWithProvenance']) {
    it(`MP01 exports ${name}`, () => expect(Reflect.get(router, name)).toBeDefined());
  }
  it('MP02 accepts explicit source metadata with source version independent of aggregate version', () => {
    expect(schema('AgentModelsConfigurationWithProvenanceSchema').parse(config())).toEqual(config());
    expect(construct(config())).toEqual(config());
  });
  for (const [label, value] of invalidConfigurations) {
    it(`MP03 strict snapshot rejects ${label}`, () => expect(schema('AgentModelsConfigurationWithProvenanceSchema').safeParse(value).success).toBe(false));
  }
  it('MP04 custom equal to Master stays custom and has no inferred source', () => {
    const parsed = construct(config()) as ReturnType<typeof config>;
    expect(parsed.provenance.bindings[1]).toEqual({ slotId: 'other_slot', origin: 'custom' });
    expect(parsed.selections[0]!.settings).toEqual(parsed.selections[1]!.settings);
  });
  it('MP05 returns a detached snapshot without changing caller values', () => {
    const input = config(); const before = structuredClone(input); const parsed = construct(input) as ReturnType<typeof config>;
    parsed.provenance.bindings[0]!.source!.sourceVersion = 99;
    parsed.provenance.scope.ownerId = 'other-owner';
    parsed.selections[0]!.settings.pin.modelId = 'changed';
    expect(input).toEqual(before);
  });
  it('MP06 preserves 1.43 configurations without inventing provenance', () => {
    const legacy = without(config(), 'provenance');
    expect(router.AgentModelsConfigurationSchema.parse(legacy)).toEqual(legacy);
    expect(router.AgentModelsConfigurationSchema.safeParse(config()).success).toBe(true);
  });
  for (const [label, value] of invalidConfigurations.filter(([label]) => label !== 'missing provenance')) {
    it(`MP07 additive parser rejects malformed explicit ${label}`, () => expect(router.AgentModelsConfigurationSchema.safeParse(value).success).toBe(false));
  }
  for (const name of ['AgentContextWithModelProvenanceSchema', 'AgentContextWithModelProvenanceWriteSchema']) {
    it(`MP08 ${name} accepts complete heir authority and preserves runtime extras`, () => expect(schema(name).parse(context())).toEqual(context()));
    for (const field of ['ownerId', 'tenantId', 'agentId', 'role', 'identity', 'masterAgentId', 'modelConfiguration', 'configVersion']) {
      it(`MP09 ${name} rejects missing ${field}`, () => expect(schema(name).safeParse(without(context(), field)).success).toBe(false));
    }
    for (const key of ['managementAgentId', 'runtimeAgentId', 'vaultAgentId']) {
      it(`MP10 ${name} rejects root/config ${key} mismatch`, () => {
        const value = context(); Object.assign(value.identity, { [key]: key === 'vaultAgentId' ? 22 : 'another-agent' });
        expect(schema(name).safeParse(value).success).toBe(false);
      });
    }
    for (const key of ['ownerId', 'tenantId']) {
      it(`MP11 ${name} rejects ${key} mismatch`, () => {
        const value = context(); Object.assign(value, { [key]: 'other-scope' });
        expect(schema(name).safeParse(value).success).toBe(false);
      });
    }
    it(`MP12 ${name} rejects another runtime Master`, () => { const value = context(); value.masterAgentId = 'other-master'; expect(schema(name).safeParse(value).success).toBe(false); });
    it(`MP13 ${name} refuses legacy selection as a new provenance snapshot`, () => { const value = context(); delete (value.modelConfiguration as Partial<ReturnType<typeof config>>).provenance; expect(schema(name).safeParse(value).success).toBe(false); });
    it(`MP14 ${name} accepts source-owned Master selections without a parent`, () => {
      const value = context(); value.role = 'master'; delete (value as Partial<ReturnType<typeof context>>).masterAgentId;
      value.modelConfiguration.provenance.bindings = value.modelConfiguration.selections.map(entry => ({ slotId: entry.slotId, origin: 'custom' }));
      expect(schema(name).safeParse(value).success).toBe(true);
    });
    it(`MP15 ${name} rejects Master declaring inherited slots`, () => {
      const value = context(); value.role = 'master'; delete (value as Partial<ReturnType<typeof context>>).masterAgentId;
      expect(schema(name).safeParse(value).success).toBe(false);
    });
    it(`MP16 ${name} rejects a different aggregate version`, () => { const value = context(); value.configVersion++; expect(schema(name).safeParse(value).success).toBe(false); });
  }
  it('MP17 existing model reader also validates explicit scope and authority', () => {
    expect(router.AgentContextWithModelsSchema.safeParse(context()).success).toBe(true);
    const value = context(); value.tenantId = 'other'; expect(router.AgentContextWithModelsSchema.safeParse(value).success).toBe(false);
    expect(router.AgentContextWithModelsSchema.safeParse(without(context(), 'identity')).success).toBe(false);
  });
  it('MP18 modern reader preserves legacy internal credential policy while writer refuses it', () => {
    const value = { ...context(), credentials: { TELEGRAM_SESSION_STRING: 'fixture-only' } };
    expect(schema('AgentContextWithModelProvenanceSchema').safeParse(value).success).toBe(true);
    expect(schema('AgentContextWithModelProvenanceWriteSchema').safeParse(value).success).toBe(false);
  });
  it('MP19 optional provenance survives saved state without inventing runtime installation', () => {
    const value = { identity, versions: { desired: 4, applied: null, failed: null }, saved: config(), runtime: null };
    expect(router.AgentModelsStateSchema.safeParse(value).success).toBe(true);
    expect(router.AgentModelsStateSchema.parse(value)).toEqual(value);
  });
  it('MP21 standalone provenance rejects duplicate slots', () => {
    const value = config().provenance; value.bindings.push(value.bindings[0]!);
    expect(schema('AgentModelsProvenanceSchema').safeParse(value).success).toBe(false);
  });
  it('MP22 standalone provenance requires nonempty bindings', () => {
    expect(schema('AgentModelsProvenanceSchema').safeParse({ scope, bindings: [] }).success).toBe(false);
  });
  it('MP23 standalone provenance bounds distinct bindings', () => {
    const bindings = Array.from({ length: 65 }, (_, index) => ({ slotId: 'slot_' + index, origin: 'custom' }));
    expect(schema('AgentModelsProvenanceSchema').safeParse({ scope, bindings }).success).toBe(false);
  });
  it('MP20 repeated source across slots permits independent source versions', () => {
    const value = config(); value.provenance.bindings[1] = { slotId: 'other_slot', origin: 'master', source: { ...source(), sourceVersion: 20 } };
    expect(schema('AgentModelsConfigurationWithProvenanceSchema').safeParse(value).success).toBe(true);
  });
});
