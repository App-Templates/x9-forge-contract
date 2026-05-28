"use strict";
/**
 * Vault domain — cross-repo contracts for 3-tier vault + workspace files.
 *
 * Sub-path: `@x9-forge/contracts/vault`.
 *
 * @module @x9-forge/contracts/vault
 * @see .planning/phases/05-vault-contracts-block-e/05-RESEARCH.md
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentVaultedCredentialsSchema = exports.WorkspaceFileSchema = exports.syncAllContract = exports.SyncAllErrorResponseSchema = exports.SyncAllResponseSchema = exports.SyncAllRequestSchema = exports.SyncAgentResultSchema = exports.VaultEntryEncryptedSchema = exports.VaultEntryPlainSchema = exports.AES_WIRE_FORMAT_REGEX = exports.toSyncState = exports.VAULT_SYNC_STATES = exports.VaultSyncStateSchema = exports.compareTiers = exports.VAULT_TIERS = exports.VaultTierSchema = void 0;
// Tier
var vault_tier_js_1 = require("./vault-tier.cjs");
Object.defineProperty(exports, "VaultTierSchema", { enumerable: true, get: function () { return vault_tier_js_1.VaultTierSchema; } });
Object.defineProperty(exports, "VAULT_TIERS", { enumerable: true, get: function () { return vault_tier_js_1.VAULT_TIERS; } });
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
// Vaulted credentials alias (re-export of Phase 2 AgentCredentials)
var agent_vaulted_credentials_js_1 = require("./agent-vaulted-credentials.cjs");
Object.defineProperty(exports, "AgentVaultedCredentialsSchema", { enumerable: true, get: function () { return agent_vaulted_credentials_js_1.AgentVaultedCredentialsSchema; } });
//# sourceMappingURL=index.js.map