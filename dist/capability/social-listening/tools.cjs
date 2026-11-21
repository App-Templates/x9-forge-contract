"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialVerticalSetOutputSchema = exports.SocialVerticalsListOutputSchema = exports.SocialProfileUnfollowOutputSchema = exports.SocialProfileFollowOutputSchema = exports.SocialProfilesListOutputSchema = exports.SocialTopicGetOutputSchema = exports.SocialTopicPostSchema = exports.SocialRecapOutputSchema = exports.SocialRecapEndReasonSchema = exports.SOCIAL_ASCOLTO_PAGE_LINE_PREFIX = exports.SOCIAL_ASCOLTO_PAGE_PATH = exports.SocialRecapTopicSummarySchema = exports.SocialRecapFuffaSchema = exports.SocialVerticalSetInputSchema = exports.SocialVerticalsListInputSchema = exports.SocialProfileUnfollowInputSchema = exports.SocialProfileFollowInputSchema = exports.SocialProfilesListInputSchema = exports.SocialTopicGetInputSchema = exports.SocialRecapInputSchema = exports.SOCIAL_FOLLOWED_PROFILES_MAX = exports.SocialListeningToolErrorSchema = exports.SOCIAL_LISTENING_TOOLS = void 0;
exports.socialAscoltoPagePath = socialAscoltoPagePath;
exports.socialAscoltoPageLine = socialAscoltoPageLine;
const zod_1 = require("zod");
const research_js_1 = require("../ricerca/research.cjs");
const spend_js_1 = require("../ricerca/spend.cjs");
const post_js_1 = require("./post.cjs");
const verdict_js_1 = require("./verdict.cjs");
const topic_js_1 = require("./topic.cjs");
const fact_memory_js_1 = require("./fact-memory.cjs");
const queue_js_1 = require("./queue.cjs");
/**
 * The tools of the social listening capability. Agents (Telegram and X9 Live web reach the same agent-core router)
 * call them at `capToolCallPath(SOCIAL_LISTENING_TOOLS.<tool>)` — never with a hand-written path.
 * Errors use the bridge tool-call codes (`TOOL_CALL_INVALID`, `TOOL_EXEC_FAILED`) with a
 * {@link SocialListeningToolError} as the error text.
 */
