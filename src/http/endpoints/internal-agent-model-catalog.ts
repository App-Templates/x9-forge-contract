// eslint-disable-next-line @typescript-eslint/no-unused-vars -- required for portable declaration emission.
import { z } from 'zod';
import { INTERNAL_SECRET_HEADER } from '../../auth/index.js';
import { ModelCatalogSchema } from '../../model-router/model-catalog.js';
import { AgentManagementParamsSchema } from './internal-agents-management.js';

/** Metadata-only discovery scoped to the management agent and its effective credentials. */
export const internalAgentModelCatalogContract = {
  method: 'GET' as const,
  path: '/internal/agents/:agentId/models/catalog' as const,
  authType: 'secret' as const,
  authHeader: INTERNAL_SECRET_HEADER,
  paramsSchema: AgentManagementParamsSchema,
  responseSchema: ModelCatalogSchema,
} as const;

export function agentModelCatalogPath(agentId: string): string {
  return internalAgentModelCatalogContract.path.replace(':agentId', AgentManagementParamsSchema.parse({ agentId }).agentId);
}
