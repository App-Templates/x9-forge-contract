import { describe, it, expect } from 'vitest';
import {
  SOCIAL_TOPIC_RESEARCH_RESULT_TOOLS,
  SOCIAL_TOPIC_RESEARCH_TOOLS,
  SocialTopicResearchResultInputSchema,
  SocialTopicResearchResultOutputSchema,
  SocialTopicResearchResultToolErrorSchema,
} from '../../../src/capability/social-listening/index';

const result = {
  researchId: 'research-1',
  agentId: 'x9',
  state: 'completed',
  question: 'Verifica e approfondisci: Skill di Claude Code',
  findings: [],
  newQuestions: [],
  sources: [],
  cost: { usd: 0.12, inputTokens: 10, outputTokens: 20, webCalls: 1, uncertain: false },
};
const output = { topicId: 'cluster-1', researchId: 'research-1', result };

describe('social_topic_research_result', () => {
  it('(a) has its own tool name and leaves the start tool alone', () => {
    expect(SOCIAL_TOPIC_RESEARCH_RESULT_TOOLS).toEqual({ result: 'social_topic_research_result' });
    expect(SOCIAL_TOPIC_RESEARCH_TOOLS).toEqual({ start: 'social_topic_research' });
  });

  it('(b) accepts only a topic id, no identity', () => {
    const input = { topicId: 't-1' };
    expect(SocialTopicResearchResultInputSchema.parse(input)).toEqual(input);
    expect(SocialTopicResearchResultInputSchema.safeParse({ ...input, agentId: 'a' }).success).toBe(false);
    expect(SocialTopicResearchResultInputSchema.safeParse({}).success).toBe(false);
    expect(SocialTopicResearchResultInputSchema.safeParse({ topicId: '' }).success).toBe(false);
  });

  it('(c) accepts a real result and rejects a mismatching research id', () => {
    expect(SocialTopicResearchResultOutputSchema.safeParse(output).success).toBe(true);
    expect(SocialTopicResearchResultOutputSchema.safeParse({
      ...output, result: { ...result, researchId: 'research-2' },
    }).success).toBe(false);
  });

  it('(d) is strict and requires the topic id', () => {
    expect(SocialTopicResearchResultOutputSchema.safeParse({ ...output, agentId: 'x9' }).success).toBe(false);
    const { topicId: _omit, ...withoutTopic } = output;
    expect(SocialTopicResearchResultOutputSchema.safeParse(withoutTopic).success).toBe(false);
  });

  it('(e) has exactly the six tool errors, in order', () => {
    expect(SocialTopicResearchResultToolErrorSchema.options).toEqual([
      'invalid_request', 'not_configured', 'unknown_topic', 'not_researched',
      'research_not_ready', 'research_not_enabled',
    ]);
  });
});
