import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { CapabilityManifestSchema, CapabilityRegistryEntrySchema } from '../../src/capability/index.js';
import { capManifestContract, capAgentConfigPath, ricercaAgentConfigPutContract, labAgentConfigPutContract } from '../../src/http/index.js';

const manifest = { name: 'synthetic', version: '1.0', endpoint: 'http://synthetic:3000', tools: [] };
const registry = { name: 'synthetic', enabled: true, host: 'synthetic', port: 3000, version: '1.0' };
const parameters = { consumes: false, spendLedger: false, parameters: [{
  key: 'enabled', label: 'Attivo', description: 'Attiva il lavoro', type: 'boolean',
  status: 'decided', reference: 'D1', appliesWhen: 'next_apply', consumes: false,
}] };
const presentation = { trends: [{ key: 'uses', label: 'Usi al giorno', unit: 'usi' }] };

describe('additive B1/B7 declarations', () => {
  for (const [name, schema, legacy] of [
    ['manifest', CapabilityManifestSchema, manifest],
    ['registry', CapabilityRegistryEntrySchema, registry],
  ] as const) {
    it(name + ' retains an old payload exactly', () => {
      expect(schema.parse(legacy)).toEqual(legacy);
    });
    it(name + ' retains B1 parameters', () => {
      const value = { ...legacy, parameters };
      expect(schema.parse(value)).toEqual(value);
    });
    it(name + ' retains B7 presentation', () => {
      const value = { ...legacy, presentation };
      expect(schema.parse(value)).toEqual(value);
    });
    it(name + ' validates B1 rather than silently stripping it', () => {
      expect(schema.safeParse({ ...legacy, parameters: { ...parameters, extra: true } }).success).toBe(false);
    });
    it(name + ' validates B7 rather than silently stripping it', () => {
      expect(schema.safeParse({ ...legacy, presentation: { ...presentation, extra: true } }).success).toBe(false);
    });
  }
  it('the existing manifest endpoint carries the optional declarations', () => {
    expect(capManifestContract.responseSchema.parse({ ...manifest, parameters, presentation })).toEqual({ ...manifest, parameters, presentation });
    expect(capManifestContract.path).toBe('/manifest');
    expect(capManifestContract.authType).toBe('none');
  });
  it('existing per-agent config routes retain secret auth and their paths', () => {
    expect(capAgentConfigPath('samira')).toBe('/internal/capability/agents/samira/config');
    expect(ricercaAgentConfigPutContract.authType).toBe('secret');
    expect(labAgentConfigPutContract.authType).toBe('secret');
  });
});

describe('built B1/B7 exports for real consumers', () => {
  for (const [specifier, symbols] of [
    ['@x9-forge/contracts/capability/parameters', ['CapabilityParameterSchema', 'CapabilityAgentParametersSchema']],
    ['@x9-forge/contracts/capability/presentation', ['CapabilityOutputSchema', 'CapabilityFeedbackSchema', 'CapabilityTrendsSchema']],
  ] as const) {
    it(specifier + ' resolves with ESM', async () => {
      const load = () => import(specifier);
      await expect(load()).resolves.toMatchObject(Object.fromEntries(symbols.map(name => [name, expect.objectContaining({ parse: expect.any(Function) })])));
    });
    it(specifier + ' resolves with CJS', () => {
      const require = createRequire(import.meta.url);
      expect(() => require(specifier)).not.toThrow();
      const exports = require(specifier) as Record<string, { parse: unknown }>;
      for (const name of symbols) expect(typeof exports[name]?.parse, name).toBe('function');
    });
  }
});
