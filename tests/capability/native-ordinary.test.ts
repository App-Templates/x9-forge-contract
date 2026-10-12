import { describe, expect, it } from 'vitest';
import {
  CapabilityOrdinaryStructuredCodecs, CapabilityOrdinaryStructuredSchemaKeySchema,
  CapabilityOrdinaryValueSchema, CapabilityOrdinaryDeclarationSchema,
  CapabilityOrdinaryConfigurationSchema, CapabilityOrdinaryConfigStateSchema,
  CapabilityManifestSchema, CapabilityRegistryEntrySchema, capabilityOrdinaryDeclarationOf,
  parseCapabilityOrdinaryWrite, parseCapabilityOrdinaryCall,
  ElevenLabsNativeConfigSchema, ElevenLabsNativeDesiredConfigSchema,
} from '../../src/capability/index.js';
import { nativeConfig } from './native-fixtures.js';

const scope = { tenantId: 'tenant-native', ownerId: 'owner-native', agentId: 'agent-native' };
const capability = 'agent-elevenlabs';
const definition = {
  key: 'nativeConfig', type: 'structured', schemaKey: 'agent-elevenlabs.nativeConfig', schemaVersion: 1,
  label: 'Native settings', description: 'Concrete provider settings', status: 'decided',
  reference: 'agent-elevenlabs/native-config', appliesWhen: 'next_apply', consumes: true,
  optional: false, editableBy: ['owner'],
};
const declaration = { parameters: [definition], consumes: true, spendLedger: false };
const entry = { parameter: definition, origin: { kind: 'agent_override' }, value: nativeConfig };
const configuration = { format: 'ordinary-v2', scope, capability, version: 1, parameters: [entry] };
const write = { requestId: 'native-ordinary-write', expectedVersion: null, configuration };
const target = () => ({ scope, capability, parameters: CapabilityOrdinaryDeclarationSchema.parse(declaration).parameters });
const manifest = { name: capability, version: '1', endpoint: 'http://agent-elevenlabs:3000', tools: [] };
const registry = { name: capability, version: '1', host: 'agent-elevenlabs', port: 3000, enabled: true };
const observedAt = '2026-10-11T17:00:00Z';

describe('canonical native ordinary codec', () => {
  it('exports the same strict native schema and retains all concrete settings', () => {
    expect(CapabilityOrdinaryStructuredSchemaKeySchema.safeParse(definition.schemaKey).success).toBe(true);
    expect(CapabilityOrdinaryStructuredCodecs[definition.schemaKey as keyof typeof CapabilityOrdinaryStructuredCodecs]).toBe(ElevenLabsNativeConfigSchema);
    expect(CapabilityOrdinaryValueSchema.parse(nativeConfig)).toEqual(nativeConfig);
    expect(CapabilityOrdinaryConfigurationSchema.parse(configuration)).toEqual(configuration);
    expect(nativeConfig.agent.first_message).toBe('');
  });

  it('retains native metadata through real manifest, registry and declaration imports', () => {
    expect(CapabilityOrdinaryDeclarationSchema.parse(declaration)).toEqual(declaration);
    expect(CapabilityManifestSchema.parse({ ...manifest, ordinaryParameters: declaration }).ordinaryParameters).toEqual(declaration);
    expect(CapabilityRegistryEntrySchema.parse({ ...registry, ordinaryParameters: declaration }).ordinaryParameters).toEqual(declaration);
    expect(capabilityOrdinaryDeclarationOf({ ...manifest, ordinaryParameters: declaration })).toEqual(declaration);
  });

  it('accepts a canonical default but rejects a value belonging to another codec', () => {
    const parameter = { ...definition, platformDefault: nativeConfig };
    const config = { ...configuration, parameters: [{ parameter, origin: { kind: 'platform_default' }, value: nativeConfig }] };
    expect(CapabilityOrdinaryConfigurationSchema.parse(config)).toEqual(config);
    const foreign = [{ url: 'https://example.test/rss', category: 'science' }];
    expect(CapabilityOrdinaryDeclarationSchema.safeParse({ ...declaration, parameters: [{ ...parameter, platformDefault: foreign }] }).success).toBe(false);
    expect(CapabilityOrdinaryConfigurationSchema.safeParse({ ...configuration, parameters: [{ ...entry, value: foreign }] }).success).toBe(false);
    expect(CapabilityOrdinaryConfigurationSchema.safeParse({ ...configuration, parameters: [{ ...entry, parameter: { ...definition, schemaKey: 'news.feeds' } }] }).success).toBe(false);
  });

  it.each([{ schemaVersion: 2 }, { schemaKey: 'agent-elevenlabs.rawConfig' }])('rejects an unregistered codec declaration %j', changes => {
    expect(CapabilityOrdinaryDeclarationSchema.safeParse({ ...declaration, parameters: [{ ...definition, ...changes }] }).success).toBe(false);
  });

  it('rejects raw JSON strings, arbitrary bags and nativeDesired envelopes as values', () => {
    const desired = { scope, configVersion: 1, promptBundleHash: 'a'.repeat(64), fingerprint: 'b'.repeat(64), config: nativeConfig };
    expect(ElevenLabsNativeDesiredConfigSchema.parse(desired)).toEqual(desired);
    for (const value of [JSON.stringify(nativeConfig), { arbitrary: true }, desired, { ...nativeConfig, raw: {} }]) {
      expect(CapabilityOrdinaryConfigurationSchema.safeParse({ ...configuration, parameters: [{ ...entry, value }] }).success).toBe(false);
    }
  });

  it('retains mandatory native authentication and strict nested fields', () => {
    for (const value of [
      { ...nativeConfig, platform_settings: { auth: { ...nativeConfig.platform_settings.auth, enable_auth: false } } },
      { ...nativeConfig, platform_settings: { auth: { ...nativeConfig.platform_settings.auth, require_origin_header: false } } },
      { ...nativeConfig, agent: { ...nativeConfig.agent, prompt: { ...nativeConfig.agent.prompt, prompt: 'raw content' } } },
    ]) expect(CapabilityOrdinaryConfigurationSchema.safeParse({ ...configuration, parameters: [{ ...entry, value }] }).success).toBe(false);
  });

  it('preserves every legacy B1 definition when adding the native declaration', () => {
    const legacy = { ...definition, key: 'limit', type: 'integer', min: 1, max: 10 };
    const { schemaKey: _key, schemaVersion: _version, ...primitive } = legacy;
    void _key; void _version;
    const b1 = { ...declaration, parameters: [primitive] };
    const complete = { ...declaration, parameters: [primitive, definition] };
    expect(CapabilityManifestSchema.parse({ ...manifest, parameters: b1, ordinaryParameters: complete }).parameters).toEqual(b1);
    expect(CapabilityRegistryEntrySchema.parse({ ...registry, parameters: b1, ordinaryParameters: complete }).ordinaryParameters).toEqual(complete);
    expect(CapabilityManifestSchema.safeParse({ ...manifest, parameters: b1, ordinaryParameters: declaration }).success).toBe(false);
  });
});

