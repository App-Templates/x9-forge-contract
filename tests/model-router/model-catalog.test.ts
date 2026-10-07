import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import * as router from '../../src/model-router/index.js';

const api = router as unknown as {
  ModelCatalogSchema: z.ZodType;
  CapabilityModelSettingsSchema: z.ZodType;
  normalizeModelProvider: (value: unknown) => string | null;
  validateCapabilityModels: (settings: unknown, catalog: unknown, agentId: string, now?: Date) => string[];
};
const now = new Date('2026-10-07T16:00:00Z');
const descriptor = { provider: 'openai', modelId: 'fixture-model', protocol: 'responses', adapterId: 'openai-responses' };
const entry = { ...descriptor, function: 'reasoning', label: 'Fixture model', access: 'available', runtimeSupport: 'supported', features: { tools: true, stream: true, structuredOutput: true } };
const catalog = () => ({ agentId: 'primary', version: 'catalog-1', sourceVersion: 'source-1', source: 'provider-api', observedAt: now.toISOString(), validUntil: new Date(now.getTime() + 60_000).toISOString(), state: 'available', entries: [{ ...entry, features: { ...entry.features } }] });
const settings = () => ({ capability: 'agent-core', function: 'reasoning', mode: 'pin', catalogVersion: 'catalog-1', requirements: { tools: true, stream: true, structuredOutput: false }, pin: { ...descriptor }, tiers: { standard: { ...descriptor }, advanced: { ...descriptor }, reasoning: { ...descriptor } }, fallback: { ...descriptor } });
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

describe('model catalog exports', () => {
  it('exports the catalog, capability selection and canonical provider resolver', () => {
    for (const key of ['ModelCatalogSchema', 'CapabilityModelSettingsSchema', 'normalizeModelProvider', 'validateCapabilityModels']) expect(api[key as keyof typeof api]).toBeDefined();
  });
});

describe('attested model catalog', () => {
  it('accepts metadata without claiming any named real model is available', () => { expect(api.ModelCatalogSchema.safeParse(catalog()).success).toBe(true); });
  it.each(['apiKey', 'token', 'baseUrl', 'endpoint'])('rejects %s outside the metadata allowlist', key => { expect(api.ModelCatalogSchema.safeParse({ ...catalog(), [key]: 'synthetic-only' }).success).toBe(false); });
  it('rejects duplicate model/function descriptors', () => { const value = catalog(); value.entries.push({ ...entry }); expect(api.ModelCatalogSchema.safeParse(value).success).toBe(false); });
  it('allows one model to have separate function attestations', () => { const value = catalog(); value.entries.push({ ...entry, function: 'memory-extraction' }); expect(api.ModelCatalogSchema.safeParse(value).success).toBe(true); });
  it('requires validity to end after observation', () => { const value = catalog(); value.validUntil = value.observedAt; expect(api.ModelCatalogSchema.safeParse(value).success).toBe(false); });
  it.each(['version', 'sourceVersion'])('rejects empty %s', key => { expect(api.ModelCatalogSchema.safeParse({ ...catalog(), [key]: '' }).success).toBe(false); });
  it.each(['version', 'sourceVersion'])('bounds %s', key => { expect(api.ModelCatalogSchema.safeParse({ ...catalog(), [key]: 'x'.repeat(65) }).success).toBe(false); });
  it.each(['', ' ', 'x'.repeat(121)])('rejects invalid display label %s', label => { const value = catalog(); value.entries[0]!.label = label; expect(api.ModelCatalogSchema.safeParse(value).success).toBe(false); });
  it.each(['https://synthetic.invalid', 'OpenAI', 'claude', 'gemini'])('rejects noncanonical provider %s on the wire', provider => { const value = catalog(); value.entries[0]!.provider = provider; expect(api.ModelCatalogSchema.safeParse(value).success).toBe(false); });
  it('rejects an adapter URL instead of accepting a browser supplied host', () => { const value = catalog(); value.entries[0]!.adapterId = 'https://synthetic.invalid'; expect(api.ModelCatalogSchema.safeParse(value).success).toBe(false); });
  it.each(['function', 'protocol', 'access', 'runtimeSupport'])('rejects unknown %s semantics', key => { const value = catalog(); Object.assign(value.entries[0]!, { [key]: 'invented', reason: 'Synthetic unavailable semantics' }); expect(api.ModelCatalogSchema.safeParse(value).success).toBe(false); });
  it('requires an explanation for unavailable or unsupported entries', () => { const value = catalog(); value.entries[0]!.runtimeSupport = 'unsupported'; expect(api.ModelCatalogSchema.safeParse(value).success).toBe(false); Object.assign(value.entries[0]!, { reason: 'Adapter not connected' }); expect(api.ModelCatalogSchema.safeParse(value).success).toBe(true); });
  it('requires dimensions only for an embedding function', () => { const value = catalog(); value.entries[0]!.function = 'embedding'; expect(api.ModelCatalogSchema.safeParse(value).success).toBe(false); Object.assign(value.entries[0]!, { embeddingDimensions: 1536 }); expect(api.ModelCatalogSchema.safeParse(value).success).toBe(true); const chat = catalog(); Object.assign(chat.entries[0]!, { embeddingDimensions: 1536 }); expect(api.ModelCatalogSchema.safeParse(chat).success).toBe(false); });
  it('rejects invalid embedding dimensions', () => { const value = catalog(); Object.assign(value.entries[0]!, { function: 'embedding', embeddingDimensions: 0 }); expect(api.ModelCatalogSchema.safeParse(value).success).toBe(false); });
  it.each([['claude', 'anthropic'], ['gemini', 'google'], ['openai', 'openai'], ['local', 'local']])('normalizes the legacy provider %s at the server boundary', (value, expected) => { expect(api.normalizeModelProvider(value)).toBe(expected); });
  it.each([null, {}, '', 'https://synthetic.invalid'])('refuses unsafe provider input %j', value => { expect(api.normalizeModelProvider(value)).toBeNull(); });
});

