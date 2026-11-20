import { z } from 'zod';
import { type LabIngestInput } from "../lab/tools.js";
import type { SocialTopicGetOutput } from "./tools.js";
/**
 * "Salva nella wiki": from a topic to the request of `lab_ingest`, only with the explicit yes of the owner (D15).
 *
 * The service accepts this tool only from a call of the owner (Forge page or a message of the owner), never from an
 * automatic round. Identity never comes from the input (R-33); the service calls cap-lab with the same envelope.
 */
export declare const SOCIAL_TOPIC_WIKI_TOOLS: {
    readonly save: "social_topic_save_wiki";
};
export declare const SOCIAL_WIKI_REVERIFY_DAYS = 90;
/**
 * Elapsed whole days since wiki acceptance; the caller supplies the current time.
 *
 * Accepts the topic with or without `identity` (the shape of `SocialTopicGetOutput` and of `SocialTopic`) and reads
 * only `wikiSavedAt`; every other field is ignored.
 */
export declare function socialWikiReverifyDue(topic: unknown, nowIso: string): {
    state: 'not_saved';
} | {
    state: 'fresh';
    daysOld: number;
} | {
    state: 'due';
    daysOld: number;
} | {
    state: 'invalid_input';
};
export declare const SocialTopicSaveWikiInputSchema: z.ZodObject<{
    topicId: z.ZodString;
    ownerConfirmed: z.ZodLiteral<true>;
}, z.core.$strict>;
export type SocialTopicSaveWikiInput = z.infer<typeof SocialTopicSaveWikiInputSchema>;
export declare const SocialTopicSaveWikiOutputSchema: z.ZodObject<{
    topicId: z.ZodString;
    ingestId: z.ZodUUID;
    state: z.ZodLiteral<"queued">;
}, z.core.$strict>;
export type SocialTopicSaveWikiOutput = z.infer<typeof SocialTopicSaveWikiOutputSchema>;
export declare const SocialTopicWikiToolErrorSchema: z.ZodEnum<{
    invalid_request: "invalid_request";
    not_configured: "not_configured";
    unknown_topic: "unknown_topic";
    nothing_to_save: "nothing_to_save";
    lab_not_enabled: "lab_not_enabled";
}>;
export type SocialTopicWikiToolError = z.infer<typeof SocialTopicWikiToolErrorSchema>;
export type SocialTopicLabIngestResult = {
    ok: true;
    input: LabIngestInput;
} | {
    ok: false;
    error: 'nothing_to_save';
};
/**
 * The request of `lab_ingest`, validated with cap-lab's own schema. With an extended research the research itself is
 * passed (richer); otherwise the verified facts become a synthetic result with id `social:<topicId>`.
 */
