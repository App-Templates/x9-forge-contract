"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentCredentialServiceMetadataSchema = exports.AGENT_CREDENTIAL_SERVICE_METADATA = exports.AgentCredentialServiceSchema = exports.AgentCredentialKindSchema = exports.AgentCredentialInternalServiceSchema = exports.AgentCredentialCommercialServiceSchema = exports.AGENT_CREDENTIAL_COMMERCIAL_SERVICE_IDS = exports.AgentCredentialServiceKeySchema = exports.AGENT_CREDENTIAL_SERVICE_KEYS = void 0;
exports.getAgentCredentialServiceMetadata = getAgentCredentialServiceMetadata;
const zod_1 = require("zod");
const agent_credentials_js_1 = require("./agent-credentials.cjs");
const model_provider_js_1 = require("../model-router/model-provider.cjs");
/** Metadata only: this module never accepts credential values or resolves the active provider. */
exports.AGENT_CREDENTIAL_SERVICE_KEYS = [...new Set([...agent_credentials_js_1.KNOWN_CREDENTIAL_KEYS, ...agent_credentials_js_1.AUTH_GATE_FIELDS])];
exports.AgentCredentialServiceKeySchema = zod_1.z.enum(exports.AGENT_CREDENTIAL_SERVICE_KEYS);
exports.AGENT_CREDENTIAL_COMMERCIAL_SERVICE_IDS = [...model_provider_js_1.MODEL_PROVIDERS, 'telegram', 'elevenlabs', 'telnyx', 'qdrant', 'agentmail', 'hostinger', 'netatmo'];
exports.AgentCredentialCommercialServiceSchema = zod_1.z.enum(exports.AGENT_CREDENTIAL_COMMERCIAL_SERVICE_IDS);
exports.AgentCredentialInternalServiceSchema = zod_1.z.enum(['x9', 'forge']);
exports.AgentCredentialKindSchema = zod_1.z.enum(['credential', 'setting', 'identifier']);
exports.AgentCredentialServiceSchema = zod_1.z.discriminatedUnion('type', [
    zod_1.z.object({ type: zod_1.z.literal('commercial'), id: exports.AgentCredentialCommercialServiceSchema }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('internal'), id: exports.AgentCredentialInternalServiceSchema }).strict(),
    zod_1.z.object({ type: zod_1.z.literal('multi-provider'), candidates: zod_1.z.array(exports.AgentCredentialCommercialServiceSchema).min(2)
            .refine(values => new Set(values).size === values.length, 'Candidate services must be unique') }).strict(),
]);
const definitions = {
    "OPENAI_API_KEY": {
        "label": "Chiave API OpenAI",
        "kind": "credential",
        "service": {
            "type": "commercial",
            "id": "openai"
        },
        "secret": true
    },
    "ANTHROPIC_API_KEY": {
        "label": "Chiave API Anthropic",
        "kind": "credential",
        "service": {
            "type": "commercial",
            "id": "anthropic"
        },
        "secret": true
    },
    "GOOGLE_API_KEY": {
        "label": "Chiave API Google",
        "kind": "credential",
        "service": {
            "type": "commercial",
            "id": "google"
        },
        "secret": true
    },
    "TELEGRAM_BOT_TOKEN": {
        "label": "Token del bot Telegram",
        "kind": "credential",
        "service": {
            "type": "commercial",
            "id": "telegram"
        },
        "secret": true
    },
    "ELEVENLABS_API_KEY": {
        "label": "Chiave API ElevenLabs",
        "kind": "credential",
        "service": {
            "type": "commercial",
            "id": "elevenlabs"
        },
        "secret": true
    },
    "TELNYX_API_KEY": {
        "label": "Chiave API Telnyx",
        "kind": "credential",
        "service": {
            "type": "commercial",
            "id": "telnyx"
        },
        "secret": true
    },
    "QDRANT_API_KEY": {
        "label": "Chiave API Qdrant",
        "kind": "credential",
        "service": {
            "type": "commercial",
            "id": "qdrant"
        },
        "secret": true
    },
    "HOSTINGER_API_TOKEN": {
        "label": "Token API Hostinger",
        "kind": "credential",
        "service": {
            "type": "commercial",
            "id": "hostinger"
        },
        "secret": true
    },
    "AGENTMAIL_API_KEY": {
        "label": "Chiave API AgentMail",
        "kind": "credential",
        "service": {
            "type": "commercial",
            "id": "agentmail"
        },
        "secret": true
    },
    "GOOGLE_CALENDAR_CLIENT_SECRET": {
        "label": "Segreto del client Google Calendar",
        "kind": "credential",
        "service": {
            "type": "commercial",
            "id": "google"
        },
        "secret": true
    },
    "GOOGLE_CALENDAR_REFRESH_TOKEN": {
        "label": "Token di rinnovo Google Calendar",
        "kind": "credential",
        "service": {
            "type": "commercial",
            "id": "google"
        },
        "secret": true
    },
    "TELNYX_PUBLIC_KEY": {
        "label": "Chiave pubblica di verifica Telnyx",
        "kind": "credential",
        "service": {
            "type": "commercial",
            "id": "telnyx"
        },
        "secret": false
    },
    "INTERNAL_SECRET": {
        "label": "Segreto dei servizi interni X9",
        "kind": "credential",
        "service": {
            "type": "internal",
            "id": "x9"
        },
        "secret": true
    },
    "INTERNAL_TOKEN": {
        "label": "Token dei servizi interni X9",
        "kind": "credential",
        "service": {
            "type": "internal",
            "id": "x9"
        },
        "secret": true
    },
    "X9_INTERNAL_SECRET": {
        "label": "Segreto del collegamento con X9",
        "kind": "credential",
        "service": {
            "type": "internal",
            "id": "x9"
        },
        "secret": true
    },
    "LIVE_WEB_AUTH_TOKEN": {
        "label": "Token della voce web X9",
        "kind": "credential",
        "service": {
            "type": "internal",
            "id": "x9"
        },
        "secret": true
    },
    "FORGE_VOICE_REGISTER_TOKEN": {
        "label": "Token di registrazione voce in Forge",
        "kind": "credential",
        "service": {
            "type": "internal",
            "id": "forge"
        },
        "secret": true
    },
    "AGENT_CHAT_MODEL": {
        "label": "Modello di conversazione e ragionamento",
        "kind": "setting",
        "service": {
            "type": "multi-provider",
            "candidates": [
                "openai",
                "anthropic",
                "google"
            ]
        },
        "secret": false
    },
    "TTS_PROVIDER": {
        "label": "Fornitore della sintesi vocale",
        "kind": "setting",
        "service": {
            "type": "multi-provider",
            "candidates": [
                "elevenlabs",
                "openai"
            ]
        },
        "secret": false
    },
    "STT_PRIMARY_PROVIDER": {
        "label": "Fornitore primario della trascrizione",
        "kind": "setting",
        "service": {
            "type": "multi-provider",
            "candidates": [
                "elevenlabs",
                "openai"
            ]
        },
        "secret": false
    },
    "VOICE_CALL_PROVIDER": {
        "label": "Fornitore della voce in chiamata",
        "kind": "setting",
        "service": {
            "type": "multi-provider",
            "candidates": [
                "elevenlabs",
                "openai"
            ]
        },
        "secret": false
    },
    "ELEVENLABS_MODEL_ID": {
        "label": "Modello vocale ElevenLabs",
        "kind": "setting",
        "service": {
            "type": "commercial",
            "id": "elevenlabs"
        },
        "secret": false
    },
    "OPENAI_TTS_MODEL": {
        "label": "Modello di sintesi vocale OpenAI",
        "kind": "setting",
        "service": {
            "type": "commercial",
            "id": "openai"
        },
        "secret": false
    },
    "OPENAI_TTS_VOICE": {
        "label": "Voce di sintesi OpenAI",
        "kind": "setting",
        "service": {
            "type": "commercial",
            "id": "openai"
        },
        "secret": false
    },
    "OPENAI_STT_MODEL": {
        "label": "Modello di trascrizione OpenAI",
        "kind": "setting",
        "service": {
            "type": "commercial",
            "id": "openai"
        },
        "secret": false
    },
    "OPENAI_LIVE_VOICE": {
        "label": "Voce in tempo reale OpenAI",
        "kind": "setting",
        "service": {
            "type": "commercial",
            "id": "openai"
        },
        "secret": false
    },
    "OPENAI_LIVE_BACKEND_MODEL": {
        "label": "Modello di supporto della voce OpenAI",
        "kind": "setting",
        "service": {
            "type": "commercial",
            "id": "openai"
        },
        "secret": false
    },
    "ELEVENLABS_VOICE_ID": {
        "label": "Identificativo della voce ElevenLabs",
        "kind": "identifier",
        "service": {
            "type": "commercial",
            "id": "elevenlabs"
        },
        "secret": false
    },
    "ELEVENLABS_MINDFULNESS_AGENT_ID": {
        "label": "Identificativo dell’agente ElevenLabs",
        "kind": "identifier",
        "service": {
            "type": "commercial",
            "id": "elevenlabs"
        },
        "secret": false
    },
    "TELNYX_CONNECTION_ID": {
        "label": "Identificativo della connessione Telnyx",
        "kind": "identifier",
        "service": {
            "type": "commercial",
            "id": "telnyx"
        },
        "secret": false
    },
    "TELNYX_FROM_NUMBER": {
        "label": "Numero chiamante Telnyx",
        "kind": "identifier",
        "service": {
            "type": "commercial",
            "id": "telnyx"
        },
        "secret": false
    },
    "AGENTMAIL_INBOX_ID": {
        "label": "Identificativo della casella AgentMail",
        "kind": "identifier",
        "service": {
            "type": "commercial",
            "id": "agentmail"
        },
        "secret": false
    },
    "AGENT_EMAIL": {
        "label": "Indirizzo email AgentMail",
        "kind": "identifier",
        "service": {
            "type": "commercial",
            "id": "agentmail"
        },
        "secret": false
    },
    "GOOGLE_CONTACTS_CLIENT_ID": {
        "label": "Identificativo del client Google Contacts",
        "kind": "credential",
        "service": {
            "type": "commercial",
            "id": "google"
        },
        "secret": false
    },
    "GOOGLE_CONTACTS_CLIENT_SECRET": {
        "label": "Segreto del client Google Contacts",
        "kind": "credential",
        "service": {
            "type": "commercial",
            "id": "google"
        },
        "secret": true
    },
    "GOOGLE_CONTACTS_REFRESH_TOKEN": {
        "label": "Token di rinnovo Google Contacts",
        "kind": "credential",
        "service": {
            "type": "commercial",
            "id": "google"
        },
        "secret": true
    },
    "NETATMO_EMAIL": {
        "label": "Indirizzo email account Netatmo",
        "kind": "credential",
        "service": {
            "type": "commercial",
            "id": "netatmo"
        },
        "secret": false
    },
    "NETATMO_CLIENT_ID": {
        "label": "Identificativo del client Netatmo",
        "kind": "credential",
        "service": {
            "type": "commercial",
            "id": "netatmo"
        },
        "secret": false
    },
    "NETATMO_CLIENT_SECRET": {
        "label": "Segreto del client Netatmo",
        "kind": "credential",
        "service": {
            "type": "commercial",
            "id": "netatmo"
        },
        "secret": true
    },
    "NETATMO_REFRESH_TOKEN": {
        "label": "Token di rinnovo Netatmo",
        "kind": "credential",
        "service": {
            "type": "commercial",
            "id": "netatmo"
        },
        "secret": true
    },
    "NETATMO_ACCESS_TOKEN": {
        "label": "Token di accesso Netatmo",
        "kind": "credential",
        "service": {
            "type": "commercial",
            "id": "netatmo"
        },
        "secret": true
    },
    "NETATMO_PASSWORD": {
        "label": "Segreto di accesso Netatmo",
        "kind": "credential",
        "service": {
            "type": "commercial",
            "id": "netatmo"
        },
        "secret": true
    },
    "GOOGLE_CALENDAR_CLIENT_ID": {
        "label": "Identificativo del client Google Calendar",
        "kind": "credential",
        "service": {
            "type": "commercial",
            "id": "google"
        },
        "secret": false
    }
};
/** Immutable, exhaustive declared-key registry. A dynamic catchall key is not an attested commercial service. */
exports.AGENT_CREDENTIAL_SERVICE_METADATA = Object.freeze(Object.fromEntries(Object.entries(definitions).map(([key, definition]) => {
    const service = definition.service.type === 'multi-provider'
        ? Object.freeze({ ...definition.service, candidates: Object.freeze([...definition.service.candidates]) })
        : Object.freeze({ ...definition.service });
    return [key, Object.freeze({ key: key, ...definition, service })];
})));
exports.AgentCredentialServiceMetadataSchema = zod_1.z.object({
    key: exports.AgentCredentialServiceKeySchema,
    label: zod_1.z.string().trim().min(1).max(120),
    kind: exports.AgentCredentialKindSchema,
    secret: zod_1.z.boolean(),
    service: exports.AgentCredentialServiceSchema,
}).strict().superRefine((entry, context) => {
    const expected = exports.AGENT_CREDENTIAL_SERVICE_METADATA[entry.key];
    if (entry.kind !== expected.kind || entry.secret !== expected.secret || entry.label !== expected.label
        || JSON.stringify(entry.service) !== JSON.stringify(expected.service)) {
        context.addIssue({ code: 'custom', message: 'Metadata must match the canonical declared credential service' });
    }
});
/** Unknown capability-specific keys remain unknown; never guess a brand from their spelling. */
function getAgentCredentialServiceMetadata(key) {
    return Object.prototype.hasOwnProperty.call(exports.AGENT_CREDENTIAL_SERVICE_METADATA, key)
        ? exports.AGENT_CREDENTIAL_SERVICE_METADATA[key] : null;
}
//# sourceMappingURL=agent-credential-services.js.map