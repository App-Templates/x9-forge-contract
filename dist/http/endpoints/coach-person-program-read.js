import { z } from 'zod';
import { CapabilityPersonScopeSchema, sameCapabilityScope } from "../../capability/capability-call-context.js";
import { CoachProgramVersionRefSchema, CoachStrategyRefSchema } from "../../capability/coach/program-version.js";
import { CoachProgramProjectionSchema } from "../../capability/coach/operational/conversation.js";
import { CoachOperationalSessionReadSchema } from "../../capability/coach/operational/observations.js";
import { CoachOperationalBudgetStateSchema } from "../../capability/coach/operational/opening.js";
import { RefId, Instant, agentScope, sameValue } from "../../capability/coach/shared.js";
import { COACH_OPERATIONAL_PREFIX, COACH_OPERATIONAL_AUTH_HEADER, CoachOperationalAgentParamsSchema, CoachOperationalErrorSchema, COACH_OPERATIONAL_ERROR_STATUS, operationalAgentPath } from "./coach-operational-common.js";
/** Cursor is opaque and scoped by the producer; neither a cursor nor the shared secret authorizes a person. */
export const CoachPersonProgramReadRequestSchema = z.object({
    requestId: RefId, scope: CapabilityPersonScopeSchema, program: CoachProgramVersionRefSchema,
    after: RefId.nullable(), limit: z.number().int().min(1).max(100),
}).strict().refine(x => sameCapabilityScope(agentScope(x.scope), x.program.scope), 'Program belongs to person agent');
/** Person state is shared by strategy/version. Session history below is filtered by the entire program pin. */
export const CoachPersonStrategyStateReadSchema = z.object({
    partition: z.literal('person_strategy'), scope: CapabilityPersonScopeSchema, strategy: CoachStrategyRefSchema,
    projection: CoachProgramProjectionSchema.nullable(),
}).strict().refine(x => x.projection === null || sameValue(x.projection.strategy, x.strategy), 'State uses its strategy partition');
export const CoachPersonProgramReadResultSchema = z.object({
    ok: z.literal(true), request: CoachPersonProgramReadRequestSchema, observedAt: Instant,
    personState: CoachPersonStrategyStateReadSchema, budget: CoachOperationalBudgetStateSchema,
    sessions: z.array(CoachOperationalSessionReadSchema).max(100), nextCursor: RefId.nullable(),
}).strict().refine(x => {
    const r = x.request, seen = new Set(), sessions = new Set();
    return sameCapabilityScope(x.personState.scope, r.scope) && sameValue(x.personState.strategy, r.program.strategy)
        && (x.budget.status === 'unknown' || (sameCapabilityScope(x.budget.budget.scope, r.scope) && Date.parse(x.budget.budget.asOf) <= Date.parse(x.observedAt)))
        && x.sessions.length <= r.limit
        && x.sessions.every((s, i) => {
            const o = s.opening, previous = x.sessions[i - 1]?.opening;
            const valid = sameCapabilityScope(o.scope, r.scope) && sameValue(o.program, r.program)
                && Date.parse(o.openedAt) <= Date.parse(x.observedAt) && !seen.has(o.openingId) && !sessions.has(o.sessionId)
                && (!previous || Date.parse(previous.openedAt) > Date.parse(o.openedAt)
                    || (Date.parse(previous.openedAt) === Date.parse(o.openedAt) && previous.openingId > o.openingId));
            seen.add(o.openingId);
            sessions.add(o.sessionId);
            return valid;
        })
        && (x.nextCursor === null || (x.sessions.length === r.limit && x.nextCursor !== r.after));
}, 'One person, exact pin, ordered unique bounded history and advancing cursor');
/** Correlation only. Producer rechecks current person/program access after every awaited read and before disclosure. */
export function isCoachPersonProgramReadForRequest(rawResult, rawRequest) {
    const result = CoachPersonProgramReadResultSchema.safeParse(rawResult), request = CoachPersonProgramReadRequestSchema.safeParse(rawRequest);
    return result.success && request.success && sameValue(result.data.request, request.data);
}
export function isCoachPersonProgramReadForRoute(rawRequest, rawParams) {
    const request = CoachPersonProgramReadRequestSchema.safeParse(rawRequest), params = CoachOperationalAgentParamsSchema.safeParse(rawParams);
    return request.success && params.success && request.data.scope.agentId === params.data.agentId;
}
export const coachPersonProgramReadContract = {
    method: 'POST', path: COACH_OPERATIONAL_PREFIX + '/persons/programs/read',
    authType: 'secret', authHeader: COACH_OPERATIONAL_AUTH_HEADER, paramsSchema: CoachOperationalAgentParamsSchema,
    bodySchema: CoachPersonProgramReadRequestSchema, responseSchema: CoachPersonProgramReadResultSchema,
    errorSchema: CoachOperationalErrorSchema, errorStatus: COACH_OPERATIONAL_ERROR_STATUS,
};
export function capCoachPersonProgramReadPath(agentId) { return operationalAgentPath(agentId) + '/persons/programs/read'; }
//# sourceMappingURL=coach-person-program-read.js.map