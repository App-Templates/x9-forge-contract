"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElevenLabsNativeKnowledgeBindingSchema = exports.ElevenLabsNativeCallbackReceiptSchema = exports.ElevenLabsNativeCallbackIdentitySchema = exports.ElevenLabsNativeExecutionAttachmentSchema = exports.ElevenLabsNativeConversationBindingSchema = exports.ElevenLabsNativeMintResultSchema = exports.ElevenLabsNativeMintRequestSchema = exports.ElevenLabsNativeSessionBindingSchema = exports.ElevenLabsNativeAuthorityResultSchema = exports.ElevenLabsNativeAuthorityRequestSchema = exports.ElevenLabsNativeAdmissionAttemptSchema = exports.ElevenLabsPromptBundleHashSchema = void 0;
exports.isElevenLabsNativeAuthorityCurrent = isElevenLabsNativeAuthorityCurrent;
exports.isElevenLabsNativeSessionForAttempt = isElevenLabsNativeSessionForAttempt;
exports.isElevenLabsNativeMintCurrent = isElevenLabsNativeMintCurrent;
exports.sameElevenLabsNativeConversation = sameElevenLabsNativeConversation;
exports.isElevenLabsNativeCallbackCurrent = isElevenLabsNativeCallbackCurrent;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const agent_context_identity_js_1 = require("../../agent/agent-context-identity.cjs");
const agent_config_js_1 = require("../ricerca/agent-config.cjs");
const program_version_js_1 = require("../coach/program-version.cjs");
const execution_js_1 = require("../coach/execution.cjs");
const shared_js_1 = require("../coach/shared.cjs");
const index_js_1 = require("./index.cjs");
const web_session_js_1 = require("./web-session.cjs");
exports.ElevenLabsPromptBundleHashSchema = zod_1.z.string().regex(/^[a-f0-9]{64}$/);
const AuthenticatedViewer = web_session_js_1.ElevenLabsWebViewerSchema.options[1];
/** Internal durable Forge record. The browser supplies correlation, never this authority snapshot. */
exports.ElevenLabsNativeAdmissionAttemptSchema = zod_1.z.object({
    attemptId: shared_js_1.RefId, requestId: shared_js_1.RefId, linkId: shared_js_1.RefId, scope: capability_call_context_js_1.CapabilityPersonScopeSchema,
    viewer: AuthenticatedViewer, agentIdentity: agent_context_identity_js_1.AgentContextIdentitySchema,
    program: program_version_js_1.CoachProgramVersionRefSchema, configVersion: agent_config_js_1.AgentConfigVersionSchema,
    promptBundleHash: exports.ElevenLabsPromptBundleHashSchema, policyVersion: agent_config_js_1.AgentConfigVersionSchema,
    status: zod_1.z.enum(['pending', 'admitted', 'revoked', 'expired']), createdAt: shared_js_1.Instant, expiresAt: shared_js_1.Instant,
}).strict().refine(x => (0, capability_call_context_js_1.sameCapabilityScope)((0, shared_js_1.agentScope)(x.scope), x.program.scope)
    && (0, capability_call_context_js_1.sameCapabilityScope)((0, shared_js_1.agentScope)(x.scope), x.agentIdentity) && x.viewer.userId === x.scope.userId
    && Date.parse(x.expiresAt) > Date.parse(x.createdAt) && Date.parse(x.expiresAt) - Date.parse(x.createdAt) <= 60000, 'Admission binds authenticated person, full identity and a short server window');
exports.ElevenLabsNativeAuthorityRequestSchema = zod_1.z.object({
    requestId: shared_js_1.RefId, scope: capability_call_context_js_1.CapabilityAgentScopeSchema, attemptId: shared_js_1.RefId, phase: zod_1.z.enum(['before', 'after']),
}).strict();
exports.ElevenLabsNativeAuthorityResultSchema = zod_1.z.object({
    ok: zod_1.z.literal(true), request: exports.ElevenLabsNativeAuthorityRequestSchema, attempt: exports.ElevenLabsNativeAdmissionAttemptSchema,
    observedAt: shared_js_1.Instant, expiresAt: shared_js_1.Instant,
}).strict().refine(x => x.request.attemptId === x.attempt.attemptId
    && (0, capability_call_context_js_1.sameCapabilityScope)(x.request.scope, (0, shared_js_1.agentScope)(x.attempt.scope))
    && Date.parse(x.observedAt) >= Date.parse(x.attempt.createdAt)
    && Date.parse(x.expiresAt) <= Date.parse(x.attempt.expiresAt) && Date.parse(x.expiresAt) > Date.parse(x.observedAt), 'Authority readback is bound to the durable attempt');
