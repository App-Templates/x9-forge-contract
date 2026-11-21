"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialSeenToolErrorSchema = exports.SocialSeenListOutputSchema = exports.SocialSeenSetOutputSchema = exports.SocialSeenListInputSchema = exports.SocialSeenSetInputSchema = exports.SocialSeenSchema = exports.SOCIAL_SEEN_MAX = exports.SOCIAL_SEEN_TOOLS = void 0;
exports.listSocialSeen = listSocialSeen;
exports.decideSocialSeenSet = decideSocialSeenSet;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const capability_call_identity_js_1 = require("../capability-call-identity.cjs");
const post_js_1 = require("./post.cjs");
const topic_js_1 = require("./topic.cjs");
/** Personal seen tools: separate from the unchanged SOCIAL_LISTENING_TOOLS. */
exports.SOCIAL_SEEN_TOOLS = {
    set: 'social_seen_set',
    list: 'social_seen_list',
};
/** Provisional cap on the seen topics of one tenant+owner+agent scope. */
exports.SOCIAL_SEEN_MAX = 500;
const TopicIdSchema = topic_js_1.SocialTopicSchema.shape.topicId;
/** Archive row: every seen mark belongs to an explicit agent scope (R-33). */
exports.SocialSeenSchema = zod_1.z.strictObject({
    identity: capability_call_identity_js_1.CapabilityAgentScopeSchema,
    topicId: TopicIdSchema,
    seenAt: zod_1.z.iso.datetime({ offset: true }),
});
/** Identity comes from the admitted call envelope, never from tool input. */
exports.SocialSeenSetInputSchema = zod_1.z.strictObject({
    topicId: TopicIdSchema,
    seen: zod_1.z.boolean(),
});
exports.SocialSeenListInputSchema = zod_1.z.strictObject({ verticalId: post_js_1.SocialVerticalIdSchema.optional() });
exports.SocialSeenSetOutputSchema = zod_1.z.strictObject({
    topicId: TopicIdSchema,
    seen: zod_1.z.boolean(),
});
exports.SocialSeenListOutputSchema = zod_1.z.strictObject({
    topicIds: zod_1.z.array(TopicIdSchema).max(exports.SOCIAL_SEEN_MAX),
});
exports.SocialSeenToolErrorSchema = zod_1.z.enum([
    'invalid_request',
    'not_configured',
    'unknown_topic',
    'seen_limit_reached',
]);
/** Pure scoped join: drop missing or foreign topics, newest seenAt first, then topicId. No clock. */
function listSocialSeen(rows, topics, query) {
    const byId = new Map();
    for (const topic of topics) {
        if ((0, capability_call_context_js_1.sameCapabilityScope)(topic.identity, query.scope))
            byId.set(topic.topicId, topic);
    }
    const items = [];
    for (const row of rows) {
        if (!(0, capability_call_context_js_1.sameCapabilityScope)(row.identity, query.scope))
            continue;
        const topic = byId.get(row.topicId);
        if (topic === undefined)
            continue;
        if (query.verticalId !== undefined && topic.verticalId !== query.verticalId)
            continue;
        items.push(row);
    }
    items.sort((a, b) => a.seenAt < b.seenAt ? 1 : a.seenAt > b.seenAt ? -1 : a.topicId < b.topicId ? -1 : a.topicId > b.topicId ? 1 : 0);
    return { topicIds: items.slice(0, exports.SOCIAL_SEEN_MAX).map(item => item.topicId) };
}
/** Pure, idempotent decision: only rows of the requested scope count toward the cap. */
function decideSocialSeenSet(existing, scope, topicId, seen) {
    const mine = existing.filter(row => (0, capability_call_context_js_1.sameCapabilityScope)(row.identity, scope));
    const present = mine.some(row => row.topicId === topicId);
    if (!seen)
        return { ok: true, action: present ? 'delete' : 'noop' };
    if (present)
        return { ok: true, action: 'noop' };
    if (mine.length >= exports.SOCIAL_SEEN_MAX)
        return { ok: false, error: 'seen_limit_reached' };
    return { ok: true, action: 'insert' };
}
//# sourceMappingURL=seen.js.map