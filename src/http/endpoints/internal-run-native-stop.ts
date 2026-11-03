import { z } from 'zod';
import { INTERNAL_SECRET_HEADER } from '../../auth/index.js';
import { OrganizationRunContextSchema, RunIdSchema } from '../../organization/run-context.js';
import { RunAttemptSchema } from '../../organization/run-outcome.js';
import { StopReasonSchema } from '../../organization/operations.js';

export const INTERNAL_RUN_NATIVE_STOP_PATH = '/internal/runs/native-stop' as const;

export const InternalRunNativeStopRequestSchema = z
  .strictObject({
    organizationRun: OrganizationRunContextSchema,
    attempt: RunAttemptSchema,
    reason: StopReasonSchema,
  })
  .refine((request) => request.attempt.runId === request.organizationRun.runId, {
    message: 'attempt.runId must match organizationRun.runId',
    path: ['attempt', 'runId'],
  });
export type InternalRunNativeStopRequest = z.infer<typeof InternalRunNativeStopRequestSchema>;

const responseBase = {
  runId: RunIdSchema,
  attemptId: RunAttemptSchema.shape.attemptId,
};

/** Unconfirmed cancellation must never be promoted to cancelled. */
export const InternalRunNativeStopResponseSchema = z.discriminatedUnion('status', [
  z.strictObject({ ...responseBase, status: z.literal('cancelled') }),
  z.strictObject({ ...responseBase, status: z.literal('not_started') }),
  z.strictObject({ ...responseBase, status: z.literal('already_finished') }),
  z.strictObject({ ...responseBase, status: z.literal('unconfirmed') }),
  z.strictObject({ ...responseBase, status: z.literal('unknown_run') }),
]);
export type InternalRunNativeStopResponse = z.infer<typeof InternalRunNativeStopResponseSchema>;

/** Authority derives from the persisted attempt owner, never a caller-supplied boolean. */
export const internalRunNativeStopContract = {
  method: 'POST' as const,
  path: INTERNAL_RUN_NATIVE_STOP_PATH,
  authType: 'secret' as const,
  authHeader: INTERNAL_SECRET_HEADER,
  bodySchema: InternalRunNativeStopRequestSchema,
  responseSchema: InternalRunNativeStopResponseSchema,
} as const;
