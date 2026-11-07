"use strict";
/**
 * Vault domain — cross-repo contracts for 3-tier vault + workspace files.
 *
 * Sub-path: `@x9-forge/contracts/vault`.
 *
 * @module @x9-forge/contracts/vault
 * @see .planning/phases/05-vault-contracts-block-e/05-RESEARCH.md
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.credentialVersionRevoked = exports.withinRevocationThreshold = exports.compareCredentialVersions = exports.CredentialVersionThresholdSchema = exports.CredentialVersionRefSchema = exports.credentialSourceOf = exports.CredentialSourceIdSchema = exports.AgentVaultedCredentialsSchema = exports.isConnectionCredentialKey = exports.connectionCredentialKey = exports.CONNECT_VAULT_SECRET_ENV = exports.CONNECTION_CREDENTIAL_KEY_PREFIX = exports.stripPlatformInternalCredentials = exports.isPlatformInternalCredentialKey = exports.PLATFORM_INTERNAL_CREDENTIAL_KEYS = exports.WorkspaceFileSchema = exports.syncAllContract = exports.SyncAllErrorResponseSchema = exports.SyncAllResponseSchema = exports.SyncAllRequestSchema = exports.SyncAgentResultSchema = exports.PRIMARY_FORGE_PROVIDER_KEYS = exports.vaultResolvedPath = exports.internalVaultResolvedContract = exports.resolvedEntryRef = exports.VaultResolvedResponseSchema = exports.VaultResolvedEntrySchema = exports.presetScopeIssues = exports.VaultCascadeEntryPlainSchema = exports.VaultEntryEncryptedSchema = exports.VaultEntryPlainSchema = exports.AES_WIRE_FORMAT_REGEX = exports.toSyncState = exports.VAULT_SYNC_STATES = exports.VaultSyncStateSchema = exports.compareTiers = exports.VAULT_GENERIC_TIERS = exports.VaultGenericTierSchema = exports.VAULT_CASCADE_TIERS = exports.VaultCascadeTierSchema = exports.VAULT_TIERS = exports.VaultTierSchema = void 0;
// Tier
var vault_tier_js_1 = require("./vault-tier.cjs");
Object.defineProperty(exports, "VaultTierSchema", { enumerable: true, get: function () { return vault_tier_js_1.VaultTierSchema; } });
Object.defineProperty(exports, "VAULT_TIERS", { enumerable: true, get: function () { return vault_tier_js_1.VAULT_TIERS; } });
Object.defineProperty(exports, "VaultCascadeTierSchema", { enumerable: true, get: function () { return vault_tier_js_1.VaultCascadeTierSchema; } });
Object.defineProperty(exports, "VAULT_CASCADE_TIERS", { enumerable: true, get: function () { return vault_tier_js_1.VAULT_CASCADE_TIERS; } });
Object.defineProperty(exports, "VaultGenericTierSchema", { enumerable: true, get: function () { return vault_tier_js_1.VaultGenericTierSchema; } });
Object.defineProperty(exports, "VAULT_GENERIC_TIERS", { enumerable: true, get: function () { return vault_tier_js_1.VAULT_GENERIC_TIERS; } });
Object.defineProperty(exports, "compareTiers", { enumerable: true, get: function () { return vault_tier_js_1.compareTiers; } });
// Sync state
var vault_sync_state_js_1 = require("./vault-sync-state.cjs");
Object.defineProperty(exports, "VaultSyncStateSchema", { enumerable: true, get: function () { return vault_sync_state_js_1.VaultSyncStateSchema; } });
Object.defineProperty(exports, "VAULT_SYNC_STATES", { enumerable: true, get: function () { return vault_sync_state_js_1.VAULT_SYNC_STATES; } });
Object.defineProperty(exports, "toSyncState", { enumerable: true, get: function () { return vault_sync_state_js_1.toSyncState; } });
// Entries
var vault_entry_js_1 = require("./vault-entry.cjs");
Object.defineProperty(exports, "AES_WIRE_FORMAT_REGEX", { enumerable: true, get: function () { return vault_entry_js_1.AES_WIRE_FORMAT_REGEX; } });
Object.defineProperty(exports, "VaultEntryPlainSchema", { enumerable: true, get: function () { return vault_entry_js_1.VaultEntryPlainSchema; } });
Object.defineProperty(exports, "VaultEntryEncryptedSchema", { enumerable: true, get: function () { return vault_entry_js_1.VaultEntryEncryptedSchema; } });
Object.defineProperty(exports, "VaultCascadeEntryPlainSchema", { enumerable: true, get: function () { return vault_entry_js_1.VaultCascadeEntryPlainSchema; } });
Object.defineProperty(exports, "presetScopeIssues", { enumerable: true, get: function () { return vault_entry_js_1.presetScopeIssues; } });
// Resolved agent credentials
var vault_resolved_js_1 = require("./vault-resolved.cjs");
Object.defineProperty(exports, "VaultResolvedEntrySchema", { enumerable: true, get: function () { return vault_resolved_js_1.VaultResolvedEntrySchema; } });
Object.defineProperty(exports, "VaultResolvedResponseSchema", { enumerable: true, get: function () { return vault_resolved_js_1.VaultResolvedResponseSchema; } });
Object.defineProperty(exports, "resolvedEntryRef", { enumerable: true, get: function () { return vault_resolved_js_1.resolvedEntryRef; } });
Object.defineProperty(exports, "internalVaultResolvedContract", { enumerable: true, get: function () { return vault_resolved_js_1.internalVaultResolvedContract; } });
Object.defineProperty(exports, "vaultResolvedPath", { enumerable: true, get: function () { return vault_resolved_js_1.vaultResolvedPath; } });
Object.defineProperty(exports, "PRIMARY_FORGE_PROVIDER_KEYS", { enumerable: true, get: function () { return vault_resolved_js_1.PRIMARY_FORGE_PROVIDER_KEYS; } });
// Sync event
var vault_sync_event_js_1 = require("./vault-sync-event.cjs");
Object.defineProperty(exports, "SyncAgentResultSchema", { enumerable: true, get: function () { return vault_sync_event_js_1.SyncAgentResultSchema; } });
Object.defineProperty(exports, "SyncAllRequestSchema", { enumerable: true, get: function () { return vault_sync_event_js_1.SyncAllRequestSchema; } });
Object.defineProperty(exports, "SyncAllResponseSchema", { enumerable: true, get: function () { return vault_sync_event_js_1.SyncAllResponseSchema; } });
Object.defineProperty(exports, "SyncAllErrorResponseSchema", { enumerable: true, get: function () { return vault_sync_event_js_1.SyncAllErrorResponseSchema; } });
Object.defineProperty(exports, "syncAllContract", { enumerable: true, get: function () { return vault_sync_event_js_1.syncAllContract; } });
// Workspace file
var workspace_file_js_1 = require("./workspace-file.cjs");
Object.defineProperty(exports, "WorkspaceFileSchema", { enumerable: true, get: function () { return workspace_file_js_1.WorkspaceFileSchema; } });
// Platform-internal credentials (platform tier, never projected into a tenant)
var platform_internal_credentials_js_1 = require("./platform-internal-credentials.cjs");
Object.defineProperty(exports, "PLATFORM_INTERNAL_CREDENTIAL_KEYS", { enumerable: true, get: function () { return platform_internal_credentials_js_1.PLATFORM_INTERNAL_CREDENTIAL_KEYS; } });
Object.defineProperty(exports, "isPlatformInternalCredentialKey", { enumerable: true, get: function () { return platform_internal_credentials_js_1.isPlatformInternalCredentialKey; } });
Object.defineProperty(exports, "stripPlatformInternalCredentials", { enumerable: true, get: function () { return platform_internal_credentials_js_1.stripPlatformInternalCredentials; } });
// Agent-only connection credential keys
var connection_credential_keys_js_1 = require("./connection-credential-keys.cjs");
Object.defineProperty(exports, "CONNECTION_CREDENTIAL_KEY_PREFIX", { enumerable: true, get: function () { return connection_credential_keys_js_1.CONNECTION_CREDENTIAL_KEY_PREFIX; } });
Object.defineProperty(exports, "CONNECT_VAULT_SECRET_ENV", { enumerable: true, get: function () { return connection_credential_keys_js_1.CONNECT_VAULT_SECRET_ENV; } });
Object.defineProperty(exports, "connectionCredentialKey", { enumerable: true, get: function () { return connection_credential_keys_js_1.connectionCredentialKey; } });
Object.defineProperty(exports, "isConnectionCredentialKey", { enumerable: true, get: function () { return connection_credential_keys_js_1.isConnectionCredentialKey; } });
// Vaulted credentials alias (re-export of Phase 2 AgentCredentials)
var agent_vaulted_credentials_js_1 = require("./agent-vaulted-credentials.cjs");
Object.defineProperty(exports, "AgentVaultedCredentialsSchema", { enumerable: true, get: function () { return agent_vaulted_credentials_js_1.AgentVaultedCredentialsSchema; } });
// Keys linked to the Master Chief: provenance, versions, rotate/relink/unlink outcomes (R3, v1.31.0)
__exportStar(require("./credential-link.cjs"), exports);
// Credential sources and counters scoped to one source
var credential_source_js_1 = require("./credential-source.cjs");
Object.defineProperty(exports, "CredentialSourceIdSchema", { enumerable: true, get: function () { return credential_source_js_1.CredentialSourceIdSchema; } });
Object.defineProperty(exports, "credentialSourceOf", { enumerable: true, get: function () { return credential_source_js_1.credentialSourceOf; } });
Object.defineProperty(exports, "CredentialVersionRefSchema", { enumerable: true, get: function () { return credential_source_js_1.CredentialVersionRefSchema; } });
Object.defineProperty(exports, "CredentialVersionThresholdSchema", { enumerable: true, get: function () { return credential_source_js_1.CredentialVersionThresholdSchema; } });
Object.defineProperty(exports, "compareCredentialVersions", { enumerable: true, get: function () { return credential_source_js_1.compareCredentialVersions; } });
Object.defineProperty(exports, "withinRevocationThreshold", { enumerable: true, get: function () { return credential_source_js_1.withinRevocationThreshold; } });
Object.defineProperty(exports, "credentialVersionRevoked", { enumerable: true, get: function () { return credential_source_js_1.credentialVersionRevoked; } });
//# sourceMappingURL=index.js.map