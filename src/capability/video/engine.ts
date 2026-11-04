import { z } from 'zod';
import { CapabilityAgentScopeSchema } from '../capability-call-context.js';
import { VideoBriefRequestSchema, VideoModeSchema, VideoPresetIdSchema, VideoProjectIdSchema } from './brief.js';

export const VideoEngineErrorSchema = z.object({
  error: z.string().min(1).max(2000),
  operation_state: z.enum(['rejected', 'pending', 'uncertain']).nullish(),
  code: z.string().min(1).max(64).nullish(),
}).strict();
export type VideoEngineError = z.infer<typeof VideoEngineErrorSchema>;

export const VideoEngineHealthSchema = z.object({
  ok: z.boolean(),
  ffmpeg: z.boolean(),
  ffprobe: z.boolean(),
  paid_enabled: z.boolean().optional(),
}).passthrough();
export type VideoEngineHealth = z.infer<typeof VideoEngineHealthSchema>;

export const VideoProviderSchema = z.enum(['demo', 'minimax', 'fal', 'byteplus']);
export type VideoProvider = z.infer<typeof VideoProviderSchema>;

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
export type VideoEngineSettings = z.infer<typeof VideoEngineSettingsSchema>;

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
export type VideoEngineJob = z.infer<typeof VideoEngineJobSchema>;

export const VideoEngineJobResponseSchema = z.object({
  engineProjectId: z.string().min(1).max(100),
  status: z.string().min(1).max(64),
}).strict();
export type VideoEngineJobResponse = z.infer<typeof VideoEngineJobResponseSchema>;

export const VideoProjectGetRequestSchema = z.object({
  identity: CapabilityAgentScopeSchema,
  projectId: VideoProjectIdSchema,
}).strict();
export type VideoProjectGetRequest = z.infer<typeof VideoProjectGetRequestSchema>;

/** Stages the facade drives on the engine, in production order. */
export const VideoEngineRunStageSchema = z.enum(['frames', 'clips', 'assemble']);
export type VideoEngineRunStage = z.infer<typeof VideoEngineRunStageSchema>;
export const VideoEngineApproveStageSchema = z.enum(['plan', 'frames', 'final']);
export type VideoEngineApproveStage = z.infer<typeof VideoEngineApproveStageSchema>;

export const VideoEngineRevisionSchema = z.number().int().min(1);

export const VideoEnginePlanRequestSchema = z.object({}).strict();
export const VideoEngineApproveRequestSchema = z.object({
  stage: VideoEngineApproveStageSchema,
  revision: VideoEngineRevisionSchema,
}).strict();
export type VideoEngineApproveRequest = z.infer<typeof VideoEngineApproveRequestSchema>;
export const VideoEngineRunRequestSchema = z.object({
  stage: VideoEngineRunStageSchema,
  revision: VideoEngineRevisionSchema.optional(),
}).strict();
export type VideoEngineRunRequest = z.infer<typeof VideoEngineRunRequestSchema>;

export const VideoEngineIdSchema = z.string().regex(/^[a-f0-9]{32}$/);

/** Stages the engine route accepts on run; the facade drives a subset (`VideoEngineRunStageSchema`). */
export const VideoEngineRouteRunStageSchema = z.enum(['frames', 'animatic', 'clips', 'assemble', 'voice']);
export type VideoEngineRouteRunStage = z.infer<typeof VideoEngineRouteRunStageSchema>;
/** Stages the engine route accepts on approve; the facade drives a subset (`VideoEngineApproveStageSchema`). */
export const VideoEngineRouteApproveStageSchema = z.enum(['references', 'plan', 'frames', 'final', 'voice']);
export type VideoEngineRouteApproveStage = z.infer<typeof VideoEngineRouteApproveStageSchema>;

/** Whole plan body of the engine route; the facade sends `{}` (`VideoEnginePlanRequestSchema`). */
export const VideoEngineRoutePlanRequestSchema = z.object({
  quote_id: VideoEngineIdSchema.optional(),
  retry_authorization_id: VideoEngineIdSchema.optional(),
  revision: VideoEngineRevisionSchema.optional(),
}).strict();
export type VideoEngineRoutePlanRequest = z.infer<typeof VideoEngineRoutePlanRequestSchema>;

/** Whole approve body of the engine route; the facade body is a subset of it. */
export const VideoEngineRouteApproveRequestSchema = z.object({
  stage: VideoEngineRouteApproveStageSchema,
  revision: VideoEngineRevisionSchema,
}).strict();
export type VideoEngineRouteApproveRequest = z.infer<typeof VideoEngineRouteApproveRequestSchema>;

/**
 * Whole run body of the engine route; the facade body is a subset of it. The uniqueness of `scene_ids`
 * is checked by the engine (`officina/pipeline.py:1730`): no `refine` here, the portable catalog would block it.
 */
export const VideoEngineRouteRunRequestSchema = z.object({
  stage: VideoEngineRouteRunStageSchema,
  scene_ids: z.array(VideoEngineIdSchema).max(32).optional(),
  revision: VideoEngineRevisionSchema.optional(),
  quote_id: VideoEngineIdSchema.optional(),
}).strict();
export type VideoEngineRouteRunRequest = z.infer<typeof VideoEngineRouteRunRequestSchema>;

/** Engine media path served behind the internal secret: `/media/<engineProjectId>/<file>`. */
export const VideoEngineMediaPathSchema = z.string().regex(/^\/media\/[a-f0-9]{32}\/[A-Za-z0-9_-]+\.(png|jpg|jpeg|mp4|mov|srt|wav|mp3|m4a|aac|zip)$/);

export const VideoEngineStoryStatusSchema = z.enum(['queued', 'running', 'completed', 'failed', 'interrupted']);
export type VideoEngineStoryStatus = z.infer<typeof VideoEngineStoryStatusSchema>;

/** Stato della story scritto dal motore (`officina/story_op.py`); gli altri campi passano. */
export const VideoEngineStoryStateSchema = z.object({
  status: VideoEngineStoryStatusSchema,
  step: z.string().max(64).nullish(),
  output_url: VideoEngineMediaPathSchema.nullish(),
  error: z.string().max(1000).nullish(),
}).passthrough();
export type VideoEngineStoryState = z.infer<typeof VideoEngineStoryStateSchema>;

/**
 * The part of an engine project the facade reads. The engine answers with more fields: they pass
 * through untouched (the engine owns its full project document).
 */
export const VideoEngineProjectSchema = z.object({
  id: z.string().regex(/^[a-f0-9]{32}$/),
  status: z.string().min(1).max(64),
  revision: VideoEngineRevisionSchema,
  scenes: z.array(z.object({
    id: z.string().min(1).max(100),
    title: z.string().max(500).optional(),
    narration: z.string().max(6000).optional(),
    frame_prompt: z.string().max(6000).optional(),
    frame_url: VideoEngineMediaPathSchema.nullish(),
    clip_url: VideoEngineMediaPathSchema.nullish(),
  }).passthrough()),
  jobs: z.array(z.object({
    stage: z.string().max(64).optional(),
    status: z.string().max(64).optional(),
    error: z.string().nullish(),
  }).passthrough()),
  output_url: VideoEngineMediaPathSchema.nullish(),
  spent_usd: z.number().nonnegative().optional(),
  story: VideoEngineStoryStateSchema.nullish(),
}).passthrough();
export type VideoEngineProject = z.infer<typeof VideoEngineProjectSchema>;
