"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceFileSchema = void 0;
const zod_1 = require("zod");
const vault_tier_js_1 = require("./vault-tier.cjs");
/**
 * Workspace file DTO — written to DB by `syncWorkspaceFilesToDB`.
 *
 * Tier semantics reuse `VaultTier` (platform/owner/agent) from the vault.
 * `content` is nullable when the file was unreadable at sync time.
 *
 * NOTE: `agentId` is nullable (aligned with Drizzle `workspace_files.agent_id`)
 * — supersedes CONTEXT D-22 per 05-01-PLAN.md Q2 resolution. Platform-tier
 * workspace files can have `agentId=null`.
 *
 * `path` is workspace-root-relative; opaque string (Forge validates internally).
 *
 * @see forge-v2/services/workspace/src/services/workspace.service.ts:361-389
 * @see forge-v2/packages/db/src/schema.ts workspace_files
 */
exports.WorkspaceFileSchema = zod_1.z.object({
    agentId: zod_1.z.number().int().nullable(),
    ownerId: zod_1.z.number().int().nullable(),
    tier: vault_tier_js_1.VaultTierSchema,
    path: zod_1.z.string().min(1),
    content: zod_1.z.string().nullable(),
    isCustomized: zod_1.z.boolean(),
    updatedAt: zod_1.z.string().datetime({ offset: true }),
});
//# sourceMappingURL=workspace-file.js.map