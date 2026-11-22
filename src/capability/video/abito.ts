import { z } from 'zod';
import { CapabilityAgentScopeSchema } from '../capability-call-identity.js';
import { VideoProjectIdSchema } from './brief.js';

export const VIDEO_OUTFIT_MIN_SECONDS = 3;
export const VIDEO_OUTFIT_MAX_SECONDS = 15;
export const VIDEO_OUTFIT_MAX_BYTES = 64 * 1024 * 1024;
export const VIDEO_OUTFIT_MEDIA_TYPES = ['video/mp4', 'video/quicktime'] as const;

/** Same names as the engine's `outfit_adapter.OUTFIT_MODELS`. */
export const VideoOutfitModelSchema = z.enum(['kling-4-edit', 'happy-horse', 'kling-o1-edit']);
export type VideoOutfitModel = z.infer<typeof VideoOutfitModelSchema>;

export const VideoOutfitResolutionSchema = z.enum(['720p', '1080p']);
export type VideoOutfitResolution = z.infer<typeof VideoOutfitResolutionSchema>;

/** The person's own video is the binary body; identity and production metadata are text query values. */
export const VideoOutfitProductionQuerySchema = z.strictObject({
  ...CapabilityAgentScopeSchema.shape,
  videoProjectId: VideoProjectIdSchema,
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(500).optional(),
  model: VideoOutfitModelSchema,
  resolution: VideoOutfitResolutionSchema,
  budgetUsd: z.string().regex(/^(0\.[0-9]{1,2}|[1-9][0-9]{0,2}(\.[0-9]{1,2})?)$/),
  fileName: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9 ()._-]{0,119}\.([mM][pP]4|[mM][oO][vV])$/),
});
export type VideoOutfitProductionQuery = z.infer<typeof VideoOutfitProductionQuerySchema>;

export const VideoOutfitProductionCreatedSchema = z.strictObject({
  engineProjectId: z.string().regex(/^[a-f0-9]{32}$/),
  sourceSha256: z.string().regex(/^[0-9a-f]{64}$/),
  durationSeconds: z.number().min(VIDEO_OUTFIT_MIN_SECONDS).max(VIDEO_OUTFIT_MAX_SECONDS),
});
export type VideoOutfitProductionCreated = z.infer<typeof VideoOutfitProductionCreatedSchema>;
