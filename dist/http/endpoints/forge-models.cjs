"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgeModelsProgressContract = exports.forgeModelsBatchContract = exports.forgeModelsPreviewContract = exports.forgeModelsCatalogContract = exports.forgeModelsOverviewContract = exports.ForgeModelsProgressSchema = exports.ForgeModelsAccessSchema = void 0;
exports.isAgentModelsOverviewWithinAccess = isAgentModelsOverviewWithinAccess;
exports.isAgentModelsBatchWithinAccess = isAgentModelsBatchWithinAccess;
const zod_1 = require("zod");
const agent_identity_js_1 = require("../../agent/agent-identity.cjs");
const agent_management_js_1 = require("../../agent/agent-management.cjs");
const model_catalog_js_1 = require("../../model-router/model-catalog.cjs");
const models_batch_js_1 = require("../../model-router/models-batch.cjs");
const agent_model_configuration_js_1 = require("../../model-router/agent-model-configuration.cjs");
const internal_agents_management_js_1 = require("./internal-agents-management.cjs");
/** Derived ONLY from the authenticated Forge session; never accepted from request bodies/headers as authorization. */
exports.ForgeModelsAccessSchema = zod_1.z.discriminatedUnion('role', [
    zod_1.z.object({ role: zod_1.z.literal('sa') }).strict(),
    zod_1.z.object({ role: zod_1.z.literal('owner'), ownerId: agent_identity_js_1.OwnerIdSchema }).strict(),
]);
function isAgentModelsOverviewWithinAccess(input, trustedAccess) {
    const overview = models_batch_js_1.AgentModelsOverviewSchema.safeParse(input);
    const access = exports.ForgeModelsAccessSchema.safeParse(trustedAccess);
    if (!overview.success || !access.success)
        return false;
    return access.data.role === 'sa' || [...overview.data.rows, ...(overview.data.coverage ?? [])].every(row => access.data.role === 'owner' && row.ownerId === access.data.ownerId);
}
function isAgentModelsBatchWithinAccess(input, serverOverview, trustedAccess) {
    const request = models_batch_js_1.AgentModelsBatchIntentSchema.safeParse(input);
    const overview = models_batch_js_1.AgentModelsOverviewSchema.safeParse(serverOverview);
    const access = exports.ForgeModelsAccessSchema.safeParse(trustedAccess);
    if (!request.success || !overview.success || !access.success)
        return false;
    return request.data.agents.every(agent => agent.changes.every(change => {
        const row = overview.data.rows.find(entry => entry.identity.managementAgentId === agent.identity.managementAgentId && entry.slotId === change.slotId);
        return row !== undefined && (0, agent_model_configuration_js_1.sameModelAgentIdentity)(row.identity, agent.identity) && (access.data.role === 'sa' || row.ownerId === access.data.ownerId);
    }));
}
exports.ForgeModelsProgressSchema = zod_1.z.object({ requestId: agent_management_js_1.AgentManagementRequestIdSchema, batch: models_batch_js_1.AgentModelsBatchResultSchema.nullable(), overview: models_batch_js_1.AgentModelsOverviewSchema }).strict().superRefine((progress, ctx) => {
    if (progress.batch !== null && progress.batch.requestId !== progress.requestId)
        ctx.addIssue({ code: 'custom', path: ['batch', 'requestId'], message: 'Progress belongs to the requested batch' });
});
/** Browser -> Forge session facade. These are NOT S2S EndpointContract objects and carry no service header.
 * Producers reuse requireAuth/requireAgentOwnership/isSuperadmin and existing slot writers. Catalog and progress
 * reads must check the addressed agent/stored batch ownership too. M5 must install handlers before UI activation.
 */
const browserAuthentication = { authentication: 'forge-session', authorization: 'sa-or-agent-owner' };
exports.forgeModelsOverviewContract = { ...browserAuthentication, method: 'GET', path: '/api/models/overview', responseSchema: models_batch_js_1.AgentModelsOverviewSchema };
exports.forgeModelsCatalogContract = { ...browserAuthentication, method: 'GET', path: '/api/models/agents/:agentId/catalog', paramsSchema: internal_agents_management_js_1.AgentManagementParamsSchema, responseSchema: model_catalog_js_1.ModelCatalogSchema };
exports.forgeModelsPreviewContract = { ...browserAuthentication, method: 'POST', path: '/api/models/preview', bodySchema: models_batch_js_1.AgentModelsBatchPreviewRequestSchema, responseSchema: models_batch_js_1.AgentModelsBatchPreviewSchema };
exports.forgeModelsBatchContract = { ...browserAuthentication, method: 'POST', path: '/api/models/batch', bodySchema: models_batch_js_1.AgentModelsBatchRequestSchema, responseSchema: models_batch_js_1.AgentModelsBatchResultSchema };
exports.forgeModelsProgressContract = { ...browserAuthentication, method: 'GET', path: '/api/models/progress/:requestId', paramsSchema: zod_1.z.object({ requestId: agent_management_js_1.AgentManagementRequestIdSchema }).strict(), responseSchema: exports.ForgeModelsProgressSchema };
//# sourceMappingURL=forge-models.js.map