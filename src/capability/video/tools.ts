import { z } from 'zod';
import { CapabilityAgentScopeSchema } from '../capability-call-identity.js';
import { VideoBriefRequestSchema, VideoModeSchema, VideoPresetIdSchema, VideoProjectIdSchema, VideoProjectStateSchema } from './brief.js';

/**
 * What the model writes when an agent calls `video_brief_create`: the brief without identity.
 * Tenant, owner and agent come only from the tool envelope agent-core admitted (R-33), never from the model.
 */
export const VideoBriefToolInputSchema = VideoBriefRequestSchema.omit({ identity: true, requestedBy: true }).extend({
  requestedBy: VideoBriefRequestSchema.shape.requestedBy.optional(),
}).strict();
export type VideoBriefToolInput = z.infer<typeof VideoBriefToolInputSchema>;

/** What the model writes when an agent calls `video_project_get`. */
export const VideoProjectGetToolInputSchema = z.object({ projectId: VideoProjectIdSchema }).strict();
export type VideoProjectGetToolInput = z.infer<typeof VideoProjectGetToolInputSchema>;

/** Production step inside a project state, for people and agents reading the project. */
export const VideoProjectStepSchema = z.enum([
  'queued', 'plan', 'frames', 'review_sent', 'clips', 'assemble', 'delivery_sent', 'done', 'failed',
  // Presets with a face or a pure infographic: the regia session writes script and graphic, the engine produces the story.
  'regia', 'story',
]);
export type VideoProjectStep = z.infer<typeof VideoProjectStepSchema>;

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
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
}).strict();
export type VideoProjectView = z.infer<typeof VideoProjectViewSchema>;
