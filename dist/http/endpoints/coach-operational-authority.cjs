"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoachOperationalAuthorityProofHeaderSchema = exports.COACH_OPERATIONAL_AUTHORITY_PROOF_HEADER = exports.coachOperationalAuthorityRecheckContract = exports.coachOperationalAuthorityResolveContract = void 0;
exports.capCoachOperationalAuthorityPath = capCoachOperationalAuthorityPath;
exports.isCoachOperationalAuthorityForRoute = isCoachOperationalAuthorityForRoute;
exports.formatCoachOperationalAuthorityProofHeader = formatCoachOperationalAuthorityProofHeader;
exports.parseCoachOperationalAuthorityProofHeader = parseCoachOperationalAuthorityProofHeader;
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
/** A single opaque evidence reference, not authentication or authorization. */
exports.COACH_OPERATIONAL_AUTHORITY_PROOF_HEADER = 'X-X9-Coach-Authority-Proof';
exports.CoachOperationalAuthorityProofHeaderSchema = zod_1.z.string().max(138).transform(value => {
    const separator = value.indexOf(':');
    return { kind: separator < 0 ? '' : value.slice(0, separator), proofId: value.slice(separator + 1) };
}).pipe(authority_js_1.CoachOperationalAuthorityProofRefSchema);
function formatCoachOperationalAuthorityProofHeader(rawProofRef) {
    const ref = authority_js_1.CoachOperationalAuthorityProofRefSchema.parse(rawProofRef);
    return `${ref.kind}:${ref.proofId}`;
}
/** mode comes from trusted server policy, never from a caller-selected legacy flag.
 * Arrays, merged duplicate headers and malformed values must fail even in legacy mode.
 * The producer must correlate this reference with current scoped server evidence after every await. */
function parseCoachOperationalAuthorityProofHeader(raw, mode) {
    const policy = zod_1.z.enum(['legacy', 'managed']).parse(mode);
    if (raw === undefined && policy === 'legacy')
        return null;
    return exports.CoachOperationalAuthorityProofHeaderSchema.parse(raw);
}
//# sourceMappingURL=coach-operational-authority.js.map