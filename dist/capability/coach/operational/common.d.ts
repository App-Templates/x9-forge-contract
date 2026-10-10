import { z } from 'zod';
import { type CoachSessionOpeningRef } from "../execution.js";
import { DecisionCodes, sameValue } from "../shared.js";
export declare const RevisionNumber: z.ZodNumber;
export declare const CoachOperationalCommandMetadataSchema: z.ZodObject<{
    requestId: z.ZodString;
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
    expectedRevision: z.ZodNumber;
}, z.core.$strict>;
export type CoachOperationalCommandMetadata = z.infer<typeof CoachOperationalCommandMetadataSchema>;
export declare const result: {
    ok: z.ZodLiteral<true>;
    requestId: z.ZodString;
    replayed: z.ZodBoolean;
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
    revision: z.ZodNumber;
};
export { DecisionCodes, sameValue };
export declare function forOpening(record: {
    scope: CoachSessionOpeningRef['scope'];
    sessionId: string;
    openingId: string;
}, opening: CoachSessionOpeningRef): boolean;
//# sourceMappingURL=common.d.ts.map