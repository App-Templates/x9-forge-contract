"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.labExportContract = exports.labGapsContract = exports.labCompetenceContract = exports.labGrowthHistoryContract = exports.labPageDetailContract = exports.labPagesContract = exports.labScopeQuerySchema = exports.LabHttpErrorSchema = void 0;
const zod_1 = require("zod");
const internal_capability_agent_js_1 = require("./internal-capability-agent.cjs");
const browse_js_1 = require("../../capability/lab/browse.cjs");
const growth_js_1 = require("../../capability/lab/growth.cjs");
const tools_js_1 = require("../../capability/lab/tools.cjs");
const wiki_js_1 = require("../../capability/lab/wiki.cjs");
/** Named failures for notebook HTTP reads and exports. */
exports.LabHttpErrorSchema = zod_1.z.object({
    ok: zod_1.z.literal(false),
    error: zod_1.z.enum(['invalid_request', 'not_configured', 'not_found', 'not_ready', 'scope_foreign', 'unavailable', 'timeout']),
}).strict();
/** HTTP scope excludes the agent identity supplied by the route parameters. */
exports.labScopeQuerySchema = growth_js_1.LabScopeSchema.pick({ tenantId: true, ownerId: true }).strict();
/** List pages in the scoped agent notebook. */
exports.labPagesContract = {
    method: 'GET',
    path: '/internal/capability/agents/:agentId/lab/pages',
    authType: 'secret',
    paramsSchema: internal_capability_agent_js_1.CapabilityAgentParamsSchema,
    querySchema: exports.labScopeQuerySchema.extend({
        limit: zod_1.z.coerce.number().int().min(1).max(200).default(50),
        cursor: browse_js_1.LabPageListInputSchema.shape.cursor,
    }).strict(),
    responseSchema: browse_js_1.LabPageListOutputSchema,
    errorResponseSchema: exports.LabHttpErrorSchema,
};
/** Read a notebook page at its current or requested version. */
exports.labPageDetailContract = {
    method: 'GET',
    path: '/internal/capability/agents/:agentId/lab/pages/:slug',
    authType: 'secret',
    paramsSchema: internal_capability_agent_js_1.CapabilityAgentParamsSchema.extend({ slug: wiki_js_1.WikiPageSlugSchema }).strict(),
    querySchema: exports.labScopeQuerySchema.extend({
        version: zod_1.z.coerce.number().pipe(browse_js_1.LabPageDetailInputSchema.shape.version.unwrap()).optional(),
    }).strict(),
    responseSchema: browse_js_1.LabPageDetailOutputSchema,
    errorResponseSchema: exports.LabHttpErrorSchema,
};
/** Read paginated notebook growth measurements. */
exports.labGrowthHistoryContract = {
    method: 'GET',
    path: '/internal/capability/agents/:agentId/lab/growth/history',
    authType: 'secret',
    paramsSchema: internal_capability_agent_js_1.CapabilityAgentParamsSchema,
    querySchema: exports.labScopeQuerySchema.extend({
        limit: zod_1.z.coerce.number().int().min(1).max(500).default(100),
        cursor: growth_js_1.LabGrowthHistoryInputSchema.shape.cursor,
    }).strict(),
    responseSchema: growth_js_1.LabGrowthHistoryOutputSchema,
    errorResponseSchema: exports.LabHttpErrorSchema,
};
/** Read competence with its snapshot and measurement method. */
exports.labCompetenceContract = {
    method: 'GET',
    path: '/internal/capability/agents/:agentId/lab/competence',
    authType: 'secret',
    paramsSchema: internal_capability_agent_js_1.CapabilityAgentParamsSchema,
    querySchema: exports.labScopeQuerySchema,
    responseSchema: tools_js_1.LabCompetenceOutputSchema.extend({
        snapshotVersion: browse_js_1.LabPageListOutputSchema.shape.snapshotVersion,
        method: growth_js_1.LabGrowthPointSchema.shape.method,
        methodVersion: growth_js_1.LabGrowthPointSchema.shape.methodVersion,
    }),
    errorResponseSchema: exports.LabHttpErrorSchema,
};
/** Read the notebook's open competence gaps. */
exports.labGapsContract = {
    method: 'GET',
    path: '/internal/capability/agents/:agentId/lab/gaps',
    authType: 'secret',
    paramsSchema: internal_capability_agent_js_1.CapabilityAgentParamsSchema,
    querySchema: exports.labScopeQuerySchema.extend({ limit: zod_1.z.coerce.number().int().min(1).max(50).optional() }).strict(),
    responseSchema: tools_js_1.LabGapsOutputSchema.extend({ snapshotVersion: browse_js_1.LabPageListOutputSchema.shape.snapshotVersion }),
    errorResponseSchema: exports.LabHttpErrorSchema,
};
/** Export a scoped notebook with the agent identity supplied only by the path. */
exports.labExportContract = {
    method: 'POST',
    path: '/internal/capability/agents/:agentId/lab/export',
    authType: 'secret',
    paramsSchema: internal_capability_agent_js_1.CapabilityAgentParamsSchema,
    bodySchema: browse_js_1.LabExportRequestSchema.extend({ scope: exports.labScopeQuerySchema }).strict(),
    responseSchema: browse_js_1.LabExportResultSchema,
    errorResponseSchema: exports.LabHttpErrorSchema,
};
//# sourceMappingURL=internal-capability-lab.js.map