import { z } from 'zod';
import { CapabilityAgentParamsSchema } from "./internal-capability-agent.js";
import { RefId, Instant } from "../../capability/coach/shared.js";
import { CoachSessionOpeningRefSchema } from "../../capability/coach/execution.js";
import { CoachProgramVersionRefSchema } from "../../capability/coach/program-version.js";
import { ElevenLabsNativeAdmissionAttemptSchema, ElevenLabsNativeAuthorityRequestSchema, ElevenLabsNativeAuthorityResultSchema, ElevenLabsNativeSessionBindingSchema, ElevenLabsNativeMintRequestSchema, ElevenLabsNativeMintResultSchema, ElevenLabsNativeConversationBindingSchema, ElevenLabsNativeExecutionAttachmentSchema, ElevenLabsNativeCallbackReceiptSchema } from "../../capability/agent-elevenlabs/native-session.js";
import { CapabilityAgentScopeSchema, sameCapabilityScope } from "../../capability/capability-call-context.js";
import { AgentConfigVersionSchema } from "../../capability/ricerca/agent-config.js";
import { ElevenLabsNativeDesiredConfigSchema, ElevenLabsNativeCommandReceiptSchema } from "../../capability/agent-elevenlabs/native-config.js";
import { ElevenLabsNativeConfigReadbackSchema } from "../../capability/agent-elevenlabs/native-readback.js";
import { ElevenLabsPromptBundleHashSchema } from "../../capability/agent-elevenlabs/native-session.js";
import { ElevenLabsWebPolicySchema, ElevenLabsWebPolicyChangeSchema, ElevenLabsWebPolicyResultSchema } from "../../capability/agent-elevenlabs/web-channel.js";
import { INTERNAL_SECRET_HEADER } from "../../auth/index.js";
export const ElevenLabsNativeBrowserAdmissionRequestSchema = z.object({ requestId: RefId, linkId: RefId, program: CoachProgramVersionRefSchema }).strict();
/** Public facade excludes user identity, policy, mapping and connection credentials. */
export const ElevenLabsNativeBrowserAdmissionResultSchema = z.object({ ok: z.literal(true), attemptId: RefId, expiresAt: Instant }).strict();
export const nativeBrowserAdmissionContract = { method: 'POST', path: '/api/native/admissions', authType: 'forge_session',
    bodySchema: ElevenLabsNativeBrowserAdmissionRequestSchema, responseSchema: ElevenLabsNativeBrowserAdmissionResultSchema };
const internal = { method: 'POST', authType: 'secret', authHeader: INTERNAL_SECRET_HEADER, paramsSchema: CapabilityAgentParamsSchema };
const prefix = '/internal/capability/agents/:agentId/elevenlabs/native';
export const nativeAuthorityResolveContract = { ...internal, path: prefix + '/authority/resolve', bodySchema: ElevenLabsNativeAuthorityRequestSchema, responseSchema: ElevenLabsNativeAuthorityResultSchema };
export const nativeAuthorityRecheckContract = { ...internal, path: prefix + '/authority/recheck', bodySchema: ElevenLabsNativeAuthorityRequestSchema, responseSchema: ElevenLabsNativeAuthorityResultSchema };
export const nativeOpeningContract = { ...internal, path: prefix + '/opening', bodySchema: z.object({ requestId: RefId, attempt: ElevenLabsNativeAdmissionAttemptSchema }).strict(), responseSchema: ElevenLabsNativeSessionBindingSchema };
export const nativeMintContract = { ...internal, path: prefix + '/mint', bodySchema: ElevenLabsNativeMintRequestSchema, responseSchema: ElevenLabsNativeMintResultSchema };
export const nativeConversationBindContract = { ...internal, path: prefix + '/conversation', bodySchema: ElevenLabsNativeConversationBindingSchema, responseSchema: ElevenLabsNativeConversationBindingSchema };
export const nativeExecutionAttachContract = { ...internal, path: prefix + '/execution', bodySchema: ElevenLabsNativeExecutionAttachmentSchema, responseSchema: ElevenLabsNativeExecutionAttachmentSchema };
export const nativePauseContract = { ...internal, path: prefix + '/pause', bodySchema: z.object({ requestId: RefId, binding: ElevenLabsNativeSessionBindingSchema }).strict(), responseSchema: z.object({ ok: z.literal(true), pausedAt: Instant, opening: CoachSessionOpeningRefSchema }).strict() };
/** Adapter verifies the original bytes with the per-agent resolver BEFORE parsing; receipt is not effect completion. */
export const ELEVENLABS_NATIVE_SIGNATURE_HEADER = 'ElevenLabs-Signature';
export const nativeCallbackContract = { method: 'POST', path: prefix + '/callback', authType: 'external_provider',
    authHeader: ELEVENLABS_NATIVE_SIGNATURE_HEADER, rawBodyRequired: true, signatureAlgorithm: 'hmac-sha256', maxSkewSeconds: 300,
    paramsSchema: CapabilityAgentParamsSchema, responseSchema: ElevenLabsNativeCallbackReceiptSchema };
