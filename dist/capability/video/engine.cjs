"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoEngineProjectSchema = exports.VideoEngineStoryStateSchema = exports.VideoEngineStoryStatusSchema = exports.VideoEngineSubtitlesPathSchema = exports.VideoEngineMediaPathSchema = exports.VideoEngineRouteRunRequestSchema = exports.VideoEngineRouteApproveRequestSchema = exports.VideoEngineRoutePlanRequestSchema = exports.VideoEngineRouteApproveStageSchema = exports.VideoEngineRouteRunStageSchema = exports.VideoEngineIdSchema = exports.VideoEngineRunRequestSchema = exports.VideoEngineApproveRequestSchema = exports.VideoEnginePlanRequestSchema = exports.VideoEngineRevisionSchema = exports.VideoEngineApproveStageSchema = exports.VideoEngineRunStageSchema = exports.VideoProjectGetRequestSchema = exports.VideoEngineJobResponseSchema = exports.VideoEngineJobSchema = exports.VideoEngineSettingsSchema = exports.VideoProviderSchema = exports.VideoEngineHealthSchema = exports.VideoEngineErrorSchema = void 0;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const brief_js_1 = require("./brief.cjs");
const episode_js_1 = require("./episode.cjs");
exports.VideoEngineErrorSchema = zod_1.z.object({
    error: zod_1.z.string().min(1).max(2000),
    operation_state: zod_1.z.enum(['rejected', 'pending', 'uncertain']).nullish(),
    code: zod_1.z.string().min(1).max(64).nullish(),
}).strict();
exports.VideoEngineHealthSchema = zod_1.z.object({
    ok: zod_1.z.boolean(),
    ffmpeg: zod_1.z.boolean(),
    ffprobe: zod_1.z.boolean(),
    paid_enabled: zod_1.z.boolean().optional(),
}).passthrough();
exports.VideoProviderSchema = zod_1.z.enum(['demo', 'minimax', 'fal', 'byteplus']);
exports.VideoEngineSettingsSchema = zod_1.z.object({
    aspectRatio: brief_js_1.VideoAspectRatioSchema,
    provider: exports.VideoProviderSchema,
    durationSeconds: zod_1.z.number().int().positive(),
    sceneCount: zod_1.z.number().int().positive(),
    planner: zod_1.z.string().min(1).max(64).optional(),
    renderer: zod_1.z.enum(['ffmpeg', 'remotion']).optional(),
    frameProvider: exports.VideoProviderSchema.optional(),
    audioSource: zod_1.z.enum(['none', 'track', 'native', 'mix']).optional(),
}).strict();
/** One decided production job: the TypeScript facade owns identity, preset, budget and mode. */
exports.VideoEngineJobSchema = zod_1.z.object({
    videoProjectId: brief_js_1.VideoProjectIdSchema,
    identity: capability_call_context_js_1.CapabilityAgentScopeSchema,
    requestedBy: brief_js_1.VideoBriefRequestSchema.shape.requestedBy,
    presetId: brief_js_1.VideoPresetIdSchema,
    settings: exports.VideoEngineSettingsSchema,
    budgetUsd: brief_js_1.VideoBriefRequestSchema.shape.budgetUsd,
    mode: brief_js_1.VideoModeSchema,
    name: zod_1.z.string().min(1).max(200),
    brief: brief_js_1.VideoBriefRequestSchema.shape.brief,
    externalRef: brief_js_1.VideoBriefRequestSchema.shape.externalRef,
    episode: episode_js_1.VideoEpisodeContextSchema.optional(),
}).strict();
exports.VideoEngineJobResponseSchema = zod_1.z.object({
    engineProjectId: zod_1.z.string().min(1).max(100),
    status: zod_1.z.string().min(1).max(64),
}).strict();
exports.VideoProjectGetRequestSchema = zod_1.z.object({
    identity: capability_call_context_js_1.CapabilityAgentScopeSchema,
    projectId: brief_js_1.VideoProjectIdSchema,
}).strict();
/** Stages the facade drives on the engine, in production order. */
exports.VideoEngineRunStageSchema = zod_1.z.enum(['frames', 'clips', 'assemble']);
exports.VideoEngineApproveStageSchema = zod_1.z.enum(['plan', 'frames', 'final']);
exports.VideoEngineRevisionSchema = zod_1.z.number().int().min(1);
exports.VideoEnginePlanRequestSchema = zod_1.z.object({}).strict();
exports.VideoEngineApproveRequestSchema = zod_1.z.object({
    stage: exports.VideoEngineApproveStageSchema,
    revision: exports.VideoEngineRevisionSchema,
}).strict();
exports.VideoEngineRunRequestSchema = zod_1.z.object({
    stage: exports.VideoEngineRunStageSchema,
    revision: exports.VideoEngineRevisionSchema.optional(),
}).strict();
exports.VideoEngineIdSchema = zod_1.z.string().regex(/^[a-f0-9]{32}$/);
/** Stages the engine route accepts on run; the facade drives a subset (`VideoEngineRunStageSchema`). */
exports.VideoEngineRouteRunStageSchema = zod_1.z.enum(['frames', 'animatic', 'clips', 'assemble', 'voice']);
/** Stages the engine route accepts on approve; the facade drives a subset (`VideoEngineApproveStageSchema`). */
exports.VideoEngineRouteApproveStageSchema = zod_1.z.enum(['references', 'plan', 'frames', 'final', 'voice']);
/** Whole plan body of the engine route; the facade sends `{}` (`VideoEnginePlanRequestSchema`). */
exports.VideoEngineRoutePlanRequestSchema = zod_1.z.object({
    quote_id: exports.VideoEngineIdSchema.optional(),
    retry_authorization_id: exports.VideoEngineIdSchema.optional(),
    revision: exports.VideoEngineRevisionSchema.optional(),
}).strict();
/** Whole approve body of the engine route; the facade body is a subset of it. */
exports.VideoEngineRouteApproveRequestSchema = zod_1.z.object({
    stage: exports.VideoEngineRouteApproveStageSchema,
    revision: exports.VideoEngineRevisionSchema,
}).strict();
/**
 * Whole run body of the engine route; the facade body is a subset of it. The uniqueness of `scene_ids`
 * is checked by the engine (`officina/pipeline.py:1730`): no `refine` here, the portable catalog would block it.
 */
