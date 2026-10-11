import { z } from 'zod';
import { CoachOperationalAuthorityRequestSchema, CoachOperationalAuthorityResultSchema } from '../../capability/coach/operational/authority.js';
import { COACH_OPERATIONAL_PREFIX as prefix, COACH_OPERATIONAL_ERROR_STATUS as errorStatus,
  CoachOperationalErrorSchema as errorSchema, CoachOperationalAgentParamsSchema as Agent, operationalAgentPath } from './coach-operational-common.js';
const auth = { method: 'POST' as const, authType: 'secret' as const, paramsSchema: Agent, errorSchema, errorStatus,
  bodySchema: CoachOperationalAuthorityRequestSchema, responseSchema: CoachOperationalAuthorityResultSchema };
/** Internal authentication identifies the producer; explicit current person/program authority is still required. */
export const coachOperationalAuthorityResolveContract = { ...auth, path: `${prefix}/authority/resolve` } as const;
export const coachOperationalAuthorityRecheckContract = { ...auth, path: `${prefix}/authority/recheck` } as const;
export function capCoachOperationalAuthorityPath(agentId: string, action: 'resolve' | 'recheck'): string {
  return operationalAgentPath(agentId) + '/authority/' + z.enum(['resolve', 'recheck']).parse(action);
}
export function isCoachOperationalAuthorityForRoute(rawRequest: unknown, rawParams: unknown, action: 'resolve' | 'recheck'): boolean {
  const request = CoachOperationalAuthorityRequestSchema.safeParse(rawRequest), params = Agent.safeParse(rawParams);
  return request.success && params.success && request.data.scope.agentId === params.data.agentId
    && ((action === 'resolve' && request.data.phase === 'before') || (action === 'recheck' && request.data.phase === 'after'));
}
