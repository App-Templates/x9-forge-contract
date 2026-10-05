import { z } from 'zod';
/**
 * One project day of spend, as cap-ricerca counts it (v1.28.0, Phase 54). Read by the control panel (Forge).
 * `day` is the date in the project's time zone; `reservedUsd` is what running researches have reserved and not yet
 * settled (an unknown cost is never free: it stays reserved).
 */
export declare const ProjectDaySchema: z.ZodString;
export declare const ProjectSpendDaySchema: z.ZodObject<{
    projectId: z.ZodString;
    day: z.ZodString;
    spentUsd: z.ZodNumber;
    reservedUsd: z.ZodNumber;
    capUsd: z.ZodNumber;
    calls: z.ZodNumber;
    webCalls: z.ZodNumber;
}, z.core.$strict>;
export type ProjectSpendDay = z.infer<typeof ProjectSpendDaySchema>;
//# sourceMappingURL=spend.d.ts.map