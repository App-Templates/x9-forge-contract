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
/** Open question an agent puts to the owner, with the options to choose from. */
export declare const DecisionRequestSchema: z.ZodObject<{
    requestId: z.ZodString;
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    projectId: z.ZodOptional<z.ZodString>;
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
    addressedTo: z.ZodObject<{
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    }, z.core.$strict>;
    channel: z.ZodEnum<{
        email: "email";
        x9_conversation: "x9_conversation";
        forge_panel: "forge_panel";
    }>;
    createdAt: z.ZodISODateTime;
}, z.core.$strict>;
export type DecisionRequest = z.infer<typeof DecisionRequestSchema>;
/** Recorded owner answer to a decision request. */
export declare const DecisionOutcomeSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    outcome: z.ZodLiteral<"approved">;
    optionId: z.ZodString;
    requestId: z.ZodString;
    decidedBy: z.ZodObject<{
        kind: z.ZodLiteral<"owner">;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    }, z.core.$strict>;
    decidedAt: z.ZodISODateTime;
    channel: z.ZodEnum<{
        email: "email";
        x9_conversation: "x9_conversation";
        forge_panel: "forge_panel";
    }>;
    sourceRef: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    outcome: z.ZodLiteral<"rejected">;
    reason: z.ZodString;
    requestId: z.ZodString;
    decidedBy: z.ZodObject<{
        kind: z.ZodLiteral<"owner">;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    }, z.core.$strict>;
    decidedAt: z.ZodISODateTime;
    channel: z.ZodEnum<{
        email: "email";
        x9_conversation: "x9_conversation";
        forge_panel: "forge_panel";
    }>;
    sourceRef: z.ZodString;
}, z.core.$strict>], "outcome">;
export type DecisionOutcome = z.infer<typeof DecisionOutcomeSchema>;
/** Word used in the email subject to tie a reply to its decision request: `[decisione <requestId>]`. */
export declare const DECISION_REQUEST_SUBJECT_LABEL: "decisione";
export declare function decisionRequestSubjectLabel(requestId: DecisionRequestId): string;
/** Owner email reply as read by the inbound reader (approve / refuse with reason / unclear). */
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
/** The single rule that turns an email reply into the recorded outcome of a request. */
export declare function decisionOutcomeFromEmailReply(input: {
    request: DecisionRequest;
    reply: DecisionEmailReply;
    from: {
        ownerId: string;
    };
    receivedAt: string;
    messageId: string;
}): DecisionOutcomeFromEmailReply;
//# sourceMappingURL=decision-request.d.ts.map