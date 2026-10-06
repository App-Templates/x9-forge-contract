import { z } from 'zod';
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
export declare const KNOWN_AGENT_VOICE_PROVIDERS: ("elevenlabs" | "openai_live")[];
export declare const AgentVoiceProviderIdSchema: z.ZodString;
export type AgentVoiceProviderId = z.infer<typeof AgentVoiceProviderIdSchema>;
export declare const AgentVoiceProtocolSchema: z.ZodEnum<{
    websocket: "websocket";
    webrtc: "webrtc";
    sip: "sip";
}>;
export type AgentVoiceProtocol = z.infer<typeof AgentVoiceProtocolSchema>;
/** phone: calls over the outbound Telnyx number · web: browser/app sessions. */
export declare const AgentVoiceTransportSchema: z.ZodEnum<{
    web: "web";
    phone: "phone";
}>;
export type AgentVoiceTransport = z.infer<typeof AgentVoiceTransportSchema>;
/** Provider voice id: a menu value for GPT voices, the voice id for ElevenLabs. */
export declare const AgentVoiceIdSchema: z.ZodString;
export declare const AgentVoiceModelSchema: z.ZodString;
/** BCP-47 language tag, e.g. it or it-IT. */
export declare const AgentVoiceLocaleSchema: z.ZodString;
export declare const AgentVoiceSettingsSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    mode: z.ZodLiteral<"text-only">;
}, z.core.$strict>, z.ZodObject<{
    mode: z.ZodLiteral<"voice">;
    provider: z.ZodString;
    protocol: z.ZodEnum<{
        websocket: "websocket";
        webrtc: "webrtc";
        sip: "sip";
    }>;
    transports: z.ZodArray<z.ZodEnum<{
        web: "web";
        phone: "phone";
    }>>;
    voiceId: z.ZodString;
    model: z.ZodString;
    locale: z.ZodOptional<z.ZodString>;
    params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>>>;
}, z.core.$strict>], "mode">;
export type AgentVoiceSettings = z.infer<typeof AgentVoiceSettingsSchema>;
export type AgentVoiceEnabledSettings = Extract<AgentVoiceSettings, {
    mode: 'voice';
}>;
/** Saved (desired) and applied voice settings of one agent, with their configuration versions. */
export declare const AgentVoiceConfigSchema: z.ZodObject<{
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    versions: z.ZodObject<{
        desired: z.ZodNumber;
        applied: z.ZodNullable<z.ZodNumber>;
        failed: z.ZodNullable<z.ZodObject<{
            version: z.ZodNumber;
            reason: z.ZodObject<{
                code: z.ZodEnum<{
                    unknown: "unknown";
                    "not-loaded": "not-loaded";
                    "load-failed": "load-failed";
                    "validation-failed": "validation-failed";
                    timeout: "timeout";
                    "source-unavailable": "source-unavailable";
                    "shared-runtime": "shared-runtime";
                    "externally-owned": "externally-owned";
                    "not-supported": "not-supported";
                    "in-progress": "in-progress";
                }>;
                detail: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>;
        }, z.core.$strict>>;
    }, z.core.$strip>;
    desired: z.ZodDiscriminatedUnion<[z.ZodObject<{
        mode: z.ZodLiteral<"text-only">;
    }, z.core.$strict>, z.ZodObject<{
        mode: z.ZodLiteral<"voice">;
        provider: z.ZodString;
        protocol: z.ZodEnum<{
            websocket: "websocket";
            webrtc: "webrtc";
            sip: "sip";
        }>;
        transports: z.ZodArray<z.ZodEnum<{
            web: "web";
            phone: "phone";
        }>>;
        voiceId: z.ZodString;
        model: z.ZodString;
        locale: z.ZodOptional<z.ZodString>;
        params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>>>;
    }, z.core.$strict>], "mode">;
    applied: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
        mode: z.ZodLiteral<"text-only">;
    }, z.core.$strict>, z.ZodObject<{
        mode: z.ZodLiteral<"voice">;
        provider: z.ZodString;
        protocol: z.ZodEnum<{
            websocket: "websocket";
            webrtc: "webrtc";
            sip: "sip";
        }>;
        transports: z.ZodArray<z.ZodEnum<{
            web: "web";
            phone: "phone";
        }>>;
        voiceId: z.ZodString;
        model: z.ZodString;
        locale: z.ZodOptional<z.ZodString>;
        params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>>>;
    }, z.core.$strict>], "mode">>;
}, z.core.$strip>;
export type AgentVoiceConfig = z.infer<typeof AgentVoiceConfigSchema>;
export declare const VoiceProviderCatalogEntrySchema: z.ZodObject<{
    provider: z.ZodString;
    label: z.ZodString;
    protocols: z.ZodArray<z.ZodEnum<{
        websocket: "websocket";
        webrtc: "webrtc";
        sip: "sip";
    }>>;
    transports: z.ZodArray<z.ZodEnum<{
        web: "web";
        phone: "phone";
    }>>;
    models: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
    }, z.core.$strip>>;
    voices: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"menu">;
        options: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        kind: z.ZodLiteral<"id">;
        pattern: z.ZodString;
    }, z.core.$strip>], "kind">;
}, z.core.$strip>;
export type VoiceProviderCatalogEntry = z.infer<typeof VoiceProviderCatalogEntrySchema>;
/** Published by the voice producer (cap-voice); `version` changes whenever a supported choice changes. */
export declare const VoiceProviderCatalogSchema: z.ZodObject<{
    version: z.ZodString;
    providers: z.ZodArray<z.ZodObject<{
        provider: z.ZodString;
        label: z.ZodString;
        protocols: z.ZodArray<z.ZodEnum<{
            websocket: "websocket";
            webrtc: "webrtc";
            sip: "sip";
        }>>;
        transports: z.ZodArray<z.ZodEnum<{
            web: "web";
            phone: "phone";
        }>>;
        models: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
        }, z.core.$strip>>;
        voices: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"menu">;
            options: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                label: z.ZodString;
            }, z.core.$strip>>;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"id">;
            pattern: z.ZodString;
        }, z.core.$strip>], "kind">;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type VoiceProviderCatalog = z.infer<typeof VoiceProviderCatalogSchema>;
