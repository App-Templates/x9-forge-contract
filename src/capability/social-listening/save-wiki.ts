import { z } from 'zod';
import { LabIngestIdSchema, LabIngestInputSchema, type LabIngestInput } from '../lab/tools.js';
import { CapabilityAgentIdSchema } from '../ricerca/agent-config.js';
import { SocialTopicSchema } from './topic.js';
import type { SocialTopicGetOutput } from './tools.js';
import { socialVideoExternalRef } from './video-brief.js';

/**
 * "Salva nella wiki": from a topic to the request of `lab_ingest`, only with the explicit yes of the owner (D15).
 *
 * The service accepts this tool only from a call of the owner (Forge page or a message of the owner), never from an
 * automatic round. Identity never comes from the input (R-33); the service calls cap-lab with the same envelope.
 */
export const SOCIAL_TOPIC_WIKI_TOOLS = { save: 'social_topic_save_wiki' } as const;

const TopicIdSchema = SocialTopicSchema.shape.topicId;

export const SocialTopicSaveWikiInputSchema = z.strictObject({
  topicId: TopicIdSchema,
  ownerConfirmed: z.literal(true),
});
export type SocialTopicSaveWikiInput = z.infer<typeof SocialTopicSaveWikiInputSchema>;

export const SocialTopicSaveWikiOutputSchema = z.strictObject({
  topicId: TopicIdSchema,
  ingestId: LabIngestIdSchema,
  state: z.literal('queued'),
});
export type SocialTopicSaveWikiOutput = z.infer<typeof SocialTopicSaveWikiOutputSchema>;

export const SocialTopicWikiToolErrorSchema = z.enum([
  'invalid_request', 'not_configured', 'unknown_topic', 'nothing_to_save', 'lab_not_enabled',
]);
export type SocialTopicWikiToolError = z.infer<typeof SocialTopicWikiToolErrorSchema>;

export type SocialTopicLabIngestResult =
  | { ok: true; input: LabIngestInput }
  | { ok: false; error: 'nothing_to_save' };

/**
 * The request of `lab_ingest`, validated with cap-lab's own schema. With an extended research the research itself is
 * passed (richer); otherwise the verified facts become a synthetic result with id `social:<topicId>`.
 */
export function socialTopicLabIngestInput(
  topic: SocialTopicGetOutput,
  agentId: string,
): SocialTopicLabIngestResult {
  if (topic.extendedResearchId !== undefined) {
    return { ok: true, input: LabIngestInputSchema.parse({ researchId: topic.extendedResearchId }) };
  }
  if (topic.facts.length === 0) return { ok: false, error: 'nothing_to_save' };
  return {
    ok: true,
    input: LabIngestInputSchema.parse({
      result: {
        researchId: socialVideoExternalRef(topic.topicId),
        agentId: CapabilityAgentIdSchema.parse(agentId),
        state: 'completed',
        question: topic.title,
        findings: topic.facts.map((f) => ({ text: f.text, sourceUrls: f.sourceUrls, origin: 'web' as const })),
        newQuestions: [],
        sources: topic.sources,
        cost: { usd: topic.cost.usd, inputTokens: 0, outputTokens: 0, webCalls: 0, uncertain: topic.cost.uncertain },
      },
    }),
  };
}
