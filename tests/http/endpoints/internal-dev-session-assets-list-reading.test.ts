import { describe, expect, it } from 'vitest';
import {
  DevSessionAssetsListRequestSchema,
  DevSessionAssetsListResponseSchema,
  listDevSessionAssetsContract,
} from '../../../src/http/endpoints/internal-dev-session-assets-list.js';

// Reconstruct the R61 shape from the task; the original production JSON is not available in the repository.
const scope = { tenantId: 'tenant-1', ownerId: '7', agentId: 'capo-sviluppo' };
const response = {
  assets: [
    { path: 'CONSEGNA.json', mediaType: 'application/json' },
    { path: '.consegna/R61/schermate/home.png', mediaType: 'image/png' },
    { path: '.consegna/R61/prove/scostamenti.md', mediaType: 'text/markdown' },
  ].map(({ path, mediaType }, index) => ({
    assetId: `r61-asset-${index}`, sha256: 'b'.repeat(64), name: path.split('/').at(-1)!,
    mediaType, sizeBytes: 100 + index,
    origin: { kind: 'session' as const, sessionId: 'R61', repo: 'acme/dispensa-pronta', commit: 'a'.repeat(40), path },
    tenantId: scope.tenantId, companyId: 'dispensa-pronta', projectId: 'dispensa-pronta',
    createdAt: '2026-11-21T09:00:00Z',
  })),
};
const reading = {
  productKind: 'design', complete: false,
  notMet: [
    { id: 'D-08', attestor: 'esecutore', reason: 'Brand deviations still need review' },
    { id: 'chief-01', attestor: 'sessione', reason: 'Screen review is pending' },
  ],
  deviationsPath: '.consegna/R61/prove/scostamenti.md',
};

describe('session acceptance reading', () => {
  it('s8237 lettura-del-giudizio', () => {
    // Check the response first so the original strict rejection is the regression signal.
    expect(DevSessionAssetsListResponseSchema.parse({ ...response, reading })).toEqual({ ...response, reading });
    const request = { scope, include: ['reading'] };
    expect(DevSessionAssetsListRequestSchema.parse(request)).toEqual(request);
    expect(listDevSessionAssetsContract.bodySchema).toBe(DevSessionAssetsListRequestSchema);
    expect(listDevSessionAssetsContract.responseSchema).toBe(DevSessionAssetsListResponseSchema);
    expect(listDevSessionAssetsContract.paramsSchema.parse({ agentId: scope.agentId, sessionId: 'R61' }))
      .toEqual({ agentId: scope.agentId, sessionId: 'R61' });
  });

  it('s8237 forma-di-oggi', () => {
    expect(DevSessionAssetsListRequestSchema.parse({ scope })).toEqual({ scope });
    expect(DevSessionAssetsListResponseSchema.parse(response)).toEqual(response);
  });

  it('s8237 completa-con-mancanze', () => {
    const valid = { ...response, reading: { complete: true, notMet: [] } };
    expect(DevSessionAssetsListResponseSchema.parse(valid)).toEqual(valid);
    const result = DevSessionAssetsListResponseSchema.safeParse({
      ...response, reading: { complete: true, notMet: [reading.notMet[0]] },
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: ['reading', 'notMet'] }),
    ]));
  });

  it('s8237 include-sconosciuto', () => {
    expect(DevSessionAssetsListRequestSchema.parse({ scope, include: [] })).toEqual({ scope, include: [] });
    for (const include of [['altro'], ['reading', 'reading']]) {
      expect(DevSessionAssetsListRequestSchema.safeParse({ scope, include }).success).toBe(false);
    }
  });

  it('s8237 campo-in-piu', () => {
    expect(DevSessionAssetsListResponseSchema.safeParse({
      ...response, reading: { ...reading, extra: true },
    }).success).toBe(false);
    expect(DevSessionAssetsListResponseSchema.safeParse({
      ...response, reading: { ...reading, notMet: [{ ...reading.notMet[0], extra: true }] },
    }).success).toBe(false);
  });

  it('s8237 limiti-della-lettura', () => {
    const minimal = { complete: false, notMet: [{ id: 'x', attestor: 'sessione' }] };
    for (const valid of [
      minimal,
      { ...minimal, productKind: 'code' },
      { ...minimal, deviationsPath: 'x'.repeat(512), notMet: Array.from({ length: 50 }, () => ({
        id: 'x'.repeat(40), attestor: 'esecutore', reason: 'x'.repeat(400),
      })) },
    ]) {
      expect(DevSessionAssetsListResponseSchema.parse({ ...response, reading: valid }))
        .toEqual({ ...response, reading: valid });
    }
    for (const invalid of [
      { ...minimal, productKind: 'other' }, { ...minimal, complete: 'false' },
      { notMet: [] }, { complete: false },
      { ...minimal, deviationsPath: '' }, { ...minimal, deviationsPath: 'x'.repeat(513) },
      { ...minimal, notMet: Array.from({ length: 51 }, () => minimal.notMet[0]) },
      ...[{ id: '' }, { id: 'x'.repeat(41) }, { attestor: 'referente' }, { reason: '' }, { reason: 'x'.repeat(401) }]
        .map(change => ({ ...minimal, notMet: [{ ...minimal.notMet[0], ...change }] })),
    ]) {
      expect(DevSessionAssetsListResponseSchema.safeParse({ ...response, reading: invalid }).success).toBe(false);
    }
  });
});
