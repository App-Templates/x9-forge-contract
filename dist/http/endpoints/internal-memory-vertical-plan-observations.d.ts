import { z } from 'zod';
export declare const INTERNAL_MEMORY_VERTICAL_PLAN_OBSERVATION_PATH: "/internal/memory/vertical-plan-observations/:observationId";
export declare const INTERNAL_MEMORY_VERTICAL_PLAN_OBSERVATION_EVENTS_PATH: "/internal/memory/vertical-plan-observations/:observationId/events";
export declare const InternalMemoryVerticalPlanObservationParamsSchema: z.ZodObject<{
    observationId: z.ZodString;
}, z.core.$strict>;
export type InternalMemoryVerticalPlanObservationParams = z.infer<typeof InternalMemoryVerticalPlanObservationParamsSchema>;
export declare const InternalMemoryVerticalPlanObservationQuerySchema: z.ZodObject<{
    tenantId: z.ZodString;
    clientId: z.ZodString;
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
}, z.core.$strict>;
export type InternalMemoryVerticalPlanObservationQuery = z.infer<typeof InternalMemoryVerticalPlanObservationQuerySchema>;
export declare const InternalMemoryVerticalPlanObservationEventWriteRequestSchema: z.ZodObject<{
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
    subject: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
    event: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
                        repo: z.ZodOptional<z.ZodString>;
                        commit: z.ZodOptional<z.ZodString>;
                        path: z.ZodOptional<z.ZodString>;
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
                    providedBy: z.ZodOptional<z.ZodObject<{
                        personRef: z.ZodString;
                    }, z.core.$strict>>;
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
        eventId: z.ZodString;
        at: z.ZodISODateTime;
        requestId: z.ZodString;
    }, z.core.$strict>], "kind">;
}, z.core.$strict>;
export type InternalMemoryVerticalPlanObservationEventWriteRequest = z.infer<typeof InternalMemoryVerticalPlanObservationEventWriteRequestSchema>;
export declare const InternalMemoryVerticalPlanObservationReadResponseSchema: z.ZodObject<{
    observation: z.ZodObject<{
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
        subject: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
                            repo: z.ZodOptional<z.ZodString>;
                            commit: z.ZodOptional<z.ZodString>;
                            path: z.ZodOptional<z.ZodString>;
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
                        providedBy: z.ZodOptional<z.ZodObject<{
                            personRef: z.ZodString;
                        }, z.core.$strict>>;
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
            eventId: z.ZodString;
            at: z.ZodISODateTime;
            requestId: z.ZodString;
        }, z.core.$strict>], "kind">>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type InternalMemoryVerticalPlanObservationReadResponse = z.infer<typeof InternalMemoryVerticalPlanObservationReadResponseSchema>;
export declare const InternalMemoryVerticalPlanObservationEventWriteResponseSchema: z.ZodObject<{
    observation: z.ZodObject<{
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
        subject: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
                            repo: z.ZodOptional<z.ZodString>;
                            commit: z.ZodOptional<z.ZodString>;
                            path: z.ZodOptional<z.ZodString>;
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
                        providedBy: z.ZodOptional<z.ZodObject<{
                            personRef: z.ZodString;
                        }, z.core.$strict>>;
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
            eventId: z.ZodString;
            at: z.ZodISODateTime;
            requestId: z.ZodString;
        }, z.core.$strict>], "kind">>;
    }, z.core.$strict>;
    replayed: z.ZodBoolean;
}, z.core.$strict>;
export type InternalMemoryVerticalPlanObservationEventWriteResponse = z.infer<typeof InternalMemoryVerticalPlanObservationEventWriteResponseSchema>;
export declare const VerticalPlanObservationErrorCodeSchema: z.ZodEnum<{
    vertical_plan_observation_conflict: "vertical_plan_observation_conflict";
    vertical_plan_observation_not_found: "vertical_plan_observation_not_found";
    vertical_plan_observation_out_of_order: "vertical_plan_observation_out_of_order";
    vertical_plan_observation_version_mismatch: "vertical_plan_observation_version_mismatch";
}>;
export type VerticalPlanObservationErrorCode = z.infer<typeof VerticalPlanObservationErrorCodeSchema>;
export declare const VerticalPlanObservationErrorResponseSchema: z.ZodObject<{
    code: z.ZodEnum<{
        vertical_plan_observation_conflict: "vertical_plan_observation_conflict";
        vertical_plan_observation_not_found: "vertical_plan_observation_not_found";
        vertical_plan_observation_out_of_order: "vertical_plan_observation_out_of_order";
        vertical_plan_observation_version_mismatch: "vertical_plan_observation_version_mismatch";
    }>;
    message: z.ZodString;
}, z.core.$strict>;
export type VerticalPlanObservationErrorResponse = z.infer<typeof VerticalPlanObservationErrorResponseSchema>;
/**
 * Read: 200 with the observation; 404 vertical_plan_observation_not_found for a
 * missing observation or a different tenant/client/agent. The service must validate
 * authenticated scope before returning data; query parameters authorize nobody.
 */
