import { describe, it, expect } from 'vitest';
import {
  ProjectConfigStaleSchema,
  ProjectGrowthResponseSchema,
  ProjectSpendQuerySchema,
  labProjectConfigPutContract,
  projectConfigPath,
  projectGrowthPath,
  projectSpendPath,
  ricercaProjectConfigPutContract,
  ricercaProjectSpendContract,
} from '../../src/http/index';

describe('project routes (v1.28.0)', () => {
  it('paths are built from a validated project id, never by hand', () => {
    expect(projectConfigPath('food-samira')).toBe('/internal/projects/food-samira/config');
    expect(projectSpendPath('food-samira')).toBe('/internal/projects/food-samira/spend');
    expect(projectGrowthPath('food-samira')).toBe('/internal/projects/food-samira/growth');
    for (const bad of ['../etc', 'Food', 'a/b', '']) expect(() => projectConfigPath(bad), bad).toThrow();
  });

  it('each capability receives its own part on the same path, with the platform secret', () => {
    expect(ricercaProjectConfigPutContract.path).toBe(labProjectConfigPutContract.path);
    expect(ricercaProjectConfigPutContract.authType).toBe('secret');
    expect(labProjectConfigPutContract.authType).toBe('secret');
    expect(ricercaProjectSpendContract.authType).toBe('secret');
    expect(ricercaProjectConfigPutContract.bodySchema.safeParse({ projectId: 'food-samira', version: 1, domain: 'cucina' }).success).toBe(false);
  });

  it('a stale version is a declared refusal', () => {
    expect(ProjectConfigStaleSchema.safeParse({ ok: false, error: 'stale_version', currentVersion: 3 }).success).toBe(true);
  });

  it('the spend window is two project days in order', () => {
    expect(ProjectSpendQuerySchema.safeParse({ from: '2026-10-01', to: '2026-10-05' }).success).toBe(true);
    expect(ProjectSpendQuerySchema.safeParse({ from: '2026-10-05', to: '2026-10-01' }).success).toBe(false);
    expect(ProjectSpendQuerySchema.safeParse({ from: '1/10', to: '2026-10-05' }).success).toBe(false);
  });

  it('growth carries the graph, the gaps and the wiki counts', () => {
    const growth = {
      projectId: 'food-samira',
      nodes: [{ nodeId: 'tec_hollandaise', label: 'Hollandaise', requires: [], level: 1, score: 0.3 }],
      gaps: [{ projectId: 'food-samira', question: 'Perché impazzisce?', reason: 'non_so' }],
      wiki: { pages: 12, claims: 80, claimsMultiSource: 31, contradictions: 2, sources: 40 },
    };
    expect(ProjectGrowthResponseSchema.safeParse(growth).success).toBe(true);
    expect(ProjectGrowthResponseSchema.safeParse({ ...growth, wiki: { ...growth.wiki, pages: -1 } }).success).toBe(false);
  });
});
