import { CapabilityAgentParamsSchema, AgentConfigSavedSchema } from './internal-capability-agent.js';
import { CapabilityPersonScopeSchema } from '../../capability/capability-call-context.js';
import {
  CoachPersonSnapshotSchema,
  CoachProgramIdSchema,
  CoachProgramSchema,
  CoachSessionRecordResultSchema,
  CoachSessionSchema,
} from '../../capability/coach/index.js';

/**
 * cap-coach per-agent routes (R6, v1.31.0). Direction: Forge / project apps via X9 -> cap-coach.
 * Auth: platform secret (`INTERNAL_SECRET_HEADER`), like the other `/internal/capability/agents/:agentId/*` routes.
 *
 * - `PUT  .../coach/programs/:programId` — save a program (project content); 200 `AgentConfigSavedSchema`,
 *   409 stale_version when the version does not move forward.
 * - `POST .../coach/sessions` — record a session, idempotent by `idempotencyKey`.
 * - `GET  .../coach/people/:userId` — one person's profile, progress, budget and recent sessions.
 *
 * Errors: `CoachRouteErrorSchema` (400 invalid_request / agent_mismatch / person_mismatch, 404 not_found /
 * program_not_found, 409 idempotency_conflict / stale_version, 429 budget_exhausted).
 */
export const CoachProgramParamsSchema = CapabilityAgentParamsSchema.extend({ programId: CoachProgramIdSchema });
export const CoachPersonParamsSchema = CapabilityAgentParamsSchema.extend({ userId: CapabilityPersonScopeSchema.shape.userId });

export const coachProgramPutContract = {
  method: 'PUT' as const,
  path: '/internal/capability/agents/:agentId/coach/programs/:programId' as const,
  authType: 'secret' as const,
  paramsSchema: CoachProgramParamsSchema,
  bodySchema: CoachProgramSchema,
  responseSchema: AgentConfigSavedSchema,
} as const;

export const coachProgramGetContract = {
  method: 'GET' as const,
  path: '/internal/capability/agents/:agentId/coach/programs/:programId' as const,
  authType: 'secret' as const,
  paramsSchema: CoachProgramParamsSchema,
  responseSchema: CoachProgramSchema,
} as const;

export const coachSessionRecordContract = {
  method: 'POST' as const,
  path: '/internal/capability/agents/:agentId/coach/sessions' as const,
  authType: 'secret' as const,
  paramsSchema: CapabilityAgentParamsSchema,
  bodySchema: CoachSessionSchema,
  responseSchema: CoachSessionRecordResultSchema,
} as const;

export const coachPersonSnapshotContract = {
  method: 'GET' as const,
  path: '/internal/capability/agents/:agentId/coach/people/:userId' as const,
  authType: 'secret' as const,
  paramsSchema: CoachPersonParamsSchema,
  responseSchema: CoachPersonSnapshotSchema,
} as const;

export function capCoachProgramPath(agentId: string, programId: string): string {
  const params = CoachProgramParamsSchema.parse({ agentId, programId });
  return `/internal/capability/agents/${params.agentId}/coach/programs/${params.programId}`;
}

export function capCoachSessionsPath(agentId: string): string {
  return `/internal/capability/agents/${CapabilityAgentParamsSchema.parse({ agentId }).agentId}/coach/sessions`;
}

export function capCoachPersonPath(agentId: string, userId: string): string {
  const params = CoachPersonParamsSchema.parse({ agentId, userId });
  return `/internal/capability/agents/${params.agentId}/coach/people/${encodeURIComponent(params.userId)}`;
}
