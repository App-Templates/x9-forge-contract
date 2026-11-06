import { describe, expect, it } from 'vitest';
import * as barrel from '../../src/model-router/index.js';
import {
  MODEL_SUCCESSION_BANDS,
  MODEL_SUCCESSION_TABLE,
  NO_SUCCESSOR_CAUSES,
  ModelSuccessionRowSchema,
  ModelSuccessionTableSchema,
  NoSuccessorCauseSchema,
  resolveSuccessor,
  successionTableIssues,
  type ModelSuccessionRow,
} from '../../src/model-router/model-succession.js';

const row = (modelId: string, successor: string | null, overrides: Partial<ModelSuccessionRow> = {}): ModelSuccessionRow => ({
  provider: 'openai',
  modelId,
  function: 'reasoning',
  line: 'example-line',
  band: 'mini',
  successor,
  effectiveFrom: '2026-11-01',
  note: `https://example.com/${modelId}`,
  ...overrides,
});

const chain = (): ModelSuccessionRow[] => [row('example-a', 'example-b'), row('example-b', 'example-c'), row('example-c', null)];

describe('ModelSuccessionTableSchema', () => {
  it('accepts a valid chain and an empty table', () => {
    expect(ModelSuccessionTableSchema.safeParse(chain()).success).toBe(true);
    expect(ModelSuccessionTableSchema.safeParse([]).success).toBe(true);
  });

  it('lets the line change between a model and its successor', () => {
    const rows = [row('example-a', 'example-b', { line: 'old-line' }), row('example-b', null, { line: 'new-line' })];
    expect(successionTableIssues(rows)).toEqual([]);
  });

  it('rejects a duplicated (provider, modelId) pair', () => {
    const result = ModelSuccessionTableSchema.safeParse([row('example-a', null), row('example-a', null)]);
    expect(result.success).toBe(false);
    expect(successionTableIssues([row('example-a', null), row('example-a', null)])).toHaveLength(1);
  });

  it('accepts the same modelId under two providers', () => {
    expect(ModelSuccessionTableSchema.safeParse([row('example-a', null), row('example-a', null, { provider: 'other' })]).success).toBe(true);
  });

  it('rejects a successor that is not a row of the table', () => {
    expect(ModelSuccessionTableSchema.safeParse([row('example-a', 'example-b')]).success).toBe(false);
  });

  it('rejects a successor that belongs to another provider', () => {
    const rows = [row('example-a', 'example-b'), row('example-b', null, { provider: 'other' })];
    expect(ModelSuccessionTableSchema.safeParse(rows).success).toBe(false);
  });

  it('rejects a successor with another function', () => {
    const rows = [row('example-a', 'example-b'), row('example-b', null, { function: 'embedding' })];
    const issues = successionTableIssues(rows);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain('another function');
    expect(ModelSuccessionTableSchema.safeParse(rows).success).toBe(false);
  });

  it('rejects a cycle a -> b -> a', () => {
    const rows = [row('example-a', 'example-b'), row('example-b', 'example-a')];
    expect(successionTableIssues(rows).some(message => message.includes('Cycle'))).toBe(true);
    expect(ModelSuccessionTableSchema.safeParse(rows).success).toBe(false);
  });

  it('rejects a cycle that does not start at the first row', () => {
    const rows = [row('example-a', 'example-b'), row('example-b', 'example-c'), row('example-c', 'example-b')];
    expect(successionTableIssues(rows).some(message => message.includes('Cycle'))).toBe(true);
  });

  it('rejects a model that succeeds itself', () => {
    expect(ModelSuccessionRowSchema.safeParse(row('example-a', 'example-a')).success).toBe(false);
    expect(ModelSuccessionTableSchema.safeParse([row('example-a', 'example-a')]).success).toBe(false);
  });

  it('rejects an effectiveFrom that is not a date', () => {
    expect(ModelSuccessionRowSchema.safeParse(row('example-a', null, { effectiveFrom: 'next week' })).success).toBe(false);
    expect(ModelSuccessionRowSchema.safeParse(row('example-a', null, { effectiveFrom: '2026-13-40' })).success).toBe(false);
  });

  it('rejects an unknown band, a note that is not a URL and extra keys', () => {
    expect(ModelSuccessionRowSchema.safeParse({ ...row('example-a', null), band: 'huge' }).success).toBe(false);
    expect(ModelSuccessionRowSchema.safeParse(row('example-a', null, { note: 'see the blog' })).success).toBe(false);
    expect(ModelSuccessionRowSchema.safeParse({ ...row('example-a', null), extra: 1 }).success).toBe(false);
  });

  it('exposes the bands', () => {
    expect(MODEL_SUCCESSION_BANDS).toEqual(['nano', 'mini', 'standard', 'pro']);
  });
});

