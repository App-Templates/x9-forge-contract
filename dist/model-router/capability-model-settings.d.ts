import { z } from 'zod';
/** Additive capability configuration; existing legacy routing DTOs remain unchanged. */
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
export type CapabilityModelSettings = z.infer<typeof CapabilityModelSettingsSchema>;
export type CapabilityModelValidationIssue = 'invalid-settings' | 'invalid-catalog' | 'agent-mismatch' | 'catalog-version-mismatch' | 'catalog-unavailable' | 'catalog-stale' | 'model-not-attested' | 'model-unavailable' | 'feature-unsupported';
/** Validate the selected metadata against a fresh catalog for the explicitly addressed management agent. */
export declare function validateCapabilityModels(input: unknown, source: unknown, agentId: string, now?: Date): CapabilityModelValidationIssue[];
//# sourceMappingURL=capability-model-settings.d.ts.map