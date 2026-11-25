import { z } from 'zod';
import { VideoParallelExportQuerySchema, VideoParallelExportSchema, VideoParallelExportErrorSchema } from '../../capability/video/personaggio-parallel.js';
import { VideoParallelImportRequestSchema, VideoParallelImportResultSchema } from '../../capability/video/personaggio-parallel-import.js';
import { VideoModelScopeQuerySchema } from '../../capability/video/modella.js';
import { VideoEngineErrorSchema } from '../../capability/video/engine.js';

/** cap-video -> Parallel canon-orchestrator: export characters. Internal, INTERNAL_SECRET_HEADER. */
export const parallelCharacterExportContract = {
  method: 'GET',
  path: '/companion/export-characters',
  paramsSchema: z.object({}).strict(),
  querySchema: VideoParallelExportQuerySchema,
  responseSchema: VideoParallelExportSchema,
  errorSchema: VideoParallelExportErrorSchema,
  responseStatus: 200,
} as const;

/** cap-video -> engine: import a Parallel character. Identity in the query. Internal, INTERNAL_SECRET_HEADER. */
export const officinaVideoParallelImportContract = {
  method: 'POST',
  path: '/api/modelle/da-parallel',
  paramsSchema: z.object({}).strict(),
  querySchema: VideoModelScopeQuerySchema,
  requestSchema: VideoParallelImportRequestSchema,
  responseSchema: VideoParallelImportResultSchema,
  errorSchema: VideoEngineErrorSchema,
  responseStatus: 201,
} as const;
