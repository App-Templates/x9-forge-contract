"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDevProductionProgressContract = void 0;
exports.selectDevProductionProgressSnapshot = selectDevProductionProgressSnapshot;
const zod_1 = require("zod");
const internal_capability_agent_js_1 = require("./internal-capability-agent.cjs");
const capability_call_context_js_1 = require("../../capability/capability-call-context.cjs");
const production_job_js_1 = require("../../capability/dev/production-job.cjs");
const production_progress_js_1 = require("../../capability/dev/production-progress.cjs");
/**
 * Read progress on demand, ordered by the domain snapshot sequence; no new event channel.
 * The backend authenticates the owner and compares path and scope with the persisted
 * record, returning only that snapshot. A poll neither enqueues work nor starts retries
 * nor certifies completion. Missing or foreign records produce a service-owned 404,
 * never a fabricated queued snapshot.
 */
exports.getDevProductionProgressContract = {
    method: 'GET',
    path: '/internal/capability/agents/:agentId/dev/jobs/:jobId/progress',
    authType: 'secret',
    paramsSchema: zod_1.z.object({
        agentId: internal_capability_agent_js_1.CapabilityAgentParamsSchema.shape.agentId,
        jobId: production_job_js_1.DevProductionJobSchema.shape.jobId,
    }).strict(),
    querySchema: zod_1.z.object({ scope: capability_call_context_js_1.CapabilityAgentScopeSchema }).strict(),
    responseSchema: production_progress_js_1.DevProductionProgressSchema,
};
function copyProgress(raw) {
    const parsed = production_progress_js_1.DevProductionProgressSchema.safeParse(raw);
    return parsed.success ? parsed.data : null;
}
/**
 * Pure selector for out-of-order poll answers. Only snapshots that parse and correlate
 * with the expected job count; a strictly higher domain sequence replaces the current one
 * and updatedAt never decides precedence. It stores nothing and does not attest completion.
 */
function selectDevProductionProgressSnapshot(rawCurrent, rawIncoming, expectedJob) {
    const current = (0, production_progress_js_1.isDevProductionProgressForJob)(rawCurrent, expectedJob) ? copyProgress(rawCurrent) : null;
    const incoming = (0, production_progress_js_1.isDevProductionProgressForJob)(rawIncoming, expectedJob) ? copyProgress(rawIncoming) : null;
    if (incoming === null)
        return current;
    if (current === null || incoming.sequence > current.sequence)
        return incoming;
    return current;
}
//# sourceMappingURL=internal-dev-progress.js.map