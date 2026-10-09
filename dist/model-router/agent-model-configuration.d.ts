import { z } from 'zod';
import { type AgentRuntimeIdentity } from "../agent/agent-runtime-identity.js";
/** Canonical conversation slot; memory/audio slots are added with their qualified consumers. */
export declare const AGENT_CHAT_MODEL_SLOT_ID = "agent_chat";
/** Generic syntax stays additive for existing custom and future consumer slots. */
export declare const ModelSlotIdSchema: z.ZodString;
export declare const ModelSelectionTierSchema: z.ZodEnum<{
    standard: "standard";
    advanced: "advanced";
    reasoning: "reasoning";
    fallback: "fallback";
}>;
export declare const AgentModelSelectionSchema: z.ZodObject<{
    slotId: z.ZodString;
    settings: z.ZodUnion<readonly [z.ZodObject<{
        mode: z.ZodLiteral<"automatic">;
        capability: z.ZodString;
        function: z.ZodEnum<{
            reasoning: "reasoning";
            "memory-extraction": "memory-extraction";
            embedding: "embedding";
            tts: "tts";
            transcription: "transcription";
            voice: "voice";
        }>;
        catalogVersion: z.ZodString;
        requirements: z.ZodObject<{
            tools: z.ZodBoolean;
            stream: z.ZodBoolean;
            structuredOutput: z.ZodBoolean;
        }, z.core.$strict>;
        tiers: z.ZodRecord<z.ZodEnum<{
            standard: "standard";
            advanced: "advanced";
            reasoning: "reasoning";
        }>, z.ZodObject<{
            provider: z.ZodString;
            modelId: z.ZodString;
            protocol: z.ZodEnum<{
                responses: "responses";
                "chat-completions": "chat-completions";
                messages: "messages";
                "generate-content": "generate-content";
                embeddings: "embeddings";
                speech: "speech";
                transcriptions: "transcriptions";
                realtime: "realtime";
            }>;
            adapterId: z.ZodString;
        }, z.core.$strict>>;
        fallback: z.ZodObject<{
            provider: z.ZodString;
            modelId: z.ZodString;
            protocol: z.ZodEnum<{
                responses: "responses";
                "chat-completions": "chat-completions";
                messages: "messages";
                "generate-content": "generate-content";
                embeddings: "embeddings";
                speech: "speech";
                transcriptions: "transcriptions";
                realtime: "realtime";
            }>;
            adapterId: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>, z.ZodObject<{
        mode: z.ZodLiteral<"pin">;
        pin: z.ZodObject<{
            provider: z.ZodString;
            modelId: z.ZodString;
            protocol: z.ZodEnum<{
                responses: "responses";
                "chat-completions": "chat-completions";
                messages: "messages";
                "generate-content": "generate-content";
                embeddings: "embeddings";
                speech: "speech";
                transcriptions: "transcriptions";
                realtime: "realtime";
            }>;
            adapterId: z.ZodString;
        }, z.core.$strict>;
        capability: z.ZodString;
        function: z.ZodEnum<{
            reasoning: "reasoning";
            "memory-extraction": "memory-extraction";
            embedding: "embedding";
            tts: "tts";
            transcription: "transcription";
            voice: "voice";
        }>;
        catalogVersion: z.ZodString;
        requirements: z.ZodObject<{
            tools: z.ZodBoolean;
            stream: z.ZodBoolean;
            structuredOutput: z.ZodBoolean;
        }, z.core.$strict>;
        tiers: z.ZodRecord<z.ZodEnum<{
            standard: "standard";
            advanced: "advanced";
            reasoning: "reasoning";
        }>, z.ZodObject<{
            provider: z.ZodString;
            modelId: z.ZodString;
            protocol: z.ZodEnum<{
                responses: "responses";
                "chat-completions": "chat-completions";
                messages: "messages";
                "generate-content": "generate-content";
                embeddings: "embeddings";
                speech: "speech";
                transcriptions: "transcriptions";
                realtime: "realtime";
            }>;
            adapterId: z.ZodString;
        }, z.core.$strict>>;
        fallback: z.ZodObject<{
            provider: z.ZodString;
            modelId: z.ZodString;
            protocol: z.ZodEnum<{
                responses: "responses";
                "chat-completions": "chat-completions";
                messages: "messages";
                "generate-content": "generate-content";
                embeddings: "embeddings";
                speech: "speech";
                transcriptions: "transcriptions";
                realtime: "realtime";
            }>;
            adapterId: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>]>;
}, z.core.$strict>;
/** Source-neutral metadata: the store resolves this declared source and verifies its current version. */
export declare const AgentModelSourceSchema: z.ZodObject<{
    identity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>;
    sourceVersion: z.ZodNumber;
}, z.core.$strict>;
export type AgentModelSource = z.infer<typeof AgentModelSourceSchema>;
/** Custom remains custom even when its descriptor equals the source's descriptor. */
export declare const AgentModelBindingSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    slotId: z.ZodString;
    origin: z.ZodLiteral<"master">;
    source: z.ZodObject<{
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        sourceVersion: z.ZodNumber;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    slotId: z.ZodString;
    origin: z.ZodLiteral<"custom">;
    source: z.ZodOptional<z.ZodNever>;
}, z.core.$strict>], "origin">;
export type AgentModelBinding = z.infer<typeof AgentModelBindingSchema>;
/** One explicit binding per selection; scope is declared authority, never provider credentials. */
export declare const AgentModelsProvenanceSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    bindings: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        slotId: z.ZodString;
        origin: z.ZodLiteral<"master">;
        source: z.ZodObject<{
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodNumber;
            }, z.core.$strict>;
            sourceVersion: z.ZodNumber;
        }, z.core.$strict>;
    }, z.core.$strict>, z.ZodObject<{
        slotId: z.ZodString;
        origin: z.ZodLiteral<"custom">;
        source: z.ZodOptional<z.ZodNever>;
    }, z.core.$strict>], "origin">>;
}, z.core.$strict>;
export type AgentModelsProvenance = z.infer<typeof AgentModelsProvenanceSchema>;
export declare const AgentModelsConfigurationSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    identity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>;
    configVersion: z.ZodNumber;
    selections: z.ZodArray<z.ZodObject<{
        slotId: z.ZodString;
        settings: z.ZodUnion<readonly [z.ZodObject<{
            mode: z.ZodLiteral<"automatic">;
            capability: z.ZodString;
            function: z.ZodEnum<{
                reasoning: "reasoning";
                "memory-extraction": "memory-extraction";
                embedding: "embedding";
                tts: "tts";
                transcription: "transcription";
                voice: "voice";
            }>;
            catalogVersion: z.ZodString;
            requirements: z.ZodObject<{
                tools: z.ZodBoolean;
                stream: z.ZodBoolean;
                structuredOutput: z.ZodBoolean;
            }, z.core.$strict>;
            tiers: z.ZodRecord<z.ZodEnum<{
                standard: "standard";
                advanced: "advanced";
                reasoning: "reasoning";
            }>, z.ZodObject<{
                provider: z.ZodString;
                modelId: z.ZodString;
                protocol: z.ZodEnum<{
                    responses: "responses";
                    "chat-completions": "chat-completions";
                    messages: "messages";
                    "generate-content": "generate-content";
                    embeddings: "embeddings";
                    speech: "speech";
                    transcriptions: "transcriptions";
                    realtime: "realtime";
                }>;
                adapterId: z.ZodString;
            }, z.core.$strict>>;
            fallback: z.ZodObject<{
                provider: z.ZodString;
                modelId: z.ZodString;
                protocol: z.ZodEnum<{
                    responses: "responses";
                    "chat-completions": "chat-completions";
                    messages: "messages";
                    "generate-content": "generate-content";
                    embeddings: "embeddings";
                    speech: "speech";
                    transcriptions: "transcriptions";
                    realtime: "realtime";
                }>;
                adapterId: z.ZodString;
            }, z.core.$strict>;
        }, z.core.$strict>, z.ZodObject<{
            mode: z.ZodLiteral<"pin">;
            pin: z.ZodObject<{
                provider: z.ZodString;
                modelId: z.ZodString;
                protocol: z.ZodEnum<{
                    responses: "responses";
                    "chat-completions": "chat-completions";
                    messages: "messages";
                    "generate-content": "generate-content";
                    embeddings: "embeddings";
                    speech: "speech";
                    transcriptions: "transcriptions";
                    realtime: "realtime";
                }>;
                adapterId: z.ZodString;
            }, z.core.$strict>;
            capability: z.ZodString;
            function: z.ZodEnum<{
                reasoning: "reasoning";
                "memory-extraction": "memory-extraction";
                embedding: "embedding";
                tts: "tts";
                transcription: "transcription";
                voice: "voice";
            }>;
            catalogVersion: z.ZodString;
            requirements: z.ZodObject<{
                tools: z.ZodBoolean;
                stream: z.ZodBoolean;
                structuredOutput: z.ZodBoolean;
            }, z.core.$strict>;
            tiers: z.ZodRecord<z.ZodEnum<{
                standard: "standard";
                advanced: "advanced";
                reasoning: "reasoning";
            }>, z.ZodObject<{
                provider: z.ZodString;
                modelId: z.ZodString;
                protocol: z.ZodEnum<{
                    responses: "responses";
                    "chat-completions": "chat-completions";
                    messages: "messages";
                    "generate-content": "generate-content";
                    embeddings: "embeddings";
                    speech: "speech";
                    transcriptions: "transcriptions";
                    realtime: "realtime";
                }>;
                adapterId: z.ZodString;
            }, z.core.$strict>>;
            fallback: z.ZodObject<{
                provider: z.ZodString;
                modelId: z.ZodString;
                protocol: z.ZodEnum<{
                    responses: "responses";
                    "chat-completions": "chat-completions";
                    messages: "messages";
                    "generate-content": "generate-content";
                    embeddings: "embeddings";
                    speech: "speech";
                    transcriptions: "transcriptions";
                    realtime: "realtime";
                }>;
                adapterId: z.ZodString;
            }, z.core.$strict>;
        }, z.core.$strict>]>;
    }, z.core.$strict>>;
    provenance: z.ZodOptional<z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        bindings: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            slotId: z.ZodString;
            origin: z.ZodLiteral<"master">;
            source: z.ZodObject<{
                identity: z.ZodObject<{
                    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    vaultAgentId: z.ZodNumber;
                }, z.core.$strict>;
                sourceVersion: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>, z.ZodObject<{
            slotId: z.ZodString;
            origin: z.ZodLiteral<"custom">;
            source: z.ZodOptional<z.ZodNever>;
        }, z.core.$strict>], "origin">>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type AgentModelsConfiguration = z.infer<typeof AgentModelsConfigurationSchema>;
