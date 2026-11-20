import { z } from 'zod';
import { ResearchIdSchema, ResearchResultSchema } from "../ricerca/research.js";
import { SocialTopicSchema } from "./topic.js";
/**
 * Reads the result of a topic's extended research apart from the start tool (D14).
 * Neither identity nor budget comes from the tool input: scope is the call's.
 */
export const SOCIAL_TOPIC_RESEARCH_RESULT_TOOLS = { result: 'social_topic_research_result' };
const TopicIdSchema = SocialTopicSchema.shape.topicId;
export const SocialTopicResearchResultInputSchema = z.strictObject({ topicId: TopicIdSchema });
export const SocialTopicResearchResultOutputSchema = z.strictObject({
    topicId: TopicIdSchema,
    researchId: ResearchIdSchema,
    result: ResearchResultSchema,
}).superRefine((output, ctx) => {
    if (output.result.researchId !== output.researchId) {
        ctx.addIssue({
            code: 'custom',
            path: ['result', 'researchId'],
            message: 'result.researchId must equal researchId',
        });
    }
});
export const SocialTopicResearchResultToolErrorSchema = z.enum([
    'invalid_request', 'not_configured', 'unknown_topic', 'not_researched',
    'research_not_ready', 'research_not_enabled',
]);
//# sourceMappingURL=topic-research-result.js.map