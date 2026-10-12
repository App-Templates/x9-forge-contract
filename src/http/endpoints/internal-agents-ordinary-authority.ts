import type { z } from 'zod';
import { AgentOrdinaryAuthorityQuerySchema, AgentOrdinaryAuthoritySchema } from '../../agent/ordinary-authority.js';
import { agentManagementStateContract, agentManagementPath } from './internal-agents-management.js';

/** Internal services only. The Core handler requires configured authentication before reading retained state. */
export const agentOrdinaryAuthorityContract = {
  ...agentManagementStateContract,
  querySchema: AgentOrdinaryAuthorityQuerySchema,
  responseSchema: AgentOrdinaryAuthoritySchema,
} as const satisfies { querySchema: z.ZodType; responseSchema: z.ZodType };
export function agentOrdinaryAuthorityPath(managementAgentId: string, query: unknown): string {
  const parsed = AgentOrdinaryAuthorityQuerySchema.parse(query);
  const params = new URLSearchParams(Object.entries(parsed).map(([key, value]): [string, string] => [key, String(value)]));
  return `${agentManagementPath(managementAgentId)}?${params.toString()}`;
}
