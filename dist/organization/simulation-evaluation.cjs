"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulationEvaluationSchema = exports.SimulationBoundarySchema = exports.SimulationEvaluationItemSchema = exports.EvaluationVerdictSchema = void 0;
exports.summarizeEvaluationItems = summarizeEvaluationItems;
const zod_1 = require("zod");
const scenario_js_1 = require("./scenario.cjs");
exports.EvaluationVerdictSchema = zod_1.z.enum(['met', 'not_met', 'not_observable']);
exports.SimulationEvaluationItemSchema = zod_1.z
    .strictObject({
    expectationId: zod_1.z.string().min(1),
    verdict: exports.EvaluationVerdictSchema,
    observed: zod_1.z.string().min(1).optional(),
    reason: zod_1.z.string().min(1).optional(),
})
    .superRefine((item, ctx) => {
    if (item.verdict === 'not_met' && item.observed === undefined) {
        ctx.addIssue({ code: 'custom', path: ['observed'], message: 'not_met requires observed' });
    }
    if (item.verdict === 'not_observable' && item.reason === undefined) {
        ctx.addIssue({ code: 'custom', path: ['reason'], message: 'not_observable requires reason' });
    }
});
exports.SimulationBoundarySchema = zod_1.z.strictObject({
    name: zod_1.z.string().min(1),
    kind: zod_1.z.enum(['real', 'replaced', 'simulated_fault']),
    note: zod_1.z.string().min(1),
});
const EvaluationTotalsSchema = zod_1.z.strictObject({
    met: zod_1.z.number().int().min(0),
    notMet: zod_1.z.number().int().min(0),
    notObservable: zod_1.z.number().int().min(0),
    applicable: zod_1.z.number().int().min(0),
});
/** Unobservable expectations never contribute to the applicable denominator. */
function summarizeEvaluationItems(items) {
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
exports.SimulationEvaluationSchema = zod_1.z
    .strictObject({
    schemaVersion: zod_1.z.literal(1),
    worldId: zod_1.z.string().min(1),
    scenarioRef: scenario_js_1.ScenarioVersionRefSchema,
    scriptSha256: zod_1.z.string().regex(/^[a-f0-9]{64}$/),
    items: zod_1.z.array(exports.SimulationEvaluationItemSchema).max(200),
    totals: EvaluationTotalsSchema,
    boundaries: zod_1.z.array(exports.SimulationBoundarySchema),
    limits: zod_1.z.array(zod_1.z.string().min(1)),
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