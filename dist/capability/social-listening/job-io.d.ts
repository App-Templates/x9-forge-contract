import { z } from 'zod';
import { type SocialPostFilter, type SocialPost } from "./post.js";
import { type SocialJob } from "./queue.js";
import { type SocialTopicCost, type SocialTrack } from "./topic.js";
export declare const SOCIAL_JOB_TRANSCRIPT_EXCERPT_MAX = 12000;
/** Keep whole Unicode code points, including surrogate pairs. */
export declare function socialPostExcerpt(text: string, maxChars: number): string;
/** Post text is DATA, never instructions. */
export declare const SocialJobPostMaterialSchema: z.ZodObject<{
    handle: z.ZodString;
    kind: z.ZodEnum<{
        video: "video";
        image: "image";
        carousel: "carousel";
    }>;
    caption: z.ZodString;
    transcriptExcerpt: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
/** Bounded references and post data. The queue job, never the executor, supplies identity. */
export declare const SocialJobInputSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"collect">;
    verticalId: z.ZodString;
    handles: z.ZodArray<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"transcribe">;
    postId: z.ZodString;
    link: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"filter">;
    postId: z.ZodString;
    material: z.ZodOptional<z.ZodObject<{
        handle: z.ZodString;
        kind: z.ZodEnum<{
            video: "video";
            image: "image";
            carousel: "carousel";
        }>;
        caption: z.ZodString;
        transcriptExcerpt: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"verify">;
    topicId: z.ZodString;
    knownFacts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        sourceUrls: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"group">;
    verticalId: z.ZodString;
    postIds: z.ZodArray<z.ZodString>;
    categories: z.ZodArray<z.ZodString>;
}, z.core.$strict>], "kind">;
export type SocialJobInput = z.infer<typeof SocialJobInputSchema>;
/** Supply the Mac with post data within both the material and generic input limits. */
export declare function socialFilterJobInput(post: SocialPost): SocialJobInput;
/** Bounded executor data. The receiving service attaches the trusted job identity. */
export declare const SocialJobResultSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"collect">;
    posts: z.ZodArray<z.ZodObject<{
        link: z.ZodString;
        kind: z.ZodEnum<{
            video: "video";
            image: "image";
            carousel: "carousel";
        }>;
        provider: z.ZodEnum<{
            instagram: "instagram";
        }>;
        filter: z.ZodOptional<z.ZodObject<{
            keep: z.ZodBoolean;
            reason: z.ZodOptional<z.ZodString>;
            filteredAt: z.ZodISODateTime;
        }, z.core.$strict>>;
        caption: z.ZodString;
        transcript: z.ZodOptional<z.ZodString>;
        analysis: z.ZodOptional<z.ZodObject<{
            verdict: z.ZodEnum<{
                funziona: "funziona";
                da_provare: "da_provare";
                non_funziona: "non_funziona";
                fuffa: "fuffa";
            }>;
            reason: z.ZodString;
            relevance: z.ZodOptional<z.ZodString>;
            facts: z.ZodArray<z.ZodObject<{
                text: z.ZodString;
                sourceUrls: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>;
            tools: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                link: z.ZodOptional<z.ZodString>;
                whatItDoes: z.ZodString;
            }, z.core.$strict>>;
            analyzedAt: z.ZodISODateTime;
        }, z.core.$strict>>;
        handle: z.ZodString;
        publishedAt: z.ZodISODateTime;
        collectedAt: z.ZodISODateTime;
        postId: z.ZodString;
    }, z.core.$strict>>;
    hasMore: z.ZodBoolean;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"transcribe">;
    postId: z.ZodString;
    transcript: z.ZodString;
    language: z.ZodString;
    durationSec: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"filter">;
    postId: z.ZodString;
    keep: z.ZodBoolean;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"verify">;
    topicId: z.ZodString;
    verdict: z.ZodEnum<{
        funziona: "funziona";
        da_provare: "da_provare";
        non_funziona: "non_funziona";
        fuffa: "fuffa";
    }>;
    summary: z.ZodString;
    facts: z.ZodArray<z.ZodObject<{
        text: z.ZodString;
        sourceUrls: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>;
    sources: z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        opened: z.ZodBoolean;
    }, z.core.$strict>>;
    costUsd: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"group">;
    topics: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        category: z.ZodString;
        summary: z.ZodString;
        postIds: z.ZodArray<z.ZodString>;
        creators: z.ZodArray<z.ZodString>;
        heat: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>], "kind">;
export type SocialJobResult = z.infer<typeof SocialJobResultSchema>;
/** Derives the topic cost from the verification result and the track that did the work. */
export declare function socialVerifyTopicCost(result: SocialJobResult, track: SocialTrack): SocialTopicCost;
/** Turns a `filter` result into the outcome saved on the post; `filteredAt` is the service's apply time. */
export declare function socialPostFilterFromResult(result: SocialJobResult, filteredAt: string): SocialPostFilter;
export declare const SOCIAL_JOB_RESULT_ERRORS: readonly ["kind_mismatch", "post_mismatch", "topic_mismatch", "job_not_running"];
export declare const SocialJobResultErrorSchema: z.ZodEnum<{
    kind_mismatch: "kind_mismatch";
    post_mismatch: "post_mismatch";
    topic_mismatch: "topic_mismatch";
    job_not_running: "job_not_running";
}>;
export type SocialJobResultMatch = {
    ok: true;
} | {
    ok: false;
    error: typeof SOCIAL_JOB_RESULT_ERRORS[number];
};
/** Correlates a parsed result with its queue job; it does not authorize or persist data. */
export declare function socialJobResultMatches(job: SocialJob, result: SocialJobResult): SocialJobResultMatch;
//# sourceMappingURL=job-io.d.ts.map