"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readDevProductionArtifactContract = exports.DevProductionArtifactReadSchema = void 0;
const zod_1 = require("zod");
const internal_capability_agent_js_1 = require("./internal-capability-agent.cjs");
const capability_call_context_js_1 = require("../../capability/capability-call-context.cjs");
const production_job_js_1 = require("../../capability/dev/production-job.cjs");
const production_result_js_1 = require("../../capability/dev/production-result.cjs");
const production_artifact_content_js_1 = require("../../capability/dev/production-artifact-content.cjs");
/** Transport request only; authorization and persisted record lookup belong to the service. */
exports.DevProductionArtifactReadSchema = zod_1.z.strictObject({
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
    requestId: production_job_js_1.DevProductionJobSchema.shape.requestId,
    artifactRef: production_result_js_1.DevProductionArtifactSchema.shape.artifactRef,
    offset: production_artifact_content_js_1.DevProductionArtifactChunkSchema.shape.offset,
    length: zod_1.z.number().int().min(1).max(262144),
});
/**
 * Read-only POST keeps the opaque artifact reference out of the URL. The backend
 * authenticates the owner, correlates agent/job/request/scope with the persisted
 * record and resolves artifactRef only among artifacts of an authorized succeeded
 * result. Verify the source file, requested chunk and registered sha256; return
 * bytes without creating files or starting production retries. Missing or foreign
 * artifacts produce a service error, never an empty file. No public or signed URL
 * is returned. Signing, storage and assembly remain with services and consumers;
 * the backend delivers the authenticated download to the browser.
 */
exports.readDevProductionArtifactContract = {
    method: 'POST',
    path: '/internal/capability/agents/:agentId/dev/jobs/:jobId/artifacts/read',
    authType: 'secret',
    paramsSchema: zod_1.z.strictObject({
        agentId: internal_capability_agent_js_1.CapabilityAgentParamsSchema.shape.agentId,
        jobId: production_job_js_1.DevProductionJobSchema.shape.jobId,
    }),
    bodySchema: exports.DevProductionArtifactReadSchema,
    responseSchema: production_artifact_content_js_1.DevProductionArtifactChunkSchema,
};
//# sourceMappingURL=internal-dev-artifact-content.js.map