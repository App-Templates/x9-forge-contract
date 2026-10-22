import { z } from 'zod';
import { AgentManagementParamsSchema } from "./internal-agents-management.js";
import { AgentChannelHistoryKindSchema, AgentChannelHistoryResponseSchema } from "../../agent/agent-channel-history.js";
import { AgentManagementRequestIdSchema } from "../../agent/agent-management.js";
import { AgentChannelAccessErrorResponseSchema } from "../../agent/agent-channel-access-requests.js";
export const AgentChannelHistoryParamsSchema = AgentManagementParamsSchema.extend({ kind: AgentChannelHistoryKindSchema }).strict();
export const AgentChannelHistoryQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(20), cursor: AgentManagementRequestIdSchema.optional(),
}).strict();
/** Existing authenticated writers remain authoritative; no raw events, content or credential fields. */
export const internalAgentChannelHistoryContract = {
    method: 'GET', path: '/internal/agents/:agentId/channels/:kind/history', authType: 'secret',
    paramsSchema: AgentChannelHistoryParamsSchema, querySchema: AgentChannelHistoryQuerySchema,
    responseSchema: AgentChannelHistoryResponseSchema, errorResponseSchema: AgentChannelAccessErrorResponseSchema,
};
export function internalAgentChannelHistoryPath(agentId, kind) {
    const params = AgentChannelHistoryParamsSchema.parse({ agentId, kind });
    return internalAgentChannelHistoryContract.path.replace(':agentId', encodeURIComponent(params.agentId)).replace(':kind', params.kind);
}
//# sourceMappingURL=internal-agent-channel-history.js.map