export function capElevenLabsNativePath(agentId) { return prefix.replace(':agentId', encodeURIComponent(CapabilityAgentParamsSchema.parse({ agentId }).agentId)); }
export function capElevenLabsNativeAuthorityPath(agentId, phase) { return capElevenLabsNativePath(agentId) + '/authority/' + z.enum(['resolve', 'recheck']).parse(phase); }
export const ElevenLabsNativePromptBundleRequestSchema = z.object({ scope: CapabilityAgentScopeSchema,
    configVersion: AgentConfigVersionSchema, promptBundleHash: ElevenLabsPromptBundleHashSchema }).strict();
/** Internal resolved bundle only. No browser route returns private rendered content. */
export const ElevenLabsNativePromptBundleResultSchema = ElevenLabsNativePromptBundleRequestSchema.extend({
    ok: z.literal(true), renderedPrompt: z.string().min(1).max(262144),
}).strict();
export function isElevenLabsNativePromptBundleForRequest(rawRequest, rawResult) {
    const r = ElevenLabsNativePromptBundleRequestSchema.safeParse(rawRequest), s = ElevenLabsNativePromptBundleResultSchema.safeParse(rawResult);
    return r.success && s.success && sameCapabilityScope(r.data.scope, s.data.scope)
        && r.data.configVersion === s.data.configVersion && r.data.promptBundleHash === s.data.promptBundleHash;
}
export const nativePromptBundleContract = { ...internal, path: prefix + '/prompt-bundle', bodySchema: ElevenLabsNativePromptBundleRequestSchema, responseSchema: ElevenLabsNativePromptBundleResultSchema };
export const nativeApplyContract = { ...internal, path: prefix + '/apply', bodySchema: z.object({ requestId: RefId,
        expectedConfigVersion: AgentConfigVersionSchema.nullable(), desired: ElevenLabsNativeDesiredConfigSchema }).strict(), responseSchema: ElevenLabsNativeCommandReceiptSchema };
export const nativeReadbackContract = { ...internal, path: prefix + '/readback', bodySchema: z.object({ requestId: RefId, binding: ElevenLabsNativeSessionBindingSchema }).strict(), responseSchema: ElevenLabsNativeConfigReadbackSchema };
export const NativeBrowserPolicyParamsSchema = z.object({ slug: z.string().min(1).max(128).regex(/^[A-Za-z0-9_-]+$/) }).strict();
export const NativeBrowserPolicyChangeSchema = ElevenLabsWebPolicyChangeSchema.omit({ scope: true }).extend({ enabled: z.boolean().optional() }).strict();
export const nativeBrowserPolicyReadContract = { method: 'GET', path: '/api/agents/:slug/native/web-policy', authType: 'forge_session',
    paramsSchema: NativeBrowserPolicyParamsSchema, responseSchema: ElevenLabsWebPolicySchema };
export const nativeBrowserPolicyChangeContract = { method: 'PUT', path: '/api/agents/:slug/native/web-policy', authType: 'forge_session',
    paramsSchema: NativeBrowserPolicyParamsSchema, bodySchema: NativeBrowserPolicyChangeSchema, responseSchema: ElevenLabsWebPolicyResultSchema };
export function nativeBrowserPolicyPath(managementAgentId) { return nativeBrowserPolicyReadContract.path.replace(':slug', encodeURIComponent(NativeBrowserPolicyParamsSchema.parse({ slug: managementAgentId }).slug)); }
//# sourceMappingURL=native-channel.js.map