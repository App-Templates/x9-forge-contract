import { z } from 'zod';
import { CapabilityAgentScopeSchema } from "../capability-call-context.js";
export const VideoModeSchema = z.enum(['approval', 'autonomous']);
export const VideoPresetIdSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/);
export const VideoBriefRequestSchema = z.object({
    identity: CapabilityAgentScopeSchema,
    requestedBy: z.string().min(1).max(256),
    approverEmail: z.email(),
    presetId: VideoPresetIdSchema,
    mode: VideoModeSchema,
    budgetUsd: z.number().positive().finite(),
    brief: z.string().min(1).max(20000),
    externalRef: z.string().max(256).optional(),
}).strict();
export const VideoProjectIdSchema = z.string().min(1).max(100);
export const VideoProjectStateSchema = z.enum([
    'created', 'planning', 'awaiting_approval', 'producing', 'delivered', 'failed',
]);
export const VideoBriefResponseSchema = z.object({
    projectId: VideoProjectIdSchema,
    state: VideoProjectStateSchema,
    identity: CapabilityAgentScopeSchema,
    presetId: VideoPresetIdSchema,
    mode: VideoModeSchema,
    budgetUsd: z.number().positive().finite(),
}).strict();
//# sourceMappingURL=brief.js.map