describe('capability owned model selection', () => {
  it('pins every tier and the fallback without an implicit alternative', () => { expect(api.CapabilityModelSettingsSchema.safeParse(settings()).success).toBe(true); });
  it.each(['standard', 'advanced', 'reasoning', 'fallback'])('rejects a different %s descriptor under a pin', key => { const value = clone(settings()); const target = key === 'fallback' ? value.fallback : value.tiers[key as keyof typeof value.tiers]; target.modelId = 'different-model'; expect(api.CapabilityModelSettingsSchema.safeParse(value).success).toBe(false); });
  it('compares provider, protocol and registered adapter, not only model id', () => { for (const [key, value] of Object.entries({ provider: 'anthropic', protocol: 'messages', adapterId: 'different-adapter' })) { const input = clone(settings()); Object.assign(input.fallback, { [key]: value }); expect(api.CapabilityModelSettingsSchema.safeParse(input).success).toBe(false); } });
  it.each(['standard', 'advanced', 'reasoning'])('requires the %s tier', key => { const value = clone(settings()); delete (value.tiers as Partial<typeof value.tiers>)[key as keyof typeof value.tiers]; expect(api.CapabilityModelSettingsSchema.safeParse(value).success).toBe(false); });
  it('preserves automatic routing with different tier choices', () => { const { pin: _pin, ...value } = settings(); Object.assign(value, { mode: 'automatic' }); value.tiers.advanced.modelId = 'advanced-fixture'; expect(api.CapabilityModelSettingsSchema.safeParse(value).success).toBe(true); });
  it('rejects an agent global choice or a server URL in the capability descriptor', () => { const value = settings(); expect(api.CapabilityModelSettingsSchema.safeParse({ ...value, agentGlobalModel: descriptor }).success).toBe(false); expect(api.CapabilityModelSettingsSchema.safeParse({ ...value, fallback: { ...descriptor, baseUrl: 'https://synthetic.invalid' } }).success).toBe(false); });
  it('accepts choices only from the current attested catalog', () => { expect(api.validateCapabilityModels(settings(), catalog(), 'primary', now)).toEqual([]); });
  it('does not accept malformed settings or catalog', () => { expect(api.validateCapabilityModels({}, catalog(), 'primary', now)).toEqual(['invalid-settings']); expect(api.validateCapabilityModels(settings(), {}, 'primary', now)).toEqual(['invalid-catalog']); });
  it('rejects an old catalog version', () => { const value = settings(); value.catalogVersion = 'older'; expect(api.validateCapabilityModels(value, catalog(), 'primary', now)).toContain('catalog-version-mismatch'); });
  it('rejects expired evidence exactly at validUntil', () => { const value = catalog(); expect(api.validateCapabilityModels(settings(), value, 'primary', new Date(value.validUntil))).toContain('catalog-stale'); });
  it('rejects a future observation and an invalid consumer clock', () => { expect(api.validateCapabilityModels(settings(), catalog(), 'primary', new Date(now.getTime() - 5001))).toContain('catalog-stale'); expect(api.validateCapabilityModels(settings(), catalog(), 'primary', new Date(NaN))).toContain('catalog-stale'); });
  it.each(['unavailable', 'not-configured'])('does not turn a %s source into a selectable catalog', state => { expect(api.validateCapabilityModels(settings(), { ...catalog(), state }, 'primary', now)).toContain('catalog-unavailable'); });
  it('keeps attested entries selectable in a partial snapshot', () => { expect(api.validateCapabilityModels(settings(), { ...catalog(), state: 'partial' }, 'primary', now)).toEqual([]); });
  it('rejects a descriptor for another function', () => { const value = catalog(); value.entries[0]!.function = 'tts'; expect(api.validateCapabilityModels(settings(), value, 'primary', now)).toContain('model-not-attested'); });
  it('requires exact provider, model, protocol and adapter evidence', () => { for (const [key, value] of Object.entries({ provider: 'anthropic', modelId: 'different-model', protocol: 'messages', adapterId: 'different-adapter' })) { const input = clone(catalog()); Object.assign(input.entries[0]!, { [key]: value }); expect(api.validateCapabilityModels(settings(), input, 'primary', now)).toContain('model-not-attested'); } });
  it.each(['access', 'runtimeSupport'])('refuses a known but unavailable %s', key => { const value = catalog(); Object.assign(value.entries[0]!, { [key]: key === 'access' ? 'unknown' : 'unsupported', reason: 'Not attested for this adapter' }); expect(api.validateCapabilityModels(settings(), value, 'primary', now)).toContain('model-unavailable'); });
  it.each(['tools', 'stream', 'structuredOutput'])('checks the consumer requirement %s', key => { const value = catalog(); Object.assign(value.entries[0]!.features, { [key]: false }); const config = settings(); Object.assign(config.requirements, { [key]: true }); expect(api.validateCapabilityModels(config, value, 'primary', now)).toContain('feature-unsupported'); });
  it('requires structured output for memory extraction even without an optional caller flag', () => { const value = catalog(); value.entries[0]!.function = 'memory-extraction'; value.entries[0]!.features.structuredOutput = false; const config = settings(); config.function = 'memory-extraction'; expect(api.validateCapabilityModels(config, value, 'primary', now)).toContain('feature-unsupported'); });
});

