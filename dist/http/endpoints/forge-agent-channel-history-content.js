import { AgentChannelHistoryTranscriptResponseSchema } from "../../agent/agent-channel-history-content.js";
import { AgentChannelAccessErrorResponseSchema } from "../../agent/agent-channel-access-requests.js";
import { AgentChannelHistoryTranscriptParamsSchema } from "./internal-agent-channel-history-content.js";
import { ForgeAgentChannelAccessAuthorizationSchema } from "./forge-agent-channel-access.js";
/** Server session evidence only. This helper does not authenticate an HTTP request. */
export function isAgentChannelHistoryTranscriptWithinForgeAuthorization(rawContent, trustedAccess, requestedAgentId) {
    const content = AgentChannelHistoryTranscriptResponseSchema.safeParse(rawContent), access = ForgeAgentChannelAccessAuthorizationSchema.safeParse(trustedAccess);
    const params = AgentChannelHistoryTranscriptParamsSchema.shape.agentId.safeParse(requestedAgentId);
    if (!content.success || !access.success || !params.success || content.data.identity.managementAgentId !== params.data)
        return false;
    return access.data.role === 'sa' || (content.data.scope.ownerId === access.data.ownerId && content.data.scope.tenantId === access.data.tenantId); // guard:transcript-owner
}
export const forgeAgentChannelHistoryTranscriptContract = {
    method: 'GET', path: '/api/agents/:agentId/channels/:kind/history/:entryId/transcript',
    authentication: 'forge-session', authorization: 'sa-or-agent-owner', cacheControl: 'no-store',
    paramsSchema: AgentChannelHistoryTranscriptParamsSchema, responseSchema: AgentChannelHistoryTranscriptResponseSchema,
    errorResponseSchema: AgentChannelAccessErrorResponseSchema,
};
export function forgeAgentChannelHistoryTranscriptPath(agentId, kind, entryId) {
    const p = AgentChannelHistoryTranscriptParamsSchema.parse({ agentId, kind, entryId });
    return forgeAgentChannelHistoryTranscriptContract.path.replace(':agentId', encodeURIComponent(p.agentId)).replace(':kind', p.kind).replace(':entryId', encodeURIComponent(p.entryId));
}
//# sourceMappingURL=forge-agent-channel-history-content.js.map