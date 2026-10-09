import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import * as API from '../../src/model-router/index.js';
import * as ROOT from '../../src/index.js';

function exported(name: string): unknown {
  const value: unknown = Reflect.get(API, name);
  expect(value, name).toBeDefined();
  return value;
}
// Existing schema is the semantic baseline when the additive API is not implemented.
function schema(): z.ZodType { return (Reflect.get(API, 'AgentModelInitialSourceSchema') ?? API.AgentModelBootstrapSourceSchema) as z.ZodType; }
const identity = { managementAgentId: 'synthetic-agent', runtimeAgentId: 'synthetic-runtime', vaultAgentId: 71 };
const scope = { agentId: identity.runtimeAgentId, ownerId: 'synthetic-owner', tenantId: 'synthetic-tenant' };
const expected = { identity, scope, sourceVersion: 'synthetic-loaded-generation' };
const now = new Date('2026-10-09T06:20:00Z');
const definitions = API.registeredModelConsumerDefinitions();
function source(): Record<string, unknown> {
  return {
    schemaVersion: 1, ...expected, authority: 'runtime-loaded', observedAt: '2026-10-09T06:19:59Z',
    validUntil: '2026-10-09T06:20:30Z', coverage: 'complete', missingSlots: [],
    selections: definitions.map(definition => {
      const descriptor = { provider: 'openai', modelId: 'synthetic-model', adapterId: 'synthetic-adapter', protocol: definition.function === 'embedding' ? 'embeddings' : 'chat-completions' };
      const common = { capability: definition.capability, function: definition.function, requirements: definition.requirements, catalogVersion: 'synthetic-catalog' };
      const settings = definition.routing === 'tiered'
        ? { ...common, mode: 'automatic', tiers: { standard: descriptor, advanced: descriptor, reasoning: descriptor }, fallback: descriptor }
        : definition.routing === 'failover'
          ? { ...common, mode: 'failover', primary: descriptor, fallback: descriptor }
          : { ...common, mode: 'single', descriptor, ...(definition.function === 'embedding' ? { embeddingDimensions: 1536 } : {}) };
      return { slotId: definition.slotId, settings };
    }),
  };
}
function current(input: unknown = source(), target: unknown = expected, clock = now): unknown {
  return ((Reflect.get(API, 'isAgentModelInitialSourceCurrent') ?? API.isAgentModelBootstrapSourceCurrent) as (...args: unknown[]) => boolean)(input, target, clock);
}
function state(initialSource: unknown = source()): Record<string, unknown> {
  return { identity, versions: null, saved: null, runtime: null, initialSource };
}

