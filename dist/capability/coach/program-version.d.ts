import { z } from 'zod';
export declare const CoachStrategyRefSchema: z.ZodObject<{
    strategyId: z.ZodString;
    strategyVersion: z.ZodString;
}, z.core.$strict>;
export type CoachStrategyRef = z.infer<typeof CoachStrategyRefSchema>;
export declare const CoachProgramVersionRefSchema: z.ZodObject<{
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
export type CoachProgramVersionRef = z.infer<typeof CoachProgramVersionRefSchema>;
//# sourceMappingURL=program-version.d.ts.map