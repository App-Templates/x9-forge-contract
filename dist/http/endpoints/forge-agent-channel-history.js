import { AgentChannelHistoryResponseSchema } from "../../agent/agent-channel-history.js";
import { AgentChannelAccessErrorResponseSchema } from "../../agent/agent-channel-access-requests.js";
import { AgentManagementParamsSchema } from "./internal-agents-management.js";
import { AgentChannelHistoryParamsSchema, AgentChannelHistoryQuerySchema } from "./internal-agent-channel-history.js";
import { ForgeAgentChannelAccessAuthorizationSchema } from "./forge-agent-channel-access.js";
/** Server-only session ownership comparison; a GET never turns a historical event into readiness. */
export function isAgentChannelHistoryWithinForgeAuthorization(rawHistory, trustedAccess, requestedAgentId) {
    const history = AgentChannelHistoryResponseSchema.safeParse(rawHistory);
    const access = ForgeAgentChannelAccessAuthorizationSchema.safeParse(trustedAccess);
    const params = AgentManagementParamsSchema.safeParse({ agentId: requestedAgentId });
    if (!history.success || !access.success || !params.success)
        return false;
    const source = history.data;
    if (source.identity.managementAgentId !== params.data.agentId)
        return false; // guard:requested-management
    return access.data.role === 'sa' // guard:server-sa
        || (source.scope.tenantId === access.data.tenantId && source.scope.ownerId === access.data.ownerId); // guard:server-owner
}
export const forgeAgentChannelHistoryContract = {
    method: 'GET', path: '/api/agents/:agentId/channels/:kind/history',
    authentication: 'forge-session', authorization: 'sa-or-agent-owner',
    paramsSchema: AgentChannelHistoryParamsSchema, querySchema: AgentChannelHistoryQuerySchema,
    responseSchema: AgentChannelHistoryResponseSchema, errorResponseSchema: AgentChannelAccessErrorResponseSchema,
};
export function forgeAgentChannelHistoryPath(agentId, kind) {
    const params = AgentChannelHistoryParamsSchema.parse({ agentId, kind });
    return forgeAgentChannelHistoryContract.path.replace(':agentId', encodeURIComponent(params.agentId)).replace(':kind', params.kind);
}
//# sourceMappingURL=forge-agent-channel-history.js.map