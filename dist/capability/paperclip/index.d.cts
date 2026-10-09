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
//# sourceMappingURL=index.d.ts.map