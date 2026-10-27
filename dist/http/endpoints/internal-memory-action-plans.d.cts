import { z } from 'zod';
/**
 * Versions of the action plan in the company memory A (F1X-03 completed, for F1P-01, F1P-02, F2P-01/02, F3P-01).
 * The decision request keeps only the subject (planId, version, digest): the content of each version lives here,
 * so the units to create and the BU «previste» are read from the approved version, never from the model.
 * Tenant and organization come from the signed context, verified by the service; the plan must name the same.
 * Every version stays; a version is written once (same digest = same receipt).
 */
export declare const INTERNAL_MEMORY_ACTION_PLANS_PATH: "/internal/memory/action-plans";
export declare const INTERNAL_MEMORY_ACTION_PLAN_READ_PATH: "/internal/memory/action-plans/read";
export declare const ActionPlanSaveRequestSchema: z.ZodObject<{
    context: z.ZodObject<{
        schemaVersion: z.ZodLiteral<1>;
        runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
        organizationId: z.ZodString;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        personRef: z.ZodOptional<z.ZodString>;
        issuer: z.ZodEnum<{
            x9: "x9";
            forge: "forge";
            paperclip: "paperclip";
        }>;
        issuedAt: z.ZodISODateTime;
        expiresAt: z.ZodISODateTime;
    }, z.core.$strict>;
    plan: z.ZodObject<{
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
            dueDate: z.ZodISODate;
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
    }, z.core.$strict>;
}, z.core.$strict>;
export type ActionPlanSaveRequest = z.infer<typeof ActionPlanSaveRequestSchema>;
export declare const ActionPlanSaveResponseSchema: z.ZodObject<{
    planId: z.ZodString;
    version: z.ZodNumber;
    digest: z.ZodString;
    created: z.ZodBoolean;
}, z.core.$strict>;
export type ActionPlanSaveResponse = z.infer<typeof ActionPlanSaveResponseSchema>;
export declare const ActionPlanReadRequestSchema: z.ZodObject<{
    context: z.ZodObject<{
        schemaVersion: z.ZodLiteral<1>;
        runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
        organizationId: z.ZodString;
        ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        personRef: z.ZodOptional<z.ZodString>;
        issuer: z.ZodEnum<{
            x9: "x9";
            forge: "forge";
            paperclip: "paperclip";
        }>;
        issuedAt: z.ZodISODateTime;
        expiresAt: z.ZodISODateTime;
    }, z.core.$strict>;
    planId: z.ZodString;
    /** Absent: the latest saved version. */
    version: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export type ActionPlanReadRequest = z.infer<typeof ActionPlanReadRequestSchema>;
export declare const ActionPlanReadResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"ok">;
    plan: z.ZodObject<{
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
            dueDate: z.ZodISODate;
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
    }, z.core.$strict>;
    latestVersion: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"not_found">;
}, z.core.$strict>], "status">;
export type ActionPlanReadResponse = z.infer<typeof ActionPlanReadResponseSchema>;
export declare const ACTION_PLAN_ERROR_CODES: readonly ["action_plan_conflict", "action_plan_digest_mismatch", "action_plan_scope_mismatch", "identity_uncertain"];
export declare const ActionPlanErrorCodeSchema: z.ZodEnum<{
    identity_uncertain: "identity_uncertain";
    action_plan_conflict: "action_plan_conflict";
    action_plan_digest_mismatch: "action_plan_digest_mismatch";
    action_plan_scope_mismatch: "action_plan_scope_mismatch";
}>;
export type ActionPlanErrorCode = z.infer<typeof ActionPlanErrorCodeSchema>;
export declare const ActionPlanErrorResponseSchema: z.ZodObject<{
    code: z.ZodEnum<{
        identity_uncertain: "identity_uncertain";
        action_plan_conflict: "action_plan_conflict";
        action_plan_digest_mismatch: "action_plan_digest_mismatch";
        action_plan_scope_mismatch: "action_plan_scope_mismatch";
    }>;
    message: z.ZodString;
}, z.core.$strict>;
export type ActionPlanErrorResponse = z.infer<typeof ActionPlanErrorResponseSchema>;
/**
 * Save: 201 new version, 200 identical replay (`created: false`); 409 action_plan_conflict for the same
 * planId and version with another digest; 400 action_plan_digest_mismatch when the digest is not the one of
 * `actionPlanCanonicalJson`; 403 action_plan_scope_mismatch / identity_uncertain.
 */
export declare const internalMemoryActionPlanSaveContract: {
    readonly method: "POST";
    readonly path: "/internal/memory/action-plans";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        context: z.ZodObject<{
            schemaVersion: z.ZodLiteral<1>;
            runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
            organizationId: z.ZodString;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
            personRef: z.ZodOptional<z.ZodString>;
            issuer: z.ZodEnum<{
                x9: "x9";
                forge: "forge";
                paperclip: "paperclip";
            }>;
            issuedAt: z.ZodISODateTime;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strict>;
        plan: z.ZodObject<{
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
                dueDate: z.ZodISODate;
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
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        planId: z.ZodString;
        version: z.ZodNumber;
        digest: z.ZodString;
        created: z.ZodBoolean;
    }, z.core.$strict>;
};
/** Read: 200 with the version (or the latest) of a plan of the verified organization, or `not_found`. */
export declare const internalMemoryActionPlanReadContract: {
    readonly method: "POST";
    readonly path: "/internal/memory/action-plans/read";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        context: z.ZodObject<{
            schemaVersion: z.ZodLiteral<1>;
            runId: z.core.$ZodBranded<z.ZodString, "RunId", "out">;
            organizationId: z.ZodString;
            ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
            identity: z.ZodObject<{
                managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
                vaultAgentId: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
            personRef: z.ZodOptional<z.ZodString>;
            issuer: z.ZodEnum<{
                x9: "x9";
                forge: "forge";
                paperclip: "paperclip";
            }>;
            issuedAt: z.ZodISODateTime;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strict>;
        planId: z.ZodString;
        /** Absent: the latest saved version. */
        version: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
        status: z.ZodLiteral<"ok">;
        plan: z.ZodObject<{
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
                dueDate: z.ZodISODate;
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
        }, z.core.$strict>;
        latestVersion: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"not_found">;
    }, z.core.$strict>], "status">;
};
//# sourceMappingURL=internal-memory-action-plans.d.ts.map