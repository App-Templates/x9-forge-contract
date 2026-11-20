import { z } from 'zod';
export declare const MANDATE_RECONCILIATION_OUTCOMES: readonly ["agrees", "conflict", "missing"];
export declare const MandateReconciliationOutcomeSchema: z.ZodEnum<{
    conflict: "conflict";
    missing: "missing";
    agrees: "agrees";
}>;
export type MandateReconciliationOutcome = z.infer<typeof MandateReconciliationOutcomeSchema>;
export declare const MANDATE_SOURCES: readonly ["plan_section", "decision", "referent", "notebook_page"];
export declare const MandateSourceSchema: z.ZodEnum<{
    decision: "decision";
    referent: "referent";
    plan_section: "plan_section";
    notebook_page: "notebook_page";
}>;
export type MandateSource = z.infer<typeof MandateSourceSchema>;
/** Result of comparing the approved plan, decision, referent and notebook pages. */
export declare const MandateReconciliationSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    outcome: z.ZodLiteral<"agrees">;
}, z.core.$strict>, z.ZodObject<{
    outcome: z.ZodLiteral<"conflict">;
    conflicts: z.ZodArray<z.ZodObject<{
        source: z.ZodEnum<{
            decision: "decision";
            referent: "referent";
            plan_section: "plan_section";
            notebook_page: "notebook_page";
        }>;
        ref: z.ZodString;
        reason: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>, z.ZodObject<{
    outcome: z.ZodLiteral<"missing">;
    missing: z.ZodArray<z.ZodObject<{
        source: z.ZodEnum<{
            decision: "decision";
            referent: "referent";
            plan_section: "plan_section";
            notebook_page: "notebook_page";
        }>;
        ref: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>], "outcome">;
export type MandateReconciliation = z.infer<typeof MandateReconciliationSchema>;
/** Repository, relative working folder and GitHub session board configured for the unit. */
export declare const MandateWorkplaceSchema: z.ZodObject<{
    repository: z.ZodObject<{
        host: z.ZodEnum<{
            bitbucket: "bitbucket";
            github: "github";
        }>;
        repo: z.ZodString;
    }, z.core.$strict>;
    folder: z.ZodOptional<z.ZodString>;
    sessionBoard: z.ZodOptional<z.ZodObject<{
        repo: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type MandateWorkplace = z.infer<typeof MandateWorkplaceSchema>;
/** Execution mode and tool permissions configured for the unit. */
export declare const MandateWorkModeSchema: z.ZodObject<{
    executor: z.ZodEnum<{
        agent: "agent";
        night: "night";
        dev_session: "dev_session";
    }>;
    allowedTools: z.ZodArray<z.ZodString>;
    excludedTools: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strict>;
export type MandateWorkMode = z.infer<typeof MandateWorkModeSchema>;
/** Versioned sources and their reconciliation, embedded in a business unit brief. */
export declare const ReconciledMandateSchema: z.ZodObject<{
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    clientId: z.ZodString;
    projectId: z.ZodString;
    planSection: z.ZodObject<{
        planId: z.ZodString;
        planVersion: z.ZodNumber;
        planDigest: z.ZodString;
        businessUnit: z.ZodObject<{
            buSlug: z.ZodString;
            typeId: z.ZodEnum<{
                dati: "dati";
                design: "design";
                sviluppo: "sviluppo";
                finanza: "finanza";
                marketing: "marketing";
            }>;
            mandate: z.ZodString;
            competencies: z.ZodArray<z.ZodString>;
            lead: z.ZodObject<{
                role: z.ZodLiteral<"capo-bu">;
            }, z.core.$strict>;
            reviewer: z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
                buSlug: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                role: z.ZodLiteral<"director">;
            }, z.core.$strict>]>>;
            executor: z.ZodEnum<{
                agent: "agent";
                night: "night";
                dev_session: "dev_session";
            }>;
            referent: z.ZodObject<{
                personRef: z.ZodString;
                entryVersion: z.ZodNumber;
            }, z.core.$strict>;
            firstActivities: z.ZodArray<z.ZodString>;
            sections: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                expectedGoal: z.ZodString;
                deliveryCriteria: z.ZodArray<z.ZodString>;
                milestone: z.ZodNumber;
                needsFrom: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    buSlug: z.ZodString;
                    what: z.ZodString;
                }, z.core.$strict>>>;
            }, z.core.$strict>>>;
            roleAgents: z.ZodOptional<z.ZodArray<z.ZodObject<{
                role: z.ZodString;
                competencies: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>>;
            start: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"now">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"planned">;
                unlockedBy: z.ZodObject<{
                    milestone: z.ZodNumber;
                    delivery: z.ZodString;
                }, z.core.$strict>;
            }, z.core.$strict>], "kind">;
            gapRule: z.ZodOptional<z.ZodEnum<{
                mark_and_proceed: "mark_and_proceed";
                stop_and_ask: "stop_and_ask";
            }>>;
            signOffs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                signer: z.ZodEnum<{
                    owner: "owner";
                    director: "director";
                    referent: "referent";
                }>;
                form: z.ZodLiteral<"decision_request">;
            }, z.core.$strict>>>;
        }, z.core.$strict>;
        /** The whole project's objective (plan part 1 and objectiveTree.project). Absent in mandates saved before 1.129.0. */
        project: z.ZodOptional<z.ZodObject<{
            objective: z.ZodObject<{
                request: z.ZodString;
                expectedResult: z.ZodString;
                measure: z.ZodString;
            }, z.core.$strict>;
            objectiveTree: z.ZodObject<{
                project: z.ZodObject<{
                    expectedResult: z.ZodString;
                    deliveryCriteria: z.ZodArray<z.ZodString>;
                }, z.core.$strict>;
            }, z.core.$strict>;
        }, z.core.$strict>>;
        /** This unit's entry of objectiveTree.businessUnits. */
        unitObjective: z.ZodOptional<z.ZodObject<{
            buSlug: z.ZodString;
            expectedResult: z.ZodString;
            deliveryCriteria: z.ZodArray<z.ZodString>;
            indicators: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                source: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        deliveryShape: z.ZodOptional<z.ZodEnum<{
            product: "product";
            study: "study";
        }>>;
        /** The whole project breakdown (product plans): the unit sees its items and where they sit. */
        workBreakdown: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            parentId: z.ZodOptional<z.ZodString>;
            title: z.ZodString;
            expectedGoal: z.ZodString;
            deliveryCriteria: z.ZodArray<z.ZodString>;
            milestone: z.ZodNumber;
            owners: z.ZodArray<z.ZodObject<{
                buSlug: z.ZodString;
                does: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>>>;
        /** The deliveries to or from this unit, as the plan writes them. Absent in mandates saved before 1.174.0. */
        exchanges: z.ZodOptional<z.ZodArray<z.ZodObject<{
            fromBu: z.ZodString;
            toBu: z.ZodString;
            what: z.ZodString;
            format: z.ZodString;
            key: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>>;
        /** The plan's open questions and to whom they go. Absent in mandates saved before 1.174.0. */
        questions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            question: z.ZodString;
            unlocks: z.ZodString;
            askTo: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"referent">;
                personRef: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"owner">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"director">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"business_unit">;
                buSlug: z.ZodString;
            }, z.core.$strict>], "kind">>;
        }, z.core.$strict>>>;
        /** How the dossier covers the topics the plan depends on. Absent in mandates saved before 1.174.0. */
        sourceCoverage: z.ZodOptional<z.ZodArray<z.ZodObject<{
            topic: z.ZodString;
            status: z.ZodEnum<{
                partial: "partial";
                missing: "missing";
                covered: "covered";
            }>;
            pages: z.ZodArray<z.ZodString>;
        }, z.core.$strict>>>;
    }, z.core.$strict>;
    decision: z.ZodObject<{
        requestId: z.ZodString;
        planVersion: z.ZodNumber;
    }, z.core.$strict>;
    referent: z.ZodObject<{
        personRef: z.ZodString;
        entryVersion: z.ZodNumber;
    }, z.core.$strict>;
    notebookPages: z.ZodArray<z.ZodObject<{
        slug: z.ZodString;
        version: z.ZodNumber;
    }, z.core.$strict>>;
    reconciliation: z.ZodDiscriminatedUnion<[z.ZodObject<{
        outcome: z.ZodLiteral<"agrees">;
    }, z.core.$strict>, z.ZodObject<{
        outcome: z.ZodLiteral<"conflict">;
        conflicts: z.ZodArray<z.ZodObject<{
            source: z.ZodEnum<{
                decision: "decision";
                referent: "referent";
                plan_section: "plan_section";
                notebook_page: "notebook_page";
            }>;
            ref: z.ZodString;
            reason: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodObject<{
        outcome: z.ZodLiteral<"missing">;
        missing: z.ZodArray<z.ZodObject<{
            source: z.ZodEnum<{
                decision: "decision";
                referent: "referent";
                plan_section: "plan_section";
                notebook_page: "notebook_page";
            }>;
            ref: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>], "outcome">;
    reconciledAt: z.ZodISODateTime;
    /** Service-owned: filled from the unit configuration, never from model input; absent in mandates saved before 1.173.0. */
    workplace: z.ZodOptional<z.ZodObject<{
        repository: z.ZodObject<{
            host: z.ZodEnum<{
                bitbucket: "bitbucket";
                github: "github";
            }>;
            repo: z.ZodString;
        }, z.core.$strict>;
        folder: z.ZodOptional<z.ZodString>;
        sessionBoard: z.ZodOptional<z.ZodObject<{
            repo: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    /** Service-owned: filled from the unit configuration, never from model input; absent in mandates saved before 1.173.0. */
    workMode: z.ZodOptional<z.ZodObject<{
        executor: z.ZodEnum<{
            agent: "agent";
            night: "night";
            dev_session: "dev_session";
        }>;
        allowedTools: z.ZodArray<z.ZodString>;
        excludedTools: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ReconciledMandate = z.infer<typeof ReconciledMandateSchema>;
export declare const MandateAttemptObservationIdSchema: z.ZodString;
export type MandateAttemptObservationId = z.infer<typeof MandateAttemptObservationIdSchema>;
export declare const MandateAttemptScopeSchema: z.ZodObject<{
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
export type MandateAttemptScope = z.infer<typeof MandateAttemptScopeSchema>;
export declare const MANDATE_ATTEMPT_EVENT_KINDS: readonly ["reconciled", "blocked", "question_opened", "email_sent", "email_failed", "issue_opened"];
export declare const MandateAttemptEventSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"reconciled">;
    mandate: z.ZodObject<{
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        clientId: z.ZodString;
        projectId: z.ZodString;
        planSection: z.ZodObject<{
            planId: z.ZodString;
            planVersion: z.ZodNumber;
            planDigest: z.ZodString;
            businessUnit: z.ZodObject<{
                buSlug: z.ZodString;
                typeId: z.ZodEnum<{
                    dati: "dati";
                    design: "design";
                    sviluppo: "sviluppo";
                    finanza: "finanza";
                    marketing: "marketing";
                }>;
                mandate: z.ZodString;
                competencies: z.ZodArray<z.ZodString>;
                lead: z.ZodObject<{
                    role: z.ZodLiteral<"capo-bu">;
                }, z.core.$strict>;
                reviewer: z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
                    buSlug: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    role: z.ZodLiteral<"director">;
                }, z.core.$strict>]>>;
                executor: z.ZodEnum<{
                    agent: "agent";
                    night: "night";
                    dev_session: "dev_session";
                }>;
                referent: z.ZodObject<{
                    personRef: z.ZodString;
                    entryVersion: z.ZodNumber;
                }, z.core.$strict>;
                firstActivities: z.ZodArray<z.ZodString>;
                sections: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    title: z.ZodString;
                    expectedGoal: z.ZodString;
                    deliveryCriteria: z.ZodArray<z.ZodString>;
                    milestone: z.ZodNumber;
                    needsFrom: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        buSlug: z.ZodString;
                        what: z.ZodString;
                    }, z.core.$strict>>>;
                }, z.core.$strict>>>;
                roleAgents: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    role: z.ZodString;
                    competencies: z.ZodArray<z.ZodString>;
                }, z.core.$strict>>>;
                start: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"now">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"planned">;
                    unlockedBy: z.ZodObject<{
                        milestone: z.ZodNumber;
                        delivery: z.ZodString;
                    }, z.core.$strict>;
                }, z.core.$strict>], "kind">;
                gapRule: z.ZodOptional<z.ZodEnum<{
                    mark_and_proceed: "mark_and_proceed";
                    stop_and_ask: "stop_and_ask";
                }>>;
                signOffs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    key: z.ZodString;
                    signer: z.ZodEnum<{
                        owner: "owner";
                        director: "director";
                        referent: "referent";
                    }>;
                    form: z.ZodLiteral<"decision_request">;
                }, z.core.$strict>>>;
            }, z.core.$strict>;
            /** The whole project's objective (plan part 1 and objectiveTree.project). Absent in mandates saved before 1.129.0. */
            project: z.ZodOptional<z.ZodObject<{
                objective: z.ZodObject<{
                    request: z.ZodString;
                    expectedResult: z.ZodString;
                    measure: z.ZodString;
                }, z.core.$strict>;
                objectiveTree: z.ZodObject<{
                    project: z.ZodObject<{
                        expectedResult: z.ZodString;
                        deliveryCriteria: z.ZodArray<z.ZodString>;
                    }, z.core.$strict>;
                }, z.core.$strict>;
            }, z.core.$strict>>;
            /** This unit's entry of objectiveTree.businessUnits. */
            unitObjective: z.ZodOptional<z.ZodObject<{
                buSlug: z.ZodString;
                expectedResult: z.ZodString;
                deliveryCriteria: z.ZodArray<z.ZodString>;
                indicators: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    source: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
            deliveryShape: z.ZodOptional<z.ZodEnum<{
                product: "product";
                study: "study";
            }>>;
            /** The whole project breakdown (product plans): the unit sees its items and where they sit. */
            workBreakdown: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                parentId: z.ZodOptional<z.ZodString>;
                title: z.ZodString;
                expectedGoal: z.ZodString;
                deliveryCriteria: z.ZodArray<z.ZodString>;
                milestone: z.ZodNumber;
                owners: z.ZodArray<z.ZodObject<{
                    buSlug: z.ZodString;
                    does: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>>>;
            /** The deliveries to or from this unit, as the plan writes them. Absent in mandates saved before 1.174.0. */
            exchanges: z.ZodOptional<z.ZodArray<z.ZodObject<{
                fromBu: z.ZodString;
                toBu: z.ZodString;
                what: z.ZodString;
                format: z.ZodString;
                key: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>>;
            /** The plan's open questions and to whom they go. Absent in mandates saved before 1.174.0. */
            questions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                question: z.ZodString;
                unlocks: z.ZodString;
                askTo: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"referent">;
                    personRef: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"owner">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"director">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"business_unit">;
                    buSlug: z.ZodString;
                }, z.core.$strict>], "kind">>;
            }, z.core.$strict>>>;
            /** How the dossier covers the topics the plan depends on. Absent in mandates saved before 1.174.0. */
            sourceCoverage: z.ZodOptional<z.ZodArray<z.ZodObject<{
                topic: z.ZodString;
                status: z.ZodEnum<{
                    partial: "partial";
                    missing: "missing";
                    covered: "covered";
                }>;
                pages: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>>;
        }, z.core.$strict>;
        decision: z.ZodObject<{
            requestId: z.ZodString;
            planVersion: z.ZodNumber;
        }, z.core.$strict>;
        referent: z.ZodObject<{
            personRef: z.ZodString;
            entryVersion: z.ZodNumber;
        }, z.core.$strict>;
        notebookPages: z.ZodArray<z.ZodObject<{
            slug: z.ZodString;
            version: z.ZodNumber;
        }, z.core.$strict>>;
        reconciliation: z.ZodDiscriminatedUnion<[z.ZodObject<{
            outcome: z.ZodLiteral<"agrees">;
        }, z.core.$strict>, z.ZodObject<{
            outcome: z.ZodLiteral<"conflict">;
            conflicts: z.ZodArray<z.ZodObject<{
                source: z.ZodEnum<{
                    decision: "decision";
                    referent: "referent";
                    plan_section: "plan_section";
                    notebook_page: "notebook_page";
                }>;
                ref: z.ZodString;
                reason: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>, z.ZodObject<{
            outcome: z.ZodLiteral<"missing">;
            missing: z.ZodArray<z.ZodObject<{
                source: z.ZodEnum<{
                    decision: "decision";
                    referent: "referent";
                    plan_section: "plan_section";
                    notebook_page: "notebook_page";
                }>;
                ref: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>], "outcome">;
        reconciledAt: z.ZodISODateTime;
        /** Service-owned: filled from the unit configuration, never from model input; absent in mandates saved before 1.173.0. */
        workplace: z.ZodOptional<z.ZodObject<{
            repository: z.ZodObject<{
                host: z.ZodEnum<{
                    bitbucket: "bitbucket";
                    github: "github";
                }>;
                repo: z.ZodString;
            }, z.core.$strict>;
            folder: z.ZodOptional<z.ZodString>;
            sessionBoard: z.ZodOptional<z.ZodObject<{
                repo: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        /** Service-owned: filled from the unit configuration, never from model input; absent in mandates saved before 1.173.0. */
        workMode: z.ZodOptional<z.ZodObject<{
            executor: z.ZodEnum<{
                agent: "agent";
                night: "night";
                dev_session: "dev_session";
            }>;
            allowedTools: z.ZodArray<z.ZodString>;
            excludedTools: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    eventId: z.ZodString;
    at: z.ZodISODateTime;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"blocked">;
    reason: z.ZodEnum<{
        conflict: "conflict";
        referent_superseded: "referent_superseded";
        missing: "missing";
    }>;
    eventId: z.ZodString;
    at: z.ZodISODateTime;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"question_opened">;
    referent: z.ZodObject<{
        personRef: z.ZodString;
        entryVersion: z.ZodNumber;
    }, z.core.$strict>;
    requestId: z.ZodString;
    to: z.ZodEmail;
    eventId: z.ZodString;
    at: z.ZodISODateTime;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"email_sent">;
    providerMessageId: z.ZodString;
    requestId: z.ZodString;
    to: z.ZodEmail;
    eventId: z.ZodString;
    at: z.ZodISODateTime;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"email_failed">;
    error: z.ZodString;
    requestId: z.ZodString;
    to: z.ZodEmail;
    eventId: z.ZodString;
    at: z.ZodISODateTime;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"issue_opened">;
    issueRef: z.ZodString;
    eventId: z.ZodString;
    at: z.ZodISODateTime;
}, z.core.$strict>], "kind">;
export type MandateAttemptEvent = z.infer<typeof MandateAttemptEventSchema>;
/** Ordered events of one scoped attempt; persistence owns event replay detection. */
export declare const MandateAttemptObservationSchema: z.ZodObject<{
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
    events: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"reconciled">;
        mandate: z.ZodObject<{
            tenantId: z.ZodString;
            organizationId: z.ZodString;
            clientId: z.ZodString;
            projectId: z.ZodString;
            planSection: z.ZodObject<{
                planId: z.ZodString;
                planVersion: z.ZodNumber;
                planDigest: z.ZodString;
                businessUnit: z.ZodObject<{
                    buSlug: z.ZodString;
                    typeId: z.ZodEnum<{
                        dati: "dati";
                        design: "design";
                        sviluppo: "sviluppo";
                        finanza: "finanza";
                        marketing: "marketing";
                    }>;
                    mandate: z.ZodString;
                    competencies: z.ZodArray<z.ZodString>;
                    lead: z.ZodObject<{
                        role: z.ZodLiteral<"capo-bu">;
                    }, z.core.$strict>;
                    reviewer: z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
                        buSlug: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        role: z.ZodLiteral<"director">;
                    }, z.core.$strict>]>>;
                    executor: z.ZodEnum<{
                        agent: "agent";
                        night: "night";
                        dev_session: "dev_session";
                    }>;
                    referent: z.ZodObject<{
                        personRef: z.ZodString;
                        entryVersion: z.ZodNumber;
                    }, z.core.$strict>;
                    firstActivities: z.ZodArray<z.ZodString>;
                    sections: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        title: z.ZodString;
                        expectedGoal: z.ZodString;
                        deliveryCriteria: z.ZodArray<z.ZodString>;
                        milestone: z.ZodNumber;
                        needsFrom: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            buSlug: z.ZodString;
                            what: z.ZodString;
                        }, z.core.$strict>>>;
                    }, z.core.$strict>>>;
                    roleAgents: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        role: z.ZodString;
                        competencies: z.ZodArray<z.ZodString>;
                    }, z.core.$strict>>>;
                    start: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"now">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"planned">;
                        unlockedBy: z.ZodObject<{
                            milestone: z.ZodNumber;
                            delivery: z.ZodString;
                        }, z.core.$strict>;
                    }, z.core.$strict>], "kind">;
                    gapRule: z.ZodOptional<z.ZodEnum<{
                        mark_and_proceed: "mark_and_proceed";
                        stop_and_ask: "stop_and_ask";
                    }>>;
                    signOffs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        key: z.ZodString;
                        signer: z.ZodEnum<{
                            owner: "owner";
                            director: "director";
                            referent: "referent";
                        }>;
                        form: z.ZodLiteral<"decision_request">;
                    }, z.core.$strict>>>;
                }, z.core.$strict>;
                /** The whole project's objective (plan part 1 and objectiveTree.project). Absent in mandates saved before 1.129.0. */
                project: z.ZodOptional<z.ZodObject<{
                    objective: z.ZodObject<{
                        request: z.ZodString;
                        expectedResult: z.ZodString;
                        measure: z.ZodString;
                    }, z.core.$strict>;
                    objectiveTree: z.ZodObject<{
                        project: z.ZodObject<{
                            expectedResult: z.ZodString;
                            deliveryCriteria: z.ZodArray<z.ZodString>;
                        }, z.core.$strict>;
                    }, z.core.$strict>;
                }, z.core.$strict>>;
                /** This unit's entry of objectiveTree.businessUnits. */
                unitObjective: z.ZodOptional<z.ZodObject<{
                    buSlug: z.ZodString;
                    expectedResult: z.ZodString;
                    deliveryCriteria: z.ZodArray<z.ZodString>;
                    indicators: z.ZodArray<z.ZodObject<{
                        name: z.ZodString;
                        source: z.ZodString;
                    }, z.core.$strict>>;
                }, z.core.$strict>>;
                deliveryShape: z.ZodOptional<z.ZodEnum<{
                    product: "product";
                    study: "study";
                }>>;
                /** The whole project breakdown (product plans): the unit sees its items and where they sit. */
                workBreakdown: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    parentId: z.ZodOptional<z.ZodString>;
                    title: z.ZodString;
                    expectedGoal: z.ZodString;
                    deliveryCriteria: z.ZodArray<z.ZodString>;
                    milestone: z.ZodNumber;
                    owners: z.ZodArray<z.ZodObject<{
                        buSlug: z.ZodString;
                        does: z.ZodString;
                    }, z.core.$strict>>;
                }, z.core.$strict>>>;
                /** The deliveries to or from this unit, as the plan writes them. Absent in mandates saved before 1.174.0. */
                exchanges: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    fromBu: z.ZodString;
                    toBu: z.ZodString;
                    what: z.ZodString;
                    format: z.ZodString;
                    key: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>>;
                /** The plan's open questions and to whom they go. Absent in mandates saved before 1.174.0. */
                questions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    question: z.ZodString;
                    unlocks: z.ZodString;
                    askTo: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"referent">;
                        personRef: z.ZodString;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"owner">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"director">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"business_unit">;
                        buSlug: z.ZodString;
                    }, z.core.$strict>], "kind">>;
                }, z.core.$strict>>>;
                /** How the dossier covers the topics the plan depends on. Absent in mandates saved before 1.174.0. */
                sourceCoverage: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    topic: z.ZodString;
                    status: z.ZodEnum<{
                        partial: "partial";
                        missing: "missing";
                        covered: "covered";
                    }>;
                    pages: z.ZodArray<z.ZodString>;
                }, z.core.$strict>>>;
            }, z.core.$strict>;
            decision: z.ZodObject<{
                requestId: z.ZodString;
                planVersion: z.ZodNumber;
            }, z.core.$strict>;
            referent: z.ZodObject<{
                personRef: z.ZodString;
                entryVersion: z.ZodNumber;
            }, z.core.$strict>;
            notebookPages: z.ZodArray<z.ZodObject<{
                slug: z.ZodString;
                version: z.ZodNumber;
            }, z.core.$strict>>;
            reconciliation: z.ZodDiscriminatedUnion<[z.ZodObject<{
                outcome: z.ZodLiteral<"agrees">;
            }, z.core.$strict>, z.ZodObject<{
                outcome: z.ZodLiteral<"conflict">;
                conflicts: z.ZodArray<z.ZodObject<{
                    source: z.ZodEnum<{
                        decision: "decision";
                        referent: "referent";
                        plan_section: "plan_section";
                        notebook_page: "notebook_page";
                    }>;
                    ref: z.ZodString;
                    reason: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodObject<{
                outcome: z.ZodLiteral<"missing">;
                missing: z.ZodArray<z.ZodObject<{
                    source: z.ZodEnum<{
                        decision: "decision";
                        referent: "referent";
                        plan_section: "plan_section";
                        notebook_page: "notebook_page";
                    }>;
                    ref: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>], "outcome">;
            reconciledAt: z.ZodISODateTime;
            /** Service-owned: filled from the unit configuration, never from model input; absent in mandates saved before 1.173.0. */
            workplace: z.ZodOptional<z.ZodObject<{
                repository: z.ZodObject<{
                    host: z.ZodEnum<{
                        bitbucket: "bitbucket";
                        github: "github";
                    }>;
                    repo: z.ZodString;
                }, z.core.$strict>;
                folder: z.ZodOptional<z.ZodString>;
                sessionBoard: z.ZodOptional<z.ZodObject<{
                    repo: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
            /** Service-owned: filled from the unit configuration, never from model input; absent in mandates saved before 1.173.0. */
            workMode: z.ZodOptional<z.ZodObject<{
                executor: z.ZodEnum<{
                    agent: "agent";
                    night: "night";
                    dev_session: "dev_session";
                }>;
                allowedTools: z.ZodArray<z.ZodString>;
                excludedTools: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        eventId: z.ZodString;
        at: z.ZodISODateTime;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"blocked">;
        reason: z.ZodEnum<{
            conflict: "conflict";
            referent_superseded: "referent_superseded";
            missing: "missing";
        }>;
        eventId: z.ZodString;
        at: z.ZodISODateTime;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"question_opened">;
        referent: z.ZodObject<{
            personRef: z.ZodString;
            entryVersion: z.ZodNumber;
        }, z.core.$strict>;
        requestId: z.ZodString;
        to: z.ZodEmail;
        eventId: z.ZodString;
        at: z.ZodISODateTime;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"email_sent">;
        providerMessageId: z.ZodString;
        requestId: z.ZodString;
        to: z.ZodEmail;
        eventId: z.ZodString;
        at: z.ZodISODateTime;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"email_failed">;
        error: z.ZodString;
        requestId: z.ZodString;
        to: z.ZodEmail;
        eventId: z.ZodString;
        at: z.ZodISODateTime;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"issue_opened">;
        issueRef: z.ZodString;
        eventId: z.ZodString;
        at: z.ZodISODateTime;
    }, z.core.$strict>], "kind">>;
}, z.core.$strict>;
export type MandateAttemptObservation = z.infer<typeof MandateAttemptObservationSchema>;
//# sourceMappingURL=business-unit-mandate.d.ts.map