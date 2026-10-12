import { z } from 'zod';
export declare const CoachSessionOpeningRefSchema: z.ZodObject<{
    openingId: z.ZodString;
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
        userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
    }, z.core.$strict>;
    sessionId: z.ZodString;
    program: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        programId: z.ZodString;
        programVersion: z.ZodNumber;
        strategy: z.ZodObject<{
            strategyId: z.ZodString;
            strategyVersion: z.ZodString;
        }, z.core.$strict>;
        catalogRevision: z.ZodString;
        policyRevision: z.ZodString;
        progressionRevision: z.ZodString;
        measureDefinitionRevision: z.ZodString;
    }, z.core.$strict>;
    appliedConfigVersion: z.ZodNumber;
    openedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type CoachSessionOpeningRef = z.infer<typeof CoachSessionOpeningRefSchema>;
export declare const CoachExecutionSegmentSchema: z.ZodObject<{
    segmentId: z.ZodString;
    stepId: z.ZodOptional<z.ZodString>;
    offsetSeconds: z.ZodNumber;
    durationSeconds: z.ZodNumber;
}, z.core.$strict>;
export type CoachExecutionSegment = z.infer<typeof CoachExecutionSegmentSchema>;
export declare const CoachSessionExecutionSnapshotSchema: z.ZodObject<{
    startedAt: z.ZodISODateTime;
    segments: z.ZodArray<z.ZodObject<{
        segmentId: z.ZodString;
        stepId: z.ZodOptional<z.ZodString>;
        offsetSeconds: z.ZodNumber;
        durationSeconds: z.ZodNumber;
    }, z.core.$strict>>;
    totalSeconds: z.ZodNumber;
    decisionCodes: z.ZodArray<z.ZodString>;
    snapshotId: z.ZodString;
    opening: z.ZodObject<{
        openingId: z.ZodString;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
            userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
        }, z.core.$strict>;
        sessionId: z.ZodString;
        program: z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            programId: z.ZodString;
            programVersion: z.ZodNumber;
            strategy: z.ZodObject<{
                strategyId: z.ZodString;
                strategyVersion: z.ZodString;
            }, z.core.$strict>;
            catalogRevision: z.ZodString;
            policyRevision: z.ZodString;
            progressionRevision: z.ZodString;
            measureDefinitionRevision: z.ZodString;
        }, z.core.$strict>;
        appliedConfigVersion: z.ZodNumber;
        openedAt: z.ZodISODateTime;
    }, z.core.$strict>;
}, z.core.$strict>;
export type CoachSessionExecutionSnapshot = z.infer<typeof CoachSessionExecutionSnapshotSchema>;
export declare const CoachSessionPlanRevisionSchema: z.ZodObject<{
    segments: z.ZodArray<z.ZodObject<{
        segmentId: z.ZodString;
        stepId: z.ZodOptional<z.ZodString>;
        offsetSeconds: z.ZodNumber;
        durationSeconds: z.ZodNumber;
    }, z.core.$strict>>;
    totalSeconds: z.ZodNumber;
    decisionCodes: z.ZodArray<z.ZodString>;
    revisionId: z.ZodString;
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
        userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
    }, z.core.$strict>;
    sessionId: z.ZodString;
    snapshotId: z.ZodString;
    sequence: z.ZodNumber;
    appliedAt: z.ZodISODateTime;
    effectiveFromSeconds: z.ZodNumber;
}, z.core.$strict>;
export type CoachSessionPlanRevision = z.infer<typeof CoachSessionPlanRevisionSchema>;
export declare function isCoachExecutionSnapshotForOpening(raw: unknown, expected: unknown): boolean;
export declare function isCoachSessionPlanRevisionForSnapshot(raw: unknown, expected: unknown): boolean;
//# sourceMappingURL=execution.d.ts.map