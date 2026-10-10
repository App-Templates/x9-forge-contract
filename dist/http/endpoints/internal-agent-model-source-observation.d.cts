import { z } from 'zod';
/** Local loaded generation, available before priming without querying aggregate consumer state.
 * This observation grants no Master role; producers must recheck the generation after awaits.
 */
export declare const internalAgentModelSourceObservationContract: {
    readonly method: "GET";
    readonly path: "/internal/agents/:agentId/models/local-source";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        sourceVersion: z.ZodString;
        observedAt: z.ZodISODateTime;
        validUntil: z.ZodISODateTime;
    }, z.core.$strict>;
};
export declare function agentModelSourceObservationPath(agentId: string): string;
/** Personal voice sessions resolve the executing primary on the server, never from a guessed agent ID. */
export declare const internalPrimaryModelSourceObservationContract: {
    readonly method: "GET";
    readonly path: "/internal/models/primary/local-source";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
    readonly responseSchema: z.ZodObject<{
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        sourceVersion: z.ZodString;
        observedAt: z.ZodISODateTime;
        validUntil: z.ZodISODateTime;
    }, z.core.$strict>;
};
/** cap-voice observes the server value used by its outgoing GPT-Live phone dispatcher. */
export declare const internalPhoneBackendModelSourceContract: {
    readonly method: "POST";
    readonly path: "/internal/live/phone-backend-source";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
    readonly requestSchema: z.ZodObject<{
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        slotId: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        schemaVersion: z.ZodLiteral<1>;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        slotId: z.ZodString;
        sourceVersion: z.ZodString;
        observedAt: z.ZodISODateTime;
        validUntil: z.ZodISODateTime;
        status: z.ZodEnum<{
            unknown: "unknown";
            failed: "failed";
            pending: "pending";
            installed: "installed";
            observed: "observed";
        }>;
        configVersion: z.ZodNullable<z.ZodNumber>;
        requestId: z.ZodNullable<z.ZodString>;
        settings: z.ZodNullable<z.ZodUnion<readonly [z.ZodObject<{
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
                    live: "live";
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
                    live: "live";
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
                    live: "live";
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
                    live: "live";
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
                    live: "live";
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
                    live: "live";
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
                    live: "live";
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
                    live: "live";
                }>;
                adapterId: z.ZodString;
            }, z.core.$strict>;
        }, z.core.$strict>]>>;
        reason: z.ZodNullable<z.ZodString>;
        embedding: z.ZodNullable<z.ZodObject<{
            state: z.ZodEnum<{
                failed: "failed";
                completed: "completed";
                pending: "pending";
                running: "running";
            }>;
            previous: z.ZodObject<{
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
                    live: "live";
                }>;
                adapterId: z.ZodString;
            }, z.core.$strict>;
            active: z.ZodObject<{
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
                    live: "live";
                }>;
                adapterId: z.ZodString;
            }, z.core.$strict>;
            target: z.ZodObject<{
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
                    live: "live";
                }>;
                adapterId: z.ZodString;
            }, z.core.$strict>;
            progress: z.ZodObject<{
                completed: z.ZodNumber;
                total: z.ZodNumber;
            }, z.core.$strict>;
            reason: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-agent-model-source-observation.d.ts.map