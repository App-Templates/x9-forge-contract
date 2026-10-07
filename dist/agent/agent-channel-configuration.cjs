"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentContextWithChannelsWriteSchema = exports.AgentContextWithChannelsSchema = exports.AgentChannelConfigurationSchema = exports.AgentChannelVersionedStateSchema = exports.AgentOwnedChannelResourceSchema = exports.AgentChannelFailureSchema = exports.AgentChannelFailureCodeSchema = exports.AgentChannelDesiredStateSchema = exports.AgentBirthChannelKindSchema = void 0;
exports.channelFailure = channelFailure;
exports.isChannelConfigurationApplied = isChannelConfigurationApplied;
exports.managementAgentIdOf = managementAgentIdOf;
exports.vaultAgentIdOf = vaultAgentIdOf;
exports.appliedAgentVoiceSettings = appliedAgentVoiceSettings;
exports.appliedAgentScopePolicy = appliedAgentScopePolicy;
exports.shouldLoadAgentChannel = shouldLoadAgentChannel;
const zod_1 = require("zod");
const channel_type_js_1 = require("../messaging/channel-type.cjs");
const agent_telegram_bot_js_1 = require("../messaging/agent-telegram-bot.cjs");
const agent_email_inbox_js_1 = require("../messaging/agent-email-inbox.cjs");
const capability_call_context_js_1 = require("../capability/capability-call-context.cjs");
const agent_config_js_1 = require("../capability/ricerca/agent-config.cjs");
const agent_runtime_identity_js_1 = require("./agent-runtime-identity.cjs");
const agent_runtime_state_js_1 = require("./agent-runtime-state.cjs");
const agent_context_file_js_1 = require("./agent-context-file.cjs");
const agent_voice_settings_js_1 = require("../capability/voice/agent-voice-settings.cjs");
const agent_scope_policy_js_1 = require("./agent-scope-policy.cjs");
/** R2: pausing admission preserves the agent's resource and credentials in their existing stores. */
exports.AgentBirthChannelKindSchema = channel_type_js_1.ChannelTypeSchema.extract(['telegram', 'email']);
exports.AgentChannelDesiredStateSchema = zod_1.z.enum(['active', 'paused']);
/** Fixed codes only: provider messages, tokens, stack traces and arbitrary detail never cross this boundary. */
exports.AgentChannelFailureCodeSchema = zod_1.z.enum([
    'resource_missing', 'resource_conflict', 'provider_unavailable', 'provider_rejected', 'account_blocked',
    'load_failed', 'apply_failed', 'source_unavailable', 'reconcile_pending', 'first_check_failed',
]);
const RETRYABLE = new Set(['provider_unavailable', 'source_unavailable', 'reconcile_pending']);
exports.AgentChannelFailureSchema = zod_1.z.object({ code: exports.AgentChannelFailureCodeSchema, retryable: zod_1.z.boolean() }).strict()
    .refine((failure) => failure.retryable === RETRYABLE.has(failure.code), { message: 'Retryability is fixed by the failure code' });
