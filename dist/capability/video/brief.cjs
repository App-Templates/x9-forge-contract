"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoBriefResponseSchema = exports.VideoProjectStateSchema = exports.VideoProjectIdSchema = exports.VideoBriefRequestSchema = exports.VideoPresetIdSchema = exports.VideoModeSchema = void 0;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
exports.VideoModeSchema = zod_1.z.enum(['approval', 'autonomous']);
exports.VideoPresetIdSchema = zod_1.z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/);
exports.VideoBriefRequestSchema = zod_1.z.object({
    identity: capability_call_context_js_1.CapabilityAgentScopeSchema,
    requestedBy: zod_1.z.string().min(1).max(256),
    approverEmail: zod_1.z.email(),
    presetId: exports.VideoPresetIdSchema,
    mode: exports.VideoModeSchema,
    budgetUsd: zod_1.z.number().positive().finite(),
    brief: zod_1.z.string().min(1).max(6000),
    externalRef: zod_1.z.string().max(256).optional(),
}).strict();
exports.VideoProjectIdSchema = zod_1.z.string().min(1).max(100);
exports.VideoProjectStateSchema = zod_1.z.enum([
    'created', 'planning', 'awaiting_approval', 'producing', 'delivered', 'failed',
]);
exports.VideoBriefResponseSchema = zod_1.z.object({
    projectId: exports.VideoProjectIdSchema,
    state: exports.VideoProjectStateSchema,
    identity: capability_call_context_js_1.CapabilityAgentScopeSchema,
    presetId: exports.VideoPresetIdSchema,
    mode: exports.VideoModeSchema,
    budgetUsd: zod_1.z.number().positive().finite(),
}).strict();
//# sourceMappingURL=brief.js.map