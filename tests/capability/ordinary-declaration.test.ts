import { describe, expect, it } from 'vitest';
import { CapabilityManifestSchema } from '../../src/capability/capability-manifest.js';
import { CapabilityRegistryEntrySchema } from '../../src/capability/capability-registry-entry.js';
import { CapabilityOrdinaryDeclarationSchema, capabilityOrdinaryDeclarationOf } from '../../src/capability/ordinary-declaration.js';

const primitive = { key: 'limit', type: 'integer', label: 'Limit', description: 'Limit', status: 'decided', reference: 'consumer', appliesWhen: 'next_apply', consumes: true, optional: false, editableBy: ['owner'], min: 1, max: 10 };
const { min, max, ...metadata } = primitive; void min; void max;
const structured = { ...metadata, key: 'feeds', type: 'structured', schemaKey: 'news.feeds', schemaVersion: 1 };
const declaration = { parameters: [primitive, structured], consumes: true, spendLedger: false };
const manifest = { name: 'news', version: '1', endpoint: 'http://news:3000', tools: [] };
const registry = { name: 'news', version: '1', host: 'news', port: 3000, enabled: true };

describe('ordinary parameter metadata', () => {
  it('retains the complete declaration through real manifest and registry parsing', () => {
    expect(CapabilityManifestSchema.parse({ ...manifest, ordinaryParameters: declaration }).ordinaryParameters).toEqual(declaration);
    expect(CapabilityRegistryEntrySchema.parse({ ...registry, ordinaryParameters: declaration }).ordinaryParameters).toEqual(declaration);
  });
  it('preserves legacy absence and distinguishes absent metadata from explicit no parameters', () => {
    expect(CapabilityManifestSchema.parse(manifest)).toEqual(manifest);
    expect(CapabilityRegistryEntrySchema.parse(registry)).toEqual(registry);
    expect(capabilityOrdinaryDeclarationOf(manifest)).toBeNull();
    expect(capabilityOrdinaryDeclarationOf({ ...manifest, ordinaryParameters: { ...declaration, parameters: [] } })?.parameters).toEqual([]);
  });
  it('reuses B1 metadata without relabeling the parameter or budget ledger', () => {
    const legacy = { ...declaration, parameters: [primitive] };
    expect(capabilityOrdinaryDeclarationOf({ ...manifest, parameters: legacy })).toEqual(legacy);
    expect(capabilityOrdinaryDeclarationOf({ ...manifest, parameters: legacy, ordinaryParameters: declaration })).toEqual(declaration);
  });
  it('rejects duplicate keys and unqualified codecs', () => {
    expect(CapabilityOrdinaryDeclarationSchema.safeParse({ ...declaration, parameters: [primitive, primitive] }).success).toBe(false);
    expect(CapabilityOrdinaryDeclarationSchema.safeParse({ ...declaration, parameters: [{ ...structured, schemaKey: 'arbitrary.json' }] }).success).toBe(false);
  });
  it.each([['missing', []], ['bounds', [{ ...primitive, max: 100 }, structured]], ['permissions', [{ ...primitive, editableBy: ['superadmin'] }, structured]]])('rejects B1 definition changes: %s', (_label, parameters) => {
    const input = { parameters: { ...declaration, parameters: [primitive] }, ordinaryParameters: { ...declaration, parameters } };
    expect(() => capabilityOrdinaryDeclarationOf({ ...manifest, ...input })).toThrow();
    expect(CapabilityManifestSchema.safeParse({ ...manifest, ...input }).success).toBe(false);
    expect(CapabilityRegistryEntrySchema.safeParse({ ...registry, ...input }).success).toBe(false);
  });
});
