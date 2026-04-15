import { describe, it, expect } from 'vitest';
import {
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

  it('rejects unknown tier strings', () => {
    expect(VaultTierSchema.safeParse('tenant').success).toBe(false);
  });
});

describe('VAULT_TIERS', () => {
  it('has the exact priority order [platform, owner, agent]', () => {
    expect(VAULT_TIERS).toEqual(['platform', 'owner', 'agent']);
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

  it('returns 0 when same tier (owner, owner)', () => {
    expect(compareTiers('owner', 'owner')).toBe(0);
  });
});
