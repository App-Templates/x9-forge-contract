import { z } from 'zod';
import { AuthDeviceSignatureSchema } from '../../auth/device-signature.js';
import { DevGenericJobSchema } from '../../capability/dev/generic-job.js';
import {
  DevGenericClaimRequestSchema,
  DevGenericClaimResponseSchema,
  DevGenericHeartbeatRequestSchema,
  DevGenericHeartbeatResponseSchema,
  DevGenericCompleteRequestSchema,
  DevGenericCompleteResponseSchema,
} from '../../capability/dev/generic-channel.js';

const DevGenericJobParamsSchema = z.strictObject({
  jobId: DevGenericJobSchema.shape.jobId.regex(/^[^/]+$/),
});

/**
 * For every route the service verifies the device signature and nonce and checks
 * that the device is registered for this tenant and owner, including server devices.
 * Body executorId must match the signed device; jobId and leaseId must refer to the
 * persisted assignment for that device. Header validation alone is not authentication.
 * The service never leases the same job to two executors while its lease is alive,
 * never revives an expired lease with a heartbeat, and chooses all expiry timestamps.
 * On completion it compares the result with the stored job using
 * devGenericResultMatchesJob, rejecting mismatches as result_mismatch.
 */
export const claimDevGenericJobContract = {
  method: 'POST' as const,
  path: '/connect/generic-jobs/claim' as const,
  authType: 'device_signature' as const,
  headersSchema: AuthDeviceSignatureSchema,
  bodySchema: DevGenericClaimRequestSchema,
  responseSchema: DevGenericClaimResponseSchema,
} as const;

/** Device and owner checks and lease rules documented on claimDevGenericJobContract apply. */
export const heartbeatDevGenericJobContract = {
  method: 'POST' as const,
  path: '/connect/generic-jobs/:jobId/heartbeat' as const,
  authType: 'device_signature' as const,
  headersSchema: AuthDeviceSignatureSchema,
  paramsSchema: DevGenericJobParamsSchema,
  bodySchema: DevGenericHeartbeatRequestSchema,
  responseSchema: DevGenericHeartbeatResponseSchema,
} as const;

/** Device and owner checks, lease rules and result correlation documented above apply. */
export const completeDevGenericJobContract = {
  method: 'POST' as const,
  path: '/connect/generic-jobs/:jobId/complete' as const,
  authType: 'device_signature' as const,
  headersSchema: AuthDeviceSignatureSchema,
  paramsSchema: DevGenericJobParamsSchema,
  bodySchema: DevGenericCompleteRequestSchema,
  responseSchema: DevGenericCompleteResponseSchema,
} as const;
