"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialTopicResearchResultToolErrorSchema = exports.SocialTopicResearchResultOutputSchema = exports.SocialTopicResearchResultInputSchema = exports.SOCIAL_TOPIC_RESEARCH_RESULT_TOOLS = void 0;
const zod_1 = require("zod");
const research_js_1 = require("../ricerca/research.cjs");
const topic_js_1 = require("./topic.cjs");
/**
 * Reads the result of a topic's extended research apart from the start tool (D14).
 * Neither identity nor budget comes from the tool input: scope is the call's.
 */
exports.SOCIAL_TOPIC_RESEARCH_RESULT_TOOLS = { result: 'social_topic_research_result' };
const TopicIdSchema = topic_js_1.SocialTopicSchema.shape.topicId;
exports.SocialTopicResearchResultInputSchema = zod_1.z.strictObject({ topicId: TopicIdSchema });
exports.SocialTopicResearchResultOutputSchema = zod_1.z.strictObject({
    topicId: TopicIdSchema,
    researchId: research_js_1.ResearchIdSchema,
    result: research_js_1.ResearchResultSchema,
}).superRefine((output, ctx) => {
    if (output.result.researchId !== output.researchId) {
        ctx.addIssue({
            code: 'custom',
            path: ['result', 'researchId'],
            message: 'result.researchId must equal researchId',
        });
    }
});
exports.SocialTopicResearchResultToolErrorSchema = zod_1.z.enum([
    'invalid_request', 'not_configured', 'unknown_topic', 'not_researched',
    'research_not_ready', 'research_not_enabled',
]);
//# sourceMappingURL=topic-research-result.js.map