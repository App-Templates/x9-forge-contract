"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevProductionProgressSchema = void 0;
exports.isDevProductionProgressForJob = isDevProductionProgressForJob;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const production_job_js_1 = require("./production-job.cjs");
const JobShape = production_job_js_1.DevProductionJobSchema.shape;
/** Informational snapshot; the service owns sequence monotonicity across snapshots.
 * Completing all tasks does not attest success: the production result still needs evidence.
 */
exports.DevProductionProgressSchema = zod_1.z.strictObject({
    scope: JobShape.scope,
    jobId: JobShape.jobId,
    requestId: JobShape.requestId,
    projectId: JobShape.projectId,
    reportVersion: JobShape.reportVersion,
    reportDigest: JobShape.reportDigest,
    sequence: zod_1.z.number().int().min(1),
    updatedAt: zod_1.z.iso.datetime(),
    phase: zod_1.z.enum(['queued', 'running', 'blocked', 'stopping']),
    message: zod_1.z.string().trim().min(1).max(1000),
    tasks: zod_1.z.strictObject({
        completed: zod_1.z.number().int().min(0),
        total: zod_1.z.number().int().min(1),
    }).refine((tasks) => tasks.completed <= tasks.total, {
        message: 'Completed tasks must not exceed total', path: ['completed'],
    }),
});
/** Correlation only; neither execution nor permission nor success is attested. */
function isDevProductionProgressForJob(raw, expectedJob) {
    const parsedProgress = exports.DevProductionProgressSchema.safeParse(raw);
    const parsedJob = production_job_js_1.DevProductionJobSchema.safeParse(expectedJob);
    if (!parsedProgress.success || !parsedJob.success)
        return false;
    const progress = parsedProgress.data;
    const job = parsedJob.data;
    return (0, capability_call_context_js_1.sameCapabilityScope)(progress.scope, job.scope)
        && progress.jobId === job.jobId
        && progress.requestId === job.requestId
        && progress.projectId === job.projectId
        && progress.reportVersion === job.reportVersion
        && progress.reportDigest === job.reportDigest;
}
//# sourceMappingURL=production-progress.js.map