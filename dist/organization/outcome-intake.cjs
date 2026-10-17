"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutcomeIntakeSchema = void 0;
const zod_1 = require("zod");
const run_context_js_1 = require("./run-context.cjs");
const run_outcome_js_1 = require("./run-outcome.cjs");
/** Experiment outcome intake; references carry no private research content. */
exports.OutcomeIntakeSchema = zod_1.z
    .strictObject({
    context: run_context_js_1.OrganizationRunContextSchema,
    experimentId: zod_1.z.string().min(1).brand(),
    /** Reference to the hypothesis, never its private text. */
    hypothesisRef: zod_1.z.string().min(1),
    baselineRef: run_outcome_js_1.EvidenceRefSchema,
    resultRef: run_outcome_js_1.EvidenceRefSchema,
    sameDenominator: zod_1.z.boolean(),
    /** Reference to the criterion fixed before observing the result. */
    criterionRef: zod_1.z.string().min(1),
    verdict: zod_1.z.enum(['confirmed', 'refuted', 'inconclusive']),
})
    .refine((outcome) => outcome.verdict === 'inconclusive' || outcome.sameDenominator, {
    message: 'Confirmed or refuted outcomes require the same denominator',
    path: ['sameDenominator'],
});
//# sourceMappingURL=outcome-intake.js.map