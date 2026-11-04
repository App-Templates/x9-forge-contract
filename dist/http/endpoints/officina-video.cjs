"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.officinaVideoMediaContract = exports.officinaVideoStoryEstimateContract = exports.officinaVideoStoryContract = exports.officinaVideoRunContract = exports.officinaVideoApproveContract = exports.officinaVideoPlanContract = exports.officinaVideoProjectGetContract = exports.officinaVideoHealthContract = exports.officinaVideoJobContract = void 0;
const zod_1 = require("zod");
const story_js_1 = require("../../capability/video/story.cjs");
const engine_js_1 = require("../../capability/video/engine.cjs");
/** cap-video -> Officina video engine. Internal calls only, authenticated with INTERNAL_SECRET_HEADER. */
exports.officinaVideoJobContract = {
    method: 'POST',
    path: '/api/jobs',
    paramsSchema: zod_1.z.object({}).strict(),
    requestSchema: engine_js_1.VideoEngineJobSchema,
    responseSchema: engine_js_1.VideoEngineJobResponseSchema,
};
/** cap-video -> Officina video engine health probe. Internal calls only, authenticated with INTERNAL_SECRET_HEADER. */
exports.officinaVideoHealthContract = {
    method: 'GET',
    path: '/api/health',
    paramsSchema: zod_1.z.object({}).strict(),
};
/** cap-video -> engine: read one project. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoProjectGetContract = {
    method: 'GET',
    path: '/api/projects/:engineProjectId',
    paramsSchema: zod_1.z.object({ engineProjectId: engine_js_1.VideoEngineProjectSchema.shape.id }).strict(),
    responseSchema: engine_js_1.VideoEngineProjectSchema,
};
/** cap-video -> engine: write the plan of a project. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoPlanContract = {
    method: 'POST',
    path: '/api/projects/:engineProjectId/plan',
    paramsSchema: zod_1.z.object({ engineProjectId: engine_js_1.VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: engine_js_1.VideoEnginePlanRequestSchema,
    responseSchema: engine_js_1.VideoEngineProjectSchema,
};
/** cap-video -> engine: approve a stage at the revision that was shown. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoApproveContract = {
    method: 'POST',
    path: '/api/projects/:engineProjectId/approve',
    paramsSchema: zod_1.z.object({ engineProjectId: engine_js_1.VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: engine_js_1.VideoEngineApproveRequestSchema,
    responseSchema: engine_js_1.VideoEngineProjectSchema,
};
/** cap-video -> engine: start a production stage (asynchronous, 202). Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoRunContract = {
    method: 'POST',
    path: '/api/projects/:engineProjectId/run',
    paramsSchema: zod_1.z.object({ engineProjectId: engine_js_1.VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: engine_js_1.VideoEngineRunRequestSchema,
};
/**
 * cap-video -> engine: produce the story of a preset (voice, lip sync, graphic capture, montage) from the approved
 * regia. Asynchronous (202) and idempotent on `revision`; the state is read with GET project. Internal, INTERNAL_SECRET_HEADER.
 */
exports.officinaVideoStoryContract = {
    method: 'POST',
    path: '/api/projects/:engineProjectId/story',
    paramsSchema: zod_1.z.object({ engineProjectId: engine_js_1.VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: story_js_1.VideoEngineStoryRequestSchema,
    responseStatus: 202,
};
/**
 * cap-video -> engine: upper estimate of a story, before email 1. Same body as the story (validated by the same contract),
 * no side effect, nothing paid: answers the figure the story start compares with the budget. Internal, INTERNAL_SECRET_HEADER.
 */
exports.officinaVideoStoryEstimateContract = {
    method: 'POST',
    path: '/api/projects/:engineProjectId/story/estimate',
    paramsSchema: zod_1.z.object({ engineProjectId: engine_js_1.VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: story_js_1.VideoEngineStoryRequestSchema,
    responseSchema: story_js_1.VideoEngineStoryEstimateSchema,
    responseStatus: 200,
};
/** cap-video -> engine: one media file of a project. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoMediaContract = {
    method: 'GET',
    pathSchema: engine_js_1.VideoEngineMediaPathSchema,
};
//# sourceMappingURL=officina-video.js.map