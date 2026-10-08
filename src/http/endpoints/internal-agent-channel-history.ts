import { z } from 'zod';
import { AgentManagementParamsSchema } from './internal-agents-management.js';
import { AgentChannelHistoryKindSchema, AgentChannelHistoryResponseSchema } from '../../agent/agent-channel-history.js';
import { AgentManagementRequestIdSchema } from '../../agent/agent-management.js';
import { AgentChannelAccessErrorResponseSchema } from '../../agent/agent-channel-access-requests.js';
export const AgentChannelHistoryParamsSchema = AgentManagementParamsSchema.extend({ kind: AgentChannelHistoryKindSchema }).strict();
export type AgentChannelHistoryParams = z.infer<typeof AgentChannelHistoryParamsSchema>;
export const AgentChannelHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20), cursor: AgentManagementRequestIdSchema.optional(),
}).strict();
export type AgentChannelHistoryQuery = z.infer<typeof AgentChannelHistoryQuerySchema>;
/** Existing authenticated writers remain authoritative; no raw events, content or credential fields. */
export const internalAgentChannelHistoryContract = {
  method: 'GET' as const, path: '/internal/agents/:agentId/channels/:kind/history' as const, authType: 'secret' as const,
  paramsSchema: AgentChannelHistoryParamsSchema, querySchema: AgentChannelHistoryQuerySchema,
  responseSchema: AgentChannelHistoryResponseSchema, errorResponseSchema: AgentChannelAccessErrorResponseSchema,
} as const;
export function internalAgentChannelHistoryPath(agentId: string, kind: string): string {
  const params = AgentChannelHistoryParamsSchema.parse({ agentId, kind });
  return internalAgentChannelHistoryContract.path.replace(':agentId', encodeURIComponent(params.agentId)).replace(':kind', params.kind);
}
