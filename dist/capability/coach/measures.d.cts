import { z } from 'zod';
export declare const CoachMeasureDefinitionSchema: z.ZodObject<{
    measureId: z.ZodString;
    version: z.ZodString;
    unit: z.ZodString;
    min: z.ZodNumber;
    max: z.ZodNumber;
}, z.core.$strict>;
export type CoachMeasureDefinition = z.infer<typeof CoachMeasureDefinitionSchema>;
export declare const CoachMeasureObservationSchema: z.ZodObject<{
    observationId: z.ZodString;
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
        userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
    }, z.core.$strict>;
    sessionId: z.ZodString;
    openingId: z.ZodString;
    snapshotId: z.ZodNullable<z.ZodString>;
    measureId: z.ZodString;
    definitionVersion: z.ZodString;
    unit: z.ZodString;
    observedAt: z.ZodISODateTime;
    provenance: z.ZodDiscriminatedUnion<[z.ZodObject<{
        sourceRef: z.ZodString;
        source: z.ZodLiteral<"server-clock">;
    }, z.core.$strict>, z.ZodObject<{
        sourceRef: z.ZodString;
        source: z.ZodLiteral<"self-report">;
    }, z.core.$strict>, z.ZodObject<{
        strategyId: z.ZodString;
        strategyVersion: z.ZodString;
        sourceRef: z.ZodString;
        source: z.ZodLiteral<"strategy">;
    }, z.core.$strict>], "source">;
    value: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"known">;
        value: z.ZodNumber;
        confidence: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"unknown">;
        reason: z.ZodString;
    }, z.core.$strict>], "kind">;
}, z.core.$strict>;
export type CoachMeasureObservation = z.infer<typeof CoachMeasureObservationSchema>;
export declare function isCoachMeasureForDefinition(raw: unknown, expected: unknown): boolean;
//# sourceMappingURL=measures.d.ts.map