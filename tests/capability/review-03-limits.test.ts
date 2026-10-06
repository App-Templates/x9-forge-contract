import { describe, expect, it } from 'vitest';
import { feedback, metric, output, parameter, schema } from './review-fixtures.js';
const field = { key: 'score', label: 'Voto', type: 'number' };
const declaration = { parameters: [], consumes: true, spendLedger: true };
const rating = { ...feedback, kind: 'rating', rating: 8 };
const items = (n: number) => Array.from({ length: n }, (_, i) => ({ ...parameter, key: 'p' + i }));
const points = (n: number) => Array.from({ length: n }, (_, i) => ({
  day: new Date(Date.UTC(2025, 0, 1 + i)).toISOString().slice(0, 10), value: i,
}));
const series = { agentId: 'samira', capability: 'lab', metric, points: [] };
const bounded: [string, string, unknown, unknown][] = [
  ...['label', 'group', 'unit'].map(key => [key, 'CapabilityParameterSchema', { ...parameter, [key]: 'a'.repeat(200) }, { ...parameter, [key]: 'a'.repeat(201) }] as [string, string, unknown, unknown]),
  ...['description', 'explanation', 'reference'].map(key => [key, 'CapabilityParameterSchema', { ...parameter, [key]: 'a'.repeat(2000) }, { ...parameter, [key]: 'a'.repeat(2001) }] as [string, string, unknown, unknown]),
  ['parameter key', 'CapabilityParameterSchema', { ...parameter, key: 'a'.repeat(100) }, { ...parameter, key: 'a'.repeat(101) }],
  ['string default', 'CapabilityParameterSchema', { ...parameter, type: 'string', platformDefault: 'a'.repeat(8000) }, { ...parameter, type: 'string', platformDefault: 'a'.repeat(8001) }],
  ['option value', 'CapabilityParameterOptionSchema', { value: 'a'.repeat(2000), label: 'A' }, { value: 'a'.repeat(2001), label: 'A' }],
  ['option label', 'CapabilityParameterOptionSchema', { value: 'a', label: 'a'.repeat(200) }, { value: 'a', label: 'a'.repeat(201) }],
  ['number of options', 'CapabilityParameterSchema', { ...parameter, type: 'enum', options: items(50).map(p => ({ value: p.key, label: p.label })) }, { ...parameter, type: 'enum', options: items(51).map(p => ({ value: p.key, label: p.label })) }],
  ['declared parameters', 'CapabilityParametersDeclarationSchema', { ...declaration, parameters: items(100) }, { ...declaration, parameters: items(101) }],
  ['resolved parameters', 'CapabilityAgentParametersSchema', { agentId: 'samira', capability: 'lab', version: 1, parameters: items(100).map(parameter => ({ parameter, origin: 'needs_choice' })) }, { agentId: 'samira', capability: 'lab', version: 1, parameters: items(101).map(parameter => ({ parameter, origin: 'needs_choice' })) }],
  ['output id', 'CapabilityOutputSchema', { ...output, id: 'a'.repeat(100) }, { ...output, id: 'a'.repeat(101) }],
  ['output kind', 'CapabilityOutputSchema', { ...output, kind: 'a'.repeat(100) }, { ...output, kind: 'a'.repeat(101) }],
  ['capability id', 'CapabilityOutputSchema', { ...output, capability: 'a'.repeat(100) }, { ...output, capability: 'a'.repeat(101) }],
  ['output title', 'CapabilityOutputSchema', { ...output, title: 'a'.repeat(200) }, { ...output, title: 'a'.repeat(201) }],
  ['output summary', 'CapabilityOutputSchema', { ...output, summary: 'a'.repeat(2000) }, { ...output, summary: 'a'.repeat(2001) }],
  ['reviewer id', 'CapabilityFeedbackSchema', { ...rating, reviewerId: 'a'.repeat(100) }, { ...rating, reviewerId: 'a'.repeat(101) }],
  ['feedback id', 'CapabilityFeedbackSchema', { ...rating, id: 'a'.repeat(100) }, { ...rating, id: 'a'.repeat(101) }],
  ['feedback output id', 'CapabilityFeedbackSchema', { ...rating, outputId: 'a'.repeat(100) }, { ...rating, outputId: 'a'.repeat(101) }],
  ['source id', 'CapabilityFeedbackSourceSchema', { kind: 'project_view', id: 'a'.repeat(100) }, { kind: 'project_view', id: 'a'.repeat(101) }],
  ['comment', 'CapabilityFeedbackSchema', { ...rating, comment: 'a'.repeat(2000) }, { ...rating, comment: 'a'.repeat(2001) }],
  ['output description', 'CapabilityOutputKindSchema', { key: 'report', label: 'Rapporto', description: 'a'.repeat(2000) }, { key: 'report', label: 'Rapporto', description: 'a'.repeat(2001) }],
  ['field label', 'CapabilityOutputFieldSchema', { ...field, label: 'a'.repeat(200) }, { ...field, label: 'a'.repeat(201) }],
  ['metric unit', 'CapabilityTrendMetricSchema', { ...metric, unit: 'a'.repeat(200) }, { ...metric, unit: 'a'.repeat(201) }],
  ['output kinds', 'CapabilityOutputsDeclarationSchema', { label: 'Rapporti', kinds: items(50).map(p => ({ key: p.key, label: p.label, description: p.description })), fields: [] }, { label: 'Rapporti', kinds: items(51).map(p => ({ key: p.key, label: p.label, description: p.description })), fields: [] }],
  ['output fields', 'CapabilityOutputsDeclarationSchema', { label: 'Rapporti', kinds: [{ key: 'report', label: 'Rapporto', description: 'Risultato' }], fields: items(100).map(p => ({ ...field, key: p.key })) }, { label: 'Rapporti', kinds: [{ key: 'report', label: 'Rapporto', description: 'Risultato' }], fields: items(101).map(p => ({ ...field, key: p.key })) }],
  ['declared metrics', 'CapabilityPresentationDeclarationSchema', { trends: items(100).map(p => ({ ...metric, key: p.key })) }, { trends: items(101).map(p => ({ ...metric, key: p.key })) }],
  ['points', 'CapabilityTrendSeriesSchema', { ...series, points: points(400) }, { ...series, points: points(401) }],
  ['output page', 'CapabilityOutputsSchema', { agentId: 'samira', capability: 'food', outputs: items(100).map(p => ({ ...output, id: p.key })) }, { agentId: 'samira', capability: 'food', outputs: items(101).map(p => ({ ...output, id: p.key })) }],
  ['feedback page', 'CapabilityFeedbackListSchema', { agentId: 'samira', capability: 'food', feedback: items(100).map(p => ({ ...rating, id: p.key })) }, { agentId: 'samira', capability: 'food', feedback: items(101).map(p => ({ ...rating, id: p.key })) }],
  ['trend page', 'CapabilityTrendsSchema', { agentId: 'samira', capability: 'lab', series: items(100).map(p => ({ ...series, metric: { ...metric, key: p.key } })) }, { agentId: 'samira', capability: 'lab', series: items(101).map(p => ({ ...series, metric: { ...metric, key: p.key } })) }],
];
describe('review R3 bounded declarations and pages', () => {
  it.each(bounded)('accepts the limit and rejects one above: %s', (_name, target, valid, invalid) => {
    expect(schema(target).safeParse(valid).success).toBe(true);
    expect(schema(target).safeParse(invalid).success).toBe(false);
  });
  it.each(['a', 'é'])('bounds content to 64 KiB of serialized UTF-8 JSON (%s)', character => {
    const emptyBytes = new TextEncoder().encode(JSON.stringify({ v: '' })).length;
    const room = Math.floor((65536 - emptyBytes) / new TextEncoder().encode(character).length);
    expect(schema('CapabilityOutputSchema').safeParse({ ...output, content: { v: character.repeat(room) } }).success).toBe(true);
    expect(schema('CapabilityOutputSchema').safeParse({ ...output, content: { v: character.repeat(room + 1) } }).success).toBe(false);
  });
});
