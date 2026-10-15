"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nativeBindingReadContract = exports.ElevenLabsNativeBindingReadResultSchema = exports.ElevenLabsNativeBindingReadRequestSchema = void 0;
exports.isElevenLabsNativeBindingReadCurrent = isElevenLabsNativeBindingReadCurrent;
exports.isElevenLabsNativeBindingReadForRoute = isElevenLabsNativeBindingReadForRoute;
exports.capElevenLabsNativeBindingReadPath = capElevenLabsNativeBindingReadPath;
const zod_1 = require("zod");
const index_js_1 = require("../../auth/index.cjs");
const capability_call_context_js_1 = require("../../capability/capability-call-context.cjs");
const native_session_js_1 = require("../../capability/agent-elevenlabs/native-session.cjs");
const shared_js_1 = require("../../capability/coach/shared.cjs");
const internal_capability_agent_js_1 = require("./internal-capability-agent.cjs");
const native_channel_js_1 = require("./native-channel.cjs");
/** The server resolves person scope. References select a persisted record, never permission. */
exports.ElevenLabsNativeBindingReadRequestSchema = zod_1.z.object({
    requestId: shared_js_1.RefId, scope: capability_call_context_js_1.CapabilityPersonScopeSchema,
    ref: zod_1.z.discriminatedUnion('kind', [
        zod_1.z.object({ kind: zod_1.z.literal('attempt'), attemptId: shared_js_1.RefId }).strict(),
        zod_1.z.object({ kind: zod_1.z.literal('binding'), bindingId: shared_js_1.RefId }).strict(),
    ]),
}).strict();
/** Absence and pause are observations; they neither renew admission nor authorize execution. */
exports.ElevenLabsNativeBindingReadResultSchema = zod_1.z.object({
    ok: zod_1.z.literal(true), request: exports.ElevenLabsNativeBindingReadRequestSchema,
    record: zod_1.z.object({ attempt: native_session_js_1.ElevenLabsNativeAdmissionAttemptSchema, binding: native_session_js_1.ElevenLabsNativeSessionBindingSchema, pausedAt: shared_js_1.Instant.nullable() }).strict().nullable(),
    observedAt: shared_js_1.Instant, expiresAt: shared_js_1.Instant,
}).strict().refine(x => {
    const observed = Date.parse(x.observedAt), expires = Date.parse(x.expiresAt), r = x.record;
    return expires > observed && expires - observed <= 60000
        && (r === null || ((0, native_session_js_1.isElevenLabsNativeSessionForAttempt)(r.binding, r.attempt)
            && (0, capability_call_context_js_1.sameCapabilityScope)(x.request.scope, r.attempt.scope)
            && (x.request.ref.kind === 'attempt' ? x.request.ref.attemptId === r.attempt.attemptId : x.request.ref.bindingId === r.binding.bindingId)
            && Date.parse(r.attempt.createdAt) <= observed && Date.parse(r.binding.boundAt) <= observed
            && (r.pausedAt === null || (Date.parse(r.pausedAt) >= Date.parse(r.binding.boundAt) && Date.parse(r.pausedAt) <= observed))));
}, 'Fresh bounded observation of one correlated durable binding');
/** Expected attempt comes from the trusted Forge writer. This checks facts, not current permission. */
function isElevenLabsNativeBindingReadCurrent(rawRequest, rawResult, rawExpectedAttempt, now) {
    const request = exports.ElevenLabsNativeBindingReadRequestSchema.safeParse(rawRequest), result = exports.ElevenLabsNativeBindingReadResultSchema.safeParse(rawResult);
    const expected = native_session_js_1.ElevenLabsNativeAdmissionAttemptSchema.safeParse(rawExpectedAttempt), time = now.getTime();
    return request.success && result.success && expected.success && Number.isFinite(time)
        && (0, shared_js_1.sameValue)(request.data, result.data.request) && (0, capability_call_context_js_1.sameCapabilityScope)(request.data.scope, expected.data.scope)
        && (request.data.ref.kind !== 'attempt' || request.data.ref.attemptId === expected.data.attemptId)
        && (result.data.record === null || (0, shared_js_1.sameValue)(result.data.record.attempt, expected.data))
        && Date.parse(expected.data.createdAt) <= Date.parse(result.data.observedAt)
        && Date.parse(result.data.observedAt) <= time && Date.parse(result.data.expiresAt) > time;
}
function isElevenLabsNativeBindingReadForRoute(rawRequest, rawParams) {
    const request = exports.ElevenLabsNativeBindingReadRequestSchema.safeParse(rawRequest), params = internal_capability_agent_js_1.CapabilityAgentParamsSchema.strict().safeParse(rawParams);
    return request.success && params.success && request.data.scope.agentId === params.data.agentId;
}
exports.nativeBindingReadContract = {
    method: 'POST', path: '/internal/capability/agents/:agentId/elevenlabs/native/bindings/read',
    authType: 'secret', authHeader: index_js_1.INTERNAL_SECRET_HEADER, paramsSchema: internal_capability_agent_js_1.CapabilityAgentParamsSchema.strict(),
    bodySchema: exports.ElevenLabsNativeBindingReadRequestSchema, responseSchema: exports.ElevenLabsNativeBindingReadResultSchema,
};
function capElevenLabsNativeBindingReadPath(agentId) { return (0, native_channel_js_1.capElevenLabsNativePath)(agentId) + '/bindings/read'; }
//# sourceMappingURL=native-binding-read.js.map