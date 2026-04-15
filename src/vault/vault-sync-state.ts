import { z } from 'zod';
import type { VaultTier } from './vault-tier.js';

/**
 * UI/docs vocabulary for the 3-tier cascade:
 *   - 'synced'     = value comes from platform or owner tier (defaults)
 *   - 'overridden' = value comes from agent tier (per-agent override)
 *
 * Lossy mapping: `toSyncState` loses the platform↔owner distinction. No
 * `fromSyncState` helper is exported (would be ambiguous). See CONTEXT D-06.
 */
export const VAULT_SYNC_STATES = ['synced', 'overridden'] as const;

export const VaultSyncStateSchema = z.enum(VAULT_SYNC_STATES);

export type VaultSyncState = z.infer<typeof VaultSyncStateSchema>;

/**
 * Map a vault tier to its UI sync-state label.
 * platform|owner → 'synced'; agent → 'overridden'.
 */
export function toSyncState(tier: VaultTier): VaultSyncState {
  return tier === 'agent' ? 'overridden' : 'synced';
}