export declare const AgentVoiceErrorCodeSchema: z.ZodEnum<{
    voice_disabled: "voice_disabled";
    phone_not_enabled: "phone_not_enabled";
    provider_unsupported: "provider_unsupported";
    protocol_unsupported: "protocol_unsupported";
    transport_unsupported: "transport_unsupported";
    model_unsupported: "model_unsupported";
    voice_unknown: "voice_unknown";
}>;
export type AgentVoiceErrorCode = z.infer<typeof AgentVoiceErrorCodeSchema>;
/** Choices of `settings` the catalog does not support (empty: valid). Text-only is always valid. */
export declare function validateAgentVoiceSettings(settings: AgentVoiceSettings, catalog: VoiceProviderCatalog): AgentVoiceErrorCode[];
/** Identity of the calling agent for one outbound call from the shared Telnyx number. */
export declare const OutboundCallerIdentitySchema: z.ZodObject<{
    agent: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    }, z.core.$strip>;
    displayName: z.ZodString;
    persona: z.ZodOptional<z.ZodString>;
    voice: z.ZodObject<{
        provider: z.ZodString;
        voiceId: z.ZodString;
        model: z.ZodString;
    }, z.core.$strict>;
    fromNumber: z.ZodString;
    settingsVersion: z.ZodNumber;
}, z.core.$strict>;
export type OutboundCallerIdentity = z.infer<typeof OutboundCallerIdentitySchema>;
export type OutboundCallerIdentityResult = {
    ok: true;
    identity: OutboundCallerIdentity;
} | {
    ok: false;
    error: 'voice_disabled' | 'phone_not_enabled';
};
/** Build the caller identity from APPLIED settings; text-only agents and agents without phone never dial. */
export declare function outboundCallerIdentityFor(input: Omit<OutboundCallerIdentity, 'voice'> & {
    settings: AgentVoiceSettings;
}): OutboundCallerIdentityResult;
//# sourceMappingURL=agent-voice-settings.d.ts.map