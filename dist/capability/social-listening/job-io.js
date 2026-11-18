import { z } from 'zod';
import { WebUrlSchema } from "../ricerca/research.js";
import { SocialHandleSchema, SocialPostSchema, SocialVerticalIdSchema } from "./post.js";
import { SocialJobKindSchema } from "./queue.js";
import { SocialCategorySlugSchema, SocialTopicSchema } from "./topic.js";
import { SocialFactSchema } from "./verdict.js";
const kinds = SocialJobKindSchema.enum;
const topic = SocialTopicSchema.shape;
/** Lightweight references only. The queue job, never the executor, supplies identity. */
export const SocialJobInputSchema = z.discriminatedUnion('kind', [
    z.object({
        kind: z.literal(kinds.collect),
        verticalId: SocialVerticalIdSchema,
        handles: z.array(SocialHandleSchema).min(1).max(100),
    }).strict(),
    z.object({
        kind: z.literal(kinds.transcribe),
        postId: SocialPostSchema.shape.postId,
        link: WebUrlSchema,
    }).strict(),
    z.object({
        kind: z.literal(kinds.filter),
        postId: SocialPostSchema.shape.postId,
    }).strict(),
    z.object({
        kind: z.literal(kinds.verify),
        topicId: topic.topicId,
        /** Facts already verified that the executor must not pay for again. */
        knownFacts: z.array(SocialFactSchema).max(20).optional(),
    }).strict(),
    z.object({
        kind: z.literal(kinds.group),
        verticalId: SocialVerticalIdSchema,
        postIds: topic.postIds,
        categories: z.array(SocialCategorySlugSchema).min(1).max(30),
    }).strict(),
]);
/** Bounded executor data. The receiving service attaches the trusted job identity. */
export const SocialJobResultSchema = z.discriminatedUnion('kind', [
    z.object({
        kind: z.literal(kinds.collect),
        posts: z.array(SocialPostSchema.omit({ identity: true }).strict()).max(20),
        hasMore: z.boolean(),
    }).strict(),
    z.object({
        kind: z.literal(kinds.transcribe),
        postId: SocialPostSchema.shape.postId,
        transcript: z.string().min(1).max(60000),
        language: z.string().regex(/^[A-Za-z]{2}$/),
        durationSec: z.number().int().nonnegative(),
    }).strict(),
    z.object({
        kind: z.literal(kinds.filter),
        postId: SocialPostSchema.shape.postId,
        keep: z.boolean(),
        reason: z.string().min(1).max(300).optional(),
    }).strict(),
    z.object({
        kind: z.literal(kinds.verify),
        topicId: topic.topicId,
        verdict: topic.verdict,
        summary: topic.summary,
        facts: topic.facts,
        sources: topic.sources,
    }).strict(),
    z.object({
        kind: z.literal(kinds.group),
        topics: z.array(z.object({
            title: topic.title,
            category: topic.category,
            summary: topic.summary,
            postIds: topic.postIds,
            creators: topic.creators,
            heat: topic.heat,
        }).strict()).min(1).max(30),
    }).strict(),
]);
export const SOCIAL_JOB_RESULT_ERRORS = ['kind_mismatch', 'post_mismatch', 'topic_mismatch', 'job_not_running'];
export const SocialJobResultErrorSchema = z.enum(SOCIAL_JOB_RESULT_ERRORS);
/** Correlates a parsed result with its queue job; it does not authorize or persist data. */
export function socialJobResultMatches(job, result) {
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