import { z } from 'zod';
import { type CredentialVersionRef } from "../vault/credential-source.cjs";
import { type EffectiveModelSlot } from "./effective-models.cjs";
import { type ModelsGeneration } from "./models-generation.cjs";
/** What agent-core tells a service about one model slot. */
export declare const EffectiveSlotStateSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
        revokedThrough: z.ZodOptional<z.ZodObject<{
            source: z.ZodString;
            counter: z.ZodNumber;
            revoked: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strict>>;
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
export type EffectiveSlotState = z.infer<typeof EffectiveSlotStateSchema>;
/** Convert the effective Vault slot into the state shared by agent-core and its services. */
export declare function effectiveSlotStateFromSlot(slot: EffectiveModelSlot, extra: {
    generation: ModelsGeneration;
    etag: string;
    credential?: CredentialVersionRef | null;
}): EffectiveSlotState;
/** The identity triple travels in the body, never in the path. */
export declare const EffectiveSlotReadRequestSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    slotId: z.ZodString;
}, z.core.$strict>;
export type EffectiveSlotReadRequest = z.infer<typeof EffectiveSlotReadRequestSchema>;
export type SlotFallback = 'v1' | 'choice' | 'last-known' | 'refuse';
/** When a service may fall back; an explicit refusal is never papered over by a cache or an invented default. */
export declare function slotFallback(state: EffectiveSlotState, lastKnown: {
    sameIdentity: boolean;
} | null): SlotFallback;
//# sourceMappingURL=effective-slot-state.d.ts.map