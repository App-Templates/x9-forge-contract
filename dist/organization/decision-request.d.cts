import { z } from 'zod';
/** Channels through which an agent asks the owner for a decision. */
export declare const DECISION_REQUEST_CHANNELS: readonly ["email", "x9_conversation", "forge_panel"];
export declare const DecisionRequestChannelSchema: z.ZodEnum<{
    email: "email";
    x9_conversation: "x9_conversation";
    forge_panel: "forge_panel";
}>;
export type DecisionRequestChannel = z.infer<typeof DecisionRequestChannelSchema>;
export declare const DecisionRequestIdSchema: z.ZodString;
export type DecisionRequestId = z.infer<typeof DecisionRequestIdSchema>;
export declare const DecisionRequestOptionSchema: z.ZodObject<{
    optionId: z.ZodString;
    label: z.ZodString;
    detail: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type DecisionRequestOption = z.infer<typeof DecisionRequestOptionSchema>;
/** What a decision is about: an exact plan version or an immutable delivery. */
export declare const DECISION_SUBJECT_KINDS: readonly ["action_plan", "vertical_plan", "confirmation", "delivery"];
export declare const DecisionSubjectKindSchema: z.ZodEnum<{
    delivery: "delivery";
    action_plan: "action_plan";
    vertical_plan: "vertical_plan";
    confirmation: "confirmation";
}>;
export type DecisionSubjectKind = z.infer<typeof DecisionSubjectKindSchema>;
/** The consumer must resolve this saved asset to immutable content, never a moving branch or generic URL. */
export declare const DeliveryDecisionSubjectSchema: z.ZodObject<{
    kind: z.ZodLiteral<"delivery">;
    organizationId: z.ZodString;
    projectId: z.ZodString;
    buSlug: z.ZodString;
    deliveryRef: z.ZodObject<{
        assetId: z.ZodString;
        sha256: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
export type DeliveryDecisionSubject = z.infer<typeof DeliveryDecisionSubjectSchema>;
export declare const DecisionSubjectSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodEnum<{
        action_plan: "action_plan";
        vertical_plan: "vertical_plan";
        confirmation: "confirmation";
    }>;
    planId: z.ZodString;
    planVersion: z.ZodNumber;
    digest: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"delivery">;
    organizationId: z.ZodString;
    projectId: z.ZodString;
    buSlug: z.ZodString;
    deliveryRef: z.ZodObject<{
        assetId: z.ZodString;
        sha256: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>], "kind">;
export type DecisionSubject = z.infer<typeof DecisionSubjectSchema>;
/** Open question an agent puts to the owner or delivery referent, with the options to choose from. */
export declare const DecisionRequestSchema: z.ZodObject<{
    requestId: z.ZodString;
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    projectId: z.ZodOptional<z.ZodString>;
    subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodEnum<{
            action_plan: "action_plan";
            vertical_plan: "vertical_plan";
            confirmation: "confirmation";
        }>;
        planId: z.ZodString;
        planVersion: z.ZodNumber;
        digest: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"delivery">;
        organizationId: z.ZodString;
        projectId: z.ZodString;
        buSlug: z.ZodString;
        deliveryRef: z.ZodObject<{
            assetId: z.ZodString;
            sha256: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>], "kind">>;
    question: z.ZodString;
    options: z.ZodArray<z.ZodObject<{
        optionId: z.ZodString;
        label: z.ZodString;
        detail: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    requestedBy: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>;
    addressedTo: z.ZodUnion<readonly [z.ZodObject<{
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"referent">;
        email: z.ZodEmail;
    }, z.core.$strict>]>;
    channel: z.ZodEnum<{
        email: "email";
        x9_conversation: "x9_conversation";
        forge_panel: "forge_panel";
    }>;
    createdAt: z.ZodISODateTime;
}, z.core.$strict>;
export type DecisionRequest = z.infer<typeof DecisionRequestSchema>;
/** Recorded human answer to a decision request. */
export declare const DecisionOutcomeSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    outcome: z.ZodLiteral<"approved">;
    optionId: z.ZodString;
    requestId: z.ZodString;
    decidedBy: z.ZodUnion<readonly [z.ZodObject<{
        kind: z.ZodLiteral<"owner">;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"referent">;
        email: z.ZodEmail;
    }, z.core.$strict>]>;
    decidedAt: z.ZodISODateTime;
    channel: z.ZodEnum<{
        email: "email";
        x9_conversation: "x9_conversation";
        forge_panel: "forge_panel";
    }>;
    sourceRef: z.ZodString;
    subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodEnum<{
            action_plan: "action_plan";
            vertical_plan: "vertical_plan";
            confirmation: "confirmation";
        }>;
        planId: z.ZodString;
        planVersion: z.ZodNumber;
        digest: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"delivery">;
        organizationId: z.ZodString;
        projectId: z.ZodString;
        buSlug: z.ZodString;
        deliveryRef: z.ZodObject<{
            assetId: z.ZodString;
            sha256: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>], "kind">>;
}, z.core.$strict>, z.ZodObject<{
    outcome: z.ZodLiteral<"rejected">;
    reason: z.ZodString;
    requestId: z.ZodString;
    decidedBy: z.ZodUnion<readonly [z.ZodObject<{
        kind: z.ZodLiteral<"owner">;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"referent">;
        email: z.ZodEmail;
    }, z.core.$strict>]>;
    decidedAt: z.ZodISODateTime;
    channel: z.ZodEnum<{
        email: "email";
        x9_conversation: "x9_conversation";
        forge_panel: "forge_panel";
    }>;
    sourceRef: z.ZodString;
    subject: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodEnum<{
            action_plan: "action_plan";
            vertical_plan: "vertical_plan";
            confirmation: "confirmation";
        }>;
        planId: z.ZodString;
        planVersion: z.ZodNumber;
        digest: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"delivery">;
        organizationId: z.ZodString;
        projectId: z.ZodString;
        buSlug: z.ZodString;
        deliveryRef: z.ZodObject<{
            assetId: z.ZodString;
            sha256: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>], "kind">>;
}, z.core.$strict>], "outcome">;
export type DecisionOutcome = z.infer<typeof DecisionOutcomeSchema>;
/** True when the outcome decides the same exact subject (or neither names one). */
export declare function decisionOutcomeMatchesSubject(request: Pick<DecisionRequest, 'subject'>, outcome: Pick<DecisionOutcome, 'subject'>): boolean;
/** Word used in the email subject to tie a reply to its decision request: `[decisione <requestId>]`. */
export declare const DECISION_REQUEST_SUBJECT_LABEL: "decisione";
export declare function decisionRequestSubjectLabel(requestId: DecisionRequestId): string;
/** Human email reply already interpreted by the lead (approve / refuse with reason / unclear). */
export declare const DecisionEmailReplySchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"approve">;
    requestId: z.ZodString;
    optionId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"refuse">;
    requestId: z.ZodString;
    reason: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"unclear">;
    requestId: z.ZodString;
    why: z.ZodEnum<{
        missing_reason: "missing_reason";
        no_decision: "no_decision";
        both: "both";
    }>;
}, z.core.$strict>], "kind">;
export type DecisionEmailReply = z.infer<typeof DecisionEmailReplySchema>;
export type DecisionEmailReplyRejection = 'mismatch' | 'unclear' | 'option_required' | 'unknown_option' | 'not_addressee' | 'before_request';
export type DecisionOutcomeFromEmailReply = {
    ok: true;
    outcome: DecisionOutcome;
} | {
    ok: false;
    code: DecisionEmailReplyRejection;
};
/** Records an already interpreted reply; the consumer verifies the BU's authorized referent. */
export declare function decisionOutcomeFromEmailReply(input: {
    request: DecisionRequest;
    reply: DecisionEmailReply;
    from: {
        ownerId: string;
    } | {
        email: string;
    };
    receivedAt: string;
    messageId: string;
}): DecisionOutcomeFromEmailReply;
//# sourceMappingURL=decision-request.d.ts.map