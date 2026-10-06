import { describe, expect, it } from 'vitest';
import { parameter, schema } from './review-fixtures.js';
const base = { ...parameter, optional: false };
const list = { ...base, key: 'pageKinds', type: 'string_list', minItems: 1, maxItems: 30,
  pattern: '^[a-z][a-z0-9_]{0,39}$', platformDefault: ['technique', 'ingredient'] };
const string = { ...base, key: 'domain', type: 'string', pattern: '^[a-z][a-z0-9-]{1,39}$', platformDefault: 'cucina' };
describe('review R4 generic existing agent configuration', () => {
  it.each([list, string, { ...base, key: 'models.digest', type: 'string', optional: true }])('declares lists, slug patterns and optional fields %#', value => {
    expect(schema('CapabilityParameterSchema').safeParse(value)).toMatchObject({ success: true, data: value });
  });
  it('retains a list platform default by value, even after cloning', () => {
    const value = { parameter: list, origin: 'platform_default', value: [...list.platformDefault] };
    expect(schema('CapabilityAgentParameterSchema').safeParse(value)).toMatchObject({ success: true, data: value });
    expect(schema('CapabilityParameterValueSchema').safeParse(value.value).success).toBe(true);
  });
  it('accepts an empty declared default when minItems is zero', () => {
    const definition = { ...base, type: 'string_list', minItems: 0, maxItems: 0, platformDefault: [] };
    expect(schema('CapabilityAgentParameterSchema').safeParse({ parameter: definition, origin: 'platform_default', value: [] }).success).toBe(true);
  });
  it('accepts a constrained list override', () => {
    expect(schema('CapabilityAgentParameterSchema').safeParse({ parameter: list, origin: 'agent_override', value: ['pairing'] }).success).toBe(true);
  });
  it('permits an absent optional override without inventing a default', () => {
    const value = { parameter: { ...base, key: 'models.read', type: 'string', optional: true }, origin: 'agent_override' };
    expect(schema('CapabilityAgentParameterSchema').safeParse(value)).toMatchObject({ success: true, data: value });
  });
  it('accepts enumerated list choices', () => {
    const value = { ...list, options: [{ value: 'technique', label: 'Tecnica' }, { value: 'ingredient', label: 'Ingrediente' }] };
    expect(schema('CapabilityParameterSchema').safeParse(value)).toMatchObject({ success: true, data: value });
  });
  it.each([
    { ...base, optional: undefined }, { ...base, optional: 'yes' },
    { ...string, pattern: '[', platformDefault: undefined }, { ...string, pattern: 'a'.repeat(201), platformDefault: undefined },
    { ...string, platformDefault: 'Cucina' },
    { ...list, platformDefault: ['Technique'] }, { ...list, platformDefault: [] },
    { ...list, maxItems: 1 }, { ...list, minItems: 31, platformDefault: undefined },
    { ...list, minItems: -1 }, { ...list, maxItems: 1.5, platformDefault: undefined }, { ...list, maxItems: 101 },
    { ...list, options: [], platformDefault: undefined },
    { ...list, options: [{ value: 'technique', label: 'A' }, { value: 'technique', label: 'B' }], platformDefault: undefined },
    { ...list, options: [{ value: 'pairing', label: 'Abbinamento' }] },
    { ...list, platformDefault: ['a'.repeat(2001)] },
    { ...list, minItems: 0, maxItems: undefined, pattern: undefined, platformDefault: Array.from({ length: 101 }, () => 'a') },
  ])('rejects impossible list/string declarations %#', value => {
    expect(schema('CapabilityParameterSchema').safeParse(value).success).toBe(false);
  });
  it.each([
    { parameter: list, origin: 'agent_override', value: 'technique' },
    { parameter: list, origin: 'agent_override', value: [] },
    { parameter: list, origin: 'agent_override', value: ['Technique'] },
    { parameter: list, origin: 'agent_override', value: ['a'.repeat(2001)] },
    { parameter: { ...list, maxItems: 2 }, origin: 'agent_override', value: ['a', 'b', 'c'] },
    { parameter: { ...list, options: [{ value: 'technique', label: 'Tecnica' }], platformDefault: ['technique'] }, origin: 'agent_override', value: ['ingredient'] },
    { parameter: string, origin: 'agent_override', value: 'Cucina' },
    { parameter: { ...base, type: 'string', optional: false }, origin: 'agent_override' },
    { parameter: { ...base, type: 'string', optional: true }, origin: 'platform_default' },
    { parameter: { ...base, type: 'string', optional: true }, origin: 'agent_override', value: 1 },
    { parameter: list, origin: 'platform_default', value: ['technique'] },
    { parameter: { ...list, maxItems: undefined, platformDefault: undefined, pattern: undefined }, origin: 'agent_override', value: Array.from({ length: 101 }, () => 'a') },
  ])('rejects wrong resolved types, patterns, counts and origins %#', value => {
    expect(schema('CapabilityAgentParameterSchema').safeParse(value).success).toBe(false);
  });
});
