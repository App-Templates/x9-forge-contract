"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelPolicySchema = void 0;
const zod_1 = require("zod");
const model_tier_js_1 = require("./model-tier.cjs");
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
exports.ModelPolicySchema = zod_1.z.object({
    min: model_tier_js_1.ModelTierSchema,
    max: model_tier_js_1.ModelTierSchema,
}).superRefine((p, ctx) => {
    if ((0, model_tier_js_1.compareTiers)(p.min, p.max) > 0) {
        ctx.addIssue({
            code: 'custom',
            path: ['max'],
            message: `ModelPolicy invariant violated: min=${p.min} must be <= max=${p.max}`,
        });
    }
});
//# sourceMappingURL=model-policy.js.map