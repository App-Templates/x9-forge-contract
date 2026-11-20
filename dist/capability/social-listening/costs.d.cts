import { z } from 'zod';
/** Costs report tool: read-only and separate from SOCIAL_LISTENING_TOOLS (the exact tool list stays unchanged). */
export declare const SOCIAL_COSTS_TOOLS: {
    readonly report: "social_costs_report";
};
/** Longest window of one costs report, days (both ends counted). */
export declare const SOCIAL_COSTS_REPORT_MAX_DAYS = 90;
/** No identity in the input: tenant, owner and agent come from the call envelope (R-33). */
export declare const SocialCostsReportInputSchema: z.ZodObject<{
    verticalId: z.ZodString;
    from: z.ZodString;
    to: z.ZodString;
}, z.core.$strict>;
export type SocialCostsReportInput = z.infer<typeof SocialCostsReportInputSchema>;
export declare const SocialCostsRoundSchema: z.ZodObject<{
    day: z.ZodString;
    track: z.ZodEnum<{
        server: "server";
        mac: "mac";
    }>;
    postsSeen: z.ZodInt;
    spentUsd: z.ZodNumber;
    /** From `socialCostPerPost`; null when no post was seen. */
    costPerPostUsd: z.ZodNullable<z.ZodNumber>;
}, z.core.$strict>;
export type SocialCostsRound = z.infer<typeof SocialCostsRoundSchema>;
export declare const SocialCostsAuthorSchema: z.ZodObject<{
    postsPerDay: z.ZodNumber;
    /** From `socialMonthlyCostPerAuthor` on the server cost per post; null when that is null. */
    monthlyUsd: z.ZodNullable<z.ZodNumber>;
    provider: z.ZodEnum<{
        instagram: "instagram";
    }>;
    handle: z.ZodString;
    verticalId: z.ZodString;
    addedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type SocialCostsAuthor = z.infer<typeof SocialCostsAuthorSchema>;
export declare const SocialCostsReportOutputSchema: z.ZodObject<{
    verticalId: z.ZodString;
    from: z.ZodString;
    to: z.ZodString;
    rounds: z.ZodArray<z.ZodObject<{
        day: z.ZodString;
        track: z.ZodEnum<{
            server: "server";
            mac: "mac";
        }>;
        postsSeen: z.ZodInt;
        spentUsd: z.ZodNumber;
        /** From `socialCostPerPost`; null when no post was seen. */
        costPerPostUsd: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strict>>;
    /** Mean cost of one post on the server track: summed spend over summed posts; null with no server round. */
    serverCostPerPostUsd: z.ZodNullable<z.ZodNumber>;
    authors: z.ZodArray<z.ZodObject<{
        postsPerDay: z.ZodNumber;
        /** From `socialMonthlyCostPerAuthor` on the server cost per post; null when that is null. */
        monthlyUsd: z.ZodNullable<z.ZodNumber>;
        provider: z.ZodEnum<{
            instagram: "instagram";
        }>;
        handle: z.ZodString;
        verticalId: z.ZodString;
        addedAt: z.ZodISODateTime;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type SocialCostsReportOutput = z.infer<typeof SocialCostsReportOutputSchema>;
export declare const SocialCostsToolErrorSchema: z.ZodEnum<{
    invalid_request: "invalid_request";
    not_configured: "not_configured";
    unknown_vertical: "unknown_vertical";
}>;
export type SocialCostsToolError = z.infer<typeof SocialCostsToolErrorSchema>;
//# sourceMappingURL=costs.d.ts.map