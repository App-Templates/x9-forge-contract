"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialFavoritesToolErrorSchema = exports.SocialFavoriteListOutputSchema = exports.SocialFavoriteRemoveOutputSchema = exports.SocialFavoriteAddOutputSchema = exports.SocialFavoriteItemSchema = exports.SocialFavoriteListInputSchema = exports.SocialFavoriteRemoveInputSchema = exports.SocialFavoriteAddInputSchema = exports.SocialFavoriteSchema = exports.SOCIAL_FAVORITES_MAX = exports.SOCIAL_FAVORITES_TOOLS = void 0;
exports.listSocialFavorites = listSocialFavorites;
exports.decideSocialFavoriteAdd = decideSocialFavoriteAdd;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const capability_call_identity_js_1 = require("../capability-call-identity.cjs");
const post_js_1 = require("./post.cjs");
const topic_js_1 = require("./topic.cjs");
/** Personal favorites tools: separate from SOCIAL_LISTENING_TOOLS (the exact tool list stays unchanged). */
exports.SOCIAL_FAVORITES_TOOLS = {
    add: 'social_favorite_add',
    remove: 'social_favorite_remove',
    list: 'social_favorite_list',
};
/** Provisional cap on the favorites of one scope. */
exports.SOCIAL_FAVORITES_MAX = 200;
const TopicIdSchema = topic_js_1.SocialTopicSchema.shape.topicId;
/** Archive row: tenant, owner and agent on every row (R-33); "personal" = the tenant+owner+agent scope. */
exports.SocialFavoriteSchema = zod_1.z.strictObject({
    identity: capability_call_identity_js_1.CapabilityAgentScopeSchema,
    topicId: TopicIdSchema,
    addedAt: zod_1.z.iso.datetime({ offset: true }),
});
/** No identity in the input: it comes from the call envelope (R-33). */
exports.SocialFavoriteAddInputSchema = zod_1.z.strictObject({ topicId: TopicIdSchema });
exports.SocialFavoriteRemoveInputSchema = zod_1.z.strictObject({ topicId: TopicIdSchema });
exports.SocialFavoriteListInputSchema = zod_1.z.strictObject({ verticalId: post_js_1.SocialVerticalIdSchema.optional() });
exports.SocialFavoriteItemSchema = zod_1.z.strictObject({
    topicId: topic_js_1.SocialTopicSchema.shape.topicId,
    verticalId: topic_js_1.SocialTopicSchema.shape.verticalId,
    day: topic_js_1.SocialTopicSchema.shape.day,
    title: topic_js_1.SocialTopicSchema.shape.title,
    category: topic_js_1.SocialTopicSchema.shape.category,
    verdict: topic_js_1.SocialTopicSchema.shape.verdict,
    heat: topic_js_1.SocialTopicSchema.shape.heat,
    addedAt: zod_1.z.iso.datetime({ offset: true }),
});
exports.SocialFavoriteAddOutputSchema = zod_1.z.strictObject({ favorite: exports.SocialFavoriteItemSchema });
exports.SocialFavoriteRemoveOutputSchema = zod_1.z.strictObject({ favorite: exports.SocialFavoriteItemSchema });
exports.SocialFavoriteListOutputSchema = zod_1.z.strictObject({
    favorites: zod_1.z.array(exports.SocialFavoriteItemSchema).max(exports.SOCIAL_FAVORITES_MAX),
});
exports.SocialFavoritesToolErrorSchema = zod_1.z.enum([
    'invalid_request',
    'not_configured',
    'unknown_topic',
    'favorite_already_added',
    'favorite_not_found',
    'favorite_limit_reached',
]);
/**
 * Pure list: only favorites and topics of the scope; joined by `topicId`; a favorite whose topic is missing
 * (or belongs to another scope) is dropped; newest `addedAt` first, then `topicId`. No clock.
 */
function listSocialFavorites(favorites, topics, query) {
    const byId = new Map();
    for (const t of topics) {
        if ((0, capability_call_context_js_1.sameCapabilityScope)(t.identity, query.scope))
            byId.set(t.topicId, t);
    }
    const items = [];
    for (const f of favorites) {
        if (!(0, capability_call_context_js_1.sameCapabilityScope)(f.identity, query.scope))
            continue;
        const t = byId.get(f.topicId);
        if (t === undefined)
            continue;
        if (query.verticalId !== undefined && t.verticalId !== query.verticalId)
            continue;
        items.push({
            topicId: t.topicId,
            verticalId: t.verticalId,
            day: t.day,
            title: t.title,
            category: t.category,
            verdict: t.verdict,
            heat: t.heat,
            addedAt: f.addedAt,
        });
    }
    items.sort((a, b) => a.addedAt < b.addedAt ? 1 : a.addedAt > b.addedAt ? -1 : a.topicId < b.topicId ? -1 : a.topicId > b.topicId ? 1 : 0);
    return { favorites: items.slice(0, exports.SOCIAL_FAVORITES_MAX) };
}
/** Pure decision before an add: counts only the rows of the scope. */
function decideSocialFavoriteAdd(existing, scope, topicId) {
    const mine = existing.filter(f => (0, capability_call_context_js_1.sameCapabilityScope)(f.identity, scope));
    if (mine.some(f => f.topicId === topicId))
        return { ok: false, error: 'favorite_already_added' };
    if (mine.length >= exports.SOCIAL_FAVORITES_MAX)
        return { ok: false, error: 'favorite_limit_reached' };
    return { ok: true };
}
//# sourceMappingURL=favorites.js.map