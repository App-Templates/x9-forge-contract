import { z } from 'zod';
import type { CapabilityAgentScope } from "../capability-call-identity.js";
import { type SocialTopic, type SocialVerdict } from "./topic.js";
/** Creator ranking tool: separate from SOCIAL_LISTENING_TOOLS (the exact tool list stays unchanged). */
export declare const SOCIAL_CREATORS_TOOLS: {
    readonly rank: "social_creators_rank";
};
export declare const SOCIAL_CREATORS_RANK_DAYS_DEFAULT = 30;
export declare const SOCIAL_CREATORS_RANK_LIMIT_DEFAULT = 50;
/** No identity in the input: tenant, owner and agent come from the call envelope (R-33). */
export declare const SocialCreatorsRankInputSchema: z.ZodObject<{
    verticalId: z.ZodOptional<z.ZodString>;
    days: z.ZodOptional<z.ZodInt>;
    limit: z.ZodOptional<z.ZodInt>;
    orderBy: z.ZodOptional<z.ZodEnum<{
        heat: "heat";
        truth: "truth";
    }>>;
}, z.core.$strict>;
export type SocialCreatorsRankInput = z.infer<typeof SocialCreatorsRankInputSchema>;
export declare const SocialCreatorRankSchema: z.ZodObject<{
    handle: z.ZodString;
    topics: z.ZodInt;
    counts: z.ZodObject<{
        funziona: z.ZodInt;
        da_provare: z.ZodInt;
        non_funziona: z.ZodInt;
        fuffa: z.ZodInt;
    }, z.core.$strict>;
    /** Average of the verdict scores of the creator's topics, 0..100 (D16). */
    truthScore: z.ZodNumber;
    lastDay: z.ZodString;
    /** Heat: the sum of the heat of the creator's topics, each divided by the number of creators who talk about it (REVISIONE-DESIGN, creators). */
    heatScore: z.ZodOptional<z.ZodNumber>;
    postsAnalyzed: z.ZodOptional<z.ZodInt>;
    /** Posts of this creator by the verdict of their own analysis; posts not yet analyzed count nowhere (REVISIONE-DESIGN, creators). */
    postVerdicts: z.ZodOptional<z.ZodObject<Record<"funziona" | "da_provare" | "non_funziona" | "fuffa", z.ZodInt>, z.core.$strict>>;
}, z.core.$strict>;
export type SocialCreatorRank = z.infer<typeof SocialCreatorRankSchema>;
export declare const SocialCreatorsRankOutputSchema: z.ZodObject<{
    fromDay: z.ZodString;
    toDay: z.ZodString;
    creators: z.ZodArray<z.ZodObject<{
        handle: z.ZodString;
        topics: z.ZodInt;
        counts: z.ZodObject<{
            funziona: z.ZodInt;
            da_provare: z.ZodInt;
            non_funziona: z.ZodInt;
            fuffa: z.ZodInt;
        }, z.core.$strict>;
        /** Average of the verdict scores of the creator's topics, 0..100 (D16). */
        truthScore: z.ZodNumber;
        lastDay: z.ZodString;
        /** Heat: the sum of the heat of the creator's topics, each divided by the number of creators who talk about it (REVISIONE-DESIGN, creators). */
        heatScore: z.ZodOptional<z.ZodNumber>;
        postsAnalyzed: z.ZodOptional<z.ZodInt>;
        /** Posts of this creator by the verdict of their own analysis; posts not yet analyzed count nowhere (REVISIONE-DESIGN, creators). */
        postVerdicts: z.ZodOptional<z.ZodObject<Record<"funziona" | "da_provare" | "non_funziona" | "fuffa", z.ZodInt>, z.core.$strict>>;
    }, z.core.$strict>>;
    idle: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strict>;
export type SocialCreatorsRankOutput = z.infer<typeof SocialCreatorsRankOutputSchema>;
export declare const SocialCreatorsToolErrorSchema: z.ZodEnum<{
    invalid_request: "invalid_request";
    not_configured: "not_configured";
    unknown_vertical: "unknown_vertical";
}>;
export type SocialCreatorsToolError = z.infer<typeof SocialCreatorsToolErrorSchema>;
/** Pure ranking: no clock, `toDay` comes from the caller. Topics of another scope never count. */
export declare function rankSocialCreators(topics: readonly (Pick<SocialTopic, 'identity' | 'verticalId' | 'day' | 'verdict' | 'creators'> & Partial<Pick<SocialTopic, 'heat' | 'postIds'>>)[], query: {
    scope: CapabilityAgentScope;
    toDay: string;
    verticalId?: string;
    days?: number;
    limit?: number;
    orderBy?: SocialCreatorsRankInput['orderBy'];
    followed?: readonly string[];
    posts?: readonly {
        postId: string;
        handle: string;
        verdict?: SocialVerdict;
    }[];
}): SocialCreatorsRankOutput;
//# sourceMappingURL=creators.d.ts.map