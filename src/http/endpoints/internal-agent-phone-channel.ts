import type { z } from 'zod';
import { AgentManagementParamsSchema } from './internal-agents-management.js';
import { AgentChannelAccessErrorResponseSchema } from '../../agent/agent-channel-access-requests.js';
import { AgentPhoneSnapshotSchema, AgentPhoneApplyCommandSchema, AgentPhoneApplyResultSchema,
  AgentPhoneInboundRouteEventSchema, AgentPhoneRouteResultSchema, AgentPhoneRuntimeSnapshotSchema, AgentPhoneRuntimeApplyResultSchema, AgentPhoneRuntimeRouteResultSchema } from '../../agent/agent-phone-commands.js';

export const AgentPhoneParamsSchema = AgentManagementParamsSchema.strict();
export type AgentPhoneParams = z.infer<typeof AgentPhoneParamsSchema>;
/** Authenticated internal service boundaries. Provider signature verification remains at its existing webhook. */
export const internalAgentPhoneSnapshotContract = {
  method: 'GET' as const, path: '/internal/agents/:agentId/channels/phone/access' as const, authType: 'secret' as const,
  paramsSchema: AgentPhoneParamsSchema, responseSchema: AgentPhoneSnapshotSchema, errorResponseSchema: AgentChannelAccessErrorResponseSchema,
} as const;
export const internalAgentPhoneApplyContract = {
  method: 'POST' as const, path: '/internal/agents/:agentId/channels/phone/access/apply' as const, authType: 'secret' as const,
  paramsSchema: AgentPhoneParamsSchema, bodySchema: AgentPhoneApplyCommandSchema,
  responseSchema: AgentPhoneApplyResultSchema, errorResponseSchema: AgentChannelAccessErrorResponseSchema,
} as const;
/** Private routing after verification, never a replacement public provider webhook or a caller admission API. */
export const internalAgentPhoneRouteContract = {
  method: 'POST' as const, path: '/internal/channels/phone/route' as const, authType: 'secret' as const,
  bodySchema: AgentPhoneInboundRouteEventSchema, responseSchema: AgentPhoneRouteResultSchema,
  errorResponseSchema: AgentChannelAccessErrorResponseSchema,
} as const;
function phonePath(template: string, agentId: string): string {
  const params = AgentPhoneParamsSchema.parse({ agentId });
  return template.replace(':agentId', encodeURIComponent(params.agentId));
}
export function internalAgentPhonePath(agentId: string): string { return phonePath(internalAgentPhoneSnapshotContract.path, agentId); }
export function internalAgentPhoneApplyPath(agentId: string): string { return phonePath(internalAgentPhoneApplyContract.path, agentId); }

/**
 * Runtime-only response views on the same private paths. Retained legacy exports describe older
 * producers; new producers and Forge clients must adopt this view together. No archive default.
 */
export const internalAgentPhoneRuntimeSnapshotContract = { ...internalAgentPhoneSnapshotContract, responseSchema: AgentPhoneRuntimeSnapshotSchema } as const;
export const internalAgentPhoneRuntimeApplyContract = { ...internalAgentPhoneApplyContract, responseSchema: AgentPhoneRuntimeApplyResultSchema } as const;
export const internalAgentPhoneRuntimeRouteContract = { ...internalAgentPhoneRouteContract, responseSchema: AgentPhoneRuntimeRouteResultSchema } as const;
