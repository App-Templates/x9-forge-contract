import { describe, expect, it } from 'vitest';
import { composeOrdinaryCapabilityAgentConfigPut, parseOrdinaryCapabilityAgentConfigPut } from '../../src/http/index.js';
import {
  CapabilityOrdinaryConfigStateSchema,
  type CapabilityOrdinaryConfigState,
  type CapabilityOrdinaryConfiguration,
  type CapabilityOrdinaryTarget,
} from '../../src/capability/ordinary-configuration.js';

const scope = { tenantId: 'tenant-a', ownerId: 'owner-a', agentId: 'agent-a' };
const metadata = {
  label: 'Setting', description: 'Capability setting', status: 'decided', reference: 'consumer',
  appliesWhen: 'next_apply', consumes: true, optional: false, editableBy: ['owner'],
} as const;
const runsOn = {
  ...metadata, key: 'round.runsOn', type: 'enum',
  options: [{ value: 'mac', label: 'Mac' }, { value: 'server', label: 'Server' }], platformDefault: 'mac',
} as const;
// The manifest arrays are mutable schema values, while the target itself is read-only.
const authority: CapabilityOrdinaryTarget = {
  scope, capability: 'cap-social-listening', parameters: [
    { ...runsOn, editableBy: ['owner'], options: [...runsOn.options] },
    { ...metadata, editableBy: ['owner'], key: 'round.dailyUsd', type: 'number', min: 1, max: 10 },
    { ...metadata, editableBy: ['owner'], key: 'round.note', type: 'string', optional: true, maxLength: 20 },
  ],
};
const requestId = 'ordinary-compose-3717';
const master: CapabilityOrdinaryConfiguration = {
  format: 'ordinary-v2', scope: { ...scope, agentId: 'master-a' }, capability: authority.capability, version: 2,
  parameters: [{ parameter: authority.parameters[1], origin: { kind: 'agent_override' }, value: 6 }],
};
const inherited = {
  parameter: authority.parameters[1], value: 6,
  origin: { kind: 'master', source: { tenantId: scope.tenantId, ownerId: scope.ownerId, masterId: 'master-a', version: 2 } },
};
function readState(): CapabilityOrdinaryConfigState {
  return CapabilityOrdinaryConfigStateSchema.parse({
    scope, capability: authority.capability, runtimeState: 'unknown', applied: null, failed: null, effectiveParameters: [],
    desired: { format: 'ordinary-v2', scope, capability: authority.capability, version: 3, parameters: [
      { parameter: authority.parameters[0], origin: { kind: 'platform_default' }, value: 'mac' },
      inherited,
      { parameter: authority.parameters[2], origin: { kind: 'needs_choice' } },
    ] },
  });
}

type ComposeInput = Parameters<typeof composeOrdinaryCapabilityAgentConfigPut>[0];
// Every successful result is checked again at the public PUT boundary with the read version.
function compose(input: ComposeInput) {
  const result = composeOrdinaryCapabilityAgentConfigPut(input);
  if (result.ok) {
    expect(parseOrdinaryCapabilityAgentConfigPut(result.write, { agentId: input.authority.scope.agentId },
      input.authority, input.state?.desired?.version ?? null, input.masters)).toEqual(result.write);
  }
  return result;
}

