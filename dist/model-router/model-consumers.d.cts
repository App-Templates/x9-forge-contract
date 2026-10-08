import { z } from 'zod';
/** Server consumer requirements, not model support, credential access or installed-agent evidence. */
export declare const ModelConsumerSchema: z.ZodObject<{
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
    requirements: z.ZodObject<{
        tools: z.ZodBoolean;
        stream: z.ZodBoolean;
        structuredOutput: z.ZodBoolean;
    }, z.core.$strict>;
}, z.core.$strict>;
export type ModelConsumer = z.infer<typeof ModelConsumerSchema>;
export declare const ModelConsumerRegistrySchema: z.ZodArray<z.ZodObject<{
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
    requirements: z.ZodObject<{
        tools: z.ZodBoolean;
        stream: z.ZodBoolean;
        structuredOutput: z.ZodBoolean;
    }, z.core.$strict>;
}, z.core.$strict>>;
export type ModelConsumerRegistry = z.infer<typeof ModelConsumerRegistrySchema>;
export declare const AGENT_CORE_MODEL_CAPABILITY_ID = "agent-core";
/** Existing complete fallback serves stream ingress; token streaming is not claimed by this metadata. */
export declare const AGENT_CORE_MODEL_CONSUMER: Readonly<{
    slotId: string;
    capability: string;
    function: "reasoning";
    requirements: Readonly<{
        tools: true;
        stream: false;
        structuredOutput: false;
    }>;
}>;
/** Detached reads prevent one caller from changing another caller's binding or requirements. */
export declare function registeredModelConsumers(): ModelConsumerRegistry;
/** Exact server registration only. Unknown or malformed input never selects a default consumer. */
export declare function findModelConsumer(slotId: unknown): ModelConsumer | undefined;
//# sourceMappingURL=model-consumers.d.ts.map