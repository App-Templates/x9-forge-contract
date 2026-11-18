"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeDevGenericJobContract = exports.heartbeatDevGenericJobContract = exports.claimDevGenericJobContract = void 0;
const zod_1 = require("zod");
const device_signature_js_1 = require("../../auth/device-signature.cjs");
const generic_job_js_1 = require("../../capability/dev/generic-job.cjs");
const generic_channel_js_1 = require("../../capability/dev/generic-channel.cjs");
const DevGenericJobParamsSchema = zod_1.z.strictObject({
    jobId: generic_job_js_1.DevGenericJobSchema.shape.jobId.regex(/^[^/]+$/),
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
exports.claimDevGenericJobContract = {
    method: 'POST',
    path: '/connect/generic-jobs/claim',
    authType: 'device_signature',
    headersSchema: device_signature_js_1.AuthDeviceSignatureSchema,
    bodySchema: generic_channel_js_1.DevGenericClaimRequestSchema,
    responseSchema: generic_channel_js_1.DevGenericClaimResponseSchema,
};
/** Device and owner checks and lease rules documented on claimDevGenericJobContract apply. */
exports.heartbeatDevGenericJobContract = {
    method: 'POST',
    path: '/connect/generic-jobs/:jobId/heartbeat',
    authType: 'device_signature',
    headersSchema: device_signature_js_1.AuthDeviceSignatureSchema,
    paramsSchema: DevGenericJobParamsSchema,
    bodySchema: generic_channel_js_1.DevGenericHeartbeatRequestSchema,
    responseSchema: generic_channel_js_1.DevGenericHeartbeatResponseSchema,
};
/** Device and owner checks, lease rules and result correlation documented above apply. */
exports.completeDevGenericJobContract = {
    method: 'POST',
    path: '/connect/generic-jobs/:jobId/complete',
    authType: 'device_signature',
    headersSchema: device_signature_js_1.AuthDeviceSignatureSchema,
    paramsSchema: DevGenericJobParamsSchema,
    bodySchema: generic_channel_js_1.DevGenericCompleteRequestSchema,
    responseSchema: generic_channel_js_1.DevGenericCompleteResponseSchema,
};
//# sourceMappingURL=dev-generic-jobs.js.map