import { z } from 'zod';
import { CapabilityAgentScopeSchema, CapabilityPersonScopeSchema, sameCapabilityScope } from "../capability-call-context.js";
import { AgentContextIdentitySchema } from "../../agent/agent-context-identity.js";
import { AgentConfigVersionSchema } from "../ricerca/agent-config.js";
import { CoachProgramVersionRefSchema } from "../coach/program-version.js";
import { CoachSessionOpeningRefSchema, CoachSessionExecutionSnapshotSchema, isCoachExecutionSnapshotForOpening } from "../coach/execution.js";
import { RefId, Text128, Instant, agentScope, sameValue } from "../coach/shared.js";
import { ElevenLabsAgentMappingSchema, sameElevenLabsMapping } from "./index.js";
import { ElevenLabsWebViewerSchema } from "./web-session.js";
export const ElevenLabsPromptBundleHashSchema = z.string().regex(/^[a-f0-9]{64}$/);
const AuthenticatedViewer = ElevenLabsWebViewerSchema.options[1];
/** Internal durable Forge record. The browser supplies correlation, never this authority snapshot. */
export const ElevenLabsNativeAdmissionAttemptSchema = z.object({
    attemptId: RefId, requestId: RefId, linkId: RefId, scope: CapabilityPersonScopeSchema,
    viewer: AuthenticatedViewer, agentIdentity: AgentContextIdentitySchema,
    program: CoachProgramVersionRefSchema, configVersion: AgentConfigVersionSchema,
    promptBundleHash: ElevenLabsPromptBundleHashSchema, policyVersion: AgentConfigVersionSchema,
    status: z.enum(['pending', 'admitted', 'revoked', 'expired']), createdAt: Instant, expiresAt: Instant,
}).strict().refine(x => sameCapabilityScope(agentScope(x.scope), x.program.scope)
    && sameCapabilityScope(agentScope(x.scope), x.agentIdentity) && x.viewer.userId === x.scope.userId
    && Date.parse(x.expiresAt) > Date.parse(x.createdAt) && Date.parse(x.expiresAt) - Date.parse(x.createdAt) <= 60000, 'Admission binds authenticated person, full identity and a short server window');
export const ElevenLabsNativeAuthorityRequestSchema = z.object({
    requestId: RefId, scope: CapabilityAgentScopeSchema, attemptId: RefId, phase: z.enum(['before', 'after']),
}).strict();
export const ElevenLabsNativeAuthorityResultSchema = z.object({
    ok: z.literal(true), request: ElevenLabsNativeAuthorityRequestSchema, attempt: ElevenLabsNativeAdmissionAttemptSchema,
    observedAt: Instant, expiresAt: Instant,
}).strict().refine(x => x.request.attemptId === x.attempt.attemptId
    && sameCapabilityScope(x.request.scope, agentScope(x.attempt.scope))
    && Date.parse(x.observedAt) >= Date.parse(x.attempt.createdAt)
    && Date.parse(x.expiresAt) <= Date.parse(x.attempt.expiresAt) && Date.parse(x.expiresAt) > Date.parse(x.observedAt), 'Authority readback is bound to the durable attempt');
