import { z } from 'zod';
import { ModelDescriptorSchema, ModelFeaturesSchema } from "./model-catalog.cjs";
/** Existing tiered choices remain unchanged; single and failover describe their actual executable paths. */
export declare const CapabilityModelSettingsSchema: z.ZodUnion<readonly [z.ZodObject<{
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
export type CapabilityModelSettings = z.infer<typeof CapabilityModelSettingsSchema>;
/** The installed positions expected for one choice; never invent reasoning tiers for a single-model service. */
export declare function modelSettingsSelections(settings: CapabilityModelSettings): Array<{
    tier: 'standard' | 'advanced' | 'reasoning' | 'fallback' | 'primary';
    descriptor: z.infer<typeof ModelDescriptorSchema>;
}>;
export type CapabilityModelValidationIssue = 'invalid-settings' | 'invalid-catalog' | 'agent-mismatch' | 'catalog-version-mismatch' | 'catalog-unavailable' | 'catalog-stale' | 'model-not-attested' | 'model-unavailable' | 'feature-unsupported' | 'embedding-dimension-mismatch';
/** Validate the selected metadata against a fresh catalog for the explicitly addressed management agent. */
export declare function validateCapabilityModels(input: unknown, source: unknown, agentId: string, now?: Date): CapabilityModelValidationIssue[];
/** Canonical settings equivalence independent of object key order; no origins or versions are inferred. */
export declare function sameCapabilityModelSettings(left: unknown, right: unknown): boolean;
export declare function sameModelFeatures(left: z.infer<typeof ModelFeaturesSchema>, right: z.infer<typeof ModelFeaturesSchema>): boolean;
//# sourceMappingURL=capability-model-settings.d.ts.map