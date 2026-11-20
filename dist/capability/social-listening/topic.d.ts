import { z } from 'zod';
export declare const SocialCategorySlugSchema: z.ZodString;
export type SocialCategorySlug = z.infer<typeof SocialCategorySlugSchema>;
export declare const SocialCategorySchema: z.ZodObject<{
    slug: z.ZodString;
    label: z.ZodString;
}, z.core.$strict>;
export type SocialCategory = z.infer<typeof SocialCategorySchema>;
/** A vertical with its own category vocabulary (the vocabulary data lives in the project, not here). */
export declare const SocialVerticalSchema: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    description: z.ZodString;
    categories: z.ZodArray<z.ZodObject<{
        slug: z.ZodString;
        label: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type SocialVertical = z.infer<typeof SocialVerticalSchema>;
export declare function socialCategoryInVertical(vertical: Pick<SocialVertical, 'categories'>, slug: string): boolean;
export { SOCIAL_VERDICTS, SocialVerdictSchema, type SocialVerdict } from "./verdict.js";
/** Creators' "truth" score per verdict (D16). */
export declare const SOCIAL_VERDICT_TRUTH_SCORE: {
    funziona: number;
    da_provare: number;
    non_funziona: number;
    fuffa: number;
};
/** The track that did the work (D9). */
export declare const SOCIAL_TRACKS: readonly ["mac", "server"];
export declare const SocialTrackSchema: z.ZodEnum<{
    mac: "mac";
    server: "server";
}>;
export type SocialTrack = z.infer<typeof SocialTrackSchema>;
/** Short title: under 32 characters. */
export declare const SOCIAL_TOPIC_TITLE_MAX = 31;
export declare const SocialTopicTitleSchema: z.ZodString;
/** A fact cites at least one http(s) source: reused from research, minus its `origin`. */
export declare const SocialTopicFactSchema: z.ZodObject<{
    text: z.ZodString;
    sourceUrls: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export type SocialTopicFact = z.infer<typeof SocialTopicFactSchema>;
export declare const SocialTopicSourceSchema: z.ZodObject<{
    url: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    opened: z.ZodBoolean;
}, z.core.$strict>;
export type SocialTopicSource = z.infer<typeof SocialTopicSourceSchema>;
/** Cost per topic (D8). On the Mac `usd` is 0 (subscription quota). */
export declare const SocialTopicCostSchema: z.ZodObject<{
    usd: z.ZodNumber;
    track: z.ZodEnum<{
        mac: "mac";
        server: "server";
    }>;
    uncertain: z.ZodBoolean;
}, z.core.$strict>;
export type SocialTopicCost = z.infer<typeof SocialTopicCostSchema>;
export declare const SocialTopicSchema: z.ZodObject<{
    identity: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    topicId: z.ZodString;
    verticalId: z.ZodString;
    day: z.ZodString;
    title: z.ZodString;
    category: z.ZodString;
    summary: z.ZodString;
    verdict: z.ZodEnum<{
        funziona: "funziona";
        da_provare: "da_provare";
        non_funziona: "non_funziona";
        fuffa: "fuffa";
    }>;
    facts: z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        sourceUrls: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>;
    sources: z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        opened: z.ZodBoolean;
    }, z.core.$strict>>;
    heat: z.ZodNumber;
    postIds: z.ZodArray<z.ZodString>;
    creators: z.ZodArray<z.ZodString>;
    cost: z.ZodObject<{
        usd: z.ZodNumber;
        track: z.ZodEnum<{
            mac: "mac";
            server: "server";
        }>;
        uncertain: z.ZodBoolean;
    }, z.core.$strict>;
    computedAt: z.ZodISODateTime;
    extendedResearchId: z.ZodOptional<z.ZodString>;
    wikiIngestId: z.ZodOptional<z.ZodUUID>;
    wikiSavedAt: z.ZodOptional<z.ZodISODateTime>;
    videoProjectId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type SocialTopic = z.infer<typeof SocialTopicSchema>;
//# sourceMappingURL=topic.d.ts.map