"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaultSyncStateSchema = exports.VAULT_SYNC_STATES = void 0;
exports.toSyncState = toSyncState;
const zod_1 = require("zod");
/**
 * UI/docs vocabulary for the 3-tier cascade:
 *   - 'synced'     = value comes from platform or owner tier (defaults)
 *   - 'overridden' = value comes from agent tier (per-agent override)
 *
 * Lossy mapping: `toSyncState` loses the platform↔owner distinction. No
 * `fromSyncState` helper is exported (would be ambiguous). See CONTEXT D-06.
 */
exports.VAULT_SYNC_STATES = ['synced', 'overridden'];
exports.VaultSyncStateSchema = zod_1.z.enum(exports.VAULT_SYNC_STATES);
/**
 * Map a vault tier to its UI sync-state label.
 * platform|owner → 'synced'; agent → 'overridden'.
 */
function toSyncState(tier) {
    return tier === 'agent' ? 'overridden' : 'synced';
}
//# sourceMappingURL=vault-sync-state.js.map