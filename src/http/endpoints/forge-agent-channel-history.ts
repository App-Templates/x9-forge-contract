// eslint-disable-next-line @typescript-eslint/no-unused-vars -- required for portable declaration generation.
import { z } from 'zod';
import { AgentChannelHistoryResponseSchema } from '../../agent/agent-channel-history.js';
import { AgentChannelAccessErrorResponseSchema } from '../../agent/agent-channel-access-requests.js';
import { AgentManagementParamsSchema } from './internal-agents-management.js';
import { AgentChannelHistoryParamsSchema, AgentChannelHistoryQuerySchema } from './internal-agent-channel-history.js';
import { ForgeAgentChannelAccessAuthorizationSchema } from './forge-agent-channel-access.js';
/** Server-only session ownership comparison; a GET never turns a historical event into readiness. */
export function isAgentChannelHistoryWithinForgeAuthorization(rawHistory: unknown, trustedAccess: unknown, requestedAgentId: unknown): boolean {
  const history = AgentChannelHistoryResponseSchema.safeParse(rawHistory);
  const access = ForgeAgentChannelAccessAuthorizationSchema.safeParse(trustedAccess);
  const params = AgentManagementParamsSchema.safeParse({ agentId: requestedAgentId });
  if (!history.success || !access.success || !params.success) return false;
  const source = history.data;
  if (source.identity.managementAgentId !== params.data.agentId) return false; // guard:requested-management
  return access.data.role === 'sa' // guard:server-sa
    || (source.scope.tenantId === access.data.tenantId && source.scope.ownerId === access.data.ownerId); // guard:server-owner
}
export const forgeAgentChannelHistoryContract = {
  method: 'GET' as const, path: '/api/agents/:agentId/channels/:kind/history' as const,
  authentication: 'forge-session' as const, authorization: 'sa-or-agent-owner' as const,
  paramsSchema: AgentChannelHistoryParamsSchema, querySchema: AgentChannelHistoryQuerySchema,
  responseSchema: AgentChannelHistoryResponseSchema, errorResponseSchema: AgentChannelAccessErrorResponseSchema,
} as const;
export function forgeAgentChannelHistoryPath(agentId: string, kind: string): string {
  const params = AgentChannelHistoryParamsSchema.parse({ agentId, kind });
  return forgeAgentChannelHistoryContract.path.replace(':agentId', encodeURIComponent(params.agentId)).replace(':kind', params.kind);
}
