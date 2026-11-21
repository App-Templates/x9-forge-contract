import { z } from 'zod';
import { sameCapabilityScope } from "../capability-call-context.js";
import { AgentDaySchema } from "../ricerca/spend.js";
import { SocialHandleSchema, SocialVerticalIdSchema } from "./post.js";
import { SOCIAL_VERDICTS, SOCIAL_VERDICT_TRUTH_SCORE } from "./topic.js";
/** Creator ranking tool: separate from SOCIAL_LISTENING_TOOLS (the exact tool list stays unchanged). */
export const SOCIAL_CREATORS_TOOLS = { rank: 'social_creators_rank' };
export const SOCIAL_CREATORS_RANK_DAYS_DEFAULT = 30;
export const SOCIAL_CREATORS_RANK_LIMIT_DEFAULT = 50;
/** No identity in the input: tenant, owner and agent come from the call envelope (R-33). */
export const SocialCreatorsRankInputSchema = z.strictObject({
    verticalId: SocialVerticalIdSchema.optional(),
    days: z.int().min(1).max(30).optional(),
    limit: z.int().min(1).max(100).optional(),
    orderBy: z.enum(['truth', 'heat']).optional(),
});
export const SocialCreatorRankSchema = z.strictObject({
    handle: SocialHandleSchema,
    topics: z.int().min(1),
    counts: z.strictObject({
        funziona: z.int().min(0),
        da_provare: z.int().min(0),
        non_funziona: z.int().min(0),
        fuffa: z.int().min(0),
    }),
    /** Average of the verdict scores of the creator's topics, 0..100 (D16). */
    truthScore: z.number().min(0).max(100),
    lastDay: AgentDaySchema,
    /** Heat: the sum of the heat of the creator's topics, each divided by the number of creators who talk about it (REVISIONE-DESIGN, creators). */
    heatScore: z.number().nonnegative().optional(),
    postsAnalyzed: z.int().min(0).optional(),
    /** Posts of this creator by the verdict of their own analysis; posts not yet analyzed count nowhere (REVISIONE-DESIGN, creators). */
    postVerdicts: z.strictObject(Object.fromEntries(SOCIAL_VERDICTS.map(verdict => [verdict, z.int().min(0)]))).optional(),
});
export const SocialCreatorsRankOutputSchema = z.strictObject({
    fromDay: AgentDaySchema,
    toDay: AgentDaySchema,
    creators: z.array(SocialCreatorRankSchema).max(100),
    idle: z.array(SocialHandleSchema).max(100).optional(),
}).refine(o => o.fromDay <= o.toDay, { path: ['fromDay'], message: 'fromDay after toDay' });
export const SocialCreatorsToolErrorSchema = z.enum(['invalid_request', 'not_configured', 'unknown_vertical']);
function shiftDay(day, delta) {
    const t = new Date(day + 'T00:00:00Z');
    t.setUTCDate(t.getUTCDate() + delta);
    return t.toISOString().slice(0, 10);
}
/** Pure ranking: no clock, `toDay` comes from the caller. Topics of another scope never count. */
export function rankSocialCreators(topics, query) {
    const days = query.days ?? SOCIAL_CREATORS_RANK_DAYS_DEFAULT;
    const limit = query.limit ?? SOCIAL_CREATORS_RANK_LIMIT_DEFAULT;
    const fromDay = shiftDay(query.toDay, -(days - 1));
    const postsByHandle = new Map();
    for (const post of query.posts ?? []) {
        const ids = postsByHandle.get(post.handle) ?? new Map();
        // Keep the first available analysis when duplicate rows describe the same post.
        if (ids.get(post.postId) === undefined)
            ids.set(post.postId, post.verdict);
        postsByHandle.set(post.handle, ids);
    }
    const acc = new Map();
    for (const t of topics) {
        if (!sameCapabilityScope(t.identity, query.scope))
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
            e.sum += SOCIAL_VERDICT_TRUTH_SCORE[t.verdict];
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
        .map(([handle, e]) => {
        const postVerdicts = Object.fromEntries(SOCIAL_VERDICTS.map(verdict => [verdict, 0]));
        const ownPosts = postsByHandle.get(handle);
        for (const postId of e.postIds) {
            const verdict = ownPosts?.get(postId);
            if (verdict !== undefined)
                postVerdicts[verdict] += 1;
        }
        return {
            handle,
            topics: e.topics,
            counts: e.counts,
            truthScore: Math.round((e.sum / e.topics) * 10) / 10,
            lastDay: e.lastDay,
            heatScore: Math.round(e.heat * 10) / 10,
            postsAnalyzed: e.postIds.size,
            ...(query.posts === undefined ? {} : { postVerdicts }),
        };
    })
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