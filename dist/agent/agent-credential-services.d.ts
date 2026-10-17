import { z } from 'zod';
import { type KnownCredentialKey, type AuthGateField } from "./agent-credentials.js";
/** Metadata only: this module never accepts credential values or resolves the active provider. */
export declare const AGENT_CREDENTIAL_SERVICE_KEYS: readonly ("OPENAI_API_KEY" | "ANTHROPIC_API_KEY" | "GOOGLE_API_KEY" | "AGENT_CHAT_MODEL" | "TELEGRAM_BOT_TOKEN" | "ELEVENLABS_API_KEY" | "ELEVENLABS_VOICE_ID" | "ELEVENLABS_MODEL_ID" | "TTS_PROVIDER" | "OPENAI_TTS_MODEL" | "OPENAI_TTS_VOICE" | "STT_PRIMARY_PROVIDER" | "OPENAI_STT_MODEL" | "VOICE_CALL_PROVIDER" | "OPENAI_LIVE_VOICE" | "OPENAI_LIVE_BACKEND_MODEL" | "TELNYX_API_KEY" | "TELNYX_CONNECTION_ID" | "TELNYX_FROM_NUMBER" | "TELNYX_PUBLIC_KEY" | "LIVE_WEB_AUTH_TOKEN" | "QDRANT_API_KEY" | "ELEVENLABS_MINDFULNESS_AGENT_ID" | "FORGE_VOICE_REGISTER_TOKEN" | "AGENTMAIL_API_KEY" | "AGENTMAIL_INBOX_ID" | "AGENT_EMAIL" | "GOOGLE_CALENDAR_CLIENT_ID" | "GOOGLE_CALENDAR_CLIENT_SECRET" | "GOOGLE_CALENDAR_REFRESH_TOKEN" | "GOOGLE_CONTACTS_CLIENT_ID" | "GOOGLE_CONTACTS_CLIENT_SECRET" | "GOOGLE_CONTACTS_REFRESH_TOKEN" | "NETATMO_EMAIL" | "NETATMO_CLIENT_ID" | "NETATMO_CLIENT_SECRET" | "NETATMO_REFRESH_TOKEN" | "NETATMO_ACCESS_TOKEN" | "NETATMO_PASSWORD" | "INTERNAL_SECRET" | "X9_INTERNAL_SECRET" | "HOSTINGER_API_TOKEN" | "INTERNAL_TOKEN")[];
export type AgentCredentialServiceKey = KnownCredentialKey | AuthGateField;
export declare const AgentCredentialServiceKeySchema: z.ZodEnum<{
    OPENAI_API_KEY: "OPENAI_API_KEY";
    ANTHROPIC_API_KEY: "ANTHROPIC_API_KEY";
    GOOGLE_API_KEY: "GOOGLE_API_KEY";
    AGENT_CHAT_MODEL: "AGENT_CHAT_MODEL";
    TELEGRAM_BOT_TOKEN: "TELEGRAM_BOT_TOKEN";
    ELEVENLABS_API_KEY: "ELEVENLABS_API_KEY";
    ELEVENLABS_VOICE_ID: "ELEVENLABS_VOICE_ID";
    ELEVENLABS_MODEL_ID: "ELEVENLABS_MODEL_ID";
    TTS_PROVIDER: "TTS_PROVIDER";
    OPENAI_TTS_MODEL: "OPENAI_TTS_MODEL";
    OPENAI_TTS_VOICE: "OPENAI_TTS_VOICE";
    STT_PRIMARY_PROVIDER: "STT_PRIMARY_PROVIDER";
    OPENAI_STT_MODEL: "OPENAI_STT_MODEL";
    VOICE_CALL_PROVIDER: "VOICE_CALL_PROVIDER";
    OPENAI_LIVE_VOICE: "OPENAI_LIVE_VOICE";
    OPENAI_LIVE_BACKEND_MODEL: "OPENAI_LIVE_BACKEND_MODEL";
    TELNYX_API_KEY: "TELNYX_API_KEY";
    TELNYX_CONNECTION_ID: "TELNYX_CONNECTION_ID";
    TELNYX_FROM_NUMBER: "TELNYX_FROM_NUMBER";
    TELNYX_PUBLIC_KEY: "TELNYX_PUBLIC_KEY";
    LIVE_WEB_AUTH_TOKEN: "LIVE_WEB_AUTH_TOKEN";
    QDRANT_API_KEY: "QDRANT_API_KEY";
    ELEVENLABS_MINDFULNESS_AGENT_ID: "ELEVENLABS_MINDFULNESS_AGENT_ID";
    FORGE_VOICE_REGISTER_TOKEN: "FORGE_VOICE_REGISTER_TOKEN";
    AGENTMAIL_API_KEY: "AGENTMAIL_API_KEY";
    AGENTMAIL_INBOX_ID: "AGENTMAIL_INBOX_ID";
    AGENT_EMAIL: "AGENT_EMAIL";
    GOOGLE_CALENDAR_CLIENT_ID: "GOOGLE_CALENDAR_CLIENT_ID";
    GOOGLE_CALENDAR_CLIENT_SECRET: "GOOGLE_CALENDAR_CLIENT_SECRET";
    GOOGLE_CALENDAR_REFRESH_TOKEN: "GOOGLE_CALENDAR_REFRESH_TOKEN";
    GOOGLE_CONTACTS_CLIENT_ID: "GOOGLE_CONTACTS_CLIENT_ID";
    GOOGLE_CONTACTS_CLIENT_SECRET: "GOOGLE_CONTACTS_CLIENT_SECRET";
    GOOGLE_CONTACTS_REFRESH_TOKEN: "GOOGLE_CONTACTS_REFRESH_TOKEN";
    NETATMO_EMAIL: "NETATMO_EMAIL";
    NETATMO_CLIENT_ID: "NETATMO_CLIENT_ID";
    NETATMO_CLIENT_SECRET: "NETATMO_CLIENT_SECRET";
    NETATMO_REFRESH_TOKEN: "NETATMO_REFRESH_TOKEN";
    NETATMO_ACCESS_TOKEN: "NETATMO_ACCESS_TOKEN";
    NETATMO_PASSWORD: "NETATMO_PASSWORD";
    INTERNAL_SECRET: "INTERNAL_SECRET";
    X9_INTERNAL_SECRET: "X9_INTERNAL_SECRET";
    HOSTINGER_API_TOKEN: "HOSTINGER_API_TOKEN";
    INTERNAL_TOKEN: "INTERNAL_TOKEN";
}>;
export declare const AGENT_CREDENTIAL_COMMERCIAL_SERVICE_IDS: readonly ["openai", "anthropic", "google", "telegram", "elevenlabs", "telnyx", "qdrant", "agentmail", "hostinger", "netatmo"];
export declare const AgentCredentialCommercialServiceSchema: z.ZodEnum<{
    openai: "openai";
    anthropic: "anthropic";
    google: "google";
    telegram: "telegram";
    netatmo: "netatmo";
    elevenlabs: "elevenlabs";
    telnyx: "telnyx";
    qdrant: "qdrant";
    agentmail: "agentmail";
    hostinger: "hostinger";
}>;
export declare const AgentCredentialInternalServiceSchema: z.ZodEnum<{
    x9: "x9";
    forge: "forge";
}>;
export declare const AgentCredentialKindSchema: z.ZodEnum<{
    credential: "credential";
    setting: "setting";
    identifier: "identifier";
}>;
export declare const AgentCredentialServiceSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"commercial">;
    id: z.ZodEnum<{
        openai: "openai";
        anthropic: "anthropic";
        google: "google";
        telegram: "telegram";
        netatmo: "netatmo";
        elevenlabs: "elevenlabs";
        telnyx: "telnyx";
        qdrant: "qdrant";
        agentmail: "agentmail";
        hostinger: "hostinger";
    }>;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"internal">;
    id: z.ZodEnum<{
        x9: "x9";
        forge: "forge";
    }>;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"multi-provider">;
    candidates: z.ZodArray<z.ZodEnum<{
        openai: "openai";
        anthropic: "anthropic";
        google: "google";
        telegram: "telegram";
        netatmo: "netatmo";
        elevenlabs: "elevenlabs";
        telnyx: "telnyx";
        qdrant: "qdrant";
        agentmail: "agentmail";
        hostinger: "hostinger";
    }>>;
}, z.core.$strict>], "type">;
export type AgentCredentialService = z.infer<typeof AgentCredentialServiceSchema>;
export type AgentCredentialKind = z.infer<typeof AgentCredentialKindSchema>;
type Definition = {
    label: string;
    kind: AgentCredentialKind;
    secret: boolean;
    service: {
        type: 'commercial';
        id: z.infer<typeof AgentCredentialCommercialServiceSchema>;
    } | {
        type: 'internal';
        id: z.infer<typeof AgentCredentialInternalServiceSchema>;
    } | {
        type: 'multi-provider';
        candidates: readonly z.infer<typeof AgentCredentialCommercialServiceSchema>[];
    };
};
/** Immutable, exhaustive declared-key registry. A dynamic catchall key is not an attested commercial service. */
export declare const AGENT_CREDENTIAL_SERVICE_METADATA: Readonly<Record<AgentCredentialServiceKey, Readonly<Definition & {
    key: AgentCredentialServiceKey;
}>>>;
export declare const AgentCredentialServiceMetadataSchema: z.ZodObject<{
    key: z.ZodEnum<{
        OPENAI_API_KEY: "OPENAI_API_KEY";
        ANTHROPIC_API_KEY: "ANTHROPIC_API_KEY";
        GOOGLE_API_KEY: "GOOGLE_API_KEY";
        AGENT_CHAT_MODEL: "AGENT_CHAT_MODEL";
        TELEGRAM_BOT_TOKEN: "TELEGRAM_BOT_TOKEN";
        ELEVENLABS_API_KEY: "ELEVENLABS_API_KEY";
        ELEVENLABS_VOICE_ID: "ELEVENLABS_VOICE_ID";
        ELEVENLABS_MODEL_ID: "ELEVENLABS_MODEL_ID";
        TTS_PROVIDER: "TTS_PROVIDER";
        OPENAI_TTS_MODEL: "OPENAI_TTS_MODEL";
        OPENAI_TTS_VOICE: "OPENAI_TTS_VOICE";
        STT_PRIMARY_PROVIDER: "STT_PRIMARY_PROVIDER";
        OPENAI_STT_MODEL: "OPENAI_STT_MODEL";
        VOICE_CALL_PROVIDER: "VOICE_CALL_PROVIDER";
        OPENAI_LIVE_VOICE: "OPENAI_LIVE_VOICE";
        OPENAI_LIVE_BACKEND_MODEL: "OPENAI_LIVE_BACKEND_MODEL";
        TELNYX_API_KEY: "TELNYX_API_KEY";
        TELNYX_CONNECTION_ID: "TELNYX_CONNECTION_ID";
        TELNYX_FROM_NUMBER: "TELNYX_FROM_NUMBER";
        TELNYX_PUBLIC_KEY: "TELNYX_PUBLIC_KEY";
        LIVE_WEB_AUTH_TOKEN: "LIVE_WEB_AUTH_TOKEN";
        QDRANT_API_KEY: "QDRANT_API_KEY";
        ELEVENLABS_MINDFULNESS_AGENT_ID: "ELEVENLABS_MINDFULNESS_AGENT_ID";
        FORGE_VOICE_REGISTER_TOKEN: "FORGE_VOICE_REGISTER_TOKEN";
        AGENTMAIL_API_KEY: "AGENTMAIL_API_KEY";
        AGENTMAIL_INBOX_ID: "AGENTMAIL_INBOX_ID";
        AGENT_EMAIL: "AGENT_EMAIL";
        GOOGLE_CALENDAR_CLIENT_ID: "GOOGLE_CALENDAR_CLIENT_ID";
        GOOGLE_CALENDAR_CLIENT_SECRET: "GOOGLE_CALENDAR_CLIENT_SECRET";
        GOOGLE_CALENDAR_REFRESH_TOKEN: "GOOGLE_CALENDAR_REFRESH_TOKEN";
        GOOGLE_CONTACTS_CLIENT_ID: "GOOGLE_CONTACTS_CLIENT_ID";
        GOOGLE_CONTACTS_CLIENT_SECRET: "GOOGLE_CONTACTS_CLIENT_SECRET";
        GOOGLE_CONTACTS_REFRESH_TOKEN: "GOOGLE_CONTACTS_REFRESH_TOKEN";
        NETATMO_EMAIL: "NETATMO_EMAIL";
        NETATMO_CLIENT_ID: "NETATMO_CLIENT_ID";
        NETATMO_CLIENT_SECRET: "NETATMO_CLIENT_SECRET";
        NETATMO_REFRESH_TOKEN: "NETATMO_REFRESH_TOKEN";
        NETATMO_ACCESS_TOKEN: "NETATMO_ACCESS_TOKEN";
        NETATMO_PASSWORD: "NETATMO_PASSWORD";
        INTERNAL_SECRET: "INTERNAL_SECRET";
        X9_INTERNAL_SECRET: "X9_INTERNAL_SECRET";
        HOSTINGER_API_TOKEN: "HOSTINGER_API_TOKEN";
        INTERNAL_TOKEN: "INTERNAL_TOKEN";
    }>;
    label: z.ZodString;
    kind: z.ZodEnum<{
        credential: "credential";
        setting: "setting";
        identifier: "identifier";
    }>;
    secret: z.ZodBoolean;
    service: z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"commercial">;
        id: z.ZodEnum<{
            openai: "openai";
            anthropic: "anthropic";
            google: "google";
            telegram: "telegram";
            netatmo: "netatmo";
            elevenlabs: "elevenlabs";
            telnyx: "telnyx";
            qdrant: "qdrant";
            agentmail: "agentmail";
            hostinger: "hostinger";
        }>;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"internal">;
        id: z.ZodEnum<{
            x9: "x9";
            forge: "forge";
        }>;
    }, z.core.$strict>, z.ZodObject<{
        type: z.ZodLiteral<"multi-provider">;
        candidates: z.ZodArray<z.ZodEnum<{
            openai: "openai";
            anthropic: "anthropic";
            google: "google";
            telegram: "telegram";
            netatmo: "netatmo";
            elevenlabs: "elevenlabs";
            telnyx: "telnyx";
            qdrant: "qdrant";
            agentmail: "agentmail";
            hostinger: "hostinger";
        }>>;
    }, z.core.$strict>], "type">;
}, z.core.$strict>;
export type AgentCredentialServiceMetadata = z.infer<typeof AgentCredentialServiceMetadataSchema>;
/** Unknown capability-specific keys remain unknown; never guess a brand from their spelling. */
export declare function getAgentCredentialServiceMetadata(key: string): (typeof AGENT_CREDENTIAL_SERVICE_METADATA)[AgentCredentialServiceKey] | null;
export {};
//# sourceMappingURL=agent-credential-services.d.ts.map