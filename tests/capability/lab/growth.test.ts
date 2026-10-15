import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  LabScopeSchema, LabGrowthPointSchema,
  LabGrowthHistoryInputSchema, LabGrowthHistoryOutputSchema,
} from '../../../src/capability/lab/growth.js';

const scope = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'samira' };
const point = {
  at: '2026-10-14T01:00:00Z', method: 'coverage', methodVersion: '1',
  numerator: 2, denominator: 4, score: 0.5,
};
const output = { snapshotVersion: 0, scope, points: [point], nextCursor: null, state: 'ok' };

describe('lab growth history', () => {
  it('requires a nonnegative integer snapshot version', () => {
    for (const snapshotVersion of [0, 3]) {
      expect(LabGrowthHistoryOutputSchema.parse({ ...output, snapshotVersion }).snapshotVersion).toBe(snapshotVersion);
    }
    for (const snapshotVersion of [-1, 0.5, '3', undefined]) {
      expect(LabGrowthHistoryOutputSchema.safeParse({ ...output, snapshotVersion }).success).toBe(false);
    }
  });

  it('preserves complete scope and keeps notebooks distinct', () => {
    expect(LabScopeSchema.parse(scope)).toEqual(scope);
    for (const changed of [{ ...scope, tenantId: 'tenant-2' }, { ...scope, ownerId: 'owner-2' }]) {
      expect(LabScopeSchema.parse(changed)).not.toEqual(LabScopeSchema.parse(scope));
    }
  });

  it.each(['tenantId', 'ownerId', 'agentId'] as const)('requires nonblank %s', key => {
    const missing = { ...scope } as Partial<typeof scope>;
    delete missing[key];
    for (const invalid of [missing, { ...scope, [key]: '' }, { ...scope, [key]: ' ' }]) {
      expect(LabScopeSchema.safeParse(invalid).success).toBe(false);
    }
  });

  it('defaults and bounds pagination', () => {
    expect(LabGrowthHistoryInputSchema.parse({ scope }).limit).toBe(100);
    expect(LabGrowthHistoryInputSchema.parse({ scope, limit: 500, cursor: 'page-2' }).cursor).toBe('page-2');
    for (const limit of [0, -1, 1.5, 501]) {
      expect(LabGrowthHistoryInputSchema.safeParse({ scope, limit }).success).toBe(false);
    }
    expect(LabGrowthHistoryInputSchema.safeParse({ scope, cursor: '' }).success).toBe(false);
  });

  it('preserves the point and allows unavailable scores and zero counts', () => {
    expect(LabGrowthPointSchema.parse(point)).toEqual(point);
    expect(LabGrowthPointSchema.parse({ ...point, numerator: 0, denominator: 0, score: null }).score).toBeNull();
    expect(LabGrowthPointSchema.safeParse({ ...point, at: '2026-10-14T03:00:00+02:00' }).success).toBe(true);
  });

  it.each([
    ['at', 'yesterday'], ['at', '2026-10-14'], ['method', ' '], ['methodVersion', ''],
    ['numerator', -1], ['numerator', 0.5], ['denominator', -1], ['denominator', 0.5],
    ['score', -1], ['score', Infinity], ['score', '0.5'],
  ])('rejects invalid point %s = %s', (key, value) => {
    expect(LabGrowthPointSchema.safeParse({ ...point, [key]: value }).success).toBe(false);
  });

  it.each(Object.keys(point))('requires point field %s', key => {
    const missing: Record<string, unknown> = { ...point };
    delete missing[key];
    expect(LabGrowthPointSchema.safeParse(missing).success).toBe(false);
  });

  it('preserves states, bounds points and requires the output envelope', () => {
    expect(LabGrowthHistoryOutputSchema.parse(output)).toEqual(output);
    for (const state of ['empty', 'unavailable', 'ok']) {
      expect(LabGrowthHistoryOutputSchema.parse({ ...output, points: [], state }).state).toBe(state);
    }
    expect(LabGrowthHistoryOutputSchema.safeParse({ ...output, points: Array(500).fill(point), nextCursor: 'page-2' }).success).toBe(true);
    for (const invalid of [
      { ...output, points: Array(501).fill(point) }, { ...output, state: 'unknown' },
      { ...output, nextCursor: '' }, { ...output, points: [{ ...point, extra: true }] },
      { ...output, scope: { ...scope, extra: true } },
    ]) expect(LabGrowthHistoryOutputSchema.safeParse(invalid).success).toBe(false);
    for (const key of Object.keys(output)) {
      const missing: Record<string, unknown> = { ...output };
      delete missing[key];
      expect(LabGrowthHistoryOutputSchema.safeParse(missing).success).toBe(false);
    }
    expect(LabGrowthHistoryInputSchema.safeParse({}).success).toBe(false);
  });

  it('mutation witnesses reject extra keys at every object boundary', () => {
    for (const [schema, valid] of [
      [LabScopeSchema, scope], [LabGrowthPointSchema, point],
      [LabGrowthHistoryInputSchema, { scope }], [LabGrowthHistoryOutputSchema, output],
    ] as const) {
      const invalid = { ...valid, extra: true };
      expect(schema.safeParse(invalid).success).toBe(false);
      expect(schema.strip().safeParse(invalid).success).toBe(true);
    }
  });

  it('mutation witnesses detect removed identity and numeric guards', () => {
    const { tenantId: _tenantId, ...missingTenant } = scope;
    expect(LabScopeSchema.safeParse(missingTenant).success).toBe(false);
    expect(LabScopeSchema.omit({ tenantId: true }).safeParse(missingTenant).success).toBe(true);
    const tooMany = { scope, limit: 501 };
    expect(LabGrowthHistoryInputSchema.safeParse(tooMany).success).toBe(false);
    expect(LabGrowthHistoryInputSchema.extend({ limit: z.number().int().min(1) }).safeParse(tooMany).success).toBe(true);
    const negative = { ...point, denominator: -1 };
    expect(LabGrowthPointSchema.safeParse(negative).success).toBe(false);
    expect(LabGrowthPointSchema.extend({ denominator: z.number().int() }).safeParse(negative).success).toBe(true);
  });
});
