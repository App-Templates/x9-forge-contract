"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalAgentChannelHistoryContract = exports.AgentChannelHistoryQuerySchema = exports.AgentChannelHistoryParamsSchema = void 0;
exports.internalAgentChannelHistoryPath = internalAgentChannelHistoryPath;
const zod_1 = require("zod");
const internal_agents_management_js_1 = require("./internal-agents-management.cjs");
const agent_channel_history_js_1 = require("../../agent/agent-channel-history.cjs");
const agent_management_js_1 = require("../../agent/agent-management.cjs");
const agent_channel_access_requests_js_1 = require("../../agent/agent-channel-access-requests.cjs");
exports.AgentChannelHistoryParamsSchema = internal_agents_management_js_1.AgentManagementParamsSchema.extend({ kind: agent_channel_history_js_1.AgentChannelHistoryKindSchema }).strict();
exports.AgentChannelHistoryQuerySchema = zod_1.z.object({
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20), cursor: agent_management_js_1.AgentManagementRequestIdSchema.optional(),
}).strict();
/** Existing authenticated writers remain authoritative; no raw events, content or credential fields. */
exports.internalAgentChannelHistoryContract = {
    method: 'GET', path: '/internal/agents/:agentId/channels/:kind/history', authType: 'secret',
    paramsSchema: exports.AgentChannelHistoryParamsSchema, querySchema: exports.AgentChannelHistoryQuerySchema,
    responseSchema: agent_channel_history_js_1.AgentChannelHistoryResponseSchema, errorResponseSchema: agent_channel_access_requests_js_1.AgentChannelAccessErrorResponseSchema,
};
function internalAgentChannelHistoryPath(agentId, kind) {
    const params = exports.AgentChannelHistoryParamsSchema.parse({ agentId, kind });
    return exports.internalAgentChannelHistoryContract.path.replace(':agentId', encodeURIComponent(params.agentId)).replace(':kind', params.kind);
}
//# sourceMappingURL=internal-agent-channel-history.js.map