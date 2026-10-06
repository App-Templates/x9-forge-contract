import { describe, expect, it } from 'vitest';
import { feedback, parameter, schema } from './review-fixtures.js';
describe('isolated wire boundaries after review', () => {
  it('rejects blank output descriptions and scope identifiers', () => {
    expect(schema('CapabilityOutputKindSchema').safeParse({ key: 'recipe', label: 'Ricetta', description: ' ' }).success).toBe(false);
    expect(schema('CapabilityFeedbackSourceSchema').safeParse({ kind: 'project_view', id: ' ' }).success).toBe(false);
  });
  it('bounds a public string value independently of semantic string constraints', () => {
    expect(schema('CapabilityParameterValueSchema').safeParse('a'.repeat(8000)).success).toBe(true);
    expect(schema('CapabilityParameterValueSchema').safeParse('a'.repeat(8001)).success).toBe(false);
  });
  it.each(['minLength', 'maxLength'])('bounds declared %s without a default', key => {
    const value = { ...parameter, type: 'string', [key]: 8000 };
    expect(schema('CapabilityParameterSchema').safeParse(value).success).toBe(true);
    expect(schema('CapabilityParameterSchema').safeParse({ ...value, [key]: 8001 }).success).toBe(false);
  });
  it.each(['minItems', 'maxItems'])('bounds declared %s without a default', key => {
    const value = { ...parameter, type: 'string_list', [key]: 100 };
    expect(schema('CapabilityParameterSchema').safeParse(value).success).toBe(true);
    expect(schema('CapabilityParameterSchema').safeParse({ ...value, [key]: 101 }).success).toBe(false);
  });
  it.each(['minLength', 'maxLength', 'minItems', 'maxItems'])('requires nonnegative integer %s without semantic masking', key => {
    const type = key.endsWith('Items') ? 'string_list' : 'string';
    for (const invalid of [-1, 0.5]) {
      expect(schema('CapabilityParameterSchema').safeParse({ ...parameter, type, [key]: invalid }).success).toBe(false);
    }
  });
  it('requires an approval kind even when the decision is present', () => {
    expect(schema('CapabilityFeedbackSchema').safeParse({ ...feedback, decision: 'approved' }).success).toBe(false);
  });
  it('bounds declared feedback sources independently of uniqueness', () => {
    const value = { label: 'Giudizi', kind: 'rating', attachments: false, sources: ['project_view', 'domain_app'] };
    expect(schema('CapabilityFeedbackDeclarationSchema').safeParse(value).success).toBe(true);
    expect(schema('CapabilityFeedbackDeclarationSchema').safeParse({ ...value, sources: [...value.sources, 'project_view'] }).success).toBe(false);
  });
  it('bounds an enum default and the option value together', () => {
    const value = { ...parameter, type: 'enum', options: [{ value: 'a'.repeat(2000), label: 'A' }], platformDefault: 'a'.repeat(2000) };
    expect(schema('CapabilityParameterSchema').safeParse(value).success).toBe(true);
    expect(schema('CapabilityParameterSchema').safeParse({ ...value, options: [{ value: 'a'.repeat(2001), label: 'A' }], platformDefault: 'a'.repeat(2001) }).success).toBe(false);
  });
  it('bounds a list element independently of its pattern', () => {
    const value = { ...parameter, type: 'string_list', platformDefault: ['a'.repeat(2000)] };
    expect(schema('CapabilityParameterSchema').safeParse(value).success).toBe(true);
    expect(schema('CapabilityParameterSchema').safeParse({ ...value, platformDefault: ['a'.repeat(2001)] }).success).toBe(false);
  });
  it('rejects an empty regular expression declaration', () => {
    expect(schema('CapabilityParameterSchema').safeParse({ ...parameter, type: 'string', pattern: '' }).success).toBe(false);
  });
  it('rejects extra fields in a string-list definition', () => {
    const value = { ...parameter, type: 'string_list', extra: true };
    expect(schema('CapabilityParameterSchema').safeParse(value).success).toBe(false);
  });
  it('bounds an agent capability identifier independently of output scope', () => {
    const value = { agentId: 'samira', capability: 'a'.repeat(100), version: 1, parameters: [] };
    expect(schema('CapabilityAgentParametersSchema').safeParse(value).success).toBe(true);
    expect(schema('CapabilityAgentParametersSchema').safeParse({ ...value, capability: 'a'.repeat(101) }).success).toBe(false);
  });
});
