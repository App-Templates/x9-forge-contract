/**
 * Vault domain — cross-repo contracts for 3-tier vault + workspace files.
 *
 * Sub-path: `@x9-forge/contracts/vault`.
 *
 * @module @x9-forge/contracts/vault
 * @see .planning/phases/05-vault-contracts-block-e/05-RESEARCH.md
 */
// Tier
export { VaultTierSchema, VAULT_TIERS, VaultCascadeTierSchema, VAULT_CASCADE_TIERS, VaultGenericTierSchema, VAULT_GENERIC_TIERS, compareTiers, } from "./vault-tier.js";
// Sync state
export { VaultSyncStateSchema, VAULT_SYNC_STATES, toSyncState } from "./vault-sync-state.js";
// Entries
export { AES_WIRE_FORMAT_REGEX, VaultEntryPlainSchema, VaultEntryEncryptedSchema, VaultCascadeEntryPlainSchema, presetScopeIssues, } from "./vault-entry.js";
// Resolved agent credentials
export { VaultResolvedEntrySchema, VaultResolvedResponseSchema, internalVaultResolvedContract, vaultResolvedPath, PRIMARY_FORGE_PROVIDER_KEYS, } from "./vault-resolved.js";
// Sync event
export { SyncAgentResultSchema, SyncAllRequestSchema, SyncAllResponseSchema, SyncAllErrorResponseSchema, syncAllContract, } from "./vault-sync-event.js";
// Workspace file
export { WorkspaceFileSchema } from "./workspace-file.js";
// Platform-internal credentials (platform tier, never projected into a tenant)
export { PLATFORM_INTERNAL_CREDENTIAL_KEYS, isPlatformInternalCredentialKey, stripPlatformInternalCredentials, } from "./platform-internal-credentials.js";
// Agent-only connection credential keys
export { CONNECTION_CREDENTIAL_KEY_PREFIX, CONNECT_VAULT_SECRET_ENV, connectionCredentialKey, isConnectionCredentialKey, } from "./connection-credential-keys.js";
// Vaulted credentials alias (re-export of Phase 2 AgentCredentials)
export { AgentVaultedCredentialsSchema } from "./agent-vaulted-credentials.js";
// Keys linked to the Master Chief: provenance, versions, rotate/relink/unlink outcomes (R3, v1.31.0)
export * from "./credential-link.js";
// Credential sources and counters scoped to one source
export { CredentialSourceIdSchema, credentialSourceOf, CredentialVersionRefSchema, compareCredentialVersions, } from "./credential-source.js";
//# sourceMappingURL=index.js.map