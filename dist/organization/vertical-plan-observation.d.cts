import { z } from 'zod';
import type { MandateAttemptScope } from "./business-unit-mandate.cjs";
import type { DecisionSubject } from "./decision-request.cjs";
import type { VerticalPlan } from "./vertical-plan.cjs";
/** Thread reference only: owner and opening live in the thread registry. */
export declare const VerticalPlanSendThreadSchema: z.ZodObject<{
    providerThreadId: z.ZodString;
    mailboxId: z.ZodString;
}, z.core.$strict>;
export type VerticalPlanSendThread = z.infer<typeof VerticalPlanSendThreadSchema>;
export declare const VERTICAL_PLAN_ATTEMPT_EVENT_KINDS: readonly ["sent", "send_failed", "reply_received", "reply_delivered"];
export declare const VerticalPlanAttemptEventSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"sent">;
    plan: z.ZodObject<{
        planId: z.ZodString;
        version: z.ZodNumber;
        digest: z.ZodString;
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        clientId: z.ZodString;
        projectId: z.ZodString;
        buSlug: z.ZodString;
        actionPlan: z.ZodObject<{
            planId: z.ZodString;
            version: z.ZodNumber;
        }, z.core.$strict>;
        analysis: z.ZodString;
        milestones: z.ZodArray<z.ZodObject<{
            number: z.ZodNumber;
            expectedGoal: z.ZodString;
            dueDate: z.ZodISODate;
            blockedBy: z.ZodArray<z.ZodNumber>;
        }, z.core.$strict>>;
        blockers: z.ZodArray<z.ZodObject<{
            what: z.ZodString;
            unlocksMilestone: z.ZodNumber;
        }, z.core.$strict>>;
        questions: z.ZodArray<z.ZodObject<{
            question: z.ZodString;
            unlocks: z.ZodString;
        }, z.core.$strict>>;
        attachments: z.ZodArray<z.ZodObject<{
            role: z.ZodEnum<{
                budget: "budget";
                reviewer: "reviewer";
                executor: "executor";
                rd_dossier: "rd_dossier";
                criteria: "criteria";
            }>;
            asset: z.ZodObject<{
                assetId: z.ZodString;
                sha256: z.ZodString;
                name: z.ZodString;
                mediaType: z.ZodString;
                sizeBytes: z.ZodNumber;
                origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"email">;
                    messageId: z.ZodString;
                    attachmentName: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"archive">;
                    archiveSha256: z.ZodString;
                    entryPath: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"session">;
                    sessionId: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"link">;
                    url: z.ZodURL;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"generated">;
                    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                    sourceAssetIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
                }, z.core.$strict>], "kind">;
                tenantId: z.ZodString;
                companyId: z.ZodString;
                projectId: z.ZodString;
                assetType: z.ZodOptional<z.ZodString>;
                buSlug: z.ZodOptional<z.ZodString>;
                createdAt: z.ZodISODateTime;
            }, z.core.$strict>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    referent: z.ZodObject<{
        personRef: z.ZodString;
        entryVersion: z.ZodNumber;
    }, z.core.$strict>;
    to: z.ZodEmail;
    thread: z.ZodObject<{
        providerThreadId: z.ZodString;
        mailboxId: z.ZodString;
    }, z.core.$strict>;
    providerMessageId: z.ZodString;
    eventId: z.ZodString;
    at: z.ZodISODateTime;
    requestId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"send_failed">;
    referent: z.ZodObject<{
        personRef: z.ZodString;
        entryVersion: z.ZodNumber;
    }, z.core.$strict>;
    to: z.ZodEmail;
    error: z.ZodString;
    eventId: z.ZodString;
    at: z.ZodISODateTime;
    requestId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"reply_received">;
    thread: z.ZodObject<{
        providerThreadId: z.ZodString;
        mailboxId: z.ZodString;
    }, z.core.$strict>;
    providerMessageId: z.ZodString;
    eventId: z.ZodString;
    at: z.ZodISODateTime;
    requestId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"reply_delivered">;
    outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
        subject: z.ZodOptional<z.ZodObject<{
            kind: z.ZodEnum<{
                action_plan: "action_plan";
                vertical_plan: "vertical_plan";
                confirmation: "confirmation";
            }>;
            planId: z.ZodString;
            planVersion: z.ZodNumber;
            digest: z.ZodString;
        }, z.core.$strict>>;
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
        subject: z.ZodOptional<z.ZodObject<{
            kind: z.ZodEnum<{
                action_plan: "action_plan";
                vertical_plan: "vertical_plan";
                confirmation: "confirmation";
            }>;
            planId: z.ZodString;
            planVersion: z.ZodNumber;
            digest: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>], "outcome">;
    eventId: z.ZodString;
    at: z.ZodISODateTime;
    requestId: z.ZodString;
}, z.core.$strict>], "kind">;
export type VerticalPlanAttemptEvent = z.infer<typeof VerticalPlanAttemptEventSchema>;
/** True when the sent plan is the exact subject of the attempt and belongs to the attempt scope. */
export declare function verticalPlanMatchesAttempt(scope: MandateAttemptScope, subject: DecisionSubject, plan: VerticalPlan): boolean;
/** Ordered events of one scoped send attempt; persistence owns event replay detection. */
export declare const VerticalPlanAttemptObservationSchema: z.ZodObject<{
    observationId: z.ZodString;
    scope: z.ZodObject<{
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        clientId: z.ZodString;
        projectId: z.ZodString;
        buSlug: z.ZodString;
        agent: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
    }, z.core.$strict>;
    subject: z.ZodObject<{
        kind: z.ZodEnum<{
            action_plan: "action_plan";
            vertical_plan: "vertical_plan";
            confirmation: "confirmation";
        }>;
        planId: z.ZodString;
        planVersion: z.ZodNumber;
        digest: z.ZodString;
    }, z.core.$strict>;
    events: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"sent">;
        plan: z.ZodObject<{
            planId: z.ZodString;
            version: z.ZodNumber;
            digest: z.ZodString;
            tenantId: z.ZodString;
            organizationId: z.ZodString;
            clientId: z.ZodString;
            projectId: z.ZodString;
            buSlug: z.ZodString;
            actionPlan: z.ZodObject<{
                planId: z.ZodString;
                version: z.ZodNumber;
            }, z.core.$strict>;
            analysis: z.ZodString;
            milestones: z.ZodArray<z.ZodObject<{
                number: z.ZodNumber;
                expectedGoal: z.ZodString;
                dueDate: z.ZodISODate;
                blockedBy: z.ZodArray<z.ZodNumber>;
            }, z.core.$strict>>;
            blockers: z.ZodArray<z.ZodObject<{
                what: z.ZodString;
                unlocksMilestone: z.ZodNumber;
            }, z.core.$strict>>;
            questions: z.ZodArray<z.ZodObject<{
                question: z.ZodString;
                unlocks: z.ZodString;
            }, z.core.$strict>>;
            attachments: z.ZodArray<z.ZodObject<{
                role: z.ZodEnum<{
                    budget: "budget";
                    reviewer: "reviewer";
                    executor: "executor";
                    rd_dossier: "rd_dossier";
                    criteria: "criteria";
                }>;
                asset: z.ZodObject<{
                    assetId: z.ZodString;
                    sha256: z.ZodString;
                    name: z.ZodString;
                    mediaType: z.ZodString;
                    sizeBytes: z.ZodNumber;
                    origin: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"email">;
                        messageId: z.ZodString;
                        attachmentName: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"archive">;
                        archiveSha256: z.ZodString;
                        entryPath: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"session">;
                        sessionId: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"link">;
                        url: z.ZodURL;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"generated">;
                        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                        sourceAssetIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
                    }, z.core.$strict>], "kind">;
                    tenantId: z.ZodString;
                    companyId: z.ZodString;
                    projectId: z.ZodString;
                    assetType: z.ZodOptional<z.ZodString>;
                    buSlug: z.ZodOptional<z.ZodString>;
                    createdAt: z.ZodISODateTime;
                }, z.core.$strict>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        referent: z.ZodObject<{
            personRef: z.ZodString;
            entryVersion: z.ZodNumber;
        }, z.core.$strict>;
        to: z.ZodEmail;
        thread: z.ZodObject<{
            providerThreadId: z.ZodString;
            mailboxId: z.ZodString;
        }, z.core.$strict>;
        providerMessageId: z.ZodString;
        eventId: z.ZodString;
        at: z.ZodISODateTime;
        requestId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"send_failed">;
        referent: z.ZodObject<{
            personRef: z.ZodString;
            entryVersion: z.ZodNumber;
        }, z.core.$strict>;
        to: z.ZodEmail;
        error: z.ZodString;
        eventId: z.ZodString;
        at: z.ZodISODateTime;
        requestId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"reply_received">;
        thread: z.ZodObject<{
            providerThreadId: z.ZodString;
            mailboxId: z.ZodString;
        }, z.core.$strict>;
        providerMessageId: z.ZodString;
        eventId: z.ZodString;
        at: z.ZodISODateTime;
        requestId: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"reply_delivered">;
        outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
            subject: z.ZodOptional<z.ZodObject<{
                kind: z.ZodEnum<{
                    action_plan: "action_plan";
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>>;
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
            subject: z.ZodOptional<z.ZodObject<{
                kind: z.ZodEnum<{
                    action_plan: "action_plan";
                    vertical_plan: "vertical_plan";
                    confirmation: "confirmation";
                }>;
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                digest: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>], "outcome">;
        eventId: z.ZodString;
        at: z.ZodISODateTime;
        requestId: z.ZodString;
    }, z.core.$strict>], "kind">>;
}, z.core.$strict>;
export type VerticalPlanAttemptObservation = z.infer<typeof VerticalPlanAttemptObservationSchema>;
//# sourceMappingURL=vertical-plan-observation.d.ts.map