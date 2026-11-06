import { z } from 'zod';
/**
 * 3-tier vault, as saved and read by every consumer today. Order matches
 * priority (lower index = lower priority): platform < owner < agent.
 *
 * @see forge-v2/services/vault/src/repositories/vault.repo.ts:5
 * @see forge-v2/services/vault/src/services/vault.service.ts:258 ("Merge: later tiers override earlier tiers")
 */
export declare const VAULT_TIERS: readonly ["platform", "owner", "agent"];
export declare const VaultTierSchema: z.ZodEnum<{
    owner: "owner";
    agent: "agent";
    platform: "platform";
}>;
export type VaultTier = z.infer<typeof VaultTierSchema>;
/**
 * Cascade levels: the 3 vault tiers plus `preset`, which sits between owner
 * and agent. Only the cascade (and the preset routes) know `preset`.
 */
export declare const VAULT_CASCADE_TIERS: readonly ["platform", "owner", "preset", "agent"];
export declare const VaultCascadeTierSchema: z.ZodEnum<{
    owner: "owner";
    agent: "agent";
    platform: "platform";
    preset: "preset";
}>;
export type VaultCascadeTier = z.infer<typeof VaultCascadeTierSchema>;
/**
 * Tiers the generic vault routes write (same as `VAULT_TIERS`, kept exported
 * for compatibility with 1.103.0).
 */
export declare const VAULT_GENERIC_TIERS: readonly ["platform", "owner", "agent"];
export declare const VaultGenericTierSchema: z.ZodEnum<{
    owner: "owner";
    agent: "agent";
    platform: "platform";
}>;
export type VaultGenericTier = z.infer<typeof VaultGenericTierSchema>;
/**
 * Compare two tiers by cascade priority. Returns -1 if `a` has lower priority than `b`,
 * 0 if equal, 1 if higher. Higher priority = overrides lower.
 *
 * Example: compareTiers('platform','agent') === -1.
 *
 * @see VAULT_CASCADE_TIERS for the priority order.
 */
export declare function compareTiers(a: VaultCascadeTier, b: VaultCascadeTier): -1 | 0 | 1;
//# sourceMappingURL=vault-tier.d.ts.map