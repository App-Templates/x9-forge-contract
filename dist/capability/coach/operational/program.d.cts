import { z } from 'zod';
import { CoachProgramSchema } from "../index.cjs";
import { CoachProgramVersionRefSchema } from "../program-version.cjs";
export declare function matchesProgram(x: {
    program: z.infer<typeof CoachProgramVersionRefSchema>;
    definition: z.infer<typeof CoachProgramSchema>;
}): boolean;
export declare const CoachProgramApplyRequestSchema: z.ZodObject<{
    expectedProgramVersion: z.ZodNullable<z.ZodNumber>;
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
    definition: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        programId: z.ZodString;
        kind: z.ZodString;
        title: z.ZodString;
        locale: z.ZodString;
        version: z.ZodNumber;
        steps: z.ZodArray<z.ZodObject<{
            stepId: z.ZodString;
            order: z.ZodNumber;
            title: z.ZodString;
            durationMinutes: z.ZodOptional<z.ZodNumber>;
            technique: z.ZodOptional<z.ZodString>;
            instructions: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    requestId: z.ZodString;
}, z.core.$strict>;
export type CoachProgramApplyRequest = z.infer<typeof CoachProgramApplyRequestSchema>;
export declare const CoachProgramApplyResultSchema: z.ZodObject<{
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
    definition: z.ZodObject<{
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        programId: z.ZodString;
        kind: z.ZodString;
        title: z.ZodString;
        locale: z.ZodString;
        version: z.ZodNumber;
        steps: z.ZodArray<z.ZodObject<{
            stepId: z.ZodString;
            order: z.ZodNumber;
            title: z.ZodString;
            durationMinutes: z.ZodOptional<z.ZodNumber>;
            technique: z.ZodOptional<z.ZodString>;
            instructions: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    ok: z.ZodLiteral<true>;
    requestId: z.ZodString;
    replayed: z.ZodBoolean;
}, z.core.$strict>;
export type CoachProgramApplyResult = z.infer<typeof CoachProgramApplyResultSchema>;
export declare function isCoachProgramApplyResultForRequest(raw: unknown, expected: unknown): boolean;
//# sourceMappingURL=program.d.ts.map