import { z } from 'zod';
/**
 * 4-tier vault cascade. Order matches priority (lower index = lower priority):
 * platform < owner < preset < agent. Agent tier overrides the other three.
 *
 * @see forge-v2/services/vault/src/repositories/vault.repo.ts:5
 * @see forge-v2/services/vault/src/services/vault.service.ts:258 ("Merge: later tiers override earlier tiers")
 */
export declare const VAULT_TIERS: readonly ["platform", "owner", "preset", "agent"];
export declare const VaultTierSchema: z.ZodEnum<{
    owner: "owner";
    agent: "agent";
    platform: "platform";
    preset: "preset";
}>;
export type VaultTier = z.infer<typeof VaultTierSchema>;
/**
 * Tiers the generic vault routes write: `preset` is written only by the preset
 * routes, with its `presetId`.
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
 * @see VAULT_TIERS for the priority order.
 */
export declare function compareTiers(a: VaultTier, b: VaultTier): -1 | 0 | 1;
//# sourceMappingURL=vault-tier.d.ts.map