import { describe, expect, it } from 'vitest';
import {
  SOCIAL_LISTENING_TOOLS,
  SOCIAL_TOPIC_RESEARCH_TOOLS,
  SOCIAL_TOPIC_VIDEO_TOOLS,
  SOCIAL_TOPIC_WIKI_TOOLS,
  SocialTopicBriefOutputSchema,
  SocialTopicBriefTextInputSchema,
  SocialTopicBriefTextOutputSchema,
  SocialTopicSchema,
  SocialTopicVideoLinkInputSchema,
  SocialTopicVideoLinkOutputSchema,
  SocialTopicVideoToolErrorSchema,
  socialTopicAfterBrief,
  socialTopicBriefTextOutput,
  socialTopicVideoBriefText,
  type SocialTopicBriefTextInput,
  type SocialTopicBriefTextOutput,
  type SocialTopicGetOutput,
} from '../../../src/capability/social-listening/index';

const url = 'https://example.com/post/1';
const topic: SocialTopicGetOutput = {
  topicId: 'cluster-1',
  verticalId: 'ai',
  day: '2026-11-03',
  title: 'Skill di Claude Code',
  category: 'coding',
  summary: 'Le skill di Claude Code per design, scrittura e montaggio.',
  verdict: 'da_provare',
  facts: [{ text: 'Le skill si installano da una cartella.', sourceUrls: [url] }],
  sources: [{ url, title: 'Post', opened: true }],
  heat: 7.6,
  postIds: ['p1', 'p2'],
  creators: ['alassafi.ai', 'davi.d_roberts'],
  cost: { usd: 0, track: 'mac', uncertain: false },
  computedAt: '2026-11-03T14:31:00+00:00',
};
const link = {
  topicId: topic.topicId,
  externalRef: `social:${topic.topicId}`,
  projectId: 'vp-1',
  state: 'created',
};

