/**
 * Vault domain — cross-repo contracts for 3-tier vault + workspace files.
 *
 * Sub-path: `@x9-forge/contracts/vault`.
 *
 * @module @x9-forge/contracts/vault
 * @see .planning/phases/05-vault-contracts-block-e/05-RESEARCH.md
 */
export { VaultTierSchema, VAULT_TIERS, VaultCascadeTierSchema, VAULT_CASCADE_TIERS, VaultGenericTierSchema, VAULT_GENERIC_TIERS, compareTiers, } from "./vault-tier.cjs";
export type { VaultTier, VaultCascadeTier, VaultGenericTier } from "./vault-tier.cjs";
export { VaultSyncStateSchema, VAULT_SYNC_STATES, toSyncState } from "./vault-sync-state.cjs";
export type { VaultSyncState } from "./vault-sync-state.cjs";
export { AES_WIRE_FORMAT_REGEX, VaultEntryPlainSchema, VaultEntryEncryptedSchema, VaultCascadeEntryPlainSchema, presetScopeIssues, } from "./vault-entry.cjs";
export type { VaultEntryPlain, VaultEntryEncrypted, VaultCascadeEntryPlain } from "./vault-entry.cjs";
export { VaultResolvedEntrySchema, VaultResolvedResponseSchema, resolvedEntryRef, internalVaultResolvedContract, vaultResolvedPath, PRIMARY_FORGE_PROVIDER_KEYS, } from "./vault-resolved.cjs";
export type { VaultResolvedEntry, VaultResolvedResponse } from "./vault-resolved.cjs";
export { SyncAgentResultSchema, SyncAllRequestSchema, SyncAllResponseSchema, SyncAllErrorResponseSchema, syncAllContract, } from "./vault-sync-event.cjs";
export type { SyncAgentResult, SyncAllRequest, SyncAllResponse, SyncAllErrorResponse, VaultSyncEvent, } from "./vault-sync-event.cjs";
export { WorkspaceFileSchema } from "./workspace-file.cjs";
export type { WorkspaceFile } from "./workspace-file.cjs";
export type { PlatformBootstrapEnv } from "./platform-bootstrap-env.cjs";
export { PLATFORM_INTERNAL_CREDENTIAL_KEYS, isPlatformInternalCredentialKey, stripPlatformInternalCredentials, } from "./platform-internal-credentials.cjs";
export type { PlatformInternalCredentialKey } from "./platform-internal-credentials.cjs";
export { CONNECTION_CREDENTIAL_KEY_PREFIX, CONNECT_VAULT_SECRET_ENV, connectionCredentialKey, isConnectionCredentialKey, } from "./connection-credential-keys.cjs";
export { AgentVaultedCredentialsSchema } from "./agent-vaulted-credentials.cjs";
export type { AgentVaultedCredentials } from "./agent-vaulted-credentials.cjs";
export * from "./credential-link.cjs";
export { CredentialSourceIdSchema, credentialSourceOf, CredentialVersionRefSchema, compareCredentialVersions, } from "./credential-source.cjs";
export type { CredentialSourceId, CredentialVersionRef } from "./credential-source.cjs";
//# sourceMappingURL=index.d.ts.map