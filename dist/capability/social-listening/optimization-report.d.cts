import { z } from 'zod';
import { SocialTrackSchema } from "./topic.cjs";
/** What the optimized round did: filter outcome, topics, facts reused vs paid, cost against the estimate (D19). */
export declare const SocialRoundOptimizationSchema: z.ZodObject<{
    day: z.ZodString;
    track: z.ZodEnum<{
        mac: "mac";
        server: "server";
    }>;
    postsSeen: z.ZodInt;
    postsKept: z.ZodInt;
    postsDiscarded: z.ZodInt;
    /** Posts that never went through the filter (rounds saved before the filter existed). */
    postsUnfiltered: z.ZodInt;
    /** Kept / (kept + discarded), 6 decimals; null when no post was filtered. */
    keepRatio: z.ZodNullable<z.ZodNumber>;
    topics: z.ZodInt;
    factsReused: z.ZodInt;
    factsNew: z.ZodInt;
    spentUsd: z.ZodNumber;
    costPerPostUsd: z.ZodNullable<z.ZodNumber>;
    /** Server track only (the Mac consumes subscription quota, D8). */
    vsEstimate: z.ZodNullable<z.ZodObject<{
        estimateUsd: z.ZodNumber;
        ratio: z.ZodNumber;
        near: z.ZodBoolean;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type SocialRoundOptimization = z.infer<typeof SocialRoundOptimizationSchema>;
/** Builds the optimization report of one round; throws `filtered_posts_exceed_seen` when kept + discarded > seen. */
export declare function socialRoundOptimization(input: {
    day: string;
    track: z.infer<typeof SocialTrackSchema>;
    postsSeen: number;
    postsKept: number;
    postsDiscarded: number;
    topics: number;
    factsReused: number;
    factsNew: number;
    spentUsd: number;
    estimateUsd?: number;
}): SocialRoundOptimization;
//# sourceMappingURL=optimization-report.d.ts.map