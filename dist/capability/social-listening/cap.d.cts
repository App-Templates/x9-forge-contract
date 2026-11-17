import { z } from 'zod';
/** D24: daily pay-per-use server budget for one agent, in USD. */
export declare const SOCIAL_SERVER_DAILY_CAP_DEFAULT_USD = 2;
export declare const SocialCapCheckSchema: z.ZodObject<{
    track: z.ZodEnum<{
        mac: "mac";
        server: "server";
    }>;
    capUsd: z.ZodNumber;
    spentUsd: z.ZodNumber;
    estimateUsd: z.ZodNumber;
}, z.core.$strict>;
/** Check the agent's day total before reserving a call; the service owns the ledger and day. */
export declare function socialCapDecision(input: unknown): {
    ok: true;
    capped: false;
} | {
    ok: true;
    capped: true;
    remainingUsd: number;
} | {
    ok: false;
    reason: 'cap_reached';
    remainingUsd: number;
} | {
    ok: false;
    reason: 'invalid_input';
};
//# sourceMappingURL=cap.d.ts.map