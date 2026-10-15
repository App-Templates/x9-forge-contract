import { z } from 'zod';
import { CoachOperationalAuthorityProofRefSchema, type CoachOperationalAuthorityProofRef, CoachOperationalAuthorityRequestSchema, CoachOperationalAuthorityResultSchema } from '../../capability/coach/operational/authority.js';
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

/** A single opaque evidence reference, not authentication or authorization. */
export const COACH_OPERATIONAL_AUTHORITY_PROOF_HEADER = 'X-X9-Coach-Authority-Proof' as const;
export const CoachOperationalAuthorityProofHeaderSchema = z.string().max(138).transform(value => {
  const separator = value.indexOf(':');
  return { kind: separator < 0 ? '' : value.slice(0, separator), proofId: value.slice(separator + 1) };
}).pipe(CoachOperationalAuthorityProofRefSchema);
export function formatCoachOperationalAuthorityProofHeader(rawProofRef: unknown): string {
  const ref = CoachOperationalAuthorityProofRefSchema.parse(rawProofRef);
  return `${ref.kind}:${ref.proofId}`;
}
/** mode comes from trusted server policy, never from a caller-selected legacy flag.
 * Arrays, merged duplicate headers and malformed values must fail even in legacy mode.
 * The producer must correlate this reference with current scoped server evidence after every await. */
export function parseCoachOperationalAuthorityProofHeader(raw: unknown, mode: 'legacy' | 'managed'): CoachOperationalAuthorityProofRef | null {
  const policy = z.enum(['legacy', 'managed']).parse(mode);
  if (raw === undefined && policy === 'legacy') return null;
  return CoachOperationalAuthorityProofHeaderSchema.parse(raw);
}
