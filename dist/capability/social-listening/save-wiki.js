import { z } from 'zod';
import { CapabilityAgentScopeSchema } from "../capability-call-identity.js";
import { LabIngestIdSchema, LabIngestInputSchema } from "../lab/tools.js";
import { CapabilityParameterEditorRoleSchema } from "../parameters.js";
import { CapabilityAgentIdSchema } from "../ricerca/agent-config.js";
import { SocialTopicSchema } from "./topic.js";
import { socialVideoExternalRef } from "./video-brief.js";
/**
 * "Salva nella wiki": from a topic to the request of `lab_ingest`, only with the explicit yes of the owner (D15).
 *
 * The service accepts this tool only from a call of the owner (Forge page or a message of the owner), never from an
 * automatic round. Identity never comes from the input (R-33); the service calls cap-lab with the same envelope.
 */
export const SOCIAL_TOPIC_WIKI_TOOLS = { save: 'social_topic_save_wiki' };
export const SOCIAL_WIKI_REVERIFY_DAYS = 90;
const WikiReverifyInputSchema = z.object({ wikiSavedAt: SocialTopicSchema.shape.wikiSavedAt });
/**
 * Elapsed whole days since wiki acceptance; the caller supplies the current time.
 *
 * Accepts the topic with or without `identity` (the shape of `SocialTopicGetOutput` and of `SocialTopic`) and reads
 * only `wikiSavedAt`; every other field is ignored.
 */
export function socialWikiReverifyDue(topic, nowIso) {
    try {
        const parsed = WikiReverifyInputSchema.safeParse(topic);
        const now = SocialTopicSchema.shape.computedAt.safeParse(nowIso);
        if (!parsed.success || !now.success)
            return { state: 'invalid_input' };
        if (parsed.data.wikiSavedAt === undefined)
            return { state: 'not_saved' };
        const age = Date.parse(now.data) - Date.parse(parsed.data.wikiSavedAt);
        if (!Number.isFinite(age) || age < 0)
            return { state: 'invalid_input' };
        const daysOld = Math.floor(age / 86_400_000);
        return { state: daysOld >= SOCIAL_WIKI_REVERIFY_DAYS ? 'due' : 'fresh', daysOld };
    }
    catch {
        return { state: 'invalid_input' };
    }
}
const TopicIdSchema = SocialTopicSchema.shape.topicId;
export const SocialTopicSaveWikiInputSchema = z.strictObject({
    topicId: TopicIdSchema,
    ownerConfirmed: z.literal(true),
});
export const SocialTopicSaveWikiOutputSchema = z.strictObject({
    topicId: TopicIdSchema,
    ingestId: LabIngestIdSchema,
    state: z.literal('queued'),
});
export const SocialTopicWikiToolErrorSchema = z.enum([
    'invalid_request', 'not_configured', 'unknown_topic', 'nothing_to_save', 'lab_not_enabled',
]);
/**
 * The request of `lab_ingest`, validated with cap-lab's own schema. With an extended research the research itself is
 * passed (richer); otherwise the verified facts become a synthetic result with id `social:<topicId>`.
 */
export function socialTopicLabIngestInput(topic, agentId) {
    if (topic.extendedResearchId !== undefined) {
        return { ok: true, input: LabIngestInputSchema.parse({ researchId: topic.extendedResearchId }) };
    }
    if (topic.facts.length === 0)
        return { ok: false, error: 'nothing_to_save' };
    return {
        ok: true,
        input: LabIngestInputSchema.parse({
            result: {
                researchId: socialVideoExternalRef(topic.topicId),
                agentId: CapabilityAgentIdSchema.parse(agentId),
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
export const SOCIAL_ADOPTION_KINDS = ['rule', 'mod', 'skill'];
export const SocialAdoptionKindSchema = z.enum(SOCIAL_ADOPTION_KINDS);
export const SOCIAL_ADOPTION_STATES = ['proposed', 'adopted', 'rejected'];
export const SocialAdoptionStateSchema = z.enum(SOCIAL_ADOPTION_STATES);
export const SocialAdoptionDecisionSchema = SocialAdoptionStateSchema.exclude(['proposed']);
const ProposalIdSchema = z.string().min(1).max(100);
/** Persisted proposal scoped to its originating topic; only a manual decision adds decision metadata. */
export const SocialAdoptionProposalSchema = z.strictObject({
    identity: CapabilityAgentScopeSchema,
    proposalId: ProposalIdSchema,
    topicId: TopicIdSchema,
    kind: SocialAdoptionKindSchema,
    text: z.string().trim().min(1).max(2000),
    state: SocialAdoptionStateSchema,
    proposedAt: SocialTopicSchema.shape.computedAt,
    decidedBy: CapabilityParameterEditorRoleSchema.optional(),
    decidedAt: SocialTopicSchema.shape.computedAt.optional(),
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
export const SOCIAL_ADOPTION_TOOLS = {
    propose: 'social_adoption_propose',
    list: 'social_adoption_list',
    decide: 'social_adoption_decide',
};
/** Identity and role come from the verified call context, never from tool input (R-33). */
export const SocialAdoptionProposeInputSchema = z.strictObject({
    topicId: TopicIdSchema,
    kind: SocialAdoptionKindSchema,
    text: SocialAdoptionProposalSchema.shape.text,
});
export const SocialAdoptionListInputSchema = z.strictObject({ state: SocialAdoptionStateSchema.optional() });
export const SocialAdoptionDecideInputSchema = z.strictObject({
    proposalId: ProposalIdSchema,
    decision: SocialAdoptionDecisionSchema,
});
export const SocialAdoptionProposeOutputSchema = z.strictObject({ proposal: SocialAdoptionProposalSchema });
export const SocialAdoptionListOutputSchema = z.strictObject({ proposals: z.array(SocialAdoptionProposalSchema).max(100) });
export const SocialAdoptionDecideOutputSchema = z.strictObject({ proposal: SocialAdoptionProposalSchema });
export const SocialAdoptionToolErrorSchema = z.enum([
    'invalid_request', 'unknown_topic', 'unknown_proposal', 'not_allowed', 'already_decided',
]);
/** The service supplies actorRole from verified identity and the decision time; this function reads no clock. */
export function socialAdoptionDecision(input) {
    try {
        const { proposal, actorRole, decision, decidedAt } = input;
        const role = CapabilityParameterEditorRoleSchema.safeParse(actorRole);
        if (!role.success)
            return { ok: false, error: 'not_allowed' };
        const parsed = SocialAdoptionProposalSchema.safeParse(proposal);
        if (!parsed.success)
            return { ok: false, error: 'invalid_input' };
        if (parsed.data.state !== 'proposed')
            return { ok: false, error: 'already_decided' };
        const action = SocialAdoptionDecisionSchema.safeParse(decision);
        if (!action.success)
            return { ok: false, error: 'invalid_input' };
        const updated = SocialAdoptionProposalSchema.safeParse({
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