import { z } from 'zod';
import { INTERNAL_SECRET_HEADER } from '../../auth/index.js';
import { RunIdSchema } from '../../organization/run-context.js';
import { StopReasonSchema } from '../../organization/operations.js';
import { RequestStopResultSchema } from '../../organization/run-receipt.js';

export const INTERNAL_RUN_STOP_PATH = '/internal/runs/stop' as const;

export const InternalRunStopRequestSchema = z.strictObject({
  runId: RunIdSchema,
  reason: StopReasonSchema,
});
export type InternalRunStopRequest = z.infer<typeof InternalRunStopRequestSchema>;

export const InternalRunStopResponseSchema = RequestStopResultSchema;
export type InternalRunStopResponse = z.infer<typeof InternalRunStopResponseSchema>;

/** The server must authorize the caller against the stored run ownership. */
export const internalRunStopContract = {
  method: 'POST' as const,
  path: INTERNAL_RUN_STOP_PATH,
  authType: 'secret' as const,
  authHeader: INTERNAL_SECRET_HEADER,
  bodySchema: InternalRunStopRequestSchema,
  responseSchema: InternalRunStopResponseSchema,
} as const;
