"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaultTierSchema = exports.VAULT_TIERS = void 0;
exports.compareTiers = compareTiers;
const zod_1 = require("zod");
/**
 * 3-tier vault cascade. Order matches priority (lower index = lower priority):
 * platform < owner < agent. Agent tier overrides the other two.
 *
 * @see forge-v2/services/vault/src/repositories/vault.repo.ts:5
 * @see forge-v2/services/vault/src/services/vault.service.ts:258 ("Merge: later tiers override earlier tiers")
 */
exports.VAULT_TIERS = ['platform', 'owner', 'agent'];
exports.VaultTierSchema = zod_1.z.enum(exports.VAULT_TIERS);
/**
 * Compare two tiers by cascade priority. Returns -1 if `a` has lower priority than `b`,
 * 0 if equal, 1 if higher. Higher priority = overrides lower.
 *
 * Example: compareTiers('platform','agent') === -1.
 *
 * @see VAULT_TIERS for the priority order.
 */
function compareTiers(a, b) {
    const ai = exports.VAULT_TIERS.indexOf(a);
    const bi = exports.VAULT_TIERS.indexOf(b);
    if (ai < bi)
        return -1;
    if (ai > bi)
        return 1;
    return 0;
}
//# sourceMappingURL=vault-tier.js.map