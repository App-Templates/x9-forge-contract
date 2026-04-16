import { describe, it, expect } from 'vitest';
import { ModelPolicySchema } from '../../src/model-router/model-policy.js';
import { MODEL_TIERS, compareTiers, type ModelTier } from '../../src/model-router/model-tier.js';

describe('ModelPolicySchema — valid (min<=max)', () => {
  const validPairs: Array<[ModelTier, ModelTier]> = [];
  for (const a of MODEL_TIERS) for (const b of MODEL_TIERS) {
    if (compareTiers(a, b) <= 0) validPairs.push([a, b]);
  }
  for (const [min, max] of validPairs) {
    it(`accepts { min:'${min}', max:'${max}' }`, () => {
      expect(ModelPolicySchema.parse({ min, max })).toEqual({ min, max });
    });
  }
});

describe('ModelPolicySchema — invalid (min>max, T-06-01 guard)', () => {
  const invalidPairs: Array<[ModelTier, ModelTier]> = [
    ['advanced', 'standard'], ['reasoning', 'standard'], ['reasoning', 'advanced'],
  ];
  for (const [min, max] of invalidPairs) {
    it(`rejects { min:'${min}', max:'${max}' } with diagnostic citing values`, () => {
      const res = ModelPolicySchema.safeParse({ min, max });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]!.message).toMatch(new RegExp(`min=${min}.*max=${max}`));
        expect(res.error.issues[0]!.path).toEqual(['max']);
      }
    });
  }
});

describe('ModelPolicySchema — rejects unknown tier values', () => {
  it('rejects { min:\'omni\', max:\'standard\' }', () => {
    expect(ModelPolicySchema.safeParse({ min: 'omni', max: 'standard' }).success).toBe(false);
  });
});