/** Modern store/writer boundary: provenance and all three identifiers are mandatory. */
export declare const AgentModelsConfigurationWithProvenanceSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    configVersion: z.ZodNumber;
    selections: z.ZodArray<z.ZodObject<{
        slotId: z.ZodString;
        settings: z.ZodUnion<readonly [z.ZodObject<{
            mode: z.ZodLiteral<"automatic">;
            capability: z.ZodString;
            function: z.ZodEnum<{
                reasoning: "reasoning";
                "memory-extraction": "memory-extraction";
                embedding: "embedding";
                tts: "tts";
                transcription: "transcription";
                voice: "voice";
            }>;
            catalogVersion: z.ZodString;
            requirements: z.ZodObject<{
                tools: z.ZodBoolean;
                stream: z.ZodBoolean;
                structuredOutput: z.ZodBoolean;
            }, z.core.$strict>;
            tiers: z.ZodRecord<z.ZodEnum<{
                standard: "standard";
                advanced: "advanced";
                reasoning: "reasoning";
            }>, z.ZodObject<{
                provider: z.ZodString;
                modelId: z.ZodString;
                protocol: z.ZodEnum<{
                    responses: "responses";
                    "chat-completions": "chat-completions";
                    messages: "messages";
                    "generate-content": "generate-content";
                    embeddings: "embeddings";
                    speech: "speech";
                    transcriptions: "transcriptions";
                    realtime: "realtime";
                }>;
                adapterId: z.ZodString;
            }, z.core.$strict>>;
            fallback: z.ZodObject<{
                provider: z.ZodString;
                modelId: z.ZodString;
                protocol: z.ZodEnum<{
                    responses: "responses";
                    "chat-completions": "chat-completions";
                    messages: "messages";
                    "generate-content": "generate-content";
                    embeddings: "embeddings";
                    speech: "speech";
                    transcriptions: "transcriptions";
                    realtime: "realtime";
                }>;
                adapterId: z.ZodString;
            }, z.core.$strict>;
        }, z.core.$strict>, z.ZodObject<{
            mode: z.ZodLiteral<"pin">;
            pin: z.ZodObject<{
                provider: z.ZodString;
                modelId: z.ZodString;
                protocol: z.ZodEnum<{
                    responses: "responses";
                    "chat-completions": "chat-completions";
                    messages: "messages";
                    "generate-content": "generate-content";
                    embeddings: "embeddings";
                    speech: "speech";
                    transcriptions: "transcriptions";
                    realtime: "realtime";
                }>;
                adapterId: z.ZodString;
            }, z.core.$strict>;
            capability: z.ZodString;
            function: z.ZodEnum<{
                reasoning: "reasoning";
                "memory-extraction": "memory-extraction";
                embedding: "embedding";
                tts: "tts";
                transcription: "transcription";
                voice: "voice";
            }>;
            catalogVersion: z.ZodString;
            requirements: z.ZodObject<{
                tools: z.ZodBoolean;
                stream: z.ZodBoolean;
                structuredOutput: z.ZodBoolean;
            }, z.core.$strict>;
            tiers: z.ZodRecord<z.ZodEnum<{
                standard: "standard";
                advanced: "advanced";
                reasoning: "reasoning";
            }>, z.ZodObject<{
                provider: z.ZodString;
                modelId: z.ZodString;
                protocol: z.ZodEnum<{
                    responses: "responses";
                    "chat-completions": "chat-completions";
                    messages: "messages";
                    "generate-content": "generate-content";
                    embeddings: "embeddings";
                    speech: "speech";
                    transcriptions: "transcriptions";
                    realtime: "realtime";
                }>;
                adapterId: z.ZodString;
            }, z.core.$strict>>;
            fallback: z.ZodObject<{
                provider: z.ZodString;
                modelId: z.ZodString;
                protocol: z.ZodEnum<{
                    responses: "responses";
                    "chat-completions": "chat-completions";
                    messages: "messages";
                    "generate-content": "generate-content";
                    embeddings: "embeddings";
                    speech: "speech";
                    transcriptions: "transcriptions";
                    realtime: "realtime";
                }>;
                adapterId: z.ZodString;
            }, z.core.$strict>;
        }, z.core.$strict>]>;
    }, z.core.$strict>>;
    identity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>;
    provenance: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        bindings: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            slotId: z.ZodString;
            origin: z.ZodLiteral<"master">;
            source: z.ZodObject<{
                identity: z.ZodObject<{
                    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    vaultAgentId: z.ZodNumber;
                }, z.core.$strict>;
                sourceVersion: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>, z.ZodObject<{
            slotId: z.ZodString;
            origin: z.ZodLiteral<"custom">;
            source: z.ZodOptional<z.ZodNever>;
        }, z.core.$strict>], "origin">>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type AgentModelsConfigurationWithProvenance = z.infer<typeof AgentModelsConfigurationWithProvenanceSchema>;
export type AgentModelsConfigurationWithProvenanceInput = z.input<typeof AgentModelsConfigurationWithProvenanceSchema>;
/** Parsing returns detached metadata and supplies no source, binding or model defaults. */
export declare function createAgentModelsConfigurationWithProvenance(input: AgentModelsConfigurationWithProvenanceInput): AgentModelsConfigurationWithProvenance;
/** Compare the canonical mapping, including the optional Vault numeric identity. */
export declare function sameModelAgentIdentity(left: AgentRuntimeIdentity, right: AgentRuntimeIdentity): boolean;
/** Explicit, validated models are authoritative; malformed/null values never fall back to legacy llmConfig. */
export declare const AgentContextWithModelsSchema: z.ZodObject<{
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    credentials: z.ZodObject<{
        OPENAI_API_KEY: z.ZodOptional<z.ZodString>;
        ANTHROPIC_API_KEY: z.ZodOptional<z.ZodString>;
        GOOGLE_API_KEY: z.ZodOptional<z.ZodString>;
        AGENT_CHAT_MODEL: z.ZodOptional<z.ZodString>;
        TELEGRAM_BOT_TOKEN: z.ZodOptional<z.ZodString>;
        ELEVENLABS_API_KEY: z.ZodOptional<z.ZodString>;
        ELEVENLABS_VOICE_ID: z.ZodOptional<z.ZodString>;
        ELEVENLABS_MODEL_ID: z.ZodOptional<z.ZodString>;
        TTS_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_TTS_MODEL: z.ZodOptional<z.ZodString>;
        OPENAI_TTS_VOICE: z.ZodOptional<z.ZodString>;
        STT_PRIMARY_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_STT_MODEL: z.ZodOptional<z.ZodString>;
        VOICE_CALL_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_LIVE_VOICE: z.ZodOptional<z.ZodString>;
        OPENAI_LIVE_BACKEND_MODEL: z.ZodOptional<z.ZodString>;
        TELNYX_API_KEY: z.ZodOptional<z.ZodString>;
        TELNYX_CONNECTION_ID: z.ZodOptional<z.ZodString>;
        TELNYX_FROM_NUMBER: z.ZodOptional<z.ZodString>;
        TELNYX_PUBLIC_KEY: z.ZodOptional<z.ZodString>;
        LIVE_WEB_AUTH_TOKEN: z.ZodOptional<z.ZodString>;
        QDRANT_API_KEY: z.ZodOptional<z.ZodString>;
        ELEVENLABS_MINDFULNESS_AGENT_ID: z.ZodOptional<z.ZodString>;
        FORGE_VOICE_REGISTER_TOKEN: z.ZodOptional<z.ZodString>;
        AGENTMAIL_API_KEY: z.ZodOptional<z.ZodString>;
        AGENTMAIL_INBOX_ID: z.ZodOptional<z.ZodString>;
        AGENT_EMAIL: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_CLIENT_ID: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_CLIENT_ID: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_CLIENT_ID: z.ZodOptional<z.ZodString>;
        NETATMO_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        NETATMO_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_ACCESS_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_PASSWORD: z.ZodOptional<z.ZodString>;
        INTERNAL_SECRET: z.ZodOptional<z.ZodString>;
        X9_INTERNAL_SECRET: z.ZodOptional<z.ZodString>;
    }, z.core.$catchall<z.ZodString>>;
    llmConfig: z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
    }, z.core.$strip>;
    telegramAllowFrom: z.ZodArray<z.ZodString>;
    inboundForwardUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    tenantId: z.ZodOptional<z.ZodString>;
    workspacePath: z.ZodString;
    registryPath: z.ZodString;
    telegramBotToken: z.ZodOptional<z.ZodString>;
    displayName: z.ZodString;
    configVersion: z.ZodOptional<z.ZodNumber>;
    modelConfiguration: z.ZodOptional<z.ZodObject<{
        schemaVersion: z.ZodLiteral<1>;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strict>;
        configVersion: z.ZodNumber;
        selections: z.ZodArray<z.ZodObject<{
            slotId: z.ZodString;
            settings: z.ZodUnion<readonly [z.ZodObject<{
                mode: z.ZodLiteral<"automatic">;
                capability: z.ZodString;
                function: z.ZodEnum<{
                    reasoning: "reasoning";
                    "memory-extraction": "memory-extraction";
                    embedding: "embedding";
                    tts: "tts";
                    transcription: "transcription";
                    voice: "voice";
                }>;
                catalogVersion: z.ZodString;
                requirements: z.ZodObject<{
                    tools: z.ZodBoolean;
                    stream: z.ZodBoolean;
                    structuredOutput: z.ZodBoolean;
                }, z.core.$strict>;
                tiers: z.ZodRecord<z.ZodEnum<{
                    standard: "standard";
                    advanced: "advanced";
                    reasoning: "reasoning";
                }>, z.ZodObject<{
                    provider: z.ZodString;
                    modelId: z.ZodString;
                    protocol: z.ZodEnum<{
                        responses: "responses";
                        "chat-completions": "chat-completions";
                        messages: "messages";
                        "generate-content": "generate-content";
                        embeddings: "embeddings";
                        speech: "speech";
                        transcriptions: "transcriptions";
                        realtime: "realtime";
                    }>;
                    adapterId: z.ZodString;
                }, z.core.$strict>>;
                fallback: z.ZodObject<{
                    provider: z.ZodString;
                    modelId: z.ZodString;
                    protocol: z.ZodEnum<{
                        responses: "responses";
                        "chat-completions": "chat-completions";
                        messages: "messages";
                        "generate-content": "generate-content";
                        embeddings: "embeddings";
                        speech: "speech";
                        transcriptions: "transcriptions";
                        realtime: "realtime";
                    }>;
                    adapterId: z.ZodString;
                }, z.core.$strict>;
            }, z.core.$strict>, z.ZodObject<{
                mode: z.ZodLiteral<"pin">;
                pin: z.ZodObject<{
                    provider: z.ZodString;
                    modelId: z.ZodString;
                    protocol: z.ZodEnum<{
                        responses: "responses";
                        "chat-completions": "chat-completions";
                        messages: "messages";
                        "generate-content": "generate-content";
                        embeddings: "embeddings";
                        speech: "speech";
                        transcriptions: "transcriptions";
                        realtime: "realtime";
                    }>;
                    adapterId: z.ZodString;
                }, z.core.$strict>;
                capability: z.ZodString;
                function: z.ZodEnum<{
                    reasoning: "reasoning";
                    "memory-extraction": "memory-extraction";
                    embedding: "embedding";
                    tts: "tts";
                    transcription: "transcription";
                    voice: "voice";
                }>;
                catalogVersion: z.ZodString;
                requirements: z.ZodObject<{
                    tools: z.ZodBoolean;
                    stream: z.ZodBoolean;
                    structuredOutput: z.ZodBoolean;
                }, z.core.$strict>;
                tiers: z.ZodRecord<z.ZodEnum<{
                    standard: "standard";
                    advanced: "advanced";
                    reasoning: "reasoning";
                }>, z.ZodObject<{
                    provider: z.ZodString;
                    modelId: z.ZodString;
                    protocol: z.ZodEnum<{
                        responses: "responses";
                        "chat-completions": "chat-completions";
                        messages: "messages";
                        "generate-content": "generate-content";
                        embeddings: "embeddings";
                        speech: "speech";
                        transcriptions: "transcriptions";
                        realtime: "realtime";
                    }>;
                    adapterId: z.ZodString;
                }, z.core.$strict>>;
                fallback: z.ZodObject<{
                    provider: z.ZodString;
                    modelId: z.ZodString;
                    protocol: z.ZodEnum<{
                        responses: "responses";
                        "chat-completions": "chat-completions";
                        messages: "messages";
                        "generate-content": "generate-content";
                        embeddings: "embeddings";
                        speech: "speech";
                        transcriptions: "transcriptions";
                        realtime: "realtime";
                    }>;
                    adapterId: z.ZodString;
                }, z.core.$strict>;
            }, z.core.$strict>]>;
        }, z.core.$strict>>;
        provenance: z.ZodOptional<z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            bindings: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                slotId: z.ZodString;
                origin: z.ZodLiteral<"master">;
                source: z.ZodObject<{
                    identity: z.ZodObject<{
                        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                        vaultAgentId: z.ZodNumber;
                    }, z.core.$strict>;
                    sourceVersion: z.ZodNumber;
                }, z.core.$strict>;
            }, z.core.$strict>, z.ZodObject<{
                slotId: z.ZodString;
                origin: z.ZodLiteral<"custom">;
                source: z.ZodOptional<z.ZodNever>;
            }, z.core.$strict>], "origin">>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$loose>;
