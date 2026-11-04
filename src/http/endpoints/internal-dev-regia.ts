import { z } from 'zod';
import {
  VideoRegiaErrorSchema,
  VideoRegiaIdSchema,
  VideoRegiaOpenResponseSchema,
  VideoRegiaRequestSchema,
  VideoRegiaResultRequestSchema,
  VideoRegiaResultSchema,
} from '../../capability/video/regia.js';

/**
 * cap-video → cap-dev: open the regia of a video project as a `design` session on the session board.
 * Internal only, authenticated with INTERNAL_SECRET_HEADER; the identity in the body is admitted only from a service
 * and resolved again by cap-dev against the platform inventory. 200 with the incarico, 4xx/5xx with VideoRegiaError.
 */
export const internalDevRegiaOpenContract = {
  method: 'POST' as const,
  path: '/internal/dev/regia' as const,
  authType: 'secret' as const,
  paramsSchema: z.object({}).strict(),
  requestSchema: VideoRegiaRequestSchema,
  responseSchema: VideoRegiaOpenResponseSchema,
  errorSchema: VideoRegiaErrorSchema,
} as const;

/**
 * cap-video → cap-dev: the verified result of one regia, for the identity that opened it. Read-only POST (the identity
 * travels in the body, never in the URL). Internal only, INTERNAL_SECRET_HEADER.
 */
export const internalDevRegiaResultContract = {
  method: 'POST' as const,
  path: '/internal/dev/regia/:regiaId/result' as const,
  authType: 'secret' as const,
  paramsSchema: z.strictObject({ regiaId: z.coerce.number().pipe(VideoRegiaIdSchema) }),
  requestSchema: VideoRegiaResultRequestSchema,
  responseSchema: VideoRegiaResultSchema,
  errorSchema: VideoRegiaErrorSchema,
} as const;

export function internalDevRegiaResultPath(regiaId: number): string {
  const id = VideoRegiaIdSchema.parse(regiaId);
  return internalDevRegiaResultContract.path.replace(':regiaId', String(id));
}
