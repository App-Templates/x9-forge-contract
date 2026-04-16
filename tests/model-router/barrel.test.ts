import { describe, it, expect } from 'vitest';
import * as M from '../../src/model-router/index.js';

describe('@x9-forge/contracts/model-router — barrel exhaustiveness', () => {
  const expectedExports = [
    // Tier
    'ModelTierSchema', 'MODEL_TIERS', 'TIER_ORDER', 'compareTiers',
    // Provider
    'ModelProviderSchema', 'MODEL_PROVIDERS',
    // Mapping
    'ModelTierMappingSchema',
    // Policy
    'ModelPolicySchema',
    // Per-agent override
    'PerAgentModelOverrideSchema',
    // Push
    'ModelPushRequestSchema', 'ModelPushSuccessSchema', 'ModelPushErrorSchema',
    'ModelPushResponseSchema', 'pushModelConfigContract',
    // Hot reload
    'ModelHotReloadNotificationSchema',
  ];
  for (const name of expectedExports) {
    it(`exports ${name}`, () => {
      expect((M as Record<string, unknown>)[name]).toBeDefined();
    });
  }
});
