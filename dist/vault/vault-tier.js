import { z } from 'zod';
/**
 * 3-tier vault, as saved and read by every consumer today. Order matches
 * priority (lower index = lower priority): platform < owner < agent.
 *
 * @see forge-v2/services/vault/src/repositories/vault.repo.ts:5
 * @see forge-v2/services/vault/src/services/vault.service.ts:258 ("Merge: later tiers override earlier tiers")
 */
export const VAULT_TIERS = ['platform', 'owner', 'agent'];
export const VaultTierSchema = z.enum(VAULT_TIERS);
/**
 * Cascade levels: the 3 vault tiers plus `preset`, which sits between owner
 * and agent. Only the cascade (and the preset routes) know `preset`.
 */
export const VAULT_CASCADE_TIERS = ['platform', 'owner', 'preset', 'agent'];
export const VaultCascadeTierSchema = z.enum(VAULT_CASCADE_TIERS);
/**
 * Tiers the generic vault routes write (same as `VAULT_TIERS`, kept exported
 * for compatibility with 1.103.0).
 */
export const VAULT_GENERIC_TIERS = VAULT_TIERS;
export const VaultGenericTierSchema = z.enum(VAULT_GENERIC_TIERS);
/**
 * Compare two tiers by cascade priority. Returns -1 if `a` has lower priority than `b`,
 * 0 if equal, 1 if higher. Higher priority = overrides lower.
 *
 * Example: compareTiers('platform','agent') === -1.
 *
 * @see VAULT_CASCADE_TIERS for the priority order.
 */
export function compareTiers(a, b) {
    const ai = VAULT_CASCADE_TIERS.indexOf(a);
    const bi = VAULT_CASCADE_TIERS.indexOf(b);
    if (ai < bi)
        return -1;
    if (ai > bi)
        return 1;
    return 0;
}
//# sourceMappingURL=vault-tier.js.map