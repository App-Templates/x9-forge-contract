import { describe, expect, it } from 'vitest';
import {
  VaultCascadeEntryPlainSchema,
  CredentialSourceIdSchema,
  CredentialVersionRefSchema,
  compareCredentialVersions,
  internalVaultResolvedContract,
  PRIMARY_FORGE_PROVIDER_KEYS,
} from '../../dist/vault/index.js';
import { EffectiveSlotStateSchema } from '../../dist/model-router/index.js';

describe('dist 1.105.0', () => {
  it('exports preset credentials and preserves configured credential versions', () => {
    const credential = CredentialVersionRefSchema.parse({
      source: CredentialSourceIdSchema.parse('preset:3'), counter: 4, revoked: true,
    });
    const presetEntry = {
      id: 1, key: 'OPENAI_API_KEY', isCustomized: false,
      tier: 'preset', presetId: 3, agentId: null, ownerId: null,
      value: 'synthetic-value', isSecret: true,
    };
    expect(VaultCascadeEntryPlainSchema.parse(presetEntry)).toEqual(presetEntry);
    expect(compareCredentialVersions(credential, { ...credential, counter: 5 })).toBe('older');
    expect(compareCredentialVersions(credential, { ...credential, source: 'agent:7' })).toBe('incomparable');
    expect(internalVaultResolvedContract.method).toBe('GET');
    const resolved = {
      agentId: 7,
      entries: [{ key: 'OPENAI_API_KEY', value: 'synthetic-value', tier: 'preset', secret: true }],
    };
    expect(internalVaultResolvedContract.responseSchema.parse(resolved)).toEqual(resolved);
    expect(PRIMARY_FORGE_PROVIDER_KEYS).toEqual([
      'OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'GOOGLE_API_KEY', 'ELEVENLABS_API_KEY',
    ]);

    const standard = {
      provider: 'openai', modelId: 'gpt-5.6-luna', protocol: 'responses', adapterId: 'openai-live-delegation',
    };
    const configured = {
      state: 'configured',
      choice: {
        capability: 'agent-core', function: 'reasoning', mode: 'automatic',
        tiers: { standard, advanced: standard, reasoning: standard }, fallback: standard,
      },
      generation: { presetId: 3, agentGeneration: 5, presetGeneration: 7 },
      credentialKey: 'OPENAI_API_KEY', credentialVersion: 4,
      etag: 'm2-v2-1-3-5-7-abcdef0123456789',
    };
    expect(EffectiveSlotStateSchema.parse({ ...configured, credential })).toEqual({ ...configured, credential });
    expect(EffectiveSlotStateSchema.parse(configured)).toEqual(configured);
    expect(EffectiveSlotStateSchema.parse({ ...configured, credential: null })).toEqual({ ...configured, credential: null });
  });
});
