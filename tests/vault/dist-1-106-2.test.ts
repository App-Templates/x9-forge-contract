import { describe, expect, it } from 'vitest';
import { EffectiveSlotStateSchema } from '../../dist/model-router/index.js';
import {
  CredentialVersionRefSchema,
  CredentialVersionThresholdSchema,
  credentialVersionRevoked,
  withinRevocationThreshold,
} from '../../dist/vault/index.js';

describe('dist 1.106.2', () => {
  it('publishes revocation thresholds and keeps configured credentials compatible', () => {
    expect(typeof credentialVersionRevoked).toBe('function');
    expect(typeof withinRevocationThreshold).toBe('function');
    const threshold = CredentialVersionThresholdSchema.parse({ source: 'preset:2', counter: 4 });
    expect(threshold).toEqual({ source: 'preset:2', counter: 4, revoked: false });

    const legacy = { source: 'preset:2', counter: 5, revoked: false };
    const credential = CredentialVersionRefSchema.parse({
      ...legacy,
      revokedThrough: { source: 'preset:2', counter: 4 },
    });
    expect(credential).toEqual({ ...legacy, revokedThrough: threshold });
    expect(CredentialVersionRefSchema.parse(legacy)).toEqual(legacy);
    const opened = { source: 'preset:2', counter: 4, revoked: false };
    expect(credentialVersionRevoked(opened, credential)).toBe(true);
    expect(credentialVersionRevoked(opened, legacy)).toBe(false);
    expect(withinRevocationThreshold(opened, threshold)).toBe(true);
    expect(withinRevocationThreshold(legacy, threshold)).toBe(false);
    expect(withinRevocationThreshold({ ...opened, source: 'preset:3' }, threshold)).toBe(false);

    const standard = {
      provider: 'openai', modelId: 'gpt-5.6-luna', protocol: 'responses', adapterId: 'openai-live-delegation',
    };
    const configured = {
      state: 'configured',
      choice: {
        capability: 'agent-core', function: 'reasoning', mode: 'automatic',
        tiers: { standard, advanced: standard, reasoning: standard }, fallback: standard,
      },
      generation: { presetId: 2, agentGeneration: 5, presetGeneration: 7 },
      credentialKey: 'OPENAI_API_KEY', credentialVersion: 5, etag: 'm2-v2-1-2-5-7-abcdef0123456789',
    };
    expect(EffectiveSlotStateSchema.parse({ ...configured, credential })).toEqual({ ...configured, credential });
    expect(EffectiveSlotStateSchema.parse({ ...configured, credential: legacy })).toEqual({ ...configured, credential: legacy });
    expect(EffectiveSlotStateSchema.parse(configured)).toEqual(configured);
  });
});
