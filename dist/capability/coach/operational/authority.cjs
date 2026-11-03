"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoachOperationalAuthorityResultSchema = exports.CoachOperationalAuthorityProofSchema = exports.CoachOperationalAuthorityRequestSchema = exports.CoachOperationalAuthorityOperationSchema = exports.CoachOperationalAuthorityProofRefSchema = void 0;
exports.isCoachOperationalAuthorityCurrent = isCoachOperationalAuthorityCurrent;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../../capability-call-context.cjs");
const program_version_js_1 = require("../program-version.cjs");
const execution_js_1 = require("../execution.cjs");
const shared_js_1 = require("../shared.cjs");
/** Opaque server-owned evidence reference; never a transport token or an implicit latest grant. */
exports.CoachOperationalAuthorityProofRefSchema = zod_1.z.object({
    kind: zod_1.z.enum(['admission', 'session']), proofId: shared_js_1.RefId,
}).strict();
exports.CoachOperationalAuthorityOperationSchema = zod_1.z.enum([
    'program', 'opening', 'start', 'conversation', 'read', 'end-guide', 'usage', 'event', 'close',
]);
const common = { requestId: shared_js_1.RefId, program: program_version_js_1.CoachProgramVersionRefSchema,
    phase: zod_1.z.enum(['before', 'after']), proofRef: exports.CoachOperationalAuthorityProofRefSchema };
exports.CoachOperationalAuthorityRequestSchema = zod_1.z.union([
    zod_1.z.object({ ...common, operation: zod_1.z.literal('program'), scope: capability_call_context_js_1.CapabilityAgentScopeSchema, opening: zod_1.z.null() }).strict(),
    zod_1.z.object({ ...common, operation: exports.CoachOperationalAuthorityOperationSchema.exclude(['program']),
        scope: capability_call_context_js_1.CapabilityPersonScopeSchema, opening: execution_js_1.CoachSessionOpeningRefSchema.nullable() }).strict(),
]).refine(x => {
    const agent = { tenantId: x.scope.tenantId, ownerId: x.scope.ownerId, agentId: x.scope.agentId };
    if (!(0, capability_call_context_js_1.sameCapabilityScope)(agent, x.program.scope))
        return false;
    if (x.opening !== null && (!(0, capability_call_context_js_1.sameCapabilityScope)(x.scope, x.opening.scope) || !(0, shared_js_1.sameValue)(x.program, x.opening.program)))
        return false;
    if (x.operation === 'program' || x.operation === 'opening')
        return x.proofRef.kind === 'admission' && x.opening === null;
    if (x.proofRef.kind === 'session' && x.opening === null)
        return false;
    if (x.operation === 'read')
        return true;
    if (x.opening === null)
        return false;
    return x.operation === 'start' || x.operation === 'conversation' || x.proofRef.kind === 'session';
}, 'Operation needs its exact scoped program, opening and explicit admission or session evidence');
/** Canonical neutral projection of durable authority; adapters own provider-specific evidence. */
exports.CoachOperationalAuthorityProofSchema = zod_1.z.object({
    proofRef: exports.CoachOperationalAuthorityProofRefSchema,
    scope: zod_1.z.union([capability_call_context_js_1.CapabilityPersonScopeSchema, capability_call_context_js_1.CapabilityAgentScopeSchema]), program: program_version_js_1.CoachProgramVersionRefSchema,
    opening: execution_js_1.CoachSessionOpeningRefSchema.nullable(), issuedAt: shared_js_1.Instant, expiresAt: shared_js_1.Instant,
    status: zod_1.z.enum(['active', 'draining', 'revoked', 'closed']),
}).strict().refine(x => {
    const agent = { tenantId: x.scope.tenantId, ownerId: x.scope.ownerId, agentId: x.scope.agentId };
    return (0, capability_call_context_js_1.sameCapabilityScope)(agent, x.program.scope)
        && (x.proofRef.kind !== 'session' || x.opening !== null)
        && (x.opening === null || ((0, capability_call_context_js_1.sameCapabilityScope)(x.scope, x.opening.scope) && (0, shared_js_1.sameValue)(x.program, x.opening.program)))
        && Date.parse(x.expiresAt) > Date.parse(x.issuedAt);
}, 'Durable authority retains the exact person, program and original session');
exports.CoachOperationalAuthorityResultSchema = zod_1.z.object({
    ok: zod_1.z.literal(true), request: exports.CoachOperationalAuthorityRequestSchema, proof: exports.CoachOperationalAuthorityProofSchema,
    observedAt: shared_js_1.Instant, expiresAt: shared_js_1.Instant,
}).strict().refine(x => {
    const observed = Date.parse(x.observedAt), expiry = Date.parse(x.expiresAt);
    return (0, shared_js_1.sameValue)(x.request.proofRef, x.proof.proofRef) && (0, capability_call_context_js_1.sameCapabilityScope)(x.request.scope, x.proof.scope)
        && (0, shared_js_1.sameValue)(x.request.program, x.proof.program) && (0, shared_js_1.sameValue)(x.request.opening, x.proof.opening)
        && observed >= Date.parse(x.proof.issuedAt) && (x.proof.opening === null || observed >= Date.parse(x.proof.opening.openedAt))
        && expiry > observed && expiry - observed <= 60000 && expiry <= Date.parse(x.proof.expiresAt);
}, 'A correlated fresh decision cannot outlive its exact durable proof');
/** expectedProof is reloaded from authenticated server authority after every await, never from the caller body.
 * Schema validation/correlation is not authorization: the producer must recheck current policy and revocation. */
function isCoachOperationalAuthorityCurrent(rawRequest, rawResult, rawExpectedProof, now) {
    const request = exports.CoachOperationalAuthorityRequestSchema.safeParse(rawRequest);
    const result = exports.CoachOperationalAuthorityResultSchema.safeParse(rawResult);
    const expected = exports.CoachOperationalAuthorityProofSchema.safeParse(rawExpectedProof), time = now.getTime();
    if (!request.success || !result.success || !expected.success || !Number.isFinite(time))
        return false;
    const { status: prior, ...immutableExpected } = expected.data;
    const { status: observed, ...immutableObserved } = result.data.proof;
    return (0, shared_js_1.sameValue)(request.data, result.data.request) && (0, shared_js_1.sameValue)(immutableExpected, immutableObserved)
        && (prior === 'active' || prior === 'draining') && (observed === 'active' || observed === 'draining')
        && (prior !== 'draining' || observed === 'draining')
        && (observed !== 'draining' || (request.data.proofRef.kind === 'session'
            && ['read', 'end-guide', 'usage', 'event', 'close'].includes(request.data.operation)))
        && Date.parse(result.data.observedAt) <= time && time < Date.parse(result.data.expiresAt);
}
//# sourceMappingURL=authority.js.map