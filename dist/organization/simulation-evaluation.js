import { z } from 'zod';
import { ScenarioVersionRefSchema } from "./scenario.js";
export const EvaluationVerdictSchema = z.enum(['met', 'not_met', 'not_observable']);
export const SimulationEvaluationItemSchema = z
    .strictObject({
    expectationId: z.string().min(1),
    verdict: EvaluationVerdictSchema,
    observed: z.string().min(1).optional(),
    reason: z.string().min(1).optional(),
})
    .superRefine((item, ctx) => {
    if (item.verdict === 'not_met' && item.observed === undefined) {
        ctx.addIssue({ code: 'custom', path: ['observed'], message: 'not_met requires observed' });
    }
    if (item.verdict === 'not_observable' && item.reason === undefined) {
        ctx.addIssue({ code: 'custom', path: ['reason'], message: 'not_observable requires reason' });
    }
});
export const SimulationBoundarySchema = z.strictObject({
    name: z.string().min(1),
    kind: z.enum(['real', 'replaced', 'simulated_fault']),
    note: z.string().min(1),
});
const EvaluationTotalsSchema = z.strictObject({
    met: z.number().int().min(0),
    notMet: z.number().int().min(0),
    notObservable: z.number().int().min(0),
    applicable: z.number().int().min(0),
});
/** Unobservable expectations never contribute to the applicable denominator. */
export function summarizeEvaluationItems(items) {
    const totals = { met: 0, notMet: 0, notObservable: 0, applicable: 0 };
    for (const item of items) {
        switch (item.verdict) {
            case 'met':
                totals.met++;
                break;
            case 'not_met':
                totals.notMet++;
                break;
            case 'not_observable':
                totals.notObservable++;
                break;
        }
    }
    totals.applicable = totals.met + totals.notMet;
    return totals;
}
export const SimulationEvaluationSchema = z
    .strictObject({
    schemaVersion: z.literal(1),
    worldId: z.string().min(1),
    scenarioRef: ScenarioVersionRefSchema,
    scriptSha256: z.string().regex(/^[a-f0-9]{64}$/),
    items: z.array(SimulationEvaluationItemSchema).max(200),
    totals: EvaluationTotalsSchema,
    boundaries: z.array(SimulationBoundarySchema),
    limits: z.array(z.string().min(1)),
})
    .superRefine((evaluation, ctx) => {
    const expected = summarizeEvaluationItems(evaluation.items);
    for (const key of ['met', 'notMet', 'notObservable', 'applicable']) {
        if (evaluation.totals[key] !== expected[key]) {
            ctx.addIssue({
                code: 'custom',
                path: ['totals', key],
                message: `${key} must match the item counts`,
            });
        }
    }
});
//# sourceMappingURL=simulation-evaluation.js.map