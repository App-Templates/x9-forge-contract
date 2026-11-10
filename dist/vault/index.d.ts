/**
 * Vault domain — cross-repo contracts for 3-tier vault + workspace files.
 *
 * Sub-path: `@x9-forge/contracts/vault`.
 *
 * @module @x9-forge/contracts/vault
 * @see .planning/phases/05-vault-contracts-block-e/05-RESEARCH.md
 */
export { VaultTierSchema, VAULT_TIERS, VaultCascadeTierSchema, VAULT_CASCADE_TIERS, VaultGenericTierSchema, VAULT_GENERIC_TIERS, compareTiers, } from "./vault-tier.js";
export type { VaultTier, VaultCascadeTier, VaultGenericTier } from "./vault-tier.js";
export { VaultSyncStateSchema, VAULT_SYNC_STATES, toSyncState } from "./vault-sync-state.js";
export type { VaultSyncState } from "./vault-sync-state.js";
export { AES_WIRE_FORMAT_REGEX, VaultEntryPlainSchema, VaultEntryEncryptedSchema, VaultCascadeEntryPlainSchema, presetScopeIssues, } from "./vault-entry.js";
export type { VaultEntryPlain, VaultEntryEncrypted, VaultCascadeEntryPlain } from "./vault-entry.js";
export { VaultResolvedEntrySchema, VaultResolvedResponseSchema, resolvedEntryRef, internalVaultResolvedContract, vaultResolvedPath, PRIMARY_FORGE_PROVIDER_KEYS, } from "./vault-resolved.js";
export type { VaultResolvedEntry, VaultResolvedResponse } from "./vault-resolved.js";
export { SyncAgentResultSchema, SyncAllRequestSchema, SyncAllResponseSchema, SyncAllErrorResponseSchema, syncAllContract, } from "./vault-sync-event.js";
export type { SyncAgentResult, SyncAllRequest, SyncAllResponse, SyncAllErrorResponse, VaultSyncEvent, } from "./vault-sync-event.js";
export { WorkspaceFileSchema } from "./workspace-file.js";
export type { WorkspaceFile } from "./workspace-file.js";
export type { PlatformBootstrapEnv } from "./platform-bootstrap-env.js";
export { PLATFORM_INTERNAL_CREDENTIAL_KEYS, isPlatformInternalCredentialKey, stripPlatformInternalCredentials, } from "./platform-internal-credentials.js";
export type { PlatformInternalCredentialKey } from "./platform-internal-credentials.js";
export { OWNER_PERSON_CREDENTIAL_KEYS, isOwnerPersonCredentialKey, stripOwnerPersonCredentials, OWNER_PERSON_VAULT_SECRET_ENV, OwnerPersonCredentialKeySchema, OwnerPersonKeyParamsSchema, OwnerPersonKeyOkResponseSchema, OwnerPersonKeyNotFoundResponseSchema, OwnerPersonKeyResponseSchema, internalVaultOwnerPersonKeyContract, publicVaultOwnerPersonKeyContract, } from "./owner-person-credentials.js";
export type { OwnerPersonCredentialKey, OwnerPersonKeyParams, OwnerPersonKeyOkResponse, OwnerPersonKeyNotFoundResponse, OwnerPersonKeyResponse, } from "./owner-person-credentials.js";
export { CONNECTION_CREDENTIAL_KEY_PREFIX, CONNECT_VAULT_SECRET_ENV, connectionCredentialKey, isConnectionCredentialKey, } from "./connection-credential-keys.js";
export { AgentVaultedCredentialsSchema } from "./agent-vaulted-credentials.js";
export type { AgentVaultedCredentials } from "./agent-vaulted-credentials.js";
export * from "./credential-link.js";
export { CredentialSourceIdSchema, credentialSourceOf, CredentialVersionRefSchema, CredentialVersionThresholdSchema, compareCredentialVersions, withinRevocationThreshold, credentialVersionRevoked, } from "./credential-source.js";
export type { CredentialSourceId, CredentialVersionRef, CredentialVersionThreshold, } from "./credential-source.js";
//# sourceMappingURL=index.d.ts.map