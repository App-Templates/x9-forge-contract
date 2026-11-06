"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaultGenericTierSchema = exports.VAULT_GENERIC_TIERS = exports.VaultCascadeTierSchema = exports.VAULT_CASCADE_TIERS = exports.VaultTierSchema = exports.VAULT_TIERS = void 0;
exports.compareTiers = compareTiers;
const zod_1 = require("zod");
/**
 * 3-tier vault, as saved and read by every consumer today. Order matches
 * priority (lower index = lower priority): platform < owner < agent.
 *
 * @see forge-v2/services/vault/src/repositories/vault.repo.ts:5
 * @see forge-v2/services/vault/src/services/vault.service.ts:258 ("Merge: later tiers override earlier tiers")
 */
exports.VAULT_TIERS = ['platform', 'owner', 'agent'];
exports.VaultTierSchema = zod_1.z.enum(exports.VAULT_TIERS);
/**
 * Cascade levels: the 3 vault tiers plus `preset`, which sits between owner
 * and agent. Only the cascade (and the preset routes) know `preset`.
 */
exports.VAULT_CASCADE_TIERS = ['platform', 'owner', 'preset', 'agent'];
exports.VaultCascadeTierSchema = zod_1.z.enum(exports.VAULT_CASCADE_TIERS);
/**
 * Tiers the generic vault routes write (same as `VAULT_TIERS`, kept exported
 * for compatibility with 1.103.0).
 */
exports.VAULT_GENERIC_TIERS = exports.VAULT_TIERS;
exports.VaultGenericTierSchema = zod_1.z.enum(exports.VAULT_GENERIC_TIERS);
/**
 * Compare two tiers by cascade priority. Returns -1 if `a` has lower priority than `b`,
 * 0 if equal, 1 if higher. Higher priority = overrides lower.
 *
 * Example: compareTiers('platform','agent') === -1.
 *
 * @see VAULT_CASCADE_TIERS for the priority order.
 */
function compareTiers(a, b) {
    const ai = exports.VAULT_CASCADE_TIERS.indexOf(a);
    const bi = exports.VAULT_CASCADE_TIERS.indexOf(b);
    if (ai < bi)
        return -1;
    if (ai > bi)
        return 1;
    return 0;
}
//# sourceMappingURL=vault-tier.js.map