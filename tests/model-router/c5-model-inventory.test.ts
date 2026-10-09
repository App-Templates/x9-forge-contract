import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import * as router from '../../src/model-router/index.js';

const schema = (): z.ZodType => Reflect.get(router, 'ModelCatalogInventoryEntrySchema') as z.ZodType | undefined ?? z.unknown();
const unknown = () => ({ provider: 'openai', modelId: 'synthetic-unclassified', access: 'available', compatibility: 'unqualified' });
const entry = () => ({ provider: 'openai', modelId: 'synthetic-qualified', protocol: 'responses', adapterId: 'synthetic-adapter', function: 'reasoning', label: 'Synthetic', access: 'available', runtimeSupport: 'supported', features: { tools: true, stream: false, structuredOutput: false } });
const catalog = () => ({ agentId: 'forge-a', version: 'observation-2', sourceVersion: 'scope-source-1', source: 'provider-api', observedAt: '2026-10-08T12:00:00Z', validUntil: '2026-10-08T12:01:00Z', state: 'partial', entries: [entry()], inventory: [unknown()] });
const without = (input: Record<string, unknown>, key: string) => { const result = { ...input }; delete result[key]; return result; };

describe('C5 canonical unqualified model inventory', () => {
  it('MI01 exposes the separate public inventory entry schema', () => expect(Reflect.get(router, 'ModelCatalogInventoryEntrySchema')).toBeDefined());
  it('MI02 accepts provider discovery without inventing executable compatibility', () => {
    expect(schema().parse(unknown())).toEqual(unknown());
    expect(router.ModelCatalogSchema.safeParse(catalog()).success).toBe(true);
    expect(router.ModelCatalogSchema.parse(catalog())).toEqual(catalog());
  });
  for (const field of ['provider', 'modelId', 'access', 'compatibility']) {
    it(`MI03 requires ${field}`, () => expect(schema().safeParse(without(unknown(), field)).success).toBe(false));
    it(`MI04 rejects null ${field}`, () => expect(schema().safeParse({ ...unknown(), [field]: null }).success).toBe(false));
  }
  for (const access of ['available', 'unknown', 'unavailable', 'not-configured']) {
    it(`MI05 represents explicit provider access ${access} independently`, () => expect(schema().safeParse({ ...unknown(), access }).success).toBe(true));
  }
  for (const provider of ['claude', 'gemini', 'OpenAI', 'https://synthetic.invalid', '']) {
    it(`MI06 rejects noncanonical provider ${provider}`, () => expect(schema().safeParse({ ...unknown(), provider }).success).toBe(false));
  }
  for (const compatibility of ['supported', 'unsupported', 'qualified', 'unknown', '']) {
    it(`MI07 cannot guess compatibility ${compatibility}`, () => expect(schema().safeParse({ ...unknown(), compatibility }).success).toBe(false));
  }
  for (const field of ['function', 'protocol', 'adapterId', 'embeddingDimensions', 'token', 'reason']) {
    it(`MI08 rejects invented or extra ${field}`, () => expect(schema().safeParse({ ...unknown(), [field]: 'fixture-only' }).success).toBe(false));
  }
  it('MI09 rejects duplicate exact provider/model pairs', () => { const value = catalog(); value.inventory.push(unknown()); expect(router.ModelCatalogSchema.safeParse(value).success).toBe(false); });
  it('MI10 permits identical IDs on different canonical providers', () => { const value = catalog(); value.inventory.push({ ...unknown(), provider: 'anthropic' }); expect(router.ModelCatalogSchema.safeParse(value).success).toBe(true); });
  it('MI11 qualified entries and inventory cannot duplicate an ID', () => { const value = catalog(); value.inventory[0]!.modelId = entry().modelId; expect(router.ModelCatalogSchema.safeParse(value).success).toBe(false); });
  it('MI12 inventory with unresolved IDs cannot call the catalog fully available', () => { const value = catalog(); value.state = 'available'; expect(router.ModelCatalogSchema.safeParse(value).success).toBe(false); });
  it.each(['unavailable', 'not-configured'])('MI13 nonempty inventory requires partial, not %s', state => { expect(router.ModelCatalogSchema.safeParse({ ...catalog(), state }).success).toBe(false); });
  it('MI14 explicit empty inventory records an observation, distinct from legacy absence', () => {
    const value = { ...catalog(), inventory: [], state: 'available' };
    expect(router.ModelCatalogSchema.safeParse(value).success).toBe(true);
    expect(router.ModelCatalogSchema.parse(value)).toEqual(value);
    const legacy = without(value, 'inventory'); expect(router.ModelCatalogSchema.parse(legacy)).toEqual(legacy);
  });
  it('MI15 empty inventory without observation cannot claim unknown IDs were checked', () => {
    const value = { ...catalog(), inventory: [], state: 'unavailable', observedAt: null, validUntil: null };
    expect(router.ModelCatalogSchema.safeParse(value).success).toBe(false);
  });
  it('MI16 legacy unobserved unavailable catalog remains valid without inventory', () => {
    const value = without({ ...catalog(), state: 'unavailable', observedAt: null, validUntil: null, entries: [] }, 'inventory');
    expect(router.ModelCatalogSchema.parse(value)).toEqual(value);
  });
  it('MI17 unknown access does not become unsupported or selected', () => {
    const value = { ...catalog(), inventory: [{ ...unknown(), access: 'unknown' }] };
    const parsed = router.ModelCatalogSchema.safeParse(value);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect((parsed.data as unknown as typeof value).inventory[0]).toEqual(value.inventory[0]);
  });
  it('MI18 unqualified inventory is never a selectable catalog entry', () => expect(router.ModelCatalogEntrySchema.safeParse(unknown()).success).toBe(false));
  it('MI19 multiple qualified functions of one ID remain separate entries', () => {
    const value = { ...catalog(), inventory: [], entries: [entry(), { ...entry(), function: 'memory-extraction' }] };
    expect(router.ModelCatalogSchema.safeParse(value).success).toBe(true);
  });
  it('MI20 rejects null inventory instead of dropping it', () => expect(router.ModelCatalogSchema.safeParse({ ...catalog(), inventory: null }).success).toBe(false));
  it('MI21 validates model IDs through the existing canonical ID schema', () => expect(schema().safeParse({ ...unknown(), modelId: '' }).success).toBe(false));
  it('MI22 validates access through the existing canonical access enum', () => expect(schema().safeParse({ ...unknown(), access: 'probably' }).success).toBe(false));
});
