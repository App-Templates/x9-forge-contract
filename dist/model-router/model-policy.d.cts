import { z } from 'zod';
/**
 * Model policy — capability-scoped bound on allowed tier range.
 *
 *   { min: 'standard', max: 'reasoning' }  // any tier allowed
 *   { min: 'advanced', max: 'advanced' }   // force advanced
 *
 * Invariant (D-11): compareTiers(min, max) <= 0 — i.e. min must not exceed max.
 * Enforced via `.superRefine()`; violation produces a diagnostic message citing
 * the received min/max values.
 *
 * Default convention (D-12): `{ min: 'standard', max: 'standard' }` when a
 * consumer needs an implicit fallback. The bridge does NOT export a
 * DEFAULT_MODEL_POLICY const — defaults are a consumer decision.
 *
 * @status greenfield — consumers planned, no live endpoint yet
 * @see CONTEXT D-11, D-12
 * @see compareTiers
 */
export declare const ModelPolicySchema: z.ZodObject<{
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
}, z.core.$strip>;
export type ModelPolicy = z.infer<typeof ModelPolicySchema>;
//# sourceMappingURL=model-policy.d.ts.map