it('rejects evidence belonging to a different management agent', () => { const value = catalog(); value.agentId = 'other'; expect(api.validateCapabilityModels(settings(), value, 'primary', now)).toContain('agent-mismatch'); });
it('allows unavailable sources with no timestamps but not available sources', () => { const value = { ...catalog(), state: 'unavailable', observedAt: null, validUntil: null }; expect(api.ModelCatalogSchema.safeParse(value).success).toBe(true); expect(api.ModelCatalogSchema.safeParse({ ...value, state: 'available' }).success).toBe(false); });
it('rejects an unpaired catalog timestamp', () => { expect(api.ModelCatalogSchema.safeParse({ ...catalog(), validUntil: null }).success).toBe(false); });
it.each([1.5, Infinity, -1])('rejects invalid embedding dimension %s', embeddingDimensions => { const value = catalog(); Object.assign(value.entries[0]!, { function: 'embedding', embeddingDimensions }); expect(api.ModelCatalogSchema.safeParse(value).success).toBe(false); });

it('accepts a separately attested transcription function', () => { const value = catalog(); Object.assign(value.entries[0]!, { function: 'transcription', protocol: 'transcriptions' }); expect(api.ModelCatalogSchema.safeParse(value).success).toBe(true); });
it.each(['source', 'state'])('rejects unknown catalog %s', key => { expect(api.ModelCatalogSchema.safeParse({ ...catalog(), [key]: 'invented' }).success).toBe(false); });
it.each(['observedAt', 'validUntil'])('rejects malformed catalog time %s', key => { expect(api.ModelCatalogSchema.safeParse({ ...catalog(), [key]: 'yesterday' }).success).toBe(false); });
it.each(['', ' ', 'x'.repeat(501)])('rejects invalid explanation %s', reason => { const value = catalog(); Object.assign(value.entries[0]!, { reason }); expect(api.ModelCatalogSchema.safeParse(value).success).toBe(false); });
it('requires an explanation when access is unavailable', () => { const value = catalog(); value.entries[0]!.access = 'unavailable'; expect(api.ModelCatalogSchema.safeParse(value).success).toBe(false); });
it('rejects extra descriptor and feature fields', () => { const value = catalog(); Object.assign(value.entries[0]!, { token: 'synthetic' }); expect(api.ModelCatalogSchema.safeParse(value).success).toBe(false); const features = catalog(); Object.assign(features.entries[0]!.features, { baseUrl: 'synthetic' }); expect(api.ModelCatalogSchema.safeParse(features).success).toBe(false); });
it.each(['tools', 'stream', 'structuredOutput'])('requires boolean feature %s', key => { const value = catalog(); Object.assign(value.entries[0]!.features, { [key]: 'yes' }); expect(api.ModelCatalogSchema.safeParse(value).success).toBe(false); });
it('requires safe registered adapter ids', () => { for (const adapterId of ['', 'Adapter', 'x'.repeat(65)]) { const value = catalog(); value.entries[0]!.adapterId = adapterId; expect(api.ModelCatalogSchema.safeParse(value).success).toBe(false); } });
it('rejects extra automatic settings and unrecognized tiers', () => { const { pin: _pin, ...value } = settings(); Object.assign(value, { mode: 'automatic', baseUrl: 'synthetic' }); expect(api.CapabilityModelSettingsSchema.safeParse(value).success).toBe(false); const input = settings(); Object.assign(input.tiers, { invented: descriptor }); expect(api.CapabilityModelSettingsSchema.safeParse(input).success).toBe(false); });
it('validates all automatic tiers and fallback against the catalog', () => { for (const key of ['standard', 'advanced', 'reasoning', 'fallback']) { const { pin: _pin, ...value } = clone(settings()); value.mode = 'automatic'; if (key === 'fallback') value.fallback.modelId = 'unknown'; else value.tiers[key as keyof typeof value.tiers].modelId = 'unknown'; expect(api.validateCapabilityModels(value, catalog(), 'primary', now)).toContain('model-not-attested'); } });
it.each(['maxInputTokens', 'maxOutputTokens', 'maxInputCharacters', 'maxAudioSeconds'])('rejects nonpositive or nonfinite limit %s', key => { for (const invalid of [0, -1, Infinity]) { const value = catalog(); Object.assign(value.entries[0]!, { limits: { [key]: invalid } }); expect(api.ModelCatalogSchema.safeParse(value).success).toBe(false); } });
it.each(['maxInputTokens', 'maxOutputTokens', 'maxInputCharacters'])('rejects fractional count limit %s', key => { const value = catalog(); Object.assign(value.entries[0]!, { limits: { [key]: 1.5 } }); expect(api.ModelCatalogSchema.safeParse(value).success).toBe(false); });
it('accepts only metadata limits without inventing unknown values', () => { const value = catalog(); Object.assign(value.entries[0]!, { limits: { maxAudioSeconds: 1.5, maxInputTokens: 10 } }); expect(api.ModelCatalogSchema.safeParse(value).success).toBe(true); Object.assign(value.entries[0]!, { limits: { baseUrl: 'synthetic' } }); expect(api.ModelCatalogSchema.safeParse(value).success).toBe(false); });

it.each(['standard', 'advanced', 'reasoning'])('requires automatic tier %s', key => { const { pin: _pin, ...value } = settings(); value.mode = 'automatic'; delete (value.tiers as Partial<typeof value.tiers>)[key as keyof typeof value.tiers]; expect(api.CapabilityModelSettingsSchema.safeParse(value).success).toBe(false); });
