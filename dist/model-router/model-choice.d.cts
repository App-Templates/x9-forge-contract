import { z } from 'zod';
import type { ModelFeaturesSchema } from "./model-catalog.cjs";
import type { CapabilityModelSettings } from "./capability-model-settings.cjs";
/** A model choice that is valid for a preset row and for an agent, not tied to a catalog version. */
export declare const ModelChoiceSchema: z.ZodUnion<readonly [z.ZodObject<{
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
export type ModelChoice = z.infer<typeof ModelChoiceSchema>;
/** Detached copy of the settings without `catalogVersion` and `requirements`. */
export declare function toModelChoice(settings: CapabilityModelSettings): ModelChoice;
/** Adds the catalog version and requirements back and re-validates with the full settings schema. */
export declare function toCapabilityModelSettings(choice: ModelChoice, extra: {
    catalogVersion: string;
    requirements: z.infer<typeof ModelFeaturesSchema>;
}): CapabilityModelSettings;
//# sourceMappingURL=model-choice.d.ts.map