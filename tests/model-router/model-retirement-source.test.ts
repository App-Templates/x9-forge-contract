import { describe, expect, it } from 'vitest';
import * as barrel from '../../src/model-router/index.js';
import {
  RETIRED_PROVIDER_ERROR_CODES,
  RETIREMENT_SOURCES,
  RetiredModelObservationSchema,
  RetiredProviderErrorSchema,
  RetirementSourceSchema,
  retiredProviderErrorFits,
  retirementSource,
  vaultModelsRetiredObservedContract,
} from '../../src/model-router/model-retirement.js';

const descriptors = {
  openai: { provider: 'openai', modelId: 'example-a', protocol: 'responses', adapterId: 'openai-live-delegation' },
  google: { provider: 'google', modelId: 'example-a', protocol: 'responses', adapterId: 'openai-live-delegation' },
  elevenlabs: { provider: 'elevenlabs', modelId: 'example-a', protocol: 'responses', adapterId: 'openai-live-delegation' },
};

const base = (provider: keyof typeof descriptors = 'openai') => ({
  scope: { agentId: 'x9', ownerId: '1', tenantId: '1' },
  slotId: 'agent_chat',
  model: descriptors[provider],
});
const parse = (body: unknown) => RetiredModelObservationSchema.safeParse(body);

describe('RetiredModelObservationSchema source', () => {
  it('accepts today\'s body without source and reads it as a call', () => {
    const result = parse({ ...base(), providerError: 'model_not_found' });
    expect(result.success).toBe(true);
    if (result.success) expect(retirementSource(result.data)).toBe('provider-error');
  });

  it('rejects provider-error without providerError, with the issue on providerError', () => {
    const noSource = parse(base());
    const explicit = parse({ ...base(), source: 'provider-error' });
    expect(noSource.success).toBe(false);
    expect(explicit.success).toBe(false);
    if (!explicit.success) expect(explicit.error.issues[0]?.path).toEqual(['providerError']);
  });

  it('accepts provider-inventory without providerError for google and elevenlabs, rejects it with one', () => {
    for (const provider of ['google', 'elevenlabs'] as const) {
      const result = parse({ ...base(provider), source: 'provider-inventory' });
      expect(result.success).toBe(true);
      if (result.success) expect(retirementSource(result.data)).toBe('provider-inventory');
      const withCode = parse({ ...base(provider), source: 'provider-inventory', providerError: 'not_found' });
      expect(withCode.success).toBe(false);
      if (!withCode.success) expect(withCode.error.issues[0]?.path).toEqual(['providerError']);
    }
  });

  it('rejects a source outside the two observable ones', () => {
    expect(parse({ ...base(), source: 'registry', providerError: 'model_not_found' }).success).toBe(false);
  });

  it('accepts the Google and ElevenLabs codes and rejects others', () => {
    expect(parse({ ...base('google'), providerError: 'NOT_FOUND' }).success).toBe(true);
    expect(parse({ ...base('elevenlabs'), providerError: 'not_found' }).success).toBe(true);
    expect(parse({ ...base(), providerError: 'timeout' }).success).toBe(false);
  });

  it('does not check the provider/code pair in the schema', () => {
    expect(parse({ ...base('openai'), providerError: 'not_found_error' }).success).toBe(true);
  });
});

describe('retiredProviderErrorFits', () => {
  it('fits only the code in that provider\'s row', () => {
    expect(retiredProviderErrorFits('google', 'NOT_FOUND')).toBe(true);
    expect(retiredProviderErrorFits('openai', 'NOT_FOUND')).toBe(false);
    expect(retiredProviderErrorFits('elevenlabs', 'not_found')).toBe(true);
    expect(retiredProviderErrorFits('mistral', 'model_not_found')).toBe(false);
    expect(retiredProviderErrorFits('toString', 'model_not_found')).toBe(false);
  });

  it('keeps the table and the enum in step', () => {
    for (const codes of Object.values(RETIRED_PROVIDER_ERROR_CODES)) {
      for (const code of codes) expect(RetiredProviderErrorSchema.options).toContain(code);
    }
    expect(RetiredProviderErrorSchema.options).toEqual(['model_not_found', 'not_found_error', 'NOT_FOUND', 'not_found']);
    expect(RetirementSourceSchema.options).toEqual([...RETIREMENT_SOURCES]);
  });
});

describe('exports', () => {
  it('uses the same schema in the vault contract and exports from the barrel', () => {
    expect(vaultModelsRetiredObservedContract.bodySchema).toBe(RetiredModelObservationSchema);
    expect(barrel.RetiredModelObservationSchema).toBe(RetiredModelObservationSchema);
    expect(barrel.retirementSource).toBe(retirementSource);
    expect(barrel.retiredProviderErrorFits).toBe(retiredProviderErrorFits);
    expect(barrel.RETIRED_PROVIDER_ERROR_CODES).toBe(RETIRED_PROVIDER_ERROR_CODES);
  });
});
