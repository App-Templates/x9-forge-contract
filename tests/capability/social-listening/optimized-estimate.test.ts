import { describe, expect, it } from 'vitest';
import {
  SOCIAL_COST_NEAR_TOLERANCE,
  SOCIAL_OPTIMIZED_COST_PER_POST_USD,
  socialCostVsEstimate,
} from '../../../src/capability/social-listening/index.js';

describe('socialCostVsEstimate', () => {
  it('(a) compares against the default estimate', () => {
    expect(socialCostVsEstimate({ costPerPostUsd: 0.09 })).toEqual({ costPerPostUsd: 0.09, estimateUsd: 0.1, ratio: 0.9, near: true });
  });

  it('(b) limit is inclusive, above it is far', () => {
    expect(socialCostVsEstimate({ costPerPostUsd: 0.15 })?.near).toBe(true);
    expect(socialCostVsEstimate({ costPerPostUsd: 0.150001 })?.near).toBe(false);
    const far = socialCostVsEstimate({ costPerPostUsd: 0.4 });
    expect(far?.near).toBe(false);
    expect(far?.ratio).toBe(4);
  });

  it('(c) exact ratios and caller-supplied estimate and tolerance', () => {
    expect(socialCostVsEstimate({ costPerPostUsd: 0.0125, estimateUsd: 0.1 })?.ratio).toBe(0.125);
    expect(socialCostVsEstimate({ costPerPostUsd: 0.2, estimateUsd: 0.2, tolerance: 0 })?.near).toBe(true);
    expect(socialCostVsEstimate({ costPerPostUsd: 0.200001, estimateUsd: 0.2, tolerance: 0 })?.near).toBe(false);
  });

  it('(d) invalid inputs give null', () => {
    for (const costPerPostUsd of [Number.NaN, -1, Number.POSITIVE_INFINITY]) {
      expect(socialCostVsEstimate({ costPerPostUsd })).toBeNull();
    }
    expect(socialCostVsEstimate({ costPerPostUsd: 0.1, estimateUsd: 0 })).toBeNull();
    expect(socialCostVsEstimate({ costPerPostUsd: 0.1, estimateUsd: Number.NaN })).toBeNull();
    expect(socialCostVsEstimate({ costPerPostUsd: 0.1, tolerance: -0.1 })).toBeNull();
  });

  it('(e) exports the constants', () => {
    expect(SOCIAL_OPTIMIZED_COST_PER_POST_USD).toEqual({ low: 0.08, high: 0.1 });
    expect(SOCIAL_COST_NEAR_TOLERANCE).toBe(0.5);
  });
});