describe('s9762 brief text and video link', () => {
  it('s9762 a keeps three distinct names outside the other tool groups', () => {
    expect(SOCIAL_TOPIC_VIDEO_TOOLS).toEqual({
      brief: 'social_topic_brief',
      text: 'social_topic_brief_text',
      link: 'social_topic_video_link',
    });
    for (const group of [SOCIAL_LISTENING_TOOLS, SOCIAL_TOPIC_WIKI_TOOLS, SOCIAL_TOPIC_RESEARCH_TOOLS]) {
      for (const name of Object.values(SOCIAL_TOPIC_VIDEO_TOOLS)) {
        expect(Object.values(group)).not.toContain(name);
      }
    }
  });

  it('s9762 b builds validated text with the exact topic reference', () => {
    const output: SocialTopicBriefTextOutput = socialTopicBriefTextOutput(topic);
    expect(output).toEqual({
      topicId: topic.topicId,
      brief: socialTopicVideoBriefText(topic),
      externalRef: 'social:' + topic.topicId,
    });
    expect(SocialTopicBriefTextOutputSchema.parse(output)).toEqual(output);
    for (const invalid of [
      { ...output, brief: '' },
      { ...output, brief: 'x'.repeat(6001) },
      { ...output, externalRef: 'x'.repeat(257) },
      { ...output, requestedBy: 'x' },
    ]) {
      expect(SocialTopicBriefTextOutputSchema.safeParse(invalid).success).toBe(false);
    }
    expect(() => socialTopicBriefTextOutput({ ...topic, topicId: '' })).toThrow();
  });

  it('s9762 c drops whole trailing facts from a forty-fact brief', () => {
    const facts = Array.from({ length: 40 }, (_, i) => ({
      text: `F${String(i).padStart(2, '0')} ` + 'x'.repeat(395),
      sourceUrls: [`https://example.com/post/${i}`],
    }));
    const output = socialTopicBriefTextOutput({ ...topic, facts });
    expect(output.brief.length).toBeLessThanOrEqual(6000);
    expect(SocialTopicBriefTextOutputSchema.safeParse(output).success).toBe(true);
    const kept = facts.filter((fact) => output.brief.includes(fact.text));
    expect(kept.length).toBeGreaterThan(0);
    expect(kept.length).toBeLessThan(facts.length);
    expect(kept).toEqual(facts.slice(0, kept.length));
    // Compare every character, including the last fact's source and the creator footer.
    expect(output.brief).toBe([
      topic.title,
      topic.summary,
      `Verdetto: ${topic.verdict}`,
      'Fatti verificati:',
      ...kept.map((fact) => [fact.text, ...fact.sourceUrls].join('\n')),
      `Creator: ${topic.creators.join(', ')}`,
    ].join('\n'));
  });

  it('s9762 d accepts only topic input and the existing strict link shape', () => {
    const input: SocialTopicBriefTextInput = { topicId: topic.topicId };
    expect(SocialTopicBriefTextInputSchema.parse(input)).toEqual(input);
    for (const invalid of [{}, { topicId: '' }, ...[
      'tenantId', 'ownerId', 'agentId', 'requestedBy',
    ].map((field) => ({ ...input, [field]: 'x' }))]) {
      expect(SocialTopicBriefTextInputSchema.safeParse(invalid).success).toBe(false);
    }
    expect(SocialTopicVideoLinkInputSchema).toBe(SocialTopicBriefOutputSchema);
    expect(SocialTopicVideoLinkInputSchema.parse(link)).toEqual(link);
    for (const invalid of [
      { ...link, projectId: '' },
      { ...link, state: 'unknown' },
      { ...link, extra: true },
      ...['tenantId', 'ownerId', 'agentId', 'requestedBy'].map((field) => ({ ...link, [field]: 'x' })),
    ]) {
      expect(SocialTopicVideoLinkInputSchema.safeParse(invalid).success).toBe(false);
    }
  });

  it('s9762 e links only the matching topic and reference without changing the original', () => {
    const storedTopic = SocialTopicSchema.parse({
      ...topic,
      identity: { tenantId: 't1', ownerId: 'o1', agentId: 'a1' },
    });
    const result = socialTopicAfterBrief(storedTopic, link);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Expected the video project to be linked');
    expect(result.topic.videoProjectId).toBe(link.projectId);
    const output = { topicId: result.topic.topicId, projectId: result.topic.videoProjectId, state: link.state };
    expect(SocialTopicVideoLinkOutputSchema.parse(output)).toEqual(output);
    for (const invalid of [
      { ...output, projectId: '' },
      { ...output, state: 'unknown' },
      { ...output, agentId: 'x' },
    ]) {
      expect(SocialTopicVideoLinkOutputSchema.safeParse(invalid).success).toBe(false);
    }
    expect(socialTopicAfterBrief(storedTopic, { ...link, topicId: 'other' }))
      .toEqual({ ok: false, error: 'topic_mismatch' });
    expect(socialTopicAfterBrief(storedTopic, { ...link, externalRef: 'social:altro' }))
      .toEqual({ ok: false, error: 'ref_mismatch' });
    expect(socialTopicAfterBrief(storedTopic, { ...link, projectId: '' }))
      .toEqual({ ok: false, error: 'invalid_output' });
    expect(storedTopic.videoProjectId).toBeUndefined();
  });

  it('s9762 f exposes the exact error vocabulary including all link failures', () => {
    expect(SocialTopicVideoToolErrorSchema.options).toEqual([
      'invalid_request', 'not_configured', 'unknown_topic',
      'topic_mismatch', 'ref_mismatch', 'invalid_output',
    ]);
    for (const error of ['invalid_output', 'topic_mismatch', 'ref_mismatch']) {
      expect(SocialTopicVideoToolErrorSchema.safeParse(error).success).toBe(true);
    }
    expect(SocialTopicVideoToolErrorSchema.safeParse('video_refused').success).toBe(false);
  });
});
