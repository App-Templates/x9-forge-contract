import { describe, expect, it } from 'vitest';
import { capToolCallPath } from '../../../src/http/index.js';
import { ingestId, modules, schema } from './review-fixtures.js';
const counts = { sourcesStored: 0, pagesTouched: 0, claimsAdded: 0 };
describe('lab asynchronous ingest and tool errors', () => {
  it.each(['invalid_request', 'not_configured', 'not_found', 'not_ready'])('exports error %s', error => {
    expect(schema('LabToolErrorSchema').safeParse(error)).toMatchObject({ success: true, data: error });
  });
  it.each(['unknown', '', null])('rejects undeclared error %#', error => {
    expect(schema('LabToolErrorSchema').safeParse(error).success).toBe(false);
  });
  it('queues ingest with a UUID and no completed counts', () => {
    const value = { ingestId, state: 'queued' };
    expect(schema('LabIngestOutputSchema').safeParse(value)).toMatchObject({ success: true, data: value });
  });
  it.each([
    ['former synchronous output', counts], ['missing id', { state: 'queued' }],
    ['invalid uuid', { ingestId: 'r-1', state: 'queued' }], ['missing state', { ingestId }],
    ['running acknowledgment', { ingestId, state: 'running' }],
    ['premature counts', { ingestId, state: 'queued', ...counts }],
    ['extra field', { ingestId, state: 'queued', ok: true }],
  ])('rejects %s ingest acknowledgment', (_name, value) => {
    expect(schema('LabIngestOutputSchema').safeParse(value).success).toBe(false);
  });
  it('exports and routes the new status tool', () => {
    const tools = modules.lab.LAB_TOOLS as unknown as Record<string, string>;
    expect(tools.ingestStatus).toBe('lab_ingest_status');
    expect(capToolCallPath(tools.ingestStatus!)).toBe('/call/lab_ingest_status');
  });
  it('reads status for exactly one ingest UUID', () => {
    expect(schema('LabIngestStatusInputSchema').safeParse({ ingestId })).toMatchObject({ success: true, data: { ingestId } });
  });
  it.each([{}, { ingestId: 'x' }, { ingestId, agentId: 'samira' }])('rejects invalid status input %#', value => {
    expect(schema('LabIngestStatusInputSchema').safeParse(value).success).toBe(false);
  });
  it.each(['queued', 'running', 'failed', 'budget_exhausted', 'completed'])('retains research state %s for ingest', state => {
    const value = { ingestId, state, ...(state === 'completed' ? counts : {}) };
    expect(schema('LabIngestStatusOutputSchema').safeParse(value)).toMatchObject({ success: true, data: value });
  });
  it.each(['sourcesStored', 'pagesTouched', 'claimsAdded'])('requires completed %s', key => {
    const value = { ingestId, state: 'completed', ...counts, [key]: undefined };
    expect(schema('LabIngestStatusOutputSchema').safeParse(value).success).toBe(false);
  });
  it.each(['sourcesStored', 'pagesTouched', 'claimsAdded'])('requires nonnegative integer %s', key => {
    for (const invalid of [-1, 0.5]) {
      expect(schema('LabIngestStatusOutputSchema').safeParse({ ingestId, state: 'completed', ...counts, [key]: invalid }).success).toBe(false);
    }
  });
  it.each([
    { ingestId, state: 'unknown' }, { ingestId: 'bad', state: 'queued' },
    { ingestId, state: 'completed', ...counts, extra: true },
    { ingestId, state: 'running', sourcesStored: 1 },
  ])('rejects invalid status output %#', value => {
    expect(schema('LabIngestStatusOutputSchema').safeParse(value).success).toBe(false);
  });
});
