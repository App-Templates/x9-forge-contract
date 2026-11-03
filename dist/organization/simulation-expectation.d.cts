import { z } from 'zod';
/** One fixed expectation about what a simulated script must produce. */
export declare const SimulationExpectationSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"turn_outcome">;
    actionSeq: z.ZodNumber;
    status: z.ZodEnum<{
        succeeded: "succeeded";
        failed: "failed";
        cancelled: "cancelled";
        uncertain: "uncertain";
    }>;
    expectationId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"effects_total">;
    count: z.ZodNumber;
    expectationId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"no_effect_after_stop">;
    stopSeq: z.ZodNumber;
    expectationId: z.ZodString;
}, z.core.$strict>], "kind">;
export type SimulationExpectation = z.infer<typeof SimulationExpectationSchema>;
/**
 * Expectations kept separate from the script and bound to it by its SHA-256
 * (see `canonicalScriptHash`), so existing scripts stay valid.
 */
export declare const SimulationExpectationSetSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    scenarioRef: z.ZodObject<{
        scenarioId: z.ZodString;
        version: z.ZodNumber;
        contentSha256: z.ZodString;
    }, z.core.$strict>;
    scriptSha256: z.ZodString;
    expectations: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"turn_outcome">;
        actionSeq: z.ZodNumber;
        status: z.ZodEnum<{
            succeeded: "succeeded";
            failed: "failed";
            cancelled: "cancelled";
            uncertain: "uncertain";
        }>;
        expectationId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"effects_total">;
        count: z.ZodNumber;
        expectationId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"no_effect_after_stop">;
        stopSeq: z.ZodNumber;
        expectationId: z.ZodString;
    }, z.core.$strict>], "kind">>;
}, z.core.$strict>;
export type SimulationExpectationSet = z.infer<typeof SimulationExpectationSetSchema>;
//# sourceMappingURL=simulation-expectation.d.ts.map