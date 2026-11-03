import { describe, expect, it } from 'vitest';
import { CapabilityOrdinaryConfigurationSchema, CapabilityOrdinaryConfigStateSchema, parseCapabilityOrdinaryWrite, parseCapabilityOrdinaryCall } from '../../src/capability/ordinary-configuration.js';
import { CapabilityAgentParameterSchema } from '../../src/capability/parameters.js';

const scope = { tenantId: 'tenant-a', ownerId: 'owner-a', agentId: 'agent-a' };
const definition = { key: 'limit', type: 'integer', label: 'Limit', description: 'Limit', status: 'decided', reference: 'consumer', appliesWhen: 'next_apply', consumes: true, optional: false, editableBy: ['owner'], min: 1, max: 10 };
const parameter = { parameter: definition, origin: { kind: 'agent_override' }, value: 7 };
const configuration = { format: 'ordinary-v2', scope, capability: 'cap-news', version: 1, parameters: [parameter] };
const authority = { scope, capability: 'cap-news', parameters: [definition] };
const write = { requestId: 'ordinary-request-001', expectedVersion: null, configuration };

describe('ordinary write authority', () => {
  it('accepts first insert and exact next revision', () => {
    expect(parseCapabilityOrdinaryWrite(write, authority, null)).toEqual(write);
    const update = { ...write, expectedVersion: 1, configuration: { ...configuration, version: 2 } };
    expect(parseCapabilityOrdinaryWrite(update, authority, 1)).toEqual(update);
  });
  it('rejects another tenant even with the same agent and version', () => {
    expect(() => parseCapabilityOrdinaryWrite({ ...write, configuration: { ...configuration, scope: { ...scope, tenantId: 'tenant-b' } } }, authority, null)).toThrow();
  });
  it.each(['ownerId', 'agentId'] as const)('rejects another %s', key => {
    expect(() => parseCapabilityOrdinaryWrite({ ...write, configuration: { ...configuration, scope: { ...scope, [key]: 'other' } } }, authority, null)).toThrow('target');
  });
  it('rejects capability, altered declaration, undeclared key and duplicate keys', () => {
    expect(() => parseCapabilityOrdinaryWrite({ ...write, configuration: { ...configuration, capability: 'cap-other' } }, authority, null)).toThrow('target');
    for (const changes of [{ max: 20 }, { editableBy: ['superadmin'] }, { key: 'other' }]) expect(() => parseCapabilityOrdinaryWrite({ ...write, configuration: { ...configuration, parameters: [{ ...parameter, parameter: { ...definition, ...changes } }] } }, authority, null)).toThrow('declaration');
    expect(CapabilityOrdinaryConfigurationSchema.safeParse({ ...configuration, parameters: [parameter, parameter] }).success).toBe(false);
  });
  it.each([[null, 1, 2], [1, 1, 1], [1, 1, 3], [0, 1, 2], [null, 1, 1]])('rejects invalid CAS expected=%s current=%s next=%s', (expectedVersion, current, version) => {
    expect(() => parseCapabilityOrdinaryWrite({ ...write, expectedVersion, configuration: { ...configuration, version } }, authority, current)).toThrow();
  });
  it('reuses B1 constraints and keeps B1 origin unchanged', () => {
    for (const value of [0, 11, 2.5, '7']) expect(CapabilityOrdinaryConfigurationSchema.safeParse({ ...configuration, parameters: [{ ...parameter, value }] }).success).toBe(false);
    expect(CapabilityOrdinaryConfigurationSchema.safeParse({ ...configuration, parameters: [{ ...parameter, origin: { kind: 'needs_choice' } }] }).success).toBe(false);
    expect(CapabilityAgentParameterSchema.safeParse({ ...parameter, origin: 'master' }).success).toBe(false);
  });
  const master = { ...configuration, scope: { ...scope, agentId: 'master-a' }, version: 4 };
  const inherited = { ...parameter, origin: { kind: 'master', source: { tenantId: scope.tenantId, ownerId: scope.ownerId, masterId: 'master-a', version: 4 } } };
  const inheritedWrite = { ...write, configuration: { ...configuration, parameters: [inherited] } };
  it('accepts authoritative Master and rejects forged inherited value or stale revision', () => {
    expect(parseCapabilityOrdinaryWrite(inheritedWrite, authority, null, [master])).toEqual(inheritedWrite);
    expect(() => parseCapabilityOrdinaryWrite(inheritedWrite, authority, null, [])).toThrow('Master');
    expect(() => parseCapabilityOrdinaryWrite(inheritedWrite, authority, null, [master, master])).toThrow('Master');
    expect(() => parseCapabilityOrdinaryWrite(inheritedWrite, authority, null, [{ ...master, version: 5 }])).toThrow('Master');
    expect(() => parseCapabilityOrdinaryWrite({ ...inheritedWrite, configuration: { ...configuration, parameters: [{ ...inherited, value: 8 }] } }, authority, null, [master])).toThrow('Master');
  });
  it.each(['tenantId', 'ownerId'] as const)('rejects Master crossing %s', key => {
    expect(CapabilityOrdinaryConfigurationSchema.safeParse({ ...configuration, parameters: [{ ...inherited, origin: { ...inherited.origin, source: { ...inherited.origin.source, [key]: 'other' } } }] }).success).toBe(false);
  });
});