export declare const AgentContextWithModelsWriteSchema: z.ZodObject<{
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    credentials: z.ZodObject<{
        OPENAI_API_KEY: z.ZodOptional<z.ZodString>;
        ANTHROPIC_API_KEY: z.ZodOptional<z.ZodString>;
        GOOGLE_API_KEY: z.ZodOptional<z.ZodString>;
        AGENT_CHAT_MODEL: z.ZodOptional<z.ZodString>;
        TELEGRAM_BOT_TOKEN: z.ZodOptional<z.ZodString>;
        ELEVENLABS_API_KEY: z.ZodOptional<z.ZodString>;
        ELEVENLABS_VOICE_ID: z.ZodOptional<z.ZodString>;
        ELEVENLABS_MODEL_ID: z.ZodOptional<z.ZodString>;
        TTS_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_TTS_MODEL: z.ZodOptional<z.ZodString>;
        OPENAI_TTS_VOICE: z.ZodOptional<z.ZodString>;
        STT_PRIMARY_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_STT_MODEL: z.ZodOptional<z.ZodString>;
        VOICE_CALL_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_LIVE_VOICE: z.ZodOptional<z.ZodString>;
        OPENAI_LIVE_BACKEND_MODEL: z.ZodOptional<z.ZodString>;
        TELNYX_API_KEY: z.ZodOptional<z.ZodString>;
        TELNYX_CONNECTION_ID: z.ZodOptional<z.ZodString>;
        TELNYX_FROM_NUMBER: z.ZodOptional<z.ZodString>;
        TELNYX_PUBLIC_KEY: z.ZodOptional<z.ZodString>;
        LIVE_WEB_AUTH_TOKEN: z.ZodOptional<z.ZodString>;
        QDRANT_API_KEY: z.ZodOptional<z.ZodString>;
        ELEVENLABS_MINDFULNESS_AGENT_ID: z.ZodOptional<z.ZodString>;
        FORGE_VOICE_REGISTER_TOKEN: z.ZodOptional<z.ZodString>;
        AGENTMAIL_API_KEY: z.ZodOptional<z.ZodString>;
        AGENTMAIL_INBOX_ID: z.ZodOptional<z.ZodString>;
        AGENT_EMAIL: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_CLIENT_ID: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_CLIENT_ID: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_CLIENT_ID: z.ZodOptional<z.ZodString>;
        NETATMO_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        NETATMO_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_ACCESS_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_PASSWORD: z.ZodOptional<z.ZodString>;
        INTERNAL_SECRET: z.ZodOptional<z.ZodString>;
        X9_INTERNAL_SECRET: z.ZodOptional<z.ZodString>;
    }, z.core.$catchall<z.ZodString>>;
    llmConfig: z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
    }, z.core.$strip>;
    telegramAllowFrom: z.ZodArray<z.ZodString>;
    inboundForwardUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    tenantId: z.ZodOptional<z.ZodString>;
    workspacePath: z.ZodString;
    registryPath: z.ZodString;
    telegramBotToken: z.ZodOptional<z.ZodString>;
    displayName: z.ZodString;
    configVersion: z.ZodOptional<z.ZodNumber>;
    modelConfiguration: z.ZodOptional<z.ZodObject<{
        schemaVersion: z.ZodLiteral<1>;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strict>;
        configVersion: z.ZodNumber;
        selections: z.ZodArray<z.ZodObject<{
            slotId: z.ZodString;
            settings: z.ZodUnion<readonly [z.ZodObject<{
                mode: z.ZodLiteral<"automatic">;
                capability: z.ZodString;
                function: z.ZodEnum<{
                    reasoning: "reasoning";
                    "memory-extraction": "memory-extraction";
                    embedding: "embedding";
                    tts: "tts";
                    transcription: "transcription";
                    voice: "voice";
                }>;
                catalogVersion: z.ZodString;
                requirements: z.ZodObject<{
                    tools: z.ZodBoolean;
                    stream: z.ZodBoolean;
                    structuredOutput: z.ZodBoolean;
                }, z.core.$strict>;
                tiers: z.ZodRecord<z.ZodEnum<{
                    standard: "standard";
                    advanced: "advanced";
                    reasoning: "reasoning";
                }>, z.ZodObject<{
                    provider: z.ZodString;
                    modelId: z.ZodString;
                    protocol: z.ZodEnum<{
                        responses: "responses";
                        "chat-completions": "chat-completions";
                        messages: "messages";
                        "generate-content": "generate-content";
                        embeddings: "embeddings";
                        speech: "speech";
                        transcriptions: "transcriptions";
                        realtime: "realtime";
                    }>;
                    adapterId: z.ZodString;
                }, z.core.$strict>>;
                fallback: z.ZodObject<{
                    provider: z.ZodString;
                    modelId: z.ZodString;
                    protocol: z.ZodEnum<{
                        responses: "responses";
                        "chat-completions": "chat-completions";
                        messages: "messages";
                        "generate-content": "generate-content";
                        embeddings: "embeddings";
                        speech: "speech";
                        transcriptions: "transcriptions";
                        realtime: "realtime";
                    }>;
                    adapterId: z.ZodString;
                }, z.core.$strict>;
            }, z.core.$strict>, z.ZodObject<{
                mode: z.ZodLiteral<"pin">;
                pin: z.ZodObject<{
                    provider: z.ZodString;
                    modelId: z.ZodString;
                    protocol: z.ZodEnum<{
                        responses: "responses";
                        "chat-completions": "chat-completions";
                        messages: "messages";
                        "generate-content": "generate-content";
                        embeddings: "embeddings";
                        speech: "speech";
                        transcriptions: "transcriptions";
                        realtime: "realtime";
                    }>;
                    adapterId: z.ZodString;
                }, z.core.$strict>;
                capability: z.ZodString;
                function: z.ZodEnum<{
                    reasoning: "reasoning";
                    "memory-extraction": "memory-extraction";
                    embedding: "embedding";
                    tts: "tts";
                    transcription: "transcription";
                    voice: "voice";
                }>;
                catalogVersion: z.ZodString;
                requirements: z.ZodObject<{
                    tools: z.ZodBoolean;
                    stream: z.ZodBoolean;
                    structuredOutput: z.ZodBoolean;
                }, z.core.$strict>;
                tiers: z.ZodRecord<z.ZodEnum<{
                    standard: "standard";
                    advanced: "advanced";
                    reasoning: "reasoning";
                }>, z.ZodObject<{
                    provider: z.ZodString;
                    modelId: z.ZodString;
                    protocol: z.ZodEnum<{
                        responses: "responses";
                        "chat-completions": "chat-completions";
                        messages: "messages";
                        "generate-content": "generate-content";
                        embeddings: "embeddings";
                        speech: "speech";
                        transcriptions: "transcriptions";
                        realtime: "realtime";
                    }>;
                    adapterId: z.ZodString;
                }, z.core.$strict>>;
                fallback: z.ZodObject<{
                    provider: z.ZodString;
                    modelId: z.ZodString;
                    protocol: z.ZodEnum<{
                        responses: "responses";
                        "chat-completions": "chat-completions";
                        messages: "messages";
                        "generate-content": "generate-content";
                        embeddings: "embeddings";
                        speech: "speech";
                        transcriptions: "transcriptions";
                        realtime: "realtime";
                    }>;
                    adapterId: z.ZodString;
                }, z.core.$strict>;
            }, z.core.$strict>]>;
        }, z.core.$strict>>;
        provenance: z.ZodOptional<z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            bindings: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                slotId: z.ZodString;
                origin: z.ZodLiteral<"master">;
                source: z.ZodObject<{
                    identity: z.ZodObject<{
                        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                        vaultAgentId: z.ZodNumber;
                    }, z.core.$strict>;
                    sourceVersion: z.ZodNumber;
                }, z.core.$strict>;
            }, z.core.$strict>, z.ZodObject<{
                slotId: z.ZodString;
                origin: z.ZodLiteral<"custom">;
                source: z.ZodOptional<z.ZodNever>;
            }, z.core.$strict>], "origin">>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$loose>;
