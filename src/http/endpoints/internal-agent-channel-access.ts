import type { z } from 'zod';
import { AgentBirthChannelKindSchema } from '../../agent/agent-channel-configuration.js';
import { AgentChannelAccessApplyCommandSchema, AgentChannelAccessApplyResultSchema, AgentChannelAccessErrorResponseSchema, AgentChannelAccessSnapshotSchema } from '../../agent/agent-channel-access-requests.js';
import { AgentManagementParamsSchema } from './internal-agents-management.js';

export const AgentChannelAccessParamsSchema = AgentManagementParamsSchema.extend({ kind: AgentBirthChannelKindSchema }).strict();
export type AgentChannelAccessParams = z.infer<typeof AgentChannelAccessParamsSchema>;

/** Forge -> X9. The producer authenticates with the existing internal secret guard,
 * resolves the route identity, and applies only this door. These descriptors install no handlers.
 */
export const internalAgentChannelAccessSnapshotContract = {
  method: 'GET' as const, path: '/internal/agents/:agentId/channels/:kind/access' as const, authType: 'secret' as const,
  paramsSchema: AgentChannelAccessParamsSchema, responseSchema: AgentChannelAccessSnapshotSchema,
  errorResponseSchema: AgentChannelAccessErrorResponseSchema,
} as const;
export const internalAgentChannelAccessApplyContract = {
  method: 'POST' as const, path: '/internal/agents/:agentId/channels/:kind/access/apply' as const, authType: 'secret' as const,
  paramsSchema: AgentChannelAccessParamsSchema, bodySchema: AgentChannelAccessApplyCommandSchema,
  responseSchema: AgentChannelAccessApplyResultSchema, errorResponseSchema: AgentChannelAccessErrorResponseSchema,
} as const;

export function internalAgentChannelAccessPath(agentId: string, kind: string): string {
  const params = AgentChannelAccessParamsSchema.parse({ agentId, kind });
  return internalAgentChannelAccessSnapshotContract.path.replace(':agentId', params.agentId).replace(':kind', params.kind);
}
export function internalAgentChannelAccessApplyPath(agentId: string, kind: string): string {
  const params = AgentChannelAccessParamsSchema.parse({ agentId, kind });
  return internalAgentChannelAccessApplyContract.path.replace(':agentId', params.agentId).replace(':kind', params.kind);
}
