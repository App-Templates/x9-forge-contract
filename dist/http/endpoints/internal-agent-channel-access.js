import { AgentBirthChannelKindSchema } from "../../agent/agent-channel-configuration.js";
import { AgentChannelAccessApplyCommandSchema, AgentChannelAccessApplyResultSchema, AgentChannelAccessErrorResponseSchema, AgentChannelAccessSnapshotSchema } from "../../agent/agent-channel-access-requests.js";
import { AgentManagementParamsSchema } from "./internal-agents-management.js";
export const AgentChannelAccessParamsSchema = AgentManagementParamsSchema.extend({ kind: AgentBirthChannelKindSchema }).strict();
/** Forge -> X9. The producer authenticates with the existing internal secret guard,
 * resolves the route identity, and applies only this door. These descriptors install no handlers.
 */
export const internalAgentChannelAccessSnapshotContract = {
    method: 'GET', path: '/internal/agents/:agentId/channels/:kind/access', authType: 'secret',
    paramsSchema: AgentChannelAccessParamsSchema, responseSchema: AgentChannelAccessSnapshotSchema,
    errorResponseSchema: AgentChannelAccessErrorResponseSchema,
};
export const internalAgentChannelAccessApplyContract = {
    method: 'POST', path: '/internal/agents/:agentId/channels/:kind/access/apply', authType: 'secret',
    paramsSchema: AgentChannelAccessParamsSchema, bodySchema: AgentChannelAccessApplyCommandSchema,
    responseSchema: AgentChannelAccessApplyResultSchema, errorResponseSchema: AgentChannelAccessErrorResponseSchema,
};
export function internalAgentChannelAccessPath(agentId, kind) {
    const params = AgentChannelAccessParamsSchema.parse({ agentId, kind });
    return internalAgentChannelAccessSnapshotContract.path.replace(':agentId', params.agentId).replace(':kind', params.kind);
}
export function internalAgentChannelAccessApplyPath(agentId, kind) {
    const params = AgentChannelAccessParamsSchema.parse({ agentId, kind });
    return internalAgentChannelAccessApplyContract.path.replace(':agentId', params.agentId).replace(':kind', params.kind);
}
//# sourceMappingURL=internal-agent-channel-access.js.map