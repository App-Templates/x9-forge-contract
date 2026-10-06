"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElevenLabsProvisionErrorResponseSchema = exports.ElevenLabsProvisionErrorCodeSchema = exports.ElevenLabsProvisionResultSchema = exports.ElevenLabsProvisionOutcomeSchema = exports.ElevenLabsChannelStatusSchema = exports.ElevenLabsAgentMappingSchema = exports.ElevenLabsMappingOriginSchema = exports.ElevenLabsProvisionRequestSchema = exports.ElevenLabsDesiredStateSchema = exports.ElevenLabsAgentConfigSchema = exports.ElevenLabsToolBindingSchema = exports.ElevenLabsToolKindSchema = exports.ElevenLabsProviderAgentIdSchema = exports.ElevenLabsAgentScopeSchema = void 0;
exports.sameElevenLabsMapping = sameElevenLabsMapping;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const agent_config_js_1 = require("../ricerca/agent-config.cjs");
const agent_voice_settings_js_1 = require("../voice/agent-voice-settings.cjs");
const cap_tool_call_js_1 = require("../../http/endpoints/cap-tool-call.cjs");
const agent_management_js_1 = require("../../agent/agent-management.cjs");
const agent_runtime_state_js_1 = require("../../agent/agent-runtime-state.cjs");
/**
 * cap-agent-elevenlabs (R6, v1.31.0) — standard capability that owns an agent's ElevenLabs conversational agent.
 *
 * Forge Apply provisions the provider resource ONCE per agent (idempotent by `requestId`; a timeout or replay
 * reconciles the resource already created instead of creating a second one), keeps the mapping provider resource ↔
 * tenant/owner/agent, and reports the external channel as an `AgentRuntimeChannel`, so the agent's canonical state
 * counts it: stopping agent-core does not make a live provider channel look stopped. An existing resource is adopted
 * only through an explicit mapping (`adoptProviderAgentId`); new agents are never wired to a hard-coded id.
 * Provider credentials travel only through the per-call context (R3), never in these payloads.
 */
/** One provider resource serves one agent: no person in this scope. */
exports.ElevenLabsAgentScopeSchema = capability_call_context_js_1.CapabilityAgentScopeSchema;
exports.ElevenLabsProviderAgentIdSchema = zod_1.z.string().regex(/^[A-Za-z0-9_-]{1,128}$/);
/** webhook: the provider calls the capability's `/call/:tool` · client: handled by the project UI. */
exports.ElevenLabsToolKindSchema = zod_1.z.enum(['webhook', 'client']);
exports.ElevenLabsToolBindingSchema = zod_1.z.object({
    name: cap_tool_call_js_1.CapToolCallParamsSchema.shape.tool,
    kind: exports.ElevenLabsToolKindSchema,
    description: zod_1.z.string().trim().min(1).max(1000),
}).strict();
exports.ElevenLabsAgentConfigSchema = zod_1.z.object({
    displayName: zod_1.z.string().trim().min(1).max(80),
    voiceId: agent_voice_settings_js_1.AgentVoiceIdSchema,
    /** Provider TTS model. */
    model: agent_voice_settings_js_1.AgentVoiceModelSchema,
    /** Conversation LLM selected on the provider side. */
    llm: zod_1.z.string().min(1).max(128),
    language: agent_voice_settings_js_1.AgentVoiceLocaleSchema,
    firstMessage: zod_1.z.string().trim().min(1).max(2000).optional(),
    /** Version of the agent's prompt files rendered by the producer (IDENTITY/SOUL/POLICIES/USER). */
    promptVersion: zod_1.z.string().min(1).max(128),
    tools: zod_1.z.array(exports.ElevenLabsToolBindingSchema).max(64)
        .refine((tools) => new Set(tools.map((tool) => tool.name)).size === tools.length, { message: 'Duplicate tool' }),
}).strict();
exports.ElevenLabsDesiredStateSchema = zod_1.z.enum(['active', 'paused']);
exports.ElevenLabsProvisionRequestSchema = zod_1.z.object({
    requestId: agent_management_js_1.AgentManagementRequestIdSchema,
    scope: exports.ElevenLabsAgentScopeSchema,
    configVersion: agent_config_js_1.AgentConfigVersionSchema,
    config: exports.ElevenLabsAgentConfigSchema,
    desiredState: exports.ElevenLabsDesiredStateSchema,
    /** Adopt an existing provider resource by explicit approved mapping instead of creating one. */
    adoptProviderAgentId: exports.ElevenLabsProviderAgentIdSchema.optional(),
}).strict();
exports.ElevenLabsMappingOriginSchema = zod_1.z.enum(['provisioned', 'adopted']);
exports.ElevenLabsAgentMappingSchema = zod_1.z.object({
    scope: exports.ElevenLabsAgentScopeSchema,
    providerAgentId: exports.ElevenLabsProviderAgentIdSchema,
    origin: exports.ElevenLabsMappingOriginSchema,
    createdAt: zod_1.z.iso.datetime({ offset: true }),
    appliedConfigVersion: agent_config_js_1.AgentConfigVersionSchema,
});
/**
 * Same binding snapshot: full scope (tenant, owner, agent), provider resource, origin, applied version and creation
 * time. A provider id alone never identifies a binding across tenants/owners/agents.
 */
