import { z } from 'zod';
/**
 * Per-agent override for Model Router config — cristallizza la visione
 * "clone X su Opus 4.6" (Stefano): pin a specific agent to a tier or a
 * specific model id, independent of the global mapping.
 *
 * Semantic note (D-21): an override here is equivalent to `VaultTier === 'agent'`
 * in the vault domain — but stored in the model config, not the vault (avoids
 * recursion + allows independent hot-reload).
 *
 * Invariant (D-20): must specify at least one of `policy` or `tierMapping`.
 *
 * Partial tierMapping (D-22): unlike the global `ModelTierMapping` which
 * requires all tiers, per-agent overrides may specify a subset. Tiers not
 * overridden fall back to the provider's global mapping.
 *
 * @status greenfield — consumers planned, no live endpoint yet
 * @see CONTEXT D-20, D-21, D-22
 * @see AgentIdentitySchema (branded — Phase 2)
 */
export declare const PerAgentModelOverrideSchema: z.ZodObject<{
    agentId: z.ZodObject<{
        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    }, z.core.$strip>;
    policy: z.ZodOptional<z.ZodObject<{
        min: z.ZodEnum<{
            standard: "standard";
            advanced: "advanced";
            reasoning: "reasoning";
        }>;
        max: z.ZodEnum<{
            standard: "standard";
            advanced: "advanced";
            reasoning: "reasoning";
        }>;
    }, z.core.$strip>>;
    tierMapping: z.ZodOptional<z.ZodRecord<z.ZodEnum<{
        standard: "standard";
        advanced: "advanced";
        reasoning: "reasoning";
    }>, z.ZodOptional<z.ZodString>>>;
}, z.core.$strip>;
export type PerAgentModelOverride = z.infer<typeof PerAgentModelOverrideSchema>;
//# sourceMappingURL=per-agent-model-override.d.ts.map