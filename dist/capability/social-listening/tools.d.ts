import { z } from 'zod';
/**
 * The tools of the social listening capability. Agents (Telegram and X9 Live web reach the same agent-core router)
 * call them at `capToolCallPath(SOCIAL_LISTENING_TOOLS.<tool>)` — never with a hand-written path.
 * Errors use the bridge tool-call codes (`TOOL_CALL_INVALID`, `TOOL_EXEC_FAILED`) with a
 * {@link SocialListeningToolError} as the error text.
 */
export declare const SOCIAL_LISTENING_TOOLS: {
    /** The recap of a day for a vertical. */
    readonly recap: "social_recap";
    /** One topic in full. */
    readonly topicGet: "social_topic_get";
    /** The followed profiles. */
    readonly profilesList: "social_profiles_list";
    readonly profileFollow: "social_profile_follow";
    readonly profileUnfollow: "social_profile_unfollow";
    /** The verticals with their category vocabulary. */
    readonly verticalsList: "social_verticals_list";
    readonly verticalSet: "social_vertical_set";
};
export type SocialListeningToolName = (typeof SOCIAL_LISTENING_TOOLS)[keyof typeof SOCIAL_LISTENING_TOOLS];
/** Why a social listening tool call failed (the `error` text of a bridge tool-call error). */
export declare const SocialListeningToolErrorSchema: z.ZodEnum<{
    invalid_request: "invalid_request";
    not_configured: "not_configured";
    unknown_vertical: "unknown_vertical";
    unknown_topic: "unknown_topic";
    profile_already_followed: "profile_already_followed";
    profile_not_found: "profile_not_found";
    profile_limit_reached: "profile_limit_reached";
}>;
export type SocialListeningToolError = z.infer<typeof SocialListeningToolErrorSchema>;
/** Followed profiles allowed per agent (provisional size). */
export declare const SOCIAL_FOLLOWED_PROFILES_MAX = 100;
/** Inputs: never any identity. Tenant, owner and agent come only from the tool envelope agent-core admitted (R-33). */
export declare const SocialRecapInputSchema: z.ZodObject<{
    verticalId: z.ZodOptional<z.ZodString>;
    /** Without `day`: the last finished round. */
    day: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const SocialTopicGetInputSchema: z.ZodObject<{
    topicId: z.ZodString;
}, z.core.$strict>;
export declare const SocialProfilesListInputSchema: z.ZodObject<{
    verticalId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const SocialProfileFollowInputSchema: z.ZodObject<{
    provider: z.ZodEnum<{
        instagram: "instagram";
    }>;
    handle: z.ZodString;
    verticalId: z.ZodString;
}, z.core.$strict>;
export declare const SocialProfileUnfollowInputSchema: z.ZodObject<{
    provider: z.ZodEnum<{
        instagram: "instagram";
    }>;
    handle: z.ZodString;
}, z.core.$strict>;
export declare const SocialVerticalsListInputSchema: z.ZodObject<{}, z.core.$strict>;
export declare const SocialVerticalSetInputSchema: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    description: z.ZodString;
    categories: z.ZodArray<z.ZodObject<{
        slug: z.ZodString;
        label: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
/** The topic as the recap lists it: the full text is read with `social_topic_get`. */
export declare const SocialRecapTopicSummarySchema: z.ZodObject<{
    topicId: z.ZodString;
    title: z.ZodString;
    category: z.ZodString;
    verdict: z.ZodEnum<{
        funziona: "funziona";
        da_provare: "da_provare";
        non_funziona: "non_funziona";
        fuffa: "fuffa";
    }>;
    heat: z.ZodNumber;
    cost: z.ZodObject<{
        usd: z.ZodNumber;
        track: z.ZodEnum<{
            server: "server";
            mac: "mac";
        }>;
        uncertain: z.ZodBoolean;
    }, z.core.$strict>;
}, z.core.$strict>;
/** One shape for Telegram and X9 Live web. */
export declare const SocialRecapOutputSchema: z.ZodObject<{
    verticalId: z.ZodString;
    day: z.ZodString;
    track: z.ZodEnum<{
        server: "server";
        mac: "mac";
    }>;
    finishedAt: z.ZodNullable<z.ZodISODateTime>;
    counts: z.ZodObject<Record<"funziona" | "da_provare" | "non_funziona" | "fuffa", z.ZodNumber>, z.core.$strict>;
    postsSeen: z.ZodNumber;
    spentUsd: z.ZodNumber;
    topics: z.ZodArray<z.ZodObject<{
        topicId: z.ZodString;
        title: z.ZodString;
        category: z.ZodString;
        verdict: z.ZodEnum<{
            funziona: "funziona";
            da_provare: "da_provare";
            non_funziona: "non_funziona";
            fuffa: "fuffa";
        }>;
        heat: z.ZodNumber;
        cost: z.ZodObject<{
            usd: z.ZodNumber;
            track: z.ZodEnum<{
                server: "server";
                mac: "mac";
            }>;
            uncertain: z.ZodBoolean;
        }, z.core.$strict>;
    }, z.core.$strict>>;
    /** Link to the agent's Ascolto page in Forge; absent when the service has no page template or cannot resolve the agent slug. */
    pageUrl: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const SocialTopicGetOutputSchema: z.ZodObject<{
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
            server: "server";
            mac: "mac";
        }>;
        uncertain: z.ZodBoolean;
    }, z.core.$strict>;
    computedAt: z.ZodISODateTime;
    extendedResearchId: z.ZodOptional<z.ZodString>;
    wikiIngestId: z.ZodOptional<z.ZodUUID>;
    wikiSavedAt: z.ZodOptional<z.ZodISODateTime>;
}, z.core.$strict>;
export declare const SocialProfilesListOutputSchema: z.ZodObject<{
    profiles: z.ZodArray<z.ZodObject<{
        provider: z.ZodEnum<{
            instagram: "instagram";
        }>;
        handle: z.ZodString;
        verticalId: z.ZodString;
        addedAt: z.ZodISODateTime;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const SocialProfileFollowOutputSchema: z.ZodObject<{
    profile: z.ZodObject<{
        provider: z.ZodEnum<{
            instagram: "instagram";
        }>;
        handle: z.ZodString;
        verticalId: z.ZodString;
        addedAt: z.ZodISODateTime;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const SocialProfileUnfollowOutputSchema: z.ZodObject<{
    profile: z.ZodObject<{
        provider: z.ZodEnum<{
            instagram: "instagram";
        }>;
        handle: z.ZodString;
        verticalId: z.ZodString;
        addedAt: z.ZodISODateTime;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const SocialVerticalsListOutputSchema: z.ZodObject<{
    verticals: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        description: z.ZodString;
        categories: z.ZodArray<z.ZodObject<{
            slug: z.ZodString;
            label: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const SocialVerticalSetOutputSchema: z.ZodObject<{
    vertical: z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        description: z.ZodString;
        categories: z.ZodArray<z.ZodObject<{
            slug: z.ZodString;
            label: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type SocialRecapInput = z.infer<typeof SocialRecapInputSchema>;
export type SocialTopicGetInput = z.infer<typeof SocialTopicGetInputSchema>;
export type SocialProfilesListInput = z.infer<typeof SocialProfilesListInputSchema>;
export type SocialProfileFollowInput = z.infer<typeof SocialProfileFollowInputSchema>;
export type SocialProfileUnfollowInput = z.infer<typeof SocialProfileUnfollowInputSchema>;
export type SocialVerticalsListInput = z.infer<typeof SocialVerticalsListInputSchema>;
export type SocialVerticalSetInput = z.infer<typeof SocialVerticalSetInputSchema>;
export type SocialRecapTopicSummary = z.infer<typeof SocialRecapTopicSummarySchema>;
export type SocialRecapOutput = z.infer<typeof SocialRecapOutputSchema>;
export type SocialTopicGetOutput = z.infer<typeof SocialTopicGetOutputSchema>;
export type SocialProfilesListOutput = z.infer<typeof SocialProfilesListOutputSchema>;
export type SocialProfileFollowOutput = z.infer<typeof SocialProfileFollowOutputSchema>;
export type SocialProfileUnfollowOutput = z.infer<typeof SocialProfileUnfollowOutputSchema>;
export type SocialVerticalsListOutput = z.infer<typeof SocialVerticalsListOutputSchema>;
export type SocialVerticalSetOutput = z.infer<typeof SocialVerticalSetOutputSchema>;
//# sourceMappingURL=tools.d.ts.map