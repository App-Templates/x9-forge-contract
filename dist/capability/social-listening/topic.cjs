"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialTopicSchema = exports.SocialTopicCostSchema = exports.SocialTopicSourceSchema = exports.SocialTopicFactSchema = exports.SocialTopicTitleSchema = exports.SOCIAL_TOPIC_TITLE_MAX = exports.SocialTrackSchema = exports.SOCIAL_TRACKS = exports.SOCIAL_VERDICT_TRUTH_SCORE = exports.SocialVerdictSchema = exports.SOCIAL_VERDICTS = exports.SocialVerticalSchema = exports.SocialCategorySchema = exports.SocialCategorySlugSchema = void 0;
exports.socialCategoryInVertical = socialCategoryInVertical;
const zod_1 = require("zod");
const capability_call_identity_js_1 = require("../capability-call-identity.cjs");
const research_js_1 = require("../ricerca/research.cjs");
const spend_js_1 = require("../ricerca/spend.cjs");
const post_js_1 = require("./post.cjs");
const IsoDateTimeSchema = zod_1.z.iso.datetime({ offset: true });
exports.SocialCategorySlugSchema = zod_1.z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/);
exports.SocialCategorySchema = zod_1.z.object({
    slug: exports.SocialCategorySlugSchema,
    label: zod_1.z.string().min(1).max(60),
}).strict();
/** A vertical with its own category vocabulary (the vocabulary data lives in the project, not here). */
exports.SocialVerticalSchema = zod_1.z.object({
    id: post_js_1.SocialVerticalIdSchema,
    label: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().max(500),
    categories: zod_1.z.array(exports.SocialCategorySchema).min(1).max(30),
}).strict().superRefine((v, ctx) => {
    const seen = new Set();
    v.categories.forEach((c, i) => {
        if (seen.has(c.slug))
            ctx.addIssue({ code: 'custom', path: ['categories', i, 'slug'], message: 'duplicate category slug' });
        seen.add(c.slug);
    });
});
function socialCategoryInVertical(vertical, slug) {
    return vertical.categories.some(c => c.slug === slug);
}
exports.SOCIAL_VERDICTS = ['funziona', 'da_provare', 'non_funziona', 'fuffa'];
exports.SocialVerdictSchema = zod_1.z.enum(exports.SOCIAL_VERDICTS);
/** Creators' "truth" score per verdict (D16). */
exports.SOCIAL_VERDICT_TRUTH_SCORE = {
    funziona: 100,
    da_provare: 50,
    non_funziona: 0,
    fuffa: 0,
};
/** The track that did the work (D9). */
exports.SOCIAL_TRACKS = ['mac', 'server'];
exports.SocialTrackSchema = zod_1.z.enum(exports.SOCIAL_TRACKS);
/** Short title: under 32 characters. */
exports.SOCIAL_TOPIC_TITLE_MAX = 31;
exports.SocialTopicTitleSchema = zod_1.z.string().trim().min(1).max(exports.SOCIAL_TOPIC_TITLE_MAX);
/** A fact cites at least one http(s) source: reused from research, minus its `origin`. */
exports.SocialTopicFactSchema = research_js_1.ResearchFindingSchema.omit({ origin: true });
exports.SocialTopicSourceSchema = research_js_1.ResearchSourceSchema;
/** Cost per topic (D8). On the Mac `usd` is 0 (subscription quota). */
exports.SocialTopicCostSchema = zod_1.z.object({
    usd: zod_1.z.number().nonnegative().finite(),
    track: exports.SocialTrackSchema,
    uncertain: zod_1.z.boolean(),
}).strict();
exports.SocialTopicSchema = zod_1.z.object({
    identity: capability_call_identity_js_1.CapabilityAgentScopeSchema,
    topicId: zod_1.z.string().min(1).max(100),
    verticalId: post_js_1.SocialVerticalIdSchema,
    day: spend_js_1.AgentDaySchema,
    title: exports.SocialTopicTitleSchema,
    category: exports.SocialCategorySlugSchema,
    summary: zod_1.z.string().min(1).max(2000),
    verdict: exports.SocialVerdictSchema,
    facts: zod_1.z.array(exports.SocialTopicFactSchema).max(20),
    sources: zod_1.z.array(exports.SocialTopicSourceSchema).max(50),
    heat: zod_1.z.number().min(0).max(10),
    postIds: zod_1.z.array(zod_1.z.string().min(1).max(100)).min(1).max(100),
    creators: zod_1.z.array(post_js_1.SocialHandleSchema).min(1).max(50),
    cost: exports.SocialTopicCostSchema,
    computedAt: IsoDateTimeSchema,
    /** The extended research already done (D14): the button goes away. */
    extendedResearchId: research_js_1.ResearchIdSchema.optional(),
}).strict().superRefine((t, ctx) => {
    if ((t.verdict === 'funziona' || t.verdict === 'da_provare') && t.facts.length < 1) {
        ctx.addIssue({ code: 'custom', path: ['facts'], message: 'verdict funziona/da_provare needs at least one fact' });
    }
});
//# sourceMappingURL=topic.js.map