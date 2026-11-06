import { describe, it, expect } from 'vitest';
import { CredentialOwnTierSchema } from '../../src/vault/credential-link.js';
import { VaultEntryPlainSchema } from '../../src/vault/vault-entry.js';
import {
  VAULT_GENERIC_TIERS,
  VaultGenericTierSchema,
  VaultTierSchema,
} from '../../src/vault/vault-tier.js';
import { WorkspaceFileSchema } from '../../src/vault/workspace-file.js';

describe('preset tier in the vault cascade', () => {
  it('generic write tiers keep the three tiers of today', () => {
    expect(VAULT_GENERIC_TIERS).toEqual(['platform', 'owner', 'agent']);
    expect(VaultGenericTierSchema.safeParse('preset').success).toBe(false);
  });

  it('own-key tiers stay owner and agent', () => {
    expect(CredentialOwnTierSchema.options).toEqual(['owner', 'agent']);
    expect(CredentialOwnTierSchema.safeParse('preset').success).toBe(false);
    expect(CredentialOwnTierSchema.safeParse('platform').success).toBe(false);
  });

  it('workspace files reject preset and accept the old tiers', () => {
    const base = {
      agentId: null,
      ownerId: null,
      path: 'a.md',
      content: null,
      isCustomized: false,
      updatedAt: '2026-11-06T10:00:00Z',
    };
    expect(WorkspaceFileSchema.safeParse({ ...base, tier: 'preset' }).success).toBe(false);
    for (const tier of ['platform', 'owner', 'agent']) {
      expect(WorkspaceFileSchema.safeParse({ ...base, tier }).success).toBe(true);
    }
  });

  it('every tier saved today still parses', () => {
    for (const tier of ['platform', 'owner', 'agent']) {
      expect(VaultTierSchema.safeParse(tier).success).toBe(true);
    }
  });

  it('a read entry may come from the preset', () => {
    const r = VaultEntryPlainSchema.safeParse({
      id: 1,
      key: 'OPENAI_API_KEY',
      value: 'plain',
      isSecret: false,
      isCustomized: false,
      tier: 'preset',
      agentId: null,
      ownerId: 1,
    });
    expect(r.success).toBe(true);
  });
});
