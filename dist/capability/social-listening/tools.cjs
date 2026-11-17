"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialVerticalSetOutputSchema = exports.SocialVerticalsListOutputSchema = exports.SocialProfileUnfollowOutputSchema = exports.SocialProfileFollowOutputSchema = exports.SocialProfilesListOutputSchema = exports.SocialTopicGetOutputSchema = exports.SocialRecapOutputSchema = exports.SocialRecapTopicSummarySchema = exports.SocialVerticalSetInputSchema = exports.SocialVerticalsListInputSchema = exports.SocialProfileUnfollowInputSchema = exports.SocialProfileFollowInputSchema = exports.SocialProfilesListInputSchema = exports.SocialTopicGetInputSchema = exports.SocialRecapInputSchema = exports.SOCIAL_FOLLOWED_PROFILES_MAX = exports.SocialListeningToolErrorSchema = exports.SOCIAL_LISTENING_TOOLS = void 0;
const zod_1 = require("zod");
const spend_js_1 = require("../ricerca/spend.cjs");
const post_js_1 = require("./post.cjs");
const topic_js_1 = require("./topic.cjs");
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
    day: spend_js_1.AgentDaySchema.optional(),
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
/** The topic as the recap lists it: the full text is read with `social_topic_get`. */
exports.SocialRecapTopicSummarySchema = zod_1.z.strictObject({
    topicId: zod_1.z.string().min(1).max(100),
    title: topic_js_1.SocialTopicTitleSchema,
    category: topic_js_1.SocialCategorySlugSchema,
    verdict: topic_js_1.SocialVerdictSchema,
    heat: zod_1.z.number().min(0).max(10),
    cost: topic_js_1.SocialTopicCostSchema,
});
const NonNegativeIntSchema = zod_1.z.number().int().nonnegative();
/** One shape for Telegram and X9 Live web. */
exports.SocialRecapOutputSchema = zod_1.z.strictObject({
    verticalId: post_js_1.SocialVerticalIdSchema,
    day: spend_js_1.AgentDaySchema,
    track: topic_js_1.SocialTrackSchema,
    finishedAt: zod_1.z.iso.datetime({ offset: true }).nullable(),
    counts: zod_1.z.strictObject(Object.fromEntries(topic_js_1.SOCIAL_VERDICTS.map(v => [v, NonNegativeIntSchema]))),
    postsSeen: NonNegativeIntSchema,
    spentUsd: zod_1.z.number().nonnegative().finite(),
    topics: zod_1.z.array(exports.SocialRecapTopicSummarySchema).max(50),
});
/**
 * The topic without identity. `.omit()` is not allowed on a refined schema (zod 4), so the shape is rebuilt from
 * {@link SocialTopicSchema} and the same fact rule is applied again.
 */
const { identity: _topicIdentity, ...socialTopicShape } = topic_js_1.SocialTopicSchema.shape;
exports.SocialTopicGetOutputSchema = zod_1.z.strictObject(socialTopicShape).superRefine((t, ctx) => {
    if ((t.verdict === 'funziona' || t.verdict === 'da_provare') && t.facts.length < 1) {
        ctx.addIssue({ code: 'custom', path: ['facts'], message: 'verdict funziona/da_provare needs at least one fact' });
    }
});
exports.SocialProfilesListOutputSchema = zod_1.z.strictObject({
    profiles: zod_1.z.array(post_js_1.SocialFollowedProfileSchema).max(exports.SOCIAL_FOLLOWED_PROFILES_MAX),
});
exports.SocialProfileFollowOutputSchema = zod_1.z.strictObject({ profile: post_js_1.SocialFollowedProfileSchema });
exports.SocialProfileUnfollowOutputSchema = zod_1.z.strictObject({ profile: post_js_1.SocialFollowedProfileSchema });
exports.SocialVerticalsListOutputSchema = zod_1.z.strictObject({ verticals: zod_1.z.array(topic_js_1.SocialVerticalSchema).max(20) });
exports.SocialVerticalSetOutputSchema = zod_1.z.strictObject({ vertical: topic_js_1.SocialVerticalSchema });
//# sourceMappingURL=tools.js.map