describe('roleless loaded model source before first Forge apply', () => {
  it('I01 is strict, detached, complete and roleless; old bootstrap remains Master-only', () => {
    const input = source();
    expect(schema().safeParse(input).success).toBe(true);
    const parsed = schema().parse(input);
    expect(parsed).toEqual(input);
    expect(parsed).not.toBe(input);
    expect(current(input)).toBe(true);
    expect(API.AgentModelBootstrapSourceSchema.safeParse(input).success).toBe(false);
    expect(API.AgentModelBootstrapSourceSchema.safeParse({ ...input, role: 'master' }).success).toBe(true);
    expect(Reflect.get(ROOT, 'AgentModelInitialSourceSchema')).toBe(schema());
    expect(Reflect.get(ROOT, 'isAgentModelInitialSourceCurrent')).toBe(exported('isAgentModelInitialSourceCurrent'));
  });
  it.each(['schemaVersion', 'identity', 'scope', 'authority', 'sourceVersion', 'observedAt', 'validUntil', 'coverage', 'selections', 'missingSlots'])('I02 requires %s', key => {
    const value = source(); delete value[key]; expect(schema().safeParse(value).success).toBe(false);
  });
  it.each([{ role: 'master' }, { role: 'erede' }, { role: 'unknown' }, { credentials: {} }, { context: {} }, { configVersion: 1 }, { authority: 'catalog' }, { sourceVersion: ' ' }])('I03 refuses fabricated or private authority %j', patch => {
    expect(schema().safeParse({ ...source(), ...patch }).success).toBe(false);
  });
  it.each(['managementAgentId', 'runtimeAgentId', 'vaultAgentId'])('I04 requires complete identity %s', key => {
    const id = { ...identity }; Reflect.deleteProperty(id, key);
    expect(schema().safeParse({ ...source(), identity: id }).success).toBe(false);
  });
  it.each(['agentId', 'ownerId', 'tenantId'])('I05 requires nonblank scope %s', key => {
    for (const value of [undefined, '', ' ']) expect(schema().safeParse({ ...source(), scope: { ...scope, [key]: value } }).success).toBe(false);
  });
  it('I06 binds runtime scope and strictly ordered validity', () => {
    expect(schema().safeParse({ ...source(), scope: { ...scope, agentId: 'another-runtime' } }).success).toBe(false);
    expect(schema().safeParse({ ...source(), validUntil: '2026-10-09T06:19:59Z' }).success).toBe(false);
  });
  it.each(definitions.map(row => row.slotId))('I07 missing registered %s blocks completeness', slotId => {
    const value = source(); value['selections'] = (value['selections'] as { slotId: string }[]).filter(row => row.slotId !== slotId);
    expect(schema().safeParse(value).success).toBe(false);
    value['coverage'] = 'partial'; value['missingSlots'] = [slotId];
    expect(schema().safeParse(value).success).toBe(true); expect(current(value)).toBe(false);
  });
  it('I08 refuses duplicate/unknown/overlapping slot coverage', () => {
    const value = source(); const rows = value['selections'] as { slotId: string }[];
    rows.push(rows[0]!); expect(schema().safeParse(value).success).toBe(false); rows.pop();
    rows[0]!.slotId = 'unknown'; expect(schema().safeParse(value).success).toBe(false);
    expect(schema().safeParse({ ...source(), coverage: 'partial', missingSlots: ['agent_chat'] }).success).toBe(false);
  });
  it('I09 same-generation exclusions preserve complete installed selections; all-excluded is blocked', () => {
    const value = source(); value['selections'] = (value['selections'] as { slotId: string }[]).filter(row => row.slotId !== 'mindfulness_stt');
    value['excludedSlots'] = [{ slotId: 'mindfulness_stt', state: 'not-installed', reason: 'Synthetic service absent at loaded generation' }];
    expect(schema().safeParse(value).success).toBe(true); expect(current(value)).toBe(true);
    value['selections'] = []; value['excludedSlots'] = definitions.map(row => ({ slotId: row.slotId, state: 'not-applicable', reason: 'Synthetic unavailable' }));
    expect(schema().safeParse(value).success).toBe(false);
  });
  it.each(['capability', 'function', 'requirements', 'mode'])('I10 enforces canonical consumer %s', key => {
    const value = source(); const rows = value['selections'] as { settings: Record<string, unknown> }[];
    // agent_chat normally uses tiered routing with tools and structured output.
    const settings = rows[0]!.settings;
    if (key === 'mode') {
      rows[0]!.settings = { capability: settings['capability'], function: settings['function'], requirements: settings['requirements'], catalogVersion: 'synthetic-catalog', mode: 'single', descriptor: { provider: 'openai', modelId: 'synthetic-model', adapterId: 'synthetic-adapter', protocol: 'chat-completions' } };
    } else settings[key] = key === 'capability' ? 'voice' : key === 'function' ? 'embedding' : { tools: false, stream: false, structuredOutput: false };
    expect(schema().safeParse(value).success).toBe(false);
  });
  it.each([{ sourceVersion: 'another-generation' }, { identity: { ...identity, managementAgentId: 'another' } }, { identity: { ...identity, runtimeAgentId: 'another' } }, { identity: { ...identity, vaultAgentId: 72 } }, { scope: { ...scope, agentId: 'another' } }, { scope: { ...scope, ownerId: 'another' } }, { scope: { ...scope, tenantId: 'another' } }])('I11 checks exact generation and every identity/scope field %j', patch => {
    expect(current(source(), { ...expected, ...patch })).toBe(false);
  });
  it.each(['2026-10-09T06:20:30Z', '2026-10-09T06:19:53Z', 'invalid'])('I12 rejects expired/future/invalid clock %s', time => {
    expect(current(source(), expected, new Date(time))).toBe(false);
  });
  it('I13 preserves bootstrap freshness semantics including explicit longer validity and future tolerance boundary', () => {
    const value = { ...source(), validUntil: '2026-10-09T06:30:00Z' };
    expect(current(value, expected, new Date('2026-10-09T06:22:00Z'))).toBe(true);
    expect(current(source(), expected, new Date('2026-10-09T06:19:54Z'))).toBe(true);
    expect(API.isAgentModelBootstrapSourceCurrent({ ...value, role: 'master' }, expected, new Date('2026-10-09T06:22:00Z'))).toBe(true);
  });
  it('I14 accepts additive initial/absent/null state without defaulting authority', () => {
    expect(API.AgentModelsStateSchema.parse(state())).toEqual(state());
    const old = state(null); delete old['initialSource']; expect(API.AgentModelsStateSchema.parse(old)).toEqual(old);
    expect(API.AgentModelsStateSchema.parse(state(null))).toEqual(state(null));
  });
  it.each(['managementAgentId', 'runtimeAgentId', 'vaultAgentId'])('I15 binds initial source to state identity %s', key => {
    expect(API.AgentModelsStateSchema.safeParse({ ...state(), identity: { ...identity, [key]: key === 'vaultAgentId' ? 72 : 'another' } }).success).toBe(false);
  });
  it('I16 refuses any persisted or applied version state, including null counters', () => {
    for (const versions of [{ desired: 1, applied: null, failed: null }, { desired: null, applied: null, failed: null }]) expect(API.AgentModelsStateSchema.safeParse({ ...state(), versions }).success).toBe(false);
  });
  it('I17 refuses concurrent old bootstrap authority and preserves modern saved requirement', () => {
    expect(API.AgentModelsStateSchema.safeParse({ ...state(), bootstrapSource: { ...source(), role: 'master' } }).success).toBe(false);
    const observation = { ...expected, observedAt: '2026-10-09T06:19:59Z', validUntil: '2026-10-09T06:20:30Z' };
    expect(API.AgentModelsStateSchema.safeParse({ ...state(), sourceObservation: observation }).success).toBe(false);
    expect(API.AgentModelsStateSchema.safeParse({ ...state(), initialSource: undefined, sourceObservation: observation }).success).toBe(false);
  });
  it('I18 refuses saved and runtime authorities independently', () => {
    const selections = source()['selections'];
    const saved = { schemaVersion: 1, identity, configVersion: 1, selections };
    expect(API.AgentModelsConfigurationSchema.safeParse(saved).success).toBe(true);
    expect(API.AgentModelsStateSchema.safeParse({ ...state(), versions: { desired: 1, applied: null, failed: null }, saved }).success).toBe(false);
    const runtime = { identity, configVersion: 1, requestId: 'synthetic-request-1', observedAt: '2026-10-09T06:19:59Z', selections: [{ slotId: 'agent_chat', capability: 'agent-core', function: 'reasoning', tier: 'standard', descriptor: { provider: 'openai', modelId: 'synthetic-model', adapterId: 'synthetic-adapter', protocol: 'chat-completions' } }] };
    expect(API.AgentModelRuntimeAttestationSchema.safeParse(runtime).success).toBe(true);
    expect(API.AgentModelsStateSchema.safeParse({ ...state(), versions: { desired: 1, applied: 1, failed: null }, runtime }).success).toBe(false);
  });
  it('I19 current helper rejects malformed source or expectation before authorizing use', () => {
    for (const input of [null, {}, { ...source(), role: 'master' }]) expect(current(input)).toBe(false);
    for (const target of [null, {}, { ...expected, sourceVersion: '' }, { ...expected, extra: true }]) expect(current(source(), target)).toBe(false);
  });
  it('I21 keeps modern observation stale after sixty seconds without adding that cap to initial source', () => {
    const value = { ...source(), validUntil: '2026-10-09T06:30:00Z' };
    const clock = new Date('2026-10-09T06:22:00Z');
    expect(current(value, expected, clock)).toBe(true);
    expect(API.isAgentModelSourceObservationCurrent({ ...expected, observedAt: value.observedAt, validUntil: value.validUntil }, expected, clock)).toBe(false);
  });
  it.each([{ state: 'unknown' }, { reason: '' }, { extra: true }])('I22 rejects unobserved or noncanonical exclusions %j', patch => {
    const value = source();
    value['selections'] = (value['selections'] as { slotId: string }[]).filter(row => row.slotId !== 'mindfulness_stt');
    value['excludedSlots'] = [{ slotId: 'mindfulness_stt', state: 'not-installed', reason: 'Synthetic absent', ...patch }];
    expect(schema().safeParse(value).success).toBe(false);
  });
  it('I23 unknown models stay missing and unknown or duplicate missing slots cannot erase coverage', () => {
    const value = { ...source(), coverage: 'partial', selections: [], missingSlots: definitions.map(row => row.slotId) };
    expect(schema().safeParse(value).success).toBe(true); expect(current(value)).toBe(false);
    for (const missingSlots of [[...value.missingSlots, 'unknown'], [...value.missingSlots, value.missingSlots[0]]]) {
      expect(schema().safeParse({ ...value, missingSlots }).success).toBe(false);
    }
  });
  it.each(['saved', 'runtime', 'versions'])('I24 independently reports initial authority conflict with %s', key => {
    const persisted = { schemaVersion: 1, identity, configVersion: 1, selections: source()['selections'] };
    const runtime = { identity, configVersion: 1, requestId: 'synthetic-request', observedAt: '2026-10-09T06:19:59Z', selections: [{ slotId: 'agent_chat', capability: 'agent-core', function: 'reasoning', tier: 'standard', descriptor: { provider: 'openai', modelId: 'synthetic-model', adapterId: 'synthetic-adapter', protocol: 'chat-completions' } }] };
    const value = { ...state(), [key]: key === 'saved' ? persisted : key === 'runtime' ? runtime : { desired: 1, applied: null, failed: null } };
    const parsed = API.AgentModelsStateSchema.safeParse(value);
    expect(parsed.success).toBe(false);
    expect(!parsed.success && parsed.error.issues.some(issue => issue.path.join('.') === 'initialSource' && issue.message === 'Initial source cannot claim a saved or applied version')).toBe(true);
  });
  it.each(['bootstrapSource', 'sourceObservation'])('I25 independently reports competing %s even when another legacy guard also rejects it', key => {
    const value = { ...state(), [key]: key === 'bootstrapSource' ? { ...source(), role: 'master' } : { ...expected, observedAt: '2026-10-09T06:19:59Z', validUntil: '2026-10-09T06:20:30Z' } };
    const parsed = API.AgentModelsStateSchema.safeParse(value);
    expect(parsed.success).toBe(false);
    expect(!parsed.success && parsed.error.issues.some(issue => issue.path.join('.') === 'initialSource' && issue.message === 'Initial source cannot coexist with another model authority')).toBe(true);
  });
  it('I20 state validates the initial payload itself without stripping role or private metadata', () => {
    for (const patch of [{ role: 'master' }, { credentials: {} }, { coverage: 'complete', selections: [] }]) {
      expect(API.AgentModelsStateSchema.safeParse(state({ ...source(), ...patch })).success).toBe(false);
    }
  });
});