describe('native settings through ordinary authority', () => {
  it('writes the concrete object with the existing declaration and CAS', () => {
    expect(parseCapabilityOrdinaryWrite(write, target(), null)).toEqual(write);
  });

  it.each(['tenantId', 'ownerId', 'agentId'] as const)('rejects native writes crossing %s', field => {
    expect(() => parseCapabilityOrdinaryWrite({ ...write, configuration: { ...configuration, scope: { ...scope, [field]: 'foreign' } } }, target(), null)).toThrow('target');
  });

  it('rejects wrong capability, stale version and substituted native declaration', () => {
    expect(() => parseCapabilityOrdinaryWrite({ ...write, configuration: { ...configuration, capability: 'news' } }, target(), null)).toThrow('target');
    expect(() => parseCapabilityOrdinaryWrite(write, target(), 1)).toThrow('CAS');
    const parameters = CapabilityOrdinaryDeclarationSchema.parse({ ...declaration, parameters: [{ ...definition, appliesWhen: 'immediate' }] }).parameters;
    expect(() => parseCapabilityOrdinaryWrite(write, { scope, capability, parameters }, null)).toThrow('declaration');
  });

  it('inherits only the exact native object from the authoritative Master revision', () => {
    const master = CapabilityOrdinaryConfigurationSchema.parse({ ...configuration, scope: { ...scope, agentId: 'master-native' }, version: 4 });
    const inherited = { ...entry, origin: { kind: 'master', source: { tenantId: scope.tenantId, ownerId: scope.ownerId, masterId: master.scope.agentId, version: 4 } } };
    const request = { ...write, configuration: { ...configuration, parameters: [inherited] } };
    expect(parseCapabilityOrdinaryWrite(request, target(), null, [master])).toEqual(request);
    const changed = { ...inherited, value: { ...nativeConfig, turn: { ...nativeConfig.turn, turn_timeout: 9 } } };
    expect(() => parseCapabilityOrdinaryWrite({ ...request, configuration: { ...configuration, parameters: [changed] } }, target(), null, [master])).toThrow('Master');
    expect(() => parseCapabilityOrdinaryWrite(request, target(), null, [{ ...master, version: 5 }])).toThrow('Master');
  });

  it('carries the complete frozen native object through call and effective state', () => {
    const parsed = CapabilityOrdinaryConfigurationSchema.parse(configuration);
    const snapshot = { scope, capability, version: 1, values: { nativeConfig } };
    expect(parseCapabilityOrdinaryCall(snapshot, parsed)).toEqual(snapshot);
    const state = { scope, capability, desired: configuration, runtimeState: 'loaded', failed: null,
      applied: { configuration, loadedAt: observedAt },
      effectiveParameters: [{ scope, capability, key: 'nativeConfig', value: nativeConfig, mode: 'next_apply', sourceConfigVersion: 1, observedAt }],
    };
    expect(CapabilityOrdinaryConfigStateSchema.parse(state)).toEqual(state);
    const changed = { ...nativeConfig, turn: { ...nativeConfig.turn, turn_timeout: 9 } };
    expect(() => parseCapabilityOrdinaryCall({ ...snapshot, values: { nativeConfig: changed } }, parsed)).toThrow();
    expect(CapabilityOrdinaryConfigStateSchema.safeParse({ ...state, effectiveParameters: [{ ...state.effectiveParameters[0], value: changed }] }).success).toBe(false);
  });
});
