import { describe, it, expect } from 'vitest';
import {
  SOCIAL_RESEARCH_NARROW_PARAMS,
  SocialTopicResearchInputSchema,
  SocialTopicResearchToolErrorSchema,
  socialTopicResearchRequest,
} from '../../../src/capability/social-listening/topic-research';
import type { SocialTopicGetOutput } from '../../../src/capability/social-listening/tools';
import { ResearchRequestSchema, resolveResearchParams } from '../../../src/capability/ricerca/research';

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

describe('social topic narrow research', () => {
  it('s9760 (a) builds a validated narrow request', () => {
    const request = socialTopicResearchRequest(topic, { maxUsdPerResearch: 0.3, dailyCapUsd: 1 });
    expect(request.params).toEqual({
      maxToolCalls: 1, searchContextSize: 'low', reasoningEffort: 'low',
    });
    expect(ResearchRequestSchema.safeParse(request).success).toBe(true);
  });

  it('s9760 (b) stays within both high and minimum agent maxima', () => {
    expect(resolveResearchParams({
      maxToolCalls: 6, searchContextSize: 'high', reasoningEffort: 'high',
    }, SOCIAL_RESEARCH_NARROW_PARAMS)).toEqual({ ok: true, params: SOCIAL_RESEARCH_NARROW_PARAMS });
    expect(resolveResearchParams({
      maxToolCalls: 1, searchContextSize: 'low', reasoningEffort: 'low',
    }, SOCIAL_RESEARCH_NARROW_PARAMS)).toEqual({ ok: true, params: SOCIAL_RESEARCH_NARROW_PARAMS });
  });

  it('s9760 (c) fixes D18 values and rejects caller params in tool input', () => {
    expect(SOCIAL_RESEARCH_NARROW_PARAMS).toEqual({
      maxToolCalls: 1, searchContextSize: 'low', reasoningEffort: 'low',
    });
    expect(SocialTopicResearchInputSchema.safeParse({ topicId: topic.topicId }).success).toBe(true);
    expect(SocialTopicResearchInputSchema.safeParse({
      topicId: topic.topicId, params: SOCIAL_RESEARCH_NARROW_PARAMS,
    }).success).toBe(false);
  });

  it('s9760 (d) distinguishes exhausted budget from research not enabled', () => {
    expect(SocialTopicResearchToolErrorSchema.options).toContain('research_budget_exhausted');
    expect(SocialTopicResearchToolErrorSchema.options).toContain('research_not_enabled');
  });
});
