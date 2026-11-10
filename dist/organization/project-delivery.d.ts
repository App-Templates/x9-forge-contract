import { z } from 'zod';
import type { ActionPlan } from "./action-plan.js";
import { type AssetRef } from "./asset.js";
import { type DecisionOutcome, type DecisionRequest } from "./decision-request.js";
/** Tool through which the Director reconciles the approved deliveries of a project and sends them to the client. */
export declare const PROJECT_DELIVERY_TOOL: "email_deliver_project";
/** `complete`: every unit of the plan has an approved piece; `partial`: some do; `empty`: none does. */
export declare const PROJECT_DELIVERY_OUTCOMES: readonly ["complete", "partial", "empty"];
export declare const ProjectDeliveryOutcomeSchema: z.ZodEnum<{
    partial: "partial";
    complete: "complete";
    empty: "empty";
}>;
export type ProjectDeliveryOutcome = z.infer<typeof ProjectDeliveryOutcomeSchema>;
export declare const PROJECT_DELIVERY_PIECE_STATES: readonly ["approved", "pending", "rejected", "missing"];
export declare const ProjectDeliveryPieceStateSchema: z.ZodEnum<{
    pending: "pending";
    approved: "approved";
    rejected: "rejected";
    missing: "missing";
}>;
export type ProjectDeliveryPieceState = z.infer<typeof ProjectDeliveryPieceStateSchema>;
export declare const PROJECT_DELIVERY_SENT_KINDS: readonly ["final", "partial"];
export declare const ProjectDeliverySentKindSchema: z.ZodEnum<{
    partial: "partial";
    final: "final";
}>;
export type ProjectDeliverySentKind = z.infer<typeof ProjectDeliverySentKindSchema>;
export declare const ProjectDeliveryInputSchema: z.ZodObject<{
    projectId: z.ZodString;
    partial: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>;
export type ProjectDeliveryInput = z.infer<typeof ProjectDeliveryInputSchema>;
declare const PlanRefSchema: z.ZodObject<{
    planId: z.ZodString;
    version: z.ZodNumber;
    digest: z.ZodString;
}, z.core.$strict>;
type PlanRef = z.infer<typeof PlanRefSchema>;
export declare const ProjectDeliveryPieceSchema: z.ZodObject<{
    buSlug: z.ZodString;
    state: z.ZodEnum<{
        pending: "pending";
        approved: "approved";
        rejected: "rejected";
        missing: "missing";
    }>;
    requestId: z.ZodOptional<z.ZodString>;
    deliveryRef: z.ZodOptional<z.ZodObject<{
        assetId: z.ZodString;
        sha256: z.ZodString;
    }, z.core.$strict>>;
    decidedAt: z.ZodOptional<z.ZodISODateTime>;
}, z.core.$strict>;
export type ProjectDeliveryPiece = z.infer<typeof ProjectDeliveryPieceSchema>;
/** Who a missing piece waits on, and what it needs from them. */
export declare const ProjectDeliveryWaitSchema: z.ZodObject<{
    buSlug: z.ZodString;
    what: z.ZodString;
}, z.core.$strict>;
export type ProjectDeliveryWait = z.infer<typeof ProjectDeliveryWaitSchema>;
export declare const ProjectDeliveryMissingSchema: z.ZodObject<{
    buSlug: z.ZodString;
    state: z.ZodEnum<{
        pending: "pending";
        rejected: "rejected";
        missing: "missing";
    }>;
    waitsOn: z.ZodArray<z.ZodObject<{
        buSlug: z.ZodString;
        what: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ProjectDeliveryMissing = z.infer<typeof ProjectDeliveryMissingSchema>;
export declare const ProjectDeliverySentSchema: z.ZodObject<{
    messageId: z.ZodString;
    sentAt: z.ZodISODateTime;
    kind: z.ZodEnum<{
        partial: "partial";
        final: "final";
    }>;
}, z.core.$strict>;
export type ProjectDeliverySent = z.infer<typeof ProjectDeliverySentSchema>;
/** What the Director sees about a project delivery: the pieces, what is missing and from whom, the fingerprint of that state, and (once mailed) the send. */
export declare const ProjectDeliveryReconciliationSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    missing: z.ZodArray<z.ZodObject<{
        buSlug: z.ZodString;
        state: z.ZodEnum<{
            pending: "pending";
            rejected: "rejected";
            missing: "missing";
        }>;
        waitsOn: z.ZodArray<z.ZodObject<{
            buSlug: z.ZodString;
            what: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    plan: z.ZodObject<{
        planId: z.ZodString;
        version: z.ZodNumber;
        digest: z.ZodString;
    }, z.core.$strict>;
    digest: z.ZodString;
    pieces: z.ZodArray<z.ZodObject<{
        buSlug: z.ZodString;
        state: z.ZodEnum<{
            pending: "pending";
            approved: "approved";
            rejected: "rejected";
            missing: "missing";
        }>;
        requestId: z.ZodOptional<z.ZodString>;
        deliveryRef: z.ZodOptional<z.ZodObject<{
            assetId: z.ZodString;
            sha256: z.ZodString;
        }, z.core.$strict>>;
        decidedAt: z.ZodOptional<z.ZodISODateTime>;
    }, z.core.$strict>>;
    sent: z.ZodOptional<z.ZodObject<{
        messageId: z.ZodString;
        sentAt: z.ZodISODateTime;
        kind: z.ZodEnum<{
            partial: "partial";
            final: "final";
        }>;
    }, z.core.$strict>>;
    outcome: z.ZodLiteral<"complete">;
}, z.core.$strict>, z.ZodObject<{
    missing: z.ZodArray<z.ZodObject<{
        buSlug: z.ZodString;
        state: z.ZodEnum<{
            pending: "pending";
            rejected: "rejected";
            missing: "missing";
        }>;
        waitsOn: z.ZodArray<z.ZodObject<{
            buSlug: z.ZodString;
            what: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    plan: z.ZodObject<{
        planId: z.ZodString;
        version: z.ZodNumber;
        digest: z.ZodString;
    }, z.core.$strict>;
    digest: z.ZodString;
    pieces: z.ZodArray<z.ZodObject<{
        buSlug: z.ZodString;
        state: z.ZodEnum<{
            pending: "pending";
            approved: "approved";
            rejected: "rejected";
            missing: "missing";
        }>;
        requestId: z.ZodOptional<z.ZodString>;
        deliveryRef: z.ZodOptional<z.ZodObject<{
            assetId: z.ZodString;
            sha256: z.ZodString;
        }, z.core.$strict>>;
        decidedAt: z.ZodOptional<z.ZodISODateTime>;
    }, z.core.$strict>>;
    sent: z.ZodOptional<z.ZodObject<{
        messageId: z.ZodString;
        sentAt: z.ZodISODateTime;
        kind: z.ZodEnum<{
            partial: "partial";
            final: "final";
        }>;
    }, z.core.$strict>>;
    outcome: z.ZodLiteral<"partial">;
}, z.core.$strict>, z.ZodObject<{
    missing: z.ZodArray<z.ZodObject<{
        buSlug: z.ZodString;
        state: z.ZodEnum<{
            pending: "pending";
            rejected: "rejected";
            missing: "missing";
        }>;
        waitsOn: z.ZodArray<z.ZodObject<{
            buSlug: z.ZodString;
            what: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    plan: z.ZodObject<{
        planId: z.ZodString;
        version: z.ZodNumber;
        digest: z.ZodString;
    }, z.core.$strict>;
    digest: z.ZodString;
    pieces: z.ZodArray<z.ZodObject<{
        buSlug: z.ZodString;
        state: z.ZodEnum<{
            pending: "pending";
            approved: "approved";
            rejected: "rejected";
            missing: "missing";
        }>;
        requestId: z.ZodOptional<z.ZodString>;
        deliveryRef: z.ZodOptional<z.ZodObject<{
            assetId: z.ZodString;
            sha256: z.ZodString;
        }, z.core.$strict>>;
        decidedAt: z.ZodOptional<z.ZodISODateTime>;
    }, z.core.$strict>>;
    sent: z.ZodOptional<z.ZodObject<{
        messageId: z.ZodString;
        sentAt: z.ZodISODateTime;
        kind: z.ZodEnum<{
            partial: "partial";
            final: "final";
        }>;
    }, z.core.$strict>>;
    outcome: z.ZodLiteral<"empty">;
}, z.core.$strict>], "outcome">;
export type ProjectDeliveryReconciliation = z.infer<typeof ProjectDeliveryReconciliationSchema>;
/** Fingerprint of the delivery state: plan identity plus each piece, sorted by unit so decision order never matters. */
export declare function projectDeliveryDigest(plan: PlanRef, pieces: readonly ProjectDeliveryPiece[]): string;
type Decision = {
    request: DecisionRequest;
    outcome: DecisionOutcome | null;
};
/**
 * Reconciles the approved deliveries of a project with its approved plan: one piece per business unit
 * of the plan, in plan order, and for each unit that is not approved who it waits on.
 *
 * `planApprovedAt` is chosen by the caller (X9) and must be the FIRST approval of the same `planId`, not
 * the approval of the current version. In production the design was approved on 06/11 under v3 and v4
 * was approved on 09/11: with "after the approval of the current version" the design piece would vanish.
 */
export declare function reconcileProjectDelivery(input: {
    plan: ActionPlan;
    planApprovedAt: string;
    decisions: readonly Decision[];
    assets: readonly AssetRef[];
}): ProjectDeliveryReconciliation;
export {};
//# sourceMappingURL=project-delivery.d.ts.map