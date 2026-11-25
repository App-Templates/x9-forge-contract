import { z } from 'zod';
import { CapabilityAgentScopeSchema } from "../capability-call-identity.js";
import { VideoAspectRatioSchema, VideoPresetIdSchema } from "./brief.js";
import { VideoEngineIdSchema } from "./engine.js";
import { VideoModelIdSchema } from "./modella.js";
import { VideoEnvironmentIdSchema, VideoEnvironmentVersionNumberSchema } from "./ambiente.js";
export const VIDEO_LONG_MIN_SECONDS = 120;
export const VIDEO_LONG_MAX_SECONDS = 1200;
export const VIDEO_LONG_MAX_CHAPTERS = 24;
export const VideoLongProjectIdSchema = VideoEngineIdSchema;
export const VideoLongFamilySchema = z.enum(['essay', 'podcast', 'brand', 'microdrama']);
export const VideoLongStepSchema = z.enum(['bozza', 'ricerca', 'capitoli', 'fotogrammi', 'video']);
export const VideoLongStepStatusSchema = z.enum(['da-fare', 'in-corso', 'da-approvare', 'approvato', 'fallito']);
export const VideoLongStepStateSchema = z.strictObject({
    step: VideoLongStepSchema,
    status: VideoLongStepStatusSchema,
});
/** Query identity shared by all long-project calls. */
export const VideoLongScopeQuerySchema = CapabilityAgentScopeSchema;
const projectFields = {
    name: z.string().min(1).max(200),
    family: VideoLongFamilySchema,
    presetId: VideoPresetIdSchema,
    aspectRatio: VideoAspectRatioSchema,
    durationSeconds: z.number().int().min(VIDEO_LONG_MIN_SECONDS).max(VIDEO_LONG_MAX_SECONDS),
    modelId: VideoModelIdSchema.nullable(),
    brief: z.string().min(1).max(6000),
    budgetUsd: z.number().positive().finite(),
    // The engine checks approved environments, pinned versions and consistent project follow-ups.
    environmentId: VideoEnvironmentIdSchema.optional(),
    environmentVersion: VideoEnvironmentVersionNumberSchema.optional(),
    followsProjectId: VideoLongProjectIdSchema.optional(),
};
export const VideoLongCreateRequestSchema = z.strictObject({
    requestedBy: z.string().min(1).max(256),
    ...projectFields,
});
/** The engine checks cross-field consistency, including step order and uniqueness. */
export const VideoLongProjectSchema = z.strictObject({
    id: VideoLongProjectIdSchema,
    identity: CapabilityAgentScopeSchema,
    ...projectFields,
    steps: z.array(VideoLongStepStateSchema).min(5).max(5),
    createdAt: z.string().min(1).max(40),
});
export const VideoLongProjectListSchema = z.strictObject({
    projects: z.array(VideoLongProjectSchema).max(200),
});
//# sourceMappingURL=lungo.js.map