/** Expected record comes from the authenticated Forge store, not a caller body. Re-read after every await. */
export function isElevenLabsNativeAuthorityCurrent(rawRequest, rawResult, rawExpectedAttempt, now) {
    const request = ElevenLabsNativeAuthorityRequestSchema.safeParse(rawRequest), result = ElevenLabsNativeAuthorityResultSchema.safeParse(rawResult);
    const attempt = ElevenLabsNativeAdmissionAttemptSchema.safeParse(rawExpectedAttempt), time = now.getTime();
    return request.success && result.success && attempt.success && Number.isFinite(time)
        && sameValue(request.data, result.data.request) && sameValue(attempt.data, result.data.attempt)
        && attempt.data.status !== 'revoked' && attempt.data.status !== 'expired'
        && Date.parse(attempt.data.createdAt) <= time && Date.parse(result.data.observedAt) <= time && Date.parse(result.data.expiresAt) > time;
}
export const ElevenLabsNativeSessionBindingSchema = z.object({
    bindingId: RefId, attemptId: RefId, opening: CoachSessionOpeningRefSchema, mapping: ElevenLabsAgentMappingSchema,
    configVersion: AgentConfigVersionSchema, promptBundleHash: ElevenLabsPromptBundleHashSchema, boundAt: Instant,
}).strict().refine(x => sameCapabilityScope(x.mapping.scope, agentScope(x.opening.scope))
    && x.mapping.appliedConfigVersion === x.configVersion && x.opening.appliedConfigVersion === x.configVersion
    && Date.parse(x.boundAt) >= Date.parse(x.opening.openedAt), 'Native session retains applied mapping and original opening');
export function isElevenLabsNativeSessionForAttempt(rawBinding, rawAttempt) {
    const binding = ElevenLabsNativeSessionBindingSchema.safeParse(rawBinding), attempt = ElevenLabsNativeAdmissionAttemptSchema.safeParse(rawAttempt);
    if (!binding.success || !attempt.success)
        return false;
    const b = binding.data, a = attempt.data;
    return b.attemptId === a.attemptId && sameCapabilityScope(b.opening.scope, a.scope)
        && sameValue(b.opening.program, a.program) && b.configVersion === a.configVersion && b.promptBundleHash === a.promptBundleHash;
}
export const ElevenLabsNativeMintRequestSchema = z.object({ requestId: RefId, binding: ElevenLabsNativeSessionBindingSchema, transport: z.enum(['webrtc', 'websocket']) }).strict();
/** Sensitive transport material: never persist or log the successful result. */
const NativeConnection = z.discriminatedUnion('transport', [
    z.object({ transport: z.literal('webrtc'), conversationToken: z.string().min(1).max(8192) }).strict(),
    z.object({ transport: z.literal('websocket'), signedUrl: z.url().max(8192).refine(value => {
            const u = new URL(value);
            return u.protocol === 'wss:' && u.hostname === 'api.elevenlabs.io' && u.port === ''
                && u.pathname === '/v1/convai/conversation' && u.username === '' && u.password === '' && u.hash === ''
                && u.searchParams.getAll('agent_id').length === 1 && u.searchParams.getAll('conversation_signature').length === 1
                && !!u.searchParams.get('conversation_signature') && [...u.searchParams.keys()].every(k => ['agent_id', 'conversation_signature'].includes(k));
        }) }).strict(),
]);
export const ElevenLabsNativeMintResultSchema = z.object({
    ok: z.literal(true), requestId: RefId, binding: ElevenLabsNativeSessionBindingSchema, issuedAt: Instant, expiresAt: Instant, connection: NativeConnection,
}).strict().refine(x => Date.parse(x.issuedAt) >= Date.parse(x.binding.boundAt) && Date.parse(x.expiresAt) > Date.parse(x.issuedAt)
    && Date.parse(x.expiresAt) - Date.parse(x.issuedAt) <= 15 * 60000
    && (x.connection.transport !== 'websocket' || new URL(x.connection.signedUrl).searchParams.get('agent_id') === x.binding.mapping.providerAgentId), 'Connection window and provider resource must match the admitted binding');
