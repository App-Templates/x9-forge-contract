import { z } from 'zod';
import { type ActionPlan } from "./action-plan.cjs";
import { type AssetRef } from "./asset.cjs";
import { type DecisionOutcome, type DecisionRequest } from "./decision-request.cjs";
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
export declare const PROJECT_DELIVERY_PIECE_STATES: readonly ["approved", "pending", "rejected", "missing", "needs_reapproval"];
export declare const ProjectDeliveryPieceStateSchema: z.ZodEnum<{
    pending: "pending";
    approved: "approved";
    rejected: "rejected";
    missing: "missing";
    needs_reapproval: "needs_reapproval";
}>;
export type ProjectDeliveryPieceState = z.infer<typeof ProjectDeliveryPieceStateSchema>;
export declare const PROJECT_DELIVERY_SENT_KINDS: readonly ["final", "partial"];
export declare const ProjectDeliverySentKindSchema: z.ZodEnum<{
    partial: "partial";
    final: "final";
}>;
export type ProjectDeliverySentKind = z.infer<typeof ProjectDeliverySentKindSchema>;
/** Asset type under which the delivery of a project is recorded in Memory. */
export declare const PROJECT_DELIVERY_ASSET_TYPE: "consegna-progetto";
/** How many times a send of the same delivery state may be claimed (each attempt has its own `sending` record). */
export declare const PROJECT_DELIVERY_MAX_ATTEMPTS = 3;
/** `sending`: claimed before mailing; `sent`: mailed; `released`: the claimed send did not leave, the next attempt may retry. */
export declare const PROJECT_DELIVERY_RECORD_STAGES: readonly ["sending", "sent", "released"];
export declare const ProjectDeliveryRecordStageSchema: z.ZodEnum<{
    sending: "sending";
    sent: "sent";
    released: "released";
}>;
export type ProjectDeliveryRecordStage = z.infer<typeof ProjectDeliveryRecordStageSchema>;
/** Refusal code of a plan that lists the same business unit more than once. */
export declare const PROJECT_DELIVERY_DUPLICATE_UNIT: "project_delivery_duplicate_unit";
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
        needs_reapproval: "needs_reapproval";
    }>;
    requestId: z.ZodOptional<z.ZodString>;
    deliveryRef: z.ZodOptional<z.ZodObject<{
        assetId: z.ZodString;
        sha256: z.ZodString;
    }, z.core.$strict>>;
    decidedAt: z.ZodOptional<z.ZodISODateTime>;
    approvedUnderVersion: z.ZodOptional<z.ZodNumber>;
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
        needs_reapproval: "needs_reapproval";
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
            needs_reapproval: "needs_reapproval";
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
            needs_reapproval: "needs_reapproval";
        }>;
        requestId: z.ZodOptional<z.ZodString>;
        deliveryRef: z.ZodOptional<z.ZodObject<{
            assetId: z.ZodString;
            sha256: z.ZodString;
        }, z.core.$strict>>;
        decidedAt: z.ZodOptional<z.ZodISODateTime>;
        approvedUnderVersion: z.ZodOptional<z.ZodNumber>;
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
            needs_reapproval: "needs_reapproval";
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
            needs_reapproval: "needs_reapproval";
        }>;
        requestId: z.ZodOptional<z.ZodString>;
        deliveryRef: z.ZodOptional<z.ZodObject<{
            assetId: z.ZodString;
            sha256: z.ZodString;
        }, z.core.$strict>>;
        decidedAt: z.ZodOptional<z.ZodISODateTime>;
        approvedUnderVersion: z.ZodOptional<z.ZodNumber>;
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
            needs_reapproval: "needs_reapproval";
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
            needs_reapproval: "needs_reapproval";
        }>;
        requestId: z.ZodOptional<z.ZodString>;
        deliveryRef: z.ZodOptional<z.ZodObject<{
            assetId: z.ZodString;
            sha256: z.ZodString;
        }, z.core.$strict>>;
        decidedAt: z.ZodOptional<z.ZodISODateTime>;
        approvedUnderVersion: z.ZodOptional<z.ZodNumber>;
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
/** Output of the project delivery tool: exactly the reconciliation. */
export declare const ProjectDeliveryToolOutputSchema: z.ZodObject<{
    reconciliation: z.ZodDiscriminatedUnion<[z.ZodObject<{
        missing: z.ZodArray<z.ZodObject<{
            buSlug: z.ZodString;
            state: z.ZodEnum<{
                pending: "pending";
                rejected: "rejected";
                missing: "missing";
                needs_reapproval: "needs_reapproval";
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
                needs_reapproval: "needs_reapproval";
            }>;
            requestId: z.ZodOptional<z.ZodString>;
            deliveryRef: z.ZodOptional<z.ZodObject<{
                assetId: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>>;
            decidedAt: z.ZodOptional<z.ZodISODateTime>;
            approvedUnderVersion: z.ZodOptional<z.ZodNumber>;
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
                needs_reapproval: "needs_reapproval";
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
                needs_reapproval: "needs_reapproval";
            }>;
            requestId: z.ZodOptional<z.ZodString>;
            deliveryRef: z.ZodOptional<z.ZodObject<{
                assetId: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>>;
            decidedAt: z.ZodOptional<z.ZodISODateTime>;
            approvedUnderVersion: z.ZodOptional<z.ZodNumber>;
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
                needs_reapproval: "needs_reapproval";
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
                needs_reapproval: "needs_reapproval";
            }>;
            requestId: z.ZodOptional<z.ZodString>;
            deliveryRef: z.ZodOptional<z.ZodObject<{
                assetId: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>>;
            decidedAt: z.ZodOptional<z.ZodISODateTime>;
            approvedUnderVersion: z.ZodOptional<z.ZodNumber>;
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
}, z.core.$strict>;
export type ProjectDeliveryToolOutput = z.infer<typeof ProjectDeliveryToolOutputSchema>;
/** Registration of a send, in stages: claimed (`sending`), mailed (`sent`) or given back (`released`). */
export declare const ProjectDeliveryRecordSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    reconciliation: z.ZodDiscriminatedUnion<[z.ZodObject<{
        missing: z.ZodArray<z.ZodObject<{
            buSlug: z.ZodString;
            state: z.ZodEnum<{
                pending: "pending";
                rejected: "rejected";
                missing: "missing";
                needs_reapproval: "needs_reapproval";
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
                needs_reapproval: "needs_reapproval";
            }>;
            requestId: z.ZodOptional<z.ZodString>;
            deliveryRef: z.ZodOptional<z.ZodObject<{
                assetId: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>>;
            decidedAt: z.ZodOptional<z.ZodISODateTime>;
            approvedUnderVersion: z.ZodOptional<z.ZodNumber>;
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
                needs_reapproval: "needs_reapproval";
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
                needs_reapproval: "needs_reapproval";
            }>;
            requestId: z.ZodOptional<z.ZodString>;
            deliveryRef: z.ZodOptional<z.ZodObject<{
                assetId: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>>;
            decidedAt: z.ZodOptional<z.ZodISODateTime>;
            approvedUnderVersion: z.ZodOptional<z.ZodNumber>;
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
                needs_reapproval: "needs_reapproval";
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
                needs_reapproval: "needs_reapproval";
            }>;
            requestId: z.ZodOptional<z.ZodString>;
            deliveryRef: z.ZodOptional<z.ZodObject<{
                assetId: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>>;
            decidedAt: z.ZodOptional<z.ZodISODateTime>;
            approvedUnderVersion: z.ZodOptional<z.ZodNumber>;
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
    claimedBy: z.ZodString;
    claimedAt: z.ZodISODateTime;
    kind: z.ZodEnum<{
        partial: "partial";
        final: "final";
    }>;
    digest: z.ZodString;
    attempt: z.ZodNumber;
    stage: z.ZodLiteral<"sending">;
}, z.core.$strict>, z.ZodObject<{
    reconciliation: z.ZodDiscriminatedUnion<[z.ZodObject<{
        missing: z.ZodArray<z.ZodObject<{
            buSlug: z.ZodString;
            state: z.ZodEnum<{
                pending: "pending";
                rejected: "rejected";
                missing: "missing";
                needs_reapproval: "needs_reapproval";
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
                needs_reapproval: "needs_reapproval";
            }>;
            requestId: z.ZodOptional<z.ZodString>;
            deliveryRef: z.ZodOptional<z.ZodObject<{
                assetId: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>>;
            decidedAt: z.ZodOptional<z.ZodISODateTime>;
            approvedUnderVersion: z.ZodOptional<z.ZodNumber>;
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
                needs_reapproval: "needs_reapproval";
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
                needs_reapproval: "needs_reapproval";
            }>;
            requestId: z.ZodOptional<z.ZodString>;
            deliveryRef: z.ZodOptional<z.ZodObject<{
                assetId: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>>;
            decidedAt: z.ZodOptional<z.ZodISODateTime>;
            approvedUnderVersion: z.ZodOptional<z.ZodNumber>;
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
                needs_reapproval: "needs_reapproval";
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
                needs_reapproval: "needs_reapproval";
            }>;
            requestId: z.ZodOptional<z.ZodString>;
            deliveryRef: z.ZodOptional<z.ZodObject<{
                assetId: z.ZodString;
                sha256: z.ZodString;
            }, z.core.$strict>>;
            decidedAt: z.ZodOptional<z.ZodISODateTime>;
            approvedUnderVersion: z.ZodOptional<z.ZodNumber>;
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
    kind: z.ZodEnum<{
        partial: "partial";
        final: "final";
    }>;
    digest: z.ZodString;
    attempt: z.ZodNumber;
    stage: z.ZodLiteral<"sent">;
}, z.core.$strict>, z.ZodObject<{
    reason: z.ZodString;
    releasedAt: z.ZodISODateTime;
    kind: z.ZodEnum<{
        partial: "partial";
        final: "final";
    }>;
    digest: z.ZodString;
    attempt: z.ZodNumber;
    stage: z.ZodLiteral<"released">;
}, z.core.$strict>], "stage">;
export type ProjectDeliveryRecord = z.infer<typeof ProjectDeliveryRecordSchema>;
/** Asset name of a record: one `sent` per delivery state, one record per stage and attempt otherwise. */
export declare function projectDeliveryRecordName(input: {
    kind: ProjectDeliverySentKind;
    digest: string;
    stage: ProjectDeliveryRecordStage;
    attempt: number;
}): string;
/** Deterministic asset id of a record, so a retry or a concurrent call finds the same asset. */
export declare function projectDeliveryRecordAssetId(input: {
    tenantId: string;
    organizationId: string;
    projectId: string;
    name: string;
}): string;
/** Fingerprint of the delivery state: plan identity plus each piece, sorted by unit so decision order never matters. */
export declare function projectDeliveryDigest(plan: PlanRef, pieces: readonly ProjectDeliveryPiece[]): string;
/** Fingerprint of a unit's work, independent of its start conditions and referent. */
export declare function projectDeliveryUnitDigest(plan: ActionPlan, buSlug: string): string;
type Decision = {
    request: DecisionRequest;
    outcome: DecisionOutcome | null;
};
type PlanVersion = {
    plan: ActionPlan;
    approvedAt: string;
};
/**
 * Reconciles the approved deliveries of a project with its approved plan: one piece per business unit
 * of the plan, in plan order, and for each unit that is not approved who it waits on.
 *
 * `planApprovedAt` is chosen by the caller (X9) and must be the FIRST approval of the same `planId`, not
 * the approval of the current version. In production the design was approved on 06/11 under v3 and v4
 * was approved on 09/11: with "after the approval of the current version" the design piece would vanish.
 * An older approval counts only if that unit's work is unchanged in the current plan. For example, v4
 * changing the design mandate requires reapproval of its v3 piece and prevents a complete delivery.
 */
export declare function reconcileProjectDelivery(input: {
    plan: ActionPlan;
    planApprovedAt: string;
    decisions: readonly Decision[];
    assets: readonly AssetRef[];
    planVersions?: readonly PlanVersion[];
}): ProjectDeliveryReconciliation;
export {};
//# sourceMappingURL=project-delivery.d.ts.map