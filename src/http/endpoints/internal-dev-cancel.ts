import { z } from 'zod';
import { CapabilityAgentScopeSchema } from '../../capability/capability-call-context.js';
import { DevProductionJobSchema } from '../../capability/dev/production-job.js';
import { CapabilityAgentParamsSchema } from './internal-capability-agent.js';

/** requestId identifies the original production request, not a new permit. */
export const DevProductionCancelRequestSchema = z.strictObject({
  scope: CapabilityAgentScopeSchema,
  requestId: DevProductionJobSchema.shape.requestId,
  reason: z.string().trim().min(1).max(500),
});
export type DevProductionCancelRequest = z.infer<typeof DevProductionCancelRequestSchema>;

/** Acknowledges the stop request only; final state, costs and effects are separate reads. */
export const DevProductionCancelReceiptSchema = z.strictObject({
  jobId: DevProductionJobSchema.shape.jobId,
  requestId: DevProductionJobSchema.shape.requestId,
  status: z.literal('stop_requested'),
  requestedAt: z.iso.datetime(),
});
export type DevProductionCancelReceipt = z.infer<typeof DevProductionCancelReceiptSchema>;

/**
 * The service authenticates the owner and compares scope, path and original requestId
 * with the persisted job. It owns idempotency and stop propagation, and must not
 * requeue uncertain work. Receipt does not mean cancellation has completed.
 * This contract neither invokes night nor consumes A11 nor authorizes new production;
 * jobId is never a native runId and the signed command v2 stop remains separate.
 */
export const cancelDevProductionJobContract = {
  method: 'POST' as const,
  path: '/internal/capability/agents/:agentId/dev/jobs/:jobId/cancel' as const,
  authType: 'secret' as const,
  paramsSchema: z.strictObject({
    agentId: CapabilityAgentParamsSchema.shape.agentId,
    jobId: DevProductionJobSchema.shape.jobId,
  }),
  bodySchema: DevProductionCancelRequestSchema,
  responseSchema: DevProductionCancelReceiptSchema,
} as const;
