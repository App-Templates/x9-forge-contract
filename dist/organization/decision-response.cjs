"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionResponseSchema = exports.DecisionCompletenessSchema = exports.DecisionAlternativeSchema = void 0;
const zod_1 = require("zod");
const run_context_js_1 = require("./run-context.cjs");
const run_outcome_js_1 = require("./run-outcome.cjs");
/** One alternative considered for a decision. */
exports.DecisionAlternativeSchema = zod_1.z.strictObject({
    label: zod_1.z.string().min(1).max(200),
    reason: zod_1.z.string().min(1).max(500),
});
exports.DecisionCompletenessSchema = zod_1.z.enum(['complete', 'incomplete', 'denied']);
/**
 * Structured decision response. Without evidence the response is incomplete;
 * `denied` must carry a reason, other states must not.
 */
exports.DecisionResponseSchema = zod_1.z
    .strictObject({
    context: run_context_js_1.OrganizationRunContextSchema,
    decision: zod_1.z.string().min(1).max(500),
    alternatives: zod_1.z.array(exports.DecisionAlternativeSchema).min(1),
    recommendation: zod_1.z.string().min(1).max(500),
    uncertainties: zod_1.z.array(zod_1.z.string()),
    verifications: zod_1.z.array(zod_1.z.string()),
    evidence: zod_1.z.array(run_outcome_js_1.EvidenceRefSchema).min(1),
    completeness: exports.DecisionCompletenessSchema,
    denialReason: zod_1.z.string().min(1).max(300).optional(),
})
    .superRefine((r, ctx) => {
    if (r.completeness === 'denied' && r.denialReason === undefined) {
        ctx.addIssue({
            code: 'custom',
            message: "completeness 'denied' requires denialReason",
            path: ['denialReason'],
        });
    }
    if (r.completeness !== 'denied' && r.denialReason !== undefined) {
        ctx.addIssue({
            code: 'custom',
            message: "denialReason is only allowed when completeness is 'denied'",
            path: ['denialReason'],
        });
    }
});
//# sourceMappingURL=decision-response.js.map