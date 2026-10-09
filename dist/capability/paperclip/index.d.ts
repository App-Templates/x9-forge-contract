/** Public cap-paperclip contracts. Native Paperclip payloads remain at the adapter boundary. */
import { z } from 'zod';
export declare const PaperclipMaterialEventTypeSchema: z.ZodEnum<{
    moodboard_ready: "moodboard_ready";
    board_ready: "board_ready";
    plan_verified: "plan_verified";
    decision_needed: "decision_needed";
    release_delivered: "release_delivered";
}>;
export declare const PaperclipMaterialEventSchema: z.ZodObject<{
    eventId: z.ZodString;
    unitId: z.ZodString;
    incrementId: z.ZodString;
    eventType: z.ZodEnum<{
        moodboard_ready: "moodboard_ready";
        board_ready: "board_ready";
        plan_verified: "plan_verified";
        decision_needed: "decision_needed";
        release_delivered: "release_delivered";
    }>;
    materialVersion: z.ZodString;
    summary: z.ZodString;
    materialLinks: z.ZodArray<z.ZodString>;
    occurredAt: z.ZodISODateTime;
    decisionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    test: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>;
/** Configuration is operator-owned. Parsing it does not authenticate a caller or verify a human. */
export declare const PaperclipRoutingConfigSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    revision: z.ZodString;
    units: z.ZodRecord<z.ZodString, z.ZodObject<{
        events: z.ZodRecord<z.ZodEnum<{
            moodboard_ready: "moodboard_ready";
            board_ready: "board_ready";
            plan_verified: "plan_verified";
            decision_needed: "decision_needed";
            release_delivered: "release_delivered";
        }> & z.core.$partial, z.ZodString>;
        roles: z.ZodRecord<z.ZodString, z.ZodObject<{
            agentRef: z.ZodString;
            referentRef: z.ZodString;
            channel: z.ZodString;
        }, z.core.$strict>>;
        referents: z.ZodRecord<z.ZodString, z.ZodObject<{
            verified: z.ZodBoolean;
            channels: z.ZodRecord<z.ZodString, z.ZodObject<{
                address: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const PaperclipResolvedRouteSchema: z.ZodObject<{
    routingRevision: z.ZodString;
    roleRef: z.ZodString;
    agentRef: z.ZodString;
    referentRef: z.ZodString;
    channel: z.ZodString;
    address: z.ZodString;
}, z.core.$strict>;
export declare const PaperclipHandoffSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    handoffId: z.ZodUUID;
    event: z.ZodObject<{
        eventId: z.ZodString;
        unitId: z.ZodString;
        incrementId: z.ZodString;
        eventType: z.ZodEnum<{
            moodboard_ready: "moodboard_ready";
            board_ready: "board_ready";
            plan_verified: "plan_verified";
            decision_needed: "decision_needed";
            release_delivered: "release_delivered";
        }>;
        materialVersion: z.ZodString;
        summary: z.ZodString;
        materialLinks: z.ZodArray<z.ZodString>;
        occurredAt: z.ZodISODateTime;
        decisionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        test: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strict>;
    route: z.ZodObject<{
        routingRevision: z.ZodString;
        roleRef: z.ZodString;
        agentRef: z.ZodString;
        referentRef: z.ZodString;
        channel: z.ZodString;
        address: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
/** Accepted means durable spokesperson intake, never an assertion that an email was sent. */
export declare const PaperclipHandoffReceiptSchema: z.ZodObject<{
    handoffId: z.ZodUUID;
    agentRef: z.ZodString;
    status: z.ZodLiteral<"accepted">;
    receiptId: z.ZodString;
}, z.core.$strict>;
/** This audit record is an explicit human attestation and does not mutate Paperclip. */
export declare const PaperclipDecisionRecordSchema: z.ZodObject<{
    communicationId: z.ZodString;
    materialVersion: z.ZodString;
    referentId: z.ZodString;
    outcome: z.ZodEnum<{
        approved: "approved";
        changes_requested: "changes_requested";
    }>;
    changes: z.ZodString;
    operatorId: z.ZodString;
    humanEvidence: z.ZodString;
    authorization: z.ZodLiteral<"manual_attestation">;
    paperclipUpdated: z.ZodLiteral<false>;
    recordedAt: z.ZodISODateTime;
}, z.core.$strict>;
export type PaperclipMaterialEventType = z.infer<typeof PaperclipMaterialEventTypeSchema>;
export type PaperclipMaterialEvent = z.infer<typeof PaperclipMaterialEventSchema>;
export type PaperclipRoutingConfig = z.infer<typeof PaperclipRoutingConfigSchema>;
export type PaperclipResolvedRoute = z.infer<typeof PaperclipResolvedRouteSchema>;
export type PaperclipHandoff = z.infer<typeof PaperclipHandoffSchema>;
export type PaperclipHandoffReceipt = z.infer<typeof PaperclipHandoffReceiptSchema>;
export type PaperclipDecisionRecord = z.infer<typeof PaperclipDecisionRecordSchema>;
export * from "./tools.js";
export declare const PaperclipCommunicationRecordSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    communicationId: z.ZodString;
    eventId: z.ZodString;
    unitId: z.ZodString;
    incrementId: z.ZodString;
    eventType: z.ZodString;
    materialVersion: z.ZodString;
    decisionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    recipientRef: z.ZodString;
    recipientAddress: z.ZodString;
    status: z.ZodEnum<{
        unknown: "unknown";
        failed: "failed";
        pending: "pending";
        sending: "sending";
        sent: "sent";
    }>;
    providerMessageId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    providerThreadId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    rfcMessageId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodISODateTime;
    attemptedAt: z.ZodOptional<z.ZodNullable<z.ZodISODateTime>>;
    sentAt: z.ZodOptional<z.ZodNullable<z.ZodISODateTime>>;
    attempts: z.ZodOptional<z.ZodNumber>;
    errorCode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strict>;
/** Mailbox interpretation is performed by the reply adapter; display names remain data. */
export declare const PaperclipReplyRecordSchema: z.ZodObject<{
    replyId: z.ZodString;
    source: z.ZodEnum<{
        email: "email";
        voice: "voice";
    }>;
    sourceEvidence: z.ZodString;
    receivedAt: z.ZodISODateTime;
    text: z.ZodString;
    from: z.ZodOptional<z.ZodString>;
    inReplyTo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    providerThreadId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strict>;
export declare const PaperclipManualConfirmationSchema: z.ZodObject<{
    communicationId: z.ZodString;
    materialVersion: z.ZodString;
    referentId: z.ZodString;
    outcome: z.ZodEnum<{
        approved: "approved";
        changes_requested: "changes_requested";
    }>;
    operatorId: z.ZodString;
    humanEvidence: z.ZodString;
    changes: z.ZodDefault<z.ZodString>;
    expectedDecisionReply: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strict>;
export declare const PaperclipDecisionViewSchema: z.ZodObject<{
    replyId: z.ZodString;
    source: z.ZodEnum<{
        email: "email";
        voice: "voice";
    }>;
    sourceEvidence: z.ZodString;
    receivedAt: z.ZodISODateTime;
    recordedDecision: z.ZodNullable<z.ZodObject<{
        communicationId: z.ZodString;
        materialVersion: z.ZodString;
        referentId: z.ZodString;
        outcome: z.ZodEnum<{
            approved: "approved";
            changes_requested: "changes_requested";
        }>;
        changes: z.ZodString;
        operatorId: z.ZodString;
        humanEvidence: z.ZodString;
        authorization: z.ZodLiteral<"manual_attestation">;
        paperclipUpdated: z.ZodLiteral<false>;
        recordedAt: z.ZodISODateTime;
    }, z.core.$strict>>;
    communicationId: z.ZodNullable<z.ZodString>;
    status: z.ZodEnum<{
        approved: "approved";
        changes_requested: "changes_requested";
        ambiguous: "ambiguous";
        empty_reply: "empty_reply";
        obsolete: "obsolete";
        pending_manual_confirmation: "pending_manual_confirmation";
        predates_request: "predates_request";
        referent_changed: "referent_changed";
        superseded_confirmation: "superseded_confirmation";
        unmatched: "unmatched";
        wrong_sender: "wrong_sender";
    }>;
    materialVersion: z.ZodNullable<z.ZodString>;
    decision: z.ZodNullable<z.ZodObject<{
        communicationId: z.ZodString;
        materialVersion: z.ZodString;
        referentId: z.ZodString;
        outcome: z.ZodEnum<{
            approved: "approved";
            changes_requested: "changes_requested";
        }>;
        changes: z.ZodString;
        operatorId: z.ZodString;
        humanEvidence: z.ZodString;
        authorization: z.ZodLiteral<"manual_attestation">;
        paperclipUpdated: z.ZodLiteral<false>;
        recordedAt: z.ZodISODateTime;
    }, z.core.$strict>>;
    paperclipUpdated: z.ZodLiteral<false>;
    textSha256: z.ZodString;
    unitId: z.ZodOptional<z.ZodString>;
    incrementId: z.ZodOptional<z.ZodString>;
    eventType: z.ZodOptional<z.ZodString>;
    decisionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    recipientRef: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type PaperclipCommunicationRecord = z.infer<typeof PaperclipCommunicationRecordSchema>;
export type PaperclipReplyRecord = z.infer<typeof PaperclipReplyRecordSchema>;
export type PaperclipManualConfirmation = z.infer<typeof PaperclipManualConfirmationSchema>;
export type PaperclipDecisionView = z.infer<typeof PaperclipDecisionViewSchema>;
export * from "./agent-config.js";
export * from "./execution-context.js";
export * from "./native-admission.js";
//# sourceMappingURL=index.d.ts.map