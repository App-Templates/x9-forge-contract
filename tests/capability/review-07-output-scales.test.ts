import { describe, expect, it } from 'vitest';
import { schema } from './review-fixtures.js';
const field = { key: 'criticScore', label: 'Voto del critico', type: 'number', min: 1, max: 10 };
describe('R7 output field types and numeric scales', () => {
  it.each(['text', 'number', 'boolean', 'json'])('exports field type %s', type => {
    expect(schema('CapabilityOutputFieldTypeSchema').safeParse(type)).toMatchObject({ success: true, data: type });
  });
  it.each(['string', '', null])('rejects unknown field type %#', type => {
    expect(schema('CapabilityOutputFieldTypeSchema').safeParse(type).success).toBe(false);
  });
  it.each([
    field, { ...field, min: 0 }, { ...field, min: -10, max: -1 },
    { ...field, min: 0.1, max: 0.9 }, { ...field, min: 1, max: 1 },
    { key: field.key, label: field.label, type: 'number' },
    { key: field.key, label: field.label, type: 'number', min: 1 },
    { key: field.key, label: field.label, type: 'number', max: 10 },
  ])('retains the declared numeric scale %#', value => {
    expect(schema('CapabilityOutputFieldSchema').safeParse(value)).toMatchObject({ success: true, data: value });
  });
  it.each([
    ['reversed', { ...field, min: 11 }],
    ['infinite min', { ...field, min: -Infinity }],
    ['infinite max', { ...field, max: Infinity }],
    ['NaN', { ...field, min: NaN }],
    ['string bound', { ...field, max: '10' }],
    ['unknown type', { ...field, type: 'rating' }],
    ['extra field', { ...field, step: 1 }],
  ])('rejects %s scale', (_name, value) => {
    expect(schema('CapabilityOutputFieldSchema').safeParse(value).success).toBe(false);
  });
  it.each(['text', 'boolean', 'json'])('rejects numeric bounds on %s', type => {
    for (const bound of [{ min: 0 }, { max: 10 }]) {
      expect(schema('CapabilityOutputFieldSchema').safeParse({ key: field.key, label: field.label, type, ...bound }).success).toBe(false);
    }
  });
  it('carries the critic scale in the presentation declaration', () => {
    const value = { outputs: { label: 'Ricette', kinds: [{ key: 'recipe', label: 'Ricetta', description: 'Una ricetta' }], fields: [field] } };
    expect(schema('CapabilityPresentationDeclarationSchema').safeParse(value)).toMatchObject({ success: true, data: value });
  });
});
