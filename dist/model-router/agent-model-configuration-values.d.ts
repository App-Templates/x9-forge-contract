import { z } from 'zod';
import { type AgentRuntimeIdentity } from "../agent/agent-runtime-identity.js";
export declare const ModelSelectionTierSchema: z.ZodEnum<{
    standard: "standard";
    advanced: "advanced";
    reasoning: "reasoning";
    fallback: "fallback";
    primary: "primary";
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
            vision: z.ZodOptional<z.ZodBoolean>;
            webSearch: z.ZodOptional<z.ZodBoolean>;
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
            vision: z.ZodOptional<z.ZodBoolean>;
            webSearch: z.ZodOptional<z.ZodBoolean>;
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
        tiers: z.ZodOptional<z.ZodNever>;
        fallback: z.ZodOptional<z.ZodNever>;
        mode: z.ZodLiteral<"single">;
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
        embeddingDimensions: z.ZodOptional<z.ZodNumber>;
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
            vision: z.ZodOptional<z.ZodBoolean>;
            webSearch: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strict>;
    }, z.core.$strict>, z.ZodObject<{
        tiers: z.ZodOptional<z.ZodNever>;
        mode: z.ZodLiteral<"failover">;
        primary: z.ZodObject<{
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
            vision: z.ZodOptional<z.ZodBoolean>;
            webSearch: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strict>;
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
/** Complete declared model authority; legacy runtime mappings remain optional elsewhere. */
export declare const CompleteModelIdentitySchema: z.ZodObject<{
    managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    vaultAgentId: z.ZodNumber;
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
    scope: z.ZodLazy<z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>>;
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
                vision: z.ZodOptional<z.ZodBoolean>;
                webSearch: z.ZodOptional<z.ZodBoolean>;
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
                vision: z.ZodOptional<z.ZodBoolean>;
                webSearch: z.ZodOptional<z.ZodBoolean>;
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
            tiers: z.ZodOptional<z.ZodNever>;
            fallback: z.ZodOptional<z.ZodNever>;
            mode: z.ZodLiteral<"single">;
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
            embeddingDimensions: z.ZodOptional<z.ZodNumber>;
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
                vision: z.ZodOptional<z.ZodBoolean>;
                webSearch: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strict>;
        }, z.core.$strict>, z.ZodObject<{
            tiers: z.ZodOptional<z.ZodNever>;
            mode: z.ZodLiteral<"failover">;
            primary: z.ZodObject<{
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
                vision: z.ZodOptional<z.ZodBoolean>;
                webSearch: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strict>;
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
        scope: z.ZodLazy<z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>>;
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
                vision: z.ZodOptional<z.ZodBoolean>;
                webSearch: z.ZodOptional<z.ZodBoolean>;
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
                vision: z.ZodOptional<z.ZodBoolean>;
                webSearch: z.ZodOptional<z.ZodBoolean>;
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
            tiers: z.ZodOptional<z.ZodNever>;
            fallback: z.ZodOptional<z.ZodNever>;
            mode: z.ZodLiteral<"single">;
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
            embeddingDimensions: z.ZodOptional<z.ZodNumber>;
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
                vision: z.ZodOptional<z.ZodBoolean>;
                webSearch: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strict>;
        }, z.core.$strict>, z.ZodObject<{
            tiers: z.ZodOptional<z.ZodNever>;
            mode: z.ZodLiteral<"failover">;
            primary: z.ZodObject<{
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
                vision: z.ZodOptional<z.ZodBoolean>;
                webSearch: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strict>;
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
        scope: z.ZodLazy<z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>>;
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
//# sourceMappingURL=agent-model-configuration-values.d.ts.map