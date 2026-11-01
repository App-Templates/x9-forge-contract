import { z } from 'zod';
export declare const MODEL_CHAIN_STEP_ROLES: readonly ["draft", "critique", "close"];
export declare const ModelChainStepRoleSchema: z.ZodEnum<{
    draft: "draft";
    critique: "critique";
    close: "close";
}>;
export type ModelChainStepRole = z.infer<typeof ModelChainStepRoleSchema>;
export declare const MODEL_CHAIN_EFFORTS: readonly ["low", "medium", "high"];
export declare const ModelChainEffortSchema: z.ZodEnum<{
    low: "low";
    medium: "medium";
    high: "high";
}>;
export type ModelChainEffort = z.infer<typeof ModelChainEffortSchema>;
export declare const ModelChainIdSchema: z.ZodString;
export declare const ModelChainStepSchema: z.ZodObject<{
    role: z.ZodEnum<{
        draft: "draft";
        critique: "critique";
        close: "close";
    }>;
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
    effort: z.ZodEnum<{
        low: "low";
        medium: "medium";
        high: "high";
    }>;
}, z.core.$strict>;
export type ModelChainStep = z.infer<typeof ModelChainStepSchema>;
export declare const LAB_DIGEST_RELAY_CHAIN_ID = "lab_digest_relay";
export declare const LAB_ANTHROPIC_MESSAGES_ADAPTER_ID = "lab-anthropic-messages";
/** The only adapters a chain accepts, when it is not "any supported adapter". */
export declare const MODEL_CHAIN_ADAPTER_IDS: Readonly<Record<string, readonly string[]>>;
/** true when the chain has no adapter restriction, or the adapter is one of its allowed ones. */
export declare function modelChainAcceptsAdapter(chainId: unknown, adapterId: unknown): boolean;
export declare const ModelChainSchema: z.ZodObject<{
    chainId: z.ZodString;
    steps: z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<{
            draft: "draft";
            critique: "critique";
            close: "close";
        }>;
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
        effort: z.ZodEnum<{
            low: "low";
            medium: "medium";
            high: "high";
        }>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ModelChain = z.infer<typeof ModelChainSchema>;
//# sourceMappingURL=model-chain.d.ts.map