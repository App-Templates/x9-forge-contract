import { z } from 'zod';
import { CapabilityPersonScopeSchema, sameCapabilityScope } from "../capability-call-context.js";
import { RefId, Instant, sameValue } from "../coach/shared.js";
import { ElevenLabsNativeAdmissionAttemptSchema, ElevenLabsNativeConversationBindingSchema, isElevenLabsNativeSessionForAttempt, sameElevenLabsNativeConversation } from "./native-session.js";
/** Durable session metadata, never permission by itself. A Forge producer must re-read current
 * policy, invitations, link and runtime authority after awaits; S2S authentication alone is insufficient. */
export const ElevenLabsNativeSessionGrantSchema = z.object({
    grantId: RefId, requestId: RefId, attempt: ElevenLabsNativeAdmissionAttemptSchema,
    conversation: ElevenLabsNativeConversationBindingSchema,
    issuedAt: Instant, expiresAt: Instant, status: z.enum(['active', 'draining', 'revoked', 'closed']),
}).strict().refine(x => {
    const created = Date.parse(x.attempt.createdAt), admissionExpiry = Date.parse(x.attempt.expiresAt);
    const attached = Date.parse(x.conversation.attachedAt), issued = Date.parse(x.issuedAt), expiry = Date.parse(x.expiresAt);
    return x.attempt.status === 'admitted' && isElevenLabsNativeSessionForAttempt(x.conversation.binding, x.attempt)
        && attached >= created && attached < admissionExpiry && issued >= attached && issued < admissionExpiry
        && expiry > issued && expiry - issued <= 24 * 60 * 60 * 1000;
}, 'Grant issuance and attachment retain the admitted person and pins within the admission window; session duration is explicit and bounded');
export const ElevenLabsNativeSessionGrantIssueRequestSchema = z.object({
    requestId: RefId, conversation: ElevenLabsNativeConversationBindingSchema,
}).strict();
export const ElevenLabsNativeSessionGrantAuthorityRequestSchema = z.object({
    requestId: RefId, scope: CapabilityPersonScopeSchema, grantId: RefId,
    operation: z.enum(['guide_start', 'continue']), phase: z.enum(['before', 'after']),
}).strict();
export const ElevenLabsNativeSessionGrantAuthorityResultSchema = z.object({
    ok: z.literal(true), request: ElevenLabsNativeSessionGrantAuthorityRequestSchema,
    grant: ElevenLabsNativeSessionGrantSchema, observedAt: Instant, expiresAt: Instant,
}).strict().refine(x => {
    const observed = Date.parse(x.observedAt), expiry = Date.parse(x.expiresAt);
    return x.request.grantId === x.grant.grantId && sameCapabilityScope(x.request.scope, x.grant.attempt.scope)
        && observed >= Date.parse(x.grant.issuedAt) && expiry > observed && expiry - observed <= 60000
        && expiry <= Date.parse(x.grant.expiresAt);
}, 'Fresh authority is bound to the full person and durable grant, never beyond the grant expiry');
/** expectedAttempt is loaded from the authenticated durable authority store, never the request. */
export function isElevenLabsNativeSessionGrantForIssueRequest(rawRequest, rawGrant, rawExpectedAttempt, now) {
    const request = ElevenLabsNativeSessionGrantIssueRequestSchema.safeParse(rawRequest);
    const grant = ElevenLabsNativeSessionGrantSchema.safeParse(rawGrant);
    const attempt = ElevenLabsNativeAdmissionAttemptSchema.safeParse(rawExpectedAttempt), time = now.getTime();
    return request.success && grant.success && attempt.success && Number.isFinite(time)
        && request.data.requestId === grant.data.requestId
        && sameElevenLabsNativeConversation(request.data.conversation, grant.data.conversation)
        && sameValue(attempt.data, grant.data.attempt)
        && (grant.data.status === 'active' || grant.data.status === 'draining')
        && Date.parse(grant.data.issuedAt) <= time && time < Date.parse(grant.data.expiresAt);
}
/** expectedGrant is the durable record. Re-check current server authority after every await. */
export function isElevenLabsNativeSessionGrantAuthorityCurrent(rawRequest, rawResult, rawExpectedGrant, now) {
    const request = ElevenLabsNativeSessionGrantAuthorityRequestSchema.safeParse(rawRequest);
    const result = ElevenLabsNativeSessionGrantAuthorityResultSchema.safeParse(rawResult);
    const expected = ElevenLabsNativeSessionGrantSchema.safeParse(rawExpectedGrant), time = now.getTime();
    if (!request.success || !result.success || !expected.success || !Number.isFinite(time))
        return false;
    const { status: prior, ...immutableExpected } = expected.data;
    const { status: observed, ...immutableObserved } = result.data.grant;
    return sameValue(request.data, result.data.request) && sameValue(immutableExpected, immutableObserved)
        && (prior === 'active' || prior === 'draining') && (observed === 'active' || observed === 'draining')
        && (prior !== 'draining' || observed === 'draining')
        && (observed !== 'draining' || request.data.operation === 'continue')
        && Date.parse(result.data.observedAt) <= time && time < Date.parse(result.data.expiresAt);
}
//# sourceMappingURL=native-session-grant.js.map