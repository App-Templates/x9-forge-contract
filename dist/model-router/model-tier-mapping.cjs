"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelTierMappingSchema = void 0;
const zod_1 = require("zod");
const model_tier_js_1 = require("./model-tier.cjs");
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
const _RawModelTierMappingSchema = zod_1.z.record(model_tier_js_1.ModelTierSchema, zod_1.z.string().min(1).optional());
exports.ModelTierMappingSchema = _RawModelTierMappingSchema.superRefine((m, ctx) => {
    const missing = model_tier_js_1.MODEL_TIERS.filter((t) => m[t] === undefined);
    if (missing.length > 0) {
        ctx.addIssue({
            code: 'custom',
            message: `ModelTierMapping is incomplete — missing mapping for tier(s): ${missing.join(', ')}`,
        });
    }
});
//# sourceMappingURL=model-tier-mapping.js.map