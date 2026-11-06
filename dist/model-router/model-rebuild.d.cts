import { z } from 'zod';
/** The consumer computes spaceId from the descriptor, dimensions and scope; the bridge preserves it. */
export declare const EmbeddingSpaceSchema: z.ZodObject<{
    spaceId: z.ZodString;
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
    dimensions: z.ZodNumber;
}, z.core.$strict>;
export type EmbeddingSpace = z.infer<typeof EmbeddingSpaceSchema>;
/** Memory and RAG persist this destination before enqueueing any rebuild work. */
export declare const ModelRebuildTargetSchema: z.ZodObject<{
    requestId: z.ZodString;
    slotId: z.ZodString;
    space: z.ZodObject<{
        spaceId: z.ZodString;
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
        dimensions: z.ZodNumber;
    }, z.core.$strict>;
    generation: z.ZodObject<{
        presetId: z.ZodNullable<z.ZodNumber>;
        agentGeneration: z.ZodNumber;
        presetGeneration: z.ZodNumber;
    }, z.core.$strict>;
    etag: z.ZodString;
    requestedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type ModelRebuildTarget = z.infer<typeof ModelRebuildTargetSchema>;
export declare const ModelRebuildStateSchema: z.ZodObject<{
    active: z.ZodObject<{
        spaceId: z.ZodString;
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
        dimensions: z.ZodNumber;
    }, z.core.$strict>;
    building: z.ZodNullable<z.ZodObject<{
        requestId: z.ZodString;
        slotId: z.ZodString;
        space: z.ZodObject<{
            spaceId: z.ZodString;
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
            dimensions: z.ZodNumber;
        }, z.core.$strict>;
        generation: z.ZodObject<{
            presetId: z.ZodNullable<z.ZodNumber>;
            agentGeneration: z.ZodNumber;
            presetGeneration: z.ZodNumber;
        }, z.core.$strict>;
        etag: z.ZodString;
        requestedAt: z.ZodISODateTime;
    }, z.core.$strict>>;
    progress: z.ZodNullable<z.ZodObject<{
        completed: z.ZodNumber;
        total: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ModelRebuildState = z.infer<typeof ModelRebuildStateSchema>;
export declare const REBUILD_DECISIONS: readonly ["start", "keep", "supersede", "cancel", "discard", "re-read", "noop"];
export type RebuildDecision = typeof REBUILD_DECISIONS[number];
/** Supersede and cancel stop the current job and abandon its collection; the active space stays usable. */
export declare function rebuildDecision(next: ModelRebuildTarget, state: ModelRebuildState): RebuildDecision;
/** Workers check the persisted state before every block so superseded or cancelled jobs stop themselves. */
export declare function isRebuildJobCurrent(jobRequestId: string, state: ModelRebuildState): boolean;
//# sourceMappingURL=model-rebuild.d.ts.map