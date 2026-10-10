"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nativeBrowserPolicyChangeContract = exports.nativeBrowserPolicyReadContract = exports.NativeBrowserPolicyChangeSchema = exports.NativeBrowserPolicyParamsSchema = exports.nativeReadbackContract = exports.nativeApplyContract = exports.nativePromptBundleContract = exports.ElevenLabsNativePromptBundleResultSchema = exports.ElevenLabsNativePromptBundleRequestSchema = exports.nativeCallbackContract = exports.ELEVENLABS_NATIVE_SIGNATURE_HEADER = exports.nativePauseContract = exports.nativeExecutionAttachContract = exports.nativeConversationBindContract = exports.nativeMintContract = exports.nativeOpeningContract = exports.nativeAuthorityRecheckContract = exports.nativeAuthorityResolveContract = exports.nativeBrowserAdmissionContract = exports.ElevenLabsNativeBrowserAdmissionResultSchema = exports.ElevenLabsNativeBrowserAdmissionRequestSchema = void 0;
exports.capElevenLabsNativePath = capElevenLabsNativePath;
exports.capElevenLabsNativeAuthorityPath = capElevenLabsNativeAuthorityPath;
exports.isElevenLabsNativePromptBundleForRequest = isElevenLabsNativePromptBundleForRequest;
exports.nativeBrowserPolicyPath = nativeBrowserPolicyPath;
const zod_1 = require("zod");
const internal_capability_agent_js_1 = require("./internal-capability-agent.cjs");
const shared_js_1 = require("../../capability/coach/shared.cjs");
const execution_js_1 = require("../../capability/coach/execution.cjs");
const program_version_js_1 = require("../../capability/coach/program-version.cjs");
const native_session_js_1 = require("../../capability/agent-elevenlabs/native-session.cjs");
const capability_call_context_js_1 = require("../../capability/capability-call-context.cjs");
const agent_config_js_1 = require("../../capability/ricerca/agent-config.cjs");
const native_config_js_1 = require("../../capability/agent-elevenlabs/native-config.cjs");
const native_readback_js_1 = require("../../capability/agent-elevenlabs/native-readback.cjs");
const native_session_js_2 = require("../../capability/agent-elevenlabs/native-session.cjs");
const web_channel_js_1 = require("../../capability/agent-elevenlabs/web-channel.cjs");
const index_js_1 = require("../../auth/index.cjs");
exports.ElevenLabsNativeBrowserAdmissionRequestSchema = zod_1.z.object({ requestId: shared_js_1.RefId, linkId: shared_js_1.RefId, program: program_version_js_1.CoachProgramVersionRefSchema }).strict();
/** Public facade excludes user identity, policy, mapping and connection credentials. */
exports.ElevenLabsNativeBrowserAdmissionResultSchema = zod_1.z.object({ ok: zod_1.z.literal(true), attemptId: shared_js_1.RefId, expiresAt: shared_js_1.Instant }).strict();
exports.nativeBrowserAdmissionContract = { method: 'POST', path: '/api/native/admissions', authType: 'forge_session',
    bodySchema: exports.ElevenLabsNativeBrowserAdmissionRequestSchema, responseSchema: exports.ElevenLabsNativeBrowserAdmissionResultSchema };
const internal = { method: 'POST', authType: 'secret', authHeader: index_js_1.INTERNAL_SECRET_HEADER, paramsSchema: internal_capability_agent_js_1.CapabilityAgentParamsSchema };
const prefix = '/internal/capability/agents/:agentId/elevenlabs/native';
exports.nativeAuthorityResolveContract = { ...internal, path: prefix + '/authority/resolve', bodySchema: native_session_js_1.ElevenLabsNativeAuthorityRequestSchema, responseSchema: native_session_js_1.ElevenLabsNativeAuthorityResultSchema };
exports.nativeAuthorityRecheckContract = { ...internal, path: prefix + '/authority/recheck', bodySchema: native_session_js_1.ElevenLabsNativeAuthorityRequestSchema, responseSchema: native_session_js_1.ElevenLabsNativeAuthorityResultSchema };
exports.nativeOpeningContract = { ...internal, path: prefix + '/opening', bodySchema: zod_1.z.object({ requestId: shared_js_1.RefId, attempt: native_session_js_1.ElevenLabsNativeAdmissionAttemptSchema }).strict(), responseSchema: native_session_js_1.ElevenLabsNativeSessionBindingSchema };
exports.nativeMintContract = { ...internal, path: prefix + '/mint', bodySchema: native_session_js_1.ElevenLabsNativeMintRequestSchema, responseSchema: native_session_js_1.ElevenLabsNativeMintResultSchema };
exports.nativeConversationBindContract = { ...internal, path: prefix + '/conversation', bodySchema: native_session_js_1.ElevenLabsNativeConversationBindingSchema, responseSchema: native_session_js_1.ElevenLabsNativeConversationBindingSchema };
exports.nativeExecutionAttachContract = { ...internal, path: prefix + '/execution', bodySchema: native_session_js_1.ElevenLabsNativeExecutionAttachmentSchema, responseSchema: native_session_js_1.ElevenLabsNativeExecutionAttachmentSchema };
exports.nativePauseContract = { ...internal, path: prefix + '/pause', bodySchema: zod_1.z.object({ requestId: shared_js_1.RefId, binding: native_session_js_1.ElevenLabsNativeSessionBindingSchema }).strict(), responseSchema: zod_1.z.object({ ok: zod_1.z.literal(true), pausedAt: shared_js_1.Instant, opening: execution_js_1.CoachSessionOpeningRefSchema }).strict() };
/** Adapter verifies the original bytes with the per-agent resolver BEFORE parsing; receipt is not effect completion. */
exports.ELEVENLABS_NATIVE_SIGNATURE_HEADER = 'ElevenLabs-Signature';
exports.nativeCallbackContract = { method: 'POST', path: prefix + '/callback', authType: 'external_provider',
    authHeader: exports.ELEVENLABS_NATIVE_SIGNATURE_HEADER, rawBodyRequired: true, signatureAlgorithm: 'hmac-sha256', maxSkewSeconds: 300,
    paramsSchema: internal_capability_agent_js_1.CapabilityAgentParamsSchema, responseSchema: native_session_js_1.ElevenLabsNativeCallbackReceiptSchema };
