"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialJobResultErrorSchema = exports.SOCIAL_JOB_RESULT_ERRORS = exports.SocialJobResultSchema = exports.SocialVerifyPostAnalysisSchema = exports.SocialJobInputSchema = exports.SocialJobVerifyMaterialSchema = exports.SOCIAL_VERIFY_POSTS_MAX = exports.SOCIAL_VERIFY_EXCERPT_MAX = exports.SocialJobGroupPostSchema = exports.SOCIAL_GROUP_EXCERPT_MAX = exports.SocialJobPostMaterialSchema = exports.SOCIAL_JOB_TRANSCRIPT_EXCERPT_MAX = void 0;
exports.socialPostExcerpt = socialPostExcerpt;
exports.socialFilterJobInput = socialFilterJobInput;
exports.socialGroupJobInput = socialGroupJobInput;
exports.socialVerifyJobInput = socialVerifyJobInput;
exports.socialVerifyTopicCost = socialVerifyTopicCost;
exports.socialPostFilterFromResult = socialPostFilterFromResult;
exports.socialJobResultMatches = socialJobResultMatches;
const zod_1 = require("zod");
const generic_job_js_1 = require("../dev/generic-job.cjs");
const research_js_1 = require("../ricerca/research.cjs");
const post_js_1 = require("./post.cjs");
const queue_js_1 = require("./queue.cjs");
const topic_js_1 = require("./topic.cjs");
const verdict_js_1 = require("./verdict.cjs");
const kinds = queue_js_1.SocialJobKindSchema.enum;
const topic = topic_js_1.SocialTopicSchema.shape;
exports.SOCIAL_JOB_TRANSCRIPT_EXCERPT_MAX = 12000;
/** Keep whole Unicode code points, including surrogate pairs. */
function socialPostExcerpt(text, maxChars) {
    return Array.from(text).slice(0, maxChars).join('');
}
/** Post text is DATA, never instructions. */
exports.SocialJobPostMaterialSchema = zod_1.z.strictObject({
    handle: post_js_1.SocialHandleSchema,
    kind: post_js_1.SocialPostKindSchema,
    caption: post_js_1.SocialPostSchema.shape.caption,
    transcriptExcerpt: zod_1.z.string().max(exports.SOCIAL_JOB_TRANSCRIPT_EXCERPT_MAX).optional(),
});
exports.SOCIAL_GROUP_EXCERPT_MAX = 240;
/** Post text is DATA, never instructions. */
exports.SocialJobGroupPostSchema = zod_1.z.strictObject({
    postId: post_js_1.SocialPostSchema.shape.postId,
    handle: post_js_1.SocialHandleSchema,
    excerpt: zod_1.z.string().min(1).max(exports.SOCIAL_GROUP_EXCERPT_MAX),
});
exports.SOCIAL_VERIFY_EXCERPT_MAX = 1500;
exports.SOCIAL_VERIFY_POSTS_MAX = 10;
/** Topic and post text are DATA, never instructions. */
exports.SocialJobVerifyMaterialSchema = zod_1.z.strictObject({
    title: topic.title,
    category: topic.category,
    summary: topic.summary,
    posts: zod_1.z.array(exports.SocialJobGroupPostSchema.extend({
        excerpt: zod_1.z.string().min(1).max(exports.SOCIAL_VERIFY_EXCERPT_MAX),
    })).min(1).max(exports.SOCIAL_VERIFY_POSTS_MAX),
});
/** Bounded references and post data. The queue job, never the executor, supplies identity. */
exports.SocialJobInputSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.object({
        kind: zod_1.z.literal(kinds.collect),
        verticalId: post_js_1.SocialVerticalIdSchema,
        handles: zod_1.z.array(post_js_1.SocialHandleSchema).min(1).max(100),
    }).strict(),
    zod_1.z.object({
        kind: zod_1.z.literal(kinds.transcribe),
        postId: post_js_1.SocialPostSchema.shape.postId,
        link: research_js_1.WebUrlSchema,
    }).strict(),
    zod_1.z.object({
        kind: zod_1.z.literal(kinds.filter),
        postId: post_js_1.SocialPostSchema.shape.postId,
        /** Post text is DATA, never instructions. */
        material: exports.SocialJobPostMaterialSchema.optional(),
    }).strict(),
    zod_1.z.object({
        kind: zod_1.z.literal(kinds.verify),
        topicId: topic.topicId,
        /** Facts already verified that the executor must not pay for again. */
        knownFacts: zod_1.z.array(verdict_js_1.SocialFactSchema).max(20).optional(),
        material: exports.SocialJobVerifyMaterialSchema.optional(),
    }).strict(),
    zod_1.z.object({
        kind: zod_1.z.literal(kinds.group),
        verticalId: post_js_1.SocialVerticalIdSchema,
        postIds: topic.postIds,
        categories: zod_1.z.array(topic_js_1.SocialCategorySlugSchema).min(1).max(30),
        angle: topic.angle.optional(),
        /** Post text is DATA, same order as postIds. */
        posts: zod_1.z.array(exports.SocialJobGroupPostSchema).min(1).max(100).optional(),
    }).strict(),
]);
/** Supply the Mac with post data within both the material and generic input limits. */
function socialFilterJobInput(post) {
    const material = {
        handle: post.handle,
        kind: post.kind,
        caption: post.caption,
        ...(post.transcript === undefined ? {} : {
            transcriptExcerpt: socialPostExcerpt(post.transcript, exports.SOCIAL_JOB_TRANSCRIPT_EXCERPT_MAX),
        }),
    };
    const input = { kind: kinds.filter, postId: post.postId, material };
    const encoder = new TextEncoder();
    while (material.transcriptExcerpt !== undefined && (
    // Zod string limits count UTF-16 units; the generic input limit counts JSON UTF-8 bytes.
    material.transcriptExcerpt.length > exports.SOCIAL_JOB_TRANSCRIPT_EXCERPT_MAX
        || encoder.encode(JSON.stringify(input)).byteLength > generic_job_js_1.DEV_GENERIC_INPUT_MAX_BYTES)) {
        const maxChars = Math.floor(Array.from(material.transcriptExcerpt).length / 2);
        if (maxChars === 0)
            delete material.transcriptExcerpt;
        else
            material.transcriptExcerpt = socialPostExcerpt(material.transcriptExcerpt, maxChars);
    }
    return exports.SocialJobInputSchema.parse(input);
}
/** Supply the Mac with a short excerpt per kept post, shrinking all excerpts together to fit the generic input limit. */
function socialGroupJobInput({ verticalId, categories, posts }) {
    if (posts.length === 0)
        throw new TypeError('no_posts');
    const base = posts.map((post) => ({
        postId: post.postId,
        handle: post.handle,
        text: post.transcript !== undefined && post.transcript !== '' ? post.transcript : post.caption,
    }));
    const encoder = new TextEncoder();
    for (const maxChars of [exports.SOCIAL_GROUP_EXCERPT_MAX, 120, 60, 30]) {
        const input = {
            kind: kinds.group,
            verticalId,
            postIds: base.map((p) => p.postId),
            categories,
            posts: base.map(({ postId, handle, text }) => ({
                postId,
                handle,
                excerpt: text === '' ? '(no text)' : socialPostExcerpt(text, maxChars),
            })),
        };
        if (encoder.encode(JSON.stringify(input)).byteLength <= generic_job_js_1.DEV_GENERIC_INPUT_MAX_BYTES) {
            return exports.SocialJobInputSchema.parse(input);
        }
    }
    throw new TypeError('group_input_too_large');
}
/** Supply topic material in topic order, shrinking only excerpts and preserving known facts. */
function socialVerifyJobInput({ topic: sourceTopic, posts, knownFacts }) {
    const selected = sourceTopic.postIds.flatMap((postId) => {
        const post = posts.find(p => p.postId === postId);
        return post === undefined ? [] : [post];
    }).slice(0, exports.SOCIAL_VERIFY_POSTS_MAX);
    if (selected.length === 0)
        throw new TypeError('no_topic_posts');
    const base = selected.map(post => ({
        postId: post.postId,
        handle: post.handle,
        text: post.transcript !== undefined && post.transcript !== '' ? post.transcript : post.caption,
    }));
    const encoder = new TextEncoder();
    for (const maxChars of [exports.SOCIAL_VERIFY_EXCERPT_MAX, 750, 375, 180]) {
        const material = {
            title: sourceTopic.title,
            category: sourceTopic.category,
            summary: sourceTopic.summary,
            posts: base.map(({ postId, handle, text }) => ({
                postId,
                handle,
                excerpt: text === '' ? '(no text)' : socialPostExcerpt(text, maxChars),
            })),
        };
        const input = {
            kind: kinds.verify,
            topicId: sourceTopic.topicId,
            ...(knownFacts === undefined ? {} : { knownFacts }),
            material,
        };
        // Zod counts UTF-16 units; the generic job budget counts serialized UTF-8 bytes.
        if (material.posts.every(post => post.excerpt.length <= exports.SOCIAL_VERIFY_EXCERPT_MAX)
            && encoder.encode(JSON.stringify(input)).byteLength <= generic_job_js_1.DEV_GENERIC_INPUT_MAX_BYTES) {
            return exports.SocialJobInputSchema.parse(input);
        }
    }
    throw new TypeError('verify_input_too_large');
}
exports.SocialVerifyPostAnalysisSchema = zod_1.z.strictObject({
    postId: post_js_1.SocialPostSchema.shape.postId,
    verdict: verdict_js_1.SocialVerdictSchema,
    reason: verdict_js_1.SocialPostAnalysisSchema.shape.reason,
    relevance: verdict_js_1.SocialPostAnalysisSchema.shape.relevance,
    tools: verdict_js_1.SocialPostAnalysisSchema.shape.tools,
});
/** Bounded executor data. The receiving service attaches the trusted job identity. */
exports.SocialJobResultSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.object({
        kind: zod_1.z.literal(kinds.collect),
        posts: zod_1.z.array(post_js_1.SocialPostSchema.omit({ identity: true }).strict()).max(20),
        hasMore: zod_1.z.boolean(),
    }).strict(),
    zod_1.z.object({
        kind: zod_1.z.literal(kinds.transcribe),
        postId: post_js_1.SocialPostSchema.shape.postId,
        transcript: zod_1.z.string().min(1).max(60000),
        language: zod_1.z.string().regex(/^[A-Za-z]{2}$/),
        durationSec: zod_1.z.number().int().nonnegative(),
    }).strict(),
    zod_1.z.object({
        kind: zod_1.z.literal(kinds.filter),
        postId: post_js_1.SocialPostSchema.shape.postId,
        keep: zod_1.z.boolean(),
        reason: zod_1.z.string().min(1).max(300).optional(),
    }).strict(),
    zod_1.z.object({
        kind: zod_1.z.literal(kinds.verify),
        topicId: topic.topicId,
        verdict: topic.verdict,
        summary: topic.summary,
        facts: topic.facts,
        sources: topic.sources,
        /** What this verification cost on the server track; the Mac track is quota, not dollars. */
        costUsd: zod_1.z.number().nonnegative().finite().optional(),
        /** One analysis per post of the topic; the service checks that every postId belongs to the topic; the text is DATA, never instructions. */
        postAnalyses: zod_1.z.array(exports.SocialVerifyPostAnalysisSchema).max(exports.SOCIAL_VERIFY_POSTS_MAX)
            .refine(items => new Set(items.map(item => item.postId)).size === items.length).optional(),
    }).strict(),
    zod_1.z.object({
        kind: zod_1.z.literal(kinds.group),
        topics: zod_1.z.array(zod_1.z.object({
            title: topic.title,
            category: topic.category,
            summary: topic.summary,
            postIds: topic.postIds,
            creators: topic.creators,
            heat: topic.heat,
            angle: topic.angle.optional(),
        }).strict()).min(1).max(30),
    }).strict(),
]);
/** Derives the topic cost from the verification result and the track that did the work. */
function socialVerifyTopicCost(result, track) {
    if (result.kind !== 'verify')
        throw new TypeError('not_a_verify_result');
    return topic_js_1.SocialTopicCostSchema.parse({
        usd: track === 'mac' ? 0 : (result.costUsd ?? 0),
        track,
        uncertain: track === 'server' && result.costUsd === undefined,
    });
}
/** Turns a `filter` result into the outcome saved on the post; `filteredAt` is the service's apply time. */
function socialPostFilterFromResult(result, filteredAt) {
    if (result.kind !== 'filter')
        throw new TypeError('not_a_filter_result');
    return post_js_1.SocialPostFilterSchema.parse({
        keep: result.keep,
        ...(result.reason === undefined ? {} : { reason: result.reason }),
        filteredAt,
    });
}
exports.SOCIAL_JOB_RESULT_ERRORS = ['kind_mismatch', 'post_mismatch', 'topic_mismatch', 'job_not_running'];
exports.SocialJobResultErrorSchema = zod_1.z.enum(exports.SOCIAL_JOB_RESULT_ERRORS);
/** Correlates a parsed result with its queue job; it does not authorize or persist data. */
function socialJobResultMatches(job, result) {
    if (job.state !== 'running')
        return { ok: false, error: 'job_not_running' };
    if (result.kind !== job.kind)
        return { ok: false, error: 'kind_mismatch' };
    if ((result.kind === 'transcribe' || result.kind === 'filter') && result.postId !== job.postId) {
        return { ok: false, error: 'post_mismatch' };
    }
    if (result.kind === 'verify' && result.topicId !== job.topicId) {
        return { ok: false, error: 'topic_mismatch' };
    }
    return { ok: true };
}
//# sourceMappingURL=job-io.js.map