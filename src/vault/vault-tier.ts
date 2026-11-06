import { z } from 'zod';

/**
 * 4-tier vault cascade. Order matches priority (lower index = lower priority):
 * platform < owner < preset < agent. Agent tier overrides the other three.
 *
 * @see forge-v2/services/vault/src/repositories/vault.repo.ts:5
 * @see forge-v2/services/vault/src/services/vault.service.ts:258 ("Merge: later tiers override earlier tiers")
 */
export const VAULT_TIERS = ['platform', 'owner', 'preset', 'agent'] as const;

export const VaultTierSchema = z.enum(VAULT_TIERS);

export type VaultTier = z.infer<typeof VaultTierSchema>;

/**
 * Tiers the generic vault routes write: `preset` is written only by the preset
 * routes, with its `presetId`.
 */
export const VAULT_GENERIC_TIERS = ['platform', 'owner', 'agent'] as const;

export const VaultGenericTierSchema = z.enum(VAULT_GENERIC_TIERS);

export type VaultGenericTier = z.infer<typeof VaultGenericTierSchema>;

/**
 * Compare two tiers by cascade priority. Returns -1 if `a` has lower priority than `b`,
 * 0 if equal, 1 if higher. Higher priority = overrides lower.
 *
 * Example: compareTiers('platform','agent') === -1.
 *
 * @see VAULT_TIERS for the priority order.
 */
export function compareTiers(a: VaultTier, b: VaultTier): -1 | 0 | 1 {
  const ai = VAULT_TIERS.indexOf(a);
  const bi = VAULT_TIERS.indexOf(b);
  if (ai < bi) return -1;
  if (ai > bi) return 1;
  return 0;
}
