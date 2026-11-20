import { describe, it, expect } from 'vitest';
import {
  SOCIAL_TOPIC_VIDEO_TOOLS,
  SOCIAL_LISTENING_TOOLS,
  SocialTopicBriefInputSchema,
  SocialTopicBriefOutputSchema,
  socialTopicVideoBriefInput,
  socialTopicVideoBriefText,
  parseSocialVideoExternalRef,
  type SocialTopicGetOutput,
} from '../../../src/capability/social-listening/index';
import { VideoBriefToolInputSchema } from '../../../src/capability/video/tools';

const url = 'https://example.com/post/1';
const topic: SocialTopicGetOutput = {
  topicId: 'cluster-1',
  verticalId: 'ai',
  day: '2026-11-03',
  title: 'Skill di Claude Code e Claude',
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
const choices = { presetId: 'singola', mode: 'approval', budgetUsd: 5, approverEmail: 'a@example.com' } as const;

describe('social_topic_brief', () => {
  it('(a) has its own tool name', () => {
    expect(SOCIAL_TOPIC_VIDEO_TOOLS.brief).toBe('social_topic_brief');
    expect(Object.values(SOCIAL_LISTENING_TOOLS)).not.toContain('social_topic_brief');
  });

  it('(b) input refuses identity, brief, externalRef and a missing preset', () => {
    const ok = { ...choices, topicId: 'cluster-1' };
    expect(SocialTopicBriefInputSchema.safeParse(ok).success).toBe(true);
    for (const extra of [{ tenantId: 't' }, { brief: 'x' }, { externalRef: 'social:x' }]) {
      expect(SocialTopicBriefInputSchema.safeParse({ ...ok, ...extra }).success).toBe(false);
    }
    const { presetId: _p, ...noPreset } = ok;
    expect(SocialTopicBriefInputSchema.safeParse(noPreset).success).toBe(false);
  });

  it('(c) builds a request valid for cap-video with externalRef social:<id>', () => {
    const input = socialTopicVideoBriefInput(topic, choices);
    expect(VideoBriefToolInputSchema.safeParse(input).success).toBe(true);
    expect(input.externalRef).toBe('social:cluster-1');
    expect(input.brief).toContain(topic.title);
    expect(input.brief).toContain(topic.summary);
    expect(input.brief).toContain(url);
    expect(input.brief).toContain('Verdetto: da_provare');
  });

  it('(d) cuts whole facts from the end within 6000 characters', () => {
    const facts = Array.from({ length: 20 }, (_, i) => ({
      text: `F${String(i).padStart(2, '0')} ` + 'x'.repeat(395),
      sourceUrls: [url],
    }));
    const text = socialTopicVideoBriefText({ ...topic, facts });
    expect(text.length).toBeLessThanOrEqual(6000);
    expect(text).toContain(topic.title);
    expect(text).toContain(topic.summary);
    const present = facts.filter((f) => text.includes(f.text));
    expect(present.length).toBeGreaterThan(0);
    expect(present.length).toBeLessThan(20);
    // facts kept are a prefix and none is cut: every "Fnn " marker has its full text
    const markers = text.match(/F\d\d x/g) ?? [];
    expect(markers.length).toBe(present.length);
    expect(present.map((f) => f.text)).toEqual(facts.slice(0, present.length).map((f) => f.text));
    expect(socialTopicVideoBriefInput({ ...topic, facts }, choices).brief.length).toBeLessThanOrEqual(6000);
  });

  it('(e) parses the external reference', () => {
    expect(parseSocialVideoExternalRef('social:cluster-1')).toBe('cluster-1');
    expect(parseSocialVideoExternalRef('video:x')).toBeNull();
    expect(parseSocialVideoExternalRef('social:')).toBeNull();
    expect(parseSocialVideoExternalRef('social:' + 'a'.repeat(101))).toBeNull();
    expect(parseSocialVideoExternalRef(42)).toBeNull();
  });

  it('(f) output refuses identity', () => {
    const out = { topicId: 'cluster-1', externalRef: 'social:cluster-1', projectId: 'vp-1', state: 'created' };
    expect(SocialTopicBriefOutputSchema.safeParse(out).success).toBe(true);
    const identity = { tenantId: 't', ownerId: 'o', agentId: 'x9' };
    expect(SocialTopicBriefOutputSchema.safeParse({ ...out, identity }).success).toBe(false);
  });
});