export type AgentContextWithModels = z.infer<typeof AgentContextWithModelsSchema>;
/** Complete identity/channel guards plus mandatory, scoped model provenance. */
export declare const AgentContextWithModelProvenanceSchema: z.ZodIntersection<z.ZodDiscriminatedUnion<[z.ZodObject<{
    credentials: z.ZodObject<{
        OPENAI_API_KEY: z.ZodOptional<z.ZodString>;
        ANTHROPIC_API_KEY: z.ZodOptional<z.ZodString>;
        GOOGLE_API_KEY: z.ZodOptional<z.ZodString>;
        AGENT_CHAT_MODEL: z.ZodOptional<z.ZodString>;
        TELEGRAM_BOT_TOKEN: z.ZodOptional<z.ZodString>;
        ELEVENLABS_API_KEY: z.ZodOptional<z.ZodString>;
        ELEVENLABS_VOICE_ID: z.ZodOptional<z.ZodString>;
        ELEVENLABS_MODEL_ID: z.ZodOptional<z.ZodString>;
        TTS_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_TTS_MODEL: z.ZodOptional<z.ZodString>;
        OPENAI_TTS_VOICE: z.ZodOptional<z.ZodString>;
        STT_PRIMARY_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_STT_MODEL: z.ZodOptional<z.ZodString>;
        VOICE_CALL_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_LIVE_VOICE: z.ZodOptional<z.ZodString>;
        OPENAI_LIVE_BACKEND_MODEL: z.ZodOptional<z.ZodString>;
        TELNYX_API_KEY: z.ZodOptional<z.ZodString>;
        TELNYX_CONNECTION_ID: z.ZodOptional<z.ZodString>;
        TELNYX_FROM_NUMBER: z.ZodOptional<z.ZodString>;
        TELNYX_PUBLIC_KEY: z.ZodOptional<z.ZodString>;
        LIVE_WEB_AUTH_TOKEN: z.ZodOptional<z.ZodString>;
        QDRANT_API_KEY: z.ZodOptional<z.ZodString>;
        ELEVENLABS_MINDFULNESS_AGENT_ID: z.ZodOptional<z.ZodString>;
        FORGE_VOICE_REGISTER_TOKEN: z.ZodOptional<z.ZodString>;
        AGENTMAIL_API_KEY: z.ZodOptional<z.ZodString>;
        AGENTMAIL_INBOX_ID: z.ZodOptional<z.ZodString>;
        AGENT_EMAIL: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_CLIENT_ID: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_CLIENT_ID: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_CLIENT_ID: z.ZodOptional<z.ZodString>;
        NETATMO_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        NETATMO_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_ACCESS_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_PASSWORD: z.ZodOptional<z.ZodString>;
        INTERNAL_SECRET: z.ZodOptional<z.ZodString>;
        X9_INTERNAL_SECRET: z.ZodOptional<z.ZodString>;
    }, z.core.$catchall<z.ZodString>>;
    llmConfig: z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
    }, z.core.$strip>;
    telegramAllowFrom: z.ZodArray<z.ZodString>;
    inboundForwardUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    workspacePath: z.ZodString;
    registryPath: z.ZodString;
    telegramBotToken: z.ZodOptional<z.ZodString>;
    displayName: z.ZodString;
    configVersion: z.ZodOptional<z.ZodNumber>;
    channelConfigurations: z.ZodOptional<z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            email: "email";
            telegram: "telegram";
        }>;
        desired: z.ZodObject<{
            version: z.ZodNumber;
            state: z.ZodEnum<{
                active: "active";
                paused: "paused";
            }>;
        }, z.core.$strict>;
        access: z.ZodOptional<z.ZodObject<{
            desiredPolicy: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"telegram">;
                mode: z.ZodEnum<{
                    "approved-chats": "approved-chats";
                    anyone: "anyone";
                }>;
                chats: z.ZodArray<z.ZodObject<{
                    chatId: z.ZodString;
                    type: z.ZodEnum<{
                        group: "group";
                        private: "private";
                        supergroup: "supergroup";
                    }>;
                    name: z.ZodString;
                    admittedAt: z.ZodISODateTime;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"email">;
                mode: z.ZodEnum<{
                    anyone: "anyone";
                    "address-book": "address-book";
                }>;
            }, z.core.$strict>], "kind">;
            appliedPolicy: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"telegram">;
                mode: z.ZodEnum<{
                    "approved-chats": "approved-chats";
                    anyone: "anyone";
                }>;
                chats: z.ZodArray<z.ZodObject<{
                    chatId: z.ZodString;
                    type: z.ZodEnum<{
                        group: "group";
                        private: "private";
                        supergroup: "supergroup";
                    }>;
                    name: z.ZodString;
                    admittedAt: z.ZodISODateTime;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"email">;
                mode: z.ZodEnum<{
                    anyone: "anyone";
                    "address-book": "address-book";
                }>;
            }, z.core.$strict>], "kind">>;
        }, z.core.$strict>>;
        applied: z.ZodNullable<z.ZodObject<{
            version: z.ZodNumber;
            state: z.ZodEnum<{
                active: "active";
                paused: "paused";
            }>;
        }, z.core.$strict>>;
        resource: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodEnum<{
                telegram: "telegram";
            }>;
            resource: z.ZodObject<{
                agent_id: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                bot_username: z.ZodString;
                created_at: z.ZodString;
            }, z.core.$strict>;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodEnum<{
                email: "email";
            }>;
            resource: z.ZodObject<{
                agent_id: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                provider_inbox_id: z.ZodString;
                address: z.ZodString;
                display_name: z.ZodNullable<z.ZodString>;
                created_at: z.ZodString;
            }, z.core.$strict>;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
        }, z.core.$strict>], "kind">>;
        observation: z.ZodNullable<z.ZodObject<{
            channelId: z.ZodString;
            kind: z.ZodUnion<[z.ZodEnum<{
                email: "email";
                voice: "voice";
                telegram: "telegram";
                whatsapp: "whatsapp";
            }>, z.ZodLiteral<"web">]>;
            state: z.ZodEnum<{
                error: "error";
                unknown: "unknown";
                stopped: "stopped";
                loaded: "loaded";
                paused: "paused";
            }>;
            loaded: z.ZodNullable<z.ZodBoolean>;
            readiness: z.ZodEnum<{
                unknown: "unknown";
                ready: "ready";
                "not-ready": "not-ready";
            }>;
            botUsername: z.ZodOptional<z.ZodString>;
            allowFromCount: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        observedAt: z.ZodNullable<z.ZodISODateTime>;
        error: z.ZodNullable<z.ZodObject<{
            code: z.ZodEnum<{
                source_unavailable: "source_unavailable";
                resource_missing: "resource_missing";
                resource_conflict: "resource_conflict";
                provider_unavailable: "provider_unavailable";
                provider_rejected: "provider_rejected";
                account_blocked: "account_blocked";
                load_failed: "load_failed";
                apply_failed: "apply_failed";
                reconcile_pending: "reconcile_pending";
                first_check_failed: "first_check_failed";
            }>;
            retryable: z.ZodBoolean;
        }, z.core.$strict>>;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
    }, z.core.$strict>>>;
    voiceConfiguration: z.ZodOptional<z.ZodObject<{
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
    }, z.core.$strip>>;
    scopePolicy: z.ZodOptional<z.ZodObject<{
        version: z.ZodNumber;
        defaultWebSearch: z.ZodBoolean;
        scopeLimited: z.ZodBoolean;
        purpose: z.ZodOptional<z.ZodString>;
        defaults: z.ZodObject<{
            read: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                deny: "deny";
            }>;
            write: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                deny: "deny";
            }>;
        }, z.core.$strict>;
        rules: z.ZodArray<z.ZodObject<{
            capability: z.ZodString;
            tool: z.ZodOptional<z.ZodString>;
            read: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                deny: "deny";
            }>;
            write: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                deny: "deny";
            }>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    tenantId: z.ZodString;
    identity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>;
    role: z.ZodLiteral<"master">;
    masterAgentId: z.ZodOptional<z.ZodNever>;
}, z.core.$loose>, z.ZodObject<{
    credentials: z.ZodObject<{
        OPENAI_API_KEY: z.ZodOptional<z.ZodString>;
        ANTHROPIC_API_KEY: z.ZodOptional<z.ZodString>;
        GOOGLE_API_KEY: z.ZodOptional<z.ZodString>;
        AGENT_CHAT_MODEL: z.ZodOptional<z.ZodString>;
        TELEGRAM_BOT_TOKEN: z.ZodOptional<z.ZodString>;
        ELEVENLABS_API_KEY: z.ZodOptional<z.ZodString>;
        ELEVENLABS_VOICE_ID: z.ZodOptional<z.ZodString>;
        ELEVENLABS_MODEL_ID: z.ZodOptional<z.ZodString>;
        TTS_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_TTS_MODEL: z.ZodOptional<z.ZodString>;
        OPENAI_TTS_VOICE: z.ZodOptional<z.ZodString>;
        STT_PRIMARY_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_STT_MODEL: z.ZodOptional<z.ZodString>;
        VOICE_CALL_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_LIVE_VOICE: z.ZodOptional<z.ZodString>;
        OPENAI_LIVE_BACKEND_MODEL: z.ZodOptional<z.ZodString>;
        TELNYX_API_KEY: z.ZodOptional<z.ZodString>;
        TELNYX_CONNECTION_ID: z.ZodOptional<z.ZodString>;
        TELNYX_FROM_NUMBER: z.ZodOptional<z.ZodString>;
        TELNYX_PUBLIC_KEY: z.ZodOptional<z.ZodString>;
        LIVE_WEB_AUTH_TOKEN: z.ZodOptional<z.ZodString>;
        QDRANT_API_KEY: z.ZodOptional<z.ZodString>;
        ELEVENLABS_MINDFULNESS_AGENT_ID: z.ZodOptional<z.ZodString>;
        FORGE_VOICE_REGISTER_TOKEN: z.ZodOptional<z.ZodString>;
        AGENTMAIL_API_KEY: z.ZodOptional<z.ZodString>;
        AGENTMAIL_INBOX_ID: z.ZodOptional<z.ZodString>;
        AGENT_EMAIL: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_CLIENT_ID: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_CLIENT_ID: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_CLIENT_ID: z.ZodOptional<z.ZodString>;
        NETATMO_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        NETATMO_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_ACCESS_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_PASSWORD: z.ZodOptional<z.ZodString>;
        INTERNAL_SECRET: z.ZodOptional<z.ZodString>;
        X9_INTERNAL_SECRET: z.ZodOptional<z.ZodString>;
    }, z.core.$catchall<z.ZodString>>;
    llmConfig: z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
    }, z.core.$strip>;
    telegramAllowFrom: z.ZodArray<z.ZodString>;
    inboundForwardUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    workspacePath: z.ZodString;
    registryPath: z.ZodString;
    telegramBotToken: z.ZodOptional<z.ZodString>;
    displayName: z.ZodString;
    configVersion: z.ZodOptional<z.ZodNumber>;
    channelConfigurations: z.ZodOptional<z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            email: "email";
            telegram: "telegram";
        }>;
        desired: z.ZodObject<{
            version: z.ZodNumber;
            state: z.ZodEnum<{
                active: "active";
                paused: "paused";
            }>;
        }, z.core.$strict>;
        access: z.ZodOptional<z.ZodObject<{
            desiredPolicy: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"telegram">;
                mode: z.ZodEnum<{
                    "approved-chats": "approved-chats";
                    anyone: "anyone";
                }>;
                chats: z.ZodArray<z.ZodObject<{
                    chatId: z.ZodString;
                    type: z.ZodEnum<{
                        group: "group";
                        private: "private";
                        supergroup: "supergroup";
                    }>;
                    name: z.ZodString;
                    admittedAt: z.ZodISODateTime;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"email">;
                mode: z.ZodEnum<{
                    anyone: "anyone";
                    "address-book": "address-book";
                }>;
            }, z.core.$strict>], "kind">;
            appliedPolicy: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"telegram">;
                mode: z.ZodEnum<{
                    "approved-chats": "approved-chats";
                    anyone: "anyone";
                }>;
                chats: z.ZodArray<z.ZodObject<{
                    chatId: z.ZodString;
                    type: z.ZodEnum<{
                        group: "group";
                        private: "private";
                        supergroup: "supergroup";
                    }>;
                    name: z.ZodString;
                    admittedAt: z.ZodISODateTime;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"email">;
                mode: z.ZodEnum<{
                    anyone: "anyone";
                    "address-book": "address-book";
                }>;
            }, z.core.$strict>], "kind">>;
        }, z.core.$strict>>;
        applied: z.ZodNullable<z.ZodObject<{
            version: z.ZodNumber;
            state: z.ZodEnum<{
                active: "active";
                paused: "paused";
            }>;
        }, z.core.$strict>>;
        resource: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodEnum<{
                telegram: "telegram";
            }>;
            resource: z.ZodObject<{
                agent_id: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                bot_username: z.ZodString;
                created_at: z.ZodString;
            }, z.core.$strict>;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodEnum<{
                email: "email";
            }>;
            resource: z.ZodObject<{
                agent_id: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                provider_inbox_id: z.ZodString;
                address: z.ZodString;
                display_name: z.ZodNullable<z.ZodString>;
                created_at: z.ZodString;
            }, z.core.$strict>;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
        }, z.core.$strict>], "kind">>;
        observation: z.ZodNullable<z.ZodObject<{
            channelId: z.ZodString;
            kind: z.ZodUnion<[z.ZodEnum<{
                email: "email";
                voice: "voice";
                telegram: "telegram";
                whatsapp: "whatsapp";
            }>, z.ZodLiteral<"web">]>;
            state: z.ZodEnum<{
                error: "error";
                unknown: "unknown";
                stopped: "stopped";
                loaded: "loaded";
                paused: "paused";
            }>;
            loaded: z.ZodNullable<z.ZodBoolean>;
            readiness: z.ZodEnum<{
                unknown: "unknown";
                ready: "ready";
                "not-ready": "not-ready";
            }>;
            botUsername: z.ZodOptional<z.ZodString>;
            allowFromCount: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        observedAt: z.ZodNullable<z.ZodISODateTime>;
        error: z.ZodNullable<z.ZodObject<{
            code: z.ZodEnum<{
                source_unavailable: "source_unavailable";
                resource_missing: "resource_missing";
                resource_conflict: "resource_conflict";
                provider_unavailable: "provider_unavailable";
                provider_rejected: "provider_rejected";
                account_blocked: "account_blocked";
                load_failed: "load_failed";
                apply_failed: "apply_failed";
                reconcile_pending: "reconcile_pending";
                first_check_failed: "first_check_failed";
            }>;
            retryable: z.ZodBoolean;
        }, z.core.$strict>>;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
    }, z.core.$strict>>>;
    voiceConfiguration: z.ZodOptional<z.ZodObject<{
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
    }, z.core.$strip>>;
    scopePolicy: z.ZodOptional<z.ZodObject<{
        version: z.ZodNumber;
        defaultWebSearch: z.ZodBoolean;
        scopeLimited: z.ZodBoolean;
        purpose: z.ZodOptional<z.ZodString>;
        defaults: z.ZodObject<{
            read: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                deny: "deny";
            }>;
            write: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                deny: "deny";
            }>;
        }, z.core.$strict>;
        rules: z.ZodArray<z.ZodObject<{
            capability: z.ZodString;
            tool: z.ZodOptional<z.ZodString>;
            read: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                deny: "deny";
            }>;
            write: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                deny: "deny";
            }>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    tenantId: z.ZodString;
    identity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>;
    role: z.ZodLiteral<"erede">;
    masterAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
}, z.core.$loose>], "role">, z.ZodObject<{
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    credentials: z.ZodObject<{
        OPENAI_API_KEY: z.ZodOptional<z.ZodString>;
        ANTHROPIC_API_KEY: z.ZodOptional<z.ZodString>;
        GOOGLE_API_KEY: z.ZodOptional<z.ZodString>;
        AGENT_CHAT_MODEL: z.ZodOptional<z.ZodString>;
        TELEGRAM_BOT_TOKEN: z.ZodOptional<z.ZodString>;
        ELEVENLABS_API_KEY: z.ZodOptional<z.ZodString>;
        ELEVENLABS_VOICE_ID: z.ZodOptional<z.ZodString>;
        ELEVENLABS_MODEL_ID: z.ZodOptional<z.ZodString>;
        TTS_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_TTS_MODEL: z.ZodOptional<z.ZodString>;
        OPENAI_TTS_VOICE: z.ZodOptional<z.ZodString>;
        STT_PRIMARY_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_STT_MODEL: z.ZodOptional<z.ZodString>;
        VOICE_CALL_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_LIVE_VOICE: z.ZodOptional<z.ZodString>;
        OPENAI_LIVE_BACKEND_MODEL: z.ZodOptional<z.ZodString>;
        TELNYX_API_KEY: z.ZodOptional<z.ZodString>;
        TELNYX_CONNECTION_ID: z.ZodOptional<z.ZodString>;
        TELNYX_FROM_NUMBER: z.ZodOptional<z.ZodString>;
        TELNYX_PUBLIC_KEY: z.ZodOptional<z.ZodString>;
        LIVE_WEB_AUTH_TOKEN: z.ZodOptional<z.ZodString>;
        QDRANT_API_KEY: z.ZodOptional<z.ZodString>;
        ELEVENLABS_MINDFULNESS_AGENT_ID: z.ZodOptional<z.ZodString>;
        FORGE_VOICE_REGISTER_TOKEN: z.ZodOptional<z.ZodString>;
        AGENTMAIL_API_KEY: z.ZodOptional<z.ZodString>;
        AGENTMAIL_INBOX_ID: z.ZodOptional<z.ZodString>;
        AGENT_EMAIL: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_CLIENT_ID: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_CLIENT_ID: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_CLIENT_ID: z.ZodOptional<z.ZodString>;
        NETATMO_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        NETATMO_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_ACCESS_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_PASSWORD: z.ZodOptional<z.ZodString>;
        INTERNAL_SECRET: z.ZodOptional<z.ZodString>;
        X9_INTERNAL_SECRET: z.ZodOptional<z.ZodString>;
    }, z.core.$catchall<z.ZodString>>;
    llmConfig: z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
    }, z.core.$strip>;
    telegramAllowFrom: z.ZodArray<z.ZodString>;
    inboundForwardUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    tenantId: z.ZodOptional<z.ZodString>;
    workspacePath: z.ZodString;
    registryPath: z.ZodString;
    telegramBotToken: z.ZodOptional<z.ZodString>;
    displayName: z.ZodString;
    configVersion: z.ZodOptional<z.ZodNumber>;
    modelConfiguration: z.ZodObject<{
        schemaVersion: z.ZodLiteral<1>;
        configVersion: z.ZodNumber;
        selections: z.ZodArray<z.ZodObject<{
            slotId: z.ZodString;
            settings: z.ZodUnion<readonly [z.ZodObject<{
                mode: z.ZodLiteral<"automatic">;
                capability: z.ZodString;
                function: z.ZodEnum<{
                    reasoning: "reasoning";
                    "memory-extraction": "memory-extraction";
                    embedding: "embedding";
                    tts: "tts";
                    transcription: "transcription";
                    voice: "voice";
                }>;
                catalogVersion: z.ZodString;
                requirements: z.ZodObject<{
                    tools: z.ZodBoolean;
                    stream: z.ZodBoolean;
                    structuredOutput: z.ZodBoolean;
                }, z.core.$strict>;
                tiers: z.ZodRecord<z.ZodEnum<{
                    standard: "standard";
                    advanced: "advanced";
                    reasoning: "reasoning";
                }>, z.ZodObject<{
                    provider: z.ZodString;
                    modelId: z.ZodString;
                    protocol: z.ZodEnum<{
                        responses: "responses";
                        "chat-completions": "chat-completions";
                        messages: "messages";
                        "generate-content": "generate-content";
                        embeddings: "embeddings";
                        speech: "speech";
                        transcriptions: "transcriptions";
                        realtime: "realtime";
                    }>;
                    adapterId: z.ZodString;
                }, z.core.$strict>>;
                fallback: z.ZodObject<{
                    provider: z.ZodString;
                    modelId: z.ZodString;
                    protocol: z.ZodEnum<{
                        responses: "responses";
                        "chat-completions": "chat-completions";
                        messages: "messages";
                        "generate-content": "generate-content";
                        embeddings: "embeddings";
                        speech: "speech";
                        transcriptions: "transcriptions";
                        realtime: "realtime";
                    }>;
                    adapterId: z.ZodString;
                }, z.core.$strict>;
            }, z.core.$strict>, z.ZodObject<{
                mode: z.ZodLiteral<"pin">;
                pin: z.ZodObject<{
                    provider: z.ZodString;
                    modelId: z.ZodString;
                    protocol: z.ZodEnum<{
                        responses: "responses";
                        "chat-completions": "chat-completions";
                        messages: "messages";
                        "generate-content": "generate-content";
                        embeddings: "embeddings";
                        speech: "speech";
                        transcriptions: "transcriptions";
                        realtime: "realtime";
                    }>;
                    adapterId: z.ZodString;
                }, z.core.$strict>;
                capability: z.ZodString;
                function: z.ZodEnum<{
                    reasoning: "reasoning";
                    "memory-extraction": "memory-extraction";
                    embedding: "embedding";
                    tts: "tts";
                    transcription: "transcription";
                    voice: "voice";
                }>;
                catalogVersion: z.ZodString;
                requirements: z.ZodObject<{
                    tools: z.ZodBoolean;
                    stream: z.ZodBoolean;
                    structuredOutput: z.ZodBoolean;
                }, z.core.$strict>;
                tiers: z.ZodRecord<z.ZodEnum<{
                    standard: "standard";
                    advanced: "advanced";
                    reasoning: "reasoning";
                }>, z.ZodObject<{
                    provider: z.ZodString;
                    modelId: z.ZodString;
                    protocol: z.ZodEnum<{
                        responses: "responses";
                        "chat-completions": "chat-completions";
                        messages: "messages";
                        "generate-content": "generate-content";
                        embeddings: "embeddings";
                        speech: "speech";
                        transcriptions: "transcriptions";
                        realtime: "realtime";
                    }>;
                    adapterId: z.ZodString;
                }, z.core.$strict>>;
                fallback: z.ZodObject<{
                    provider: z.ZodString;
                    modelId: z.ZodString;
                    protocol: z.ZodEnum<{
                        responses: "responses";
                        "chat-completions": "chat-completions";
                        messages: "messages";
                        "generate-content": "generate-content";
                        embeddings: "embeddings";
                        speech: "speech";
                        transcriptions: "transcriptions";
                        realtime: "realtime";
                    }>;
                    adapterId: z.ZodString;
                }, z.core.$strict>;
            }, z.core.$strict>]>;
        }, z.core.$strict>>;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        provenance: z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            bindings: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                slotId: z.ZodString;
                origin: z.ZodLiteral<"master">;
                source: z.ZodObject<{
                    identity: z.ZodObject<{
                        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                        vaultAgentId: z.ZodNumber;
                    }, z.core.$strict>;
                    sourceVersion: z.ZodNumber;
                }, z.core.$strict>;
            }, z.core.$strict>, z.ZodObject<{
                slotId: z.ZodString;
                origin: z.ZodLiteral<"custom">;
                source: z.ZodOptional<z.ZodNever>;
            }, z.core.$strict>], "origin">>;
        }, z.core.$strict>;
    }, z.core.$strict>;
}, z.core.$loose>>;
export declare const AgentContextWithModelProvenanceWriteSchema: z.ZodIntersection<z.ZodDiscriminatedUnion<[z.ZodObject<{
    credentials: z.ZodObject<{
        OPENAI_API_KEY: z.ZodOptional<z.ZodString>;
        ANTHROPIC_API_KEY: z.ZodOptional<z.ZodString>;
        GOOGLE_API_KEY: z.ZodOptional<z.ZodString>;
        AGENT_CHAT_MODEL: z.ZodOptional<z.ZodString>;
        TELEGRAM_BOT_TOKEN: z.ZodOptional<z.ZodString>;
        ELEVENLABS_API_KEY: z.ZodOptional<z.ZodString>;
        ELEVENLABS_VOICE_ID: z.ZodOptional<z.ZodString>;
        ELEVENLABS_MODEL_ID: z.ZodOptional<z.ZodString>;
        TTS_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_TTS_MODEL: z.ZodOptional<z.ZodString>;
        OPENAI_TTS_VOICE: z.ZodOptional<z.ZodString>;
        STT_PRIMARY_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_STT_MODEL: z.ZodOptional<z.ZodString>;
        VOICE_CALL_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_LIVE_VOICE: z.ZodOptional<z.ZodString>;
        OPENAI_LIVE_BACKEND_MODEL: z.ZodOptional<z.ZodString>;
        TELNYX_API_KEY: z.ZodOptional<z.ZodString>;
        TELNYX_CONNECTION_ID: z.ZodOptional<z.ZodString>;
        TELNYX_FROM_NUMBER: z.ZodOptional<z.ZodString>;
        TELNYX_PUBLIC_KEY: z.ZodOptional<z.ZodString>;
        LIVE_WEB_AUTH_TOKEN: z.ZodOptional<z.ZodString>;
        QDRANT_API_KEY: z.ZodOptional<z.ZodString>;
        ELEVENLABS_MINDFULNESS_AGENT_ID: z.ZodOptional<z.ZodString>;
        FORGE_VOICE_REGISTER_TOKEN: z.ZodOptional<z.ZodString>;
        AGENTMAIL_API_KEY: z.ZodOptional<z.ZodString>;
        AGENTMAIL_INBOX_ID: z.ZodOptional<z.ZodString>;
        AGENT_EMAIL: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_CLIENT_ID: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_CLIENT_ID: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_CLIENT_ID: z.ZodOptional<z.ZodString>;
        NETATMO_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        NETATMO_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_ACCESS_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_PASSWORD: z.ZodOptional<z.ZodString>;
        INTERNAL_SECRET: z.ZodOptional<z.ZodString>;
        X9_INTERNAL_SECRET: z.ZodOptional<z.ZodString>;
    }, z.core.$catchall<z.ZodString>>;
    llmConfig: z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
    }, z.core.$strip>;
    telegramAllowFrom: z.ZodArray<z.ZodString>;
    inboundForwardUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    workspacePath: z.ZodString;
    registryPath: z.ZodString;
    telegramBotToken: z.ZodOptional<z.ZodString>;
    displayName: z.ZodString;
    configVersion: z.ZodOptional<z.ZodNumber>;
    channelConfigurations: z.ZodOptional<z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            email: "email";
            telegram: "telegram";
        }>;
        desired: z.ZodObject<{
            version: z.ZodNumber;
            state: z.ZodEnum<{
                active: "active";
                paused: "paused";
            }>;
        }, z.core.$strict>;
        access: z.ZodOptional<z.ZodObject<{
            desiredPolicy: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"telegram">;
                mode: z.ZodEnum<{
                    "approved-chats": "approved-chats";
                    anyone: "anyone";
                }>;
                chats: z.ZodArray<z.ZodObject<{
                    chatId: z.ZodString;
                    type: z.ZodEnum<{
                        group: "group";
                        private: "private";
                        supergroup: "supergroup";
                    }>;
                    name: z.ZodString;
                    admittedAt: z.ZodISODateTime;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"email">;
                mode: z.ZodEnum<{
                    anyone: "anyone";
                    "address-book": "address-book";
                }>;
            }, z.core.$strict>], "kind">;
            appliedPolicy: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"telegram">;
                mode: z.ZodEnum<{
                    "approved-chats": "approved-chats";
                    anyone: "anyone";
                }>;
                chats: z.ZodArray<z.ZodObject<{
                    chatId: z.ZodString;
                    type: z.ZodEnum<{
                        group: "group";
                        private: "private";
                        supergroup: "supergroup";
                    }>;
                    name: z.ZodString;
                    admittedAt: z.ZodISODateTime;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"email">;
                mode: z.ZodEnum<{
                    anyone: "anyone";
                    "address-book": "address-book";
                }>;
            }, z.core.$strict>], "kind">>;
        }, z.core.$strict>>;
        applied: z.ZodNullable<z.ZodObject<{
            version: z.ZodNumber;
            state: z.ZodEnum<{
                active: "active";
                paused: "paused";
            }>;
        }, z.core.$strict>>;
        resource: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodEnum<{
                telegram: "telegram";
            }>;
            resource: z.ZodObject<{
                agent_id: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                bot_username: z.ZodString;
                created_at: z.ZodString;
            }, z.core.$strict>;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodEnum<{
                email: "email";
            }>;
            resource: z.ZodObject<{
                agent_id: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                provider_inbox_id: z.ZodString;
                address: z.ZodString;
                display_name: z.ZodNullable<z.ZodString>;
                created_at: z.ZodString;
            }, z.core.$strict>;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
        }, z.core.$strict>], "kind">>;
        observation: z.ZodNullable<z.ZodObject<{
            channelId: z.ZodString;
            kind: z.ZodUnion<[z.ZodEnum<{
                email: "email";
                voice: "voice";
                telegram: "telegram";
                whatsapp: "whatsapp";
            }>, z.ZodLiteral<"web">]>;
            state: z.ZodEnum<{
                error: "error";
                unknown: "unknown";
                stopped: "stopped";
                loaded: "loaded";
                paused: "paused";
            }>;
            loaded: z.ZodNullable<z.ZodBoolean>;
            readiness: z.ZodEnum<{
                unknown: "unknown";
                ready: "ready";
                "not-ready": "not-ready";
            }>;
            botUsername: z.ZodOptional<z.ZodString>;
            allowFromCount: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        observedAt: z.ZodNullable<z.ZodISODateTime>;
        error: z.ZodNullable<z.ZodObject<{
            code: z.ZodEnum<{
                source_unavailable: "source_unavailable";
                resource_missing: "resource_missing";
                resource_conflict: "resource_conflict";
                provider_unavailable: "provider_unavailable";
                provider_rejected: "provider_rejected";
                account_blocked: "account_blocked";
                load_failed: "load_failed";
                apply_failed: "apply_failed";
                reconcile_pending: "reconcile_pending";
                first_check_failed: "first_check_failed";
            }>;
            retryable: z.ZodBoolean;
        }, z.core.$strict>>;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
    }, z.core.$strict>>>;
    voiceConfiguration: z.ZodOptional<z.ZodObject<{
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
    }, z.core.$strip>>;
    scopePolicy: z.ZodOptional<z.ZodObject<{
        version: z.ZodNumber;
        defaultWebSearch: z.ZodBoolean;
        scopeLimited: z.ZodBoolean;
        purpose: z.ZodOptional<z.ZodString>;
        defaults: z.ZodObject<{
            read: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                deny: "deny";
            }>;
            write: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                deny: "deny";
            }>;
        }, z.core.$strict>;
        rules: z.ZodArray<z.ZodObject<{
            capability: z.ZodString;
            tool: z.ZodOptional<z.ZodString>;
            read: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                deny: "deny";
            }>;
            write: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                deny: "deny";
            }>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    tenantId: z.ZodString;
    identity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>;
    role: z.ZodLiteral<"master">;
    masterAgentId: z.ZodOptional<z.ZodNever>;
}, z.core.$loose>, z.ZodObject<{
    credentials: z.ZodObject<{
        OPENAI_API_KEY: z.ZodOptional<z.ZodString>;
        ANTHROPIC_API_KEY: z.ZodOptional<z.ZodString>;
        GOOGLE_API_KEY: z.ZodOptional<z.ZodString>;
        AGENT_CHAT_MODEL: z.ZodOptional<z.ZodString>;
        TELEGRAM_BOT_TOKEN: z.ZodOptional<z.ZodString>;
        ELEVENLABS_API_KEY: z.ZodOptional<z.ZodString>;
        ELEVENLABS_VOICE_ID: z.ZodOptional<z.ZodString>;
        ELEVENLABS_MODEL_ID: z.ZodOptional<z.ZodString>;
        TTS_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_TTS_MODEL: z.ZodOptional<z.ZodString>;
        OPENAI_TTS_VOICE: z.ZodOptional<z.ZodString>;
        STT_PRIMARY_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_STT_MODEL: z.ZodOptional<z.ZodString>;
        VOICE_CALL_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_LIVE_VOICE: z.ZodOptional<z.ZodString>;
        OPENAI_LIVE_BACKEND_MODEL: z.ZodOptional<z.ZodString>;
        TELNYX_API_KEY: z.ZodOptional<z.ZodString>;
        TELNYX_CONNECTION_ID: z.ZodOptional<z.ZodString>;
        TELNYX_FROM_NUMBER: z.ZodOptional<z.ZodString>;
        TELNYX_PUBLIC_KEY: z.ZodOptional<z.ZodString>;
        LIVE_WEB_AUTH_TOKEN: z.ZodOptional<z.ZodString>;
        QDRANT_API_KEY: z.ZodOptional<z.ZodString>;
        ELEVENLABS_MINDFULNESS_AGENT_ID: z.ZodOptional<z.ZodString>;
        FORGE_VOICE_REGISTER_TOKEN: z.ZodOptional<z.ZodString>;
        AGENTMAIL_API_KEY: z.ZodOptional<z.ZodString>;
        AGENTMAIL_INBOX_ID: z.ZodOptional<z.ZodString>;
        AGENT_EMAIL: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_CLIENT_ID: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_CLIENT_ID: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_CLIENT_ID: z.ZodOptional<z.ZodString>;
        NETATMO_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        NETATMO_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_ACCESS_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_PASSWORD: z.ZodOptional<z.ZodString>;
        INTERNAL_SECRET: z.ZodOptional<z.ZodString>;
        X9_INTERNAL_SECRET: z.ZodOptional<z.ZodString>;
    }, z.core.$catchall<z.ZodString>>;
    llmConfig: z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
    }, z.core.$strip>;
    telegramAllowFrom: z.ZodArray<z.ZodString>;
    inboundForwardUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    workspacePath: z.ZodString;
    registryPath: z.ZodString;
    telegramBotToken: z.ZodOptional<z.ZodString>;
    displayName: z.ZodString;
    configVersion: z.ZodOptional<z.ZodNumber>;
    channelConfigurations: z.ZodOptional<z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            email: "email";
            telegram: "telegram";
        }>;
        desired: z.ZodObject<{
            version: z.ZodNumber;
            state: z.ZodEnum<{
                active: "active";
                paused: "paused";
            }>;
        }, z.core.$strict>;
        access: z.ZodOptional<z.ZodObject<{
            desiredPolicy: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"telegram">;
                mode: z.ZodEnum<{
                    "approved-chats": "approved-chats";
                    anyone: "anyone";
                }>;
                chats: z.ZodArray<z.ZodObject<{
                    chatId: z.ZodString;
                    type: z.ZodEnum<{
                        group: "group";
                        private: "private";
                        supergroup: "supergroup";
                    }>;
                    name: z.ZodString;
                    admittedAt: z.ZodISODateTime;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"email">;
                mode: z.ZodEnum<{
                    anyone: "anyone";
                    "address-book": "address-book";
                }>;
            }, z.core.$strict>], "kind">;
            appliedPolicy: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"telegram">;
                mode: z.ZodEnum<{
                    "approved-chats": "approved-chats";
                    anyone: "anyone";
                }>;
                chats: z.ZodArray<z.ZodObject<{
                    chatId: z.ZodString;
                    type: z.ZodEnum<{
                        group: "group";
                        private: "private";
                        supergroup: "supergroup";
                    }>;
                    name: z.ZodString;
                    admittedAt: z.ZodISODateTime;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"email">;
                mode: z.ZodEnum<{
                    anyone: "anyone";
                    "address-book": "address-book";
                }>;
            }, z.core.$strict>], "kind">>;
        }, z.core.$strict>>;
        applied: z.ZodNullable<z.ZodObject<{
            version: z.ZodNumber;
            state: z.ZodEnum<{
                active: "active";
                paused: "paused";
            }>;
        }, z.core.$strict>>;
        resource: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodEnum<{
                telegram: "telegram";
            }>;
            resource: z.ZodObject<{
                agent_id: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                bot_username: z.ZodString;
                created_at: z.ZodString;
            }, z.core.$strict>;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodEnum<{
                email: "email";
            }>;
            resource: z.ZodObject<{
                agent_id: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                provider_inbox_id: z.ZodString;
                address: z.ZodString;
                display_name: z.ZodNullable<z.ZodString>;
                created_at: z.ZodString;
            }, z.core.$strict>;
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
        }, z.core.$strict>], "kind">>;
        observation: z.ZodNullable<z.ZodObject<{
            channelId: z.ZodString;
            kind: z.ZodUnion<[z.ZodEnum<{
                email: "email";
                voice: "voice";
                telegram: "telegram";
                whatsapp: "whatsapp";
            }>, z.ZodLiteral<"web">]>;
            state: z.ZodEnum<{
                error: "error";
                unknown: "unknown";
                stopped: "stopped";
                loaded: "loaded";
                paused: "paused";
            }>;
            loaded: z.ZodNullable<z.ZodBoolean>;
            readiness: z.ZodEnum<{
                unknown: "unknown";
                ready: "ready";
                "not-ready": "not-ready";
            }>;
            botUsername: z.ZodOptional<z.ZodString>;
            allowFromCount: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
        observedAt: z.ZodNullable<z.ZodISODateTime>;
        error: z.ZodNullable<z.ZodObject<{
            code: z.ZodEnum<{
                source_unavailable: "source_unavailable";
                resource_missing: "resource_missing";
                resource_conflict: "resource_conflict";
                provider_unavailable: "provider_unavailable";
                provider_rejected: "provider_rejected";
                account_blocked: "account_blocked";
                load_failed: "load_failed";
                apply_failed: "apply_failed";
                reconcile_pending: "reconcile_pending";
                first_check_failed: "first_check_failed";
            }>;
            retryable: z.ZodBoolean;
        }, z.core.$strict>>;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
    }, z.core.$strict>>>;
    voiceConfiguration: z.ZodOptional<z.ZodObject<{
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
    }, z.core.$strip>>;
    scopePolicy: z.ZodOptional<z.ZodObject<{
        version: z.ZodNumber;
        defaultWebSearch: z.ZodBoolean;
        scopeLimited: z.ZodBoolean;
        purpose: z.ZodOptional<z.ZodString>;
        defaults: z.ZodObject<{
            read: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                deny: "deny";
            }>;
            write: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                deny: "deny";
            }>;
        }, z.core.$strict>;
        rules: z.ZodArray<z.ZodObject<{
            capability: z.ZodString;
            tool: z.ZodOptional<z.ZodString>;
            read: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                deny: "deny";
            }>;
            write: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                deny: "deny";
            }>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    tenantId: z.ZodString;
    identity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>;
    role: z.ZodLiteral<"erede">;
    masterAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
}, z.core.$loose>], "role">, z.ZodObject<{
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    credentials: z.ZodObject<{
        OPENAI_API_KEY: z.ZodOptional<z.ZodString>;
        ANTHROPIC_API_KEY: z.ZodOptional<z.ZodString>;
        GOOGLE_API_KEY: z.ZodOptional<z.ZodString>;
        AGENT_CHAT_MODEL: z.ZodOptional<z.ZodString>;
        TELEGRAM_BOT_TOKEN: z.ZodOptional<z.ZodString>;
        ELEVENLABS_API_KEY: z.ZodOptional<z.ZodString>;
        ELEVENLABS_VOICE_ID: z.ZodOptional<z.ZodString>;
        ELEVENLABS_MODEL_ID: z.ZodOptional<z.ZodString>;
        TTS_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_TTS_MODEL: z.ZodOptional<z.ZodString>;
        OPENAI_TTS_VOICE: z.ZodOptional<z.ZodString>;
        STT_PRIMARY_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_STT_MODEL: z.ZodOptional<z.ZodString>;
        VOICE_CALL_PROVIDER: z.ZodOptional<z.ZodString>;
        OPENAI_LIVE_VOICE: z.ZodOptional<z.ZodString>;
        OPENAI_LIVE_BACKEND_MODEL: z.ZodOptional<z.ZodString>;
        TELNYX_API_KEY: z.ZodOptional<z.ZodString>;
        TELNYX_CONNECTION_ID: z.ZodOptional<z.ZodString>;
        TELNYX_FROM_NUMBER: z.ZodOptional<z.ZodString>;
        TELNYX_PUBLIC_KEY: z.ZodOptional<z.ZodString>;
        LIVE_WEB_AUTH_TOKEN: z.ZodOptional<z.ZodString>;
        QDRANT_API_KEY: z.ZodOptional<z.ZodString>;
        ELEVENLABS_MINDFULNESS_AGENT_ID: z.ZodOptional<z.ZodString>;
        FORGE_VOICE_REGISTER_TOKEN: z.ZodOptional<z.ZodString>;
        AGENTMAIL_API_KEY: z.ZodOptional<z.ZodString>;
        AGENTMAIL_INBOX_ID: z.ZodOptional<z.ZodString>;
        AGENT_EMAIL: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_CLIENT_ID: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        GOOGLE_CALENDAR_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_CLIENT_ID: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        GOOGLE_CONTACTS_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_CLIENT_ID: z.ZodOptional<z.ZodString>;
        NETATMO_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
        NETATMO_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_ACCESS_TOKEN: z.ZodOptional<z.ZodString>;
        NETATMO_PASSWORD: z.ZodOptional<z.ZodString>;
        INTERNAL_SECRET: z.ZodOptional<z.ZodString>;
        X9_INTERNAL_SECRET: z.ZodOptional<z.ZodString>;
    }, z.core.$catchall<z.ZodString>>;
    llmConfig: z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
    }, z.core.$strip>;
    telegramAllowFrom: z.ZodArray<z.ZodString>;
    inboundForwardUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    tenantId: z.ZodOptional<z.ZodString>;
    workspacePath: z.ZodString;
    registryPath: z.ZodString;
    telegramBotToken: z.ZodOptional<z.ZodString>;
    displayName: z.ZodString;
    configVersion: z.ZodOptional<z.ZodNumber>;
    modelConfiguration: z.ZodObject<{
        schemaVersion: z.ZodLiteral<1>;
        configVersion: z.ZodNumber;
        selections: z.ZodArray<z.ZodObject<{
            slotId: z.ZodString;
            settings: z.ZodUnion<readonly [z.ZodObject<{
                mode: z.ZodLiteral<"automatic">;
                capability: z.ZodString;
                function: z.ZodEnum<{
                    reasoning: "reasoning";
                    "memory-extraction": "memory-extraction";
                    embedding: "embedding";
                    tts: "tts";
                    transcription: "transcription";
                    voice: "voice";
                }>;
                catalogVersion: z.ZodString;
                requirements: z.ZodObject<{
                    tools: z.ZodBoolean;
                    stream: z.ZodBoolean;
                    structuredOutput: z.ZodBoolean;
                }, z.core.$strict>;
                tiers: z.ZodRecord<z.ZodEnum<{
                    standard: "standard";
                    advanced: "advanced";
                    reasoning: "reasoning";
                }>, z.ZodObject<{
                    provider: z.ZodString;
                    modelId: z.ZodString;
                    protocol: z.ZodEnum<{
                        responses: "responses";
                        "chat-completions": "chat-completions";
                        messages: "messages";
                        "generate-content": "generate-content";
                        embeddings: "embeddings";
                        speech: "speech";
                        transcriptions: "transcriptions";
                        realtime: "realtime";
                    }>;
                    adapterId: z.ZodString;
                }, z.core.$strict>>;
                fallback: z.ZodObject<{
                    provider: z.ZodString;
                    modelId: z.ZodString;
                    protocol: z.ZodEnum<{
                        responses: "responses";
                        "chat-completions": "chat-completions";
                        messages: "messages";
                        "generate-content": "generate-content";
                        embeddings: "embeddings";
                        speech: "speech";
                        transcriptions: "transcriptions";
                        realtime: "realtime";
                    }>;
                    adapterId: z.ZodString;
                }, z.core.$strict>;
            }, z.core.$strict>, z.ZodObject<{
                mode: z.ZodLiteral<"pin">;
                pin: z.ZodObject<{
                    provider: z.ZodString;
                    modelId: z.ZodString;
                    protocol: z.ZodEnum<{
                        responses: "responses";
                        "chat-completions": "chat-completions";
                        messages: "messages";
                        "generate-content": "generate-content";
                        embeddings: "embeddings";
                        speech: "speech";
                        transcriptions: "transcriptions";
                        realtime: "realtime";
                    }>;
                    adapterId: z.ZodString;
                }, z.core.$strict>;
                capability: z.ZodString;
                function: z.ZodEnum<{
                    reasoning: "reasoning";
                    "memory-extraction": "memory-extraction";
                    embedding: "embedding";
                    tts: "tts";
                    transcription: "transcription";
                    voice: "voice";
                }>;
                catalogVersion: z.ZodString;
                requirements: z.ZodObject<{
                    tools: z.ZodBoolean;
                    stream: z.ZodBoolean;
                    structuredOutput: z.ZodBoolean;
                }, z.core.$strict>;
                tiers: z.ZodRecord<z.ZodEnum<{
                    standard: "standard";
                    advanced: "advanced";
                    reasoning: "reasoning";
                }>, z.ZodObject<{
                    provider: z.ZodString;
                    modelId: z.ZodString;
                    protocol: z.ZodEnum<{
                        responses: "responses";
                        "chat-completions": "chat-completions";
                        messages: "messages";
                        "generate-content": "generate-content";
                        embeddings: "embeddings";
                        speech: "speech";
                        transcriptions: "transcriptions";
                        realtime: "realtime";
                    }>;
                    adapterId: z.ZodString;
                }, z.core.$strict>>;
                fallback: z.ZodObject<{
                    provider: z.ZodString;
                    modelId: z.ZodString;
                    protocol: z.ZodEnum<{
                        responses: "responses";
                        "chat-completions": "chat-completions";
                        messages: "messages";
                        "generate-content": "generate-content";
                        embeddings: "embeddings";
                        speech: "speech";
                        transcriptions: "transcriptions";
                        realtime: "realtime";
                    }>;
                    adapterId: z.ZodString;
                }, z.core.$strict>;
            }, z.core.$strict>]>;
        }, z.core.$strict>>;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        provenance: z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            bindings: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                slotId: z.ZodString;
                origin: z.ZodLiteral<"master">;
                source: z.ZodObject<{
                    identity: z.ZodObject<{
                        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                        vaultAgentId: z.ZodNumber;
                    }, z.core.$strict>;
                    sourceVersion: z.ZodNumber;
                }, z.core.$strict>;
            }, z.core.$strict>, z.ZodObject<{
                slotId: z.ZodString;
                origin: z.ZodLiteral<"custom">;
                source: z.ZodOptional<z.ZodNever>;
            }, z.core.$strict>], "origin">>;
        }, z.core.$strict>;
    }, z.core.$strict>;
}, z.core.$loose>>;
export type AgentContextWithModelProvenance = z.infer<typeof AgentContextWithModelProvenanceSchema>;
export type AgentContextWithModelProvenanceWrite = z.infer<typeof AgentContextWithModelProvenanceWriteSchema>;
export declare const AgentRuntimeModelSelectionSchema: z.ZodObject<{
    slotId: z.ZodString;
    capability: z.ZodString;
    function: z.ZodEnum<{
        reasoning: "reasoning";
        "memory-extraction": "memory-extraction";
        embedding: "embedding";
        tts: "tts";
        transcription: "transcription";
        voice: "voice";
    }>;
    tier: z.ZodEnum<{
        standard: "standard";
        advanced: "advanced";
        reasoning: "reasoning";
        fallback: "fallback";
    }>;
    descriptor: z.ZodObject<{
        provider: z.ZodString;
        modelId: z.ZodString;
        protocol: z.ZodEnum<{
            responses: "responses";
            "chat-completions": "chat-completions";
            messages: "messages";
            "generate-content": "generate-content";
            embeddings: "embeddings";
            speech: "speech";
            transcriptions: "transcriptions";
            realtime: "realtime";
        }>;
        adapterId: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
/** Producer evidence of the selections actually installed for each function/tier, not a global reload count. */
export declare const AgentModelRuntimeAttestationSchema: z.ZodObject<{
    identity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>;
    configVersion: z.ZodNumber;
    requestId: z.ZodString;
    observedAt: z.ZodISODateTime;
    selections: z.ZodArray<z.ZodObject<{
        slotId: z.ZodString;
        capability: z.ZodString;
        function: z.ZodEnum<{
            reasoning: "reasoning";
            "memory-extraction": "memory-extraction";
            embedding: "embedding";
            tts: "tts";
            transcription: "transcription";
            voice: "voice";
        }>;
        tier: z.ZodEnum<{
            standard: "standard";
            advanced: "advanced";
            reasoning: "reasoning";
            fallback: "fallback";
        }>;
        descriptor: z.ZodObject<{
            provider: z.ZodString;
            modelId: z.ZodString;
            protocol: z.ZodEnum<{
                responses: "responses";
                "chat-completions": "chat-completions";
                messages: "messages";
                "generate-content": "generate-content";
                embeddings: "embeddings";
                speech: "speech";
                transcriptions: "transcriptions";
                realtime: "realtime";
            }>;
            adapterId: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type AgentModelRuntimeAttestation = z.infer<typeof AgentModelRuntimeAttestationSchema>;
export declare const AgentModelsStateSchema: z.ZodObject<{
    identity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>;
    versions: z.ZodNullable<z.ZodObject<{
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
    }, z.core.$strip>>;
    saved: z.ZodNullable<z.ZodObject<{
        schemaVersion: z.ZodLiteral<1>;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strict>;
        configVersion: z.ZodNumber;
        selections: z.ZodArray<z.ZodObject<{
            slotId: z.ZodString;
            settings: z.ZodUnion<readonly [z.ZodObject<{
                mode: z.ZodLiteral<"automatic">;
                capability: z.ZodString;
                function: z.ZodEnum<{
                    reasoning: "reasoning";
                    "memory-extraction": "memory-extraction";
                    embedding: "embedding";
                    tts: "tts";
                    transcription: "transcription";
                    voice: "voice";
                }>;
                catalogVersion: z.ZodString;
                requirements: z.ZodObject<{
                    tools: z.ZodBoolean;
                    stream: z.ZodBoolean;
                    structuredOutput: z.ZodBoolean;
                }, z.core.$strict>;
                tiers: z.ZodRecord<z.ZodEnum<{
                    standard: "standard";
                    advanced: "advanced";
                    reasoning: "reasoning";
                }>, z.ZodObject<{
                    provider: z.ZodString;
                    modelId: z.ZodString;
                    protocol: z.ZodEnum<{
                        responses: "responses";
                        "chat-completions": "chat-completions";
                        messages: "messages";
                        "generate-content": "generate-content";
                        embeddings: "embeddings";
                        speech: "speech";
                        transcriptions: "transcriptions";
                        realtime: "realtime";
                    }>;
                    adapterId: z.ZodString;
                }, z.core.$strict>>;
                fallback: z.ZodObject<{
                    provider: z.ZodString;
                    modelId: z.ZodString;
                    protocol: z.ZodEnum<{
                        responses: "responses";
                        "chat-completions": "chat-completions";
                        messages: "messages";
                        "generate-content": "generate-content";
                        embeddings: "embeddings";
                        speech: "speech";
                        transcriptions: "transcriptions";
                        realtime: "realtime";
                    }>;
                    adapterId: z.ZodString;
                }, z.core.$strict>;
            }, z.core.$strict>, z.ZodObject<{
                mode: z.ZodLiteral<"pin">;
                pin: z.ZodObject<{
                    provider: z.ZodString;
                    modelId: z.ZodString;
                    protocol: z.ZodEnum<{
                        responses: "responses";
                        "chat-completions": "chat-completions";
                        messages: "messages";
                        "generate-content": "generate-content";
                        embeddings: "embeddings";
                        speech: "speech";
                        transcriptions: "transcriptions";
                        realtime: "realtime";
                    }>;
                    adapterId: z.ZodString;
                }, z.core.$strict>;
                capability: z.ZodString;
                function: z.ZodEnum<{
                    reasoning: "reasoning";
                    "memory-extraction": "memory-extraction";
                    embedding: "embedding";
                    tts: "tts";
                    transcription: "transcription";
                    voice: "voice";
                }>;
                catalogVersion: z.ZodString;
                requirements: z.ZodObject<{
                    tools: z.ZodBoolean;
                    stream: z.ZodBoolean;
                    structuredOutput: z.ZodBoolean;
                }, z.core.$strict>;
                tiers: z.ZodRecord<z.ZodEnum<{
                    standard: "standard";
                    advanced: "advanced";
                    reasoning: "reasoning";
                }>, z.ZodObject<{
                    provider: z.ZodString;
                    modelId: z.ZodString;
                    protocol: z.ZodEnum<{
                        responses: "responses";
                        "chat-completions": "chat-completions";
                        messages: "messages";
                        "generate-content": "generate-content";
                        embeddings: "embeddings";
                        speech: "speech";
                        transcriptions: "transcriptions";
                        realtime: "realtime";
                    }>;
                    adapterId: z.ZodString;
                }, z.core.$strict>>;
                fallback: z.ZodObject<{
                    provider: z.ZodString;
                    modelId: z.ZodString;
                    protocol: z.ZodEnum<{
                        responses: "responses";
                        "chat-completions": "chat-completions";
                        messages: "messages";
                        "generate-content": "generate-content";
                        embeddings: "embeddings";
                        speech: "speech";
                        transcriptions: "transcriptions";
                        realtime: "realtime";
                    }>;
                    adapterId: z.ZodString;
                }, z.core.$strict>;
            }, z.core.$strict>]>;
        }, z.core.$strict>>;
        provenance: z.ZodOptional<z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            bindings: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                slotId: z.ZodString;
                origin: z.ZodLiteral<"master">;
                source: z.ZodObject<{
                    identity: z.ZodObject<{
                        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                        vaultAgentId: z.ZodNumber;
                    }, z.core.$strict>;
                    sourceVersion: z.ZodNumber;
                }, z.core.$strict>;
            }, z.core.$strict>, z.ZodObject<{
                slotId: z.ZodString;
                origin: z.ZodLiteral<"custom">;
                source: z.ZodOptional<z.ZodNever>;
            }, z.core.$strict>], "origin">>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    runtime: z.ZodNullable<z.ZodObject<{
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strict>;
        configVersion: z.ZodNumber;
        requestId: z.ZodString;
        observedAt: z.ZodISODateTime;
        selections: z.ZodArray<z.ZodObject<{
            slotId: z.ZodString;
            capability: z.ZodString;
            function: z.ZodEnum<{
                reasoning: "reasoning";
                "memory-extraction": "memory-extraction";
                embedding: "embedding";
                tts: "tts";
                transcription: "transcription";
                voice: "voice";
            }>;
            tier: z.ZodEnum<{
                standard: "standard";
                advanced: "advanced";
                reasoning: "reasoning";
                fallback: "fallback";
            }>;
            descriptor: z.ZodObject<{
                provider: z.ZodString;
                modelId: z.ZodString;
                protocol: z.ZodEnum<{
                    responses: "responses";
                    "chat-completions": "chat-completions";
                    messages: "messages";
                    "generate-content": "generate-content";
                    embeddings: "embeddings";
                    speech: "speech";
                    transcriptions: "transcriptions";
                    realtime: "realtime";
                }>;
                adapterId: z.ZodString;
            }, z.core.$strict>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type AgentModelsState = z.infer<typeof AgentModelsStateSchema>;
/** No side effects: null, timeout, stale or mismatched evidence remains unconfirmed; identical replays are valid. */
export declare function isAgentModelApplyConfirmed(configuration: unknown, requestedCommand: unknown, processedResult: unknown, runtimeEvidence: unknown, now?: Date): boolean;
//# sourceMappingURL=agent-model-configuration.d.ts.map