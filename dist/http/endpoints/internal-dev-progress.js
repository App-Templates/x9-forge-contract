import { z } from 'zod';
import { CapabilityAgentParamsSchema } from "./internal-capability-agent.js";
import { CapabilityAgentScopeSchema } from "../../capability/capability-call-context.js";
import { DevProductionJobSchema } from "../../capability/dev/production-job.js";
import { DevProductionProgressSchema, isDevProductionProgressForJob, } from "../../capability/dev/production-progress.js";
/**
 * Read progress on demand, ordered by the domain snapshot sequence; no new event channel.
 * The backend authenticates the owner and compares path and scope with the persisted
 * record, returning only that snapshot. A poll neither enqueues work nor starts retries
 * nor certifies completion. Missing or foreign records produce a service-owned 404,
 * never a fabricated queued snapshot.
 */
export const getDevProductionProgressContract = {
    method: 'GET',
    path: '/internal/capability/agents/:agentId/dev/jobs/:jobId/progress',
    authType: 'secret',
    paramsSchema: z.object({
        agentId: CapabilityAgentParamsSchema.shape.agentId,
        jobId: DevProductionJobSchema.shape.jobId,
    }).strict(),
    querySchema: z.object({ scope: CapabilityAgentScopeSchema }).strict(),
    responseSchema: DevProductionProgressSchema,
};
function copyProgress(raw) {
    const parsed = DevProductionProgressSchema.safeParse(raw);
    return parsed.success ? parsed.data : null;
}
/**
 * Pure selector for out-of-order poll answers. Only snapshots that parse and correlate
 * with the expected job count; a strictly higher domain sequence replaces the current one
 * and updatedAt never decides precedence. It stores nothing and does not attest completion.
 */
export function selectDevProductionProgressSnapshot(rawCurrent, rawIncoming, expectedJob) {
    const current = isDevProductionProgressForJob(rawCurrent, expectedJob) ? copyProgress(rawCurrent) : null;
    const incoming = isDevProductionProgressForJob(rawIncoming, expectedJob) ? copyProgress(rawIncoming) : null;
    if (incoming === null)
        return current;
    if (current === null || incoming.sequence > current.sequence)
        return incoming;
    return current;
}
//# sourceMappingURL=internal-dev-progress.js.map