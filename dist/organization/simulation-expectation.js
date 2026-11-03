import { z } from 'zod';
import { RunOutcomeStatusSchema } from "./run-outcome.js";
import { ScenarioVersionRefSchema } from "./scenario.js";
const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);
const expectationBase = { expectationId: z.string().min(1) };
/** One fixed expectation about what a simulated script must produce. */
export const SimulationExpectationSchema = z.discriminatedUnion('kind', [
    z.strictObject({
        ...expectationBase,
        kind: z.literal('turn_outcome'),
        actionSeq: z.number().int().min(0),
        status: RunOutcomeStatusSchema,
    }),
    z.strictObject({
        ...expectationBase,
        kind: z.literal('effects_total'),
        count: z.number().int().min(0),
    }),
    z.strictObject({
        ...expectationBase,
        kind: z.literal('no_effect_after_stop'),
        stopSeq: z.number().int().min(0),
    }),
]);
/**
 * Expectations kept separate from the script and bound to it by its SHA-256
 * (see `canonicalScriptHash`), so existing scripts stay valid.
 */
export const SimulationExpectationSetSchema = z
    .strictObject({
    schemaVersion: z.literal(1),
    scenarioRef: ScenarioVersionRefSchema,
    scriptSha256: Sha256Schema,
    expectations: z.array(SimulationExpectationSchema).min(1).max(200),
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