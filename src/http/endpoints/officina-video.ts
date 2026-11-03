import { z } from 'zod';
import { VideoEngineJobSchema, VideoEngineJobResponseSchema } from '../../capability/video/engine.js';

/** cap-video -> Officina video engine. Internal calls only, authenticated with INTERNAL_SECRET_HEADER. */
export const officinaVideoJobContract = {
  method: 'POST',
  path: '/api/jobs',
  paramsSchema: z.object({}).strict(),
  requestSchema: VideoEngineJobSchema,
  responseSchema: VideoEngineJobResponseSchema,
} as const;

/** cap-video -> Officina video engine health probe. Internal calls only, authenticated with INTERNAL_SECRET_HEADER. */
export const officinaVideoHealthContract = {
  method: 'GET',
  path: '/api/health',
  paramsSchema: z.object({}).strict(),
} as const;
