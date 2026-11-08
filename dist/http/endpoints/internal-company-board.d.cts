import { z } from 'zod';
/**
 * Read contracts of the company board (1.113.0). All GET, internal secret only:
 * the reader (agent-core) has already recognised the company.
 */
export declare const INTERNAL_MEMORY_COMPANY_BOARD_SOURCES_PATH: "/internal/memory/company-board-sources";
export declare const INTERNAL_PAPERCLIP_COMPANY_BOARD_PATH: "/internal/paperclip/company-board";
export declare const INTERNAL_MEMORY_COMPANY_BOARD_PROJECTS_PATH: "/internal/memory/company-board-projects";
export declare const INTERNAL_DEV_PROJECT_SESSIONS_PATH: "/internal/dev/project-sessions";
export declare const INTERNAL_COMPANY_BOARD_COMPANIES_PATH: "/internal/company-board/companies";
export declare const INTERNAL_COMPANY_BOARD_OVERVIEW_PATH: "/internal/company-board/overview";
export declare const INTERNAL_COMPANY_BOARD_PROJECT_PATH: "/internal/company-board/project";
/** Errors shared by the composed reads (4-6). */
export declare const COMPANY_BOARD_READ_ERRORS: readonly ["identity_uncertain", "not_owner", "not_director", "source_unavailable"];
export declare const CompanyBoardReadErrorSchema: z.ZodEnum<{
    source_unavailable: "source_unavailable";
    identity_uncertain: "identity_uncertain";
    not_owner: "not_owner";
    not_director: "not_director";
}>;
export type CompanyBoardReadError = z.infer<typeof CompanyBoardReadErrorSchema>;
export declare const InternalMemoryCompanyBoardSourcesQuerySchema: z.ZodObject<{
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    clientId: z.ZodString;
    projectId: z.ZodString;
}, z.core.$strict>;
export type InternalMemoryCompanyBoardSourcesQuery = z.infer<typeof InternalMemoryCompanyBoardSourcesQuerySchema>;
export declare const InternalMemoryCompanyBoardSourcesResponseSchema: z.ZodObject<{
    plan: z.ZodNullable<z.ZodObject<{
        planId: z.ZodString;
        version: z.ZodNumber;
        digest: z.ZodString;
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        clientId: z.ZodString;
        projectId: z.ZodString;
        objective: z.ZodObject<{
            request: z.ZodString;
            expectedResult: z.ZodString;
            measure: z.ZodString;
        }, z.core.$strict>;
        analysis: z.ZodObject<{
            startingPoint: z.ZodString;
            marketAndAlternatives: z.ZodObject<{
                text: z.ZodString;
                sources: z.ZodArray<z.ZodURL>;
            }, z.core.$strict>;
            recommendedMethod: z.ZodObject<{
                method: z.ZodString;
                why: z.ZodString;
            }, z.core.$strict>;
        }, z.core.$strict>;
        strategy: z.ZodObject<{
            approach: z.ZodString;
            choices: z.ZodArray<z.ZodString>;
            discardedAlternatives: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
        objectiveTree: z.ZodObject<{
            project: z.ZodObject<{
                expectedResult: z.ZodString;
                deliveryCriteria: z.ZodArray<z.ZodString>;
            }, z.core.$strict>;
            businessUnits: z.ZodArray<z.ZodObject<{
                buSlug: z.ZodString;
                expectedResult: z.ZodString;
                deliveryCriteria: z.ZodArray<z.ZodString>;
                indicators: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    source: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        milestones: z.ZodArray<z.ZodObject<{
            number: z.ZodNumber;
            delivery: z.ZodString;
            buSlug: z.ZodString;
            dueDate: z.ZodOptional<z.ZodISODate>;
            closeCriterion: z.ZodString;
            blockedBy: z.ZodArray<z.ZodNumber>;
        }, z.core.$strict>>;
        criticalPath: z.ZodArray<z.ZodNumber>;
        businessUnits: z.ZodArray<z.ZodObject<{
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
        }, z.core.$strict>>;
        exchanges: z.ZodArray<z.ZodObject<{
            fromBu: z.ZodString;
            toBu: z.ZodString;
            what: z.ZodString;
            format: z.ZodString;
        }, z.core.$strict>>;
        budget: z.ZodObject<{
            currency: z.ZodString;
            total: z.ZodNumber;
            perBu: z.ZodArray<z.ZodObject<{
                buSlug: z.ZodString;
                cap: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        risks: z.ZodArray<z.ZodString>;
        assumptions: z.ZodArray<z.ZodString>;
        missingMaterials: z.ZodArray<z.ZodObject<{
            what: z.ZodString;
            kind: z.ZodEnum<{
                access: "access";
                asset: "asset";
                data: "data";
            }>;
            owner: z.ZodOptional<z.ZodString>;
            blocks: z.ZodOptional<z.ZodObject<{
                buSlug: z.ZodString;
                milestone: z.ZodNumber;
            }, z.core.$strict>>;
            neededBy: z.ZodOptional<z.ZodISODate>;
        }, z.core.$strict>>;
        questions: z.ZodArray<z.ZodObject<{
            question: z.ZodString;
            unlocks: z.ZodString;
        }, z.core.$strict>>;
        ifApproved: z.ZodObject<{
            startNow: z.ZodArray<z.ZodString>;
            startLater: z.ZodArray<z.ZodObject<{
                buSlug: z.ZodString;
                after: z.ZodString;
            }, z.core.$strict>>;
            verticalPlanDueBy: z.ZodArray<z.ZodObject<{
                buSlug: z.ZodString;
                dueDate: z.ZodISODate;
            }, z.core.$strict>>;
            updates: z.ZodObject<{
                how: z.ZodString;
                every: z.ZodString;
            }, z.core.$strict>;
        }, z.core.$strict>;
        opportunities: z.ZodOptional<z.ZodArray<z.ZodString>>;
        referentProposals: z.ZodOptional<z.ZodArray<z.ZodObject<{
            personRef: z.ZodString;
            name: z.ZodString;
            role: z.ZodString;
            email: z.ZodEmail;
            level: z.ZodEnum<{
                client: "client";
                project: "project";
                business_unit: "business_unit";
            }>;
            buSlug: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>>;
    }, z.core.$strict>>;
    /** Units of the previous plan version, for «Piano v3 approvato il …: tolti …». */
    previousPlanUnits: z.ZodNullable<z.ZodArray<z.ZodString>>;
    decisions: z.ZodArray<z.ZodObject<{
        request: z.ZodObject<{
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
            }, z.core.$strict>], "kind">>;
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
        outcome: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
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
        }, z.core.$strict>], "outcome">>;
        mailSubject: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>>;
    assets: z.ZodArray<z.ZodObject<{
        assetId: z.ZodString;
        buSlug: z.ZodNullable<z.ZodString>;
        kind: z.ZodString;
        title: z.ZodString;
        createdAt: z.ZodISODateTime;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type InternalMemoryCompanyBoardSourcesResponse = z.infer<typeof InternalMemoryCompanyBoardSourcesResponseSchema>;
export declare const internalMemoryCompanyBoardSourcesContract: {
    readonly method: "GET";
    readonly path: "/internal/memory/company-board-sources";
    readonly authType: "secret";
    readonly querySchema: z.ZodObject<{
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        clientId: z.ZodString;
        projectId: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        plan: z.ZodNullable<z.ZodObject<{
            planId: z.ZodString;
            version: z.ZodNumber;
            digest: z.ZodString;
            tenantId: z.ZodString;
            organizationId: z.ZodString;
            clientId: z.ZodString;
            projectId: z.ZodString;
            objective: z.ZodObject<{
                request: z.ZodString;
                expectedResult: z.ZodString;
                measure: z.ZodString;
            }, z.core.$strict>;
            analysis: z.ZodObject<{
                startingPoint: z.ZodString;
                marketAndAlternatives: z.ZodObject<{
                    text: z.ZodString;
                    sources: z.ZodArray<z.ZodURL>;
                }, z.core.$strict>;
                recommendedMethod: z.ZodObject<{
                    method: z.ZodString;
                    why: z.ZodString;
                }, z.core.$strict>;
            }, z.core.$strict>;
            strategy: z.ZodObject<{
                approach: z.ZodString;
                choices: z.ZodArray<z.ZodString>;
                discardedAlternatives: z.ZodArray<z.ZodString>;
            }, z.core.$strict>;
            objectiveTree: z.ZodObject<{
                project: z.ZodObject<{
                    expectedResult: z.ZodString;
                    deliveryCriteria: z.ZodArray<z.ZodString>;
                }, z.core.$strict>;
                businessUnits: z.ZodArray<z.ZodObject<{
                    buSlug: z.ZodString;
                    expectedResult: z.ZodString;
                    deliveryCriteria: z.ZodArray<z.ZodString>;
                    indicators: z.ZodArray<z.ZodObject<{
                        name: z.ZodString;
                        source: z.ZodString;
                    }, z.core.$strict>>;
                }, z.core.$strict>>;
            }, z.core.$strict>;
            milestones: z.ZodArray<z.ZodObject<{
                number: z.ZodNumber;
                delivery: z.ZodString;
                buSlug: z.ZodString;
                dueDate: z.ZodOptional<z.ZodISODate>;
                closeCriterion: z.ZodString;
                blockedBy: z.ZodArray<z.ZodNumber>;
            }, z.core.$strict>>;
            criticalPath: z.ZodArray<z.ZodNumber>;
            businessUnits: z.ZodArray<z.ZodObject<{
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
            }, z.core.$strict>>;
            exchanges: z.ZodArray<z.ZodObject<{
                fromBu: z.ZodString;
                toBu: z.ZodString;
                what: z.ZodString;
                format: z.ZodString;
            }, z.core.$strict>>;
            budget: z.ZodObject<{
                currency: z.ZodString;
                total: z.ZodNumber;
                perBu: z.ZodArray<z.ZodObject<{
                    buSlug: z.ZodString;
                    cap: z.ZodNumber;
                }, z.core.$strict>>;
            }, z.core.$strict>;
            risks: z.ZodArray<z.ZodString>;
            assumptions: z.ZodArray<z.ZodString>;
            missingMaterials: z.ZodArray<z.ZodObject<{
                what: z.ZodString;
                kind: z.ZodEnum<{
                    access: "access";
                    asset: "asset";
                    data: "data";
                }>;
                owner: z.ZodOptional<z.ZodString>;
                blocks: z.ZodOptional<z.ZodObject<{
                    buSlug: z.ZodString;
                    milestone: z.ZodNumber;
                }, z.core.$strict>>;
                neededBy: z.ZodOptional<z.ZodISODate>;
            }, z.core.$strict>>;
            questions: z.ZodArray<z.ZodObject<{
                question: z.ZodString;
                unlocks: z.ZodString;
            }, z.core.$strict>>;
            ifApproved: z.ZodObject<{
                startNow: z.ZodArray<z.ZodString>;
                startLater: z.ZodArray<z.ZodObject<{
                    buSlug: z.ZodString;
                    after: z.ZodString;
                }, z.core.$strict>>;
                verticalPlanDueBy: z.ZodArray<z.ZodObject<{
                    buSlug: z.ZodString;
                    dueDate: z.ZodISODate;
                }, z.core.$strict>>;
                updates: z.ZodObject<{
                    how: z.ZodString;
                    every: z.ZodString;
                }, z.core.$strict>;
            }, z.core.$strict>;
            opportunities: z.ZodOptional<z.ZodArray<z.ZodString>>;
            referentProposals: z.ZodOptional<z.ZodArray<z.ZodObject<{
                personRef: z.ZodString;
                name: z.ZodString;
                role: z.ZodString;
                email: z.ZodEmail;
                level: z.ZodEnum<{
                    client: "client";
                    project: "project";
                    business_unit: "business_unit";
                }>;
                buSlug: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>>;
        }, z.core.$strict>>;
        /** Units of the previous plan version, for «Piano v3 approvato il …: tolti …». */
        previousPlanUnits: z.ZodNullable<z.ZodArray<z.ZodString>>;
        decisions: z.ZodArray<z.ZodObject<{
            request: z.ZodObject<{
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
                }, z.core.$strict>], "kind">>;
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
            outcome: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
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
            }, z.core.$strict>], "outcome">>;
            mailSubject: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>>;
        assets: z.ZodArray<z.ZodObject<{
            assetId: z.ZodString;
            buSlug: z.ZodNullable<z.ZodString>;
            kind: z.ZodString;
            title: z.ZodString;
            createdAt: z.ZodISODateTime;
        }, z.core.$strict>>;
    }, z.core.$strict>;
};
export declare const PAPERCLIP_BOARD_AGENT_STATUSES: readonly ["active", "paused", "idle", "running", "error", "pending_approval", "terminated"];
export declare const PaperclipBoardAgentStatusSchema: z.ZodEnum<{
    error: "error";
    active: "active";
    paused: "paused";
    running: "running";
    idle: "idle";
    pending_approval: "pending_approval";
    terminated: "terminated";
}>;
export declare const PAPERCLIP_BOARD_ISSUE_STATUSES: readonly ["backlog", "todo", "in_progress", "in_review", "blocked", "done", "cancelled"];
export declare const PaperclipBoardIssueStatusSchema: z.ZodEnum<{
    cancelled: "cancelled";
    done: "done";
    blocked: "blocked";
    backlog: "backlog";
    todo: "todo";
    in_progress: "in_progress";
    in_review: "in_review";
}>;
export declare const PAPERCLIP_BOARD_PAUSE_REASONS: readonly ["manual", "budget", "system"];
export declare const PaperclipBoardPauseReasonSchema: z.ZodEnum<{
    system: "system";
    budget: "budget";
    manual: "manual";
}>;
export declare const PAPERCLIP_BOARD_RUN_STATUSES: readonly ["queued", "running", "succeeded", "failed", "error", "timed_out", "cancelled"];
export declare const PaperclipBoardRunStatusSchema: z.ZodEnum<{
    error: "error";
    succeeded: "succeeded";
    failed: "failed";
    cancelled: "cancelled";
    queued: "queued";
    running: "running";
    timed_out: "timed_out";
}>;
export declare const PAPERCLIP_BOARD_OWNER_PERSON: readonly ["collegata", "mancante", "non_nota"];
export declare const PaperclipBoardOwnerPersonSchema: z.ZodEnum<{
    non_nota: "non_nota";
    collegata: "collegata";
    mancante: "mancante";
}>;
export declare const InternalPaperclipCompanyBoardQuerySchema: z.ZodObject<{
    organizationId: z.ZodString;
    projectId: z.ZodOptional<z.ZodString>;
    /** `true` on the project page: adds `blockedSince` and `replies`. */
    detail: z.ZodOptional<z.ZodPipe<z.ZodEnum<{
        true: "true";
        false: "false";
    }>, z.ZodTransform<boolean, "true" | "false">>>;
    /** With it cap-paperclip checks the owner's person in Paperclip and fills `pausedByOwner`. */
    ownerId: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "OwnerId", "out">>;
}, z.core.$strict>;
export type InternalPaperclipCompanyBoardQuery = z.infer<typeof InternalPaperclipCompanyBoardQuerySchema>;
export declare const InternalPaperclipCompanyBoardResponseSchema: z.ZodObject<{
    agents: z.ZodArray<z.ZodObject<{
        paperclipAgentId: z.ZodUUID;
        buSlug: z.ZodNullable<z.ZodString>;
        role: z.ZodString;
        status: z.ZodEnum<{
            error: "error";
            active: "active";
            paused: "paused";
            running: "running";
            idle: "idle";
            pending_approval: "pending_approval";
            terminated: "terminated";
        }>;
        pauseReason: z.ZodNullable<z.ZodEnum<{
            system: "system";
            budget: "budget";
            manual: "manual";
        }>>;
        pausedAt: z.ZodNullable<z.ZodISODateTime>;
        pausedByOwner: z.ZodNullable<z.ZodBoolean>;
        projectCount: z.ZodNumber;
        recentRuns: z.ZodArray<z.ZodObject<{
            status: z.ZodEnum<{
                error: "error";
                succeeded: "succeeded";
                failed: "failed";
                cancelled: "cancelled";
                queued: "queued";
                running: "running";
                timed_out: "timed_out";
            }>;
            errorCode: z.ZodNullable<z.ZodString>;
            at: z.ZodISODateTime;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    issues: z.ZodArray<z.ZodObject<{
        issueId: z.ZodString;
        identifier: z.ZodString;
        title: z.ZodString;
        status: z.ZodEnum<{
            cancelled: "cancelled";
            done: "done";
            blocked: "blocked";
            backlog: "backlog";
            todo: "todo";
            in_progress: "in_progress";
            in_review: "in_review";
        }>;
        parentId: z.ZodNullable<z.ZodString>;
        /** Project of the issue, same id as `projects[].projectId`; null when the issue has none. */
        projectId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        assigneeAgentId: z.ZodNullable<z.ZodUUID>;
        blockedBy: z.ZodArray<z.ZodString>;
        approvalMark: z.ZodNullable<z.ZodString>;
        updatedAt: z.ZodISODateTime;
        startedAt: z.ZodNullable<z.ZodISODateTime>;
        completedAt: z.ZodNullable<z.ZodISODateTime>;
        /** Only with `detail=true`. */
        blockedSince: z.ZodOptional<z.ZodNullable<z.ZodISODateTime>>;
        /** Only with `detail=true`. */
        replies: z.ZodOptional<z.ZodArray<z.ZodObject<{
            at: z.ZodISODateTime;
        }, z.core.$strict>>>;
        lastComment: z.ZodNullable<z.ZodObject<{
            at: z.ZodISODateTime;
            excerpt: z.ZodString;
            byAgent: z.ZodBoolean;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    /** X9 projects that have a project in Paperclip (for projects without a plan). */
    projects: z.ZodArray<z.ZodObject<{
        projectId: z.ZodString;
    }, z.core.$strict>>;
    truncated: z.ZodBoolean;
    ownerPerson: z.ZodEnum<{
        non_nota: "non_nota";
        collegata: "collegata";
        mancante: "mancante";
    }>;
}, z.core.$strict>;
export type InternalPaperclipCompanyBoardResponse = z.infer<typeof InternalPaperclipCompanyBoardResponseSchema>;
export declare const internalPaperclipCompanyBoardContract: {
    readonly method: "GET";
    readonly path: "/internal/paperclip/company-board";
    readonly authType: "secret";
    readonly querySchema: z.ZodObject<{
        organizationId: z.ZodString;
        projectId: z.ZodOptional<z.ZodString>;
        /** `true` on the project page: adds `blockedSince` and `replies`. */
        detail: z.ZodOptional<z.ZodPipe<z.ZodEnum<{
            true: "true";
            false: "false";
        }>, z.ZodTransform<boolean, "true" | "false">>>;
        /** With it cap-paperclip checks the owner's person in Paperclip and fills `pausedByOwner`. */
        ownerId: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "OwnerId", "out">>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        agents: z.ZodArray<z.ZodObject<{
            paperclipAgentId: z.ZodUUID;
            buSlug: z.ZodNullable<z.ZodString>;
            role: z.ZodString;
            status: z.ZodEnum<{
                error: "error";
                active: "active";
                paused: "paused";
                running: "running";
                idle: "idle";
                pending_approval: "pending_approval";
                terminated: "terminated";
            }>;
            pauseReason: z.ZodNullable<z.ZodEnum<{
                system: "system";
                budget: "budget";
                manual: "manual";
            }>>;
            pausedAt: z.ZodNullable<z.ZodISODateTime>;
            pausedByOwner: z.ZodNullable<z.ZodBoolean>;
            projectCount: z.ZodNumber;
            recentRuns: z.ZodArray<z.ZodObject<{
                status: z.ZodEnum<{
                    error: "error";
                    succeeded: "succeeded";
                    failed: "failed";
                    cancelled: "cancelled";
                    queued: "queued";
                    running: "running";
                    timed_out: "timed_out";
                }>;
                errorCode: z.ZodNullable<z.ZodString>;
                at: z.ZodISODateTime;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        issues: z.ZodArray<z.ZodObject<{
            issueId: z.ZodString;
            identifier: z.ZodString;
            title: z.ZodString;
            status: z.ZodEnum<{
                cancelled: "cancelled";
                done: "done";
                blocked: "blocked";
                backlog: "backlog";
                todo: "todo";
                in_progress: "in_progress";
                in_review: "in_review";
            }>;
            parentId: z.ZodNullable<z.ZodString>;
            /** Project of the issue, same id as `projects[].projectId`; null when the issue has none. */
            projectId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            assigneeAgentId: z.ZodNullable<z.ZodUUID>;
            blockedBy: z.ZodArray<z.ZodString>;
            approvalMark: z.ZodNullable<z.ZodString>;
            updatedAt: z.ZodISODateTime;
            startedAt: z.ZodNullable<z.ZodISODateTime>;
            completedAt: z.ZodNullable<z.ZodISODateTime>;
            /** Only with `detail=true`. */
            blockedSince: z.ZodOptional<z.ZodNullable<z.ZodISODateTime>>;
            /** Only with `detail=true`. */
            replies: z.ZodOptional<z.ZodArray<z.ZodObject<{
                at: z.ZodISODateTime;
            }, z.core.$strict>>>;
            lastComment: z.ZodNullable<z.ZodObject<{
                at: z.ZodISODateTime;
                excerpt: z.ZodString;
                byAgent: z.ZodBoolean;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        /** X9 projects that have a project in Paperclip (for projects without a plan). */
        projects: z.ZodArray<z.ZodObject<{
            projectId: z.ZodString;
        }, z.core.$strict>>;
        truncated: z.ZodBoolean;
        ownerPerson: z.ZodEnum<{
            non_nota: "non_nota";
            collegata: "collegata";
            mancante: "mancante";
        }>;
    }, z.core.$strict>;
};
export declare const InternalMemoryCompanyBoardProjectsQuerySchema: z.ZodObject<{
    tenantId: z.ZodString;
    organizationId: z.ZodString;
}, z.core.$strict>;
export type InternalMemoryCompanyBoardProjectsQuery = z.infer<typeof InternalMemoryCompanyBoardProjectsQuerySchema>;
export declare const InternalMemoryCompanyBoardProjectsResponseSchema: z.ZodObject<{
    projects: z.ZodArray<z.ZodObject<{
        projectId: z.ZodString;
        clientId: z.ZodString;
        companyName: z.ZodNullable<z.ZodString>;
        projectName: z.ZodNullable<z.ZodString>;
        planVersion: z.ZodNumber;
        updatedAt: z.ZodISODateTime;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type InternalMemoryCompanyBoardProjectsResponse = z.infer<typeof InternalMemoryCompanyBoardProjectsResponseSchema>;
export declare const internalMemoryCompanyBoardProjectsContract: {
    readonly method: "GET";
    readonly path: "/internal/memory/company-board-projects";
    readonly authType: "secret";
    readonly querySchema: z.ZodObject<{
        tenantId: z.ZodString;
        organizationId: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        projects: z.ZodArray<z.ZodObject<{
            projectId: z.ZodString;
            clientId: z.ZodString;
            companyName: z.ZodNullable<z.ZodString>;
            projectName: z.ZodNullable<z.ZodString>;
            planVersion: z.ZodNumber;
            updatedAt: z.ZodISODateTime;
        }, z.core.$strict>>;
    }, z.core.$strict>;
};
/** States of cap-dev `board/stato.ts:4`. */
export declare const DEV_PROJECT_SESSION_STATES: readonly ["richiesta", "analisi", "report-pronto", "approvato", "in-lavorazione", "revisione", "chiuso", "scartato", "bloccato"];
export declare const DevProjectSessionStateSchema: z.ZodEnum<{
    richiesta: "richiesta";
    analisi: "analisi";
    "report-pronto": "report-pronto";
    approvato: "approvato";
    "in-lavorazione": "in-lavorazione";
    revisione: "revisione";
    chiuso: "chiuso";
    scartato: "scartato";
    bloccato: "bloccato";
}>;
export declare const InternalDevProjectSessionsQuerySchema: z.ZodObject<{
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    projectId: z.ZodString;
}, z.core.$strict>;
export type InternalDevProjectSessionsQuery = z.infer<typeof InternalDevProjectSessionsQuerySchema>;
export declare const InternalDevProjectSessionsResponseSchema: z.ZodObject<{
    units: z.ZodArray<z.ZodObject<{
        buSlug: z.ZodString;
        sessions: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            state: z.ZodEnum<{
                richiesta: "richiesta";
                analisi: "analisi";
                "report-pronto": "report-pronto";
                approvato: "approvato";
                "in-lavorazione": "in-lavorazione";
                revisione: "revisione";
                chiuso: "chiuso";
                scartato: "scartato";
                bloccato: "bloccato";
            }>;
            openedAt: z.ZodISODateTime;
            updatedAt: z.ZodISODateTime;
            closedAt: z.ZodNullable<z.ZodISODateTime>;
            computerName: z.ZodNullable<z.ZodString>;
            title: z.ZodNullable<z.ZodString>;
            scaletta: z.ZodOptional<z.ZodArray<z.ZodObject<{
                text: z.ZodString;
                done: z.ZodBoolean;
            }, z.core.$strict>>>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    unreadable: z.ZodNumber;
}, z.core.$strict>;
export type InternalDevProjectSessionsResponse = z.infer<typeof InternalDevProjectSessionsResponseSchema>;
export declare const internalDevProjectSessionsContract: {
    readonly method: "GET";
    readonly path: "/internal/dev/project-sessions";
    readonly authType: "secret";
    readonly querySchema: z.ZodObject<{
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        projectId: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        units: z.ZodArray<z.ZodObject<{
            buSlug: z.ZodString;
            sessions: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                state: z.ZodEnum<{
                    richiesta: "richiesta";
                    analisi: "analisi";
                    "report-pronto": "report-pronto";
                    approvato: "approvato";
                    "in-lavorazione": "in-lavorazione";
                    revisione: "revisione";
                    chiuso: "chiuso";
                    scartato: "scartato";
                    bloccato: "bloccato";
                }>;
                openedAt: z.ZodISODateTime;
                updatedAt: z.ZodISODateTime;
                closedAt: z.ZodNullable<z.ZodISODateTime>;
                computerName: z.ZodNullable<z.ZodString>;
                title: z.ZodNullable<z.ZodString>;
                scaletta: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    text: z.ZodString;
                    done: z.ZodBoolean;
                }, z.core.$strict>>>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        unreadable: z.ZodNumber;
    }, z.core.$strict>;
};
export declare const InternalCompanyBoardCompaniesQuerySchema: z.ZodObject<{
    tenantId: z.ZodString;
    ownerIds: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string[], string>>, z.ZodArray<z.core.$ZodBranded<z.ZodString, "OwnerId", "out">>>;
}, z.core.$strict>;
export type InternalCompanyBoardCompaniesQuery = z.infer<typeof InternalCompanyBoardCompaniesQuerySchema>;
export declare const internalCompanyBoardCompaniesContract: {
    readonly method: "GET";
    readonly path: "/internal/company-board/companies";
    readonly authType: "secret";
    readonly querySchema: z.ZodObject<{
        tenantId: z.ZodString;
        ownerIds: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string[], string>>, z.ZodArray<z.core.$ZodBranded<z.ZodString, "OwnerId", "out">>>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        companies: z.ZodArray<z.ZodObject<{
            directorAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            clientId: z.ZodString;
            name: z.ZodNullable<z.ZodString>;
            projects: z.ZodArray<z.ZodObject<{
                projectId: z.ZodString;
                name: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
};
export declare const InternalCompanyBoardOverviewQuerySchema: z.ZodObject<{
    tenantId: z.ZodString;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    directorAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
}, z.core.$strict>;
export type InternalCompanyBoardOverviewQuery = z.infer<typeof InternalCompanyBoardOverviewQuerySchema>;
export declare const internalCompanyBoardOverviewContract: {
    readonly method: "GET";
    readonly path: "/internal/company-board/overview";
    readonly authType: "secret";
    readonly querySchema: z.ZodObject<{
        tenantId: z.ZodString;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        directorAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        company: z.ZodObject<{
            clientId: z.ZodString;
            name: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        summary: z.ZodString;
        services: z.ZodArray<z.ZodObject<{
            role: z.ZodEnum<{
                director: "director";
                ricerca_sviluppo: "ricerca_sviluppo";
            }>;
            name: z.ZodString;
            stateLabel: z.ZodString;
            why: z.ZodString;
            since: z.ZodNullable<z.ZodISODateTime>;
            servingProjects: z.ZodArray<z.ZodObject<{
                projectId: z.ZodString;
                what: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        projects: z.ZodArray<z.ZodObject<{
            units: z.ZodArray<z.ZodObject<{
                state: z.ZodEnum<{
                    errore: "errore";
                    al_lavoro: "al_lavoro";
                    fermo: "fermo";
                    non_partito: "non_partito";
                    aspetta_referente: "aspetta_referente";
                    aspetta_proprietario: "aspetta_proprietario";
                    aspetta_director: "aspetta_director";
                    aspetta_reparto: "aspetta_reparto";
                    attesa_del_via: "attesa_del_via";
                    approvato_non_ripartito: "approvato_non_ripartito";
                    in_pausa: "in_pausa";
                    non_iniziato: "non_iniziato";
                    finito: "finito";
                    non_noto: "non_noto";
                }>;
                name: z.ZodString;
                actions: z.ZodObject<{
                    sveglia: z.ZodObject<{
                        available: z.ZodBoolean;
                        reason: z.ZodNullable<z.ZodString>;
                    }, z.core.$strict>;
                    via: z.ZodObject<{
                        available: z.ZodBoolean;
                        reason: z.ZodNullable<z.ZodString>;
                    }, z.core.$strict>;
                    ferma: z.ZodObject<{
                        available: z.ZodBoolean;
                        reason: z.ZodNullable<z.ZodString>;
                    }, z.core.$strict>;
                    riprendi: z.ZodObject<{
                        available: z.ZodBoolean;
                        reason: z.ZodNullable<z.ZodString>;
                    }, z.core.$strict>;
                }, z.core.$strict>;
                paused: z.ZodNullable<z.ZodObject<{
                    at: z.ZodNullable<z.ZodISODateTime>;
                    byOwner: z.ZodNullable<z.ZodBoolean>;
                }, z.core.$strict>>;
                typeId: z.ZodEnum<{
                    dati: "dati";
                    design: "design";
                    sviluppo: "sviluppo";
                    finanza: "finanza";
                    marketing: "marketing";
                }>;
                buSlug: z.ZodString;
                referent: z.ZodObject<{
                    name: z.ZodNullable<z.ZodString>;
                    initials: z.ZodNullable<z.ZodString>;
                    verified: z.ZodBoolean;
                    missing: z.ZodBoolean;
                }, z.core.$strict>;
                why: z.ZodString;
                leadAgentId: z.ZodNullable<z.ZodString>;
                since: z.ZodNullable<z.ZodISODateTime>;
                waitingFor: z.ZodArray<z.ZodObject<{
                    kind: z.ZodEnum<{
                        director: "director";
                        referente: "referente";
                        proprietario: "proprietario";
                        reparto: "reparto";
                        guasto: "guasto";
                    }>;
                    who: z.ZodArray<z.ZodObject<{
                        name: z.ZodString;
                        initials: z.ZodString;
                        role: z.ZodString;
                    }, z.core.$strict>>;
                    buSlugs: z.ZodArray<z.ZodString>;
                    partIndex: z.ZodNullable<z.ZodNumber>;
                    since: z.ZodNullable<z.ZodISODateTime>;
                    what: z.ZodString;
                    action: z.ZodNullable<z.ZodEnum<{
                        rispondi: "rispondi";
                        sveglia: "sveglia";
                        dai_il_via: "dai_il_via";
                        apri_reparto: "apri_reparto";
                    }>>;
                    unblockHint: z.ZodNullable<z.ZodObject<{
                        channel: z.ZodEnum<{
                            paperclip: "paperclip";
                            persona: "persona";
                            mail: "mail";
                        }>;
                        text: z.ZodString;
                        ref: z.ZodNullable<z.ZodString>;
                    }, z.core.$strict>>;
                    openIn: z.ZodNullable<z.ZodObject<{
                        issueIdentifier: z.ZodString;
                    }, z.core.$strict>>;
                }, z.core.$strict>>;
                stateLabel: z.ZodString;
                late: z.ZodBoolean;
                alert: z.ZodNullable<z.ZodObject<{
                    kind: z.ZodEnum<{
                        errore: "errore";
                        ritardo: "ritardo";
                    }>;
                    text: z.ZodString;
                    attempts: z.ZodArray<z.ZodObject<{
                        at: z.ZodISODateTime;
                        text: z.ZodString;
                    }, z.core.$strict>>;
                }, z.core.$strict>>;
                sharedAcrossProjects: z.ZodBoolean;
                parts: z.ZodArray<z.ZodObject<{
                    index: z.ZodNumber;
                    title: z.ZodString;
                    state: z.ZodEnum<{
                        in_corso: "in_corso";
                        non_noto: "non_noto";
                        fatto: "fatto";
                        da_fare: "da_fare";
                    }>;
                    note: z.ZodNullable<z.ZodString>;
                    at: z.ZodNullable<z.ZodISODateTime>;
                    after: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
                }, z.core.$strict>>;
                computerSession: z.ZodNullable<z.ZodObject<{
                    state: z.ZodEnum<{
                        adesso: "adesso";
                        oggi_finita: "oggi_finita";
                    }>;
                    at: z.ZodISODateTime;
                    computerName: z.ZodNullable<z.ZodString>;
                    what: z.ZodNullable<z.ZodString>;
                    stopsOnPause: z.ZodNullable<z.ZodBoolean>;
                }, z.core.$strict>>;
                pauseWarning: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>>;
            projectHistory: z.ZodArray<z.ZodObject<{
                at: z.ZodISODateTime;
                kind: z.ZodEnum<{
                    ricerca: "ricerca";
                    approvazione: "approvazione";
                    passo: "passo";
                    messaggio: "messaggio";
                    materiale: "materiale";
                    mandato: "mandato";
                    richiesta_modifica: "richiesta_modifica";
                    tentativo_fallito: "tentativo_fallito";
                }>;
                text: z.ZodString;
            }, z.core.$strict>>;
            project: z.ZodObject<{
                projectId: z.ZodString;
                name: z.ZodNullable<z.ZodString>;
                planVersion: z.ZodNullable<z.ZodNumber>;
            }, z.core.$strict>;
            readAt: z.ZodISODateTime;
            summary: z.ZodString;
            director: z.ZodObject<{
                state: z.ZodEnum<{
                    errore: "errore";
                    al_lavoro: "al_lavoro";
                    fermo: "fermo";
                    non_partito: "non_partito";
                    aspetta_referente: "aspetta_referente";
                    aspetta_proprietario: "aspetta_proprietario";
                    aspetta_director: "aspetta_director";
                    aspetta_reparto: "aspetta_reparto";
                    attesa_del_via: "attesa_del_via";
                    approvato_non_ripartito: "approvato_non_ripartito";
                    in_pausa: "in_pausa";
                    non_iniziato: "non_iniziato";
                    finito: "finito";
                    non_noto: "non_noto";
                }>;
                doing: z.ZodNullable<z.ZodString>;
                wokenAt: z.ZodNullable<z.ZodISODateTime>;
                wokenWhy: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
            milestoneLine: z.ZodNullable<z.ZodObject<{
                text: z.ZodString;
                overdue: z.ZodBoolean;
            }, z.core.$strict>>;
            milestones: z.ZodArray<z.ZodObject<{
                number: z.ZodNumber;
                buSlug: z.ZodString;
                dueDate: z.ZodNullable<z.ZodISODate>;
                closeCriterion: z.ZodString;
                state: z.ZodEnum<{
                    aperta: "aperta";
                    fatta: "fatta";
                    scaduta: "scaduta";
                    non_nota: "non_nota";
                }>;
            }, z.core.$strict>>;
            waits: z.ZodArray<z.ZodObject<{
                kind: z.ZodEnum<{
                    director: "director";
                    referente: "referente";
                    proprietario: "proprietario";
                    reparto: "reparto";
                    guasto: "guasto";
                }>;
                who: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    initials: z.ZodString;
                    role: z.ZodString;
                }, z.core.$strict>>;
                buSlugs: z.ZodArray<z.ZodString>;
                partIndex: z.ZodNullable<z.ZodNumber>;
                since: z.ZodNullable<z.ZodISODateTime>;
                what: z.ZodString;
                action: z.ZodNullable<z.ZodEnum<{
                    rispondi: "rispondi";
                    sveglia: "sveglia";
                    dai_il_via: "dai_il_via";
                    apri_reparto: "apri_reparto";
                }>>;
                unblockHint: z.ZodNullable<z.ZodObject<{
                    channel: z.ZodEnum<{
                        paperclip: "paperclip";
                        persona: "persona";
                        mail: "mail";
                    }>;
                    text: z.ZodString;
                    ref: z.ZodNullable<z.ZodString>;
                }, z.core.$strict>>;
                openIn: z.ZodNullable<z.ZodObject<{
                    issueIdentifier: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
            exchanges: z.ZodArray<z.ZodObject<{
                fromBu: z.ZodString;
                toBu: z.ZodString;
                what: z.ZodString;
                blocking: z.ZodBoolean;
                open: z.ZodBoolean;
            }, z.core.$strict>>;
            spend: z.ZodUnion<readonly [z.ZodObject<{
                status: z.ZodLiteral<"non_collegata">;
            }, z.core.$strict>, z.ZodObject<{
                status: z.ZodLiteral<"ok">;
                scope: z.ZodEnum<{
                    progetto: "progetto";
                    azienda: "azienda";
                }>;
                usdPerEur: z.ZodNumber;
                since: z.ZodISODateTime;
                todayMicros: z.ZodNumber;
                totalMicros: z.ZodNumber;
                days: z.ZodArray<z.ZodObject<{
                    date: z.ZodISODate;
                    micros: z.ZodNumber;
                }, z.core.$strict>>;
                rows: z.ZodArray<z.ZodObject<{
                    kind: z.ZodEnum<{
                        director: "director";
                        reparto: "reparto";
                        ricerca_sviluppo: "ricerca_sviluppo";
                        altro: "altro";
                    }>;
                    buSlug: z.ZodNullable<z.ZodString>;
                    todayMicros: z.ZodNullable<z.ZodNumber>;
                    totalMicros: z.ZodNullable<z.ZodNumber>;
                }, z.core.$strict>>;
                estimated: z.ZodBoolean;
            }, z.core.$strict>]>;
            sources: z.ZodArray<z.ZodObject<{
                source: z.ZodEnum<{
                    piano: "piano";
                    decisioni: "decisioni";
                    materiali: "materiali";
                    incarichi: "incarichi";
                    sessioni: "sessioni";
                    mappa: "mappa";
                    spesa: "spesa";
                }>;
                status: z.ZodEnum<{
                    ok: "ok";
                    non_disponibile: "non_disponibile";
                    tagliata: "tagliata";
                }>;
                reason: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
};
export declare const InternalCompanyBoardProjectQuerySchema: z.ZodObject<{
    tenantId: z.ZodString;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    directorAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
    projectId: z.ZodString;
}, z.core.$strict>;
export type InternalCompanyBoardProjectQuery = z.infer<typeof InternalCompanyBoardProjectQuerySchema>;
export declare const internalCompanyBoardProjectContract: {
    readonly method: "GET";
    readonly path: "/internal/company-board/project";
    readonly authType: "secret";
    readonly querySchema: z.ZodObject<{
        tenantId: z.ZodString;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        directorAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        projectId: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        units: z.ZodArray<z.ZodObject<{
            buSlug: z.ZodString;
            name: z.ZodString;
            typeId: z.ZodEnum<{
                dati: "dati";
                design: "design";
                sviluppo: "sviluppo";
                finanza: "finanza";
                marketing: "marketing";
            }>;
            leadAgentId: z.ZodNullable<z.ZodString>;
            referent: z.ZodObject<{
                name: z.ZodNullable<z.ZodString>;
                initials: z.ZodNullable<z.ZodString>;
                verified: z.ZodBoolean;
                missing: z.ZodBoolean;
            }, z.core.$strict>;
            state: z.ZodEnum<{
                errore: "errore";
                al_lavoro: "al_lavoro";
                fermo: "fermo";
                non_partito: "non_partito";
                aspetta_referente: "aspetta_referente";
                aspetta_proprietario: "aspetta_proprietario";
                aspetta_director: "aspetta_director";
                aspetta_reparto: "aspetta_reparto";
                attesa_del_via: "attesa_del_via";
                approvato_non_ripartito: "approvato_non_ripartito";
                in_pausa: "in_pausa";
                non_iniziato: "non_iniziato";
                finito: "finito";
                non_noto: "non_noto";
            }>;
            stateLabel: z.ZodString;
            since: z.ZodNullable<z.ZodISODateTime>;
            why: z.ZodString;
            late: z.ZodBoolean;
            alert: z.ZodNullable<z.ZodObject<{
                kind: z.ZodEnum<{
                    errore: "errore";
                    ritardo: "ritardo";
                }>;
                text: z.ZodString;
                attempts: z.ZodArray<z.ZodObject<{
                    at: z.ZodISODateTime;
                    text: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
            waitingFor: z.ZodArray<z.ZodObject<{
                kind: z.ZodEnum<{
                    director: "director";
                    referente: "referente";
                    proprietario: "proprietario";
                    reparto: "reparto";
                    guasto: "guasto";
                }>;
                who: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    initials: z.ZodString;
                    role: z.ZodString;
                }, z.core.$strict>>;
                buSlugs: z.ZodArray<z.ZodString>;
                partIndex: z.ZodNullable<z.ZodNumber>;
                since: z.ZodNullable<z.ZodISODateTime>;
                what: z.ZodString;
                action: z.ZodNullable<z.ZodEnum<{
                    rispondi: "rispondi";
                    sveglia: "sveglia";
                    dai_il_via: "dai_il_via";
                    apri_reparto: "apri_reparto";
                }>>;
                unblockHint: z.ZodNullable<z.ZodObject<{
                    channel: z.ZodEnum<{
                        paperclip: "paperclip";
                        persona: "persona";
                        mail: "mail";
                    }>;
                    text: z.ZodString;
                    ref: z.ZodNullable<z.ZodString>;
                }, z.core.$strict>>;
                openIn: z.ZodNullable<z.ZodObject<{
                    issueIdentifier: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
            sharedAcrossProjects: z.ZodBoolean;
            parts: z.ZodArray<z.ZodObject<{
                index: z.ZodNumber;
                title: z.ZodString;
                state: z.ZodEnum<{
                    in_corso: "in_corso";
                    non_noto: "non_noto";
                    fatto: "fatto";
                    da_fare: "da_fare";
                }>;
                note: z.ZodNullable<z.ZodString>;
                at: z.ZodNullable<z.ZodISODateTime>;
                after: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
            }, z.core.$strict>>;
            computerSession: z.ZodNullable<z.ZodObject<{
                state: z.ZodEnum<{
                    adesso: "adesso";
                    oggi_finita: "oggi_finita";
                }>;
                at: z.ZodISODateTime;
                computerName: z.ZodNullable<z.ZodString>;
                what: z.ZodNullable<z.ZodString>;
                stopsOnPause: z.ZodNullable<z.ZodBoolean>;
            }, z.core.$strict>>;
            history: z.ZodArray<z.ZodObject<{
                at: z.ZodISODateTime;
                kind: z.ZodEnum<{
                    ricerca: "ricerca";
                    approvazione: "approvazione";
                    passo: "passo";
                    messaggio: "messaggio";
                    materiale: "materiale";
                    mandato: "mandato";
                    richiesta_modifica: "richiesta_modifica";
                    tentativo_fallito: "tentativo_fallito";
                }>;
                text: z.ZodString;
                mine: z.ZodBoolean;
            }, z.core.$strict>>;
            paused: z.ZodNullable<z.ZodObject<{
                at: z.ZodNullable<z.ZodISODateTime>;
                byOwner: z.ZodNullable<z.ZodBoolean>;
            }, z.core.$strict>>;
            actions: z.ZodObject<{
                sveglia: z.ZodObject<{
                    available: z.ZodBoolean;
                    reason: z.ZodNullable<z.ZodString>;
                }, z.core.$strict>;
                via: z.ZodObject<{
                    available: z.ZodBoolean;
                    reason: z.ZodNullable<z.ZodString>;
                }, z.core.$strict>;
                ferma: z.ZodObject<{
                    available: z.ZodBoolean;
                    reason: z.ZodNullable<z.ZodString>;
                }, z.core.$strict>;
                riprendi: z.ZodObject<{
                    available: z.ZodBoolean;
                    reason: z.ZodNullable<z.ZodString>;
                }, z.core.$strict>;
            }, z.core.$strict>;
            pauseWarning: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>>;
        projectHistory: z.ZodArray<z.ZodObject<{
            at: z.ZodISODateTime;
            kind: z.ZodEnum<{
                ricerca: "ricerca";
                approvazione: "approvazione";
                passo: "passo";
                messaggio: "messaggio";
                materiale: "materiale";
                mandato: "mandato";
                richiesta_modifica: "richiesta_modifica";
                tentativo_fallito: "tentativo_fallito";
            }>;
            text: z.ZodString;
        }, z.core.$strict>>;
        project: z.ZodObject<{
            projectId: z.ZodString;
            name: z.ZodNullable<z.ZodString>;
            planVersion: z.ZodNullable<z.ZodNumber>;
        }, z.core.$strict>;
        readAt: z.ZodISODateTime;
        summary: z.ZodString;
        director: z.ZodObject<{
            state: z.ZodEnum<{
                errore: "errore";
                al_lavoro: "al_lavoro";
                fermo: "fermo";
                non_partito: "non_partito";
                aspetta_referente: "aspetta_referente";
                aspetta_proprietario: "aspetta_proprietario";
                aspetta_director: "aspetta_director";
                aspetta_reparto: "aspetta_reparto";
                attesa_del_via: "attesa_del_via";
                approvato_non_ripartito: "approvato_non_ripartito";
                in_pausa: "in_pausa";
                non_iniziato: "non_iniziato";
                finito: "finito";
                non_noto: "non_noto";
            }>;
            doing: z.ZodNullable<z.ZodString>;
            wokenAt: z.ZodNullable<z.ZodISODateTime>;
            wokenWhy: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        milestoneLine: z.ZodNullable<z.ZodObject<{
            text: z.ZodString;
            overdue: z.ZodBoolean;
        }, z.core.$strict>>;
        milestones: z.ZodArray<z.ZodObject<{
            number: z.ZodNumber;
            buSlug: z.ZodString;
            dueDate: z.ZodNullable<z.ZodISODate>;
            closeCriterion: z.ZodString;
            state: z.ZodEnum<{
                aperta: "aperta";
                fatta: "fatta";
                scaduta: "scaduta";
                non_nota: "non_nota";
            }>;
        }, z.core.$strict>>;
        waits: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                director: "director";
                referente: "referente";
                proprietario: "proprietario";
                reparto: "reparto";
                guasto: "guasto";
            }>;
            who: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                initials: z.ZodString;
                role: z.ZodString;
            }, z.core.$strict>>;
            buSlugs: z.ZodArray<z.ZodString>;
            partIndex: z.ZodNullable<z.ZodNumber>;
            since: z.ZodNullable<z.ZodISODateTime>;
            what: z.ZodString;
            action: z.ZodNullable<z.ZodEnum<{
                rispondi: "rispondi";
                sveglia: "sveglia";
                dai_il_via: "dai_il_via";
                apri_reparto: "apri_reparto";
            }>>;
            unblockHint: z.ZodNullable<z.ZodObject<{
                channel: z.ZodEnum<{
                    paperclip: "paperclip";
                    persona: "persona";
                    mail: "mail";
                }>;
                text: z.ZodString;
                ref: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>>;
            openIn: z.ZodNullable<z.ZodObject<{
                issueIdentifier: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        exchanges: z.ZodArray<z.ZodObject<{
            fromBu: z.ZodString;
            toBu: z.ZodString;
            what: z.ZodString;
            blocking: z.ZodBoolean;
            open: z.ZodBoolean;
        }, z.core.$strict>>;
        spend: z.ZodUnion<readonly [z.ZodObject<{
            status: z.ZodLiteral<"non_collegata">;
        }, z.core.$strict>, z.ZodObject<{
            status: z.ZodLiteral<"ok">;
            scope: z.ZodEnum<{
                progetto: "progetto";
                azienda: "azienda";
            }>;
            usdPerEur: z.ZodNumber;
            since: z.ZodISODateTime;
            todayMicros: z.ZodNumber;
            totalMicros: z.ZodNumber;
            days: z.ZodArray<z.ZodObject<{
                date: z.ZodISODate;
                micros: z.ZodNumber;
            }, z.core.$strict>>;
            rows: z.ZodArray<z.ZodObject<{
                kind: z.ZodEnum<{
                    director: "director";
                    reparto: "reparto";
                    ricerca_sviluppo: "ricerca_sviluppo";
                    altro: "altro";
                }>;
                buSlug: z.ZodNullable<z.ZodString>;
                todayMicros: z.ZodNullable<z.ZodNumber>;
                totalMicros: z.ZodNullable<z.ZodNumber>;
            }, z.core.$strict>>;
            estimated: z.ZodBoolean;
        }, z.core.$strict>]>;
        sources: z.ZodArray<z.ZodObject<{
            source: z.ZodEnum<{
                piano: "piano";
                decisioni: "decisioni";
                materiali: "materiali";
                incarichi: "incarichi";
                sessioni: "sessioni";
                mappa: "mappa";
                spesa: "spesa";
            }>;
            status: z.ZodEnum<{
                ok: "ok";
                non_disponibile: "non_disponibile";
                tagliata: "tagliata";
            }>;
            reason: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
        company: z.ZodObject<{
            clientId: z.ZodString;
            name: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-company-board.d.ts.map