import { z } from 'zod';
/**
 * Social providers. The provider sits behind an interface: TikTok, YouTube, LinkedIn are added here
 * without changing the tools. Instagram collection goes through the Mac, never from the server with cookies.
 */
export declare const SOCIAL_PROVIDERS: readonly ["instagram"];
export declare const SocialProviderSchema: z.ZodEnum<{
    instagram: "instagram";
}>;
export type SocialProvider = z.infer<typeof SocialProviderSchema>;
/** A real account name, e.g. `alassafi.ai`, `davi.d_roberts`. */
export declare const SocialHandleSchema: z.ZodString;
export type SocialHandle = z.infer<typeof SocialHandleSchema>;
/** Slug of a vertical (same rule as video preset ids). */
export declare const SocialVerticalIdSchema: z.ZodString;
export type SocialVerticalId = z.infer<typeof SocialVerticalIdSchema>;
export declare const SocialFollowedProfileSchema: z.ZodObject<{
    provider: z.ZodEnum<{
        instagram: "instagram";
    }>;
    handle: z.ZodString;
    verticalId: z.ZodString;
    addedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type SocialFollowedProfile = z.infer<typeof SocialFollowedProfileSchema>;
export declare const SOCIAL_POST_KINDS: readonly ["video", "image", "carousel"];
export declare const SocialPostKindSchema: z.ZodEnum<{
    video: "video";
    image: "image";
    carousel: "carousel";
}>;
export type SocialPostKind = z.infer<typeof SocialPostKindSchema>;
/** Web text (caption, transcript) is DATA, never instructions: bounded in length. */
export declare const SocialPostSchema: z.ZodObject<{
    identity: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    postId: z.ZodString;
    provider: z.ZodEnum<{
        instagram: "instagram";
    }>;
    handle: z.ZodString;
    link: z.ZodString;
    publishedAt: z.ZodISODateTime;
    kind: z.ZodEnum<{
        video: "video";
        image: "image";
        carousel: "carousel";
    }>;
    caption: z.ZodString;
    transcript: z.ZodOptional<z.ZodString>;
    analysis: z.ZodOptional<z.ZodObject<{
        verdict: z.ZodEnum<{
            funziona: "funziona";
            da_provare: "da_provare";
            non_funziona: "non_funziona";
            fuffa: "fuffa";
        }>;
        reason: z.ZodString;
        relevance: z.ZodOptional<z.ZodString>;
        facts: z.ZodArray<z.ZodObject<{
            text: z.ZodString;
            sourceUrls: z.ZodArray<z.ZodString>;
        }, z.core.$strict>>;
        tools: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            link: z.ZodOptional<z.ZodString>;
            whatItDoes: z.ZodString;
        }, z.core.$strict>>;
        analyzedAt: z.ZodISODateTime;
    }, z.core.$strict>>;
    collectedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type SocialPost = z.infer<typeof SocialPostSchema>;
//# sourceMappingURL=post.d.ts.map