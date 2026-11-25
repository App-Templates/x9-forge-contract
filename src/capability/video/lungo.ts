import { z } from 'zod';
import { CapabilityAgentScopeSchema } from '../capability-call-identity.js';
import { VideoAspectRatioSchema, VideoPresetIdSchema } from './brief.js';
import { VideoEngineIdSchema } from './engine.js';
import { VideoModelIdSchema } from './modella.js';

export const VIDEO_LONG_MIN_SECONDS = 120;
export const VIDEO_LONG_MAX_SECONDS = 1200;
export const VIDEO_LONG_MAX_CHAPTERS = 24;

export const VideoLongProjectIdSchema = VideoEngineIdSchema;
export type VideoLongProjectId = z.infer<typeof VideoLongProjectIdSchema>;

export const VideoLongFamilySchema = z.enum(['essay', 'podcast', 'brand', 'microdrama']);
export type VideoLongFamily = z.infer<typeof VideoLongFamilySchema>;

export const VideoLongStepSchema = z.enum(['bozza', 'ricerca', 'capitoli', 'fotogrammi', 'video']);
export type VideoLongStep = z.infer<typeof VideoLongStepSchema>;

export const VideoLongStepStatusSchema = z.enum(['da-fare', 'in-corso', 'da-approvare', 'approvato', 'fallito']);
export type VideoLongStepStatus = z.infer<typeof VideoLongStepStatusSchema>;

export const VideoLongStepStateSchema = z.strictObject({
  step: VideoLongStepSchema,
  status: VideoLongStepStatusSchema,
});
export type VideoLongStepState = z.infer<typeof VideoLongStepStateSchema>;

/** Query identity shared by all long-project calls. */
export const VideoLongScopeQuerySchema = CapabilityAgentScopeSchema;
export type VideoLongScopeQuery = z.infer<typeof VideoLongScopeQuerySchema>;

const projectFields = {
  name: z.string().min(1).max(200),
  family: VideoLongFamilySchema,
  presetId: VideoPresetIdSchema,
  aspectRatio: VideoAspectRatioSchema,
  durationSeconds: z.number().int().min(VIDEO_LONG_MIN_SECONDS).max(VIDEO_LONG_MAX_SECONDS),
  modelId: VideoModelIdSchema.nullable(),
  brief: z.string().min(1).max(6000),
  budgetUsd: z.number().positive().finite(),
};

export const VideoLongCreateRequestSchema = z.strictObject({
  requestedBy: z.string().min(1).max(256),
  ...projectFields,
});
export type VideoLongCreateRequest = z.infer<typeof VideoLongCreateRequestSchema>;

/** The engine checks cross-field consistency, including step order and uniqueness. */
export const VideoLongProjectSchema = z.strictObject({
  id: VideoLongProjectIdSchema,
  identity: CapabilityAgentScopeSchema,
  ...projectFields,
  steps: z.array(VideoLongStepStateSchema).min(5).max(5),
  createdAt: z.string().min(1).max(40),
});
export type VideoLongProject = z.infer<typeof VideoLongProjectSchema>;

export const VideoLongProjectListSchema = z.strictObject({
  projects: z.array(VideoLongProjectSchema).max(200),
});
export type VideoLongProjectList = z.infer<typeof VideoLongProjectListSchema>;
