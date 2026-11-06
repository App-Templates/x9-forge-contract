import { describe, it, expect } from 'vitest';
import { CredentialOwnTierSchema } from '../../src/vault/credential-link.js';
import { WorkspaceFileSchema } from '../../src/vault/workspace-file.js';
import {
  VaultGenericTierSchema,
  VaultTierSchema,
  VAULT_TIERS,
  compareTiers,
} from '../../src/vault/vault-tier.js';

describe('VaultTierSchema', () => {
  it('parses platform tier', () => {
    expect(VaultTierSchema.parse('platform')).toBe('platform');
  });

  it('parses owner tier', () => {
    expect(VaultTierSchema.parse('owner')).toBe('owner');
  });

  it('parses agent tier', () => {
    expect(VaultTierSchema.parse('agent')).toBe('agent');
  });

  it('parses preset tier', () => {
    expect(VaultTierSchema.parse('preset')).toBe('preset');
  });

  it('rejects unknown tier strings', () => {
    expect(VaultTierSchema.safeParse('tenant').success).toBe(false);
  });
});

describe('VAULT_TIERS', () => {
  it('has the exact priority order [platform, owner, preset, agent]', () => {
    expect(VAULT_TIERS).toEqual(['platform', 'owner', 'preset', 'agent']);
  });

  it('keeps preset out of the generic write tiers', () => {
    expect(VaultGenericTierSchema.safeParse('preset').success).toBe(false);
  });

  it('keeps preset out of the own-key tiers', () => {
    expect(CredentialOwnTierSchema.options).toEqual(['owner', 'agent']);
  });

  it('rejects a workspace file at preset tier', () => {
    expect(
      WorkspaceFileSchema.safeParse({
        agentId: null,
        ownerId: null,
        tier: 'preset',
        path: 'a.md',
        content: null,
        isCustomized: false,
        updatedAt: '2026-11-06T10:00:00Z',
      }).success,
    ).toBe(false);
  });
});

describe('compareTiers', () => {
  it('returns -1 when platform < owner', () => {
    expect(compareTiers('platform', 'owner')).toBe(-1);
  });

  it('returns 1 when owner > platform', () => {
    expect(compareTiers('owner', 'platform')).toBe(1);
  });

  it('returns -1 when platform < agent', () => {
    expect(compareTiers('platform', 'agent')).toBe(-1);
  });

  it('returns 1 when agent > platform', () => {
    expect(compareTiers('agent', 'platform')).toBe(1);
  });

  it('returns 1 when preset > owner', () => {
    expect(compareTiers('preset', 'owner')).toBe(1);
  });

  it('returns 1 when agent > preset', () => {
    expect(compareTiers('agent', 'preset')).toBe(1);
  });

  it('returns 0 when same tier (owner, owner)', () => {
    expect(compareTiers('owner', 'owner')).toBe(0);
  });
});
