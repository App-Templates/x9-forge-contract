"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.officinaVideoFootageJobGetContract = exports.officinaVideoFootageAddContract = exports.officinaVideoMediaContract = exports.officinaVideoStoryEstimateContract = exports.officinaVideoStoryContract = exports.officinaVideoRunContract = exports.officinaVideoApproveContract = exports.officinaVideoPlanContract = exports.officinaVideoProjectGetContract = exports.officinaVideoHealthContract = exports.officinaVideoJobContract = void 0;
const zod_1 = require("zod");
const story_js_1 = require("../../capability/video/story.cjs");
const engine_js_1 = require("../../capability/video/engine.cjs");
const footage_js_1 = require("../../capability/video/footage.cjs");
/** cap-video -> Officina video engine. Internal calls only, authenticated with INTERNAL_SECRET_HEADER. */
exports.officinaVideoJobContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/jobs',
    paramsSchema: zod_1.z.object({}).strict(),
    requestSchema: engine_js_1.VideoEngineJobSchema,
    responseSchema: engine_js_1.VideoEngineJobResponseSchema,
};
/** cap-video -> Officina video engine health probe. Internal calls only, authenticated with INTERNAL_SECRET_HEADER. */
exports.officinaVideoHealthContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    responseSchema: engine_js_1.VideoEngineHealthSchema,
    responseStatus: 200,
    method: 'GET',
    path: '/api/health',
    paramsSchema: zod_1.z.object({}).strict(),
};
/** cap-video -> engine: read one project. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoProjectGetContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/projects/:engineProjectId',
    paramsSchema: zod_1.z.object({ engineProjectId: engine_js_1.VideoEngineProjectSchema.shape.id }).strict(),
    responseSchema: engine_js_1.VideoEngineProjectSchema,
};
/** cap-video -> engine: write the plan of a project. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoPlanContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/projects/:engineProjectId/plan',
    paramsSchema: zod_1.z.object({ engineProjectId: engine_js_1.VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: engine_js_1.VideoEngineRoutePlanRequestSchema,
    responseSchema: engine_js_1.VideoEngineProjectSchema,
    responseStatus: 200,
};
/** cap-video -> engine: approve a stage at the revision that was shown. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoApproveContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/projects/:engineProjectId/approve',
    paramsSchema: zod_1.z.object({ engineProjectId: engine_js_1.VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: engine_js_1.VideoEngineRouteApproveRequestSchema,
    responseSchema: engine_js_1.VideoEngineProjectSchema,
    responseStatus: 200,
};
/** cap-video -> engine: start a production stage (asynchronous, 202). Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoRunContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/projects/:engineProjectId/run',
    paramsSchema: zod_1.z.object({ engineProjectId: engine_js_1.VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: engine_js_1.VideoEngineRouteRunRequestSchema,
    responseSchema: engine_js_1.VideoEngineProjectSchema,
    responseStatus: 202,
};
/**
 * cap-video -> engine: produce the story of a preset (voice, lip sync, graphic capture, montage) from the approved
 * regia. Asynchronous (202) and idempotent on `revision`; the state is read with GET project. Internal, INTERNAL_SECRET_HEADER.
 */
exports.officinaVideoStoryContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
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
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/projects/:engineProjectId/story/estimate',
    paramsSchema: zod_1.z.object({ engineProjectId: engine_js_1.VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: story_js_1.VideoEngineStoryRequestSchema,
    responseSchema: story_js_1.VideoEngineStoryEstimateSchema,
    responseStatus: 200,
};
/** cap-video -> engine: one media file of a project. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoMediaContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'GET',
    pathSchema: engine_js_1.VideoEngineMediaPathSchema,
};
/**
 * cap-video -> engine: add one shot to the footage archive. The body is the video itself (binary), the metadata and the
 * identity are in the query. Checks that are fast answer now (422 with the reason in `code`, e.g. a duplicate); the rest
 * runs in a job (202 + id), read with GET job. Internal, INTERNAL_SECRET_HEADER.
 */
exports.officinaVideoFootageAddContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    rejectedSchema: footage_js_1.VideoEngineFootageRejectedSchema,
    method: 'POST',
    path: '/api/footage',
    paramsSchema: zod_1.z.object({}).strict(),
    querySchema: footage_js_1.VideoFootageAddQuerySchema,
    bodyMediaTypes: footage_js_1.VIDEO_FOOTAGE_MEDIA_TYPES,
    maxBodyBytes: footage_js_1.VIDEO_FOOTAGE_MAX_BYTES,
    responseSchema: footage_js_1.VideoFootageJobAcceptedSchema,
    responseStatus: 202,
};
/** cap-video -> engine: state of one footage job. The job of another tenant is 404. Internal, INTERNAL_SECRET_HEADER. */
exports.officinaVideoFootageJobGetContract = {
    errorSchema: engine_js_1.VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/footage/jobs/:jobId',
    paramsSchema: zod_1.z.object({ jobId: footage_js_1.VideoFootageJobIdSchema }).strict(),
    querySchema: footage_js_1.VideoFootageJobQuerySchema,
    responseSchema: footage_js_1.VideoFootageJobSchema,
    responseStatus: 200,
};
//# sourceMappingURL=officina-video.js.map