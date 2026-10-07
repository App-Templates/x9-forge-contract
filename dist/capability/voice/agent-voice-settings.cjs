"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboundCallerIdentitySchema = exports.AgentVoiceErrorCodeSchema = exports.VoiceProviderCatalogSchema = exports.VoiceProviderCatalogEntrySchema = exports.AgentVoiceConfigSchema = exports.AgentVoiceSettingsSchema = exports.AgentVoiceLocaleSchema = exports.AgentVoiceModelSchema = exports.AgentVoiceIdSchema = exports.AgentVoiceTransportSchema = exports.AgentVoiceProtocolSchema = exports.AgentVoiceProviderIdSchema = exports.KNOWN_AGENT_VOICE_PROVIDERS = void 0;
exports.validateAgentVoiceSettings = validateAgentVoiceSettings;
exports.outboundCallerIdentityFor = outboundCallerIdentityFor;
const zod_1 = require("zod");
const provider_js_1 = require("./provider.cjs");
const index_js_1 = require("../voice-live/index.cjs");
const parameters_js_1 = require("../parameters.cjs");
const agent_config_js_1 = require("../ricerca/agent-config.cjs");
const agent_identity_js_1 = require("../../agent/agent-identity.cjs");
const agent_runtime_identity_js_1 = require("../../agent/agent-runtime-identity.cjs");
const agent_management_js_1 = require("../../agent/agent-management.cjs");
/**
 * Per-agent voice (R4, v1.31.0), governed by cap-voice and edited in Forge with Save → Apply.
 *
 * An agent is either text-only or has a voice: provider, protocol, transports, provider voice id and model. The
 * provider id is OPEN (`future_voice` parses) so a new provider needs no breaking change; what is actually
 * supported — protocols, transports, models, voices — is the producer's versioned catalog, never a list invented
 * here. `validateAgentVoiceSettings` checks settings against that catalog.
 *
 * All agents call from the single outbound Telnyx number; each call carries the calling agent's identity
 * (`OutboundCallerIdentitySchema`) so it introduces itself and speaks with its own name, persona and voice.
 */
/** Provider ids known in this version; the settings schema also accepts future ids. */
exports.KNOWN_AGENT_VOICE_PROVIDERS = provider_js_1.VoiceProviderSchema.options;
exports.AgentVoiceProviderIdSchema = zod_1.z.string().regex(/^[a-z][a-z0-9_]{1,63}$/);
exports.AgentVoiceProtocolSchema = zod_1.z.enum(['websocket', 'webrtc', 'sip']);
/** phone: calls over the outbound Telnyx number · web: browser/app sessions. */
exports.AgentVoiceTransportSchema = zod_1.z.enum(['phone', 'web']);
/** Provider voice id: a menu value for GPT voices, the voice id for ElevenLabs. */
exports.AgentVoiceIdSchema = zod_1.z.string().min(1).max(128);
exports.AgentVoiceModelSchema = zod_1.z.string().min(1).max(128);
/** BCP-47 language tag, e.g. it or it-IT. */
exports.AgentVoiceLocaleSchema = zod_1.z.string().regex(/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/);
const TransportsSchema = zod_1.z.array(exports.AgentVoiceTransportSchema).min(1).max(2)
    .refine((transports) => new Set(transports).size === transports.length, { message: 'Duplicate transport' });
