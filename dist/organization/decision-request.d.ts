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
/** What choosing an option means; an option that does not approve is recorded as a rejection. */
export declare const DECISION_OPTION_EFFECTS: readonly ["approve", "request_changes", "reject"];
export declare const DecisionOptionEffectSchema: z.ZodEnum<{
    approve: "approve";
    request_changes: "request_changes";
    reject: "reject";
}>;
export type DecisionOptionEffect = z.infer<typeof DecisionOptionEffectSchema>;
export declare const DecisionRequestOptionSchema: z.ZodObject<{
    optionId: z.ZodString;
    label: z.ZodString;
    detail: z.ZodOptional<z.ZodString>;
    effect: z.ZodOptional<z.ZodEnum<{
        approve: "approve";
        request_changes: "request_changes";
        reject: "reject";
    }>>;
}, z.core.$strict>;
export type DecisionRequestOption = z.infer<typeof DecisionRequestOptionSchema>;
/** What a decision is about: an exact plan version, confirmation set or immutable delivery. */
export declare const DECISION_SUBJECT_KINDS: readonly ["action_plan", "vertical_plan", "confirmation", "delivery", "confirmation_set"];
export declare const DecisionSubjectKindSchema: z.ZodEnum<{
    delivery: "delivery";
    action_plan: "action_plan";
    vertical_plan: "vertical_plan";
    confirmation: "confirmation";
    confirmation_set: "confirmation_set";
}>;
export type DecisionSubjectKind = z.infer<typeof DecisionSubjectKindSchema>;
declare const ConfirmationSetEntrySchema: z.ZodLazy<z.ZodObject<{
    level: z.ZodEnum<{
        client: "client";
        project: "project";
        business_unit: "business_unit";
    }>;
    projectId: z.ZodOptional<z.ZodString>;
    buSlug: z.ZodOptional<z.ZodString>;
    kind: z.ZodEnum<{
        access: "access";
        referent: "referent";
        person: "person";
        responsibility: "responsibility";
        asset: "asset";
    }>;
    entryRef: z.ZodString;
    entryVersion: z.ZodNumber;
    entryDigest: z.ZodString;
}, z.core.$strict>>;
type ConfirmationSetEntry = z.infer<typeof ConfirmationSetEntrySchema>;
/** Hash fixed-order entry tuples sorted by their complete scope and identity key. */
export declare function confirmationSetDigest(entries: readonly ConfirmationSetEntry[]): string;
/** An immutable set keeps the plan columns used by existing decision stores. */
export declare const ConfirmationSetDecisionSubjectSchema: z.ZodObject<{
    kind: z.ZodLiteral<"confirmation_set">;
    planId: z.ZodString;
    planVersion: z.ZodLiteral<1>;
    digest: z.ZodString;
    clientId: z.ZodString;
    entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
        level: z.ZodEnum<{
            client: "client";
            project: "project";
            business_unit: "business_unit";
        }>;
        projectId: z.ZodOptional<z.ZodString>;
        buSlug: z.ZodOptional<z.ZodString>;
        kind: z.ZodEnum<{
            access: "access";
            referent: "referent";
            person: "person";
            responsibility: "responsibility";
            asset: "asset";
        }>;
        entryRef: z.ZodString;
        entryVersion: z.ZodNumber;
        entryDigest: z.ZodString;
    }, z.core.$strict>>>;
}, z.core.$strict>;
export type ConfirmationSetDecisionSubject = z.infer<typeof ConfirmationSetDecisionSubjectSchema>;
/** A replacement proposed in the owner's confirmation reply, with the plan proposal fields. */
export declare const CompanyMapReferentChangeSchema: z.ZodLazy<z.ZodObject<{
    level: z.ZodEnum<{
        client: "client";
        project: "project";
        business_unit: "business_unit";
    }>;
    buSlug: z.ZodOptional<z.ZodString>;
    replaces: z.ZodOptional<z.ZodString>;
    email: z.ZodEmail;
    personRef: z.ZodString;
    role: z.ZodString;
    name: z.ZodString;
}, z.core.$strict>>;
export type CompanyMapReferentChange = z.infer<typeof CompanyMapReferentChangeSchema>;
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
    assetVersion: z.ZodOptional<z.ZodObject<{
        key: z.ZodString;
        version: z.ZodNumber;
    }, z.core.$strict>>;
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
    assetVersion: z.ZodOptional<z.ZodObject<{
        key: z.ZodString;
        version: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"confirmation_set">;
    planId: z.ZodString;
    planVersion: z.ZodLiteral<1>;
    digest: z.ZodString;
    clientId: z.ZodString;
    entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
        level: z.ZodEnum<{
            client: "client";
            project: "project";
            business_unit: "business_unit";
        }>;
        projectId: z.ZodOptional<z.ZodString>;
        buSlug: z.ZodOptional<z.ZodString>;
        kind: z.ZodEnum<{
            access: "access";
            referent: "referent";
            person: "person";
            responsibility: "responsibility";
            asset: "asset";
        }>;
        entryRef: z.ZodString;
        entryVersion: z.ZodNumber;
        entryDigest: z.ZodString;
    }, z.core.$strict>>>;
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
        assetVersion: z.ZodOptional<z.ZodObject<{
            key: z.ZodString;
            version: z.ZodNumber;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"confirmation_set">;
        planId: z.ZodString;
        planVersion: z.ZodLiteral<1>;
        digest: z.ZodString;
        clientId: z.ZodString;
        entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
            level: z.ZodEnum<{
                client: "client";
                project: "project";
                business_unit: "business_unit";
            }>;
            projectId: z.ZodOptional<z.ZodString>;
            buSlug: z.ZodOptional<z.ZodString>;
            kind: z.ZodEnum<{
                access: "access";
                referent: "referent";
                person: "person";
                responsibility: "responsibility";
                asset: "asset";
            }>;
            entryRef: z.ZodString;
            entryVersion: z.ZodNumber;
            entryDigest: z.ZodString;
        }, z.core.$strict>>>;
    }, z.core.$strict>], "kind">>;
    question: z.ZodString;
    options: z.ZodArray<z.ZodObject<{
        optionId: z.ZodString;
        label: z.ZodString;
        detail: z.ZodOptional<z.ZodString>;
        effect: z.ZodOptional<z.ZodEnum<{
            approve: "approve";
            request_changes: "request_changes";
            reject: "reject";
        }>>;
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
    referentChanges: z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodObject<{
        level: z.ZodEnum<{
            client: "client";
            project: "project";
            business_unit: "business_unit";
        }>;
        buSlug: z.ZodOptional<z.ZodString>;
        replaces: z.ZodOptional<z.ZodString>;
        email: z.ZodEmail;
        personRef: z.ZodString;
        role: z.ZodString;
        name: z.ZodString;
    }, z.core.$strict>>>>;
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
        assetVersion: z.ZodOptional<z.ZodObject<{
            key: z.ZodString;
            version: z.ZodNumber;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"confirmation_set">;
        planId: z.ZodString;
        planVersion: z.ZodLiteral<1>;
        digest: z.ZodString;
        clientId: z.ZodString;
        entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
            level: z.ZodEnum<{
                client: "client";
                project: "project";
                business_unit: "business_unit";
            }>;
            projectId: z.ZodOptional<z.ZodString>;
            buSlug: z.ZodOptional<z.ZodString>;
            kind: z.ZodEnum<{
                access: "access";
                referent: "referent";
                person: "person";
                responsibility: "responsibility";
                asset: "asset";
            }>;
            entryRef: z.ZodString;
            entryVersion: z.ZodNumber;
            entryDigest: z.ZodString;
        }, z.core.$strict>>>;
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
        assetVersion: z.ZodOptional<z.ZodObject<{
            key: z.ZodString;
            version: z.ZodNumber;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"confirmation_set">;
        planId: z.ZodString;
        planVersion: z.ZodLiteral<1>;
        digest: z.ZodString;
        clientId: z.ZodString;
        entries: z.ZodArray<z.ZodLazy<z.ZodObject<{
            level: z.ZodEnum<{
                client: "client";
                project: "project";
                business_unit: "business_unit";
            }>;
            projectId: z.ZodOptional<z.ZodString>;
            buSlug: z.ZodOptional<z.ZodString>;
            kind: z.ZodEnum<{
                access: "access";
                referent: "referent";
                person: "person";
                responsibility: "responsibility";
                asset: "asset";
            }>;
            entryRef: z.ZodString;
            entryVersion: z.ZodNumber;
            entryDigest: z.ZodString;
        }, z.core.$strict>>>;
    }, z.core.$strict>], "kind">>;
}, z.core.$strict>], "outcome">;
export type DecisionOutcome = z.infer<typeof DecisionOutcomeSchema>;
/** True when the outcome decides the same exact subject (or neither names one). */
export declare function decisionOutcomeMatchesSubject(request: Pick<DecisionRequest, 'subject'>, outcome: Pick<DecisionOutcome, 'subject'>): boolean;
/** Word used in the email subject to tie a reply to its decision request: `[decisione <requestId>]`. */
export declare const DECISION_REQUEST_SUBJECT_LABEL: "decisione";
export declare function decisionRequestSubjectLabel(requestId: DecisionRequestId): string;
/** Header of the outgoing email that carries the `requestId`; the referent's reply is matched to the original message that carries it. */
export declare const DECISION_REQUEST_HEADER: "X-X9-Decision-Request";
/** True when the headers (name matched case-insensitively) carry exactly this `requestId` (value trimmed). */
export declare function decisionRequestHeaderMatches(headers: Readonly<Record<string, string>> | undefined, requestId: DecisionRequestId): boolean;
/** Human email reply already interpreted by the lead (approve / refuse with reason / unclear). */
export declare const DecisionEmailReplySchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"approve">;
    requestId: z.ZodString;
    optionId: z.ZodOptional<z.ZodString>;
    referentChanges: z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodObject<{
        level: z.ZodEnum<{
            client: "client";
            project: "project";
            business_unit: "business_unit";
        }>;
        buSlug: z.ZodOptional<z.ZodString>;
        replaces: z.ZodOptional<z.ZodString>;
        email: z.ZodEmail;
        personRef: z.ZodString;
        role: z.ZodString;
        name: z.ZodString;
    }, z.core.$strict>>>>;
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
/** Why a new delivery decision request is refused: the same piece already has one open or approved. */
export declare const DELIVERY_DECISION_DUPLICATE_CODES: readonly ["decision_already_pending", "decision_already_approved"];
export type DeliveryDecisionDuplicateCode = (typeof DELIVERY_DECISION_DUPLICATE_CODES)[number];
/**
 * Names the oldest existing request that makes `candidate` a duplicate, or null. A rejected request
 * does not block a new one; plans and confirmation sets never pass through here.
 * Missing, unrelated or unsound outcomes stay pending, matching the twin rule in `assetVersionDecisionState`.
 */