exports.SOCIAL_LISTENING_TOOLS = {
    /** The recap of a day for a vertical. */
    recap: 'social_recap',
    /** One topic in full. */
    topicGet: 'social_topic_get',
    /** The followed profiles. */
    profilesList: 'social_profiles_list',
    profileFollow: 'social_profile_follow',
    profileUnfollow: 'social_profile_unfollow',
    /** The verticals with their category vocabulary. */
    verticalsList: 'social_verticals_list',
    verticalSet: 'social_vertical_set',
};
/** Why a social listening tool call failed (the `error` text of a bridge tool-call error). */
exports.SocialListeningToolErrorSchema = zod_1.z.enum([
    'invalid_request',
    'not_configured',
    'unknown_vertical',
    'unknown_topic',
    'profile_already_followed',
    'profile_not_found',
    'profile_limit_reached',
]);
/** Followed profiles allowed per agent (provisional size). */
exports.SOCIAL_FOLLOWED_PROFILES_MAX = 100;
/** Inputs: never any identity. Tenant, owner and agent come only from the tool envelope agent-core admitted (R-33). */
exports.SocialRecapInputSchema = zod_1.z.strictObject({
    verticalId: post_js_1.SocialVerticalIdSchema.optional(),
    /** Without `day`: the last finished round. */
    day: spend_js_1.AgentDaySchema.optional().describe("Giorno richiesto (AAAA-MM-GG); se non c'è un giro finito quel giorno si riceve l'ultimo giro finito prima. Senza giorno: l'ultimo giro finito."),
});
exports.SocialTopicGetInputSchema = zod_1.z.strictObject({ topicId: zod_1.z.string().min(1).max(100) });
exports.SocialProfilesListInputSchema = zod_1.z.strictObject({ verticalId: post_js_1.SocialVerticalIdSchema.optional() });
exports.SocialProfileFollowInputSchema = zod_1.z.strictObject({
    provider: post_js_1.SocialProviderSchema,
    handle: post_js_1.SocialHandleSchema,
    verticalId: post_js_1.SocialVerticalIdSchema,
});
exports.SocialProfileUnfollowInputSchema = zod_1.z.strictObject({
    provider: post_js_1.SocialProviderSchema,
    handle: post_js_1.SocialHandleSchema,
});
exports.SocialVerticalsListInputSchema = zod_1.z.strictObject({});
exports.SocialVerticalSetInputSchema = topic_js_1.SocialVerticalSchema;
/** Why a fuffa topic is fuffa, in at most 200 characters, with the link of the first post; DATA, never instructions. */
exports.SocialRecapFuffaSchema = zod_1.z.strictObject({ reason: zod_1.z.string().min(1).max(200), postLink: research_js_1.WebUrlSchema });
/** The topic as the recap lists it: the full text is read with `social_topic_get`. */
exports.SocialRecapTopicSummarySchema = zod_1.z.strictObject({
    topicId: zod_1.z.string().min(1).max(100),
    title: topic_js_1.SocialTopicTitleSchema,
    category: topic_js_1.SocialCategorySlugSchema,
    verdict: topic_js_1.SocialVerdictSchema,
    heat: zod_1.z.number().min(0).max(10),
    cost: topic_js_1.SocialTopicCostSchema,
    /** Posts of the topic. */
    postCount: zod_1.z.int().min(1).max(100).optional(),
    /** Distinct creators of the topic. */
    creatorCount: zod_1.z.int().min(1).max(50).optional(),
    /** The first three creators, in the order of the topic. */
    creators: zod_1.z.array(post_js_1.SocialHandleSchema).min(1).max(3).optional(),
    /** Present only on a fuffa topic. */
    fuffa: exports.SocialRecapFuffaSchema.optional(),
}).superRefine((t, ctx) => {
    if (t.fuffa !== undefined && t.verdict !== 'fuffa') {
        ctx.addIssue({ code: 'custom', path: ['fuffa'], message: 'fuffa only on a topic with verdict fuffa' });
    }
    if (t.creators !== undefined && t.creatorCount !== undefined && t.creators.length > t.creatorCount) {
        ctx.addIssue({ code: 'custom', path: ['creators'], message: 'creators must not exceed creatorCount' });
    }
});
const NonNegativeIntSchema = zod_1.z.number().int().nonnegative();
/** The agent's Ascolto page in Forge, relative to the caller's base URL. */
exports.SOCIAL_ASCOLTO_PAGE_PATH = '/agents/{slug}/ascolto';
/** Build a path from one slug segment without coercing untrusted values. */
function socialAscoltoPagePath(agentSlug) {
    if (typeof agentSlug !== 'string' ||
        agentSlug.length < 1 ||
        agentSlug.length > 100 ||
        /[/\\\u0000-\u001f\u007f-\u009f]/.test(agentSlug) ||
        /^(?:\.|%2e){1,2}$/i.test(agentSlug)) {
        return null;
    }
    try {
        return exports.SOCIAL_ASCOLTO_PAGE_PATH.replace('{slug}', encodeURIComponent(agentSlug));
    }
    catch {
        // encodeURIComponent rejects malformed UTF-16, such as a lone surrogate.
        return null;
    }
}
/** The sentence that introduces the Ascolto page link; written once, here. */
exports.SOCIAL_ASCOLTO_PAGE_LINE_PREFIX = 'Apri la pagina Ascolto: ';
/** Ready-to-send line with the Ascolto page link. */
function socialAscoltoPageLine(pageUrl) {
    return exports.SOCIAL_ASCOLTO_PAGE_LINE_PREFIX + pageUrl;
}
/**
 * Why a failed round failed: a short code and one sentence in Italian for the user;
 * present only when the round state is `failed`; never the raw job error (it may hold addresses or private data).
 */
