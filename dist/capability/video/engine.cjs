"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoEngineProjectSchema = exports.VideoEngineMediaPathSchema = exports.VideoEngineRunRequestSchema = exports.VideoEngineApproveRequestSchema = exports.VideoEnginePlanRequestSchema = exports.VideoEngineRevisionSchema = exports.VideoEngineApproveStageSchema = exports.VideoEngineRunStageSchema = exports.VideoProjectGetRequestSchema = exports.VideoEngineJobResponseSchema = exports.VideoEngineJobSchema = exports.VideoEngineSettingsSchema = exports.VideoProviderSchema = void 0;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const brief_js_1 = require("./brief.cjs");
exports.VideoProviderSchema = zod_1.z.enum(['demo', 'minimax', 'fal', 'byteplus']);
exports.VideoEngineSettingsSchema = zod_1.z.object({
    aspectRatio: zod_1.z.enum(['9:16', '16:9', '1:1']),
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
exports.VideoEngineRevisionSchema = zod_1.z.number().int().nonnegative();
exports.VideoEnginePlanRequestSchema = zod_1.z.object({}).strict();
exports.VideoEngineApproveRequestSchema = zod_1.z.object({
    stage: exports.VideoEngineApproveStageSchema,
    revision: exports.VideoEngineRevisionSchema,
}).strict();
exports.VideoEngineRunRequestSchema = zod_1.z.object({
    stage: exports.VideoEngineRunStageSchema,
    revision: exports.VideoEngineRevisionSchema.optional(),
}).strict();
/** Engine media path served behind the internal secret: `/media/<engineProjectId>/<file>`. */
exports.VideoEngineMediaPathSchema = zod_1.z.string().regex(/^\/media\/[a-f0-9]{32}\/[A-Za-z0-9_-]+\.(png|jpg|jpeg|mp4|mov|srt|wav|mp3|m4a|aac|zip)$/);
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
    spent_usd: zod_1.z.number().nonnegative().optional(),
}).passthrough();
//# sourceMappingURL=engine.js.map