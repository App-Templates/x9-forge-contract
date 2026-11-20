import { z } from 'zod';
import { type SocialTrack } from "./topic.js";
/** Normalised fact text: lowercase, no accents, no punctuation, single spaces. */
export declare function socialFactKey(text: string): string;
export declare const SocialFactKeySchema: z.ZodString;
export declare const SocialVerifiedFactSchema: z.ZodObject<{
    identity: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    verticalId: z.ZodString;
    category: z.ZodString;
    factKey: z.ZodString;
    fact: z.ZodObject<{
        text: z.ZodString;
        sourceUrls: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
    topicId: z.ZodString;
    verifiedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type SocialVerifiedFact = z.infer<typeof SocialVerifiedFactSchema>;
export declare const SOCIAL_FACT_MEMORY_MAX_AGE_DAYS = 30;
/** True when `verifiedAt` is at most `maxAgeDays` before `nowIso` and not after it. */
export declare function socialFactFresh(row: Pick<SocialVerifiedFact, 'verifiedAt'>, nowIso: string, maxAgeDays?: number): boolean;
/** Cost of one post in USD, 6 decimals (microdollars); `null` when no post was seen. */
export declare function socialCostPerPost({ spentUsd, postsSeen }: {
    spentUsd: number;
    postsSeen: number;
}): number | null;
export declare const SOCIAL_MEASUREMENT_KINDS: readonly ["post_analysis", "extended_research"];
/** One P0 observation; Mac work consumes subscription quota rather than dollars. */
export declare const SocialCostMeasurementSchema: z.ZodObject<{
    measurementId: z.ZodString;
    track: z.ZodEnum<{
        mac: "mac";
        server: "server";
    }>;
    kind: z.ZodEnum<{
        post_analysis: "post_analysis";
        extended_research: "extended_research";
    }>;
    postId: z.ZodOptional<z.ZodString>;
    usd: z.ZodNumber;
    durationSec: z.ZodNumber;
    quality: z.ZodOptional<z.ZodNumber>;
    measuredAt: z.ZodISODateTime;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const SOCIAL_DAYS_PER_MONTH = 30;
/** D8: monthly cost per followed author, calculated in microdollars. */
export declare function socialMonthlyCostPerAuthor({ postsPerDay, costPerPostUsd }: {
    postsPerDay: number;
    costPerPostUsd: number;
}): number | null;
/** Valid observations only, ordered by track and then measurement kind. */
export declare function socialMeasurementSummary(rows: unknown[]): {
    track: SocialTrack;
    kind: (typeof SOCIAL_MEASUREMENT_KINDS)[number];
    count: number;
    avgUsd: number;
    avgDurationSec: number;
}[];
//# sourceMappingURL=fact-memory.d.ts.map