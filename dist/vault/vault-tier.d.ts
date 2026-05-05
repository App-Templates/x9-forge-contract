import { z } from 'zod';
/**
 * 3-tier vault cascade. Order matches priority (lower index = lower priority):
 * platform < owner < agent. Agent tier overrides the other two.
 *
 * @see forge-v2/services/vault/src/repositories/vault.repo.ts:5
 * @see forge-v2/services/vault/src/services/vault.service.ts:258 ("Merge: later tiers override earlier tiers")
 */
export declare const VAULT_TIERS: readonly ["platform", "owner", "agent"];
export declare const VaultTierSchema: z.ZodEnum<{
    platform: "platform";
    owner: "owner";
    agent: "agent";
}>;
export type VaultTier = z.infer<typeof VaultTierSchema>;
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