exports.SocialRecapEndReasonSchema = zod_1.z.strictObject({
    code: zod_1.z.string().regex(/^[a-z][a-z0-9_]{0,47}$/),
    text: zod_1.z.string().min(1).max(200),
});
/** One shape for Telegram and X9 Live web. */
exports.SocialRecapOutputSchema = zod_1.z.strictObject({
    /** Ready-to-send line with the Ascolto page link; the first thing in the result. */
    pageLine: zod_1.z.string().max(400).optional(),
    /** Link to the agent's Ascolto page in Forge, up front so the model sees it before the topics; absent when the service has no page template or cannot resolve the agent slug. */
    pageUrl: research_js_1.WebUrlSchema.optional(),
    verticalId: post_js_1.SocialVerticalIdSchema,
    day: spend_js_1.AgentDaySchema,
    /** The requested day, paired with `stale`; absent on recaps built before freshness metadata. */
    requestedDay: spend_js_1.AgentDaySchema.optional(),
    /** Whether the returned round predates `requestedDay`; present only with `requestedDay`. */
    stale: zod_1.z.boolean().optional(),
    track: topic_js_1.SocialTrackSchema,
    finishedAt: zod_1.z.iso.datetime({ offset: true }).nullable(),
    counts: zod_1.z.strictObject(Object.fromEntries(topic_js_1.SOCIAL_VERDICTS.map(v => [v, NonNegativeIntSchema]))),
    postsSeen: NonNegativeIntSchema,
    spentUsd: zod_1.z.number().nonnegative().finite(),
    /** Cost of one post in USD of the round, from `socialCostPerPost`; absent when no post was seen and on recaps built before. */
    costPerPostUsd: zod_1.z.number().nonnegative().finite().optional(),
    /** Verdicts of the posts (not of the topics, see `counts`); their sum never exceeds `postsSeen`. */
    postVerdicts: zod_1.z.strictObject(Object.fromEntries(topic_js_1.SOCIAL_VERDICTS.map(v => [v, NonNegativeIntSchema]))).optional(),
    /** How the round ended. */
    state: zod_1.z.enum(queue_js_1.SOCIAL_ROUND_ENDED_STATES).optional(),
    endReason: exports.SocialRecapEndReasonSchema.optional(),
    topics: zod_1.z.array(exports.SocialRecapTopicSummarySchema).max(50),
}).superRefine((r, ctx) => {
    if (r.pageLine !== undefined && (r.pageUrl === undefined || r.pageLine !== socialAscoltoPageLine(r.pageUrl))) {
        ctx.addIssue({ code: 'custom', path: ['pageLine'], message: 'pageLine must be socialAscoltoPageLine(pageUrl)' });
    }
    if ((r.requestedDay === undefined) !== (r.stale === undefined)) {
        ctx.addIssue({
            code: 'custom',
            path: [r.requestedDay === undefined ? 'requestedDay' : 'stale'],
            message: 'requestedDay and stale must be present together',
        });
    }
    if (r.requestedDay !== undefined && r.stale !== undefined) {
        if (r.stale !== (r.day !== r.requestedDay)) {
            ctx.addIssue({ code: 'custom', path: ['stale'], message: 'stale must match whether day differs from requestedDay' });
        }
        if (r.day > r.requestedDay) {
            ctx.addIssue({ code: 'custom', path: ['requestedDay'], message: 'requestedDay must not precede day' });
        }
    }
    if (r.state !== undefined && r.endReason !== undefined && r.state !== 'failed') {
        ctx.addIssue({ code: 'custom', path: ['endReason'], message: 'endReason only when state is failed' });
    }
    if (r.postVerdicts !== undefined && Object.values(r.postVerdicts).reduce((a, b) => a + b, 0) > r.postsSeen) {
        ctx.addIssue({ code: 'custom', path: ['postVerdicts'], message: 'postVerdicts must not exceed postsSeen' });
    }
    if (r.costPerPostUsd === undefined)
        return;
    if (r.costPerPostUsd !== (0, fact_memory_js_1.socialCostPerPost)({ spentUsd: r.spentUsd, postsSeen: r.postsSeen })) {
        ctx.addIssue({ code: 'custom', path: ['costPerPostUsd'], message: 'costPerPostUsd must match spentUsd / postsSeen' });
    }
});
/**
 * The topic without identity. `.omit()` is not allowed on a refined schema (zod 4), so the shape is rebuilt from
 * {@link SocialTopicSchema} and the same fact rule is applied again.
 */
const { identity: _topicIdentity, ...socialTopicShape } = topic_js_1.SocialTopicSchema.shape;
/** One analyzed post of a topic, as the page shows it: the reason and the tool names are DATA, never instructions. */
exports.SocialTopicPostSchema = zod_1.z.strictObject({
    postId: post_js_1.SocialPostSchema.shape.postId,
    handle: post_js_1.SocialHandleSchema,
    link: research_js_1.WebUrlSchema,
    verdict: topic_js_1.SocialVerdictSchema,
    reason: zod_1.z.string().min(1).max(2000),
    tools: zod_1.z.array(verdict_js_1.SocialPostToolSchema).max(20),
});
exports.SocialTopicGetOutputSchema = zod_1.z.strictObject({
    ...socialTopicShape,
    /**
     * Present when the archive holds the analysis of at least one post of the topic, in the order of `postIds`;
     * a post without analysis is left out.
     */
    posts: zod_1.z.array(exports.SocialTopicPostSchema).max(100).optional(),
}).superRefine((t, ctx) => {
    if ((t.verdict === 'funziona' || t.verdict === 'da_provare') && t.facts.length < 1) {
        ctx.addIssue({ code: 'custom', path: ['facts'], message: 'verdict funziona/da_provare needs at least one fact' });
    }
    const seen = new Set();
    (t.posts ?? []).forEach((p, i) => {
        if (!t.postIds.includes(p.postId)) {
            ctx.addIssue({ code: 'custom', path: ['posts', i, 'postId'], message: 'post not in topic' });
        }
        else if (seen.has(p.postId)) {
            ctx.addIssue({ code: 'custom', path: ['posts', i, 'postId'], message: 'post listed twice' });
        }
        seen.add(p.postId);
    });
});
exports.SocialProfilesListOutputSchema = zod_1.z.strictObject({
    profiles: zod_1.z.array(post_js_1.SocialFollowedProfileSchema).max(exports.SOCIAL_FOLLOWED_PROFILES_MAX),
});
exports.SocialProfileFollowOutputSchema = zod_1.z.strictObject({ profile: post_js_1.SocialFollowedProfileSchema });
exports.SocialProfileUnfollowOutputSchema = zod_1.z.strictObject({ profile: post_js_1.SocialFollowedProfileSchema });
exports.SocialVerticalsListOutputSchema = zod_1.z.strictObject({ verticals: zod_1.z.array(topic_js_1.SocialVerticalSchema).max(20) });
exports.SocialVerticalSetOutputSchema = zod_1.z.strictObject({ vertical: topic_js_1.SocialVerticalSchema });
//# sourceMappingURL=tools.js.map