export declare function socialTopicLabIngestInput(topic: SocialTopicGetOutput, agentId: string): SocialTopicLabIngestResult;
export declare const SOCIAL_ADOPTION_KINDS: readonly ["rule", "mod", "skill"];
export declare const SocialAdoptionKindSchema: z.ZodEnum<{
    skill: "skill";
    rule: "rule";
    mod: "mod";
}>;
export type SocialAdoptionKind = z.infer<typeof SocialAdoptionKindSchema>;
export declare const SOCIAL_ADOPTION_STATES: readonly ["proposed", "adopted", "rejected"];
export declare const SocialAdoptionStateSchema: z.ZodEnum<{
    proposed: "proposed";
    rejected: "rejected";
    adopted: "adopted";
}>;
export type SocialAdoptionState = z.infer<typeof SocialAdoptionStateSchema>;
export declare const SocialAdoptionDecisionSchema: z.ZodEnum<{
    rejected: "rejected";
    adopted: "adopted";
}>;
export type SocialAdoptionDecision = z.infer<typeof SocialAdoptionDecisionSchema>;
/** Persisted proposal scoped to its originating topic; only a manual decision adds decision metadata. */
export declare const SocialAdoptionProposalSchema: z.ZodObject<{
    identity: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    proposalId: z.ZodString;
    topicId: z.ZodString;
    kind: z.ZodEnum<{
        skill: "skill";
        rule: "rule";
        mod: "mod";
    }>;
    text: z.ZodString;
    state: z.ZodEnum<{
        proposed: "proposed";
        rejected: "rejected";
        adopted: "adopted";
    }>;
    proposedAt: z.ZodISODateTime;
    decidedBy: z.ZodOptional<z.ZodEnum<{
        superadmin: "superadmin";
        owner: "owner";
    }>>;
    decidedAt: z.ZodOptional<z.ZodISODateTime>;
}, z.core.$strict>;
export type SocialAdoptionProposal = z.infer<typeof SocialAdoptionProposalSchema>;
export declare const SOCIAL_ADOPTION_TOOLS: {
    readonly propose: "social_adoption_propose";
    readonly list: "social_adoption_list";
    readonly decide: "social_adoption_decide";
};
/** Identity and role come from the verified call context, never from tool input (R-33). */
export declare const SocialAdoptionProposeInputSchema: z.ZodObject<{
    topicId: z.ZodString;
    kind: z.ZodEnum<{
        skill: "skill";
        rule: "rule";
        mod: "mod";
    }>;
    text: z.ZodString;
}, z.core.$strict>;
export type SocialAdoptionProposeInput = z.infer<typeof SocialAdoptionProposeInputSchema>;
export declare const SocialAdoptionListInputSchema: z.ZodObject<{
    state: z.ZodOptional<z.ZodEnum<{
        proposed: "proposed";
        rejected: "rejected";
        adopted: "adopted";
    }>>;
}, z.core.$strict>;
export type SocialAdoptionListInput = z.infer<typeof SocialAdoptionListInputSchema>;
export declare const SocialAdoptionDecideInputSchema: z.ZodObject<{
    proposalId: z.ZodString;
    decision: z.ZodEnum<{
        rejected: "rejected";
        adopted: "adopted";
    }>;
}, z.core.$strict>;
export type SocialAdoptionDecideInput = z.infer<typeof SocialAdoptionDecideInputSchema>;
export declare const SocialAdoptionProposeOutputSchema: z.ZodObject<{
    proposal: z.ZodObject<{
        identity: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        proposalId: z.ZodString;
        topicId: z.ZodString;
        kind: z.ZodEnum<{
            skill: "skill";
            rule: "rule";
            mod: "mod";
        }>;
        text: z.ZodString;
        state: z.ZodEnum<{
            proposed: "proposed";
            rejected: "rejected";
            adopted: "adopted";
        }>;
        proposedAt: z.ZodISODateTime;
        decidedBy: z.ZodOptional<z.ZodEnum<{
            superadmin: "superadmin";
            owner: "owner";
        }>>;
        decidedAt: z.ZodOptional<z.ZodISODateTime>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type SocialAdoptionProposeOutput = z.infer<typeof SocialAdoptionProposeOutputSchema>;
export declare const SocialAdoptionListOutputSchema: z.ZodObject<{
    proposals: z.ZodArray<z.ZodObject<{
        identity: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        proposalId: z.ZodString;
        topicId: z.ZodString;
        kind: z.ZodEnum<{
            skill: "skill";
            rule: "rule";
            mod: "mod";
        }>;
        text: z.ZodString;
        state: z.ZodEnum<{
            proposed: "proposed";
            rejected: "rejected";
            adopted: "adopted";
        }>;
        proposedAt: z.ZodISODateTime;
        decidedBy: z.ZodOptional<z.ZodEnum<{
            superadmin: "superadmin";
            owner: "owner";
        }>>;
        decidedAt: z.ZodOptional<z.ZodISODateTime>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type SocialAdoptionListOutput = z.infer<typeof SocialAdoptionListOutputSchema>;
export declare const SocialAdoptionDecideOutputSchema: z.ZodObject<{
    proposal: z.ZodObject<{
        identity: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        proposalId: z.ZodString;
        topicId: z.ZodString;
        kind: z.ZodEnum<{
            skill: "skill";
            rule: "rule";
            mod: "mod";
        }>;
        text: z.ZodString;
        state: z.ZodEnum<{
            proposed: "proposed";
            rejected: "rejected";
            adopted: "adopted";
        }>;
        proposedAt: z.ZodISODateTime;
        decidedBy: z.ZodOptional<z.ZodEnum<{
            superadmin: "superadmin";
            owner: "owner";
        }>>;
        decidedAt: z.ZodOptional<z.ZodISODateTime>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type SocialAdoptionDecideOutput = z.infer<typeof SocialAdoptionDecideOutputSchema>;
export declare const SocialAdoptionToolErrorSchema: z.ZodEnum<{
    invalid_request: "invalid_request";
    unknown_topic: "unknown_topic";
    unknown_proposal: "unknown_proposal";
    not_allowed: "not_allowed";
    already_decided: "already_decided";
}>;
export type SocialAdoptionToolError = z.infer<typeof SocialAdoptionToolErrorSchema>;
/** The service supplies actorRole from verified identity and the decision time; this function reads no clock. */
export declare function socialAdoptionDecision(input: {
    proposal: unknown;
    actorRole: unknown;
    decision: unknown;
    decidedAt: unknown;
}): {
    ok: true;
    proposal: SocialAdoptionProposal;
} | {
    ok: false;
    error: 'not_allowed' | 'already_decided' | 'invalid_input';
};
//# sourceMappingURL=save-wiki.d.ts.map