"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoProjectViewSchema = exports.VideoScriptReviseResponseSchema = exports.VideoProjectStepSchema = exports.VideoScriptReviseToolInputSchema = exports.VideoScriptRevisionSchema = exports.VideoProjectGetToolInputSchema = exports.VideoBriefToolInputSchema = void 0;
const zod_1 = require("zod");
const capability_call_identity_js_1 = require("../capability-call-identity.cjs");
const story_js_1 = require("./story.cjs");
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
/** Revision of the script the regia wrote; a correction is always based on the one the person read. */
exports.VideoScriptRevisionSchema = zod_1.z.number().int().min(1);
/**
 * What the model writes when an agent calls `video_script_revise`: new texts on the revision the person read.
 * No identity (from the envelope, R-33), no footage or graphic (they stay the regia's); absent `outro` keeps the old closing.
 */
exports.VideoScriptReviseToolInputSchema = zod_1.z.strictObject({
    projectId: brief_js_1.VideoProjectIdSchema,
    basedOnRevision: exports.VideoScriptRevisionSchema,
    scenes: story_js_1.VideoStoryScenesSchema,
    outro: story_js_1.VideoStoryOutroSchema.optional(),
});
/** Production step inside a project state, for people and agents reading the project. */
exports.VideoProjectStepSchema = zod_1.z.enum([
    'queued', 'plan', 'frames', 'review_sent', 'clips', 'assemble', 'delivery_sent', 'done', 'failed',
    // Presets with a face or a pure infographic: the regia session writes script and graphic, the engine produces the story.
    'regia', 'story',
]);
exports.VideoScriptReviseResponseSchema = zod_1.z.strictObject({
    projectId: brief_js_1.VideoProjectIdSchema,
    state: brief_js_1.VideoProjectStateSchema,
    step: exports.VideoProjectStepSchema,
    scriptRevision: exports.VideoScriptRevisionSchema,
});
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
    /** The choices of the request, resolved with the preset; absent in views written before 1.97.0. */
    choices: brief_js_1.VideoRequestChoicesSchema.optional(),
    /** Revision of the script the regia wrote (the person may ask to correct it); absent for presets without regia. */
    scriptRevision: exports.VideoScriptRevisionSchema.optional(),
    createdAt: zod_1.z.string().min(1),
    updatedAt: zod_1.z.string().min(1),
}).strict();
//# sourceMappingURL=tools.js.map