import { z } from 'zod';
export declare const CoachRollingBudgetSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
        userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
    }, z.core.$strict>;
    windowSeconds: z.ZodNumber;
    asOf: z.ZodISODateTime;
    windowStart: z.ZodISODateTime;
    limitSeconds: z.ZodNumber;
    usedSeconds: z.ZodNumber;
}, z.core.$strict>;
export type CoachRollingBudget = z.infer<typeof CoachRollingBudgetSchema>;
export declare const CoachSessionQuotaSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
        userId: z.ZodNonOptional<z.ZodOptional<z.ZodString>>;
    }, z.core.$strict>;
    budgetAsOf: z.ZodISODateTime;
    remainingSeconds: z.ZodNumber;
    shareLimitSeconds: z.ZodNumber;
    limitSeconds: z.ZodNumber;
}, z.core.$strict>;
export type CoachSessionQuota = z.infer<typeof CoachSessionQuotaSchema>;
export declare function coachRollingRemainingSeconds(raw: unknown): number | null;
//# sourceMappingURL=rolling-budget.d.ts.map