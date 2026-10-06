import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import * as capability from '../../src/capability/index.js';
const exports = capability as unknown as Record<string, z.ZodType>;
function schema(name: string): z.ZodType {
  expect(exports[name], name).toBeDefined();
  return exports[name]!;
}
export const output = {
  id: 'recipe-1', agentId: 'samira', capability: 'food', kind: 'recipe',
  title: 'Zuppa del giorno', summary: 'Una ricetta studiata', createdAt: '2026-10-06T08:00:00Z',
  content: { ingredients: ['carote'], portions: 2, tested: true, detail: { technique: 'cottura' }, note: null },
};
export const feedback = {
  id: 'feedback-1', agentId: 'samira', capability: 'food', outputId: 'recipe-1',
  source: { kind: 'project_view', id: 'food-view' }, reviewerId: 'synthetic-reviewer',
  kind: 'rating', rating: 8, comment: 'Equilibrata', createdAt: '2026-10-06T09:00:00Z',
};
export const metric = { key: 'sessions', label: 'Sedute al giorno', unit: 'sedute' };
export const series = { agentId: 'samira', capability: 'meditation', metric,
  points: [{ day: '2026-10-05', value: 1 }, { day: '2026-10-06', value: 3 }] };
export const presentation = {
  outputs: { label: 'Ricette', kinds: [{ key: 'recipe', label: 'Ricetta', description: 'Il risultato del giorno' }],
    fields: [{ key: 'portions', label: 'Porzioni', type: 'number' }] },
  feedback: { label: 'Assaggi', kind: 'rating', sources: ['project_view', 'domain_app'] },
  trends: [metric],
};
describe('B7 generic per-agent outputs, feedback and trends', () => {
  it('retains domain content as data, including nested JSON', () => {
    expect(schema('CapabilityOutputSchema').parse(output)).toEqual(output);
  });
  it.each([
    ['empty id', { ...output, id: '' }],
    ['invalid agent id', { ...output, agentId: 'Samira' }],
    ['missing capability', { ...output, capability: undefined }],
    ['empty kind', { ...output, kind: '' }],
    ['empty title', { ...output, title: ' ' }],
    ['missing summary', { ...output, summary: undefined }],
    ['invalid timestamp', { ...output, createdAt: 'yesterday' }],
    ['impossible timestamp', { ...output, createdAt: '2026-02-30T08:00:00Z' }],
    ['extra output field', { ...output, projectId: 'food' }],
    ['non JSON content', { ...output, content: { run: () => true } }],
    ['nonfinite content', { ...output, content: { score: Infinity } }],
  ])('rejects %s', (_name, value) => {
    expect(schema('CapabilityOutputSchema').safeParse(value).success).toBe(false);
  });
  it.each([1, 10])('accepts rating boundary %s and project provenance', rating => {
    expect(schema('CapabilityFeedbackSchema').parse({ ...feedback, rating })).toEqual({ ...feedback, rating });
  });
  it('retains domain-app provenance separately from the reviewer', () => {
    const value = { ...feedback, source: { kind: 'domain_app', id: 'meditation-app' } };
    expect(schema('CapabilityFeedbackSchema').parse(value)).toEqual(value);
  });
  it.each([
    ['rating below one', { ...feedback, rating: 0 }],
    ['rating above ten', { ...feedback, rating: 11 }],
    ['fractional rating', { ...feedback, rating: 7.5 }],
    ['missing source', { ...feedback, source: undefined }],
    ['unknown source', { ...feedback, source: { kind: 'telegram', id: 'view' } }],
    ['empty source id', { ...feedback, source: { kind: 'project_view', id: '' } }],
    ['extra source field', { ...feedback, source: { ...feedback.source, extra: true } }],
    ['missing reviewer', { ...feedback, reviewerId: undefined }],
    ['empty feedback id', { ...feedback, id: '' }],
    ['missing output id', { ...feedback, outputId: undefined }],
    ['bad feedback agent', { ...feedback, agentId: '../other' }],
    ['empty feedback capability', { ...feedback, capability: '' }],
    ['bad feedback timestamp', { ...feedback, createdAt: 'later' }],
    ['extra feedback field', { ...feedback, projectId: 'food' }],
  ])('rejects %s', (_name, value) => {
    expect(schema('CapabilityFeedbackSchema').safeParse(value).success).toBe(false);
  });
  it('accepts a generic daily series, including legitimate decreases', () => {
    const value = { ...series, points: [{ day: '2026-10-06', value: -2 }] };
    expect(schema('CapabilityTrendSeriesSchema').parse(value)).toEqual(value);
  });
  it.each([
    ['bad series agent', { ...series, agentId: '' }],
    ['empty series capability', { ...series, capability: '' }],
    ['empty metric key', { ...series, metric: { ...metric, key: '' } }],
    ['empty metric label', { ...series, metric: { ...metric, label: '' } }],
    ['empty metric unit', { ...series, metric: { ...metric, unit: '' } }],
    ['extra metric field', { ...series, metric: { ...metric, extra: true } }],
    ['impossible trend date', { ...series, points: [{ day: '2026-02-30', value: 1 }] }],
    ['nonfinite trend value', { ...series, points: [{ day: '2026-10-06', value: Infinity }] }],
    ['extra point field', { ...series, points: [{ day: '2026-10-06', value: 1, extra: true }] }],
    ['repeated trend day', { ...series, points: [series.points[0], series.points[0]] }],
    ['unsorted trend days', { ...series, points: [...series.points].reverse() }],
    ['extra series field', { ...series, projectId: 'food' }],
  ])('rejects %s', (_name, value) => {
    expect(schema('CapabilityTrendSeriesSchema').safeParse(value).success).toBe(false);
  });
  it('declares the sections dynamically, without a food-specific field', () => {
    expect(schema('CapabilityPresentationDeclarationSchema').parse(presentation)).toEqual(presentation);
    expect(schema('CapabilityPresentationDeclarationSchema').parse({ trends: [metric] })).toEqual({ trends: [metric] });
  });
  it.each([
    ['empty output label', { ...presentation, outputs: { ...presentation.outputs, label: '' } }],
    ['empty output kinds', { ...presentation, outputs: { ...presentation.outputs, kinds: [] } }],
    ['repeated output kind', { ...presentation, outputs: { ...presentation.outputs, kinds: [presentation.outputs.kinds[0], presentation.outputs.kinds[0]] } }],
    ['empty kind label', { ...presentation, outputs: { ...presentation.outputs, kinds: [{ key: 'recipe', label: '', description: 'test' }] } }],
    ['empty kind description', { ...presentation, outputs: { ...presentation.outputs, kinds: [{ key: 'recipe', label: 'Ricetta', description: '' }] } }],
    ['extra kind field', { ...presentation, outputs: { ...presentation.outputs, kinds: [{ ...presentation.outputs.kinds[0], extra: true }] } }],
    ['unknown field type', { ...presentation, outputs: { ...presentation.outputs, fields: [{ key: 'portions', label: 'Porzioni', type: 'script' }] } }],
    ['empty field label', { ...presentation, outputs: { ...presentation.outputs, fields: [{ key: 'portions', label: '', type: 'number' }] } }],
    ['repeated output field', { ...presentation, outputs: { ...presentation.outputs, fields: [presentation.outputs.fields[0], presentation.outputs.fields[0]] } }],
    ['extra output field declaration', { ...presentation, outputs: { ...presentation.outputs, fields: [{ ...presentation.outputs.fields[0], extra: true }] } }],
    ['extra output declaration field', { ...presentation, outputs: { ...presentation.outputs, extra: true } }],
    ['empty feedback label', { ...presentation, feedback: { ...presentation.feedback, label: '' } }],
    ['unknown feedback kind', { ...presentation, feedback: { ...presentation.feedback, kind: 'other' } }],
    ['empty feedback sources', { ...presentation, feedback: { ...presentation.feedback, sources: [] } }],
    ['repeated feedback sources', { ...presentation, feedback: { ...presentation.feedback, sources: ['domain_app', 'domain_app'] } }],
    ['unknown feedback source declaration', { ...presentation, feedback: { ...presentation.feedback, sources: ['other'] } }],
    ['extra feedback declaration field', { ...presentation, feedback: { ...presentation.feedback, extra: true } }],
    ['repeated trend metric', { ...presentation, trends: [metric, metric] }],
    ['extra presentation field', { ...presentation, projectId: 'food' }],
  ])('rejects %s', (_name, value) => {
    expect(schema('CapabilityPresentationDeclarationSchema').safeParse(value).success).toBe(false);
  });
  for (const [name, field, item] of [
    ['CapabilityOutputsSchema', 'outputs', output],
    ['CapabilityFeedbackListSchema', 'feedback', feedback],
    ['CapabilityTrendsSchema', 'series', { ...series, capability: 'food' }],
  ] as const) {
    it(name + ' scopes a collection to one agent and capability', () => {
      const value = { agentId: 'samira', capability: 'food', [field]: [item] };
      expect(schema(name).parse(value)).toEqual(value);
    });
    it.each([
      ['foreign agent', { ...item, agentId: 'other' }],
      ['foreign capability', { ...item, capability: 'other' }],
    ])(name + ' rejects %s', (_label, item) => {
      expect(schema(name).safeParse({ agentId: 'samira', capability: 'food', [field]: [item] }).success).toBe(false);
    });
    it(name + ' rejects duplicate ids or metric keys', () => {
      expect(schema(name).safeParse({ agentId: 'samira', capability: 'food', [field]: [item, item] }).success).toBe(false);
    });
    it(name + ' rejects unknown envelope fields', () => {
      expect(schema(name).safeParse({ agentId: 'samira', capability: 'food', [field]: [], projectId: 'food' }).success).toBe(false);
    });
  }
});
