import { z } from 'zod';
import { type CapabilityAgentScope } from "../capability-call-identity.js";
import { type SocialTopic } from "./topic.js";
/** Personal favorites tools: separate from SOCIAL_LISTENING_TOOLS (the exact tool list stays unchanged). */
export declare const SOCIAL_FAVORITES_TOOLS: {
    readonly add: "social_favorite_add";
    readonly remove: "social_favorite_remove";
    readonly list: "social_favorite_list";
};
/** Provisional cap on the favorites of one scope. */
export declare const SOCIAL_FAVORITES_MAX = 200;
/** Archive row: tenant, owner and agent on every row (R-33); "personal" = the tenant+owner+agent scope. */
export declare const SocialFavoriteSchema: z.ZodObject<{
    identity: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    topicId: z.ZodString;
    addedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type SocialFavorite = z.infer<typeof SocialFavoriteSchema>;
/** No identity in the input: it comes from the call envelope (R-33). */
export declare const SocialFavoriteAddInputSchema: z.ZodObject<{
    topicId: z.ZodString;
}, z.core.$strict>;
export type SocialFavoriteAddInput = z.infer<typeof SocialFavoriteAddInputSchema>;
export declare const SocialFavoriteRemoveInputSchema: z.ZodObject<{
    topicId: z.ZodString;
}, z.core.$strict>;
export type SocialFavoriteRemoveInput = z.infer<typeof SocialFavoriteRemoveInputSchema>;
export declare const SocialFavoriteListInputSchema: z.ZodObject<{
    verticalId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type SocialFavoriteListInput = z.infer<typeof SocialFavoriteListInputSchema>;
export declare const SocialFavoriteItemSchema: z.ZodObject<{
    topicId: z.ZodString;
    verticalId: z.ZodString;
    day: z.ZodString;
    title: z.ZodString;
    category: z.ZodString;
    verdict: z.ZodEnum<{
        funziona: "funziona";
        da_provare: "da_provare";
        non_funziona: "non_funziona";
        fuffa: "fuffa";
    }>;
    heat: z.ZodNumber;
    addedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type SocialFavoriteItem = z.infer<typeof SocialFavoriteItemSchema>;
export declare const SocialFavoriteAddOutputSchema: z.ZodObject<{
    favorite: z.ZodObject<{
        topicId: z.ZodString;
        verticalId: z.ZodString;
        day: z.ZodString;
        title: z.ZodString;
        category: z.ZodString;
        verdict: z.ZodEnum<{
            funziona: "funziona";
            da_provare: "da_provare";
            non_funziona: "non_funziona";
            fuffa: "fuffa";
        }>;
        heat: z.ZodNumber;
        addedAt: z.ZodISODateTime;
    }, z.core.$strict>;
}, z.core.$strict>;
export type SocialFavoriteAddOutput = z.infer<typeof SocialFavoriteAddOutputSchema>;
export declare const SocialFavoriteRemoveOutputSchema: z.ZodObject<{
    favorite: z.ZodObject<{
        topicId: z.ZodString;
        verticalId: z.ZodString;
        day: z.ZodString;
        title: z.ZodString;
        category: z.ZodString;
        verdict: z.ZodEnum<{
            funziona: "funziona";
            da_provare: "da_provare";
            non_funziona: "non_funziona";
            fuffa: "fuffa";
        }>;
        heat: z.ZodNumber;
        addedAt: z.ZodISODateTime;
    }, z.core.$strict>;
}, z.core.$strict>;
export type SocialFavoriteRemoveOutput = z.infer<typeof SocialFavoriteRemoveOutputSchema>;
export declare const SocialFavoriteListOutputSchema: z.ZodObject<{
    favorites: z.ZodArray<z.ZodObject<{
        topicId: z.ZodString;
        verticalId: z.ZodString;
        day: z.ZodString;
        title: z.ZodString;
        category: z.ZodString;
        verdict: z.ZodEnum<{
            funziona: "funziona";
            da_provare: "da_provare";
            non_funziona: "non_funziona";
            fuffa: "fuffa";
        }>;
        heat: z.ZodNumber;
        addedAt: z.ZodISODateTime;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type SocialFavoriteListOutput = z.infer<typeof SocialFavoriteListOutputSchema>;
export declare const SocialFavoritesToolErrorSchema: z.ZodEnum<{
    invalid_request: "invalid_request";
    not_configured: "not_configured";
    unknown_topic: "unknown_topic";
    favorite_already_added: "favorite_already_added";
    favorite_not_found: "favorite_not_found";
    favorite_limit_reached: "favorite_limit_reached";
}>;
export type SocialFavoritesToolError = z.infer<typeof SocialFavoritesToolErrorSchema>;
type TopicForFavorite = Pick<SocialTopic, 'identity' | 'topicId' | 'verticalId' | 'day' | 'title' | 'category' | 'verdict' | 'heat'>;
/**
 * Pure list: only favorites and topics of the scope; joined by `topicId`; a favorite whose topic is missing
 * (or belongs to another scope) is dropped; newest `addedAt` first, then `topicId`. No clock.
 */
export declare function listSocialFavorites(favorites: readonly SocialFavorite[], topics: readonly TopicForFavorite[], query: {
    scope: CapabilityAgentScope;
    verticalId?: string;
}): SocialFavoriteListOutput;
/** Pure decision before an add: counts only the rows of the scope. */
export declare function decideSocialFavoriteAdd(existing: readonly Pick<SocialFavorite, 'identity' | 'topicId'>[], scope: CapabilityAgentScope, topicId: string): {
    ok: true;
} | {
    ok: false;
    error: 'favorite_already_added' | 'favorite_limit_reached';
};
export {};
//# sourceMappingURL=favorites.d.ts.map