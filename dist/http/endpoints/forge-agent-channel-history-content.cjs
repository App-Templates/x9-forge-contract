"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgeAgentChannelHistoryTranscriptContract = void 0;
exports.isAgentChannelHistoryTranscriptWithinForgeAuthorization = isAgentChannelHistoryTranscriptWithinForgeAuthorization;
exports.forgeAgentChannelHistoryTranscriptPath = forgeAgentChannelHistoryTranscriptPath;
const agent_channel_history_content_js_1 = require("../../agent/agent-channel-history-content.cjs");
const agent_channel_access_requests_js_1 = require("../../agent/agent-channel-access-requests.cjs");
const internal_agent_channel_history_content_js_1 = require("./internal-agent-channel-history-content.cjs");
const forge_agent_channel_access_js_1 = require("./forge-agent-channel-access.cjs");
/** Server session evidence only. This helper does not authenticate an HTTP request. */
function isAgentChannelHistoryTranscriptWithinForgeAuthorization(rawContent, trustedAccess, requestedAgentId) {
    const content = agent_channel_history_content_js_1.AgentChannelHistoryTranscriptResponseSchema.safeParse(rawContent), access = forge_agent_channel_access_js_1.ForgeAgentChannelAccessAuthorizationSchema.safeParse(trustedAccess);
    const params = internal_agent_channel_history_content_js_1.AgentChannelHistoryTranscriptParamsSchema.shape.agentId.safeParse(requestedAgentId);
    if (!content.success || !access.success || !params.success || content.data.identity.managementAgentId !== params.data)
        return false;
    return access.data.role === 'sa' || (content.data.scope.ownerId === access.data.ownerId && content.data.scope.tenantId === access.data.tenantId); // guard:transcript-owner
}
exports.forgeAgentChannelHistoryTranscriptContract = {
    method: 'GET', path: '/api/agents/:agentId/channels/:kind/history/:entryId/transcript',
    authentication: 'forge-session', authorization: 'sa-or-agent-owner', cacheControl: 'no-store',
    paramsSchema: internal_agent_channel_history_content_js_1.AgentChannelHistoryTranscriptParamsSchema, responseSchema: agent_channel_history_content_js_1.AgentChannelHistoryTranscriptResponseSchema,
    errorResponseSchema: agent_channel_access_requests_js_1.AgentChannelAccessErrorResponseSchema,
};
function forgeAgentChannelHistoryTranscriptPath(agentId, kind, entryId) {
    const p = internal_agent_channel_history_content_js_1.AgentChannelHistoryTranscriptParamsSchema.parse({ agentId, kind, entryId });
    return exports.forgeAgentChannelHistoryTranscriptContract.path.replace(':agentId', encodeURIComponent(p.agentId)).replace(':kind', p.kind).replace(':entryId', encodeURIComponent(p.entryId));
}
//# sourceMappingURL=forge-agent-channel-history-content.js.map