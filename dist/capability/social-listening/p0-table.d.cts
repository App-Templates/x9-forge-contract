import { z } from 'zod';
/** Posts per day measured by the MVP (17/11). */
export declare const SOCIAL_P0_POSTS_PER_DAY: readonly [0.49, 1.04, 1.75];
/** Share of posts kept: 1 = no filter, 0.6 = the proposed filter quota. */
export declare const SOCIAL_P0_KEEP_RATIOS: readonly [1, 0.6];
export declare const SOCIAL_P0_MISSING_GROUPS: readonly ["mac_post_analysis", "server_post_analysis", "extended_research"];
export declare const SocialP0TableSchema: z.ZodObject<{
    rows: z.ZodArray<z.ZodObject<{
        track: z.ZodEnum<{
            mac: "mac";
            server: "server";
        }>;
        kind: z.ZodEnum<{
            post_analysis: "post_analysis";
            extended_research: "extended_research";
        }>;
        count: z.ZodNumber;
        avgUsd: z.ZodNumber;
        avgDurationSec: z.ZodNumber;
        avgQuality: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strict>>;
    monthlyPerAuthor: z.ZodArray<z.ZodObject<{
        track: z.ZodEnum<{
            mac: "mac";
            server: "server";
        }>;
        postsPerDay: z.ZodNumber;
        keepRatio: z.ZodNumber;
        monthlyUsd: z.ZodNumber;
    }, z.core.$strict>>;
    extendedResearch: z.ZodNullable<z.ZodObject<{
        count: z.ZodNumber;
        avgUsd: z.ZodNumber;
        maxUsd: z.ZodNumber;
    }, z.core.$strict>>;
    missing: z.ZodArray<z.ZodEnum<{
        extended_research: "extended_research";
        mac_post_analysis: "mac_post_analysis";
        server_post_analysis: "server_post_analysis";
    }>>;
}, z.core.$strict>;
export type SocialP0Table = z.infer<typeof SocialP0TableSchema>;
/** P0 cost table for Stefano, computed from the saved measurements (invalid rows are skipped). */
export declare function socialP0Table(rows: unknown[], options?: {
    postsPerDay?: readonly number[];
    keepRatios?: readonly number[];
}): SocialP0Table;
//# sourceMappingURL=p0-table.d.ts.map