/** Expected record comes from the authenticated Forge store, not a caller body. Re-read after every await. */
function isElevenLabsNativeAuthorityCurrent(rawRequest, rawResult, rawExpectedAttempt, now) {
    const request = exports.ElevenLabsNativeAuthorityRequestSchema.safeParse(rawRequest), result = exports.ElevenLabsNativeAuthorityResultSchema.safeParse(rawResult);
    const attempt = exports.ElevenLabsNativeAdmissionAttemptSchema.safeParse(rawExpectedAttempt), time = now.getTime();
    return request.success && result.success && attempt.success && Number.isFinite(time)
        && (0, shared_js_1.sameValue)(request.data, result.data.request) && (0, shared_js_1.sameValue)(attempt.data, result.data.attempt)
        && attempt.data.status !== 'revoked' && attempt.data.status !== 'expired'
        && Date.parse(attempt.data.createdAt) <= time && Date.parse(result.data.observedAt) <= time && Date.parse(result.data.expiresAt) > time;
}
exports.ElevenLabsNativeSessionBindingSchema = zod_1.z.object({
    bindingId: shared_js_1.RefId, attemptId: shared_js_1.RefId, opening: execution_js_1.CoachSessionOpeningRefSchema, mapping: index_js_1.ElevenLabsAgentMappingSchema,
    configVersion: agent_config_js_1.AgentConfigVersionSchema, promptBundleHash: exports.ElevenLabsPromptBundleHashSchema, boundAt: shared_js_1.Instant,
}).strict().refine(x => (0, capability_call_context_js_1.sameCapabilityScope)(x.mapping.scope, (0, shared_js_1.agentScope)(x.opening.scope))
    && x.mapping.appliedConfigVersion === x.configVersion && x.opening.appliedConfigVersion === x.configVersion
    && Date.parse(x.boundAt) >= Date.parse(x.opening.openedAt), 'Native session retains applied mapping and original opening');
function isElevenLabsNativeSessionForAttempt(rawBinding, rawAttempt) {
    const binding = exports.ElevenLabsNativeSessionBindingSchema.safeParse(rawBinding), attempt = exports.ElevenLabsNativeAdmissionAttemptSchema.safeParse(rawAttempt);
    if (!binding.success || !attempt.success)
        return false;
    const b = binding.data, a = attempt.data;
    return b.attemptId === a.attemptId && (0, capability_call_context_js_1.sameCapabilityScope)(b.opening.scope, a.scope)
        && (0, shared_js_1.sameValue)(b.opening.program, a.program) && b.configVersion === a.configVersion && b.promptBundleHash === a.promptBundleHash;
}
exports.ElevenLabsNativeMintRequestSchema = zod_1.z.object({ requestId: shared_js_1.RefId, binding: exports.ElevenLabsNativeSessionBindingSchema, transport: zod_1.z.enum(['webrtc', 'websocket']) }).strict();
/** Sensitive transport material: never persist or log the successful result. */
const NativeConnection = zod_1.z.discriminatedUnion('transport', [
    zod_1.z.object({ transport: zod_1.z.literal('webrtc'), conversationToken: zod_1.z.string().min(1).max(8192) }).strict(),
    zod_1.z.object({ transport: zod_1.z.literal('websocket'), signedUrl: zod_1.z.url().max(8192).refine(value => {
            const u = new URL(value);
            return u.protocol === 'wss:' && u.hostname === 'api.elevenlabs.io' && u.port === ''
                && u.pathname === '/v1/convai/conversation' && u.username === '' && u.password === '' && u.hash === ''
                && u.searchParams.getAll('agent_id').length === 1 && u.searchParams.getAll('conversation_signature').length === 1
                && !!u.searchParams.get('conversation_signature') && [...u.searchParams.keys()].every(k => ['agent_id', 'conversation_signature'].includes(k));
        }) }).strict(),
]);
exports.ElevenLabsNativeMintResultSchema = zod_1.z.object({
    ok: zod_1.z.literal(true), requestId: shared_js_1.RefId, binding: exports.ElevenLabsNativeSessionBindingSchema, issuedAt: shared_js_1.Instant, expiresAt: shared_js_1.Instant, connection: NativeConnection,
}).strict().refine(x => Date.parse(x.issuedAt) >= Date.parse(x.binding.boundAt) && Date.parse(x.expiresAt) > Date.parse(x.issuedAt)
    && Date.parse(x.expiresAt) - Date.parse(x.issuedAt) <= 15 * 60000
    && (x.connection.transport !== 'websocket' || new URL(x.connection.signedUrl).searchParams.get('agent_id') === x.binding.mapping.providerAgentId), 'Connection window and provider resource must match the admitted binding');
