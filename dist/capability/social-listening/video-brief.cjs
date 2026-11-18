"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialTopicBriefToolErrorSchema = exports.SocialTopicBriefOutputSchema = exports.SocialTopicBriefInputSchema = exports.SOCIAL_VIDEO_EXTERNAL_REF_PREFIX = exports.SOCIAL_TOPIC_VIDEO_TOOLS = void 0;
exports.socialVideoExternalRef = socialVideoExternalRef;
exports.parseSocialVideoExternalRef = parseSocialVideoExternalRef;
exports.socialTopicVideoBriefText = socialTopicVideoBriefText;
exports.socialTopicVideoBriefInput = socialTopicVideoBriefInput;
const zod_1 = require("zod");
const brief_js_1 = require("../video/brief.cjs");
const tools_js_1 = require("../video/tools.cjs");
const topic_js_1 = require("./topic.cjs");
/**
 * "Passa a cap video": from a topic to the request of `video_brief_create`.
 *
 * The X9 service calls cap-video with the SAME identity envelope as the call it received; identity never comes
 * from the input (R-33). The request shape is cap-video's own (R-14): nothing is copied here.
 */
exports.SOCIAL_TOPIC_VIDEO_TOOLS = { brief: 'social_topic_brief' };
exports.SOCIAL_VIDEO_EXTERNAL_REF_PREFIX = 'social:';
const TopicIdSchema = topic_js_1.SocialTopicSchema.shape.topicId;
const BRIEF_MAX = 6000;
/** `social:<topicId>`: the common reference the video project carries back to its topic. */
function socialVideoExternalRef(topicId) {
    return exports.SOCIAL_VIDEO_EXTERNAL_REF_PREFIX + TopicIdSchema.parse(topicId);
}
/** The topic id inside an `externalRef`, or `null` when it is not a social one. */
function parseSocialVideoExternalRef(ref) {
    if (typeof ref !== 'string' || !ref.startsWith(exports.SOCIAL_VIDEO_EXTERNAL_REF_PREFIX))
        return null;
    const parsed = TopicIdSchema.safeParse(ref.slice(exports.SOCIAL_VIDEO_EXTERNAL_REF_PREFIX.length));
    return parsed.success ? parsed.data : null;
}
/** The owner picks preset, mode, budget, approver and choices; no identity, brief, externalRef or footage. */
exports.SocialTopicBriefInputSchema = tools_js_1.VideoBriefToolInputSchema
    .omit({ brief: true, externalRef: true, requestedBy: true, footage: true })
    .extend({ topicId: TopicIdSchema })
    .strict();
exports.SocialTopicBriefOutputSchema = zod_1.z.strictObject({
    topicId: TopicIdSchema,
    externalRef: brief_js_1.VideoBriefRequestSchema.shape.externalRef.unwrap(),
    projectId: brief_js_1.VideoProjectIdSchema,
    state: brief_js_1.VideoProjectStateSchema,
});
exports.SocialTopicBriefToolErrorSchema = zod_1.z.enum([
    'invalid_request', 'not_configured', 'unknown_topic', 'video_not_enabled', 'video_refused',
]);
/** Brief text in Italian; over the limit, whole facts are dropped from the end, never cut in half. */
function socialTopicVideoBriefText(topic) {
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
/** The request of `video_brief_create`, validated with cap-video's own schema. */
function socialTopicVideoBriefInput(topic, choices) {
    return tools_js_1.VideoBriefToolInputSchema.parse({
        ...choices,
        brief: socialTopicVideoBriefText(topic),
        externalRef: socialVideoExternalRef(topic.topicId),
    });
}
//# sourceMappingURL=video-brief.js.map