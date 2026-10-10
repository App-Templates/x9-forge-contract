"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalAgentChannelHistoryTranscriptContract = exports.AgentChannelHistoryTranscriptParamsSchema = void 0;
exports.internalAgentChannelHistoryTranscriptPath = internalAgentChannelHistoryTranscriptPath;
const internal_agent_channel_history_js_1 = require("./internal-agent-channel-history.cjs");
const agent_management_js_1 = require("../../agent/agent-management.cjs");
const agent_channel_history_content_js_1 = require("../../agent/agent-channel-history-content.cjs");
const agent_channel_access_requests_js_1 = require("../../agent/agent-channel-access-requests.cjs");
exports.AgentChannelHistoryTranscriptParamsSchema = internal_agent_channel_history_js_1.AgentChannelHistoryParamsSchema.extend({ entryId: agent_management_js_1.AgentManagementRequestIdSchema }).strict();
/** Internal authentication is mandatory; producers never accept a provider id or URL from the caller. */
exports.internalAgentChannelHistoryTranscriptContract = {
    method: 'GET', path: '/internal/agents/:agentId/channels/:kind/history/:entryId/transcript', authType: 'secret',
    cacheControl: 'no-store', paramsSchema: exports.AgentChannelHistoryTranscriptParamsSchema,
    responseSchema: agent_channel_history_content_js_1.AgentChannelHistoryTranscriptResponseSchema, errorResponseSchema: agent_channel_access_requests_js_1.AgentChannelAccessErrorResponseSchema,
};
function internalAgentChannelHistoryTranscriptPath(agentId, kind, entryId) {
    const p = exports.AgentChannelHistoryTranscriptParamsSchema.parse({ agentId, kind, entryId });
    return exports.internalAgentChannelHistoryTranscriptContract.path.replace(':agentId', encodeURIComponent(p.agentId)).replace(':kind', p.kind).replace(':entryId', encodeURIComponent(p.entryId));
}
//# sourceMappingURL=internal-agent-channel-history-content.js.map