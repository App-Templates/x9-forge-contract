"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalAgentModelCatalogContract = void 0;
exports.agentModelCatalogPath = agentModelCatalogPath;
const index_js_1 = require("../../auth/index.cjs");
const model_catalog_js_1 = require("../../model-router/model-catalog.cjs");
const internal_agents_management_js_1 = require("./internal-agents-management.cjs");
/** Metadata-only discovery scoped to the management agent and its effective credentials. */
exports.internalAgentModelCatalogContract = {
    method: 'GET',
    path: '/internal/agents/:agentId/models/catalog',
    authType: 'secret',
    authHeader: index_js_1.INTERNAL_SECRET_HEADER,
    paramsSchema: internal_agents_management_js_1.AgentManagementParamsSchema,
    responseSchema: model_catalog_js_1.ModelCatalogSchema,
};
function agentModelCatalogPath(agentId) {
    return exports.internalAgentModelCatalogContract.path.replace(':agentId', internal_agents_management_js_1.AgentManagementParamsSchema.parse({ agentId }).agentId);
}
//# sourceMappingURL=internal-agent-model-catalog.js.map