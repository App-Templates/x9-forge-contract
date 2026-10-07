"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalAgentModelsStateContract = exports.internalModelsBatchContract = exports.internalModelsPreviewContract = exports.internalModelsOverviewContract = void 0;
exports.agentModelsStatePath = agentModelsStatePath;
const index_js_1 = require("../../auth/index.cjs");
const agent_model_configuration_js_1 = require("../../model-router/agent-model-configuration.cjs");
const models_batch_js_1 = require("../../model-router/models-batch.cjs");
const internal_agents_management_js_1 = require("./internal-agents-management.cjs");
/** Control-plane aggregation contracts; the authenticated Forge browser facade reuses these DTOs.
 * Producers must use existing slot writers and per-agent commands. This bridge does not install handlers.
 */
exports.internalModelsOverviewContract = {
    method: 'GET', path: '/internal/models/overview',
    authType: 'secret', authHeader: index_js_1.INTERNAL_SECRET_HEADER,
    responseSchema: models_batch_js_1.AgentModelsOverviewSchema,
};
exports.internalModelsPreviewContract = {
    method: 'POST', path: '/internal/models/preview',
    authType: 'secret', authHeader: index_js_1.INTERNAL_SECRET_HEADER,
    bodySchema: models_batch_js_1.AgentModelsBatchPreviewRequestSchema, responseSchema: models_batch_js_1.AgentModelsBatchPreviewSchema,
};
exports.internalModelsBatchContract = {
    method: 'POST', path: '/internal/models/batch',
    authType: 'secret', authHeader: index_js_1.INTERNAL_SECRET_HEADER,
    bodySchema: models_batch_js_1.AgentModelsBatchRequestSchema, responseSchema: models_batch_js_1.AgentModelsBatchResultSchema,
};
exports.internalAgentModelsStateContract = {
    method: 'GET', path: '/internal/agents/:agentId/models/state',
    authType: 'secret', authHeader: index_js_1.INTERNAL_SECRET_HEADER,
    paramsSchema: internal_agents_management_js_1.AgentManagementParamsSchema, responseSchema: agent_model_configuration_js_1.AgentModelsStateSchema,
};
function agentModelsStatePath(agentId) {
    return exports.internalAgentModelsStateContract.path.replace(':agentId', internal_agents_management_js_1.AgentManagementParamsSchema.parse({ agentId }).agentId);
}
//# sourceMappingURL=internal-models-batch.js.map