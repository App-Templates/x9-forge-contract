import { z } from 'zod';
export declare const EvaluationVerdictSchema: z.ZodEnum<{
    met: "met";
    not_met: "not_met";
    not_observable: "not_observable";
}>;
export type EvaluationVerdict = z.infer<typeof EvaluationVerdictSchema>;
export declare const SimulationEvaluationItemSchema: z.ZodObject<{
    expectationId: z.ZodString;
    verdict: z.ZodEnum<{
        met: "met";
        not_met: "not_met";
        not_observable: "not_observable";
    }>;
    observed: z.ZodOptional<z.ZodString>;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type SimulationEvaluationItem = z.infer<typeof SimulationEvaluationItemSchema>;
export declare const SimulationBoundarySchema: z.ZodObject<{
    name: z.ZodString;
    kind: z.ZodEnum<{
        real: "real";
        replaced: "replaced";
        simulated_fault: "simulated_fault";
    }>;
    note: z.ZodString;
}, z.core.$strict>;
export type SimulationBoundary = z.infer<typeof SimulationBoundarySchema>;
declare const EvaluationTotalsSchema: z.ZodObject<{
    met: z.ZodNumber;
    notMet: z.ZodNumber;
    notObservable: z.ZodNumber;
    applicable: z.ZodNumber;
}, z.core.$strict>;
export type SimulationEvaluationTotals = z.infer<typeof EvaluationTotalsSchema>;
/** Unobservable expectations never contribute to the applicable denominator. */
export declare function summarizeEvaluationItems(items: readonly SimulationEvaluationItem[]): SimulationEvaluationTotals;
export declare const SimulationEvaluationSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    worldId: z.ZodString;
    scenarioRef: z.ZodObject<{
        scenarioId: z.ZodString;
        version: z.ZodNumber;
        contentSha256: z.ZodString;
    }, z.core.$strict>;
    scriptSha256: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        expectationId: z.ZodString;
        verdict: z.ZodEnum<{
            met: "met";
            not_met: "not_met";
            not_observable: "not_observable";
        }>;
        observed: z.ZodOptional<z.ZodString>;
        reason: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    totals: z.ZodObject<{
        met: z.ZodNumber;
        notMet: z.ZodNumber;
        notObservable: z.ZodNumber;
        applicable: z.ZodNumber;
    }, z.core.$strict>;
    boundaries: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        kind: z.ZodEnum<{
            real: "real";
            replaced: "replaced";
            simulated_fault: "simulated_fault";
        }>;
        note: z.ZodString;
    }, z.core.$strict>>;
    limits: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export type SimulationEvaluation = z.infer<typeof SimulationEvaluationSchema>;
export {};
//# sourceMappingURL=simulation-evaluation.d.ts.map