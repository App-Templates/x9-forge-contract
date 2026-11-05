import { z } from 'zod';
import { CapabilityAgentScopeSchema } from "../capability-call-identity.js";
import { VideoStoryOutroSchema, VideoStoryScenesSchema } from "./story.js";
import { VideoBriefRequestSchema, VideoModeSchema, VideoRequestChoicesSchema, VideoPresetIdSchema, VideoProjectIdSchema, VideoProjectStateSchema } from "./brief.js";
/**
 * What the model writes when an agent calls `video_brief_create`: the brief without identity.
 * Tenant, owner and agent come only from the tool envelope agent-core admitted (R-33), never from the model.
 */
export const VideoBriefToolInputSchema = VideoBriefRequestSchema.omit({ identity: true, requestedBy: true }).extend({
    requestedBy: VideoBriefRequestSchema.shape.requestedBy.optional(),
}).strict();
/** What the model writes when an agent calls `video_project_get`. */
export const VideoProjectGetToolInputSchema = z.object({ projectId: VideoProjectIdSchema }).strict();
/** Revision of the script the regia wrote; a correction is always based on the one the person read. */
export const VideoScriptRevisionSchema = z.number().int().min(1);
/**
 * What the model writes when an agent calls `video_script_revise`: new texts on the revision the person read.
 * No identity (from the envelope, R-33), no footage or graphic (they stay the regia's); absent `outro` keeps the old closing.
 */
export const VideoScriptReviseToolInputSchema = z.strictObject({
    projectId: VideoProjectIdSchema,
    basedOnRevision: VideoScriptRevisionSchema,
    scenes: VideoStoryScenesSchema,
    outro: VideoStoryOutroSchema.optional(),
});
/** Production step inside a project state, for people and agents reading the project. */
export const VideoProjectStepSchema = z.enum([
    'queued', 'plan', 'frames', 'review_sent', 'clips', 'assemble', 'delivery_sent', 'done', 'failed',
    // Presets with a face or a pure infographic: the regia session writes script and graphic, the engine produces the story.
    'regia', 'story',
]);
export const VideoScriptReviseResponseSchema = z.strictObject({
    projectId: VideoProjectIdSchema,
    state: VideoProjectStateSchema,
    step: VideoProjectStepSchema,
    scriptRevision: VideoScriptRevisionSchema,
});
/** One project as the owning agent sees it: state, step and the two links of the two emails. */
export const VideoProjectViewSchema = z.object({
    projectId: VideoProjectIdSchema,
    state: VideoProjectStateSchema,
    step: VideoProjectStepSchema,
    identity: CapabilityAgentScopeSchema,
    presetId: VideoPresetIdSchema,
    mode: VideoModeSchema,
    budgetUsd: z.number().positive().finite(),
    spentUsd: z.number().nonnegative().finite(),
    reviewUrl: z.url().optional(),
    videoUrl: z.url().optional(),
    error: z.string().max(500).optional(),
    /** The choices of the request, resolved with the preset; absent in views written before 1.97.0. */
    choices: VideoRequestChoicesSchema.optional(),
    /** Revision of the script the regia wrote (the person may ask to correct it); absent for presets without regia. */
    scriptRevision: VideoScriptRevisionSchema.optional(),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
}).strict();
//# sourceMappingURL=tools.js.map