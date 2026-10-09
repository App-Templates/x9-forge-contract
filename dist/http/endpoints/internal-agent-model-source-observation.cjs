"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalAgentModelSourceObservationContract = void 0;
exports.agentModelSourceObservationPath = agentModelSourceObservationPath;
const index_js_1 = require("../../auth/index.cjs");
const agent_model_configuration_js_1 = require("../../model-router/agent-model-configuration.cjs");
const internal_agents_management_js_1 = require("./internal-agents-management.cjs");
/** Local loaded generation, available before priming without querying aggregate consumer state.
 * This observation grants no Master role; producers must recheck the generation after awaits.
 */
exports.internalAgentModelSourceObservationContract = {
    method: 'GET',
    path: '/internal/agents/:agentId/models/local-source',
    authType: 'secret',
    authHeader: index_js_1.INTERNAL_SECRET_HEADER,
    paramsSchema: internal_agents_management_js_1.AgentManagementParamsSchema,
    responseSchema: agent_model_configuration_js_1.AgentModelSourceObservationSchema,
};
function agentModelSourceObservationPath(agentId) {
    return exports.internalAgentModelSourceObservationContract.path.replace(':agentId', internal_agents_management_js_1.AgentManagementParamsSchema.parse({ agentId }).agentId);
}
//# sourceMappingURL=internal-agent-model-source-observation.js.map