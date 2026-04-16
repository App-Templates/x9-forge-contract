import { describe, it, expect } from 'vitest';
import { ModelProviderSchema, MODEL_PROVIDERS } from '../../src/model-router/model-provider.js';

describe('ModelProviderSchema', () => {
  it('accepts every literal in MODEL_PROVIDERS', () => {
    for (const p of MODEL_PROVIDERS) expect(ModelProviderSchema.parse(p)).toBe(p);
  });
  it('rejects unknown providers', () => {
    expect(ModelProviderSchema.safeParse('mistral').success).toBe(false);
  });
  it('MODEL_PROVIDERS equals the locked list', () => {
    expect([...MODEL_PROVIDERS]).toEqual(['openai', 'anthropic', 'google']);
  });
});
