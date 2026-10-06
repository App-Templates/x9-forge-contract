import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import * as capability from '../../src/capability/index.js';

const exports = capability as unknown as Record<string, z.ZodType>;
function schema(name: string): z.ZodType {
  expect(exports[name], name).toBeDefined();
  return exports[name]!;
}

export const parameter = {
  key: 'budget.dailyUsd', label: 'Budget al giorno', description: 'Massimo consentito',
  explanation: 'Il budget non si supera mai.', group: 'Spesa', unit: 'USD',
  type: 'number', min: 0, max: 100, platformDefault: 15,
  status: 'decided', reference: 'D54-12', appliesWhen: 'immediate', consumes: true,
};
const declaration = { parameters: [parameter], consumes: true, spendLedger: true };
const resolved = { parameter, origin: 'platform_default', value: 15 };
const agent = { agentId: 'samira', capability: 'ricerca', version: 1, parameters: [resolved] };
const withoutDefault = (({ platformDefault: _default, ...rest }) => rest)(parameter);
const nonNumeric = (({ min: _min, max: _max, platformDefault: _default, ...rest }) => rest)(parameter);
const invalidDefinitions: [string, unknown][] = [
  ['invalid key', { ...parameter, key: '../budget' }],
  ['empty label', { ...parameter, label: ' ' }],
  ['empty description', { ...parameter, description: ' ' }],
  ['empty explanation', { ...parameter, explanation: '' }],
  ['empty group', { ...parameter, group: '' }],
  ['empty unit', { ...parameter, unit: '' }],
  ['unknown type', { ...parameter, type: 'object' }],
  ['unknown status', { ...parameter, status: 'approved' }],
  ['missing reference', { ...parameter, reference: undefined }],
  ['unknown application time', { ...parameter, appliesWhen: 'tomorrow' }],
  ['missing spend flag', { ...parameter, consumes: undefined }],
  ['extra definition field', { ...parameter, projectId: 'food' }],
  ['minimum above maximum', { ...withoutDefault, min: 101 }],
  ['default below minimum', { ...parameter, platformDefault: -1 }],
  ['default above maximum', { ...parameter, platformDefault: 101 }],
  ['wrong default type', { ...parameter, platformDefault: '15' }],
  ['nonfinite minimum', { ...withoutDefault, min: Infinity, max: undefined }],
  ['nonfinite maximum', { ...parameter, max: Infinity }],
  ['nonfinite default', { ...parameter, platformDefault: Infinity }],
  ['fractional integer value', { ...parameter, type: 'integer', platformDefault: 1.5 }],
  ['fractional integer bound', { ...parameter, type: 'integer', min: 0.5 }],
  ['string length below minimum', { ...nonNumeric, type: 'string', minLength: 2, platformDefault: 'a' }],
  ['string length above maximum', { ...nonNumeric, type: 'string', maxLength: 2, platformDefault: 'abc' }],
  ['string bounds reversed', { ...nonNumeric, type: 'string', minLength: 3, maxLength: 2 }],
  ['fractional string bound', { ...nonNumeric, type: 'string', minLength: 1.5 }],
  ['negative string bound', { ...nonNumeric, type: 'string', maxLength: -1 }],
  ['wrong boolean default', { ...nonNumeric, type: 'boolean', platformDefault: 1 }],
  ['empty enum', { ...nonNumeric, type: 'enum', options: [] }],
  ['duplicate enum options', { ...nonNumeric, type: 'enum', options: [{ value: 'a', label: 'A' }, { value: 'a', label: 'B' }] }],
  ['unknown enum default', { ...nonNumeric, type: 'enum', options: [{ value: 'a', label: 'A' }], platformDefault: 'b' }],
  ['empty enum value', { ...nonNumeric, type: 'enum', options: [{ value: '', label: 'A' }] }],
  ['empty enum label', { ...nonNumeric, type: 'enum', options: [{ value: 'a', label: ' ' }] }],
  ['extra enum option field', { ...nonNumeric, type: 'enum', options: [{ value: 'a', label: 'A', extra: true }] }],
];
const invalidResolved: [string, unknown][] = [
  ['wrong string chosen type', { parameter: { ...nonNumeric, type: 'string' }, origin: 'agent_override', value: 1 }],
  ['wrong boolean chosen type', { parameter: { ...nonNumeric, type: 'boolean' }, origin: 'agent_override', value: 1 }],
  ['unknown enum choice', { parameter: { ...nonNumeric, type: 'enum', options: [{ value: 'a', label: 'A' }] }, origin: 'agent_override', value: 'b' }],
  ['fractional chosen integer', { parameter: { ...withoutDefault, type: 'integer' }, origin: 'agent_override', value: 1.5 }],
  ['chosen string too short', { parameter: { ...nonNumeric, type: 'string', minLength: 2 }, origin: 'agent_override', value: 'a' }],
  ['chosen string too long', { parameter: { ...nonNumeric, type: 'string', maxLength: 1 }, origin: 'agent_override', value: 'ab' }],
  ['choice state zero is still a value', { parameter: withoutDefault, origin: 'needs_choice', value: 0 }],
  ['choice state false default exists', { parameter: { ...nonNumeric, type: 'boolean', platformDefault: false }, origin: 'needs_choice' }],
  ['unknown origin', { ...resolved, origin: 'owner' }],
  ['missing chosen value', { ...resolved, origin: 'agent_override', value: undefined }],
  ['chosen value outside constraints', { ...resolved, origin: 'agent_override', value: 101 }],
  ['default source without declared default', { ...resolved, parameter: withoutDefault }],
  ['default source disagrees with default', { ...resolved, value: 16 }],
  ['choice state with value', { parameter: withoutDefault, origin: 'needs_choice', value: 1 }],
  ['choice state hides default', { parameter, origin: 'needs_choice' }],
  ['extra resolved field', { ...resolved, projectId: 'food' }],
];
describe('B1 declared capability parameters', () => {
  it.each([
    ['number', parameter],
    ['integer', { ...parameter, type: 'integer' }],
    ['boolean false', { ...nonNumeric, type: 'boolean', platformDefault: false }],
    ['string', { ...nonNumeric, type: 'string', minLength: 1, maxLength: 4, platformDefault: 'test' }],
    ['enum', { ...nonNumeric, type: 'enum', options: [{ value: 'a', label: 'A' }], platformDefault: 'a' }],
    ['required choice', withoutDefault],
    ['proposed next apply', { ...parameter, status: 'proposed', appliesWhen: 'next_apply' }],
  ])('accepts %s without choosing a product default', (_name, value) => {
    expect(schema('CapabilityParameterSchema').parse(value)).toEqual(value);
  });
  it.each(invalidDefinitions)('rejects %s', (_name, value) => {
    expect(schema('CapabilityParameterSchema').safeParse(value).success).toBe(false);
  });
  it.each([
    ['platform default', resolved],
    ['agent override', { ...resolved, origin: 'agent_override', value: 20 }],
    ['required choice', { parameter: withoutDefault, origin: 'needs_choice' }],
  ])('retains %s provenance', (_name, value) => {
    expect(schema('CapabilityAgentParameterSchema').parse(value)).toEqual(value);
  });
  it.each(invalidResolved)('rejects %s', (_name, value) => {
    expect(schema('CapabilityAgentParameterSchema').safeParse(value).success).toBe(false);
  });
  it('declares spend availability and parameter metadata without agent configuration', () => {
    expect(schema('CapabilityParametersDeclarationSchema').parse(declaration)).toEqual(declaration);
  });
  it.each([
    ['repeated parameter key', { ...declaration, parameters: [parameter, parameter] }],
    ['extra declaration field', { ...declaration, projectId: 'food' }],
    ['missing capability spend flag', { parameters: [], spendLedger: false }],
    ['missing ledger flag', { parameters: [], consumes: false }],
  ])('rejects %s', (_name, value) => {
    expect(schema('CapabilityParametersDeclarationSchema').safeParse(value).success).toBe(false);
  });
  it('scopes values to one agent and one capability with an explicit version', () => {
    expect(schema('CapabilityAgentParametersSchema').parse(agent)).toEqual(agent);
  });
  it.each([
    ['bad agent id', { ...agent, agentId: '../other' }],
    ['missing agent id', { ...agent, agentId: undefined }],
    ['empty capability', { ...agent, capability: '' }],
    ['zero version', { ...agent, version: 0 }],
    ['fractional version', { ...agent, version: 1.5 }],
    ['repeated agent parameter key', { ...agent, parameters: [resolved, resolved] }],
    ['extra agent field', { ...agent, projectId: 'food' }],
  ])('rejects %s', (_name, value) => {
    expect(schema('CapabilityAgentParametersSchema').safeParse(value).success).toBe(false);
  });
});

it.each([NaN, Infinity, [], {}, null].map(value => [value]))('public parameter value rejects nonprimitive/nonfinite input %#', value => {
  expect(schema('CapabilityParameterValueSchema').safeParse(value).success).toBe(false);
});
it('zero and false platform defaults remain resolved, never missing', () => {
  for (const parameter of [
    { ...nonNumeric, type: 'boolean', platformDefault: false },
    { ...withoutDefault, platformDefault: 0 },
  ]) {
    const value = { parameter, origin: 'platform_default', value: parameter.platformDefault };
    expect(schema('CapabilityAgentParameterSchema').safeParse(value).success).toBe(true);
    expect(schema('CapabilityAgentParameterSchema').parse(value)).toHaveProperty('value', parameter.platformDefault);
  }
});

it.each([
  { ...parameter, type: 'integer' },
  { ...nonNumeric, type: 'string' },
  { ...nonNumeric, type: 'boolean' },
  { ...nonNumeric, type: 'enum', options: [{ value: 'a', label: 'A' }] },
])('each parameter variant rejects extra fields %#', parameter => {
  expect(schema('CapabilityParameterSchema').safeParse({ ...parameter, extra: true }).success).toBe(false);
});