describe('MODEL_SUCCESSION_TABLE', () => {
  it('is empty and frozen until Stefano approves rows', () => {
    expect(MODEL_SUCCESSION_TABLE).toEqual([]);
    expect(Object.isFrozen(MODEL_SUCCESSION_TABLE)).toBe(true);
  });

  it('gives no successor for any retirement', () => {
    expect(resolveSuccessor(MODEL_SUCCESSION_TABLE, { provider: 'openai', modelId: 'example-a' }, () => true)).toEqual({ outcome: 'no-successor', reason: 'not-in-table' });
  });
});

describe('resolveSuccessor', () => {
  const retired = { provider: 'openai', modelId: 'example-a' };

  it('returns the direct successor when usable', () => {
    const result = resolveSuccessor(chain(), retired, () => true);
    expect(result).toMatchObject({ outcome: 'successor', hops: 1 });
    expect(result.outcome === 'successor' && result.row.modelId).toBe('example-b');
  });

  it('skips a successor that is not usable and takes the next one', () => {
    const result = resolveSuccessor(chain(), retired, candidate => candidate.modelId !== 'example-b');
    expect(result).toMatchObject({ outcome: 'successor', hops: 2 });
    expect(result.outcome === 'successor' && result.row.modelId).toBe('example-c');
  });

  it('reports none-usable when every row of the chain is discarded', () => {
    expect(resolveSuccessor(chain(), retired, () => false)).toEqual({ outcome: 'no-successor', reason: 'none-usable' });
  });

  it('reports end-of-line for the last model of the chain', () => {
    expect(resolveSuccessor(chain(), { provider: 'openai', modelId: 'example-c' }, () => true)).toEqual({ outcome: 'no-successor', reason: 'end-of-line' });
  });

  it('reports not-in-table for an unknown model or provider', () => {
    expect(resolveSuccessor(chain(), { provider: 'openai', modelId: 'example-z' }, () => true)).toEqual({ outcome: 'no-successor', reason: 'not-in-table' });
    expect(resolveSuccessor(chain(), { provider: 'other', modelId: 'example-a' }, () => true)).toEqual({ outcome: 'no-successor', reason: 'not-in-table' });
  });

  it('never calls usable on the retired model itself', () => {
    const asked: string[] = [];
    resolveSuccessor(chain(), retired, candidate => { asked.push(candidate.modelId); return false; });
    expect(asked).toEqual(['example-b', 'example-c']);
  });

  it('stops on a cyclic table instead of looping', () => {
    const cyclic = [row('example-a', 'example-b'), row('example-b', 'example-a')];
    expect(resolveSuccessor(cyclic, retired, () => false)).toEqual({ outcome: 'no-successor', reason: 'none-usable' });
  });

  it('stops when the successor row is missing', () => {
    expect(resolveSuccessor([row('example-a', 'example-b')], retired, () => true)).toEqual({ outcome: 'no-successor', reason: 'end-of-line' });
  });

  it('validates the causes', () => {
    expect(NO_SUCCESSOR_CAUSES).toEqual(['not-in-table', 'end-of-line', 'none-usable']);
    expect(NoSuccessorCauseSchema.safeParse('end-of-line').success).toBe(true);
    expect(NoSuccessorCauseSchema.safeParse('other').success).toBe(false);
  });
});

describe('barrel', () => {
  it('exports the succession contract', () => {
    expect(barrel.resolveSuccessor).toBe(resolveSuccessor);
    expect(barrel.MODEL_SUCCESSION_TABLE).toBe(MODEL_SUCCESSION_TABLE);
    expect(barrel.ModelSuccessionTableSchema).toBe(ModelSuccessionTableSchema);
    expect(barrel.successionTableIssues).toBe(successionTableIssues);
    expect(barrel.NoSuccessorCauseSchema).toBe(NoSuccessorCauseSchema);
  });
});
