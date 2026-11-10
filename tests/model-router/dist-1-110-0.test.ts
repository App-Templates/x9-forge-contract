import { describe, expect, it } from 'vitest';
import {
  PLATFORM_PRESET_SOURCE_IDENTITY,
  isPlatformPresetSourceIdentity,
  ModelPresetKindSchema,
} from '../../dist/model-router/index.js';

describe('dist 1.110.0', () => {
  it('publishes the frozen platform preset source and recognizes the saved X9 identity', () => {
    expect(PLATFORM_PRESET_SOURCE_IDENTITY).toEqual({
      runtimeAgentId: 'x9',
      managementAgentId: 'x9-staging',
    });
    expect(Object.isFrozen(PLATFORM_PRESET_SOURCE_IDENTITY)).toBe(true);
    expect(isPlatformPresetSourceIdentity({
      runtimeAgentId: 'x9',
      managementAgentId: 'x9-staging',
      vaultAgentId: 1,
    })).toBe(true);
    expect(isPlatformPresetSourceIdentity({
      runtimeAgentId: 'x9',
      managementAgentId: 'erede',
    })).toBe(false);
    expect(ModelPresetKindSchema.options).toEqual(['platform', 'company']);
  });
});