export function isElevenLabsNativeMintCurrent(rawRequest, rawResult, rawCurrentBinding, now) {
    const request = ElevenLabsNativeMintRequestSchema.safeParse(rawRequest), result = ElevenLabsNativeMintResultSchema.safeParse(rawResult);
    const binding = ElevenLabsNativeSessionBindingSchema.safeParse(rawCurrentBinding), time = now.getTime();
    return request.success && result.success && binding.success && Number.isFinite(time)
        && request.data.requestId === result.data.requestId && request.data.transport === result.data.connection.transport
        && sameValue(request.data.binding, binding.data) && sameValue(result.data.binding, binding.data)
        && Date.parse(result.data.issuedAt) <= time && Date.parse(result.data.expiresAt) > time;
}
export const ElevenLabsNativeConversationBindingSchema = z.object({
    binding: ElevenLabsNativeSessionBindingSchema, providerConversationId: Text128, attachedAt: Instant,
}).strict().refine(x => Date.parse(x.attachedAt) >= Date.parse(x.binding.boundAt), 'Conversation follows admission');
export const ElevenLabsNativeExecutionAttachmentSchema = z.object({
    conversation: ElevenLabsNativeConversationBindingSchema, snapshot: CoachSessionExecutionSnapshotSchema, attachedAt: Instant,
}).strict().refine(x => isCoachExecutionSnapshotForOpening(x.snapshot, x.conversation.binding.opening)
    && Date.parse(x.attachedAt) >= Date.parse(x.conversation.attachedAt) && Date.parse(x.attachedAt) >= Date.parse(x.snapshot.startedAt), 'Attach original execution once');
export function sameElevenLabsNativeConversation(rawA, rawB) {
    const a = ElevenLabsNativeConversationBindingSchema.safeParse(rawA), b = ElevenLabsNativeConversationBindingSchema.safeParse(rawB);
    return a.success && b.success && sameValue(a.data, b.data) && sameElevenLabsMapping(a.data.binding.mapping, b.data.binding.mapping);
}
export const ElevenLabsNativeCallbackIdentitySchema = z.object({
    eventId: RefId, providerConversationId: Text128, providerAgentId: ElevenLabsAgentMappingSchema.shape.providerAgentId,
    occurredAt: Instant, bodySha256: ElevenLabsPromptBundleHashSchema,
}).strict();
export const ElevenLabsNativeCallbackReceiptSchema = z.object({
    callback: ElevenLabsNativeCallbackIdentitySchema, binding: ElevenLabsNativeConversationBindingSchema,
    receivedAt: Instant, inboxStatus: z.enum(['accepted', 'duplicate']), effectStatus: z.enum(['pending', 'applied', 'rejected']),
}).strict().refine(x => x.callback.providerConversationId === x.binding.providerConversationId
    && x.callback.providerAgentId === x.binding.binding.mapping.providerAgentId
    && Date.parse(x.callback.occurredAt) >= Date.parse(x.binding.attachedAt) && Date.parse(x.receivedAt) >= Date.parse(x.callback.occurredAt), 'Inbox receipt does not itself mean an applied effect');
export function isElevenLabsNativeCallbackCurrent(raw, rawBinding, now, maxSkewSeconds = 300) {
    const receipt = ElevenLabsNativeCallbackReceiptSchema.safeParse(raw), binding = ElevenLabsNativeConversationBindingSchema.safeParse(rawBinding), time = now.getTime();
    return receipt.success && binding.success && Number.isFinite(time) && Number.isInteger(maxSkewSeconds) && maxSkewSeconds > 0 && maxSkewSeconds <= 300
        && sameElevenLabsNativeConversation(receipt.data.binding, binding.data) && Date.parse(receipt.data.receivedAt) <= time
        && Math.abs(time - Date.parse(receipt.data.callback.occurredAt)) <= maxSkewSeconds * 1000;
}
/** Identity and bundle correlation only; this descriptor grants no corpus or document access. */
export const ElevenLabsNativeKnowledgeBindingSchema = z.object({
    attemptId: RefId, opening: CoachSessionOpeningRefSchema, agentIdentity: AgentContextIdentitySchema,
    configVersion: AgentConfigVersionSchema, promptBundleHash: ElevenLabsPromptBundleHashSchema,
}).strict().refine(x => sameCapabilityScope(agentScope(x.opening.scope), x.agentIdentity)
    && x.configVersion === x.opening.appliedConfigVersion, 'Knowledge context retains declared authority and applied bundle');
//# sourceMappingURL=native-session.js.map