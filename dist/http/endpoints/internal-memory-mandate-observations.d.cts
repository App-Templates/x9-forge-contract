import { z } from 'zod';
export declare const INTERNAL_MEMORY_MANDATE_OBSERVATION_PATH: "/internal/memory/mandate-observations/:observationId";
export declare const INTERNAL_MEMORY_MANDATE_OBSERVATION_EVENTS_PATH: "/internal/memory/mandate-observations/:observationId/events";
export declare const InternalMemoryMandateObservationParamsSchema: z.ZodObject<{
    observationId: z.ZodString;
}, z.core.$strict>;
export type InternalMemoryMandateObservationParams = z.infer<typeof InternalMemoryMandateObservationParamsSchema>;
export declare const InternalMemoryMandateObservationQuerySchema: z.ZodObject<{
    tenantId: z.ZodString;
    clientId: z.ZodString;
    agentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
}, z.core.$strict>;
export type InternalMemoryMandateObservationQuery = z.infer<typeof InternalMemoryMandateObservationQuerySchema>;
export declare const InternalMemoryMandateObservationEventWriteRequestSchema: z.ZodObject<{
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
    event: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
                }, z.core.$strict>;
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
        }, z.core.$strict>;
        eventId: z.ZodString;
        at: z.ZodISODateTime;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"blocked">;
        reason: z.ZodEnum<{
            conflict: "conflict";
            missing: "missing";
            referent_superseded: "referent_superseded";
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
}, z.core.$strict>;
export type InternalMemoryMandateObservationEventWriteRequest = z.infer<typeof InternalMemoryMandateObservationEventWriteRequestSchema>;
export declare const InternalMemoryMandateObservationReadResponseSchema: z.ZodObject<{
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
                    }, z.core.$strict>;
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
            }, z.core.$strict>;
            eventId: z.ZodString;
            at: z.ZodISODateTime;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"blocked">;
            reason: z.ZodEnum<{
                conflict: "conflict";
                missing: "missing";
                referent_superseded: "referent_superseded";
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
}, z.core.$strict>;
export type InternalMemoryMandateObservationReadResponse = z.infer<typeof InternalMemoryMandateObservationReadResponseSchema>;
export declare const InternalMemoryMandateObservationEventWriteResponseSchema: z.ZodObject<{
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
                    }, z.core.$strict>;
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
            }, z.core.$strict>;
            eventId: z.ZodString;
            at: z.ZodISODateTime;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"blocked">;
            reason: z.ZodEnum<{
                conflict: "conflict";
                missing: "missing";
                referent_superseded: "referent_superseded";
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
    replayed: z.ZodBoolean;
}, z.core.$strict>;
export type InternalMemoryMandateObservationEventWriteResponse = z.infer<typeof InternalMemoryMandateObservationEventWriteResponseSchema>;
export declare const MandateObservationErrorCodeSchema: z.ZodEnum<{
    mandate_observation_conflict: "mandate_observation_conflict";
    mandate_observation_not_found: "mandate_observation_not_found";
    mandate_observation_out_of_order: "mandate_observation_out_of_order";
}>;
export type MandateObservationErrorCode = z.infer<typeof MandateObservationErrorCodeSchema>;
export declare const MandateObservationErrorResponseSchema: z.ZodObject<{
    code: z.ZodEnum<{
        mandate_observation_conflict: "mandate_observation_conflict";
        mandate_observation_not_found: "mandate_observation_not_found";
        mandate_observation_out_of_order: "mandate_observation_out_of_order";
    }>;
    message: z.ZodString;
}, z.core.$strict>;
export type MandateObservationErrorResponse = z.infer<typeof MandateObservationErrorResponseSchema>;
/**
 * Read: 200 with the observation; 404 mandate_observation_not_found for a missing
 * observation or a different tenant/client/agent. The service must validate the
 * authenticated scope before returning data; query parameters authorize nobody.
 */
export declare const internalMemoryMandateObservationReadContract: {
    readonly method: "GET";
    readonly path: "/internal/memory/mandate-observations/:observationId";
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
                        }, z.core.$strict>;
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
                }, z.core.$strict>;
                eventId: z.ZodString;
                at: z.ZodISODateTime;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"blocked">;
                reason: z.ZodEnum<{
                    conflict: "conflict";
                    missing: "missing";
                    referent_superseded: "referent_superseded";
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
    }, z.core.$strict>;
};
/**
 * Append: 201 for a new event (replayed: false), 200 for the same eventId and
 * identical content (replayed: true); 409 mandate_observation_conflict for
 * different content or scope, 409 mandate_observation_out_of_order for an invalid
 * sequence. A different tenant/client/agent returns 404 mandate_observation_not_found.
 * The service must validate authenticated scope and stored scope before appending.
 */
export declare const internalMemoryMandateObservationEventWriteContract: {
    readonly method: "POST";
    readonly path: "/internal/memory/mandate-observations/:observationId/events";
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
        event: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
                    }, z.core.$strict>;
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
            }, z.core.$strict>;
            eventId: z.ZodString;
            at: z.ZodISODateTime;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"blocked">;
            reason: z.ZodEnum<{
                conflict: "conflict";
                missing: "missing";
                referent_superseded: "referent_superseded";
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
                        }, z.core.$strict>;
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
                }, z.core.$strict>;
                eventId: z.ZodString;
                at: z.ZodISODateTime;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"blocked">;
                reason: z.ZodEnum<{
                    conflict: "conflict";
                    missing: "missing";
                    referent_superseded: "referent_superseded";
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
        replayed: z.ZodBoolean;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-memory-mandate-observations.d.ts.map