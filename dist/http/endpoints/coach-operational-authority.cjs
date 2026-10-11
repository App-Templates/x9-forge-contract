"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coachOperationalAuthorityRecheckContract = exports.coachOperationalAuthorityResolveContract = void 0;
exports.capCoachOperationalAuthorityPath = capCoachOperationalAuthorityPath;
exports.isCoachOperationalAuthorityForRoute = isCoachOperationalAuthorityForRoute;
const zod_1 = require("zod");
const authority_js_1 = require("../../capability/coach/operational/authority.cjs");
const coach_operational_common_js_1 = require("./coach-operational-common.cjs");
const auth = { method: 'POST', authType: 'secret', paramsSchema: coach_operational_common_js_1.CoachOperationalAgentParamsSchema, errorSchema: coach_operational_common_js_1.CoachOperationalErrorSchema, errorStatus: coach_operational_common_js_1.COACH_OPERATIONAL_ERROR_STATUS,
    bodySchema: authority_js_1.CoachOperationalAuthorityRequestSchema, responseSchema: authority_js_1.CoachOperationalAuthorityResultSchema };
/** Internal authentication identifies the producer; explicit current person/program authority is still required. */
exports.coachOperationalAuthorityResolveContract = { ...auth, path: `${coach_operational_common_js_1.COACH_OPERATIONAL_PREFIX}/authority/resolve` };
exports.coachOperationalAuthorityRecheckContract = { ...auth, path: `${coach_operational_common_js_1.COACH_OPERATIONAL_PREFIX}/authority/recheck` };
function capCoachOperationalAuthorityPath(agentId, action) {
    return (0, coach_operational_common_js_1.operationalAgentPath)(agentId) + '/authority/' + zod_1.z.enum(['resolve', 'recheck']).parse(action);
}
function isCoachOperationalAuthorityForRoute(rawRequest, rawParams, action) {
    const request = authority_js_1.CoachOperationalAuthorityRequestSchema.safeParse(rawRequest), params = coach_operational_common_js_1.CoachOperationalAgentParamsSchema.safeParse(rawParams);
    return request.success && params.success && request.data.scope.agentId === params.data.agentId
        && ((action === 'resolve' && request.data.phase === 'before') || (action === 'recheck' && request.data.phase === 'after'));
}
//# sourceMappingURL=coach-operational-authority.js.map