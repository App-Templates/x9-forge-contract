import { z } from 'zod';
import { VoiceProviderSchema } from "./provider.js";
import { VoiceLiveCallStartRequestSchema } from "../voice-live/index.js";
import { CapabilityParameterKeySchema, CapabilityParameterValueSchema } from "../parameters.js";
import { AgentConfigVersionSchema } from "../ricerca/agent-config.js";
import { AgentIdSchema } from "../../agent/agent-identity.js";
import { AgentRuntimeIdentitySchema } from "../../agent/agent-runtime-identity.js";
import { AgentConfigVersionStateSchema } from "../../agent/agent-management.js";
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
export const KNOWN_AGENT_VOICE_PROVIDERS = VoiceProviderSchema.options;
export const AgentVoiceProviderIdSchema = z.string().regex(/^[a-z][a-z0-9_]{1,63}$/);
export const AgentVoiceProtocolSchema = z.enum(['websocket', 'webrtc', 'sip']);
/** phone: calls over the outbound Telnyx number · web: browser/app sessions. */
export const AgentVoiceTransportSchema = z.enum(['phone', 'web']);
/** Provider voice id: a menu value for GPT voices, the voice id for ElevenLabs. */
export const AgentVoiceIdSchema = z.string().min(1).max(128);
export const AgentVoiceModelSchema = z.string().min(1).max(128);
/** BCP-47 language tag, e.g. it or it-IT. */
export const AgentVoiceLocaleSchema = z.string().regex(/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/);
const TransportsSchema = z.array(AgentVoiceTransportSchema).min(1).max(2)
    .refine((transports) => new Set(transports).size === transports.length, { message: 'Duplicate transport' });
export const AgentVoiceSettingsSchema = z.discriminatedUnion('mode', [
    z.object({ mode: z.literal('text-only') }).strict(),
    z.object({
        mode: z.literal('voice'),
        provider: AgentVoiceProviderIdSchema,
        protocol: AgentVoiceProtocolSchema,
        transports: TransportsSchema,
        voiceId: AgentVoiceIdSchema,
        model: AgentVoiceModelSchema,
        /** BCP-47 language of the voice, e.g. it-IT. */
        locale: AgentVoiceLocaleSchema.optional(),
        /** Provider parameters (e.g. stability, speed); never credentials. */
        params: z.record(CapabilityParameterKeySchema, CapabilityParameterValueSchema).optional(),
    }).strict(),
]);
/** Saved (desired) and applied voice settings of one agent, with their configuration versions. */
export const AgentVoiceConfigSchema = z.object({
    /** Management (Forge) agent id. */
    agentId: AgentIdSchema,
    versions: AgentConfigVersionStateSchema,
    desired: AgentVoiceSettingsSchema,
    applied: AgentVoiceSettingsSchema.nullable(),
}).superRefine((config, ctx) => {
    if ((config.applied === null) !== (config.versions.applied === null)) {
        ctx.addIssue({ code: 'custom', path: ['applied'], message: 'Applied settings exist exactly when a version was applied' });
    }
});
const LabelSchema = z.string().trim().min(1).max(120);
const PatternSchema = z.string().min(1).max(200).refine((pattern) => {
    try {
        new RegExp(pattern);
        return true;
    }
    catch {
        return false;
    }
}, { message: 'invalid regular expression' });
export const VoiceProviderCatalogEntrySchema = z.object({
    provider: AgentVoiceProviderIdSchema,
    label: LabelSchema,
    protocols: z.array(AgentVoiceProtocolSchema).min(1),
    transports: z.array(AgentVoiceTransportSchema).min(1),
    models: z.array(z.object({ id: AgentVoiceModelSchema, label: LabelSchema })).min(1),
    voices: z.discriminatedUnion('kind', [
        /** Closed list (e.g. GPT stock voices): Forge shows a menu. */
        z.object({ kind: z.literal('menu'), options: z.array(z.object({ id: AgentVoiceIdSchema, label: LabelSchema })).min(1) }),
        /** Free provider voice id (e.g. ElevenLabs): Forge shows a field validated by `pattern`. */
        z.object({ kind: z.literal('id'), pattern: PatternSchema }),
    ]),
});
/** Published by the voice producer (cap-voice); `version` changes whenever a supported choice changes. */
export const VoiceProviderCatalogSchema = z.object({
    version: z.string().min(1).max(64),
    providers: z.array(VoiceProviderCatalogEntrySchema),
}).superRefine((catalog, ctx) => {
    const seen = new Set();
    for (const [index, entry] of catalog.providers.entries()) {
        if (seen.has(entry.provider))
            ctx.addIssue({ code: 'custom', path: ['providers', index, 'provider'], message: 'Duplicate provider' });
        seen.add(entry.provider);
    }
});
export const AgentVoiceErrorCodeSchema = z.enum([
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
export function validateAgentVoiceSettings(settings, catalog) {
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
export const OutboundCallerIdentitySchema = z.object({
    agent: AgentRuntimeIdentitySchema,
    /** Name the agent introduces itself with (e.g. «Francesca»). */
    displayName: z.string().trim().min(1).max(80),
    persona: z.string().trim().min(1).max(2000).optional(),
    voice: z.object({ provider: AgentVoiceProviderIdSchema, voiceId: AgentVoiceIdSchema, model: AgentVoiceModelSchema }).strict(),
    /** The single shared outbound number (E.164), same rule as cap-voice-live. */
    fromNumber: VoiceLiveCallStartRequestSchema.shape.to_number,
    /** Applied voice settings version used for this call (a change mid-call never swaps the voice). */
    settingsVersion: AgentConfigVersionSchema,
}).strict();
/** Build the caller identity from APPLIED settings; text-only agents and agents without phone never dial. */
export function outboundCallerIdentityFor(input) {
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