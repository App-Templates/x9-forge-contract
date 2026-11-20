import { z } from 'zod';
import { VideoBriefRequestSchema, VideoBriefResponseSchema, VideoProjectIdSchema, VideoProjectStateSchema, } from "../video/brief.js";
import { VideoBriefToolInputSchema } from "../video/tools.js";
import { SocialTopicSchema } from "./topic.js";
/**
 * "Passa a cap video": from a topic to the request of `video_brief_create`.
 *
 * The X9 service calls cap-video with the SAME identity envelope as the call it received; identity never comes
 * from the input (R-33). The request shape is cap-video's own (R-14): nothing is copied here.
 * `text` is read-only: the model uses it before `video_brief_create`.
 * `link` writes the project reference: the caller uses it after receiving cap-video's response.
 */
export const SOCIAL_TOPIC_VIDEO_TOOLS = {
    brief: 'social_topic_brief',
    text: 'social_topic_brief_text',
    link: 'social_topic_video_link',
};
export const SOCIAL_VIDEO_EXTERNAL_REF_PREFIX = 'social:';
const TopicIdSchema = SocialTopicSchema.shape.topicId;
const BRIEF_MAX = 6000;
/** `social:<topicId>`: the common reference the video project carries back to its topic. */
export function socialVideoExternalRef(topicId) {
    return SOCIAL_VIDEO_EXTERNAL_REF_PREFIX + TopicIdSchema.parse(topicId);
}
/** The topic id inside an `externalRef`, or `null` when it is not a social one. */
export function parseSocialVideoExternalRef(ref) {
    if (typeof ref !== 'string' || !ref.startsWith(SOCIAL_VIDEO_EXTERNAL_REF_PREFIX))
        return null;
    const parsed = TopicIdSchema.safeParse(ref.slice(SOCIAL_VIDEO_EXTERNAL_REF_PREFIX.length));
    return parsed.success ? parsed.data : null;
}
/** The owner picks preset, mode, budget, approver and choices; no identity, brief, externalRef or footage. */
export const SocialTopicBriefInputSchema = VideoBriefToolInputSchema
    .omit({ brief: true, externalRef: true, requestedBy: true, footage: true })
    .extend({ topicId: TopicIdSchema })
    .strict();
export const SocialTopicBriefOutputSchema = z.strictObject({
    topicId: TopicIdSchema,
    externalRef: VideoBriefRequestSchema.shape.externalRef.unwrap(),
    projectId: VideoProjectIdSchema,
    state: VideoProjectStateSchema,
});
export const SocialTopicBriefTextInputSchema = z.strictObject({ topicId: TopicIdSchema });
export const SocialTopicBriefTextOutputSchema = z.strictObject({
    topicId: TopicIdSchema,
    brief: z.string().min(1).max(BRIEF_MAX),
    externalRef: VideoBriefRequestSchema.shape.externalRef.unwrap(),
});
export const SocialTopicVideoLinkInputSchema = SocialTopicBriefOutputSchema;
export const SocialTopicVideoLinkOutputSchema = z.strictObject({
    topicId: TopicIdSchema,
    projectId: VideoProjectIdSchema,
    state: VideoProjectStateSchema,
});
export const SocialTopicVideoToolErrorSchema = z.enum([
    'invalid_request', 'not_configured', 'unknown_topic', 'topic_mismatch', 'ref_mismatch', 'invalid_output',
]);
/**
 * The topic after its brief went out: `videoProjectId` is written only when cap-video's answer is about THIS topic
 * (same topic id and same `social:<id>` reference). The last brief wins. Never throws.
 */
export function socialTopicAfterBrief(topic, output) {
    const parsed = SocialTopicBriefOutputSchema.safeParse(output);
    if (!parsed.success)
        return { ok: false, error: 'invalid_output' };
    if (parsed.data.topicId !== topic.topicId)
        return { ok: false, error: 'topic_mismatch' };
    if (parsed.data.externalRef !== SOCIAL_VIDEO_EXTERNAL_REF_PREFIX + topic.topicId) {
        return { ok: false, error: 'ref_mismatch' };
    }
    const next = SocialTopicSchema.safeParse({ ...topic, videoProjectId: parsed.data.projectId });
    if (!next.success)
        return { ok: false, error: 'invalid_output' };
    return { ok: true, topic: next.data };
}
/**
 * Name of the capability in the agent's registry, and the cap-video tools the social page calls through the
 * factory's generic capability route. Their schemas stay in `capability/video` (`VideoBriefToolInputSchema`,
 * `VideoPresetsListToolInputSchema`, `VideoPresetsListResponseSchema`, `VideoBriefResponseSchema`).
 */
export const SOCIAL_VIDEO_CAPABILITY = 'video';
export const SOCIAL_VIDEO_TOOLS = { brief: 'video_brief_create', presets: 'video_presets_list' };
/**
 * cap-video's brief response as the topic output: only project and state are kept (identity, preset, mode and
 * budget are dropped). Never throws.
 */
export function socialTopicBriefOutputFromVideo(topicId, response) {
    const id = TopicIdSchema.safeParse(topicId);
    const video = VideoBriefResponseSchema.safeParse(response);
    if (!id.success || !video.success)
        return { ok: false, error: 'invalid_output' };
    const output = SocialTopicBriefOutputSchema.safeParse({
        topicId: id.data,
        externalRef: socialVideoExternalRef(id.data),
        projectId: video.data.projectId,
        state: video.data.state,
    });
    return output.success ? { ok: true, output: output.data } : { ok: false, error: 'invalid_output' };
}
export const SocialTopicBriefToolErrorSchema = z.enum([
    'invalid_request', 'not_configured', 'unknown_topic', 'video_not_enabled', 'video_refused',
]);
/** Brief text in Italian; over the limit, whole facts are dropped from the end, never cut in half. */
export function socialTopicVideoBriefText(topic) {
    const head = [topic.title, topic.summary, `Verdetto: ${topic.verdict}`];
    const factBlocks = topic.facts.map((f) => [f.text, ...f.sourceUrls].join('\n'));
    const creators = `Creator: ${topic.creators.join(', ')}`;
    const build = (n, withCreators) => {
        const parts = [...head];
        if (n > 0)
            parts.push(['Fatti verificati:', ...factBlocks.slice(0, n)].join('\n'));
        if (withCreators)
            parts.push(creators);
        return parts.join('\n');
    };
    for (let n = factBlocks.length; n >= 0; n--) {
        const text = build(n, true);
        if (text.length <= BRIEF_MAX)
            return text;
    }
    return build(0, false);
}
/** Verified topic text and reference for a subsequent `video_brief_create` call. */
export function socialTopicBriefTextOutput(topic) {
    const externalRef = socialVideoExternalRef(topic.topicId);
    return SocialTopicBriefTextOutputSchema.parse({
        topicId: topic.topicId,
        brief: socialTopicVideoBriefText(topic),
        externalRef,
    });
}
/** The request of `video_brief_create`, validated with cap-video's own schema. */
export function socialTopicVideoBriefInput(topic, choices) {
    return VideoBriefToolInputSchema.parse({
        ...choices,
        brief: socialTopicVideoBriefText(topic),
        externalRef: socialVideoExternalRef(topic.topicId),
    });
}
//# sourceMappingURL=video-brief.js.map