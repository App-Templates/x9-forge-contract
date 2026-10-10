import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import * as API from '../../src/model-router/index.js';
import * as HTTP from '../../src/http/index.js';
import * as ROOT from '../../src/index.js';
import * as Agent from '../../src/agent/index.js';
import * as Vault from '../../src/vault/index.js';
import * as Voice from '../../src/capability/voice-live/index.js';
import * as Ricerca from '../../src/capability/ricerca/index.js';

function exported(namespace: object, name: string): unknown {
  const value: unknown = Reflect.get(namespace, name);
  expect(value, `composed public export ${name}`).toBeDefined();
  return value;
}
function schema(name: string): z.ZodType { return exported(API, name) as z.ZodType; }
function call(name: string, ...args: unknown[]): unknown {
  const value = exported(API, name);
  expect(value, name).toBeTypeOf('function');
  return (value as (...args: unknown[]) => unknown)(...args);
}
const identity = { managementAgentId: 'composition-agent', runtimeAgentId: 'composition-runtime', vaultAgentId: 71 };
const scope = { agentId: identity.runtimeAgentId, ownerId: 'composition-owner', tenantId: 'composition-tenant' };
const observedAt = '2026-10-09T06:20:00Z';
const validUntil = '2026-10-09T06:20:30Z';
const now = new Date('2026-10-09T06:20:01Z');
const descriptor = { provider: 'openai', modelId: 'synthetic-model', protocol: 'chat-completions', adapterId: 'synthetic-adapter' };
const settings = { capability: 'agent-core', function: 'reasoning', catalogVersion: 'synthetic-catalog', requirements: { tools: false, stream: false, structuredOutput: false }, mode: 'single', descriptor };
const observation = { identity, scope, sourceVersion: 'composition-generation', observedAt, validUntil };
function initial() {
  const definitions = call('registeredModelConsumerDefinitions') as Array<{ slotId: string; capability: string; function: string; requirements: object; routing: string }>;
  return { schemaVersion: 1, ...observation, authority: 'runtime-loaded', coverage: 'complete', missingSlots: [], selections: definitions.map(definition => {
    const common = { capability: definition.capability, function: definition.function, requirements: definition.requirements, catalogVersion: 'synthetic-catalog' };
    const selected = definition.routing === 'tiered' ? { ...common, mode: 'automatic', tiers: { standard: descriptor, advanced: descriptor, reasoning: descriptor }, fallback: descriptor }
      : definition.routing === 'failover' ? { ...common, mode: 'failover', primary: descriptor, fallback: descriptor }
        : { ...common, mode: 'single', descriptor, ...(definition.function === 'embedding' ? { embeddingDimensions: 1536 } : {}) };
    return { slotId: definition.slotId, settings: selected };
  }) };
}
const observed = () => ({ schemaVersion: 1, ...observation, slotId: 'agent_classifier', status: 'observed', configVersion: null, requestId: null, settings, reason: 'Synthetic native legacy observation', embedding: null });

