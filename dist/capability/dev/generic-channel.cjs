"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevGenericCompleteResponseSchema = exports.DevGenericCompleteRequestSchema = exports.DevGenericHeartbeatResponseSchema = exports.DevGenericHeartbeatRequestSchema = exports.DevGenericClaimResponseSchema = exports.DevGenericLeaseSchema = exports.DevGenericClaimRequestSchema = void 0;
exports.selectDevGenericClaim = selectDevGenericClaim;
const zod_1 = require("zod");
const device_signature_js_1 = require("../../auth/device-signature.cjs");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const generic_job_js_1 = require("./generic-job.cjs");
/** One registered device claims work for one owner, using only its supported tools. */
exports.DevGenericClaimRequestSchema = zod_1.z.strictObject({
    version: zod_1.z.literal(1),
    executorId: device_signature_js_1.DeviceIdSchema,
    executor: generic_job_js_1.DevGenericExecutorSchema,
    tenantId: capability_call_context_js_1.CapabilityAgentScopeSchema.shape.tenantId,
    ownerId: capability_call_context_js_1.CapabilityAgentScopeSchema.shape.ownerId,
    capabilities: zod_1.z.array(generic_job_js_1.DevGenericJobSchema.shape.capability).min(1).max(10),
    tools: zod_1.z.array(generic_job_js_1.DevGenericToolSchema).min(1).max(generic_job_js_1.DEV_GENERIC_JOB_TOOLS.length).refine((tools) => new Set(tools).size === tools.length, { message: 'Tools must be unique' }),
});
exports.DevGenericLeaseSchema = zod_1.z.strictObject({
    leaseId: zod_1.z.string().min(1).max(100),
    expiresAt: zod_1.z.iso.datetime({ offset: true }),
});
exports.DevGenericClaimResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({ status: zod_1.z.literal('empty') }),
    zod_1.z.strictObject({ status: zod_1.z.literal('job'), job: generic_job_js_1.DevGenericJobSchema, lease: exports.DevGenericLeaseSchema }),
]);
exports.DevGenericHeartbeatRequestSchema = zod_1.z.strictObject({
    version: zod_1.z.literal(1),
    executorId: device_signature_js_1.DeviceIdSchema,
    leaseId: exports.DevGenericLeaseSchema.shape.leaseId,
});
exports.DevGenericHeartbeatResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({ status: zod_1.z.literal('extended'), expiresAt: exports.DevGenericLeaseSchema.shape.expiresAt }),
    zod_1.z.strictObject({ status: zod_1.z.literal('lease_expired') }),
]);
exports.DevGenericCompleteRequestSchema = zod_1.z.strictObject({
    version: zod_1.z.literal(1),
    executorId: device_signature_js_1.DeviceIdSchema,
    leaseId: exports.DevGenericLeaseSchema.shape.leaseId,
    result: generic_job_js_1.DevGenericJobResultSchema,
});
exports.DevGenericCompleteResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({ status: zod_1.z.literal('accepted') }),
    zod_1.z.strictObject({ status: zod_1.z.literal('lease_expired') }),
    zod_1.z.strictObject({ status: zod_1.z.literal('rejected'), error: zod_1.z.literal('result_mismatch') }),
]);
/**
 * Correlate a parsed response with the owner's request; foreign work is an error,
 * never an empty queue. This does not verify signatures, ownership or lease freshness.
 */
function selectDevGenericClaim(rawResponse, expectedRequest) {
    const response = exports.DevGenericClaimResponseSchema.safeParse(rawResponse);
    if (!response.success)
        return { ok: false, error: 'invalid_response' };
    if (response.data.status === 'empty')
        return { ok: true, empty: true };
    const { job, lease } = response.data;
    if (job.scope.tenantId !== expectedRequest.tenantId || job.scope.ownerId !== expectedRequest.ownerId) {
        return { ok: false, error: 'foreign_scope' };
    }
    if (!expectedRequest.capabilities.includes(job.capability))
        return { ok: false, error: 'capability_not_requested' };
    if (!expectedRequest.tools.includes(job.tool))
        return { ok: false, error: 'tool_not_requested' };
    if (job.executor !== expectedRequest.executor)
        return { ok: false, error: 'wrong_executor' };
    return { ok: true, empty: false, job, lease };
}
//# sourceMappingURL=generic-channel.js.map