exports.VideoEngineRouteRunRequestSchema = zod_1.z.object({
    stage: exports.VideoEngineRouteRunStageSchema,
    scene_ids: zod_1.z.array(exports.VideoEngineIdSchema).max(32).optional(),
    revision: exports.VideoEngineRevisionSchema.optional(),
    quote_id: exports.VideoEngineIdSchema.optional(),
}).strict();
/** Engine media path served behind the internal secret: `/media/<engineProjectId>/<file>`. */
exports.VideoEngineMediaPathSchema = zod_1.z.string().regex(/^\/media\/[a-f0-9]{32}\/[A-Za-z0-9_-]+\.(png|jpg|jpeg|mp4|mov|srt|wav|mp3|m4a|aac|zip)$/);
exports.VideoEngineSubtitlesPathSchema = zod_1.z.string().regex(/^\/media\/[a-f0-9]{32}\/[A-Za-z0-9_-]+\.srt$/);
exports.VideoEngineStoryStatusSchema = zod_1.z.enum(['queued', 'running', 'completed', 'failed', 'interrupted']);
/** Stato della story scritto dal motore (`officina/story_op.py`); gli altri campi passano. */
exports.VideoEngineStoryStateSchema = zod_1.z.object({
    status: exports.VideoEngineStoryStatusSchema,
    step: zod_1.z.string().max(64).nullish(),
    output_url: exports.VideoEngineMediaPathSchema.nullish(),
    subtitles_url: exports.VideoEngineSubtitlesPathSchema.nullish(),
    error: zod_1.z.string().max(1000).nullish(),
}).passthrough();
/**
 * The part of an engine project the facade reads. The engine answers with more fields: they pass
 * through untouched (the engine owns its full project document).
 */
exports.VideoEngineProjectSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^[a-f0-9]{32}$/),
    status: zod_1.z.string().min(1).max(64),
    revision: exports.VideoEngineRevisionSchema,
    scenes: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string().min(1).max(100),
        title: zod_1.z.string().max(500).optional(),
        narration: zod_1.z.string().max(6000).optional(),
        frame_prompt: zod_1.z.string().max(6000).optional(),
        frame_url: exports.VideoEngineMediaPathSchema.nullish(),
        clip_url: exports.VideoEngineMediaPathSchema.nullish(),
    }).passthrough()),
    jobs: zod_1.z.array(zod_1.z.object({
        stage: zod_1.z.string().max(64).optional(),
        status: zod_1.z.string().max(64).optional(),
        error: zod_1.z.string().nullish(),
    }).passthrough()),
    output_url: exports.VideoEngineMediaPathSchema.nullish(),
    subtitles_url: exports.VideoEngineSubtitlesPathSchema.nullish(),
    spent_usd: zod_1.z.number().nonnegative().optional(),
    story: exports.VideoEngineStoryStateSchema.nullish(),
    // Written by the engine: outcome and estimate with the episode plan, portraits at the approved frames.
    episode_outcome: episode_js_1.VideoEpisodeOutcomeSchema.nullish(),
    episode_estimate: episode_js_1.VideoEpisodeEstimateSchema.nullish(),
    episode_portraits: zod_1.z.array(episode_js_1.VideoEpisodePortraitSchema).max(episode_js_1.VIDEO_SERIES_MAX_CHARACTERS).nullish(),
}).passthrough();
//# sourceMappingURL=engine.js.map