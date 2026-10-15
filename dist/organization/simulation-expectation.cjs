"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulationExpectationSetSchema = exports.SimulationExpectationSchema = void 0;
const zod_1 = require("zod");
const run_outcome_js_1 = require("./run-outcome.cjs");
const scenario_js_1 = require("./scenario.cjs");
const Sha256Schema = zod_1.z.string().regex(/^[a-f0-9]{64}$/);
const expectationBase = { expectationId: zod_1.z.string().min(1) };
/** One fixed expectation about what a simulated script must produce. */
exports.SimulationExpectationSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.strictObject({
        ...expectationBase,
        kind: zod_1.z.literal('turn_outcome'),
        actionSeq: zod_1.z.number().int().min(0),
        status: run_outcome_js_1.RunOutcomeStatusSchema,
    }),
    zod_1.z.strictObject({
        ...expectationBase,
        kind: zod_1.z.literal('effects_total'),
        count: zod_1.z.number().int().min(0),
    }),
    zod_1.z.strictObject({
        ...expectationBase,
        kind: zod_1.z.literal('no_effect_after_stop'),
        stopSeq: zod_1.z.number().int().min(0),
    }),
]);
/**
 * Expectations kept separate from the script and bound to it by its SHA-256
 * (see `canonicalScriptHash`), so existing scripts stay valid.
 */
exports.SimulationExpectationSetSchema = zod_1.z
    .strictObject({
    schemaVersion: zod_1.z.literal(1),
    scenarioRef: scenario_js_1.ScenarioVersionRefSchema,
    scriptSha256: Sha256Schema,
    expectations: zod_1.z.array(exports.SimulationExpectationSchema).min(1).max(200),
})
    .superRefine((set, ctx) => {
    const seen = new Set();
    set.expectations.forEach((expectation, index) => {
        if (seen.has(expectation.expectationId)) {
            ctx.addIssue({
                code: 'custom',
                path: ['expectations', index, 'expectationId'],
                message: 'expectationId must be unique',
            });
        }
        seen.add(expectation.expectationId);
    });
});
//# sourceMappingURL=simulation-expectation.js.map