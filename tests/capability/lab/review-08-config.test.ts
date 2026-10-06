import { describe, expect, it } from 'vitest';
import { labAgent, schema } from './review-fixtures.js';
describe('lab mandatory models and budget', () => {
  it.each([0.01, 10])('exports shared positive USD schema %s', value => {
    expect(schema('CapabilityUsdSchema', 'ricerca').safeParse(value)).toMatchObject({ success: true, data: value });
  });
  it.each([0, -1, Infinity, NaN, '1'])('rejects invalid shared USD %#', value => {
    expect(schema('CapabilityUsdSchema', 'ricerca').safeParse(value).success).toBe(false);
  });
  it.each(['a', 'm'.repeat(100)])('exports shared model ID %#', value => {
    expect(schema('CapabilityModelIdSchema', 'ricerca').safeParse(value)).toMatchObject({ success: true, data: value });
  });
  it.each(['', 'm'.repeat(101), null])('rejects invalid shared model ID %#', value => {
    expect(schema('CapabilityModelIdSchema', 'ricerca').safeParse(value).success).toBe(false);
  });
  it.each([
    labAgent.budget, { ...labAgent.budget, perIngestMaxUsd: 10 },
    { ...labAgent.budget, dailyUsd: 0.01, perIngestMaxUsd: 0.01 },
  ])('accepts budget and per-ingest ceiling %#', value => {
    expect(schema('LabBudgetSchema').safeParse(value)).toMatchObject({ success: true, data: value });
  });
  it.each([
    ['missing daily', { ...labAgent.budget, dailyUsd: undefined }],
    ['zero daily', { ...labAgent.budget, dailyUsd: 0 }],
    ['negative daily', { ...labAgent.budget, dailyUsd: -1 }],
    ['infinite daily', { ...labAgent.budget, dailyUsd: Infinity }],
    ['missing ingest ceiling', { ...labAgent.budget, perIngestMaxUsd: undefined }],
    ['zero ingest', { ...labAgent.budget, perIngestMaxUsd: 0 }],
    ['negative ingest', { ...labAgent.budget, perIngestMaxUsd: -1 }],
    ['infinite ingest', { ...labAgent.budget, perIngestMaxUsd: Infinity }],
    ['above day', { ...labAgent.budget, perIngestMaxUsd: 11 }],
    ['missing timezone', { ...labAgent.budget, timezone: undefined }],
    ['unknown timezone', { ...labAgent.budget, timezone: 'Mars/Olympus' }],
    ['extra budget', { ...labAgent.budget, reserve: 1 }],
  ])('rejects %s budget', (_name, value) => {
    expect(schema('LabBudgetSchema').safeParse(value).success).toBe(false);
  });
  it.each([{ digest: 'm' }, { digest: 'm'.repeat(100), read: 'r'.repeat(100) }])('retains models without selecting a default %#', value => {
    expect(schema('LabModelsSchema').safeParse(value)).toMatchObject({ success: true, data: value });
  });
  it.each([
    ['missing digest', {}], ['empty digest', { digest: '' }], ['long digest', { digest: 'm'.repeat(101) }],
    ['empty read', { digest: 'm', read: '' }], ['long read', { digest: 'm', read: 'r'.repeat(101) }],
    ['extra model', { digest: 'm', research: 'r' }],
  ])('rejects %s models', (_name, value) => {
    expect(schema('LabModelsSchema').safeParse(value).success).toBe(false);
  });
  it('retains full lab configuration exactly', () => {
    expect(schema('LabAgentConfigSchema').safeParse(labAgent)).toMatchObject({ success: true, data: labAgent });
  });
  it.each(['models', 'budget'])('requires %s before spending', key => {
    expect(schema('LabAgentConfigSchema').safeParse({ ...labAgent, [key]: undefined }).success).toBe(false);
  });
  it('rejects the former model-less and budget-less lab payload', () => {
    const { models: _models, budget: _budget, ...legacy } = labAgent;
    expect(schema('LabAgentConfigSchema').safeParse(legacy).success).toBe(false);
  });
  it('uses the same shared validators inside ricerca', () => {
    expect(schema('ResearchModelsSchema', 'ricerca').safeParse({ research: 'm'.repeat(100) })).toMatchObject({ success: true });
    expect(schema('ResearchBudgetSchema', 'ricerca').safeParse({ dailyUsd: 10, perResearchMaxUsd: 2, timezone: 'Europe/Rome' })).toMatchObject({ success: true });
  });
});
