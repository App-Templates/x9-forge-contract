import { z } from 'zod';
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
//# sourceMappingURL=fact-memory.d.ts.map