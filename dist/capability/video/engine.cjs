"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoProjectGetRequestSchema = exports.VideoEngineJobResponseSchema = exports.VideoEngineJobSchema = exports.VideoEngineSettingsSchema = exports.VideoProviderSchema = void 0;
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
//# sourceMappingURL=engine.js.map