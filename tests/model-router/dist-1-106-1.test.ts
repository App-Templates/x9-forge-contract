import { describe, expect, it } from 'vitest';
import {
  RETIRED_PROVIDER_ERROR_CODES,
  RETIREMENT_SOURCES,
  RetiredModelObservationSchema,
  RetiredProviderErrorSchema,
  RetirementSourceSchema,
  internalModelsRetiredObservedContract,
  retiredProviderErrorFits,
  retirementSource,
} from '../../dist/model-router/index.js';

describe('dist 1.106.1', () => {
  it('publishes retirement sources and keeps today\'s observation compatible', () => {
    expect(typeof retirementSource).toBe('function');
    expect(typeof retiredProviderErrorFits).toBe('function');
    expect(RETIREMENT_SOURCES).toEqual(['provider-error', 'provider-inventory']);
    expect(RetirementSourceSchema.options).toEqual([...RETIREMENT_SOURCES]);
    expect(RETIRED_PROVIDER_ERROR_CODES).toEqual({
      openai: ['model_not_found'],
      anthropic: ['not_found_error'],
      google: ['NOT_FOUND'],
      elevenlabs: ['not_found'],
    });
    for (const [provider, codes] of Object.entries(RETIRED_PROVIDER_ERROR_CODES)) {
      for (const code of codes) {
        expect(RetiredProviderErrorSchema.parse(code)).toBe(code);
        expect(retiredProviderErrorFits(provider, code)).toBe(true);
      }
    }
    expect(retiredProviderErrorFits('openai', 'NOT_FOUND')).toBe(false);

    const body = {
      scope: { agentId: 'x9', ownerId: '1', tenantId: '1' },
      slotId: 'memory_extraction',
      model: { provider: 'openai', modelId: 'gpt-old', protocol: 'responses', adapterId: 'openai-live-delegation' },
    };
    const inventory = { ...body, source: 'provider-inventory' };
    const legacy = { ...body, providerError: 'model_not_found' };
    const parsedInventory = RetiredModelObservationSchema.parse(inventory);
    const parsedLegacy = RetiredModelObservationSchema.parse(legacy);
    expect(parsedInventory).toEqual(inventory);
    expect(parsedLegacy).toEqual(legacy);
    expect(retirementSource(parsedInventory)).toBe('provider-inventory');
    expect(retirementSource(parsedLegacy)).toBe('provider-error');
    expect(RetiredModelObservationSchema.safeParse({ ...body, source: 'provider-error' }).success).toBe(false);
    expect(RetiredModelObservationSchema.safeParse({ ...inventory, providerError: 'model_not_found' }).success).toBe(false);
    expect(internalModelsRetiredObservedContract.path).toBe('/internal/models/retired-observed');
    expect(internalModelsRetiredObservedContract.bodySchema).toBe(RetiredModelObservationSchema);
  });
});
