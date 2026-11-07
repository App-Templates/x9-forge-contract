import { describe, expect, it } from 'vitest';
import * as dist from '../../dist/model-router/index.js';

describe('dist 1.112.0', () => {
  it('publishes the rebuild cost estimate', () => {
    const cost = {
      state: 'known', currency: 'USD', source: 'price list', observedAt: '2026-11-07T10:00:00Z',
      rates: [{ unit: 'million-input-tokens', amount: 0.02 }],
    };
    expect(dist.embeddingRebuildCost(2_048_000, cost)).toEqual({ amount: 0.05, currency: 'USD', reason: null });
  });

  it('has only the catalog way of observing a retirement', () => {
    const exported = dist as Record<string, unknown>;
    expect(exported.internalModelsRetiredObservedContract).toBeUndefined();
    expect(exported.retiredProviderErrorFits).toBeUndefined();
    expect(dist.vaultModelsRetiredObservedContract.path).toBe('/internal/models/retired-observed/:vaultAgentId');
  });

  it('keeps the saved attachment rule from 1.111.0', () => {
    expect(typeof dist.presetAttachmentAuthorityOf).toBe('function');
  });
});
