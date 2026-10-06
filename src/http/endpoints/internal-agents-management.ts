import { z } from 'zod';
import { ReloadAgentParamsSchema } from './internal-agents-reload.js';
import { AgentConfigVersionSchema } from '../../capability/ricerca/agent-config.js';
import {
  AgentManagementCommandResultSchema,
  AgentManagementCommandSchema,
  AgentManagementStateSchema,
} from '../../agent/agent-management.js';

/**
 * R1b logical management (v1.31.0). Direction: Forge factory-svc -> X9 agent-core. Auth: X-Internal-Secret.
 *
 * - `POST /internal/agents/:agentId/commands` — start/stop/restart/reload one agent or apply a configuration version,
 *   idempotent by `requestId` (see `AgentManagementCommandSchema`). 200 `AgentManagementCommandResultSchema` even when
 *   targets failed (per-target outcome); errors below are for commands that were not processed at all.
 * - `GET /internal/agents/:agentId/management` — configuration versions and the actions each target supports.
 *
 * Errors (`AgentManagementErrorResponseSchema`): 400 invalid_request, 404 agent_not_found, 409 idempotency_conflict
 * (same requestId, different command) / stale_version (desired version older than the applied one, carries
 * `currentVersion`) / command_in_progress, 503 source_unavailable.
 *
 * The legacy `/reload` and `/stop` routes stay unchanged for 1.30 consumers.
 */

/** Same agent id rule as `/internal/agents/:agentId/reload|stop|turn`. */
export const AgentManagementParamsSchema = ReloadAgentParamsSchema;
export type AgentManagementParams = z.infer<typeof AgentManagementParamsSchema>;

export const AgentManagementErrorCodeSchema = z.enum([
  'invalid_request',
  'agent_not_found',
  'idempotency_conflict',
  'stale_version',
  'command_in_progress',
  'source_unavailable',
]);
export type AgentManagementErrorCode = z.infer<typeof AgentManagementErrorCodeSchema>;

export const AgentManagementErrorResponseSchema = z.object({
  ok: z.literal(false),
  error: AgentManagementErrorCodeSchema,
  /** stale_version only: the version currently applied. */
  currentVersion: AgentConfigVersionSchema.optional(),
}).superRefine((response, ctx) => {
  if ((response.error === 'stale_version') !== (response.currentVersion !== undefined)) {
    ctx.addIssue({ code: 'custom', path: ['currentVersion'], message: 'currentVersion is present exactly for stale_version' });
  }
});
export type AgentManagementErrorResponse = z.infer<typeof AgentManagementErrorResponseSchema>;

export const agentCommandContract = {
  method: 'POST' as const,
  path: '/internal/agents/:agentId/commands' as const,
  authType: 'secret' as const,
  paramsSchema: AgentManagementParamsSchema,
  bodySchema: AgentManagementCommandSchema,
  responseSchema: AgentManagementCommandResultSchema,
} as const;

export const agentManagementStateContract = {
  method: 'GET' as const,
  path: '/internal/agents/:agentId/management' as const,
  authType: 'secret' as const,
  paramsSchema: AgentManagementParamsSchema,
  responseSchema: AgentManagementStateSchema,
} as const;

export function agentCommandsPath(agentId: string): string {
  return agentCommandContract.path.replace(':agentId', AgentManagementParamsSchema.parse({ agentId }).agentId);
}

export function agentManagementPath(agentId: string): string {
  return agentManagementStateContract.path.replace(':agentId', AgentManagementParamsSchema.parse({ agentId }).agentId);
}