function channelFailure(code) {
    const parsed = exports.AgentChannelFailureCodeSchema.safeParse(code);
    const safe = parsed.success ? parsed.data : 'apply_failed';
    return { code: safe, retryable: RETRYABLE.has(safe) };
}
const ownership = { scope: capability_call_context_js_1.CapabilityAgentScopeSchema, identity: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema };
/** Metadata only; even the legacy free-form token reference is deliberately omitted. Resolve credentials via R3. */
exports.AgentOwnedChannelResourceSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.object({ ...ownership, kind: channel_type_js_1.ChannelTypeSchema.extract(['telegram']),
        resource: agent_telegram_bot_js_1.AgentTelegramBotSchema.pick({ agent_id: true, bot_username: true, created_at: true }).strict() }).strict(),
    zod_1.z.object({ ...ownership, kind: channel_type_js_1.ChannelTypeSchema.extract(['email']), resource: agent_email_inbox_js_1.AgentEmailInboxSchema.strict() }).strict(),
]).superRefine((owned, ctx) => {
    if (owned.resource.agent_id !== owned.scope.agentId) {
        ctx.addIssue({ code: 'custom', path: ['resource', 'agent_id'], message: 'Resource belongs to another agent' });
    }
    if (owned.identity.runtimeAgentId !== owned.scope.agentId) {
        ctx.addIssue({ code: 'custom', path: ['identity'], message: 'Runtime identity must match resource scope' });
    }
});
exports.AgentChannelVersionedStateSchema = zod_1.z.object({ version: agent_config_js_1.AgentConfigVersionSchema, state: exports.AgentChannelDesiredStateSchema }).strict();
exports.AgentChannelConfigurationSchema = zod_1.z.object({
    ...ownership, kind: exports.AgentBirthChannelKindSchema,
    desired: exports.AgentChannelVersionedStateSchema,
    /** null means never applied, not an inferred pause. An older active version may still be running. */
    applied: exports.AgentChannelVersionedStateSchema.nullable(),
    resource: exports.AgentOwnedChannelResourceSchema.nullable(),
    observation: agent_runtime_state_js_1.AgentRuntimeChannelSchema.nullable(),
    observedAt: zod_1.z.iso.datetime({ offset: true }).nullable(),
    error: exports.AgentChannelFailureSchema.nullable(),
}).strict().superRefine((config, ctx) => {
    const issue = (path, message) => ctx.addIssue({ code: 'custom', path: [path], message });
    if (config.identity.runtimeAgentId !== config.scope.agentId)
        issue('identity', 'Runtime identity must match configuration scope');
    if (config.resource && (!(0, capability_call_context_js_1.sameCapabilityScope)(config.resource.scope, config.scope)
        || config.resource.identity.managementAgentId !== config.identity.managementAgentId))
        issue('resource', 'Resource belongs to another scope or identity');
    if (config.resource && config.resource.kind !== config.kind)
        issue('resource', 'Resource belongs to another channel kind');
    if (config.applied && config.applied.version > config.desired.version)
        issue('applied', 'Applied version cannot be ahead of desired');
    if (config.applied && config.applied.version === config.desired.version && config.applied.state !== config.desired.state)
        issue('applied', 'One version cannot describe two states');
    if (config.applied?.state === 'active' && config.resource === null)
        issue('resource', 'An active application needs its own resource');
    if ((config.observation === null) !== (config.observedAt === null))
        issue('observedAt', 'Observation and time exist together');
    if (config.observation && config.observation.kind !== config.kind)
        issue('observation', 'Observation belongs to another channel kind');
    if (config.observation && config.applied === null)
        issue('applied', 'Observed configuration needs an applied version');
    if (config.observation?.state === 'loaded' && config.applied?.state !== 'active')
        issue('observation', 'A paused application cannot be loaded');
    if (config.observation?.state === 'paused' && config.applied?.state !== 'paused')
        issue('observation', 'A pause must have been applied');
});
/** Application requires matching versions/state and dated runtime evidence, not just a saved intention. */
function isChannelConfigurationApplied(raw) {
    const parsed = exports.AgentChannelConfigurationSchema.safeParse(raw);
    if (!parsed.success)
        return false;
    const config = parsed.data;
    return config.error === null && config.applied?.version === config.desired.version
        && config.observation?.state === (config.desired.state === 'active' ? 'loaded' : 'paused');
}
const ConfigurationsSchema = zod_1.z.array(exports.AgentChannelConfigurationSchema).length(2).refine((configs) => new Set(configs.map((config) => config.kind)).size === configs.length, { message: 'One configuration for each birth channel' });
function checkContextScope(context, ctx) {
    for (const [index, config] of (context.channelConfigurations ?? []).entries()) {
        if (config.scope.agentId !== context.agentId || config.scope.ownerId !== context.ownerId || config.scope.tenantId !== context.tenantId) {
            ctx.addIssue({ code: 'custom', path: ['channelConfigurations', index, 'scope'], message: 'Channel configuration belongs to another context scope' });
        }
    }
    if (context.identity && context.identity.runtimeAgentId !== context.agentId) {
        ctx.addIssue({ code: 'custom', path: ['identity', 'runtimeAgentId'], message: 'Identity belongs to another runtime' });
    }
    const channelIds = new Set((context.channelConfigurations ?? []).map(config => config.identity.managementAgentId));
    if (channelIds.size > 1) {
        ctx.addIssue({ code: 'custom', path: ['channelConfigurations'], message: 'Channel management identities disagree' });
    }
    for (const [index, config] of (context.channelConfigurations ?? []).entries()) {
        if (context.identity && config.identity.managementAgentId !== context.identity.managementAgentId) {
            ctx.addIssue({ code: 'custom', path: ['channelConfigurations', index, 'identity'], message: 'Channel identity belongs to another management agent' });
        }
    }
    const managementAgentId = managementAgentIdOf(context);
    // Legacy 1.34 contexts remain readable; the helper never invents an identity for them.
    if (context.voiceConfiguration && context.voiceConfiguration.agentId !== (managementAgentId ?? context.agentId)) {
        ctx.addIssue({ code: 'custom', path: ['voiceConfiguration', 'agentId'], message: 'Voice configuration belongs to another management identity' });
    }
}
/** Additive context field. Absent is legacy; present is complete, validated and scoped with no tenant default. */
exports.AgentContextWithChannelsSchema = agent_context_file_js_1.AgentContextFileSchema.safeExtend({ identity: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.optional(), channelConfigurations: ConfigurationsSchema.optional(), voiceConfiguration: agent_voice_settings_js_1.AgentVoiceConfigSchema.optional(), scopePolicy: agent_scope_policy_js_1.AgentScopePolicySchema.optional() }).superRefine(checkContextScope);
exports.AgentContextWithChannelsWriteSchema = agent_context_file_js_1.AgentContextFileWriteSchema.safeExtend({ identity: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.optional(), channelConfigurations: ConfigurationsSchema.optional(), voiceConfiguration: agent_voice_settings_js_1.AgentVoiceConfigSchema.optional(), scopePolicy: agent_scope_policy_js_1.AgentScopePolicySchema.optional() }).superRefine(checkContextScope);
/** Management ID of a validated context, from its explicit pair or concordant channels. Never guesses from runtime/voice. */
function managementAgentIdOf(context) {
    if (context.identity)
        return context.identity.managementAgentId;
    const ids = new Set((context.channelConfigurations ?? []).map(config => config.identity.managementAgentId));
    if (ids.size !== 1)
        return null;
    return context.channelConfigurations?.[0]?.identity.managementAgentId ?? null;
}
/** Vault key of a validated context. Only Forge's explicit root identity is authoritative; no slug/channel fallback. */
function vaultAgentIdOf(context) {
    return context.identity?.vaultAgentId ?? null;
}
/** Applied voice of a validated context; absent or never applied is null, never the desired settings. */
function appliedAgentVoiceSettings(ctx) {
    return ctx.voiceConfiguration?.applied ?? null;
}
/** Applied policy of a validated context; absence is unconfigured, never an invented default. */
function appliedAgentScopePolicy(ctx) {
    return ctx.scopePolicy ?? null;
}
/** Admission only, not readiness: the producer still resolves this agent's credentials and attests the load. */
function shouldLoadAgentChannel(rawContext, kind) {
    const parsed = exports.AgentContextWithChannelsSchema.safeParse(rawContext);
    if (!parsed.success)
        return false;
    if (parsed.data.channelConfigurations === undefined)
        return true;
    const config = parsed.data.channelConfigurations.find((entry) => entry.kind === kind);
    return config?.desired.state === 'active' && config.resource !== null;
}
//# sourceMappingURL=agent-channel-configuration.js.map