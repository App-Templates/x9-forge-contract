"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialAdoptionToolErrorSchema = exports.SocialAdoptionDecideOutputSchema = exports.SocialAdoptionListOutputSchema = exports.SocialAdoptionProposeOutputSchema = exports.SocialAdoptionDecideInputSchema = exports.SocialAdoptionListInputSchema = exports.SocialAdoptionProposeInputSchema = exports.SOCIAL_ADOPTION_TOOLS = exports.SocialAdoptionProposalSchema = exports.SocialAdoptionDecisionSchema = exports.SocialAdoptionStateSchema = exports.SOCIAL_ADOPTION_STATES = exports.SocialAdoptionKindSchema = exports.SOCIAL_ADOPTION_KINDS = exports.SocialTopicWikiToolErrorSchema = exports.SocialTopicSaveWikiOutputSchema = exports.SocialTopicSaveWikiInputSchema = exports.SOCIAL_WIKI_REVERIFY_DAYS = exports.SOCIAL_TOPIC_WIKI_TOOLS = void 0;
exports.socialWikiReverifyDue = socialWikiReverifyDue;
exports.socialTopicLabIngestInput = socialTopicLabIngestInput;
exports.socialAdoptionDecision = socialAdoptionDecision;
const zod_1 = require("zod");
const capability_call_identity_js_1 = require("../capability-call-identity.cjs");
const tools_js_1 = require("../lab/tools.cjs");
const parameters_js_1 = require("../parameters.cjs");
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
const WikiReverifyInputSchema = zod_1.z.object({ wikiSavedAt: topic_js_1.SocialTopicSchema.shape.wikiSavedAt });
/**
 * Elapsed whole days since wiki acceptance; the caller supplies the current time.
 *
 * Accepts the topic with or without `identity` (the shape of `SocialTopicGetOutput` and of `SocialTopic`) and reads
 * only `wikiSavedAt`; every other field is ignored.
 */
function socialWikiReverifyDue(topic, nowIso) {
    try {
        const parsed = WikiReverifyInputSchema.safeParse(topic);
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
    'invalid_request', 'not_configured', 'unknown_topic', 'nothing_to_save', 'lab_not_enabled', 'research_not_ready',
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
exports.SOCIAL_ADOPTION_KINDS = ['rule', 'mod', 'skill'];
exports.SocialAdoptionKindSchema = zod_1.z.enum(exports.SOCIAL_ADOPTION_KINDS);
exports.SOCIAL_ADOPTION_STATES = ['proposed', 'adopted', 'rejected'];
exports.SocialAdoptionStateSchema = zod_1.z.enum(exports.SOCIAL_ADOPTION_STATES);
exports.SocialAdoptionDecisionSchema = exports.SocialAdoptionStateSchema.exclude(['proposed']);
const ProposalIdSchema = zod_1.z.string().min(1).max(100);
/** Persisted proposal scoped to its originating topic; only a manual decision adds decision metadata. */
exports.SocialAdoptionProposalSchema = zod_1.z.strictObject({
    identity: capability_call_identity_js_1.CapabilityAgentScopeSchema,
    proposalId: ProposalIdSchema,
    topicId: TopicIdSchema,
    kind: exports.SocialAdoptionKindSchema,
    text: zod_1.z.string().trim().min(1).max(2000),
    state: exports.SocialAdoptionStateSchema,
    proposedAt: topic_js_1.SocialTopicSchema.shape.computedAt,
    decidedBy: parameters_js_1.CapabilityParameterEditorRoleSchema.optional(),
    decidedAt: topic_js_1.SocialTopicSchema.shape.computedAt.optional(),
}).superRefine((proposal, ctx) => {
    const decided = proposal.state !== 'proposed';
    if ((proposal.decidedBy !== undefined) !== decided) {
        ctx.addIssue({
            code: 'custom', path: ['decidedBy'],
            message: decided ? 'decided proposal requires an editor role' : 'proposed proposal cannot have an editor role',
        });
    }
    if ((proposal.decidedAt !== undefined) !== decided) {
        ctx.addIssue({
            code: 'custom', path: ['decidedAt'],
            message: decided ? 'decided proposal requires a timestamp' : 'proposed proposal cannot have a decision timestamp',
        });
    }
});
exports.SOCIAL_ADOPTION_TOOLS = {
    propose: 'social_adoption_propose',
    list: 'social_adoption_list',
    decide: 'social_adoption_decide',
};
/** Identity and role come from the verified call context, never from tool input (R-33). */
exports.SocialAdoptionProposeInputSchema = zod_1.z.strictObject({
    topicId: TopicIdSchema,
    kind: exports.SocialAdoptionKindSchema,
    text: exports.SocialAdoptionProposalSchema.shape.text,
});
exports.SocialAdoptionListInputSchema = zod_1.z.strictObject({ state: exports.SocialAdoptionStateSchema.optional() });
exports.SocialAdoptionDecideInputSchema = zod_1.z.strictObject({
    proposalId: ProposalIdSchema,
    decision: exports.SocialAdoptionDecisionSchema,
});
exports.SocialAdoptionProposeOutputSchema = zod_1.z.strictObject({ proposal: exports.SocialAdoptionProposalSchema });
exports.SocialAdoptionListOutputSchema = zod_1.z.strictObject({ proposals: zod_1.z.array(exports.SocialAdoptionProposalSchema).max(100) });
exports.SocialAdoptionDecideOutputSchema = zod_1.z.strictObject({ proposal: exports.SocialAdoptionProposalSchema });
exports.SocialAdoptionToolErrorSchema = zod_1.z.enum([
    'invalid_request', 'unknown_topic', 'unknown_proposal', 'not_allowed', 'already_decided',
]);
/** The service supplies actorRole from verified identity and the decision time; this function reads no clock. */
function socialAdoptionDecision(input) {
    try {
        const { proposal, actorRole, decision, decidedAt } = input;
        const role = parameters_js_1.CapabilityParameterEditorRoleSchema.safeParse(actorRole);
        if (!role.success)
            return { ok: false, error: 'not_allowed' };
        const parsed = exports.SocialAdoptionProposalSchema.safeParse(proposal);
        if (!parsed.success)
            return { ok: false, error: 'invalid_input' };
        if (parsed.data.state !== 'proposed')
            return { ok: false, error: 'already_decided' };
        const action = exports.SocialAdoptionDecisionSchema.safeParse(decision);
        if (!action.success)
            return { ok: false, error: 'invalid_input' };
        const updated = exports.SocialAdoptionProposalSchema.safeParse({
            ...parsed.data, state: action.data, decidedBy: role.data, decidedAt,
        });
        if (!updated.success)
            return { ok: false, error: 'invalid_input' };
        return { ok: true, proposal: updated.data };
    }
    catch {
        return { ok: false, error: 'invalid_input' };
    }
}
//# sourceMappingURL=save-wiki.js.map