"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgeAgentChannelHistoryContract = void 0;
exports.isAgentChannelHistoryWithinForgeAuthorization = isAgentChannelHistoryWithinForgeAuthorization;
exports.forgeAgentChannelHistoryPath = forgeAgentChannelHistoryPath;
const agent_channel_history_js_1 = require("../../agent/agent-channel-history.cjs");
const agent_channel_access_requests_js_1 = require("../../agent/agent-channel-access-requests.cjs");
const internal_agents_management_js_1 = require("./internal-agents-management.cjs");
const internal_agent_channel_history_js_1 = require("./internal-agent-channel-history.cjs");
const forge_agent_channel_access_js_1 = require("./forge-agent-channel-access.cjs");
/** Server-only session ownership comparison; a GET never turns a historical event into readiness. */
function isAgentChannelHistoryWithinForgeAuthorization(rawHistory, trustedAccess, requestedAgentId) {
    const history = agent_channel_history_js_1.AgentChannelHistoryResponseSchema.safeParse(rawHistory);
    const access = forge_agent_channel_access_js_1.ForgeAgentChannelAccessAuthorizationSchema.safeParse(trustedAccess);
    const params = internal_agents_management_js_1.AgentManagementParamsSchema.safeParse({ agentId: requestedAgentId });
    if (!history.success || !access.success || !params.success)
        return false;
    const source = history.data;
    if (source.identity.managementAgentId !== params.data.agentId)
        return false; // guard:requested-management
    return access.data.role === 'sa' // guard:server-sa
        || (source.scope.tenantId === access.data.tenantId && source.scope.ownerId === access.data.ownerId); // guard:server-owner
}
exports.forgeAgentChannelHistoryContract = {
    method: 'GET', path: '/api/agents/:agentId/channels/:kind/history',
    authentication: 'forge-session', authorization: 'sa-or-agent-owner',
    paramsSchema: internal_agent_channel_history_js_1.AgentChannelHistoryParamsSchema, querySchema: internal_agent_channel_history_js_1.AgentChannelHistoryQuerySchema,
    responseSchema: agent_channel_history_js_1.AgentChannelHistoryResponseSchema, errorResponseSchema: agent_channel_access_requests_js_1.AgentChannelAccessErrorResponseSchema,
};
function forgeAgentChannelHistoryPath(agentId, kind) {
    const params = internal_agent_channel_history_js_1.AgentChannelHistoryParamsSchema.parse({ agentId, kind });
    return exports.forgeAgentChannelHistoryContract.path.replace(':agentId', encodeURIComponent(params.agentId)).replace(':kind', params.kind);
}
//# sourceMappingURL=forge-agent-channel-history.js.map