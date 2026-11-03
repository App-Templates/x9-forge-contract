import { z } from 'zod';
import { INTERNAL_SECRET_HEADER } from "../../auth/index.js";
import { CapabilityPersonScopeSchema, sameCapabilityScope } from "../../capability/capability-call-context.js";
import { ElevenLabsNativeAdmissionAttemptSchema, ElevenLabsNativeSessionBindingSchema, isElevenLabsNativeSessionForAttempt } from "../../capability/agent-elevenlabs/native-session.js";
import { RefId, Instant, sameValue } from "../../capability/coach/shared.js";
import { CapabilityAgentParamsSchema } from "./internal-capability-agent.js";
import { capElevenLabsNativePath } from "./native-channel.js";
/** The server resolves person scope. References select a persisted record, never permission. */
export const ElevenLabsNativeBindingReadRequestSchema = z.object({
    requestId: RefId, scope: CapabilityPersonScopeSchema,
    ref: z.discriminatedUnion('kind', [
        z.object({ kind: z.literal('attempt'), attemptId: RefId }).strict(),
        z.object({ kind: z.literal('binding'), bindingId: RefId }).strict(),
    ]),
}).strict();
/** Absence and pause are observations; they neither renew admission nor authorize execution. */
export const ElevenLabsNativeBindingReadResultSchema = z.object({
    ok: z.literal(true), request: ElevenLabsNativeBindingReadRequestSchema,
    record: z.object({ attempt: ElevenLabsNativeAdmissionAttemptSchema, binding: ElevenLabsNativeSessionBindingSchema, pausedAt: Instant.nullable() }).strict().nullable(),
    observedAt: Instant, expiresAt: Instant,
}).strict().refine(x => {
    const observed = Date.parse(x.observedAt), expires = Date.parse(x.expiresAt), r = x.record;
    return expires > observed && expires - observed <= 60000
        && (r === null || (isElevenLabsNativeSessionForAttempt(r.binding, r.attempt)
            && sameCapabilityScope(x.request.scope, r.attempt.scope)
            && (x.request.ref.kind === 'attempt' ? x.request.ref.attemptId === r.attempt.attemptId : x.request.ref.bindingId === r.binding.bindingId)
            && Date.parse(r.attempt.createdAt) <= observed && Date.parse(r.binding.boundAt) <= observed
            && (r.pausedAt === null || (Date.parse(r.pausedAt) >= Date.parse(r.binding.boundAt) && Date.parse(r.pausedAt) <= observed))));
}, 'Fresh bounded observation of one correlated durable binding');
/** Expected attempt comes from the trusted Forge writer. This checks facts, not current permission. */
export function isElevenLabsNativeBindingReadCurrent(rawRequest, rawResult, rawExpectedAttempt, now) {
    const request = ElevenLabsNativeBindingReadRequestSchema.safeParse(rawRequest), result = ElevenLabsNativeBindingReadResultSchema.safeParse(rawResult);
    const expected = ElevenLabsNativeAdmissionAttemptSchema.safeParse(rawExpectedAttempt), time = now.getTime();
    return request.success && result.success && expected.success && Number.isFinite(time)
        && sameValue(request.data, result.data.request) && sameCapabilityScope(request.data.scope, expected.data.scope)
        && (request.data.ref.kind !== 'attempt' || request.data.ref.attemptId === expected.data.attemptId)
        && (result.data.record === null || sameValue(result.data.record.attempt, expected.data))
        && Date.parse(expected.data.createdAt) <= Date.parse(result.data.observedAt)
        && Date.parse(result.data.observedAt) <= time && Date.parse(result.data.expiresAt) > time;
}
export function isElevenLabsNativeBindingReadForRoute(rawRequest, rawParams) {
    const request = ElevenLabsNativeBindingReadRequestSchema.safeParse(rawRequest), params = CapabilityAgentParamsSchema.strict().safeParse(rawParams);
    return request.success && params.success && request.data.scope.agentId === params.data.agentId;
}
export const nativeBindingReadContract = {
    method: 'POST', path: '/internal/capability/agents/:agentId/elevenlabs/native/bindings/read',
    authType: 'secret', authHeader: INTERNAL_SECRET_HEADER, paramsSchema: CapabilityAgentParamsSchema.strict(),
    bodySchema: ElevenLabsNativeBindingReadRequestSchema, responseSchema: ElevenLabsNativeBindingReadResultSchema,
};
export function capElevenLabsNativeBindingReadPath(agentId) { return capElevenLabsNativePath(agentId) + '/bindings/read'; }
//# sourceMappingURL=native-binding-read.js.map