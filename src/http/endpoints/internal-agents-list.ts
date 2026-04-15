import { z } from 'zod';

/**
 * GET /internal/agents — list all loaded agents.
 * Direction: Forge factory-svc -> X9 agent-core
 * Auth: X-Internal-Secret
 * Requirement: HTTP-03
 *
 * Real response shape from agent-core (services/agent-core/src/index.ts:328-333):
 *   { agents: [{ agentId: string, displayName: string, ownerId: string }] }
 *
 * Consumers:
 *   - forge-v2 factory `X9Client.listAgents()` reads `data.agents.map(a => a.agentId)`
 *   - forge-v2 factory health route checks `data.agents.some(a => a.agentId === slug)`
 *
 * NOTE: This is the current shape. Does NOT yet conform to standard
 * BridgeSuccessResponse format. Standardization tracked for 04-03.
 */

export const ListAgentsAgentSchema = z.object({
  agentId: z.string().min(1),
  displayName: z.string(),
  ownerId: z.string(),
});
export type ListAgentsAgent = z.infer<typeof ListAgentsAgentSchema>;

export const ListAgentsResponseSchema = z.object({
  agents: z.array(ListAgentsAgentSchema),
});
export type ListAgentsResponse = z.infer<typeof ListAgentsResponseSchema>;

export const listAgentsContract = {
  method: 'GET' as const,
  path: '/internal/agents' as const,
  authType: 'secret' as const,
  responseSchema: ListAgentsResponseSchema,
} as const;