describe('ordinary composition s3717', () => {
  it('s3717 first write uses defaults and explicit unresolved choices', () => {
    const result = compose({ state: null, authority, values: {}, requestId });
    expect(result).toEqual({ ok: true, changedKeys: [], write: {
      requestId, expectedVersion: null,
      configuration: { format: 'ordinary-v2', scope, capability: authority.capability, version: 1, parameters: [
        { parameter: authority.parameters[0], origin: { kind: 'platform_default' }, value: 'mac' },
        { parameter: authority.parameters[1], origin: { kind: 'needs_choice' } },
        { parameter: authority.parameters[2], origin: { kind: 'needs_choice' } },
      ] },
    } });
  });

  it('s3717 preserves Master and needs_choice while changing only supplied keys', () => {
    const state = readState(), before = structuredClone(state);
    const result = compose({ state, authority, values: { 'round.runsOn': 'server' }, requestId, masters: [master] });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Expected a valid composition');
    expect(result.changedKeys).toEqual(['round.runsOn']);
    expect(result.write.expectedVersion).toBe(3);
    expect(result.write.configuration.version).toBe(4);
    expect(result.write.configuration.parameters).toEqual([
      { parameter: authority.parameters[0], origin: { kind: 'agent_override' }, value: 'server' },
      before.desired?.parameters[1], before.desired?.parameters[2],
    ]);
    expect(state).toEqual(before);
  });

  it.each(['unknown', 'scope', 'agentId', '__proto__', 'constructor'])('s3717 rejects own undeclared key %s', key => {
    const values = Object.fromEntries([[key, 'server']]);
    expect(compose({ state: null, authority, values, requestId })).toEqual({ ok: false, error: 'unknown_parameter', keys: [key] });
  });

  it('s3717 ignores inherited values without invoking prototype getters', () => {
    const prototype = Object.defineProperty({}, 'round.runsOn', { get() { throw new Error('Prototype was read'); } });
    const values: Record<string, unknown> = Object.create(prototype);
    const result = compose({ state: null, authority, values, requestId });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Expected a valid composition');
    expect(result.changedKeys).toEqual([]);
    expect(result.write.configuration.parameters[0].origin).toEqual({ kind: 'platform_default' });
  });

  it('s3717 handles null prototypes and collects unknown keys before validating values', () => {
    const values: Record<string, unknown> = Object.create(null);
    values['round.dailyUsd'] = -1;
    values.scope = scope;
    values.agentId = scope.agentId;
    expect(compose({ state: null, authority, values, requestId })).toEqual({ ok: false, error: 'unknown_parameter', keys: ['scope', 'agentId'] });
  });

  it('s3717 reports all invalid entries in declaration order', () => {
    expect(compose({ state: null, authority, requestId,
      values: { 'round.note': 'x'.repeat(21), 'round.dailyUsd': 11, 'round.runsOn': 'elsewhere' },
    })).toEqual({ ok: false, error: 'invalid_value', keys: ['round.runsOn', 'round.dailyUsd', 'round.note'] });
  });

  it.each(['tenantId', 'ownerId', 'agentId', 'capability'])('s3717 rejects state for another %s', key => {
    const state = readState();
    const foreign = key === 'capability' ? { ...state, capability: 'cap-lab' }
      : { ...state, scope: { ...scope, [key]: 'other' } };
    expect(compose({ state: foreign, authority, values: {}, requestId })).toEqual({ ok: false, error: 'target_mismatch' });
  });

  it('s3717 treats an absent desired revision as a first write', () => {
    expect(compose({ state: { ...readState(), desired: null }, authority, values: {}, requestId }))
      .toEqual(compose({ state: null, authority, values: {}, requestId }));
  });

  it('s3717 keeps explicit defaults as overrides and orders changes by declarations', () => {
    const values = { 'round.note': undefined, 'round.runsOn': 'mac' };
    const result = compose({ state: null, authority, values, requestId });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Expected a valid composition');
    expect(result.changedKeys).toEqual(['round.runsOn', 'round.note']);
    expect(result.write.configuration.parameters[0]).toEqual({ parameter: authority.parameters[0], origin: { kind: 'agent_override' }, value: 'mac' });
    expect(result.write.configuration.parameters[2].origin.kind).toBe('agent_override');
    expect(values).toEqual({ 'round.note': undefined, 'round.runsOn': 'mac' });
  });

  it('s3717 replaces changed declarations using the new default or needs_choice', () => {
    const changed: CapabilityOrdinaryTarget = { ...authority, parameters: [
      { ...runsOn, editableBy: ['owner'], options: [...runsOn.options], platformDefault: 'server' },
      { ...authority.parameters[1], label: 'New daily limit' }, authority.parameters[2],
    ] };
    const result = compose({ state: readState(), authority: changed, values: {}, requestId });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Expected a valid composition');
    expect(result.write.configuration.parameters).toEqual([
      { parameter: changed.parameters[0], origin: { kind: 'platform_default' }, value: 'server' },
      { parameter: changed.parameters[1], origin: { kind: 'needs_choice' } },
      readState().desired?.parameters[2],
    ]);
  });

  it('s3717 accepts structurally equal declarations with different property order', () => {
    const reordered = { ...authority, parameters: authority.parameters.map(({ key, ...rest }) => ({ ...rest, key })) };
    const result = compose({ state: readState(), authority: reordered, values: {}, requestId, masters: [master] });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Expected a valid composition');
    expect(result.write.configuration.parameters).toEqual(readState().desired?.parameters);
  });

  it('s3717 returns invalid_write for missing or stale Master authority', () => {
    for (const masters of [[], [{ ...master, version: 3 }], [master, master]]) {
      expect(compose({ state: readState(), authority, values: {}, requestId, masters }))
        .toEqual({ ok: false, error: 'invalid_write' });
    }
  });

  it('s3717 returns invalid_write for an invalid envelope or duplicate declarations', () => {
    expect(compose({ state: null, authority, values: {}, requestId: '' })).toEqual({ ok: false, error: 'invalid_write' });
    expect(compose({ state: null, authority: { ...authority, parameters: [authority.parameters[0], authority.parameters[0]] }, values: {}, requestId }))
      .toEqual({ ok: false, error: 'invalid_write' });
  });

  it('s3717 checks structured values with the registered codec', () => {
    const structured: CapabilityOrdinaryTarget = { ...authority, parameters: [{
      ...metadata, editableBy: ['owner'], key: 'feeds', type: 'structured', schemaKey: 'news.feeds', schemaVersion: 1,
    }] };
    expect(compose({ state: null, authority: structured, values: { feeds: [{ url: 'invalid' }] }, requestId }))
      .toEqual({ ok: false, error: 'invalid_value', keys: ['feeds'] });
    expect(compose({ state: null, authority: structured, values: { feeds: [{ url: 'https://example.test/rss', category: 'science' }] }, requestId }).ok).toBe(true);
  });

  it('s3717 recomposes the Lab initial default/override shape entry for entry', () => {
    // Production-shaped readback: company initialization supplies defaults or explicit overrides.
    const lab: CapabilityOrdinaryTarget = { scope, capability: 'cap-lab', parameters: [
      { ...metadata, editableBy: ['owner'], key: 'domain', type: 'string', platformDefault: 'General knowledge' },
      { ...metadata, editableBy: ['owner'], key: 'pageKinds', type: 'string_list', minItems: 1, platformDefault: ['concept', 'source'] },
    ] };
    const desired: CapabilityOrdinaryConfiguration = { format: 'ordinary-v2', scope, capability: lab.capability, version: 1, parameters: [
      { parameter: lab.parameters[0], origin: { kind: 'agent_override' }, value: 'Company research' },
      { parameter: lab.parameters[1], origin: { kind: 'platform_default' }, value: ['concept', 'source'] },
    ] };
    const state = CapabilityOrdinaryConfigStateSchema.parse({ ...readState(), capability: lab.capability, desired });
    const before = structuredClone(state);
    const result = compose({ state, authority: lab, values: {}, requestId });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Expected a valid composition');
    expect(result.write.configuration.parameters).toEqual(desired.parameters);
    expect(result.changedKeys).toEqual([]);
    expect(result.write.expectedVersion).toBe(1);
    expect(result.write.configuration.version).toBe(2);
    expect(state).toEqual(before);
  });
});
