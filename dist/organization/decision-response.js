import { z } from 'zod';
import { OrganizationRunContextSchema } from "./run-context.js";
import { EvidenceRefSchema } from "./run-outcome.js";
/** One alternative considered for a decision. */
export const DecisionAlternativeSchema = z.strictObject({
    label: z.string().min(1).max(200),
    reason: z.string().min(1).max(500),
});
export const DecisionCompletenessSchema = z.enum(['complete', 'incomplete', 'denied']);
/**
 * Structured decision response. Without evidence the response is incomplete;
 * `denied` must carry a reason, other states must not.
 */
export const DecisionResponseSchema = z
    .strictObject({
    context: OrganizationRunContextSchema,
    decision: z.string().min(1).max(500),
    alternatives: z.array(DecisionAlternativeSchema).min(1),
    recommendation: z.string().min(1).max(500),
    uncertainties: z.array(z.string()),
    verifications: z.array(z.string()),
    evidence: z.array(EvidenceRefSchema).min(1),
    completeness: DecisionCompletenessSchema,
    denialReason: z.string().min(1).max(300).optional(),
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