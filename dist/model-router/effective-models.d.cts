import { z } from 'zod';
/**
 * active with upgradedFrom: a retired model was replaced; show an "updated from" label and warning.
 * retired: a successor is being applied.
 * retired-no-successor: show a red row, keep the choice menu enabled and notify the user.
 */
export declare const EFFECTIVE_MODEL_SLOT_STATUSES: readonly ["active", "retired", "retired-no-successor"];
export declare const EffectiveModelSlotStatusSchema: z.ZodEnum<{
    active: "active";
    retired: "retired";
    "retired-no-successor": "retired-no-successor";
}>;
export type EffectiveModelSlotStatus = z.infer<typeof EffectiveModelSlotStatusSchema>;
export declare const EffectiveSlotRetirementReasonSchema: z.ZodEnum<{
    registry: "registry";
    "provider-inventory": "provider-inventory";
    "provider-error": "provider-error";
}>;
export declare const EffectiveSlotRetirementSchema: z.ZodObject<{
    modelId: z.ZodString;
    reason: z.ZodEnum<{
        registry: "registry";
        "provider-inventory": "provider-inventory";
        "provider-error": "provider-error";
    }>;
    observedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type EffectiveSlotRetirement = z.infer<typeof EffectiveSlotRetirementSchema>;
/** Effective choice metadata; credential references never contain credential values. */
export declare const EffectiveModelSlotSchema: z.ZodObject<{
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
}, z.core.$strict>;
export type EffectiveModelSlot = z.infer<typeof EffectiveModelSlotSchema>;
/** One declared agent and one generation, with choices for registered consumers only. */
export declare const EffectiveModelsResponseSchema: z.ZodObject<{
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
export type EffectiveModelsResponse = z.infer<typeof EffectiveModelsResponseSchema>;
export declare const EffectiveModelsParamsSchema: z.ZodObject<{
    vaultAgentId: z.ZodString;
}, z.core.$strict>;
/**
 * Token-authenticated effective choices for the declared Vault agent.
 * If-None-Match may carry the last HTTP ETag; a match returns 304 without a body.
 * A 200 response is validated with EffectiveModelsResponseSchema.
 */
export declare const internalModelsEffectiveContract: {
    readonly method: "GET";
    readonly path: "/internal/models/effective/:vaultAgentId";
    readonly authType: "token";
    readonly authHeader: "X-Internal-Token";
    readonly paramsSchema: z.ZodObject<{
        vaultAgentId: z.ZodString;
    }, z.core.$strict>;
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
};
export declare function modelsEffectivePath(vaultAgentId: number): string;
//# sourceMappingURL=effective-models.d.ts.map