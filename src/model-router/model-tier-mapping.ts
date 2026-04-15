import { z } from 'zod';
import { ModelTierSchema, MODEL_TIERS, type ModelTier } from './model-tier.js';

/**
 * Complete tier → modelId mapping for a single provider.
 *
 *   { standard: 'gpt-4.1-mini', advanced: 'o4-mini', reasoning: 'o3' }
 *
 * Completeness is enforced via `.refine()` — a partial mapping is rejected.
 * Rationale (D-10): a partial mapping at runtime is fragile (fallback
 * ambiguous). Force full coverage contractually.
 *
 * NOTE: Provider scoping lives at the `ModelPushRequest` level (D-09), not
 * inside this mapping. Each provider gets its own `ModelTierMapping` in
 * `ModelPushRequest.providers`.
 *
 * @status greenfield — consumers planned, no live endpoint yet
 * @see CONTEXT D-09, D-10
 */
const _RawModelTierMappingSchema = z.record(ModelTierSchema, z.string().min(1).optional());

export const ModelTierMappingSchema = _RawModelTierMappingSchema.superRefine((m, ctx) => {
  const missing = MODEL_TIERS.filter((t) => typeof m[t] !== 'string' || (m[t] ?? '').length === 0);
  if (missing.length > 0) {
    ctx.addIssue({
      code: 'custom',
      message: `ModelTierMapping is incomplete — missing mapping for tier(s): ${missing.join(', ')}`,
    });
  }
});

/**
 * Narrowed type — the schema refine proves completeness at parse time, but
 * `z.infer<typeof ModelTierMappingSchema>` is `Partial<Record<ModelTier,string>>`.
 * We export the narrowed `Record<ModelTier, string>` manually (gotcha R-13 per
 * 06-RESEARCH §Zod v4 API Specifics — `.refine` type guard does not propagate
 * through `z.infer`). Consumers should read this type as complete.
 */
export type ModelTierMapping = Record<ModelTier, string>;
