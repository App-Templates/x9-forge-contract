import { describe, it, expect } from 'vitest';
import {
  SOCIAL_TOPIC_RESEARCH_TOOLS,
  SOCIAL_LISTENING_TOOLS,
  SOCIAL_CREATORS_TOOLS,
  SOCIAL_FAVORITES_TOOLS,
  SOCIAL_TOPIC_VIDEO_TOOLS,
  SOCIAL_TOPIC_WIKI_TOOLS,
  SocialTopicGetOutputSchema,
  SocialTopicResearchInputSchema,
  SocialTopicResearchOutputSchema,
  SocialTopicResearchToolErrorSchema,
  socialTopicResearchRequest,
  socialTopicResearchDecision,
  type SocialTopicGetOutput,
} from '../../../src/capability/social-listening/index';
import { ResearchRequestSchema, ResearchStateSchema } from '../../../src/capability/ricerca/research';

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
  creators: ['alassafi.ai'],
  cost: { usd: 0.12, track: 'server', uncertain: true },
  computedAt: '2026-11-03T14:31:00+00:00',
};
const research = { maxUsdPerResearch: 0.3, dailyCapUsd: 1 };

describe('social_topic_research', () => {
  it('(a) has a distinct social tool name', () => {
    expect(SOCIAL_TOPIC_RESEARCH_TOOLS).toEqual({ start: 'social_topic_research' });
    for (const tools of [SOCIAL_LISTENING_TOOLS, SOCIAL_CREATORS_TOOLS, SOCIAL_FAVORITES_TOOLS,
      SOCIAL_TOPIC_VIDEO_TOOLS, SOCIAL_TOPIC_WIKI_TOOLS]) {
      expect(Object.values(tools)).not.toContain(SOCIAL_TOPIC_RESEARCH_TOOLS.start);
    }
  });

  it('(b) accepts only a topic id without caller budget or identity', () => {
    const input = { topicId: topic.topicId };
    expect(SocialTopicResearchInputSchema.parse(input)).toEqual(input);
    for (const extra of [{ maxUsd: 50 }, { agentId: 'x9' }, { tenantId: 't' }, { ownerId: 'o' }]) {
      expect(SocialTopicResearchInputSchema.safeParse({ ...input, ...extra }).success).toBe(false);
    }
    expect(SocialTopicResearchInputSchema.safeParse({}).success).toBe(false);
    expect(SocialTopicResearchInputSchema.safeParse({ topicId: '' }).success).toBe(false);
  });

  it('(c) builds a validated research request with the configured budget', () => {
    expect(SocialTopicGetOutputSchema.safeParse(topic).success).toBe(true);
    const request = socialTopicResearchRequest(topic, research);
    expect(ResearchRequestSchema.safeParse(request).success).toBe(true);
    expect(request).toEqual({
      question: `Verifica e approfondisci: ${topic.title}. ${topic.summary}`,
      goal: "Approfondire con fonti aperte un argomento dell'ascolto social: confermare o smentire i fatti",
      maxUsd: 0.3,
    });
    expect(socialTopicResearchRequest(topic, { maxUsdPerResearch: 0.2, dailyCapUsd: 0.8 }).maxUsd).toBe(0.2);
    expect(() => socialTopicResearchRequest(topic, { ...research, maxUsdPerResearch: -1 })).toThrow();
  });

  it('(d) truncates a 2000 character summary at the last whole word', () => {
    const summary = 'approfondimento '.repeat(125);
    expect(summary).toHaveLength(2000);
    const longTopic = { ...topic, summary };
    expect(SocialTopicGetOutputSchema.safeParse(longTopic).success).toBe(true);
    const full = `Verifica e approfondisci: ${topic.title}. ${summary}`;
    const request = socialTopicResearchRequest(longTopic, research);
    expect(request.question.length).toBeLessThanOrEqual(2000);
    expect(request.question).toContain(topic.title);
    expect(request.question.endsWith('approfondimento')).toBe(true);
    expect(full.startsWith(request.question)).toBe(true);
    expect(full[request.question.length]).toMatch(/\s/u);
    expect(full.slice(request.question.length).trimStart().split(/\s/u)[0]!.length
      + request.question.length + 1).toBeGreaterThan(2000);
    expect(ResearchRequestSchema.safeParse(request).success).toBe(true);

    // A complete word ending exactly at the boundary must be kept.
    const head = `Verifica e approfondisci: ${topic.title}. `;
    const boundarySummary = 'a'.repeat(2000 - head.length) + ' fine';
    expect(socialTopicResearchRequest({ ...topic, summary: boundarySummary }, research).question)
      .toBe(head + 'a'.repeat(2000 - head.length));
  });

  it('(e) admits the exact daily cap and refuses excess, repeats and invalid spend', () => {
    const decide = (spentTodayUsd: number) => socialTopicResearchDecision({ topic, research, spentTodayUsd });
    expect(decide(0.7)).toEqual({ ok: true, maxUsd: 0.3 });
    expect(decide(0.71)).toEqual({ ok: false, error: 'research_cap_reached', remainingUsd: 0.29 });
    expect(decide(1.2)).toEqual({ ok: false, error: 'research_cap_reached', remainingUsd: 0 });
    for (const spentTodayUsd of [0, 2, -1]) {
      expect(socialTopicResearchDecision({
        topic: { ...topic, extendedResearchId: 'research-1' }, research, spentTodayUsd,
      })).toEqual({ ok: false, error: 'already_researched' });
    }
    for (const invalid of [-1, NaN, Infinity]) {
      expect(decide(invalid)).toEqual({ ok: false, error: 'invalid_request' });
    }
    expect(socialTopicResearchDecision({
      topic, research: { maxUsdPerResearch: 0.2, dailyCapUsd: 0.5 }, spentTodayUsd: 0.1 + 0.2,
    })).toEqual({ ok: true, maxUsd: 0.2 });
    expect(socialTopicResearchDecision({
      topic, research: { ...research, dailyCapUsd: -1 }, spentTodayUsd: 0,
    })).toEqual({ ok: false, error: 'invalid_request' });
  });

  it('(f) reuses research states and strictly validates output and tool errors', () => {
    const output = { topicId: topic.topicId, researchId: 'research-1', state: 'queued' };
    for (const state of ResearchStateSchema.options) {
      expect(SocialTopicResearchOutputSchema.safeParse({ ...output, state }).success).toBe(true);
    }
    for (const invalid of [{ state: 'unknown' }, { researchId: '' }, { agentId: 'x9' }]) {
      expect(SocialTopicResearchOutputSchema.safeParse({ ...output, ...invalid }).success).toBe(false);
    }
    expect(SocialTopicResearchToolErrorSchema.options).toEqual([
      'invalid_request', 'not_configured', 'unknown_topic', 'already_researched',
      'research_cap_reached', 'research_not_enabled',
    ]);
  });
});