function sameElevenLabsMapping(a, b) {
    return (0, capability_call_context_js_1.sameCapabilityScope)(a.scope, b.scope)
        && a.providerAgentId === b.providerAgentId
        && a.origin === b.origin
        && a.appliedConfigVersion === b.appliedConfigVersion
        && Date.parse(a.createdAt) === Date.parse(b.createdAt);
}
exports.ElevenLabsChannelStatusSchema = zod_1.z.object({
    scope: exports.ElevenLabsAgentScopeSchema,
    /** null: no provider resource yet (not provisioned). */
    mapping: exports.ElevenLabsAgentMappingSchema.nullable(),
    desiredState: exports.ElevenLabsDesiredStateSchema,
    /** The provider channel as canonical runtime evidence (kind voice or web). */
    channel: agent_runtime_state_js_1.AgentRuntimeChannelSchema,
    /** null: the provider was not observed; the channel is then unknown. */
    observedAt: zod_1.z.iso.datetime({ offset: true }).nullable(),
}).superRefine((status, ctx) => {
    if (status.channel.kind !== 'voice' && status.channel.kind !== 'web') {
        ctx.addIssue({ code: 'custom', path: ['channel', 'kind'], message: 'A provider voice channel is voice or web' });
    }
    if (status.mapping === null && status.channel.loaded === true) {
        ctx.addIssue({ code: 'custom', path: ['mapping'], message: 'A loaded channel needs a provider resource' });
    }
    if (status.mapping !== null && !(0, capability_call_context_js_1.sameCapabilityScope)(status.mapping.scope, status.scope)) {
        ctx.addIssue({ code: 'custom', path: ['mapping', 'scope'], message: 'Mapping belongs to another agent' });
    }
    if (status.observedAt === null && status.channel.state !== 'unknown') {
        ctx.addIssue({ code: 'custom', path: ['observedAt'], message: 'An unobserved provider channel is unknown' });
    }
});
exports.ElevenLabsProvisionOutcomeSchema = zod_1.z.enum(['created', 'updated', 'unchanged', 'adopted']);
exports.ElevenLabsProvisionResultSchema = zod_1.z.object({
    ok: zod_1.z.literal(true),
    requestId: agent_management_js_1.AgentManagementRequestIdSchema,
    /** true: this requestId already ran; the existing resource is returned, nothing is created again. */
    replayed: zod_1.z.boolean(),
    outcome: exports.ElevenLabsProvisionOutcomeSchema,
    mapping: exports.ElevenLabsAgentMappingSchema,
    status: exports.ElevenLabsChannelStatusSchema,
}).superRefine((result, ctx) => {
    if (result.outcome === 'created' && result.mapping.origin !== 'provisioned') {
        ctx.addIssue({ code: 'custom', path: ['outcome'], message: 'created means a provisioned resource' });
    }
    if (result.outcome === 'adopted' && result.mapping.origin !== 'adopted') {
        ctx.addIssue({ code: 'custom', path: ['outcome'], message: 'adopted means an adopted resource' });
    }
    if (result.status.mapping === null || !sameElevenLabsMapping(result.status.mapping, result.mapping)) {
        ctx.addIssue({ code: 'custom', path: ['status', 'mapping'], message: 'Status must describe exactly the provisioned binding' });
    }
});
exports.ElevenLabsProvisionErrorCodeSchema = zod_1.z.enum([
    'invalid_request',
    'agent_mismatch',
    'credential_missing',
    'provider_unavailable',
    'provider_rejected',
    'idempotency_conflict',
    'stale_version',
    'adoption_conflict',
    /** A creation may have happened (e.g. timeout): reconciliation must finish before a retry creates anything. */
    'reconcile_pending',
]);
const RETRYABLE = new Set(['provider_unavailable', 'reconcile_pending']);
exports.ElevenLabsProvisionErrorResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(false),
    error: exports.ElevenLabsProvisionErrorCodeSchema,
    /** Same requestId may be retried (only for transient provider failures and pending reconciliation). */
    retryable: zod_1.z.boolean(),
    /** stale_version only. */
    currentVersion: agent_config_js_1.AgentConfigVersionSchema.optional(),
}).superRefine((response, ctx) => {
    if (response.retryable !== RETRYABLE.has(response.error)) {
        ctx.addIssue({ code: 'custom', path: ['retryable'], message: 'Retryability is fixed by the error code' });
    }
    if ((response.error === 'stale_version') !== (response.currentVersion !== undefined)) {
        ctx.addIssue({ code: 'custom', path: ['currentVersion'], message: 'currentVersion is present exactly for stale_version' });
    }
});
//# sourceMappingURL=index.js.map