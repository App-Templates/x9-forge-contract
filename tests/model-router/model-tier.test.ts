import { describe, it, expect } from 'vitest';
import { ModelTierSchema, MODEL_TIERS, TIER_ORDER, compareTiers, type ModelTier } from '../../src/model-router/model-tier.js';

describe('ModelTierSchema', () => {
  it('accepts every literal in MODEL_TIERS', () => {
    for (const t of MODEL_TIERS) expect(ModelTierSchema.parse(t)).toBe(t);
  });
  it('rejects unknown values', () => {
    expect(ModelTierSchema.safeParse('omni').success).toBe(false);
    expect(ModelTierSchema.safeParse('').success).toBe(false);
  });
});

describe('MODEL_TIERS + TIER_ORDER', () => {
  it('MODEL_TIERS equals the locked order', () => {
    expect([...MODEL_TIERS]).toEqual(['standard', 'advanced', 'reasoning']);
  });
  it('TIER_ORDER === MODEL_TIERS (referential, low→high)', () => {
    expect(TIER_ORDER).toBe(MODEL_TIERS);
  });
});

describe('compareTiers — all 9 combinations (3×3)', () => {
  const cases: Array<[ModelTier, ModelTier, -1 | 0 | 1]> = [
    ['standard', 'standard', 0], ['standard', 'advanced', -1], ['standard', 'reasoning', -1],
    ['advanced', 'standard', 1], ['advanced', 'advanced', 0], ['advanced', 'reasoning', -1],
    ['reasoning', 'standard', 1], ['reasoning', 'advanced', 1], ['reasoning', 'reasoning', 0],
  ];
  for (const [a, b, exp] of cases) {
    it(`compareTiers('${a}','${b}') === ${exp}`, () => {
      expect(compareTiers(a, b)).toBe(exp);
    });
  }
  it('reflexive: compareTiers(t,t) === 0 for every t', () => {
    for (const t of MODEL_TIERS) expect(compareTiers(t, t)).toBe(0);
  });
});
