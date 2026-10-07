import { z } from 'zod';
export declare const ModelCatalogProviderIdSchema: z.ZodString;
export declare const ModelApiProtocolSchema: z.ZodEnum<{
    responses: "responses";
    "chat-completions": "chat-completions";
    messages: "messages";
    "generate-content": "generate-content";
    embeddings: "embeddings";
    speech: "speech";
    transcriptions: "transcriptions";
    realtime: "realtime";
}>;
export declare const ModelFunctionSchema: z.ZodEnum<{
    reasoning: "reasoning";
    "memory-extraction": "memory-extraction";
    embedding: "embedding";
    tts: "tts";
    transcription: "transcription";
    voice: "voice";
}>;
export declare const ModelCatalogVersionSchema: z.ZodString;
export declare const ModelDescriptorSchema: z.ZodObject<{
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
export type ModelDescriptor = z.infer<typeof ModelDescriptorSchema>;
export type ModelFunction = z.infer<typeof ModelFunctionSchema>;
export declare const ModelFeaturesSchema: z.ZodObject<{
    tools: z.ZodBoolean;
    stream: z.ZodBoolean;
    structuredOutput: z.ZodBoolean;
}, z.core.$strict>;
/** Missing limits mean unknown; only producer-attested values may be displayed. */
export declare const ModelLimitsSchema: z.ZodObject<{
    maxInputTokens: z.ZodOptional<z.ZodNumber>;
    maxOutputTokens: z.ZodOptional<z.ZodNumber>;
    maxInputCharacters: z.ZodOptional<z.ZodNumber>;
    maxAudioSeconds: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export declare const ModelCatalogEntrySchema: z.ZodObject<{
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
    function: z.ZodEnum<{
        reasoning: "reasoning";
        "memory-extraction": "memory-extraction";
        embedding: "embedding";
        tts: "tts";
        transcription: "transcription";
        voice: "voice";
    }>;
    label: z.ZodString;
    access: z.ZodEnum<{
        unknown: "unknown";
        available: "available";
        unavailable: "unavailable";
        "not-configured": "not-configured";
    }>;
    runtimeSupport: z.ZodEnum<{
        supported: "supported";
        unsupported: "unsupported";
    }>;
    features: z.ZodObject<{
        tools: z.ZodBoolean;
        stream: z.ZodBoolean;
        structuredOutput: z.ZodBoolean;
    }, z.core.$strict>;
    limits: z.ZodOptional<z.ZodObject<{
        maxInputTokens: z.ZodOptional<z.ZodNumber>;
        maxOutputTokens: z.ZodOptional<z.ZodNumber>;
        maxInputCharacters: z.ZodOptional<z.ZodNumber>;
        maxAudioSeconds: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>>;
    embeddingDimensions: z.ZodOptional<z.ZodNumber>;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type ModelCatalogEntry = z.infer<typeof ModelCatalogEntrySchema>;
/** Metadata snapshot scoped to one management agent; producer owns discovery and source-version invalidation. */
export declare const ModelCatalogSchema: z.ZodObject<{
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    version: z.ZodString;
    sourceVersion: z.ZodString;
    source: z.ZodEnum<{
        "provider-api": "provider-api";
        "provider-documentation": "provider-documentation";
        "server-registry": "server-registry";
    }>;
    observedAt: z.ZodNullable<z.ZodISODateTime>;
    validUntil: z.ZodNullable<z.ZodISODateTime>;
    state: z.ZodEnum<{
        available: "available";
        unavailable: "unavailable";
        "not-configured": "not-configured";
        partial: "partial";
    }>;
    entries: z.ZodArray<z.ZodObject<{
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
        function: z.ZodEnum<{
            reasoning: "reasoning";
            "memory-extraction": "memory-extraction";
            embedding: "embedding";
            tts: "tts";
            transcription: "transcription";
            voice: "voice";
        }>;
        label: z.ZodString;
        access: z.ZodEnum<{
            unknown: "unknown";
            available: "available";
            unavailable: "unavailable";
            "not-configured": "not-configured";
        }>;
        runtimeSupport: z.ZodEnum<{
            supported: "supported";
            unsupported: "unsupported";
        }>;
        features: z.ZodObject<{
            tools: z.ZodBoolean;
            stream: z.ZodBoolean;
            structuredOutput: z.ZodBoolean;
        }, z.core.$strict>;
        limits: z.ZodOptional<z.ZodObject<{
            maxInputTokens: z.ZodOptional<z.ZodNumber>;
            maxOutputTokens: z.ZodOptional<z.ZodNumber>;
            maxInputCharacters: z.ZodOptional<z.ZodNumber>;
            maxAudioSeconds: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strict>>;
        embeddingDimensions: z.ZodOptional<z.ZodNumber>;
        reason: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ModelCatalog = z.infer<typeof ModelCatalogSchema>;
/** Normalize only at the server boundary; new wire descriptors always carry canonical ids. */
export declare function normalizeModelProvider(input: unknown): string | null;
/** Model names alone never establish protocol, adapter compatibility or identity. */
export declare function sameModelDescriptor(left: ModelDescriptor, right: ModelDescriptor): boolean;
//# sourceMappingURL=model-catalog.d.ts.map