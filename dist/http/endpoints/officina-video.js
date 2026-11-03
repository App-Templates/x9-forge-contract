import { z } from 'zod';
import { VideoEngineJobSchema, VideoEngineJobResponseSchema, VideoEngineProjectSchema, VideoEnginePlanRequestSchema, VideoEngineApproveRequestSchema, VideoEngineRunRequestSchema, VideoEngineMediaPathSchema } from "../../capability/video/engine.js";
/** cap-video -> Officina video engine. Internal calls only, authenticated with INTERNAL_SECRET_HEADER. */
export const officinaVideoJobContract = {
    method: 'POST',
    path: '/api/jobs',
    paramsSchema: z.object({}).strict(),
    requestSchema: VideoEngineJobSchema,
    responseSchema: VideoEngineJobResponseSchema,
};
/** cap-video -> Officina video engine health probe. Internal calls only, authenticated with INTERNAL_SECRET_HEADER. */
export const officinaVideoHealthContract = {
    method: 'GET',
    path: '/api/health',
    paramsSchema: z.object({}).strict(),
};
/** cap-video -> engine: read one project. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoProjectGetContract = {
    method: 'GET',
    path: '/api/projects/:engineProjectId',
    paramsSchema: z.object({ engineProjectId: VideoEngineProjectSchema.shape.id }).strict(),
    responseSchema: VideoEngineProjectSchema,
};
/** cap-video -> engine: write the plan of a project. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoPlanContract = {
    method: 'POST',
    path: '/api/projects/:engineProjectId/plan',
    paramsSchema: z.object({ engineProjectId: VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: VideoEnginePlanRequestSchema,
    responseSchema: VideoEngineProjectSchema,
};
/** cap-video -> engine: approve a stage at the revision that was shown. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoApproveContract = {
    method: 'POST',
    path: '/api/projects/:engineProjectId/approve',
    paramsSchema: z.object({ engineProjectId: VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: VideoEngineApproveRequestSchema,
    responseSchema: VideoEngineProjectSchema,
};
/** cap-video -> engine: start a production stage (asynchronous, 202). Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoRunContract = {
    method: 'POST',
    path: '/api/projects/:engineProjectId/run',
    paramsSchema: z.object({ engineProjectId: VideoEngineProjectSchema.shape.id }).strict(),
    requestSchema: VideoEngineRunRequestSchema,
};
/** cap-video -> engine: one media file of a project. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoMediaContract = {
    method: 'GET',
    pathSchema: VideoEngineMediaPathSchema,
};
//# sourceMappingURL=officina-video.js.map