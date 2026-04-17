import { describe, it, expect } from 'vitest';
import {
  VaultResolveParamsSchema,
  VaultResolveResponseSchema,
  VaultResolveNotFoundResponseSchema,
  VaultResolveErrorResponseSchema,
  vaultResolveContract,
} from '../../../src/http/endpoints/vault-resolve.js';
import { VAULT_TIERS } from '../../../src/vault/vault-tier.js';

// Phase 38 — HTTP-12 — R-14 closure
// Consumer: @x9/capability-sdk VaultClient (packages/capability-sdk/src/vault-client.ts)

const validResolvedPayload = {
  ok: true as const,
  key: 'ELEVENLABS_VOICE_ID',
  value: 'voice_abc123',
  tier: 'platform' as const,
};

const validNotFoundPayload = {
  ok: false as const,
  error: "Key 'ELEVENLABS_VOICE_ID' not found in any tier",
};

describe('VaultResolveParamsSchema', () => {
  it('parses a valid numeric agentId + key', () => {
    const result = VaultResolveParamsSchema.parse({
      agentId: '1',
      key: 'ELEVENLABS_VOICE_ID',
    });
    expect(result.agentId).toBe('1');
    expect(result.key).toBe('ELEVENLABS_VOICE_ID');
  });

  it('rejects non-numeric agentId (UUIDs, slugs, empty)', () => {
    expect(() =>
      VaultResolveParamsSchema.parse({ agentId: 'stefano-main', key: 'K' }),
    ).toThrow();
    expect(() =>
      VaultResolveParamsSchema.parse({ agentId: '', key: 'K' }),
    ).toThrow();
  });

  it('rejects empty key', () => {
    expect(() =>
      VaultResolveParamsSchema.parse({ agentId: '1', key: '' }),
    ).toThrow();
  });
});

describe('VaultResolveResponseSchema (200)', () => {
  it('parses a valid 200 payload for every tier', () => {
    for (const tier of VAULT_TIERS) {
      const result = VaultResolveResponseSchema.parse({
        ...validResolvedPayload,
        tier,
      });
      expect(result.tier).toBe(tier);
      expect(result.ok).toBe(true);
      expect(result.value).toBe('voice_abc123');
    }
  });

  it('rejects a payload missing tier', () => {
    const { tier: _tier, ...withoutTier } = validResolvedPayload;
    void _tier;
    expect(() => VaultResolveResponseSchema.parse(withoutTier)).toThrow();
  });

  it('rejects a payload with a wrong tier literal', () => {
    expect(() =>
      VaultResolveResponseSchema.parse({
        ...validResolvedPayload,
        tier: 'superadmin',
      }),
    ).toThrow();
  });

  it('rejects a payload missing value', () => {
    const { value: _value, ...withoutValue } = validResolvedPayload;
    void _value;
    expect(() => VaultResolveResponseSchema.parse(withoutValue)).toThrow();
  });

  it('rejects a payload missing key', () => {
    const { key: _key, ...withoutKey } = validResolvedPayload;
    void _key;
    expect(() => VaultResolveResponseSchema.parse(withoutKey)).toThrow();
  });

  it('rejects ok: false at 200 path (discriminator guard)', () => {
    expect(() =>
      VaultResolveResponseSchema.parse({
        ...validResolvedPayload,
        ok: false,
      }),
    ).toThrow();
  });

  it('rejects non-string value (Zod defends against tampered response)', () => {
    expect(() =>
      VaultResolveResponseSchema.parse({
        ...validResolvedPayload,
        value: 123,
      }),
    ).toThrow();
  });
});

describe('VaultResolveNotFoundResponseSchema (404)', () => {
  it('parses a valid 404 payload', () => {
    const result = VaultResolveNotFoundResponseSchema.parse(validNotFoundPayload);
    expect(result.ok).toBe(false);
    expect(result.error).toContain('not found');
  });

  it('rejects ok: true at 404 path', () => {
    expect(() =>
      VaultResolveNotFoundResponseSchema.parse({
        ok: true,
        error: 'anything',
      }),
    ).toThrow();
  });

  it('rejects missing error field', () => {
    expect(() =>
      VaultResolveNotFoundResponseSchema.parse({ ok: false }),
    ).toThrow();
  });

  it('is aliased by VaultResolveErrorResponseSchema', () => {
    const viaAlias = VaultResolveErrorResponseSchema.parse(validNotFoundPayload);
    expect(viaAlias.ok).toBe(false);
  });
});

describe('vaultResolveContract', () => {
  it('declares GET /resolve/:agentId/:key with token auth', () => {
    expect(vaultResolveContract.method).toBe('GET');
    expect(vaultResolveContract.path).toBe('/resolve/:agentId/:key');
    expect(vaultResolveContract.authType).toBe('token');
  });

  it('exposes paramsSchema + responseSchema for bridge-client integration', () => {
    expect(vaultResolveContract.paramsSchema).toBe(VaultResolveParamsSchema);
    expect(vaultResolveContract.responseSchema).toBe(VaultResolveResponseSchema);
  });
});
