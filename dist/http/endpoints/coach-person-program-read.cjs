"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coachPersonProgramReadContract = exports.CoachPersonProgramReadResultSchema = exports.CoachPersonStrategyStateReadSchema = exports.CoachPersonProgramReadRequestSchema = void 0;
exports.isCoachPersonProgramReadForRequest = isCoachPersonProgramReadForRequest;
exports.isCoachPersonProgramReadForRoute = isCoachPersonProgramReadForRoute;
exports.capCoachPersonProgramReadPath = capCoachPersonProgramReadPath;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../../capability/capability-call-context.cjs");
const program_version_js_1 = require("../../capability/coach/program-version.cjs");
const conversation_js_1 = require("../../capability/coach/operational/conversation.cjs");
const observations_js_1 = require("../../capability/coach/operational/observations.cjs");
const opening_js_1 = require("../../capability/coach/operational/opening.cjs");
const shared_js_1 = require("../../capability/coach/shared.cjs");
const coach_operational_common_js_1 = require("./coach-operational-common.cjs");
/** Cursor is opaque and scoped by the producer; neither a cursor nor the shared secret authorizes a person. */
exports.CoachPersonProgramReadRequestSchema = zod_1.z.object({
    requestId: shared_js_1.RefId, scope: capability_call_context_js_1.CapabilityPersonScopeSchema, program: program_version_js_1.CoachProgramVersionRefSchema,
    after: shared_js_1.RefId.nullable(), limit: zod_1.z.number().int().min(1).max(100),
}).strict().refine(x => (0, capability_call_context_js_1.sameCapabilityScope)((0, shared_js_1.agentScope)(x.scope), x.program.scope), 'Program belongs to person agent');
/** Person state is shared by strategy/version. Session history below is filtered by the entire program pin. */
exports.CoachPersonStrategyStateReadSchema = zod_1.z.object({
    partition: zod_1.z.literal('person_strategy'), scope: capability_call_context_js_1.CapabilityPersonScopeSchema, strategy: program_version_js_1.CoachStrategyRefSchema,
    projection: conversation_js_1.CoachProgramProjectionSchema.nullable(),
}).strict().refine(x => x.projection === null || (0, shared_js_1.sameValue)(x.projection.strategy, x.strategy), 'State uses its strategy partition');
exports.CoachPersonProgramReadResultSchema = zod_1.z.object({
    ok: zod_1.z.literal(true), request: exports.CoachPersonProgramReadRequestSchema, observedAt: shared_js_1.Instant,
    personState: exports.CoachPersonStrategyStateReadSchema, budget: opening_js_1.CoachOperationalBudgetStateSchema,
    sessions: zod_1.z.array(observations_js_1.CoachOperationalSessionReadSchema).max(100), nextCursor: shared_js_1.RefId.nullable(),
}).strict().refine(x => {
    const r = x.request, seen = new Set(), sessions = new Set();
    return (0, capability_call_context_js_1.sameCapabilityScope)(x.personState.scope, r.scope) && (0, shared_js_1.sameValue)(x.personState.strategy, r.program.strategy)
        && (x.budget.status === 'unknown' || ((0, capability_call_context_js_1.sameCapabilityScope)(x.budget.budget.scope, r.scope) && Date.parse(x.budget.budget.asOf) <= Date.parse(x.observedAt)))
        && x.sessions.length <= r.limit
        && x.sessions.every((s, i) => {
            const o = s.opening, previous = x.sessions[i - 1]?.opening;
            const valid = (0, capability_call_context_js_1.sameCapabilityScope)(o.scope, r.scope) && (0, shared_js_1.sameValue)(o.program, r.program)
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
function isCoachPersonProgramReadForRequest(rawResult, rawRequest) {
    const result = exports.CoachPersonProgramReadResultSchema.safeParse(rawResult), request = exports.CoachPersonProgramReadRequestSchema.safeParse(rawRequest);
    return result.success && request.success && (0, shared_js_1.sameValue)(result.data.request, request.data);
}
function isCoachPersonProgramReadForRoute(rawRequest, rawParams) {
    const request = exports.CoachPersonProgramReadRequestSchema.safeParse(rawRequest), params = coach_operational_common_js_1.CoachOperationalAgentParamsSchema.safeParse(rawParams);
    return request.success && params.success && request.data.scope.agentId === params.data.agentId;
}
exports.coachPersonProgramReadContract = {
    method: 'POST', path: coach_operational_common_js_1.COACH_OPERATIONAL_PREFIX + '/persons/programs/read',
    authType: 'secret', authHeader: coach_operational_common_js_1.COACH_OPERATIONAL_AUTH_HEADER, paramsSchema: coach_operational_common_js_1.CoachOperationalAgentParamsSchema,
    bodySchema: exports.CoachPersonProgramReadRequestSchema, responseSchema: exports.CoachPersonProgramReadResultSchema,
    errorSchema: coach_operational_common_js_1.CoachOperationalErrorSchema, errorStatus: coach_operational_common_js_1.COACH_OPERATIONAL_ERROR_STATUS,
};
function capCoachPersonProgramReadPath(agentId) { return (0, coach_operational_common_js_1.operationalAgentPath)(agentId) + '/persons/programs/read'; }
//# sourceMappingURL=coach-person-program-read.js.map