exports.AgentVoiceSettingsSchema = zod_1.z.discriminatedUnion('mode', [
    zod_1.z.object({ mode: zod_1.z.literal('text-only') }).strict(),
    zod_1.z.object({
        mode: zod_1.z.literal('voice'),
        provider: exports.AgentVoiceProviderIdSchema,
        protocol: exports.AgentVoiceProtocolSchema,
        transports: TransportsSchema,
        voiceId: exports.AgentVoiceIdSchema,
        model: exports.AgentVoiceModelSchema,
        /** BCP-47 language of the voice, e.g. it-IT. */
        locale: exports.AgentVoiceLocaleSchema.optional(),
        /** Provider parameters (e.g. stability, speed); never credentials. */
        params: zod_1.z.record(parameters_js_1.CapabilityParameterKeySchema, parameters_js_1.CapabilityParameterValueSchema).optional(),
    }).strict(),
]);
/** Saved (desired) and applied voice settings of one agent, with their configuration versions. */
exports.AgentVoiceConfigSchema = zod_1.z.object({
    /** Management (Forge) agent id. */
    agentId: agent_identity_js_1.AgentIdSchema,
    versions: agent_management_js_1.AgentConfigVersionStateSchema,
    desired: exports.AgentVoiceSettingsSchema,
    applied: exports.AgentVoiceSettingsSchema.nullable(),
}).superRefine((config, ctx) => {
    if ((config.applied === null) !== (config.versions.applied === null)) {
        ctx.addIssue({ code: 'custom', path: ['applied'], message: 'Applied settings exist exactly when a version was applied' });
    }
});
const LabelSchema = zod_1.z.string().trim().min(1).max(120);
const PatternSchema = zod_1.z.string().min(1).max(200).refine((pattern) => {
    try {
        new RegExp(pattern);
        return true;
    }
    catch {
        return false;
    }
}, { message: 'invalid regular expression' });
exports.VoiceProviderCatalogEntrySchema = zod_1.z.object({
    provider: exports.AgentVoiceProviderIdSchema,
    label: LabelSchema,
    protocols: zod_1.z.array(exports.AgentVoiceProtocolSchema).min(1),
    transports: zod_1.z.array(exports.AgentVoiceTransportSchema).min(1),
    models: zod_1.z.array(zod_1.z.object({ id: exports.AgentVoiceModelSchema, label: LabelSchema })).min(1),
    voices: zod_1.z.discriminatedUnion('kind', [
        /** Closed list (e.g. GPT stock voices): Forge shows a menu. */
        zod_1.z.object({ kind: zod_1.z.literal('menu'), options: zod_1.z.array(zod_1.z.object({ id: exports.AgentVoiceIdSchema, label: LabelSchema })).min(1) }),
        /** Free provider voice id (e.g. ElevenLabs): Forge shows a field validated by `pattern`. */
        zod_1.z.object({ kind: zod_1.z.literal('id'), pattern: PatternSchema }),
    ]),
});
/** Published by the voice producer (cap-voice); `version` changes whenever a supported choice changes. */
exports.VoiceProviderCatalogSchema = zod_1.z.object({
    version: zod_1.z.string().min(1).max(64),
    providers: zod_1.z.array(exports.VoiceProviderCatalogEntrySchema),
}).superRefine((catalog, ctx) => {
    const seen = new Set();
    for (const [index, entry] of catalog.providers.entries()) {
        if (seen.has(entry.provider))
            ctx.addIssue({ code: 'custom', path: ['providers', index, 'provider'], message: 'Duplicate provider' });
        seen.add(entry.provider);
    }
});
exports.AgentVoiceErrorCodeSchema = zod_1.z.enum([
    'voice_not_applied',
    'voice_disabled',
    'phone_not_enabled',
    'provider_unsupported',
    'protocol_unsupported',
    'transport_unsupported',
    'model_unsupported',
    'voice_unknown',
]);
/** Choices of `settings` the catalog does not support (empty: valid). Text-only is always valid. */
function validateAgentVoiceSettings(settings, catalog) {
    if (settings.mode === 'text-only')
        return [];
    const entry = catalog.providers.find((candidate) => candidate.provider === settings.provider);
    if (!entry)
        return ['provider_unsupported'];
    const issues = [];
    if (!entry.protocols.includes(settings.protocol))
        issues.push('protocol_unsupported');
    if (settings.transports.some((transport) => !entry.transports.includes(transport)))
        issues.push('transport_unsupported');
    if (!entry.models.some((model) => model.id === settings.model))
        issues.push('model_unsupported');
    const knownVoice = entry.voices.kind === 'menu'
        ? entry.voices.options.some((option) => option.id === settings.voiceId)
        : new RegExp(entry.voices.pattern).test(settings.voiceId);
    if (!knownVoice)
        issues.push('voice_unknown');
    return issues;
}
/** Identity of the calling agent for one outbound call from the shared Telnyx number. */
exports.OutboundCallerIdentitySchema = zod_1.z.object({
    agent: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema,
    /** Name the agent introduces itself with (e.g. «Francesca»). */
    displayName: zod_1.z.string().trim().min(1).max(80),
    persona: zod_1.z.string().trim().min(1).max(2000).optional(),
    voice: zod_1.z.object({ provider: exports.AgentVoiceProviderIdSchema, voiceId: exports.AgentVoiceIdSchema, model: exports.AgentVoiceModelSchema }).strict(),
    /** The single shared outbound number (E.164), same rule as cap-voice-live. */
    fromNumber: index_js_1.VoiceLiveCallStartRequestSchema.shape.to_number,
    /** Applied voice settings version used for this call (a change mid-call never swaps the voice). */
    settingsVersion: agent_config_js_1.AgentConfigVersionSchema,
}).strict();
/** Build the caller identity from APPLIED settings; text-only agents and agents without phone never dial. */
function outboundCallerIdentityFor(input) {
    const { settings, ...rest } = input;
    if (settings === null)
        return { ok: false, error: 'voice_not_applied' };
    if (settings.mode === 'text-only')
        return { ok: false, error: 'voice_disabled' };
    if (!settings.transports.includes('phone'))
        return { ok: false, error: 'phone_not_enabled' };
    return { ok: true, identity: { ...rest, voice: { provider: settings.provider, voiceId: settings.voiceId, model: settings.model } } };
}
//# sourceMappingURL=agent-voice-settings.js.map