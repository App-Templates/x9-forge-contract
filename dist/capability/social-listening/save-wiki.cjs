"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialTopicWikiToolErrorSchema = exports.SocialTopicSaveWikiOutputSchema = exports.SocialTopicSaveWikiInputSchema = exports.SOCIAL_WIKI_REVERIFY_DAYS = exports.SOCIAL_TOPIC_WIKI_TOOLS = void 0;
exports.socialWikiReverifyDue = socialWikiReverifyDue;
exports.socialTopicLabIngestInput = socialTopicLabIngestInput;
const zod_1 = require("zod");
const tools_js_1 = require("../lab/tools.cjs");
const agent_config_js_1 = require("../ricerca/agent-config.cjs");
const topic_js_1 = require("./topic.cjs");
const video_brief_js_1 = require("./video-brief.cjs");
/**
 * "Salva nella wiki": from a topic to the request of `lab_ingest`, only with the explicit yes of the owner (D15).
 *
 * The service accepts this tool only from a call of the owner (Forge page or a message of the owner), never from an
 * automatic round. Identity never comes from the input (R-33); the service calls cap-lab with the same envelope.
 */
exports.SOCIAL_TOPIC_WIKI_TOOLS = { save: 'social_topic_save_wiki' };
exports.SOCIAL_WIKI_REVERIFY_DAYS = 90;
/** Elapsed whole days since wiki acceptance; the caller supplies the current time. */
function socialWikiReverifyDue(topic, nowIso) {
    try {
        const parsed = topic_js_1.SocialTopicSchema.safeParse(topic);
        const now = topic_js_1.SocialTopicSchema.shape.computedAt.safeParse(nowIso);
        if (!parsed.success || !now.success)
            return { state: 'invalid_input' };
        if (parsed.data.wikiSavedAt === undefined)
            return { state: 'not_saved' };
        const age = Date.parse(now.data) - Date.parse(parsed.data.wikiSavedAt);
        if (!Number.isFinite(age) || age < 0)
            return { state: 'invalid_input' };
        const daysOld = Math.floor(age / 86_400_000);
        return { state: daysOld >= exports.SOCIAL_WIKI_REVERIFY_DAYS ? 'due' : 'fresh', daysOld };
    }
    catch {
        return { state: 'invalid_input' };
    }
}
const TopicIdSchema = topic_js_1.SocialTopicSchema.shape.topicId;
exports.SocialTopicSaveWikiInputSchema = zod_1.z.strictObject({
    topicId: TopicIdSchema,
    ownerConfirmed: zod_1.z.literal(true),
});
exports.SocialTopicSaveWikiOutputSchema = zod_1.z.strictObject({
    topicId: TopicIdSchema,
    ingestId: tools_js_1.LabIngestIdSchema,
    state: zod_1.z.literal('queued'),
});
exports.SocialTopicWikiToolErrorSchema = zod_1.z.enum([
    'invalid_request', 'not_configured', 'unknown_topic', 'nothing_to_save', 'lab_not_enabled',
]);
/**
 * The request of `lab_ingest`, validated with cap-lab's own schema. With an extended research the research itself is
 * passed (richer); otherwise the verified facts become a synthetic result with id `social:<topicId>`.
 */
function socialTopicLabIngestInput(topic, agentId) {
    if (topic.extendedResearchId !== undefined) {
        return { ok: true, input: tools_js_1.LabIngestInputSchema.parse({ researchId: topic.extendedResearchId }) };
    }
    if (topic.facts.length === 0)
        return { ok: false, error: 'nothing_to_save' };
    return {
        ok: true,
        input: tools_js_1.LabIngestInputSchema.parse({
            result: {
                researchId: (0, video_brief_js_1.socialVideoExternalRef)(topic.topicId),
                agentId: agent_config_js_1.CapabilityAgentIdSchema.parse(agentId),
                state: 'completed',
                question: topic.title,
                findings: topic.facts.map((f) => ({ text: f.text, sourceUrls: f.sourceUrls, origin: 'web' })),
                newQuestions: [],
                sources: topic.sources,
                cost: { usd: topic.cost.usd, inputTokens: 0, outputTokens: 0, webCalls: 0, uncertain: topic.cost.uncertain },
            },
        }),
    };
}
//# sourceMappingURL=save-wiki.js.map