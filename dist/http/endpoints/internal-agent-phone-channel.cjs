"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalAgentPhoneRouteContract = exports.internalAgentPhoneApplyContract = exports.internalAgentPhoneSnapshotContract = exports.AgentPhoneParamsSchema = void 0;
exports.internalAgentPhonePath = internalAgentPhonePath;
exports.internalAgentPhoneApplyPath = internalAgentPhoneApplyPath;
const internal_agents_management_js_1 = require("./internal-agents-management.cjs");
const agent_channel_access_requests_js_1 = require("../../agent/agent-channel-access-requests.cjs");
const agent_phone_commands_js_1 = require("../../agent/agent-phone-commands.cjs");
exports.AgentPhoneParamsSchema = internal_agents_management_js_1.AgentManagementParamsSchema.strict();
/** Authenticated internal service boundaries. Provider signature verification remains at its existing webhook. */
exports.internalAgentPhoneSnapshotContract = {
    method: 'GET', path: '/internal/agents/:agentId/channels/phone/access', authType: 'secret',
    paramsSchema: exports.AgentPhoneParamsSchema, responseSchema: agent_phone_commands_js_1.AgentPhoneSnapshotSchema, errorResponseSchema: agent_channel_access_requests_js_1.AgentChannelAccessErrorResponseSchema,
};
exports.internalAgentPhoneApplyContract = {
    method: 'POST', path: '/internal/agents/:agentId/channels/phone/access/apply', authType: 'secret',
    paramsSchema: exports.AgentPhoneParamsSchema, bodySchema: agent_phone_commands_js_1.AgentPhoneApplyCommandSchema,
    responseSchema: agent_phone_commands_js_1.AgentPhoneApplyResultSchema, errorResponseSchema: agent_channel_access_requests_js_1.AgentChannelAccessErrorResponseSchema,
};
/** Private routing after verification, never a replacement public provider webhook or a caller admission API. */
exports.internalAgentPhoneRouteContract = {
    method: 'POST', path: '/internal/channels/phone/route', authType: 'secret',
    bodySchema: agent_phone_commands_js_1.AgentPhoneInboundRouteEventSchema, responseSchema: agent_phone_commands_js_1.AgentPhoneRouteResultSchema,
    errorResponseSchema: agent_channel_access_requests_js_1.AgentChannelAccessErrorResponseSchema,
};
function phonePath(template, agentId) {
    const params = exports.AgentPhoneParamsSchema.parse({ agentId });
    return template.replace(':agentId', encodeURIComponent(params.agentId));
}
function internalAgentPhonePath(agentId) { return phonePath(exports.internalAgentPhoneSnapshotContract.path, agentId); }
function internalAgentPhoneApplyPath(agentId) { return phonePath(exports.internalAgentPhoneApplyContract.path, agentId); }
//# sourceMappingURL=internal-agent-phone-channel.js.map