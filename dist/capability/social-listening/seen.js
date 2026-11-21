import { z } from 'zod';
import { sameCapabilityScope } from "../capability-call-context.js";
import { CapabilityAgentScopeSchema } from "../capability-call-identity.js";
import { SocialVerticalIdSchema } from "./post.js";
import { SocialTopicSchema } from "./topic.js";
/** Personal seen tools: separate from the unchanged SOCIAL_LISTENING_TOOLS. */
export const SOCIAL_SEEN_TOOLS = {
    set: 'social_seen_set',
    list: 'social_seen_list',
};
/** Provisional cap on the seen topics of one tenant+owner+agent scope. */
export const SOCIAL_SEEN_MAX = 500;
const TopicIdSchema = SocialTopicSchema.shape.topicId;
/** Archive row: every seen mark belongs to an explicit agent scope (R-33). */
export const SocialSeenSchema = z.strictObject({
    identity: CapabilityAgentScopeSchema,
    topicId: TopicIdSchema,
    seenAt: z.iso.datetime({ offset: true }),
});
/** Identity comes from the admitted call envelope, never from tool input. */
export const SocialSeenSetInputSchema = z.strictObject({
    topicId: TopicIdSchema,
    seen: z.boolean(),
});
export const SocialSeenListInputSchema = z.strictObject({ verticalId: SocialVerticalIdSchema.optional() });
export const SocialSeenSetOutputSchema = z.strictObject({
    topicId: TopicIdSchema,
    seen: z.boolean(),
});
export const SocialSeenListOutputSchema = z.strictObject({
    topicIds: z.array(TopicIdSchema).max(SOCIAL_SEEN_MAX),
});
export const SocialSeenToolErrorSchema = z.enum([
    'invalid_request',
    'not_configured',
    'unknown_topic',
    'seen_limit_reached',
]);
/** Pure scoped join: drop missing or foreign topics, newest seenAt first, then topicId. No clock. */
export function listSocialSeen(rows, topics, query) {
    const byId = new Map();
    for (const topic of topics) {
        if (sameCapabilityScope(topic.identity, query.scope))
            byId.set(topic.topicId, topic);
    }
    const items = [];
    for (const row of rows) {
        if (!sameCapabilityScope(row.identity, query.scope))
            continue;
        const topic = byId.get(row.topicId);
        if (topic === undefined)
            continue;
        if (query.verticalId !== undefined && topic.verticalId !== query.verticalId)
            continue;
        items.push(row);
    }
    items.sort((a, b) => a.seenAt < b.seenAt ? 1 : a.seenAt > b.seenAt ? -1 : a.topicId < b.topicId ? -1 : a.topicId > b.topicId ? 1 : 0);
    return { topicIds: items.slice(0, SOCIAL_SEEN_MAX).map(item => item.topicId) };
}
/** Pure, idempotent decision: only rows of the requested scope count toward the cap. */
export function decideSocialSeenSet(existing, scope, topicId, seen) {
    const mine = existing.filter(row => sameCapabilityScope(row.identity, scope));
    const present = mine.some(row => row.topicId === topicId);
    if (!seen)
        return { ok: true, action: present ? 'delete' : 'noop' };
    if (present)
        return { ok: true, action: 'noop' };
    if (mine.length >= SOCIAL_SEEN_MAX)
        return { ok: false, error: 'seen_limit_reached' };
    return { ok: true, action: 'insert' };
}
//# sourceMappingURL=seen.js.map