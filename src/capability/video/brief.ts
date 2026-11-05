import { z } from 'zod';
import { CapabilityAgentScopeSchema } from '../capability-call-context.js';
import { VideoFootageChoiceSchema } from './footage.js';

export const VideoModeSchema = z.enum(['approval', 'autonomous']);
export type VideoMode = z.infer<typeof VideoModeSchema>;

export const VideoPresetIdSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/);
export type VideoPresetId = z.infer<typeof VideoPresetIdSchema>;

export const VideoAspectRatioSchema = z.enum(['9:16', '16:9', '1:1']);
export type VideoAspectRatio = z.infer<typeof VideoAspectRatioSchema>;

export const VideoResolutionSchema = z.enum(['480p', '720p', '1080p']);
export type VideoResolution = z.infer<typeof VideoResolutionSchema>;

/** Id of a voice of the preset catalogue (e.g. `stefano-pro`, `marco`), never the provider's id. */
export const VideoVoiceIdSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/);
export type VideoVoiceId = z.infer<typeof VideoVoiceIdSchema>;

export const VIDEO_DURATION_SECONDS_MIN = 5;
export const VIDEO_DURATION_SECONDS_MAX = 180;
export const VideoDurationSecondsSchema = z
  .number()
  .int()
  .min(VIDEO_DURATION_SECONDS_MIN)
  .max(VIDEO_DURATION_SECONDS_MAX);
export type VideoDurationSeconds = z.infer<typeof VideoDurationSecondsSchema>;

/** The choices of one request, already resolved with the preset (null: the preset has no such choice). */
export const VideoRequestChoicesSchema = z.strictObject({
  voice: VideoVoiceIdSchema.nullable(),
  aspectRatio: VideoAspectRatioSchema,
  durationSeconds: VideoDurationSecondsSchema,
  resolution: VideoResolutionSchema.nullable(),
});
export type VideoRequestChoices = z.infer<typeof VideoRequestChoicesSchema>;

export const VideoBriefRequestSchema = z.object({
  identity: CapabilityAgentScopeSchema,
  requestedBy: z.string().min(1).max(256),
  approverEmail: z.email(),
  presetId: VideoPresetIdSchema,
  mode: VideoModeSchema,
  budgetUsd: z.number().positive().finite(),
  brief: z.string().min(1).max(6000),
  externalRef: z.string().max(256).optional(),
  /** The shot(s) of the archive the person chose (1-2 ids of the same place); absent: the regia chooses. */
  footage: VideoFootageChoiceSchema.optional(),
  /** Per-request choices within the preset's limits; absent: the preset's defaults. */
  voice: VideoVoiceIdSchema.optional(),
  aspectRatio: VideoAspectRatioSchema.optional(),
  durationSeconds: VideoDurationSecondsSchema.optional(),
  resolution: VideoResolutionSchema.optional(),
}).strict();
export type VideoBriefRequest = z.infer<typeof VideoBriefRequestSchema>;

export const VideoProjectIdSchema = z.string().min(1).max(100);
export type VideoProjectId = z.infer<typeof VideoProjectIdSchema>;

export const VideoProjectStateSchema = z.enum([
  'created', 'planning', 'awaiting_approval', 'producing', 'delivered', 'failed',
]);
export type VideoProjectState = z.infer<typeof VideoProjectStateSchema>;

export const VideoBriefResponseSchema = z.object({
  projectId: VideoProjectIdSchema,
  state: VideoProjectStateSchema,
  identity: CapabilityAgentScopeSchema,
  presetId: VideoPresetIdSchema,
  mode: VideoModeSchema,
  budgetUsd: z.number().positive().finite(),
}).strict();
export type VideoBriefResponse = z.infer<typeof VideoBriefResponseSchema>;
