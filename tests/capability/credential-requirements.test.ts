import { describe, expect, it } from 'vitest';
import * as capability from '../../src/capability/index.js';
import { AUTH_GATE_FIELDS } from '../../src/agent/agent-credentials.js';
import { PLATFORM_INTERNAL_CREDENTIAL_KEYS } from '../../src/vault/platform-internal-credentials.js';

const requirements = [
  { key: 'GOOGLE_CALENDAR_CLIENT_ID', required: true },
  { key: 'GOOGLE_CALENDAR_REFRESH_TOKEN', required: true },
  { key: 'ELEVENLABS_MODEL_ID', required: false },
];
const manifest = { name: 'calendar', version: '1.0.0', endpoint: 'http://calendar:3000', tools: [] };
const registry = { name: 'calendar', version: '1.0.0', host: 'calendar', port: 3000, enabled: true };

describe('capability credential requirement metadata', () => {
  it('exports the canonical single and list schemas', () => {
    expect(Reflect.get(capability, 'CapabilityCredentialRequirementSchema')).toBeDefined();
    expect(Reflect.get(capability, 'CapabilityCredentialRequirementsSchema')).toBeDefined();
  });
  for (const [name, schema, base] of [
    ['manifest', capability.CapabilityManifestSchema, manifest],
    ['registry', capability.CapabilityRegistryEntrySchema, registry],
  ] as const) {
    describe(name, () => {
      it('preserves required, optional, public and setting declarations through JSON', () => {
        const input = { ...base, credentialRequirements: requirements };
        expect(schema.parse(JSON.parse(JSON.stringify(input)))).toEqual(input);
      });
      it('preserves absent declarations without inventing authority', () => {
        expect(schema.parse(base)).toEqual(base);
        expect(schema.parse(base)).not.toHaveProperty('credentialRequirements');
      });
      it('preserves an explicit empty declaration', () => {
        expect(schema.parse({ ...base, credentialRequirements: [] })).toHaveProperty('credentialRequirements', []);
      });
      it('accepts at most 64 distinct canonical dynamic names', () => {
        const entries = Array.from({ length: 64 }, (_, i) => ({ key: `dynamic.key-${i}`, required: false }));
        expect(schema.parse({ ...base, credentialRequirements: entries })).toHaveProperty('credentialRequirements', entries);
        expect(schema.safeParse({ ...base, credentialRequirements: [...entries, { key: 'last', required: false }] }).success).toBe(false);
      });
      it('rejects duplicates even when their required flags disagree', () => {
        expect(schema.safeParse({ ...base, credentialRequirements: [{ key: 'OPENAI_API_KEY', required: true }, { key: 'OPENAI_API_KEY', required: false }] }).success).toBe(false);
      });
      it.each([
        null, {}, 'OPENAI_API_KEY',
        [{ key: 'OPENAI_API_KEY' }],
        [{ key: 'OPENAI_API_KEY', required: 'true' }],
        [{ key: 'OPENAI_API_KEY', required: null }],
        [{ key: 'OPENAI_API_KEY', required: true, value: 'forbidden-metadata-value' }],
        [{ key: 'OPENAI_API_KEY', required: true, extra: true }],
        [{ key: '', required: true }],
        [{ key: 'bad key', required: true }],
        [{ key: '1bad', required: true }],
        [{ key: 'K'.repeat(129), required: true }],
      ])('rejects malformed or value-bearing metadata %#', credentialRequirements => {
        expect(schema.safeParse({ ...base, credentialRequirements }).success).toBe(false);
      });
      it.each([...AUTH_GATE_FIELDS, ...PLATFORM_INTERNAL_CREDENTIAL_KEYS])('rejects internal authority key %s', key => {
        expect(schema.safeParse({ ...base, credentialRequirements: [{ key, required: false }] }).success).toBe(false);
      });
    });
  }
  it('round-trips the same declaration from manifest into a registry file', () => {
    const parsed = capability.CapabilityManifestSchema.parse({ ...manifest, credentialRequirements: requirements });
    const declaration = Reflect.get(parsed, 'credentialRequirements');
    expect(declaration).toEqual(requirements);
    expect(capability.AgentRegistryFileSchema.parse({ capabilities: [{ ...registry, credentialRequirements: declaration }] }))
      .toEqual({ capabilities: [{ ...registry, credentialRequirements: requirements }] });
  });
});
