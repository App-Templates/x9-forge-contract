import { z } from 'zod';
import { CapabilityAgentScopeSchema } from "../capability-call-context.js";
import { VideoBriefRequestSchema, VideoModeSchema, VideoPresetIdSchema, VideoProjectIdSchema } from "./brief.js";
export const VideoProviderSchema = z.enum(['demo', 'minimax', 'fal', 'byteplus']);
export const VideoEngineSettingsSchema = z.object({
    aspectRatio: z.enum(['9:16', '16:9', '1:1']),
    provider: VideoProviderSchema,
    durationSeconds: z.number().int().positive(),
    sceneCount: z.number().int().positive(),
    planner: z.string().min(1).max(64).optional(),
    renderer: z.enum(['ffmpeg', 'remotion']).optional(),
    frameProvider: VideoProviderSchema.optional(),
    audioSource: z.enum(['none', 'track', 'native', 'mix']).optional(),
}).strict();
/** One decided production job: the TypeScript facade owns identity, preset, budget and mode. */
export const VideoEngineJobSchema = z.object({
    videoProjectId: VideoProjectIdSchema,
    identity: CapabilityAgentScopeSchema,
    requestedBy: VideoBriefRequestSchema.shape.requestedBy,
    presetId: VideoPresetIdSchema,
    settings: VideoEngineSettingsSchema,
    budgetUsd: VideoBriefRequestSchema.shape.budgetUsd,
    mode: VideoModeSchema,
    name: z.string().min(1).max(200),
    brief: VideoBriefRequestSchema.shape.brief,
    externalRef: VideoBriefRequestSchema.shape.externalRef,
}).strict();
export const VideoEngineJobResponseSchema = z.object({
    engineProjectId: z.string().min(1).max(100),
    status: z.string().min(1).max(64),
}).strict();
export const VideoProjectGetRequestSchema = z.object({
    identity: CapabilityAgentScopeSchema,
    projectId: VideoProjectIdSchema,
}).strict();
//# sourceMappingURL=engine.js.map