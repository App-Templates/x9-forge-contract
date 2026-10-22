import { z } from 'zod';
import { VaultTierSchema } from "./vault-tier.js";
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
export const WorkspaceFileSchema = z.object({
    agentId: z.number().int().nullable(),
    ownerId: z.number().int().nullable(),
    tier: VaultTierSchema,
    path: z.string().min(1),
    content: z.string().nullable(),
    isCustomized: z.boolean(),
    updatedAt: z.string().datetime({ offset: true }),
});
//# sourceMappingURL=workspace-file.js.map