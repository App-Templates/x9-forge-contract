"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDevProductionJobsContract = exports.DevProductionJobsPageSchema = void 0;
exports.selectDevProductionJobsPage = selectDevProductionJobsPage;
const zod_1 = require("zod");
const internal_capability_agent_js_1 = require("./internal-capability-agent.cjs");
const capability_call_context_js_1 = require("../../capability/capability-call-context.cjs");
const production_job_js_1 = require("../../capability/dev/production-job.cjs");
exports.DevProductionJobsPageSchema = zod_1.z.strictObject({
    items: zod_1.z.array(production_job_js_1.DevProductionJobSchema).max(50),
    nextCursor: zod_1.z.string().trim().min(1).max(512).nullable(),
}).refine(page => new Set(page.items.map(job => job.jobId)).size === page.items.length, {
    message: 'Job IDs must be unique', path: ['items'],
}).refine(page => {
    const [first] = page.items;
    return first === undefined || page.items.every(job => (0, capability_call_context_js_1.sameCapabilityScope)(job.scope, first.scope));
}, {
    message: 'All jobs must have the same scope', path: ['items'],
});
/**
 * Read persisted assignments in a stable service-owned order with an opaque cursor.
 * The service must authenticate the owner and compare path agentId and query scope
 * with its registry, isolating both pagination and data between owners. Uniform page
 * scope alone does not authenticate or correlate a response with the request.
 * Reading never enqueues, retries or creates jobs. Use the existing progress detail
 * route and, when available, the result route; this list does not depend on results.
 */
exports.listDevProductionJobsContract = {
    method: 'GET',
    path: '/internal/capability/agents/:agentId/dev/jobs',
    authType: 'secret',
    paramsSchema: internal_capability_agent_js_1.CapabilityAgentParamsSchema.strict(),
    querySchema: zod_1.z.strictObject({
        scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
        cursor: zod_1.z.string().trim().min(1).max(512).optional(),
        limit: zod_1.z.number().int().min(1).max(50).default(20),
    }),
    responseSchema: exports.DevProductionJobsPageSchema,
};
/**
 * Accept a jobs page only when it is valid, within the requested limit and entirely in the requested
 * scope. Returns a detached parsed copy (order, cursor and content intact) or null; foreign rows are
 * never filtered out and errors never become an empty page. The authenticated owner and the cursor stay
 * the server's responsibility: this check proves neither ownership, freshness nor global ordering.
 */
function selectDevProductionJobsPage(rawPage, expectedQuery) {
    const query = exports.listDevProductionJobsContract.querySchema.safeParse(expectedQuery);
    const page = exports.DevProductionJobsPageSchema.safeParse(rawPage);
    if (!query.success || !page.success)
        return null;
    if (page.data.items.length > query.data.limit)
        return null;
    if (!page.data.items.every(job => (0, capability_call_context_js_1.sameCapabilityScope)(job.scope, query.data.scope)))
        return null;
    return page.data;
}
//# sourceMappingURL=internal-dev-jobs.js.map