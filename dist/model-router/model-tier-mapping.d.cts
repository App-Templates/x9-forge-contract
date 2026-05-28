import { z } from 'zod';
import { type ModelTier } from "./model-tier.cjs";
export declare const ModelTierMappingSchema: z.ZodRecord<z.ZodEnum<{
    standard: "standard";
    advanced: "advanced";
    reasoning: "reasoning";
}>, z.ZodOptional<z.ZodString>>;
/**
 * Narrowed type — the schema refine proves completeness at parse time, but
 * `z.infer<typeof ModelTierMappingSchema>` is `Partial<Record<ModelTier,string>>`.
 * We export the narrowed `Record<ModelTier, string>` manually (gotcha R-13 per
 * 06-RESEARCH §Zod v4 API Specifics — `.refine` type guard does not propagate
 * through `z.infer`). Consumers should read this type as complete.
 */
export type ModelTierMapping = Record<ModelTier, string>;
//# sourceMappingURL=model-tier-mapping.d.ts.map