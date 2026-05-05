import { z } from 'zod';
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
export declare const WorkspaceFileSchema: z.ZodObject<{
    agentId: z.ZodNullable<z.ZodNumber>;
    ownerId: z.ZodNullable<z.ZodNumber>;
    tier: z.ZodEnum<{
        platform: "platform";
        owner: "owner";
        agent: "agent";
    }>;
    path: z.ZodString;
    content: z.ZodNullable<z.ZodString>;
    isCustomized: z.ZodBoolean;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export type WorkspaceFile = z.infer<typeof WorkspaceFileSchema>;
//# sourceMappingURL=workspace-file.d.ts.map