function capElevenLabsNativePath(agentId) { return prefix.replace(':agentId', encodeURIComponent(internal_capability_agent_js_1.CapabilityAgentParamsSchema.parse({ agentId }).agentId)); }
function capElevenLabsNativeAuthorityPath(agentId, phase) { return capElevenLabsNativePath(agentId) + '/authority/' + zod_1.z.enum(['resolve', 'recheck']).parse(phase); }
exports.ElevenLabsNativePromptBundleRequestSchema = zod_1.z.object({ scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
    configVersion: agent_config_js_1.AgentConfigVersionSchema, promptBundleHash: native_session_js_2.ElevenLabsPromptBundleHashSchema }).strict();
/** Internal resolved bundle only. No browser route returns private rendered content. */
exports.ElevenLabsNativePromptBundleResultSchema = exports.ElevenLabsNativePromptBundleRequestSchema.extend({
    ok: zod_1.z.literal(true), renderedPrompt: zod_1.z.string().min(1).max(262144),
}).strict();
function isElevenLabsNativePromptBundleForRequest(rawRequest, rawResult) {
    const r = exports.ElevenLabsNativePromptBundleRequestSchema.safeParse(rawRequest), s = exports.ElevenLabsNativePromptBundleResultSchema.safeParse(rawResult);
    return r.success && s.success && (0, capability_call_context_js_1.sameCapabilityScope)(r.data.scope, s.data.scope)
        && r.data.configVersion === s.data.configVersion && r.data.promptBundleHash === s.data.promptBundleHash;
}
exports.nativePromptBundleContract = { ...internal, path: prefix + '/prompt-bundle', bodySchema: exports.ElevenLabsNativePromptBundleRequestSchema, responseSchema: exports.ElevenLabsNativePromptBundleResultSchema };
exports.nativeApplyContract = { ...internal, path: prefix + '/apply', bodySchema: zod_1.z.object({ requestId: shared_js_1.RefId,
        expectedConfigVersion: agent_config_js_1.AgentConfigVersionSchema.nullable(), desired: native_config_js_1.ElevenLabsNativeDesiredConfigSchema }).strict(), responseSchema: native_config_js_1.ElevenLabsNativeCommandReceiptSchema };
exports.nativeReadbackContract = { ...internal, path: prefix + '/readback', bodySchema: zod_1.z.object({ requestId: shared_js_1.RefId, binding: native_session_js_1.ElevenLabsNativeSessionBindingSchema }).strict(), responseSchema: native_readback_js_1.ElevenLabsNativeConfigReadbackSchema };
exports.NativeBrowserPolicyParamsSchema = zod_1.z.object({ slug: zod_1.z.string().min(1).max(128).regex(/^[A-Za-z0-9_-]+$/) }).strict();
exports.NativeBrowserPolicyChangeSchema = web_channel_js_1.ElevenLabsWebPolicyChangeSchema.omit({ scope: true }).extend({ enabled: zod_1.z.boolean().optional() }).strict();
exports.nativeBrowserPolicyReadContract = { method: 'GET', path: '/api/agents/:slug/native/web-policy', authType: 'forge_session',
    paramsSchema: exports.NativeBrowserPolicyParamsSchema, responseSchema: web_channel_js_1.ElevenLabsWebPolicySchema };
exports.nativeBrowserPolicyChangeContract = { method: 'PUT', path: '/api/agents/:slug/native/web-policy', authType: 'forge_session',
    paramsSchema: exports.NativeBrowserPolicyParamsSchema, bodySchema: exports.NativeBrowserPolicyChangeSchema, responseSchema: web_channel_js_1.ElevenLabsWebPolicyResultSchema };
function nativeBrowserPolicyPath(managementAgentId) { return exports.nativeBrowserPolicyReadContract.path.replace(':slug', encodeURIComponent(exports.NativeBrowserPolicyParamsSchema.parse({ slug: managementAgentId }).slug)); }
//# sourceMappingURL=native-channel.js.map