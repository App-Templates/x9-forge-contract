"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialJobResultErrorSchema = exports.SOCIAL_JOB_RESULT_ERRORS = exports.SocialJobResultSchema = exports.SocialJobInputSchema = void 0;
exports.socialJobResultMatches = socialJobResultMatches;
const zod_1 = require("zod");
const research_js_1 = require("../ricerca/research.cjs");
const post_js_1 = require("./post.cjs");
const queue_js_1 = require("./queue.cjs");
const topic_js_1 = require("./topic.cjs");
const kinds = queue_js_1.SocialJobKindSchema.enum;
const topic = topic_js_1.SocialTopicSchema.shape;
/** Lightweight references only. The queue job, never the executor, supplies identity. */
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
    }).strict(),
    zod_1.z.object({
        kind: zod_1.z.literal(kinds.verify),
        topicId: topic.topicId,
    }).strict(),
    zod_1.z.object({
        kind: zod_1.z.literal(kinds.group),
        verticalId: post_js_1.SocialVerticalIdSchema,
        postIds: topic.postIds,
        categories: zod_1.z.array(topic_js_1.SocialCategorySlugSchema).min(1).max(30),
    }).strict(),
]);
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
        }).strict()).min(1).max(30),
    }).strict(),
]);
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