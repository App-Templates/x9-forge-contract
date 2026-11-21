import { z } from 'zod';
import { type CapabilityAgentScope } from "../capability-call-identity.cjs";
import { type SocialTopic } from "./topic.cjs";
/** Personal seen tools: separate from the unchanged SOCIAL_LISTENING_TOOLS. */
export declare const SOCIAL_SEEN_TOOLS: {
    readonly set: "social_seen_set";
    readonly list: "social_seen_list";
};
/** Provisional cap on the seen topics of one tenant+owner+agent scope. */
export declare const SOCIAL_SEEN_MAX = 500;
/** Archive row: every seen mark belongs to an explicit agent scope (R-33). */
export declare const SocialSeenSchema: z.ZodObject<{
    identity: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    topicId: z.ZodString;
    seenAt: z.ZodISODateTime;
}, z.core.$strict>;
export type SocialSeen = z.infer<typeof SocialSeenSchema>;
/** Identity comes from the admitted call envelope, never from tool input. */
export declare const SocialSeenSetInputSchema: z.ZodObject<{
    topicId: z.ZodString;
    seen: z.ZodBoolean;
}, z.core.$strict>;
export type SocialSeenSetInput = z.infer<typeof SocialSeenSetInputSchema>;
export declare const SocialSeenListInputSchema: z.ZodObject<{
    verticalId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type SocialSeenListInput = z.infer<typeof SocialSeenListInputSchema>;
export declare const SocialSeenSetOutputSchema: z.ZodObject<{
    topicId: z.ZodString;
    seen: z.ZodBoolean;
}, z.core.$strict>;
export type SocialSeenSetOutput = z.infer<typeof SocialSeenSetOutputSchema>;
export declare const SocialSeenListOutputSchema: z.ZodObject<{
    topicIds: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export type SocialSeenListOutput = z.infer<typeof SocialSeenListOutputSchema>;
export declare const SocialSeenToolErrorSchema: z.ZodEnum<{
    invalid_request: "invalid_request";
    not_configured: "not_configured";
    unknown_topic: "unknown_topic";
    seen_limit_reached: "seen_limit_reached";
}>;
export type SocialSeenToolError = z.infer<typeof SocialSeenToolErrorSchema>;
type TopicForSeen = Pick<SocialTopic, 'identity' | 'topicId' | 'verticalId'>;
/** Pure scoped join: drop missing or foreign topics, newest seenAt first, then topicId. No clock. */
export declare function listSocialSeen(rows: readonly SocialSeen[], topics: readonly TopicForSeen[], query: {
    scope: CapabilityAgentScope;
    verticalId?: string;
}): SocialSeenListOutput;
/** Pure, idempotent decision: only rows of the requested scope count toward the cap. */
export declare function decideSocialSeenSet(existing: readonly Pick<SocialSeen, 'identity' | 'topicId'>[], scope: CapabilityAgentScope, topicId: string, seen: boolean): {
    ok: true;
    action: 'insert' | 'delete' | 'noop';
} | {
    ok: false;
    error: 'seen_limit_reached';
};
export {};
//# sourceMappingURL=seen.d.ts.map