describe('ordinary effective state and dispatch', () => {
  const immediate = { ...parameter, parameter: { ...definition, key: 'immediate', appliesWhen: 'immediate' }, value: 8 };
  const desired = { ...configuration, version: 8, parameters: [parameter, immediate] };
  const effective = [{ scope, capability: configuration.capability, key: 'limit', value: 7, mode: 'next_apply', sourceConfigVersion: 7, observedAt: '2026-10-09T20:00:00Z' }, { scope, capability: configuration.capability, key: 'immediate', value: 8, mode: 'immediate', sourceConfigVersion: 8, observedAt: '2026-10-09T20:00:00Z' }];
  const state = { scope, capability: configuration.capability, desired, runtimeState: 'loaded', applied: null, failed: null, effectiveParameters: effective };
  it('keeps mixed immediate8/next_apply7 without a whole applied revision', () => {
    expect(CapabilityOrdinaryConfigStateSchema.parse(state)).toEqual(state);
    expect(CapabilityOrdinaryConfigStateSchema.safeParse({ ...state, applied: { configuration: desired, loadedAt: '2026-10-09T20:00:00Z' } }).success).toBe(false);
  });
  it('requires whole keyset and values before attesting applied', () => {
    const applied = { configuration: desired, loadedAt: '2026-10-09T20:00:00Z' };
    const complete = effective.map(entry => ({ ...entry, sourceConfigVersion: 8 }));
    expect(CapabilityOrdinaryConfigStateSchema.safeParse({ ...state, applied, effectiveParameters: complete }).success).toBe(true);
    for (const entries of [complete.slice(1), [...complete, complete[0]], complete.map(entry => ({ ...entry, value: 9 }))]) expect(CapabilityOrdinaryConfigStateSchema.safeParse({ ...state, applied, effectiveParameters: entries }).success).toBe(false);
  });
  it.each(['unloaded', 'unknown'])('does not infer applied/effective from desired when %s', runtimeState => {
    expect(CapabilityOrdinaryConfigStateSchema.safeParse({ ...state, runtimeState, effectiveParameters: [] }).success).toBe(true);
    expect(CapabilityOrdinaryConfigStateSchema.safeParse({ ...state, runtimeState }).success).toBe(false);
  });
  it('rejects cross-target desired, applied and effective evidence and future versions', () => {
    for (const key of ['tenantId', 'ownerId', 'agentId']) {
      const foreign = { ...scope, [key]: 'other' };
      expect(CapabilityOrdinaryConfigStateSchema.safeParse({ ...state, desired: { ...desired, scope: foreign } }).success).toBe(false);
      expect(CapabilityOrdinaryConfigStateSchema.safeParse({ ...state, effectiveParameters: [{ ...effective[0], scope: foreign }] }).success).toBe(false);
      expect(CapabilityOrdinaryConfigStateSchema.safeParse({ ...state, applied: { configuration: { ...desired, scope: foreign }, loadedAt: '2026-10-09T20:00:00Z' } }).success).toBe(false);
    }
    expect(CapabilityOrdinaryConfigStateSchema.safeParse({ ...state, effectiveParameters: [{ ...effective[0], sourceConfigVersion: 9 }] }).success).toBe(false);
  });
  const frozen = { ...desired, version: 7, parameters: [parameter, { ...immediate, value: 7 }] };
  const snapshot = { scope, capability: configuration.capability, version: 7, values: { limit: 7 } };
  it('dispatches exact frozen next_apply keys without overwriting immediate', () => {
    expect(parseCapabilityOrdinaryCall(snapshot, frozen)).toEqual(snapshot);
    for (const values of [{}, { limit: 8 }, { limit: 7, immediate: 7 }, { limit: 7, extra: 1 }]) expect(() => parseCapabilityOrdinaryCall({ ...snapshot, values }, frozen)).toThrow();
  });
  it('rejects call scope, capability or version substitutions', () => {
    for (const changes of [{ version: 8 }, { capability: 'cap-other' }, { scope: { ...scope, ownerId: 'other' } }]) expect(() => parseCapabilityOrdinaryCall({ ...snapshot, ...changes }, frozen)).toThrow('target');
  });
});

