import { z } from 'zod';
import { CapabilityAgentParamsSchema } from './internal-capability-agent.js';
import { CoachProgramIdSchema, CoachSessionSchema } from '../../capability/coach/index.js';
import { CoachProgramVersionRefSchema } from '../../capability/coach/program-version.js';
import { CoachSessionOpeningRefSchema } from '../../capability/coach/execution.js';
import { AgentConfigVersionSchema } from '../../capability/ricerca/agent-config.js';
import { INTERNAL_SECRET_HEADER } from '../../auth/index.js';
export const COACH_OPERATIONAL_PREFIX = '/internal/capability/agents/:agentId/coach/v2';
export const COACH_OPERATIONAL_AUTH_HEADER = INTERNAL_SECRET_HEADER;
export const CoachOperationalAgentParamsSchema = CapabilityAgentParamsSchema.strict();
export const CoachOperationalSessionParamsSchema = CoachOperationalAgentParamsSchema.extend({ sessionId: CoachSessionSchema.shape.sessionId }).strict();
export const CoachOperationalProgramParamsSchema = CoachOperationalAgentParamsSchema.extend({
  programId: CoachProgramIdSchema, programVersion: z.string().regex(/^[1-9][0-9]*$/).transform(Number).pipe(AgentConfigVersionSchema),
}).strict();
export const COACH_OPERATIONAL_ERROR_STATUS = {
  invalid_request: 400, unauthorized: 401, scope_mismatch: 403, not_found: 404, program_not_found: 404,
  strategy_unavailable: 422, stale_revision: 409, stale_program_version: 409, idempotency_conflict: 409,
  budget_exhausted: 429, budget_unavailable: 503, authority_unavailable: 503, source_unavailable: 503,
} as const;
export const CoachOperationalErrorSchema = z.object({
  ok: z.literal(false), error: z.enum(Object.keys(COACH_OPERATIONAL_ERROR_STATUS) as [keyof typeof COACH_OPERATIONAL_ERROR_STATUS, ...(keyof typeof COACH_OPERATIONAL_ERROR_STATUS)[]]),
  currentRevision: z.number().int().nonnegative().optional(), currentProgramVersion: AgentConfigVersionSchema.optional(),
}).strict().refine(x => (x.error === 'stale_revision') === (x.currentRevision !== undefined)
  && (x.error === 'stale_program_version') === (x.currentProgramVersion !== undefined), 'Only stale errors carry current versions');
export type CoachOperationalError = z.infer<typeof CoachOperationalErrorSchema>;
export function isCoachOpeningForSessionRoute(raw: unknown, rawParams: unknown): boolean {
  const opening = CoachSessionOpeningRefSchema.safeParse(raw), params = CoachOperationalSessionParamsSchema.safeParse(rawParams);
  return opening.success && params.success && opening.data.scope.agentId === params.data.agentId && opening.data.sessionId === params.data.sessionId;
}
export function isCoachProgramForRevisionRoute(raw: unknown, rawParams: unknown): boolean {
  const program = CoachProgramVersionRefSchema.safeParse(raw), params = CoachOperationalProgramParamsSchema.safeParse(rawParams);
  return program.success && params.success && program.data.scope.agentId === params.data.agentId && program.data.programId === params.data.programId && program.data.programVersion === params.data.programVersion;
}
export function operationalAgentPath(agentId: string): string {
  return '/internal/capability/agents/' + encodeURIComponent(CoachOperationalAgentParamsSchema.parse({ agentId }).agentId) + '/coach/v2';
}
export function operationalSessionPath(agentId: string, sessionId: string): string {
  const params = CoachOperationalSessionParamsSchema.parse({ agentId, sessionId });
  return operationalAgentPath(params.agentId) + '/sessions/' + encodeURIComponent(params.sessionId);
}
