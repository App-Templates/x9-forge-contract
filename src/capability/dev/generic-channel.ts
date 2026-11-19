import { z } from 'zod';
import { DeviceIdSchema } from '../../auth/device-signature.js';
import { CapabilityAgentScopeSchema } from '../capability-call-context.js';
import {
  DEV_GENERIC_JOB_TOOLS,
  DevGenericExecutorSchema,
  DevGenericJobResultSchema,
  DevGenericJobSchema,
  DevGenericToolSchema,
  type DevGenericJob,
} from './generic-job.js';

/** One registered device claims work for one owner, using only its supported tools. */
export const DevGenericClaimRequestSchema = z.strictObject({
  version: z.literal(1),
  executorId: DeviceIdSchema,
  executor: DevGenericExecutorSchema,
  tenantId: CapabilityAgentScopeSchema.shape.tenantId,
  ownerId: CapabilityAgentScopeSchema.shape.ownerId,
  capabilities: z.array(DevGenericJobSchema.shape.capability).min(1).max(10),
  tools: z.array(DevGenericToolSchema).min(1).max(DEV_GENERIC_JOB_TOOLS.length).refine(
    (tools) => new Set(tools).size === tools.length,
    { message: 'Tools must be unique' },
  ),
});
export type DevGenericClaimRequest = z.infer<typeof DevGenericClaimRequestSchema>;

export const DevGenericLeaseSchema = z.strictObject({
  leaseId: z.string().min(1).max(100),
  expiresAt: z.iso.datetime({ offset: true }),
});
export type DevGenericLease = z.infer<typeof DevGenericLeaseSchema>;

export const DevGenericClaimResponseSchema = z.discriminatedUnion('status', [
  z.strictObject({ status: z.literal('empty') }),
  z.strictObject({ status: z.literal('job'), job: DevGenericJobSchema, lease: DevGenericLeaseSchema }),
]);
export type DevGenericClaimResponse = z.infer<typeof DevGenericClaimResponseSchema>;

export const DevGenericHeartbeatRequestSchema = z.strictObject({
  version: z.literal(1),
  executorId: DeviceIdSchema,
  leaseId: DevGenericLeaseSchema.shape.leaseId,
});
export type DevGenericHeartbeatRequest = z.infer<typeof DevGenericHeartbeatRequestSchema>;

export const DevGenericHeartbeatResponseSchema = z.discriminatedUnion('status', [
  z.strictObject({ status: z.literal('extended'), expiresAt: DevGenericLeaseSchema.shape.expiresAt }),
  z.strictObject({ status: z.literal('lease_expired') }),
]);
export type DevGenericHeartbeatResponse = z.infer<typeof DevGenericHeartbeatResponseSchema>;

export const DevGenericCompleteRequestSchema = z.strictObject({
  version: z.literal(1),
  executorId: DeviceIdSchema,
  leaseId: DevGenericLeaseSchema.shape.leaseId,
  result: DevGenericJobResultSchema,
});
export type DevGenericCompleteRequest = z.infer<typeof DevGenericCompleteRequestSchema>;

export const DevGenericCompleteResponseSchema = z.discriminatedUnion('status', [
  z.strictObject({ status: z.literal('accepted') }),
  z.strictObject({ status: z.literal('lease_expired') }),
  z.strictObject({ status: z.literal('rejected'), error: z.literal('result_mismatch') }),
]);
export type DevGenericCompleteResponse = z.infer<typeof DevGenericCompleteResponseSchema>;

export type DevGenericClaimSelection =
  | { ok: true; empty: true }
  | { ok: true; empty: false; job: DevGenericJob; lease: DevGenericLease }
  | { ok: false; error: 'invalid_response' | 'foreign_scope' | 'capability_not_requested' | 'tool_not_requested' | 'wrong_executor' };

/**
 * Correlate a parsed response with the owner's request; foreign work is an error,
 * never an empty queue. This does not verify signatures, ownership or lease freshness.
 */
export function selectDevGenericClaim(
  rawResponse: unknown,
  expectedRequest: DevGenericClaimRequest,
): DevGenericClaimSelection {
  const response = DevGenericClaimResponseSchema.safeParse(rawResponse);
  if (!response.success) return { ok: false, error: 'invalid_response' };
  if (response.data.status === 'empty') return { ok: true, empty: true };
  const { job, lease } = response.data;
  if (job.scope.tenantId !== expectedRequest.tenantId || job.scope.ownerId !== expectedRequest.ownerId) {
    return { ok: false, error: 'foreign_scope' };
  }
  if (!expectedRequest.capabilities.includes(job.capability)) return { ok: false, error: 'capability_not_requested' };
  if (!expectedRequest.tools.includes(job.tool)) return { ok: false, error: 'tool_not_requested' };
  if (job.executor !== expectedRequest.executor) return { ok: false, error: 'wrong_executor' };
  return { ok: true, empty: false, job, lease };
}
