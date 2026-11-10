import { describe, expect, it } from 'vitest';
import * as barrel from '../../src/model-router/index.js';
import {
  RetiredModelObservationSchema,
  retirementSource,
  vaultModelsRetiredObservedContract,
} from '../../src/model-router/model-retirement.js';

const base = () => ({
  scope: { agentId: 'x9', ownerId: '1', tenantId: '1' },
  slotId: 'agent_chat',
  model: { provider: 'google', modelId: 'example-a', protocol: 'responses', adapterId: 'openai-live-delegation' },
});
const parse = (body: unknown) => RetiredModelObservationSchema.safeParse(body);

describe('RetiredModelObservationSchema source', () => {
  it('accepts provider-inventory and reads it back', () => {
    const result = parse({ ...base(), source: 'provider-inventory' });
    expect(result.success).toBe(true);
    if (result.success) expect(retirementSource(result.data)).toBe('provider-inventory');
  });

  it('rejects an observation without source', () => {
    expect(parse(base()).success).toBe(false);
  });

  it('rejects provider-error and any other source', () => {
    expect(parse({ ...base(), source: 'provider-error' }).success).toBe(false);
    expect(parse({ ...base(), source: 'registry' }).success).toBe(false);
  });

  it('rejects providerError, with or without a source', () => {
    expect(parse({ ...base(), source: 'provider-inventory', providerError: 'not_found' }).success).toBe(false);
    expect(parse({ ...base(), providerError: 'model_not_found' }).success).toBe(false);
  });
});

describe('exports', () => {
  it('uses the same schema in the vault contract and exports from the barrel', () => {
    expect(vaultModelsRetiredObservedContract.bodySchema).toBe(RetiredModelObservationSchema);
    expect(barrel.RetiredModelObservationSchema).toBe(RetiredModelObservationSchema);
    expect(barrel.retirementSource).toBe(retirementSource);
  });

  it('no longer exports the call-observed way', () => {
    const exported = barrel as Record<string, unknown>;
    for (const name of ['retiredProviderErrorFits', 'RETIRED_PROVIDER_ERROR_CODES', 'RetiredProviderErrorSchema', 'RetirementSourceSchema', 'RETIREMENT_SOURCES', 'internalModelsRetiredObservedContract']) {
      expect(exported[name], name).toBeUndefined();
    }
  });
});
