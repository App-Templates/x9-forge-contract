/**
 * Vault domain — cross-repo contracts for 3-tier vault + workspace files.
 *
 * Sub-path: `@x9-forge/contracts/vault`.
 *
 * @module @x9-forge/contracts/vault
 * @see .planning/phases/05-vault-contracts-block-e/05-RESEARCH.md
 */
export { VaultTierSchema, VAULT_TIERS, compareTiers } from "./vault-tier.cjs";
export type { VaultTier } from "./vault-tier.cjs";
export { VaultSyncStateSchema, VAULT_SYNC_STATES, toSyncState } from "./vault-sync-state.cjs";
export type { VaultSyncState } from "./vault-sync-state.cjs";
export { AES_WIRE_FORMAT_REGEX, VaultEntryPlainSchema, VaultEntryEncryptedSchema, } from "./vault-entry.cjs";
export type { VaultEntryPlain, VaultEntryEncrypted } from "./vault-entry.cjs";
export { SyncAgentResultSchema, SyncAllRequestSchema, SyncAllResponseSchema, SyncAllErrorResponseSchema, syncAllContract, } from "./vault-sync-event.cjs";
export type { SyncAgentResult, SyncAllRequest, SyncAllResponse, SyncAllErrorResponse, VaultSyncEvent, } from "./vault-sync-event.cjs";
export { WorkspaceFileSchema } from "./workspace-file.cjs";
export type { WorkspaceFile } from "./workspace-file.cjs";
export type { PlatformBootstrapEnv } from "./platform-bootstrap-env.cjs";
export { AgentVaultedCredentialsSchema } from "./agent-vaulted-credentials.cjs";
export type { AgentVaultedCredentials } from "./agent-vaulted-credentials.cjs";
//# sourceMappingURL=index.d.ts.map