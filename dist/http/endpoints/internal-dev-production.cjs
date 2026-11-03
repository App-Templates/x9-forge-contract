"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDevProductionResultContract = exports.submitDevProductionContract = exports.DevProductionSubmissionSchema = void 0;
exports.isDevProductionApprovalForJob = isDevProductionApprovalForJob;
exports.isDevProductionResultResponseForJob = isDevProductionResultResponseForJob;
const zod_1 = require("zod");
const index_js_1 = require("../../capability/approvals/index.cjs");
const capability_call_context_js_1 = require("../../capability/capability-call-context.cjs");
const production_job_js_1 = require("../../capability/dev/production-job.cjs");
const production_result_js_1 = require("../../capability/dev/production-result.cjs");
const internal_capability_agent_js_1 = require("./internal-capability-agent.cjs");
exports.DevProductionSubmissionSchema = zod_1.z.strictObject({
    job: production_job_js_1.DevProductionJobSchema,
    approval: index_js_1.SignedApprovalPermitSchema,
});
/** Queued acknowledges submission only; it does not attest execution or artifacts. */
exports.submitDevProductionContract = {
    method: 'POST',
    path: '/internal/capability/agents/:agentId/dev/jobs',
    authType: 'secret',
    paramsSchema: internal_capability_agent_js_1.CapabilityAgentParamsSchema,
    bodySchema: exports.DevProductionSubmissionSchema,
    responseSchema: zod_1.z.strictObject({
        jobId: zod_1.z.string().min(1),
        requestId: index_js_1.ApprovalRequestIdSchema,
        status: zod_1.z.literal('queued'),
    }),
};
/** The service must authorize the scope and correlate the path with its persisted job. */
exports.getDevProductionResultContract = {
    method: 'GET',
    path: '/internal/capability/agents/:agentId/dev/jobs/:jobId',
    authType: 'secret',
    paramsSchema: zod_1.z.strictObject({
        agentId: internal_capability_agent_js_1.CapabilityAgentParamsSchema.shape.agentId,
        jobId: zod_1.z.string().min(1),
    }),
    querySchema: zod_1.z.strictObject({ scope: capability_call_context_js_1.CapabilityAgentScopeSchema }),
    responseSchema: zod_1.z.discriminatedUnion('status', [
        zod_1.z.strictObject({
            status: zod_1.z.literal('pending'),
            jobId: zod_1.z.string().min(1),
            requestId: index_js_1.ApprovalRequestIdSchema,
        }),
        zod_1.z.strictObject({ status: zod_1.z.literal('finished'), result: production_result_js_1.DevProductionResultSchema }),
    ]),
};
/**
 * Correlation only, using the job and text digest from the service's persisted expectation.
 * This does not verify cryptographic signatures, one-time nonces, owner/passkey identity,
 * cap-dev installation/APPLIED state or a fresh lease. Before effects, S3 must use the
 * existing A11 signature verifier, consume the nonce and re-read those preconditions.
 * A boolean approved flag cannot replace that verification.
 */
function isDevProductionApprovalForJob(rawSignedPermit, expectedJob, expectedTextSha256, nowMs) {
    const signed = index_js_1.SignedApprovalPermitSchema.safeParse(rawSignedPermit);
    const parsedJob = production_job_js_1.DevProductionJobSchema.safeParse(expectedJob);
    const text = index_js_1.ApprovalTextSha256Schema.safeParse(expectedTextSha256);
    if (!signed.success || !parsedJob.success || !text.success || !Number.isFinite(nowMs))
        return false;
    const job = parsedJob.data;
    const check = (0, index_js_1.checkApprovalPermit)(signed.data.permit, {
        client: 'dev',
        type: 'dev.produce',
        scope: job.scope,
        requestId: job.requestId,
        textSha256: text.data,
        bindings: (0, production_job_js_1.devProductionApprovalBindings)(job),
    }, nowMs);
    return check.ok;
}
/**
 * Correlation only: true means the response belongs to the expected job, never that the work
 * succeeded. Callers must keep the original status of a finished result (failed, blocked,
 * cancelled and uncertain stay what they are) and must never retry an uncertain result
 * automatically. A pending response carries no scope, so this helper cannot attribute it to an
 * owner or agent: the server must authenticate the owner and the scope/path before answering.
 */
function isDevProductionResultResponseForJob(rawResponse, expectedJob) {
    const response = exports.getDevProductionResultContract.responseSchema.safeParse(rawResponse);
    const parsedJob = production_job_js_1.DevProductionJobSchema.safeParse(expectedJob);
    if (!response.success || !parsedJob.success)
        return false;
    const job = parsedJob.data;
    if (response.data.status === 'pending') {
        return response.data.jobId === job.jobId && response.data.requestId === job.requestId;
    }
    return (0, production_result_js_1.isDevProductionResultForJob)(response.data.result, job);
}
//# sourceMappingURL=internal-dev-production.js.map