function isElevenLabsNativeMintCurrent(rawRequest, rawResult, rawCurrentBinding, now) {
    const request = exports.ElevenLabsNativeMintRequestSchema.safeParse(rawRequest), result = exports.ElevenLabsNativeMintResultSchema.safeParse(rawResult);
    const binding = exports.ElevenLabsNativeSessionBindingSchema.safeParse(rawCurrentBinding), time = now.getTime();
    return request.success && result.success && binding.success && Number.isFinite(time)
        && request.data.requestId === result.data.requestId && request.data.transport === result.data.connection.transport
        && (0, shared_js_1.sameValue)(request.data.binding, binding.data) && (0, shared_js_1.sameValue)(result.data.binding, binding.data)
        && Date.parse(result.data.issuedAt) <= time && Date.parse(result.data.expiresAt) > time;
}
exports.ElevenLabsNativeConversationBindingSchema = zod_1.z.object({
    binding: exports.ElevenLabsNativeSessionBindingSchema, providerConversationId: shared_js_1.Text128, attachedAt: shared_js_1.Instant,
}).strict().refine(x => Date.parse(x.attachedAt) >= Date.parse(x.binding.boundAt), 'Conversation follows admission');
exports.ElevenLabsNativeExecutionAttachmentSchema = zod_1.z.object({
    conversation: exports.ElevenLabsNativeConversationBindingSchema, snapshot: execution_js_1.CoachSessionExecutionSnapshotSchema, attachedAt: shared_js_1.Instant,
}).strict().refine(x => (0, execution_js_1.isCoachExecutionSnapshotForOpening)(x.snapshot, x.conversation.binding.opening)
    && Date.parse(x.attachedAt) >= Date.parse(x.conversation.attachedAt) && Date.parse(x.attachedAt) >= Date.parse(x.snapshot.startedAt), 'Attach original execution once');
function sameElevenLabsNativeConversation(rawA, rawB) {
    const a = exports.ElevenLabsNativeConversationBindingSchema.safeParse(rawA), b = exports.ElevenLabsNativeConversationBindingSchema.safeParse(rawB);
    return a.success && b.success && (0, shared_js_1.sameValue)(a.data, b.data) && (0, index_js_1.sameElevenLabsMapping)(a.data.binding.mapping, b.data.binding.mapping);
}
exports.ElevenLabsNativeCallbackIdentitySchema = zod_1.z.object({
    eventId: shared_js_1.RefId, providerConversationId: shared_js_1.Text128, providerAgentId: index_js_1.ElevenLabsAgentMappingSchema.shape.providerAgentId,
    occurredAt: shared_js_1.Instant, bodySha256: exports.ElevenLabsPromptBundleHashSchema,
}).strict();
exports.ElevenLabsNativeCallbackReceiptSchema = zod_1.z.object({
    callback: exports.ElevenLabsNativeCallbackIdentitySchema, binding: exports.ElevenLabsNativeConversationBindingSchema,
    receivedAt: shared_js_1.Instant, inboxStatus: zod_1.z.enum(['accepted', 'duplicate']), effectStatus: zod_1.z.enum(['pending', 'applied', 'rejected']),
}).strict().refine(x => x.callback.providerConversationId === x.binding.providerConversationId
    && x.callback.providerAgentId === x.binding.binding.mapping.providerAgentId
    && Date.parse(x.callback.occurredAt) >= Date.parse(x.binding.attachedAt) && Date.parse(x.receivedAt) >= Date.parse(x.callback.occurredAt), 'Inbox receipt does not itself mean an applied effect');
function isElevenLabsNativeCallbackCurrent(raw, rawBinding, now, maxSkewSeconds = 300) {
    const receipt = exports.ElevenLabsNativeCallbackReceiptSchema.safeParse(raw), binding = exports.ElevenLabsNativeConversationBindingSchema.safeParse(rawBinding), time = now.getTime();
    return receipt.success && binding.success && Number.isFinite(time) && Number.isInteger(maxSkewSeconds) && maxSkewSeconds > 0 && maxSkewSeconds <= 300
        && sameElevenLabsNativeConversation(receipt.data.binding, binding.data) && Date.parse(receipt.data.receivedAt) <= time
        && Math.abs(time - Date.parse(receipt.data.callback.occurredAt)) <= maxSkewSeconds * 1000;
}
/** Identity and bundle correlation only; this descriptor grants no corpus or document access. */
exports.ElevenLabsNativeKnowledgeBindingSchema = zod_1.z.object({
    attemptId: shared_js_1.RefId, opening: execution_js_1.CoachSessionOpeningRefSchema, agentIdentity: agent_context_identity_js_1.AgentContextIdentitySchema,
    configVersion: agent_config_js_1.AgentConfigVersionSchema, promptBundleHash: exports.ElevenLabsPromptBundleHashSchema,
}).strict().refine(x => (0, capability_call_context_js_1.sameCapabilityScope)((0, shared_js_1.agentScope)(x.opening.scope), x.agentIdentity)
    && x.configVersion === x.opening.appliedConfigVersion, 'Knowledge context retains declared authority and applied bundle');
//# sourceMappingURL=native-session.js.map