describe('qualified Initial/observed composed with retained Chiavi contracts', () => {
  it.each(['AgentModelInitialSourceSchema', 'AgentModelBootstrapSourceSchema', 'AgentModelSourceObservationSchema', 'ModelConsumerRuntimeStateSchema', 'ModelConsumerStateRequestSchema', 'ModelConsumerInstallRequestSchema', 'ModelConsumerInstallReceiptSchema'])('C01 publishes canonical %s from the real root and router', name => {
    expect(exported(ROOT, name)).toBe(exported(API, name));
  });
  it.each(['internalAgentModelSourceObservationContract', 'internalModelConsumerStateContract', 'internalModelConsumerInstallContract'])('C02 retains actual HTTP %s with canonical response', name => {
    const contract = exported(HTTP, name) as { authType: string; responseSchema: unknown };
    expect(contract.authType).toBe('secret');
    const response = name === 'internalAgentModelSourceObservationContract' ? 'AgentModelSourceObservationSchema' : name === 'internalModelConsumerStateContract' ? 'ModelConsumerRuntimeStateSchema' : 'ModelConsumerInstallReceiptSchema';
    expect(contract.responseSchema).toBe(exported(API, response));
  });
  it('C03 accepts complete roleless Initial while bootstrap retains its explicit Master role', () => {
    const value = initial();
    expect(schema('AgentModelInitialSourceSchema').safeParse(value).success).toBe(true);
    expect(schema('AgentModelBootstrapSourceSchema').safeParse(value).success).toBe(false);
    expect(schema('AgentModelBootstrapSourceSchema').safeParse({ ...value, role: 'master' }).success).toBe(true);
    expect(call('isAgentModelInitialSourceCurrent', value, { identity, scope, sourceVersion: observation.sourceVersion }, now)).toBe(true);
  });
  it.each(['master', 'erede'])('C04 Initial never assigns role %s', role => {
    expect(schema('AgentModelInitialSourceSchema').safeParse({ ...initial(), role }).success).toBe(false);
  });
  it.each(['saved', 'runtime', 'versions', 'bootstrapSource', 'sourceObservation'])('C05 Initial cannot coexist with %s authority', key => {
    const value = initial();
    const state = { identity, saved: null, runtime: null, versions: null, initialSource: value };
    expect(schema('AgentModelsStateSchema').safeParse(state).success).toBe(true);
    const other = key === 'bootstrapSource' ? { ...value, role: 'master' } : key === 'sourceObservation' ? observation : key === 'versions' ? { desired: 1, applied: null, failed: null } : {};
    expect(schema('AgentModelsStateSchema').safeParse({ ...state, [key]: other }).success).toBe(false);
  });
  it.each(['managementAgentId', 'runtimeAgentId', 'vaultAgentId'])('C06 Initial requires complete %s and exact identity', key => {
    const value = initial();
    const changed = { ...identity, [key]: key === 'vaultAgentId' ? 72 : 'another' };
    expect(call('isAgentModelInitialSourceCurrent', value, { identity: changed, scope, sourceVersion: observation.sourceVersion }, now)).toBe(false);
    const missing = { ...identity }; Reflect.deleteProperty(missing, key);
    expect(schema('AgentModelInitialSourceSchema').safeParse({ ...value, identity: missing }).success).toBe(false);
  });
  it.each(['agentId', 'ownerId', 'tenantId'])('C07 Initial binds exact nonblank scope %s', key => {
    const value = initial();
    expect(call('isAgentModelInitialSourceCurrent', value, { identity, scope: { ...scope, [key]: 'another' }, sourceVersion: observation.sourceVersion }, now)).toBe(false);
    expect(schema('AgentModelInitialSourceSchema').safeParse({ ...value, scope: { ...scope, [key]: ' ' } }).success).toBe(false);
  });
  it('C08 source generation, expiry and coverage are actual authority', () => {
    const value = initial();
    expect(call('isAgentModelInitialSourceCurrent', value, { identity, scope, sourceVersion: 'changed' }, now)).toBe(false);
    expect(call('isAgentModelInitialSourceCurrent', value, { identity, scope, sourceVersion: observation.sourceVersion }, new Date(validUntil))).toBe(false);
    expect(schema('AgentModelInitialSourceSchema').safeParse({ ...value, selections: value.selections.slice(1) }).success).toBe(false);
    expect(schema('AgentModelInitialSourceSchema').safeParse({ ...value, selections: [...value.selections, value.selections[0]] }).success).toBe(false);
  });
  it('C09 observed settings are positive evidence with no installation claim', () => {
    expect(schema('ModelConsumerRuntimeStateSchema').parse(observed())).toEqual(observed());
    expect(schema('ModelConsumerRuntimeStateSchema').safeParse({ ...observed(), settings: null }).success).toBe(false);
  });
  it.each([{ configVersion: 1 }, { requestId: 'synthetic-install-0001' }])('C10 observed forbids fabricated install fields %j', patch => {
    expect(schema('ModelConsumerRuntimeStateSchema').safeParse({ ...observed(), ...patch }).success).toBe(false);
  });
  it('C11 observed cannot manufacture installed receipt confirmation', () => {
    const request = { schemaVersion: 1, identity, scope, slotId: 'agent_classifier', configVersion: 1, requestId: 'synthetic-install-0001', expectedSourceVersion: observation.sourceVersion, settings };
    expect(schema('ModelConsumerInstallRequestSchema').safeParse(request).success).toBe(true);
    expect(call('isModelConsumerInstallConfirmed', request, { requestId: request.requestId, outcome: 'installed', state: observed() }, now)).toBe(false);
  });
  it('C12 single embedding requires its actual dimension; failover cannot change vector space', () => {
    const embedding = { ...settings, capability: 'memory', function: 'embedding', embeddingDimensions: 1536 };
    expect(API.CapabilityModelSettingsSchema.safeParse(embedding).success).toBe(true);
    const missing = { ...embedding }; Reflect.deleteProperty(missing, 'embeddingDimensions');
    expect(API.CapabilityModelSettingsSchema.safeParse(missing).success).toBe(false);
    expect(API.CapabilityModelSettingsSchema.safeParse({ capability: settings.capability, function: 'embedding', catalogVersion: settings.catalogVersion, requirements: settings.requirements, mode: 'failover', primary: descriptor, fallback: descriptor }).success).toBe(false);
  });
  it('C13 coverage-only owner data remains authorized through the real facade guard', () => {
    const overview = { version: 'composition-overview', observedAt, rows: [], coverage: [{ identity, ownerId: scope.ownerId, status: 'unavailable', missingSlots: ['agent_chat'], reason: 'Synthetic unavailable' }] };
    expect(HTTP.isAgentModelsOverviewWithinAccess(overview, { role: 'owner', ownerId: scope.ownerId })).toBe(true);
    expect(HTTP.isAgentModelsOverviewWithinAccess(overview, { role: 'owner', ownerId: 'foreign-owner' })).toBe(false);
    expect(HTTP.isAgentModelsOverviewWithinAccess(overview, { role: 'sa' })).toBe(true);
  });
  const credentialNames = [...new Set([...Agent.AGENT_CREDENTIAL_SERVICE_KEYS.filter(key => Agent.getAgentCredentialServiceMetadata(key)?.kind === 'credential'), ...Vault.PLATFORM_INTERNAL_CREDENTIAL_KEYS])];
  it.each(credentialNames)('C14 retained18 response excludes root and nested canonical %s', key => {
    const result = { callId: 'composition-call', status: 'success', output: {} };
    expect(HTTP.InternalAgentToolDispatchResponseSchema.safeParse({ ...result, [key]: 'synthetic-value' }).success).toBe(false);
    expect(HTTP.InternalAgentToolDispatchResponseSchema.safeParse({ ...result, output: { nested: { [key]: 'synthetic-value' } } }).success).toBe(false);
  });
  it('C15 retained18 immutable internal targets preserve credential/identifier/setting separation', () => {
    expect(Object.keys(HTTP.INTERNAL_AGENT_EXECUTIONS)).toHaveLength(8);
    const target = HTTP.INTERNAL_AGENT_EXECUTIONS.glasses_session_admit;
    expect(target.credentialKeys).toEqual(['ELEVENLABS_API_KEY']);
    expect(target.identifierKeys).toEqual(['ELEVENLABS_VOICE_ID']);
    expect(target.settingKeys).toEqual(['ELEVENLABS_MODEL_ID']);
    for (const entry of Object.values(HTTP.INTERNAL_AGENT_EXECUTIONS)) {
      expect(entry.modelVisible).toBe(false);
      for (const field of [entry.credentialKeys, entry.identifierKeys, entry.settingKeys]) expect(Object.isFrozen(field)).toBe(true);
    }
    expect(credentialNames).toContain('INTERNAL_TOKEN');
  });
  it('C16 retained18 managed/standalone voice and internal lease exports survive public composition', () => {
    expect(exported(Voice, 'ManagedVoiceLiveCallStartRequestSchema')).toBeDefined();
    expect(exported(Voice, 'StandaloneVoiceLiveCallStartRequestSchema')).toBeDefined();
    expect(Ricerca.ResearchExecuteInputSchema.safeParse({ researchId: 'composition-research', leaseToken: '00000000-0000-4000-8000-000000000001' }).success).toBe(true);
    expect(Object.values(Ricerca.RICERCA_TOOLS)).not.toContain(Ricerca.RICERCA_INTERNAL_TOOLS.execute);
    expect(Agent.getAgentCredentialServiceMetadata('NETATMO_EMAIL')).toMatchObject({ kind: 'credential', secret: false });
  });
});

describe('unknown consumer admission remains explicit', () => {
  it('C17 unknown runtime slot cannot attest even noninstalled empty state', () => {
    const value = { ...observed(), slotId: 'unknown-slot', status: 'unknown', settings: null };
    expect(schema('ModelConsumerRuntimeStateSchema').safeParse(value).success).toBe(false);
  });
  it('C18 unknown read slot never receives a default consumer', () => {
    expect(schema('ModelConsumerStateRequestSchema').safeParse({ identity, scope, slotId: 'unknown-slot' }).success).toBe(false);
  });
});