export declare const internalMemoryVerticalPlanObservationReadContract: {
    readonly method: "GET";
    readonly path: "/internal/memory/vertical-plan-observations/:observationId";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        observationId: z.ZodString;
    }, z.core.$strict>;
    readonly querySchema: z.ZodObject<{
        tenantId: z.ZodString;
        clientId: z.ZodString;
        agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        observation: z.ZodObject<{
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
            subject: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
                                repo: z.ZodOptional<z.ZodString>;
                                commit: z.ZodOptional<z.ZodString>;
                                path: z.ZodOptional<z.ZodString>;
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
                            providedBy: z.ZodOptional<z.ZodObject<{
                                personRef: z.ZodString;
                            }, z.core.$strict>>;
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
                eventId: z.ZodString;
                at: z.ZodISODateTime;
                requestId: z.ZodString;
            }, z.core.$strict>], "kind">>;
        }, z.core.$strict>;
    }, z.core.$strict>;
};
/**
 * Append: 201 for a new event (replayed: false), 200 for the same eventId and
 * identical content (replayed: true); 409 vertical_plan_observation_conflict for
 * different content or scope, 409 vertical_plan_observation_out_of_order for an
 * invalid sequence, 409 vertical_plan_observation_version_mismatch for a subject
 * different from the stored subject. A different tenant/client/agent returns
 * 404 vertical_plan_observation_not_found. The service must validate authenticated
 * scope and stored scope before appending.
 */
export declare const internalMemoryVerticalPlanObservationEventWriteContract: {
    readonly method: "POST";
    readonly path: "/internal/memory/vertical-plan-observations/:observationId/events";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        observationId: z.ZodString;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
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
        subject: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
        event: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
                            repo: z.ZodOptional<z.ZodString>;
                            commit: z.ZodOptional<z.ZodString>;
                            path: z.ZodOptional<z.ZodString>;
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
                        providedBy: z.ZodOptional<z.ZodObject<{
                            personRef: z.ZodString;
                        }, z.core.$strict>>;
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
            eventId: z.ZodString;
            at: z.ZodISODateTime;
            requestId: z.ZodString;
        }, z.core.$strict>], "kind">;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        observation: z.ZodObject<{
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
            subject: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
                                repo: z.ZodOptional<z.ZodString>;
                                commit: z.ZodOptional<z.ZodString>;
                                path: z.ZodOptional<z.ZodString>;
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
                            providedBy: z.ZodOptional<z.ZodObject<{
                                personRef: z.ZodString;
                            }, z.core.$strict>>;
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
                eventId: z.ZodString;
                at: z.ZodISODateTime;
                requestId: z.ZodString;
            }, z.core.$strict>], "kind">>;
        }, z.core.$strict>;
        replayed: z.ZodBoolean;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-memory-vertical-plan-observations.d.ts.map