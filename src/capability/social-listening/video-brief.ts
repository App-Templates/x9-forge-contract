import { z } from 'zod';
import {
  VideoBriefRequestSchema,
  VideoBriefResponseSchema,
  VideoProjectIdSchema,
  VideoProjectStateSchema,
} from '../video/brief.js';
import { VideoBriefToolInputSchema, type VideoBriefToolInput } from '../video/tools.js';
import { SocialTopicSchema, type SocialTopic } from './topic.js';
import type { SocialTopicGetOutput } from './tools.js';

/**
 * "Passa a cap video": from a topic to the request of `video_brief_create`.
 *
 * The X9 service calls cap-video with the SAME identity envelope as the call it received; identity never comes
 * from the input (R-33). The request shape is cap-video's own (R-14): nothing is copied here.
 */
export const SOCIAL_TOPIC_VIDEO_TOOLS = { brief: 'social_topic_brief' } as const;

export const SOCIAL_VIDEO_EXTERNAL_REF_PREFIX = 'social:';

const TopicIdSchema = SocialTopicSchema.shape.topicId;
const BRIEF_MAX = 6000;

/** `social:<topicId>`: the common reference the video project carries back to its topic. */
export function socialVideoExternalRef(topicId: string): string {
  return SOCIAL_VIDEO_EXTERNAL_REF_PREFIX + TopicIdSchema.parse(topicId);
}

/** The topic id inside an `externalRef`, or `null` when it is not a social one. */
export function parseSocialVideoExternalRef(ref: unknown): string | null {
  if (typeof ref !== 'string' || !ref.startsWith(SOCIAL_VIDEO_EXTERNAL_REF_PREFIX)) return null;
  const parsed = TopicIdSchema.safeParse(ref.slice(SOCIAL_VIDEO_EXTERNAL_REF_PREFIX.length));
  return parsed.success ? parsed.data : null;
}

/** The owner picks preset, mode, budget, approver and choices; no identity, brief, externalRef or footage. */
export const SocialTopicBriefInputSchema = VideoBriefToolInputSchema
  .omit({ brief: true, externalRef: true, requestedBy: true, footage: true })
  .extend({ topicId: TopicIdSchema })
  .strict();
export type SocialTopicBriefInput = z.infer<typeof SocialTopicBriefInputSchema>;

export const SocialTopicBriefOutputSchema = z.strictObject({
  topicId: TopicIdSchema,
  externalRef: VideoBriefRequestSchema.shape.externalRef.unwrap(),
  projectId: VideoProjectIdSchema,
  state: VideoProjectStateSchema,
});
export type SocialTopicBriefOutput = z.infer<typeof SocialTopicBriefOutputSchema>;

/**
 * The topic after its brief went out: `videoProjectId` is written only when cap-video's answer is about THIS topic
 * (same topic id and same `social:<id>` reference). The last brief wins. Never throws.
 */
export function socialTopicAfterBrief(
  topic: SocialTopic,
  output: unknown,
): { ok: true; topic: SocialTopic } | { ok: false; error: 'invalid_output' | 'topic_mismatch' | 'ref_mismatch' } {
  const parsed = SocialTopicBriefOutputSchema.safeParse(output);
  if (!parsed.success) return { ok: false, error: 'invalid_output' };
  if (parsed.data.topicId !== topic.topicId) return { ok: false, error: 'topic_mismatch' };
  if (parsed.data.externalRef !== SOCIAL_VIDEO_EXTERNAL_REF_PREFIX + topic.topicId) {
    return { ok: false, error: 'ref_mismatch' };
  }
  const next = SocialTopicSchema.safeParse({ ...topic, videoProjectId: parsed.data.projectId });
  if (!next.success) return { ok: false, error: 'invalid_output' };
  return { ok: true, topic: next.data };
}

/**
 * Name of the capability in the agent's registry, and the cap-video tools the social page calls through the
 * factory's generic capability route. Their schemas stay in `capability/video` (`VideoBriefToolInputSchema`,
 * `VideoPresetsListToolInputSchema`, `VideoPresetsListResponseSchema`, `VideoBriefResponseSchema`).
 */
export const SOCIAL_VIDEO_CAPABILITY = 'video' as const;
export const SOCIAL_VIDEO_TOOLS = { brief: 'video_brief_create', presets: 'video_presets_list' } as const;

/**
 * cap-video's brief response as the topic output: only project and state are kept (identity, preset, mode and
 * budget are dropped). Never throws.
 */
export function socialTopicBriefOutputFromVideo(
  topicId: unknown,
  response: unknown,
): { ok: true; output: SocialTopicBriefOutput } | { ok: false; error: 'invalid_output' } {
  const id = TopicIdSchema.safeParse(topicId);
  const video = VideoBriefResponseSchema.safeParse(response);
  if (!id.success || !video.success) return { ok: false, error: 'invalid_output' };
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
export type SocialTopicBriefToolError = z.infer<typeof SocialTopicBriefToolErrorSchema>;

/** Brief text in Italian; over the limit, whole facts are dropped from the end, never cut in half. */
export function socialTopicVideoBriefText(topic: SocialTopicGetOutput): string {
  const head = [topic.title, topic.summary, `Verdetto: ${topic.verdict}`];
  const factBlocks = topic.facts.map((f) => [f.text, ...f.sourceUrls].join('\n'));
  const creators = `Creator: ${topic.creators.join(', ')}`;
  const build = (n: number, withCreators: boolean): string => {
    const parts = [...head];
    if (n > 0) parts.push(['Fatti verificati:', ...factBlocks.slice(0, n)].join('\n'));
    if (withCreators) parts.push(creators);
    return parts.join('\n');
  };
  for (let n = factBlocks.length; n >= 0; n--) {
    const text = build(n, true);
    if (text.length <= BRIEF_MAX) return text;
  }
  return build(0, false);
}

/** The request of `video_brief_create`, validated with cap-video's own schema. */
export function socialTopicVideoBriefInput(
  topic: SocialTopicGetOutput,
  choices: Omit<SocialTopicBriefInput, 'topicId'>,
): VideoBriefToolInput {
  return VideoBriefToolInputSchema.parse({
    ...choices,
    brief: socialTopicVideoBriefText(topic),
    externalRef: socialVideoExternalRef(topic.topicId),
  });
}
