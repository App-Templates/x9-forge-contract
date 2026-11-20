import { describe, expect, it } from 'vitest';
import * as http from '../../src/http/index.js';
import {
  INTERNAL_MEMORY_ASSET_REFUSAL_CODES,
  InternalMemoryAssetRefusalCodeSchema,
} from '../../src/http/endpoints/internal-memory-assets.js';

describe('internal memory asset refusal codes', () => {
  it('s6463 codice-reparto-asset: the bridge names asset_foreign_business_unit as the refusal of the memory asset routes for a document stored in another business unit, and its schema accepts only that code', () => {
    expect([...INTERNAL_MEMORY_ASSET_REFUSAL_CODES]).toEqual(['asset_foreign_business_unit']);
    expect(InternalMemoryAssetRefusalCodeSchema.safeParse('asset_foreign_business_unit').success).toBe(true);
    // the code of the body Memory sends today (asset-routes.ts)
    const body = {
      code: 'asset_foreign_business_unit',
      message: 'only the business unit lead or organization management may store generated documents in this business unit',
    };
    expect(InternalMemoryAssetRefusalCodeSchema.safeParse(body.code).success).toBe(true);
    for (const bad of ['company_memory_http_403', 'Asset_foreign_business_unit', '']) {
      expect(InternalMemoryAssetRefusalCodeSchema.safeParse(bad).success).toBe(false);
    }
    expect(InternalMemoryAssetRefusalCodeSchema.enum.asset_foreign_business_unit).toBe('asset_foreign_business_unit');
  });

  it('exports the same names from the http index', () => {
    expect(http.INTERNAL_MEMORY_ASSET_REFUSAL_CODES).toBe(INTERNAL_MEMORY_ASSET_REFUSAL_CODES);
    expect(http.InternalMemoryAssetRefusalCodeSchema).toBe(InternalMemoryAssetRefusalCodeSchema);
  });
});
