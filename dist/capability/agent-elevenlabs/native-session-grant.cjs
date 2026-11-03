"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElevenLabsNativeSessionGrantAuthorityResultSchema = exports.ElevenLabsNativeSessionGrantAuthorityRequestSchema = exports.ElevenLabsNativeSessionGrantIssueRequestSchema = exports.ElevenLabsNativeSessionGrantSchema = void 0;
exports.isElevenLabsNativeSessionGrantForIssueRequest = isElevenLabsNativeSessionGrantForIssueRequest;
exports.isElevenLabsNativeSessionGrantAuthorityCurrent = isElevenLabsNativeSessionGrantAuthorityCurrent;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const shared_js_1 = require("../coach/shared.cjs");
const native_session_js_1 = require("./native-session.cjs");
/** Durable session metadata, never permission by itself. A Forge producer must re-read current
 * policy, invitations, link and runtime authority after awaits; S2S authentication alone is insufficient. */
exports.ElevenLabsNativeSessionGrantSchema = zod_1.z.object({
    grantId: shared_js_1.RefId, requestId: shared_js_1.RefId, attempt: native_session_js_1.ElevenLabsNativeAdmissionAttemptSchema,
    conversation: native_session_js_1.ElevenLabsNativeConversationBindingSchema,
    issuedAt: shared_js_1.Instant, expiresAt: shared_js_1.Instant, status: zod_1.z.enum(['active', 'draining', 'revoked', 'closed']),
}).strict().refine(x => {
    const created = Date.parse(x.attempt.createdAt), admissionExpiry = Date.parse(x.attempt.expiresAt);
    const attached = Date.parse(x.conversation.attachedAt), issued = Date.parse(x.issuedAt), expiry = Date.parse(x.expiresAt);
    return x.attempt.status === 'admitted' && (0, native_session_js_1.isElevenLabsNativeSessionForAttempt)(x.conversation.binding, x.attempt)
        && attached >= created && attached < admissionExpiry && issued >= attached && issued < admissionExpiry
        && expiry > issued && expiry - issued <= 24 * 60 * 60 * 1000;
}, 'Grant issuance and attachment retain the admitted person and pins within the admission window; session duration is explicit and bounded');
exports.ElevenLabsNativeSessionGrantIssueRequestSchema = zod_1.z.object({
    requestId: shared_js_1.RefId, conversation: native_session_js_1.ElevenLabsNativeConversationBindingSchema,
}).strict();
exports.ElevenLabsNativeSessionGrantAuthorityRequestSchema = zod_1.z.object({
    requestId: shared_js_1.RefId, scope: capability_call_context_js_1.CapabilityPersonScopeSchema, grantId: shared_js_1.RefId,
    operation: zod_1.z.enum(['guide_start', 'continue']), phase: zod_1.z.enum(['before', 'after']),
}).strict();
exports.ElevenLabsNativeSessionGrantAuthorityResultSchema = zod_1.z.object({
    ok: zod_1.z.literal(true), request: exports.ElevenLabsNativeSessionGrantAuthorityRequestSchema,
    grant: exports.ElevenLabsNativeSessionGrantSchema, observedAt: shared_js_1.Instant, expiresAt: shared_js_1.Instant,
}).strict().refine(x => {
    const observed = Date.parse(x.observedAt), expiry = Date.parse(x.expiresAt);
    return x.request.grantId === x.grant.grantId && (0, capability_call_context_js_1.sameCapabilityScope)(x.request.scope, x.grant.attempt.scope)
        && observed >= Date.parse(x.grant.issuedAt) && expiry > observed && expiry - observed <= 60000
        && expiry <= Date.parse(x.grant.expiresAt);
}, 'Fresh authority is bound to the full person and durable grant, never beyond the grant expiry');
/** expectedAttempt is loaded from the authenticated durable authority store, never the request. */
function isElevenLabsNativeSessionGrantForIssueRequest(rawRequest, rawGrant, rawExpectedAttempt, now) {
    const request = exports.ElevenLabsNativeSessionGrantIssueRequestSchema.safeParse(rawRequest);
    const grant = exports.ElevenLabsNativeSessionGrantSchema.safeParse(rawGrant);
    const attempt = native_session_js_1.ElevenLabsNativeAdmissionAttemptSchema.safeParse(rawExpectedAttempt), time = now.getTime();
    return request.success && grant.success && attempt.success && Number.isFinite(time)
        && request.data.requestId === grant.data.requestId
        && (0, native_session_js_1.sameElevenLabsNativeConversation)(request.data.conversation, grant.data.conversation)
        && (0, shared_js_1.sameValue)(attempt.data, grant.data.attempt)
        && (grant.data.status === 'active' || grant.data.status === 'draining')
        && Date.parse(grant.data.issuedAt) <= time && time < Date.parse(grant.data.expiresAt);
}
/** expectedGrant is the durable record. Re-check current server authority after every await. */
function isElevenLabsNativeSessionGrantAuthorityCurrent(rawRequest, rawResult, rawExpectedGrant, now) {
    const request = exports.ElevenLabsNativeSessionGrantAuthorityRequestSchema.safeParse(rawRequest);
    const result = exports.ElevenLabsNativeSessionGrantAuthorityResultSchema.safeParse(rawResult);
    const expected = exports.ElevenLabsNativeSessionGrantSchema.safeParse(rawExpectedGrant), time = now.getTime();
    if (!request.success || !result.success || !expected.success || !Number.isFinite(time))
        return false;
    const { status: prior, ...immutableExpected } = expected.data;
    const { status: observed, ...immutableObserved } = result.data.grant;
    return (0, shared_js_1.sameValue)(request.data, result.data.request) && (0, shared_js_1.sameValue)(immutableExpected, immutableObserved)
        && (prior === 'active' || prior === 'draining') && (observed === 'active' || observed === 'draining')
        && (prior !== 'draining' || observed === 'draining')
        && (observed !== 'draining' || request.data.operation === 'continue')
        && Date.parse(result.data.observedAt) <= time && time < Date.parse(result.data.expiresAt);
}
//# sourceMappingURL=native-session-grant.js.map