import { AgentManagementParamsSchema } from "./internal-agents-management.js";
import { AgentChannelAccessErrorResponseSchema } from "../../agent/agent-channel-access-requests.js";
import { AgentPhoneSnapshotSchema, AgentPhoneApplyCommandSchema, AgentPhoneApplyResultSchema, AgentPhoneInboundRouteEventSchema, AgentPhoneRouteResultSchema, AgentPhoneRuntimeSnapshotSchema, AgentPhoneRuntimeApplyResultSchema, AgentPhoneRuntimeRouteResultSchema } from "../../agent/agent-phone-commands.js";
export const AgentPhoneParamsSchema = AgentManagementParamsSchema.strict();
/** Authenticated internal service boundaries. Provider signature verification remains at its existing webhook. */
export const internalAgentPhoneSnapshotContract = {
    method: 'GET', path: '/internal/agents/:agentId/channels/phone/access', authType: 'secret',
    paramsSchema: AgentPhoneParamsSchema, responseSchema: AgentPhoneSnapshotSchema, errorResponseSchema: AgentChannelAccessErrorResponseSchema,
};
export const internalAgentPhoneApplyContract = {
    method: 'POST', path: '/internal/agents/:agentId/channels/phone/access/apply', authType: 'secret',
    paramsSchema: AgentPhoneParamsSchema, bodySchema: AgentPhoneApplyCommandSchema,
    responseSchema: AgentPhoneApplyResultSchema, errorResponseSchema: AgentChannelAccessErrorResponseSchema,
};
/** Private routing after verification, never a replacement public provider webhook or a caller admission API. */
export const internalAgentPhoneRouteContract = {
    method: 'POST', path: '/internal/channels/phone/route', authType: 'secret',
    bodySchema: AgentPhoneInboundRouteEventSchema, responseSchema: AgentPhoneRouteResultSchema,
    errorResponseSchema: AgentChannelAccessErrorResponseSchema,
};
function phonePath(template, agentId) {
    const params = AgentPhoneParamsSchema.parse({ agentId });
    return template.replace(':agentId', encodeURIComponent(params.agentId));
}
export function internalAgentPhonePath(agentId) { return phonePath(internalAgentPhoneSnapshotContract.path, agentId); }
export function internalAgentPhoneApplyPath(agentId) { return phonePath(internalAgentPhoneApplyContract.path, agentId); }
/**
 * Runtime-only response views on the same private paths. Retained legacy exports describe older
 * producers; new producers and Forge clients must adopt this view together. No archive default.
 */
export const internalAgentPhoneRuntimeSnapshotContract = { ...internalAgentPhoneSnapshotContract, responseSchema: AgentPhoneRuntimeSnapshotSchema };
export const internalAgentPhoneRuntimeApplyContract = { ...internalAgentPhoneApplyContract, responseSchema: AgentPhoneRuntimeApplyResultSchema };
export const internalAgentPhoneRuntimeRouteContract = { ...internalAgentPhoneRouteContract, responseSchema: AgentPhoneRuntimeRouteResultSchema };
//# sourceMappingURL=internal-agent-phone-channel.js.map