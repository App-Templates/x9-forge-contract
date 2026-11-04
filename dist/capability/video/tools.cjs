"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoProjectViewSchema = exports.VideoProjectStepSchema = exports.VideoProjectGetToolInputSchema = exports.VideoBriefToolInputSchema = void 0;
const zod_1 = require("zod");
const capability_call_identity_js_1 = require("../capability-call-identity.cjs");
const brief_js_1 = require("./brief.cjs");
/**
 * What the model writes when an agent calls `video_brief_create`: the brief without identity.
 * Tenant, owner and agent come only from the tool envelope agent-core admitted (R-33), never from the model.
 */
exports.VideoBriefToolInputSchema = brief_js_1.VideoBriefRequestSchema.omit({ identity: true, requestedBy: true }).extend({
    requestedBy: brief_js_1.VideoBriefRequestSchema.shape.requestedBy.optional(),
}).strict();
/** What the model writes when an agent calls `video_project_get`. */
exports.VideoProjectGetToolInputSchema = zod_1.z.object({ projectId: brief_js_1.VideoProjectIdSchema }).strict();
/** Production step inside a project state, for people and agents reading the project. */
exports.VideoProjectStepSchema = zod_1.z.enum([
    'queued', 'plan', 'frames', 'review_sent', 'clips', 'assemble', 'delivery_sent', 'done', 'failed',
    // Presets with a face or a pure infographic: the regia session writes script and graphic, the engine produces the story.
    'regia', 'story',
]);
/** One project as the owning agent sees it: state, step and the two links of the two emails. */
exports.VideoProjectViewSchema = zod_1.z.object({
    projectId: brief_js_1.VideoProjectIdSchema,
    state: brief_js_1.VideoProjectStateSchema,
    step: exports.VideoProjectStepSchema,
    identity: capability_call_identity_js_1.CapabilityAgentScopeSchema,
    presetId: brief_js_1.VideoPresetIdSchema,
    mode: brief_js_1.VideoModeSchema,
    budgetUsd: zod_1.z.number().positive().finite(),
    spentUsd: zod_1.z.number().nonnegative().finite(),
    reviewUrl: zod_1.z.url().optional(),
    videoUrl: zod_1.z.url().optional(),
    error: zod_1.z.string().max(500).optional(),
    createdAt: zod_1.z.string().min(1),
    updatedAt: zod_1.z.string().min(1),
}).strict();
//# sourceMappingURL=tools.js.map