import { describe, expect, it } from 'vitest';
import { INTERNAL_TOKEN_HEADER } from '../../src/auth/index.js';
import {
  VaultResolvedEntrySchema,
  VaultResolvedResponseSchema,
  internalVaultResolvedContract,
  vaultResolvedPath,
  PRIMARY_FORGE_PROVIDER_KEYS,
} from '../../src/vault/index.js';
import type { VaultResolvedEntry, VaultResolvedResponse } from '../../src/vault/index.js';

const entry: VaultResolvedEntry = {
  key: 'OPENAI_API_KEY',
  value: 'fake-openai-value',
  tier: 'agent',
  secret: true,
};

describe('resolved vault credentials', () => {
  it('parses the Forge response shape with two synthetic entries', () => {
    const response: VaultResolvedResponse = {
      agentId: 7,
      entries: [entry, {
        key: 'GOOGLE_API_KEY',
        value: 'fake-google-value',
        tier: 'owner',
        secret: false,
      }],
    };
    expect(VaultResolvedResponseSchema.parse(response)).toEqual(response);
  });

  it('accepts a credential resolved from the preset tier', () => {
    const presetEntry = { ...entry, tier: 'preset' };
    expect(VaultResolvedEntrySchema.parse(presetEntry)).toEqual(presetEntry);
    expect(VaultResolvedResponseSchema.parse({ agentId: 7, entries: [presetEntry] }))
      .toEqual({ agentId: 7, entries: [presetEntry] });
  });

  it('rejects extra fields on entries and responses', () => {
    expect(VaultResolvedEntrySchema.safeParse({ ...entry, extra: true }).success).toBe(false);
    expect(VaultResolvedResponseSchema.safeParse({
      agentId: 7, entries: [entry], extra: true,
    }).success).toBe(false);
    expect(VaultResolvedResponseSchema.safeParse({
      agentId: 7, entries: [{ ...entry, extra: true }],
    }).success).toBe(false);
  });

  it('rejects invalid credential fields and agent identifiers', () => {
    for (const invalidEntry of [
      { ...entry, key: 'invalid key' },
      { ...entry, key: 'TELEGRAM_SESSION_STRING' },
      { ...entry, value: 123 },
      { ...entry, tier: 'unknown' },
      { ...entry, secret: 'true' },
    ]) {
      expect(VaultResolvedEntrySchema.safeParse(invalidEntry).success).toBe(false);
    }
    for (const agentId of [0, -1, 1.5, NaN, Infinity]) {
      expect(VaultResolvedResponseSchema.safeParse({ agentId, entries: [] }).success).toBe(false);
      expect(() => vaultResolvedPath(agentId)).toThrow();
    }
  });

  it('builds the agent path and declares token authentication', () => {
    expect(vaultResolvedPath(7)).toBe('/api/internal/vault/agents/7/resolved');
    expect(internalVaultResolvedContract.method).toBe('GET');
    expect(internalVaultResolvedContract.path).toBe('/api/internal/vault/agents/:agentId/resolved');
    expect(internalVaultResolvedContract.authType).toBe('token');
    expect(internalVaultResolvedContract.authHeader).toBe(INTERNAL_TOKEN_HEADER);
    expect(internalVaultResolvedContract.responseSchema).toBe(VaultResolvedResponseSchema);
  });

  it('lists only the primary agent provider keys read from Forge', () => {
    expect(PRIMARY_FORGE_PROVIDER_KEYS).toEqual([
      'OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'GOOGLE_API_KEY', 'ELEVENLABS_API_KEY',
    ]);
    expect(PRIMARY_FORGE_PROVIDER_KEYS).not.toContain('INTERNAL_SECRET');
    expect(PRIMARY_FORGE_PROVIDER_KEYS).not.toContain('TELEGRAM_BOT_TOKEN');
  });
});
