"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalAgentChannelAccessApplyContract = exports.internalAgentChannelAccessSnapshotContract = exports.AgentChannelAccessParamsSchema = void 0;
exports.internalAgentChannelAccessPath = internalAgentChannelAccessPath;
exports.internalAgentChannelAccessApplyPath = internalAgentChannelAccessApplyPath;
const agent_channel_configuration_js_1 = require("../../agent/agent-channel-configuration.cjs");
const agent_channel_access_requests_js_1 = require("../../agent/agent-channel-access-requests.cjs");
const internal_agents_management_js_1 = require("./internal-agents-management.cjs");
exports.AgentChannelAccessParamsSchema = internal_agents_management_js_1.AgentManagementParamsSchema.extend({ kind: agent_channel_configuration_js_1.AgentBirthChannelKindSchema }).strict();
/** Forge -> X9. The producer authenticates with the existing internal secret guard,
 * resolves the route identity, and applies only this door. These descriptors install no handlers.
 */
exports.internalAgentChannelAccessSnapshotContract = {
    method: 'GET', path: '/internal/agents/:agentId/channels/:kind/access', authType: 'secret',
    paramsSchema: exports.AgentChannelAccessParamsSchema, responseSchema: agent_channel_access_requests_js_1.AgentChannelAccessSnapshotSchema,
    errorResponseSchema: agent_channel_access_requests_js_1.AgentChannelAccessErrorResponseSchema,
};
exports.internalAgentChannelAccessApplyContract = {
    method: 'POST', path: '/internal/agents/:agentId/channels/:kind/access/apply', authType: 'secret',
    paramsSchema: exports.AgentChannelAccessParamsSchema, bodySchema: agent_channel_access_requests_js_1.AgentChannelAccessApplyCommandSchema,
    responseSchema: agent_channel_access_requests_js_1.AgentChannelAccessApplyResultSchema, errorResponseSchema: agent_channel_access_requests_js_1.AgentChannelAccessErrorResponseSchema,
};
function internalAgentChannelAccessPath(agentId, kind) {
    const params = exports.AgentChannelAccessParamsSchema.parse({ agentId, kind });
    return exports.internalAgentChannelAccessSnapshotContract.path.replace(':agentId', params.agentId).replace(':kind', params.kind);
}
function internalAgentChannelAccessApplyPath(agentId, kind) {
    const params = exports.AgentChannelAccessParamsSchema.parse({ agentId, kind });
    return exports.internalAgentChannelAccessApplyContract.path.replace(':agentId', params.agentId).replace(':kind', params.kind);
}
//# sourceMappingURL=internal-agent-channel-access.js.map