export declare function deliveryDecisionDuplicate(candidate: DecisionRequest, existing: readonly {
    request: DecisionRequest;
    outcome: DecisionOutcome | null;
}[]): {
    code: DeliveryDecisionDuplicateCode;
    requestId: DecisionRequestId;
} | null;
/** The referent's reply as handed to the unit: carries the text and a message the service can re-read from `receivedBy`. */
export declare const ReferentReplyHandoverSchema: z.ZodObject<{
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    projectId: z.ZodString;
    toBuSlug: z.ZodString;
    receivedBy: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>;
    referent: z.ZodObject<{
        kind: z.ZodLiteral<"referent">;
        email: z.ZodEmail;
    }, z.core.$strict>;
    messageId: z.ZodString;
    receivedAt: z.ZodISODateTime;
    text: z.ZodString;
    requestId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type ReferentReplyHandover = z.infer<typeof ReferentReplyHandoverSchema>;
/** Records an interpreted reply from a handover; scope and request must match, the rest is `decisionOutcomeFromEmailReply`. */
export declare function decisionOutcomeFromHandover(input: {
    request: DecisionRequest;
    reply: DecisionEmailReply;
    handover: ReferentReplyHandover;
}): DecisionOutcomeFromEmailReply;
export {};
//# sourceMappingURL=decision-request.d.ts.map