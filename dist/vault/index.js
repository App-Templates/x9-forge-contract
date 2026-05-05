/**
 * Vault domain — cross-repo contracts for 3-tier vault + workspace files.
 *
 * Sub-path: `@x9-forge/contracts/vault`.
 *
 * @module @x9-forge/contracts/vault
 * @see .planning/phases/05-vault-contracts-block-e/05-RESEARCH.md
 */
// Tier
export { VaultTierSchema, VAULT_TIERS, compareTiers } from "./vault-tier.js";
// Sync state
export { VaultSyncStateSchema, VAULT_SYNC_STATES, toSyncState } from "./vault-sync-state.js";
// Entries
export { AES_WIRE_FORMAT_REGEX, VaultEntryPlainSchema, VaultEntryEncryptedSchema, } from "./vault-entry.js";
// Sync event
export { SyncAgentResultSchema, SyncAllRequestSchema, SyncAllResponseSchema, SyncAllErrorResponseSchema, syncAllContract, } from "./vault-sync-event.js";
// Workspace file
export { WorkspaceFileSchema } from "./workspace-file.js";
// Vaulted credentials alias (re-export of Phase 2 AgentCredentials)
export { AgentVaultedCredentialsSchema } from "./agent-vaulted-credentials.js";
//# sourceMappingURL=index.js.map