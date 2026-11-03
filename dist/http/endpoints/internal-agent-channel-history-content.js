import { AgentChannelHistoryParamsSchema } from "./internal-agent-channel-history.js";
import { AgentManagementRequestIdSchema } from "../../agent/agent-management.js";
import { AgentChannelHistoryTranscriptResponseSchema } from "../../agent/agent-channel-history-content.js";
import { AgentChannelAccessErrorResponseSchema } from "../../agent/agent-channel-access-requests.js";
export const AgentChannelHistoryTranscriptParamsSchema = AgentChannelHistoryParamsSchema.extend({ entryId: AgentManagementRequestIdSchema }).strict();
/** Internal authentication is mandatory; producers never accept a provider id or URL from the caller. */
export const internalAgentChannelHistoryTranscriptContract = {
    method: 'GET', path: '/internal/agents/:agentId/channels/:kind/history/:entryId/transcript', authType: 'secret',
    cacheControl: 'no-store', paramsSchema: AgentChannelHistoryTranscriptParamsSchema,
    responseSchema: AgentChannelHistoryTranscriptResponseSchema, errorResponseSchema: AgentChannelAccessErrorResponseSchema,
};
export function internalAgentChannelHistoryTranscriptPath(agentId, kind, entryId) {
    const p = AgentChannelHistoryTranscriptParamsSchema.parse({ agentId, kind, entryId });
    return internalAgentChannelHistoryTranscriptContract.path.replace(':agentId', encodeURIComponent(p.agentId)).replace(':kind', p.kind).replace(':entryId', encodeURIComponent(p.entryId));
}
//# sourceMappingURL=internal-agent-channel-history-content.js.map