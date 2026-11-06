import { z } from 'zod';
import { VideoEngineStoryRequestSchema, VideoEngineStoryEstimateSchema } from '../../capability/video/story.js';
import { VideoEngineErrorSchema, VideoEngineHealthSchema, VideoEngineJobSchema, VideoEngineJobResponseSchema, VideoEngineProjectSchema, VideoEngineRoutePlanRequestSchema, VideoEngineRouteApproveRequestSchema, VideoEngineRouteRunRequestSchema, VideoEngineMediaPathSchema } from '../../capability/video/engine.js';
import { VIDEO_FOOTAGE_MAX_BYTES, VIDEO_FOOTAGE_MEDIA_TYPES, VideoFootageAddQuerySchema, VideoFootageJobAcceptedSchema, VideoFootageJobIdSchema, VideoFootageJobQuerySchema, VideoFootageJobSchema, VideoEngineFootageRejectedSchema, VideoFootageListQuerySchema, VideoFootageListSchema } from '../../capability/video/footage.js';

/** cap-video -> Officina video engine. Internal calls only, authenticated with INTERNAL_SECRET_HEADER. */
export const officinaVideoJobContract = {
  errorSchema: VideoEngineErrorSchema,
  method: 'POST',
  path: '/api/jobs',
  paramsSchema: z.object({}).strict(),
  requestSchema: VideoEngineJobSchema,
  responseSchema: VideoEngineJobResponseSchema,
} as const;

/** cap-video -> Officina video engine health probe. Internal calls only, authenticated with INTERNAL_SECRET_HEADER. */
export const officinaVideoHealthContract = {
  errorSchema: VideoEngineErrorSchema,
  responseSchema: VideoEngineHealthSchema,
  responseStatus: 200,
  method: 'GET',
  path: '/api/health',
  paramsSchema: z.object({}).strict(),
} as const;

/** cap-video -> engine: read one project. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoProjectGetContract = {
  errorSchema: VideoEngineErrorSchema,
  method: 'GET',
  path: '/api/projects/:engineProjectId',
  paramsSchema: z.object({ engineProjectId: VideoEngineProjectSchema.shape.id }).strict(),
  responseSchema: VideoEngineProjectSchema,
} as const;

/** cap-video -> engine: write the plan of a project. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoPlanContract = {
  errorSchema: VideoEngineErrorSchema,
  method: 'POST',
  path: '/api/projects/:engineProjectId/plan',
  paramsSchema: z.object({ engineProjectId: VideoEngineProjectSchema.shape.id }).strict(),
  requestSchema: VideoEngineRoutePlanRequestSchema,
  responseSchema: VideoEngineProjectSchema,
  responseStatus: 200,
} as const;

/** cap-video -> engine: approve a stage at the revision that was shown. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoApproveContract = {
  errorSchema: VideoEngineErrorSchema,
  method: 'POST',
  path: '/api/projects/:engineProjectId/approve',
  paramsSchema: z.object({ engineProjectId: VideoEngineProjectSchema.shape.id }).strict(),
  requestSchema: VideoEngineRouteApproveRequestSchema,
  responseSchema: VideoEngineProjectSchema,
  responseStatus: 200,
} as const;

/** cap-video -> engine: start a production stage (asynchronous, 202). Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoRunContract = {
  errorSchema: VideoEngineErrorSchema,
  method: 'POST',
  path: '/api/projects/:engineProjectId/run',
  paramsSchema: z.object({ engineProjectId: VideoEngineProjectSchema.shape.id }).strict(),
  requestSchema: VideoEngineRouteRunRequestSchema,
  responseSchema: VideoEngineProjectSchema,
  responseStatus: 202,
} as const;

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
} as const;

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
} as const;

/** cap-video -> engine: one media file of a project. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoMediaContract = {
  errorSchema: VideoEngineErrorSchema,
  method: 'GET',
  pathSchema: VideoEngineMediaPathSchema,
} as const;

/**
 * cap-video -> engine: add one shot to the footage archive. The body is the video itself (binary), the metadata and the
 * identity are in the query. Checks that are fast answer now (422 with the reason in `code`, e.g. a duplicate); the rest
 * runs in a job (202 + id), read with GET job. Internal, INTERNAL_SECRET_HEADER.
 */
export const officinaVideoFootageAddContract = {
  errorSchema: VideoEngineErrorSchema,
  rejectedSchema: VideoEngineFootageRejectedSchema,
  method: 'POST',
  path: '/api/footage',
  paramsSchema: z.object({}).strict(),
  querySchema: VideoFootageAddQuerySchema,
  bodyMediaTypes: VIDEO_FOOTAGE_MEDIA_TYPES,
  maxBodyBytes: VIDEO_FOOTAGE_MAX_BYTES,
  responseSchema: VideoFootageJobAcceptedSchema,
  responseStatus: 202,
} as const;

/** cap-video -> engine: state of one footage job. The job of another tenant is 404. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoFootageJobGetContract = {
  errorSchema: VideoEngineErrorSchema,
  method: 'GET',
  path: '/api/footage/jobs/:jobId',
  paramsSchema: z.object({ jobId: VideoFootageJobIdSchema }).strict(),
  querySchema: VideoFootageJobQuerySchema,
  responseSchema: VideoFootageJobSchema,
  responseStatus: 200,
} as const;

/**
 * cap-video -> engine: the footage archive of one person of the tenant. A person without an archive is `shots: []`.
 * Internal, INTERNAL_SECRET_HEADER only.
 */
export const officinaVideoFootageListContract = {
  errorSchema: VideoEngineErrorSchema,
  method: 'GET',
  path: '/api/footage',
  paramsSchema: z.object({}).strict(),
  querySchema: VideoFootageListQuerySchema,
  responseSchema: VideoFootageListSchema,
  responseStatus: 200,
} as const;
