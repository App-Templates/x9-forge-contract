import { z } from 'zod';
/** Metadata-only discovery scoped to the management agent and its effective credentials. */
export declare const internalAgentModelCatalogContract: {
    readonly method: "GET";
    readonly path: "/internal/agents/:agentId/models/catalog";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
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
};
export declare function agentModelCatalogPath(agentId: string): string;
//# sourceMappingURL=internal-agent-model-catalog.d.ts.map