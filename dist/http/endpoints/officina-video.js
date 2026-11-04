import { z } from 'zod';
import { VideoEngineStoryRequestSchema, VideoEngineStoryEstimateSchema } from "../../capability/video/story.js";
import { VideoEngineErrorSchema, VideoEngineHealthSchema, VideoEngineJobSchema, VideoEngineJobResponseSchema, VideoEngineProjectSchema, VideoEngineRoutePlanRequestSchema, VideoEngineRouteApproveRequestSchema, VideoEngineRouteRunRequestSchema, VideoEngineMediaPathSchema } from "../../capability/video/engine.js";
/** cap-video -> Officina video engine. Internal calls only, authenticated with INTERNAL_SECRET_HEADER. */
export const officinaVideoJobContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/jobs',
    paramsSchema: z.object({}).strict(),
    requestSchema: VideoEngineJobSchema,
    responseSchema: VideoEngineJobResponseSchema,
};
/** cap-video -> Officina video engine health probe. Internal calls only, authenticated with INTERNAL_SECRET_HEADER. */
export const officinaVideoHealthContract = {
    errorSchema: VideoEngineErrorSchema,
    responseSchema: VideoEngineHealthSchema,
    responseStatus: 200,
    method: 'GET',
    path: '/api/health',
    paramsSchema: z.object({}).strict(),
};
/** cap-video -> engine: read one project. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoProjectGetContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'GET',
    path: '/api/projects/:engineProjectId',
    paramsSchema: z.object({ engineProjectId: VideoEngineProjectSchema.shape.id }).strict(),
    responseSchema: VideoEngineProjectSchema,
};
/** cap-video -> engine: write the plan of a project. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoPlanContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/projects/:engineProjectId/plan',
    paramsSchema: z.object({ engineProjectId: VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: VideoEngineRoutePlanRequestSchema,
    responseSchema: VideoEngineProjectSchema,
    responseStatus: 200,
};
/** cap-video -> engine: approve a stage at the revision that was shown. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoApproveContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/projects/:engineProjectId/approve',
    paramsSchema: z.object({ engineProjectId: VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: VideoEngineRouteApproveRequestSchema,
    responseSchema: VideoEngineProjectSchema,
    responseStatus: 200,
};
/** cap-video -> engine: start a production stage (asynchronous, 202). Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoRunContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/projects/:engineProjectId/run',
    paramsSchema: z.object({ engineProjectId: VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: VideoEngineRouteRunRequestSchema,
    responseSchema: VideoEngineProjectSchema,
    responseStatus: 202,
};
/**
 * cap-video -> engine: produce the story of a preset (voice, lip sync, graphic capture, montage) from the approved
 * regia. Asynchronous (202) and idempotent on `revision`; the state is read with GET project. Internal, INTERNAL_SECRET_HEADER.
 */
export const officinaVideoStoryContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/projects/:engineProjectId/story',
    paramsSchema: z.object({ engineProjectId: VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: VideoEngineStoryRequestSchema,
    responseStatus: 202,
};
/**
 * cap-video -> engine: upper estimate of a story, before email 1. Same body as the story (validated by the same contract),
 * no side effect, nothing paid: answers the figure the story start compares with the budget. Internal, INTERNAL_SECRET_HEADER.
 */
export const officinaVideoStoryEstimateContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'POST',
    path: '/api/projects/:engineProjectId/story/estimate',
    paramsSchema: z.object({ engineProjectId: VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: VideoEngineStoryRequestSchema,
    responseSchema: VideoEngineStoryEstimateSchema,
    responseStatus: 200,
};
/** cap-video -> engine: one media file of a project. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoMediaContract = {
    errorSchema: VideoEngineErrorSchema,
    method: 'GET',
    pathSchema: VideoEngineMediaPathSchema,
};
//# sourceMappingURL=officina-video.js.map