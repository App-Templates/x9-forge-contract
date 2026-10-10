"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalPhoneBackendModelSourceContract = exports.internalPrimaryModelSourceObservationContract = exports.internalAgentModelSourceObservationContract = void 0;
exports.agentModelSourceObservationPath = agentModelSourceObservationPath;
const index_js_1 = require("../../auth/index.cjs");
const agent_model_configuration_js_1 = require("../../model-router/agent-model-configuration.cjs");
const model_consumer_execution_js_1 = require("../../model-router/model-consumer-execution.cjs");
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
/** Personal voice sessions resolve the executing primary on the server, never from a guessed agent ID. */
exports.internalPrimaryModelSourceObservationContract = {
    method: 'GET',
    path: '/internal/models/primary/local-source',
    authType: 'secret',
    authHeader: index_js_1.INTERNAL_SECRET_HEADER,
    responseSchema: agent_model_configuration_js_1.AgentModelSourceObservationSchema,
};
/** cap-voice observes the server value used by its outgoing GPT-Live phone dispatcher. */
exports.internalPhoneBackendModelSourceContract = {
    method: 'POST',
    path: '/internal/live/phone-backend-source',
    authType: 'secret',
    authHeader: index_js_1.INTERNAL_SECRET_HEADER,
    requestSchema: model_consumer_execution_js_1.ModelConsumerStateRequestSchema.refine(value => value.slotId === 'voice_phone_delegation'),
    responseSchema: model_consumer_execution_js_1.ModelConsumerRuntimeStateSchema,
};
//# sourceMappingURL=internal-agent-model-source-observation.js.map