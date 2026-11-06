import { z } from 'zod';
import type { EffectiveSlotReadRequest } from "./effective-slot-state.js";
/** What agent-core did with a pushed effective response, compared with the one it already holds. */
export declare const ModelsPushOutcomeSchema: z.ZodEnum<{
    accepted: "accepted";
    same: "same";
    older: "older";
    incomparable: "incomparable";
}>;
export type ModelsPushOutcome = z.infer<typeof ModelsPushOutcomeSchema>;
/** `etag` is the one agent-core keeps AFTER the push; null when it holds none. */
export declare const ModelsPushAckSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    outcome: z.ZodEnum<{
        accepted: "accepted";
        same: "same";
        older: "older";
        incomparable: "incomparable";
    }>;
    etag: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type ModelsPushAck = z.infer<typeof ModelsPushAckSchema>;
/**
 * Vault → agent-core: delivers the effective choices of one agent.
 * The choice is "in force" only when `ack.etag === body.etag`.
 * 409 `{ ok: false, error: 'identity_mismatch' }` when agent-core does not know that agent
 * with that `vaultAgentId`.
 */
export declare const internalModelsPushContract: {
    readonly method: "POST";
    readonly path: "/internal/models/effective";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
    readonly bodySchema: z.ZodObject<{
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
        mode: z.ZodEnum<{
            v1: "v1";
            v2: "v2";
        }>;
        generation: z.ZodObject<{
            presetId: z.ZodNullable<z.ZodNumber>;
            agentGeneration: z.ZodNumber;
            presetGeneration: z.ZodNumber;
        }, z.core.$strict>;
        etag: z.ZodString;
        slots: z.ZodRecord<z.ZodString, z.ZodObject<{
            choice: z.ZodUnion<readonly [z.ZodObject<{
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
            }, z.core.$strict>]>;
            origin: z.ZodEnum<{
                agent: "agent";
                preset: "preset";
            }>;
            version: z.ZodNumber;
            status: z.ZodEnum<{
                active: "active";
                retired: "retired";
                "retired-no-successor": "retired-no-successor";
            }>;
            upgradedFrom: z.ZodOptional<z.ZodString>;
            upgradedAt: z.ZodOptional<z.ZodISODateTime>;
            upgradedWhilePinned: z.ZodOptional<z.ZodLiteral<true>>;
            retirement: z.ZodOptional<z.ZodObject<{
                modelId: z.ZodString;
                reason: z.ZodEnum<{
                    registry: "registry";
                    "provider-inventory": "provider-inventory";
                    "provider-error": "provider-error";
                }>;
                observedAt: z.ZodISODateTime;
            }, z.core.$strict>>;
            credentialKey: z.ZodNullable<z.ZodString>;
            credentialVersion: z.ZodNullable<z.ZodNumber>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        outcome: z.ZodEnum<{
            accepted: "accepted";
            same: "same";
            older: "older";
            incomparable: "incomparable";
        }>;
        etag: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
};
/** Emergency invalidation: agent-core drops what it holds for the agent and fetches again. */
export declare const internalModelsInvalidateContract: {
    readonly method: "POST";
    readonly path: "/internal/models/invalidate/:agentId";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
    }, z.core.$strict>;
};
export declare function modelsInvalidatePath(agentId: string): string;
export declare const ModelsReturnWindowRequestSchema: z.ZodObject<{
    vaultAgentId: z.ZodNumber;
    ttlMs: z.ZodNumber;
}, z.core.$strict>;
export type ModelsReturnWindowRequest = z.infer<typeof ModelsReturnWindowRequestSchema>;
/**
 * For `ttlMs` agent-core admits a v1 publication for the agent even though it is on v2:
 * the return is prepared once the new one is on (Astra 13). `until` is when the window closes.
 */
export declare const internalModelsReturnWindowContract: {
    readonly method: "POST";
    readonly path: "/internal/models/return-window/:agentId";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly bodySchema: z.ZodObject<{
        vaultAgentId: z.ZodNumber;
        ttlMs: z.ZodNumber;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        until: z.ZodString;
    }, z.core.$strict>;
};
export declare function modelsReturnWindowPath(agentId: string): string;
export declare const EffectiveSlotPathParamsSchema: z.ZodObject<{
    agentId: z.ZodString;
    slotId: z.ZodString;
}, z.core.$strict>;
/**
 * Services → agent-core: reads one slot with the complete identity triple in the body.
 * `params.agentId` and `params.slotId` must match `body.scope.agentId` and `body.slotId`;
 * a mismatch returns 400.
 * `If-None-Match` equal to a configured state's `etag` returns 304 without a body.
 * All other states have no ETag and always return 200.
 */
export declare const internalAgentModelSlotContract: {
    readonly method: "POST";
    readonly path: "/internal/agents/:agentId/models/slots/:slotId";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        slotId: z.ZodString;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        slotId: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        state: z.ZodLiteral<"disabled">;
    }, z.core.$strict>, z.ZodObject<{
        state: z.ZodLiteral<"configured">;
        choice: z.ZodUnion<readonly [z.ZodObject<{
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
        }, z.core.$strict>]>;
        generation: z.ZodObject<{
            presetId: z.ZodNullable<z.ZodNumber>;
            agentGeneration: z.ZodNumber;
            presetGeneration: z.ZodNumber;
        }, z.core.$strict>;
        credentialKey: z.ZodNullable<z.ZodString>;
        credentialVersion: z.ZodNullable<z.ZodNumber>;
        credential: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            source: z.ZodString;
            counter: z.ZodNumber;
            revoked: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strict>>>;
        etag: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        state: z.ZodLiteral<"unconfigured">;
    }, z.core.$strict>, z.ZodObject<{
        state: z.ZodLiteral<"unavailable">;
    }, z.core.$strict>, z.ZodObject<{
        state: z.ZodLiteral<"identity_mismatch">;
        field: z.ZodEnum<{
            agentId: "agentId";
            ownerId: "ownerId";
            tenantId: "tenantId";
        }>;
    }, z.core.$strict>, z.ZodObject<{
        state: z.ZodLiteral<"capability_disabled">;
    }, z.core.$strict>, z.ZodObject<{
        state: z.ZodLiteral<"retired_no_successor">;
        modelId: z.ZodString;
        reason: z.ZodEnum<{
            registry: "registry";
            "provider-inventory": "provider-inventory";
            "provider-error": "provider-error";
        }>;
    }, z.core.$strict>], "state">;
};
export declare function agentModelSlotPath(agentId: string, slotId: string): string;
/** Compare the path and body after each has passed its boundary schema. */
export declare function slotRequestMatchesPath(params: z.infer<typeof EffectiveSlotPathParamsSchema>, body: EffectiveSlotReadRequest): boolean;
//# sourceMappingURL=effective-push.d.ts.map