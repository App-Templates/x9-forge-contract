import { z } from 'zod';
import { type VideoBriefToolInput } from "../video/tools.js";
import { type SocialTopic } from "./topic.js";
import type { SocialTopicGetOutput } from "./tools.js";
/**
 * "Passa a cap video": from a topic to the request of `video_brief_create`.
 *
 * The X9 service calls cap-video with the SAME identity envelope as the call it received; identity never comes
 * from the input (R-33). The request shape is cap-video's own (R-14): nothing is copied here.
 */
export declare const SOCIAL_TOPIC_VIDEO_TOOLS: {
    readonly brief: "social_topic_brief";
};
export declare const SOCIAL_VIDEO_EXTERNAL_REF_PREFIX = "social:";
/** `social:<topicId>`: the common reference the video project carries back to its topic. */
export declare function socialVideoExternalRef(topicId: string): string;
/** The topic id inside an `externalRef`, or `null` when it is not a social one. */
export declare function parseSocialVideoExternalRef(ref: unknown): string | null;
/** The owner picks preset, mode, budget, approver and choices; no identity, brief, externalRef or footage. */
export declare const SocialTopicBriefInputSchema: z.ZodObject<{
    voice: z.ZodOptional<z.ZodString>;
    mode: z.ZodEnum<{
        approval: "approval";
        autonomous: "autonomous";
    }>;
    presetId: z.ZodString;
    durationSeconds: z.ZodOptional<z.ZodNumber>;
    aspectRatio: z.ZodOptional<z.ZodEnum<{
        "9:16": "9:16";
        "16:9": "16:9";
        "1:1": "1:1";
    }>>;
    resolution: z.ZodOptional<z.ZodEnum<{
        "480p": "480p";
        "720p": "720p";
        "1080p": "1080p";
    }>>;
    approverEmail: z.ZodEmail;
    budgetUsd: z.ZodNumber;
    topicId: z.ZodString;
}, z.core.$strict>;
export type SocialTopicBriefInput = z.infer<typeof SocialTopicBriefInputSchema>;
export declare const SocialTopicBriefOutputSchema: z.ZodObject<{
    topicId: z.ZodString;
    externalRef: z.ZodString;
    projectId: z.ZodString;
    state: z.ZodEnum<{
        failed: "failed";
        created: "created";
        delivered: "delivered";
        planning: "planning";
        awaiting_approval: "awaiting_approval";
        producing: "producing";
    }>;
}, z.core.$strict>;
export type SocialTopicBriefOutput = z.infer<typeof SocialTopicBriefOutputSchema>;
/**
 * The topic after its brief went out: `videoProjectId` is written only when cap-video's answer is about THIS topic
 * (same topic id and same `social:<id>` reference). The last brief wins. Never throws.
 */
export declare function socialTopicAfterBrief(topic: SocialTopic, output: unknown): {
    ok: true;
    topic: SocialTopic;
} | {
    ok: false;
    error: 'invalid_output' | 'topic_mismatch' | 'ref_mismatch';
};
/**
 * Name of the capability in the agent's registry, and the cap-video tools the social page calls through the
 * factory's generic capability route. Their schemas stay in `capability/video` (`VideoBriefToolInputSchema`,
 * `VideoPresetsListToolInputSchema`, `VideoPresetsListResponseSchema`, `VideoBriefResponseSchema`).
 */
export declare const SOCIAL_VIDEO_CAPABILITY: "video";
export declare const SOCIAL_VIDEO_TOOLS: {
    readonly brief: "video_brief_create";
    readonly presets: "video_presets_list";
};
/**
 * cap-video's brief response as the topic output: only project and state are kept (identity, preset, mode and
 * budget are dropped). Never throws.
 */
export declare function socialTopicBriefOutputFromVideo(topicId: unknown, response: unknown): {
    ok: true;
    output: SocialTopicBriefOutput;
} | {
    ok: false;
    error: 'invalid_output';
};
export declare const SocialTopicBriefToolErrorSchema: z.ZodEnum<{
    invalid_request: "invalid_request";
    not_configured: "not_configured";
    unknown_topic: "unknown_topic";
    video_not_enabled: "video_not_enabled";
    video_refused: "video_refused";
}>;
export type SocialTopicBriefToolError = z.infer<typeof SocialTopicBriefToolErrorSchema>;
/** Brief text in Italian; over the limit, whole facts are dropped from the end, never cut in half. */
export declare function socialTopicVideoBriefText(topic: SocialTopicGetOutput): string;
/** The request of `video_brief_create`, validated with cap-video's own schema. */
export declare function socialTopicVideoBriefInput(topic: SocialTopicGetOutput, choices: Omit<SocialTopicBriefInput, 'topicId'>): VideoBriefToolInput;
//# sourceMappingURL=video-brief.d.ts.map