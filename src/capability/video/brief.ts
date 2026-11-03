import { z } from 'zod';
import { CapabilityAgentScopeSchema } from '../capability-call-context.js';

export const VideoModeSchema = z.enum(['approval', 'autonomous']);
export type VideoMode = z.infer<typeof VideoModeSchema>;

export const VideoPresetIdSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/);
export type VideoPresetId = z.infer<typeof VideoPresetIdSchema>;

export const VideoBriefRequestSchema = z.object({
  identity: CapabilityAgentScopeSchema,
  requestedBy: z.string().min(1).max(256),
  approverEmail: z.email(),
  presetId: VideoPresetIdSchema,
  mode: VideoModeSchema,
  budgetUsd: z.number().positive().finite(),
  brief: z.string().min(1).max(6000),
  externalRef: z.string().max(256).optional(),
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
