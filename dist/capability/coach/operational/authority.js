import { z } from 'zod';
import { CapabilityAgentScopeSchema, CapabilityPersonScopeSchema, sameCapabilityScope } from "../../capability-call-context.js";
import { CoachProgramVersionRefSchema } from "../program-version.js";
import { CoachSessionOpeningRefSchema } from "../execution.js";
import { RefId, Instant, sameValue } from "../shared.js";
/** Opaque server-owned evidence reference; never a transport token or an implicit latest grant. */
export const CoachOperationalAuthorityProofRefSchema = z.object({
    kind: z.enum(['admission', 'session']), proofId: RefId,
}).strict();
export const CoachOperationalAuthorityOperationSchema = z.enum([
    'program', 'opening', 'start', 'conversation', 'read', 'end-guide', 'usage', 'event', 'close',
]);
const common = { requestId: RefId, program: CoachProgramVersionRefSchema,
    phase: z.enum(['before', 'after']), proofRef: CoachOperationalAuthorityProofRefSchema };
export const CoachOperationalAuthorityRequestSchema = z.union([
    z.object({ ...common, operation: z.literal('program'), scope: CapabilityAgentScopeSchema, opening: z.null() }).strict(),
    z.object({ ...common, operation: CoachOperationalAuthorityOperationSchema.exclude(['program']),
        scope: CapabilityPersonScopeSchema, opening: CoachSessionOpeningRefSchema.nullable() }).strict(),
]).refine(x => {
    const agent = { tenantId: x.scope.tenantId, ownerId: x.scope.ownerId, agentId: x.scope.agentId };
    if (!sameCapabilityScope(agent, x.program.scope))
        return false;
    if (x.opening !== null && (!sameCapabilityScope(x.scope, x.opening.scope) || !sameValue(x.program, x.opening.program)))
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
export const CoachOperationalAuthorityProofSchema = z.object({
    proofRef: CoachOperationalAuthorityProofRefSchema,
    scope: z.union([CapabilityPersonScopeSchema, CapabilityAgentScopeSchema]), program: CoachProgramVersionRefSchema,
    opening: CoachSessionOpeningRefSchema.nullable(), issuedAt: Instant, expiresAt: Instant,
    status: z.enum(['active', 'draining', 'revoked', 'closed']),
}).strict().refine(x => {
    const agent = { tenantId: x.scope.tenantId, ownerId: x.scope.ownerId, agentId: x.scope.agentId };
    return sameCapabilityScope(agent, x.program.scope)
        && (x.proofRef.kind !== 'session' || x.opening !== null)
        && (x.opening === null || (sameCapabilityScope(x.scope, x.opening.scope) && sameValue(x.program, x.opening.program)))
        && Date.parse(x.expiresAt) > Date.parse(x.issuedAt);
}, 'Durable authority retains the exact person, program and original session');
export const CoachOperationalAuthorityResultSchema = z.object({
    ok: z.literal(true), request: CoachOperationalAuthorityRequestSchema, proof: CoachOperationalAuthorityProofSchema,
    observedAt: Instant, expiresAt: Instant,
}).strict().refine(x => {
    const observed = Date.parse(x.observedAt), expiry = Date.parse(x.expiresAt);
    return sameValue(x.request.proofRef, x.proof.proofRef) && sameCapabilityScope(x.request.scope, x.proof.scope)
        && sameValue(x.request.program, x.proof.program) && sameValue(x.request.opening, x.proof.opening)
        && observed >= Date.parse(x.proof.issuedAt) && (x.proof.opening === null || observed >= Date.parse(x.proof.opening.openedAt))
        && expiry > observed && expiry - observed <= 60000 && expiry <= Date.parse(x.proof.expiresAt);
}, 'A correlated fresh decision cannot outlive its exact durable proof');
/** expectedProof is reloaded from authenticated server authority after every await, never from the caller body.
 * Schema validation/correlation is not authorization: the producer must recheck current policy and revocation. */
export function isCoachOperationalAuthorityCurrent(rawRequest, rawResult, rawExpectedProof, now) {
    const request = CoachOperationalAuthorityRequestSchema.safeParse(rawRequest);
    const result = CoachOperationalAuthorityResultSchema.safeParse(rawResult);
    const expected = CoachOperationalAuthorityProofSchema.safeParse(rawExpectedProof), time = now.getTime();
    if (!request.success || !result.success || !expected.success || !Number.isFinite(time))
        return false;
    const { status: prior, ...immutableExpected } = expected.data;
    const { status: observed, ...immutableObserved } = result.data.proof;
    return sameValue(request.data, result.data.request) && sameValue(immutableExpected, immutableObserved)
        && (prior === 'active' || prior === 'draining') && (observed === 'active' || observed === 'draining')
        && (prior !== 'draining' || observed === 'draining')
        && (observed !== 'draining' || (request.data.proofRef.kind === 'session'
            && ['read', 'end-guide', 'usage', 'event', 'close'].includes(request.data.operation)))
        && Date.parse(result.data.observedAt) <= time && time < Date.parse(result.data.expiresAt);
}
//# sourceMappingURL=authority.js.map