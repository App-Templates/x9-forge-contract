// eslint-disable-next-line @typescript-eslint/no-unused-vars -- required for portable declaration emission.
import { z } from 'zod';
import { INTERNAL_SECRET_HEADER } from '../../auth/index.js';
import { AgentModelSourceObservationSchema } from '../../model-router/agent-model-configuration.js';
import { AgentManagementParamsSchema } from './internal-agents-management.js';

/** Local loaded generation, available before priming without querying aggregate consumer state.
 * This observation grants no Master role; producers must recheck the generation after awaits.
 */
export const internalAgentModelSourceObservationContract = {
  method: 'GET' as const,
  path: '/internal/agents/:agentId/models/local-source' as const,
  authType: 'secret' as const,
  authHeader: INTERNAL_SECRET_HEADER,
  paramsSchema: AgentManagementParamsSchema,
  responseSchema: AgentModelSourceObservationSchema,
} as const;

export function agentModelSourceObservationPath(agentId: string): string {
  return internalAgentModelSourceObservationContract.path.replace(':agentId', AgentManagementParamsSchema.parse({ agentId }).agentId);
}
