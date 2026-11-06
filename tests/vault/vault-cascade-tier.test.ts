import { describe, it, expect } from 'vitest';
import { CredentialOwnTierSchema } from '../../src/vault/credential-link.js';
import {
  VAULT_CASCADE_TIERS,
  VaultCascadeTierSchema,
  VaultTierSchema,
  compareTiers,
} from '../../src/vault/vault-tier.js';

describe('VaultCascadeTierSchema', () => {
  it('orders platform < owner < preset < agent', () => {
    expect(VAULT_CASCADE_TIERS).toEqual(['platform', 'owner', 'preset', 'agent']);
    expect(VaultCascadeTierSchema.safeParse('preset').success).toBe(true);
    expect(VaultCascadeTierSchema.safeParse('tenant').success).toBe(false);
  });

  it('compares preset between owner and agent', () => {
    expect(compareTiers('preset', 'agent')).toBe(-1);
    expect(compareTiers('owner', 'preset')).toBe(-1);
    expect(compareTiers('preset', 'preset')).toBe(0);
  });

  it('VaultTierSchema rifiuta preset', () => {
    expect(VaultTierSchema.safeParse('preset').success).toBe(false);
  });

  it('CredentialOwnTierSchema accepts only owner|agent', () => {
    expect(CredentialOwnTierSchema.options).toEqual(['owner', 'agent']);
  });
});
