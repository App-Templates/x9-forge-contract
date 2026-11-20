"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialTopicResearchToolErrorSchema = exports.SocialTopicResearchOutputSchema = exports.SocialTopicResearchInputSchema = exports.SOCIAL_RESEARCH_NARROW_PARAMS = exports.SOCIAL_TOPIC_RESEARCH_TOOLS = void 0;
exports.socialTopicResearchRequest = socialTopicResearchRequest;
exports.socialTopicResearchDecision = socialTopicResearchDecision;
const zod_1 = require("zod");
const research_js_1 = require("../ricerca/research.cjs");
const cap_js_1 = require("./cap.cjs");
const topic_js_1 = require("./topic.cjs");
/**
 * Extended research requested by the owner, never by an automatic round (D10).
 * The service forwards the same identity envelope to cap-ricerca and saves extendedResearchId (D14).
 * Neither identity nor budget comes from the tool input.
 */
exports.SOCIAL_TOPIC_RESEARCH_TOOLS = { start: 'social_topic_research' };
/** Fixed caller-specific research limits for the $0.30 ceiling (D18). */
exports.SOCIAL_RESEARCH_NARROW_PARAMS = { maxToolCalls: 1, searchContextSize: 'low', reasoningEffort: 'low' };
const TopicIdSchema = topic_js_1.SocialTopicSchema.shape.topicId;
exports.SocialTopicResearchInputSchema = zod_1.z.strictObject({ topicId: TopicIdSchema });
exports.SocialTopicResearchOutputSchema = zod_1.z.strictObject({
    topicId: TopicIdSchema,
    researchId: research_js_1.ResearchIdSchema,
    state: research_js_1.ResearchStateSchema,
});
exports.SocialTopicResearchToolErrorSchema = zod_1.z.enum([
    'invalid_request', 'not_configured', 'unknown_topic', 'already_researched',
    'research_cap_reached', 'research_not_enabled', 'research_budget_exhausted',
]);
/** Build research_start's request using the agent's budget and cap-ricerca's own schema. */
function socialTopicResearchRequest(topic, research) {
    let question = `Verifica e approfondisci: ${topic.title}. ${topic.summary}`;
    if (question.length > 2000) {
        // Include the next character to distinguish a whole word at the boundary from a partial one.
        question = question.slice(0, 2001).replace(/\s+\S*$/u, '').trimEnd();
    }
    return research_js_1.ResearchRequestSchema.parse({
        question,
        goal: "Approfondire con fonti aperte un argomento dell'ascolto social: confermare o smentire i fatti",
        maxUsd: research.maxUsdPerResearch,
        params: exports.SOCIAL_RESEARCH_NARROW_PARAMS,
    });
}
/** The caller owns the daily ledger; reuse the microdollar cap check before reserving research. */
function socialTopicResearchDecision({ topic, research, spentTodayUsd }) {
    if (topic.extendedResearchId !== undefined)
        return { ok: false, error: 'already_researched' };
    const decision = (0, cap_js_1.socialCapDecision)({
        track: 'server',
        capUsd: research.dailyCapUsd,
        spentUsd: spentTodayUsd,
        estimateUsd: research.maxUsdPerResearch,
    });
    if (!decision.ok) {
        if (decision.reason === 'invalid_input')
            return { ok: false, error: 'invalid_request' };
        return { ok: false, error: 'research_cap_reached', remainingUsd: decision.remainingUsd };
    }
    return { ok: true, maxUsd: research.maxUsdPerResearch };
}
//# sourceMappingURL=topic-research.js.map