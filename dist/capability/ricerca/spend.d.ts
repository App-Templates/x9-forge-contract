import { z } from 'zod';
/**
 * One day of spend of one agent on one capability (v1.28.0, Phase 54). Read by the control panel (Forge).
 * `day` is the date in the agent's time zone; `reservedUsd` is what running calls have reserved and not yet settled
 * (an unknown cost is never free: it stays reserved).
 */
export declare const AgentDaySchema: z.ZodString;
/** The capabilities that report spend this way. */
export declare const SpendingCapabilitySchema: z.ZodEnum<{
    ricerca: "ricerca";
}>;
export type SpendingCapability = z.infer<typeof SpendingCapabilitySchema>;
export declare const AgentSpendDaySchema: z.ZodObject<{
    agentId: z.ZodString;
    capability: z.ZodEnum<{
        ricerca: "ricerca";
    }>;
    day: z.ZodString;
    spentUsd: z.ZodNumber;
    reservedUsd: z.ZodNumber;
    capUsd: z.ZodNumber;
    calls: z.ZodNumber;
    webCalls: z.ZodNumber;
    budgetStops: z.ZodNumber;
}, z.core.$strict>;
export type AgentSpendDay = z.infer<typeof AgentSpendDaySchema>;
//# sourceMappingURL=spend.d.ts.map