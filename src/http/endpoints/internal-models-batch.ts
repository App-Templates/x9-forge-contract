// eslint-disable-next-line @typescript-eslint/no-unused-vars -- required for portable declaration emission.
import { z } from 'zod';
import { INTERNAL_SECRET_HEADER } from '../../auth/index.js';
import { AgentModelsStateSchema } from '../../model-router/agent-model-configuration.js';
import { AgentModelsOverviewSchema, AgentModelsBatchPreviewRequestSchema, AgentModelsBatchPreviewSchema, AgentModelsBatchRequestSchema, AgentModelsBatchResultSchema } from '../../model-router/models-batch.js';
import { AgentManagementParamsSchema } from './internal-agents-management.js';

/** Control-plane aggregation contracts; the authenticated Forge browser facade reuses these DTOs.
 * Producers must use existing slot writers and per-agent commands. This bridge does not install handlers.
 */
export const internalModelsOverviewContract = {
  method: 'GET' as const, path: '/internal/models/overview' as const,
  authType: 'secret' as const, authHeader: INTERNAL_SECRET_HEADER,
  responseSchema: AgentModelsOverviewSchema,
} as const;
export const internalModelsPreviewContract = {
  method: 'POST' as const, path: '/internal/models/preview' as const,
  authType: 'secret' as const, authHeader: INTERNAL_SECRET_HEADER,
  bodySchema: AgentModelsBatchPreviewRequestSchema, responseSchema: AgentModelsBatchPreviewSchema,
} as const;
export const internalModelsBatchContract = {
  method: 'POST' as const, path: '/internal/models/batch' as const,
  authType: 'secret' as const, authHeader: INTERNAL_SECRET_HEADER,
  bodySchema: AgentModelsBatchRequestSchema, responseSchema: AgentModelsBatchResultSchema,
} as const;
export const internalAgentModelsStateContract = {
  method: 'GET' as const, path: '/internal/agents/:agentId/models/state' as const,
  authType: 'secret' as const, authHeader: INTERNAL_SECRET_HEADER,
  paramsSchema: AgentManagementParamsSchema, responseSchema: AgentModelsStateSchema,
} as const;
export function agentModelsStatePath(agentId: string): string {
  return internalAgentModelsStateContract.path.replace(':agentId', AgentManagementParamsSchema.parse({ agentId }).agentId);
}
