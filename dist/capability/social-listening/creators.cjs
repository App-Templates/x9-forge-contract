"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialCreatorsToolErrorSchema = exports.SocialCreatorsRankOutputSchema = exports.SocialCreatorRankSchema = exports.SocialCreatorsRankInputSchema = exports.SOCIAL_CREATORS_RANK_LIMIT_DEFAULT = exports.SOCIAL_CREATORS_RANK_DAYS_DEFAULT = exports.SOCIAL_CREATORS_TOOLS = void 0;
exports.rankSocialCreators = rankSocialCreators;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const spend_js_1 = require("../ricerca/spend.cjs");
const post_js_1 = require("./post.cjs");
const topic_js_1 = require("./topic.cjs");
/** Creator ranking tool: separate from SOCIAL_LISTENING_TOOLS (the exact tool list stays unchanged). */
exports.SOCIAL_CREATORS_TOOLS = { rank: 'social_creators_rank' };
exports.SOCIAL_CREATORS_RANK_DAYS_DEFAULT = 30;
exports.SOCIAL_CREATORS_RANK_LIMIT_DEFAULT = 50;
/** No identity in the input: tenant, owner and agent come from the call envelope (R-33). */
exports.SocialCreatorsRankInputSchema = zod_1.z.strictObject({
    verticalId: post_js_1.SocialVerticalIdSchema.optional(),
    days: zod_1.z.int().min(1).max(30).optional(),
    limit: zod_1.z.int().min(1).max(100).optional(),
    orderBy: zod_1.z.enum(['truth', 'heat']).optional(),
});
exports.SocialCreatorRankSchema = zod_1.z.strictObject({
    handle: post_js_1.SocialHandleSchema,
    topics: zod_1.z.int().min(1),
    counts: zod_1.z.strictObject({
        funziona: zod_1.z.int().min(0),
        da_provare: zod_1.z.int().min(0),
        non_funziona: zod_1.z.int().min(0),
        fuffa: zod_1.z.int().min(0),
    }),
    /** Average of the verdict scores of the creator's topics, 0..100 (D16). */
    truthScore: zod_1.z.number().min(0).max(100),
    lastDay: spend_js_1.AgentDaySchema,
    /** Heat: the sum of the heat of the creator's topics, each divided by the number of creators who talk about it (REVISIONE-DESIGN, creators). */
    heatScore: zod_1.z.number().nonnegative().optional(),
    postsAnalyzed: zod_1.z.int().min(0).optional(),
});
exports.SocialCreatorsRankOutputSchema = zod_1.z.strictObject({
    fromDay: spend_js_1.AgentDaySchema,
    toDay: spend_js_1.AgentDaySchema,
    creators: zod_1.z.array(exports.SocialCreatorRankSchema).max(100),
    idle: zod_1.z.array(post_js_1.SocialHandleSchema).max(100).optional(),
}).refine(o => o.fromDay <= o.toDay, { path: ['fromDay'], message: 'fromDay after toDay' });
exports.SocialCreatorsToolErrorSchema = zod_1.z.enum(['invalid_request', 'not_configured', 'unknown_vertical']);
function shiftDay(day, delta) {
    const t = new Date(day + 'T00:00:00Z');
    t.setUTCDate(t.getUTCDate() + delta);
    return t.toISOString().slice(0, 10);
}
/** Pure ranking: no clock, `toDay` comes from the caller. Topics of another scope never count. */
function rankSocialCreators(topics, query) {
    const days = query.days ?? exports.SOCIAL_CREATORS_RANK_DAYS_DEFAULT;
    const limit = query.limit ?? exports.SOCIAL_CREATORS_RANK_LIMIT_DEFAULT;
    const fromDay = shiftDay(query.toDay, -(days - 1));
    const postsByHandle = new Map();
    for (const post of query.posts ?? []) {
        const ids = postsByHandle.get(post.handle) ?? new Set();
        ids.add(post.postId);
        postsByHandle.set(post.handle, ids);
    }
    const acc = new Map();
    for (const t of topics) {
        if (!(0, capability_call_context_js_1.sameCapabilityScope)(t.identity, query.scope))
            continue;
        if (query.verticalId !== undefined && t.verticalId !== query.verticalId)
            continue;
        if (t.day < fromDay || t.day > query.toDay)
            continue;
        for (const handle of new Set(t.creators)) {
            const e = acc.get(handle) ?? {
                counts: { funziona: 0, da_provare: 0, non_funziona: 0, fuffa: 0 },
                sum: 0, heat: 0, postIds: new Set(), topics: 0, lastDay: t.day,
            };
            e.counts[t.verdict] += 1;
            e.sum += topic_js_1.SOCIAL_VERDICT_TRUTH_SCORE[t.verdict];
            // Empty creator lists never enter this loop; legacy projections may omit heat/postIds.
            e.heat += (t.heat ?? 0) / t.creators.length;
            const ownPostIds = postsByHandle.get(handle);
            for (const postId of t.postIds ?? []) {
                if (ownPostIds?.has(postId))
                    e.postIds.add(postId);
            }
            e.topics += 1;
            if (t.day > e.lastDay)
                e.lastDay = t.day;
            acc.set(handle, e);
        }
    }
    const creators = [...acc.entries()]
        .map(([handle, e]) => ({
        handle,
        topics: e.topics,
        counts: e.counts,
        truthScore: Math.round((e.sum / e.topics) * 10) / 10,
        lastDay: e.lastDay,
        heatScore: Math.round(e.heat * 10) / 10,
        postsAnalyzed: e.postIds.size,
    }))
        .sort((a, b) => (query.orderBy === 'heat'
        ? b.heatScore - a.heatScore || b.truthScore - a.truthScore
        : b.truthScore - a.truthScore || b.topics - a.topics)
        || (a.handle < b.handle ? -1 : a.handle > b.handle ? 1 : 0))
        .slice(0, limit);
    return {
        fromDay, toDay: query.toDay, creators,
        ...(query.followed === undefined ? {} : {
            idle: [...new Set(query.followed)].filter(handle => !acc.has(handle)).sort().slice(0, 100),
        }),
    };
}
//# sourceMappingURL=creators.js.map