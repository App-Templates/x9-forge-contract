import { z } from 'zod';
/**
 * Growth history complements src/http/endpoints/internal-capability-agent.ts:102,
 * whose growth snapshot carries only agentId. Scores reuse the competence view
 * in src/capability/lab/competence.ts:15 (score at line 22).
 * Callers must verify scope against trusted identity before accessing storage;
 * the same agentId under another tenant or owner identifies a different notebook.
 */
export declare const LabScopeSchema: z.ZodObject<{
    tenantId: z.ZodString;
    ownerId: z.ZodString;
    agentId: z.ZodString;
}, z.core.$strict>;
export type LabScope = z.infer<typeof LabScopeSchema>;
export declare const LabGrowthPointSchema: z.ZodObject<{
    at: z.ZodISODateTime;
    method: z.ZodString;
    methodVersion: z.ZodString;
    numerator: z.ZodNumber;
    denominator: z.ZodNumber;
    score: z.ZodNullable<z.ZodNumber>;
}, z.core.$strict>;
export type LabGrowthPoint = z.infer<typeof LabGrowthPointSchema>;
export declare const LabGrowthHistoryInputSchema: z.ZodObject<{
    scope: z.ZodObject<{
        tenantId: z.ZodString;
        ownerId: z.ZodString;
        agentId: z.ZodString;
    }, z.core.$strict>;
    limit: z.ZodDefault<z.ZodNumber>;
    cursor: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type LabGrowthHistoryInput = z.infer<typeof LabGrowthHistoryInputSchema>;
export declare const LabGrowthHistoryOutputSchema: z.ZodObject<{
    snapshotVersion: z.ZodNumber;
    scope: z.ZodObject<{
        tenantId: z.ZodString;
        ownerId: z.ZodString;
        agentId: z.ZodString;
    }, z.core.$strict>;
    points: z.ZodArray<z.ZodObject<{
        at: z.ZodISODateTime;
        method: z.ZodString;
        methodVersion: z.ZodString;
        numerator: z.ZodNumber;
        denominator: z.ZodNumber;
        score: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strict>>;
    nextCursor: z.ZodNullable<z.ZodString>;
    state: z.ZodEnum<{
        ok: "ok";
        unavailable: "unavailable";
        empty: "empty";
    }>;
}, z.core.$strict>;
export type LabGrowthHistoryOutput = z.infer<typeof LabGrowthHistoryOutputSchema>;
//# sourceMappingURL=growth.d.ts.map