describe('structured ordinary-v2 in the same revision', () => {
  const { min: _min, max: _max, ...metadata } = definition;
  const structuredDefinition = { ...metadata, key: 'feeds', type: 'structured', schemaKey: 'news.feeds', schemaVersion: 1 };
  const structured = { parameter: structuredDefinition, origin: { kind: 'agent_override' }, value: [{ url: 'https://example.test/rss', category: 'science' }] };
  const config = { ...configuration, parameters: [parameter, structured] };
  it('accepts primitive and codec values under one version and CAS', () => {
    expect(parseCapabilityOrdinaryWrite({ ...write, configuration: config }, { ...authority, parameters: [definition, structuredDefinition] }, null).configuration).toEqual(config);
    expect(parseCapabilityOrdinaryCall({ scope, capability: config.capability, version: 1, values: { limit: 7, feeds: structured.value } }, config).values).toEqual({ limit: 7, feeds: structured.value });
  });
  it('rejects unregistered codec, wrong version, arbitrary JSON and invalid consumer value', () => {
    for (const changes of [{ schemaKey: 'unknown' }, { schemaVersion: 2 }]) expect(CapabilityOrdinaryConfigurationSchema.safeParse({ ...config, parameters: [{ ...structured, parameter: { ...structuredDefinition, ...changes } }] }).success).toBe(false);
    for (const value of ['[{"url":"https://example.test"}]', [{ url: 'invalid', category: 'science' }], { anything: true }]) expect(CapabilityOrdinaryConfigurationSchema.safeParse({ ...config, parameters: [{ ...structured, value }] }).success).toBe(false);
  });
  it('requires resource authority for rule and camera writes', () => {
    const rule = { ...structured, parameter: { ...structuredDefinition, schemaKey: 'rules.news' }, value: [] };
    expect(() => parseCapabilityOrdinaryWrite({ ...write, configuration: { ...configuration, parameters: [rule] } }, { ...authority, parameters: [rule.parameter] }, null)).toThrow('authority');
    const camera = { ...rule, parameter: { ...rule.parameter, schemaKey: 'security.cameraPolicies' } };
    expect(() => parseCapabilityOrdinaryWrite({ ...write, configuration: { ...configuration, parameters: [camera] } }, { ...authority, parameters: [camera.parameter] }, null)).toThrow('authority');
  });
});
