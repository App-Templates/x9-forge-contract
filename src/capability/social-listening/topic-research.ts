import { z } from 'zod';
import {
  ResearchIdSchema,
  ResearchRequestSchema,
  ResearchStateSchema,
  type ResearchRequest,
} from '../ricerca/research.js';
import { socialCapDecision } from './cap.js';
import type { SocialListeningAgentConfig } from './config.js';
import { SocialTopicSchema } from './topic.js';
import type { SocialTopicGetOutput } from './tools.js';

/**
 * Extended research requested by the owner, never by an automatic round (D10).
 * The service forwards the same identity envelope to cap-ricerca and saves extendedResearchId (D14).
 * Neither identity nor budget comes from the tool input.
 */
export const SOCIAL_TOPIC_RESEARCH_TOOLS = { start: 'social_topic_research' } as const;

/** Fixed caller-specific research limits for the $0.30 ceiling (D18). */
export const SOCIAL_RESEARCH_NARROW_PARAMS = { maxToolCalls: 1, searchContextSize: 'low', reasoningEffort: 'low' } as const;

const TopicIdSchema = SocialTopicSchema.shape.topicId;

export const SocialTopicResearchInputSchema = z.strictObject({ topicId: TopicIdSchema });
export type SocialTopicResearchInput = z.infer<typeof SocialTopicResearchInputSchema>;

export const SocialTopicResearchOutputSchema = z.strictObject({
  topicId: TopicIdSchema,
  researchId: ResearchIdSchema,
  state: ResearchStateSchema,
});
export type SocialTopicResearchOutput = z.infer<typeof SocialTopicResearchOutputSchema>;

export const SocialTopicResearchToolErrorSchema = z.enum([
  'invalid_request', 'not_configured', 'unknown_topic', 'already_researched',
  'research_cap_reached', 'research_not_enabled', 'research_budget_exhausted',
]);
export type SocialTopicResearchToolError = z.infer<typeof SocialTopicResearchToolErrorSchema>;

/** Build research_start's request using the agent's budget and cap-ricerca's own schema. */
export function socialTopicResearchRequest(
  topic: SocialTopicGetOutput,
  research: SocialListeningAgentConfig['research'],
): ResearchRequest {
  let question = `Verifica e approfondisci: ${topic.title}. ${topic.summary}`;
  if (question.length > 2000) {
    // Include the next character to distinguish a whole word at the boundary from a partial one.
    question = question.slice(0, 2001).replace(/\s+\S*$/u, '').trimEnd();
  }
  return ResearchRequestSchema.parse({
    question,
    goal: "Approfondire con fonti aperte un argomento dell'ascolto social: confermare o smentire i fatti",
    maxUsd: research.maxUsdPerResearch,
    params: SOCIAL_RESEARCH_NARROW_PARAMS,
  });
}

export type SocialTopicResearchDecision =
  | { ok: true; maxUsd: number }
  | { ok: false; error: 'already_researched' | 'research_cap_reached' | 'invalid_request'; remainingUsd?: number };

/** The caller owns the daily ledger; reuse the microdollar cap check before reserving research. */
export function socialTopicResearchDecision({ topic, research, spentTodayUsd }: {
  topic: SocialTopicGetOutput;
  research: SocialListeningAgentConfig['research'];
  spentTodayUsd: number;
}): SocialTopicResearchDecision {
  if (topic.extendedResearchId !== undefined) return { ok: false, error: 'already_researched' };
  const decision = socialCapDecision({
    track: 'server',
    capUsd: research.dailyCapUsd,
    spentUsd: spentTodayUsd,
    estimateUsd: research.maxUsdPerResearch,
  });
  if (!decision.ok) {
    if (decision.reason === 'invalid_input') return { ok: false, error: 'invalid_request' };
    return { ok: false, error: 'research_cap_reached', remainingUsd: decision.remainingUsd };
  }
  return { ok: true, maxUsd: research.maxUsdPerResearch };
}
