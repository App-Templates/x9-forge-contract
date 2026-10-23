import { z } from 'zod';
/** How a business unit of the action plan produces its work. */
export declare const ACTION_PLAN_BU_EXECUTORS: readonly ["agent", "dev_session", "night"];
export declare const ActionPlanBuExecutorSchema: z.ZodEnum<{
    agent: "agent";
    night: "night";
    dev_session: "dev_session";
}>;
export type ActionPlanBuExecutor = z.infer<typeof ActionPlanBuExecutorSchema>;
/** The referent is only a pointer to an entry of the company memory map: no name, no address. */
export declare const ActionPlanReferentRefSchema: z.ZodObject<{
    personRef: z.ZodString;
    entryVersion: z.ZodNumber;
}, z.core.$strict>;
export type ActionPlanReferentRef = z.infer<typeof ActionPlanReferentRefSchema>;
/** Role agents are only listed in the plan; they are not born with it. */
export declare const ActionPlanRoleAgentSchema: z.ZodObject<{
    role: z.ZodString;
    competencies: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export type ActionPlanRoleAgent = z.infer<typeof ActionPlanRoleAgentSchema>;
export declare const ActionPlanBuStartSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"now">;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"planned">;
    unlockedBy: z.ZodObject<{
        milestone: z.ZodNumber;
        delivery: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>], "kind">;
export type ActionPlanBuStart = z.infer<typeof ActionPlanBuStartSchema>;
/** Part 6 «Organizzazione» of the action plan: one business unit. */
export declare const ActionPlanBusinessUnitSchema: z.ZodObject<{
    buSlug: z.ZodString;
    typeId: z.ZodString;
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
export type ActionPlanBusinessUnit = z.infer<typeof ActionPlanBusinessUnitSchema>;
/** The eleven required parts of the versioned plan submitted for owner approval. */
export declare const ActionPlanSchema: z.ZodObject<{
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
        typeId: z.ZodString;
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
            data: "data";
            asset: "asset";
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
export type ActionPlan = z.infer<typeof ActionPlanSchema>;
/** The plan Stefano can approve as it stands: the eleven parts plus marketing, launch and financial plans, cross-checked. */
export declare const CompleteActionPlanSchema: z.ZodObject<{
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
        typeId: z.ZodString;
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
            data: "data";
            asset: "asset";
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
    marketingPlan: z.ZodObject<{
        audience: z.ZodString;
        channels: z.ZodArray<z.ZodString>;
        messages: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
    launchPlan: z.ZodObject<{
        launchDate: z.ZodISODate;
        steps: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
    financialPlan: z.ZodObject<{
        revenueModel: z.ZodString;
        costs: z.ZodArray<z.ZodObject<{
            item: z.ZodString;
            amount: z.ZodNumber;
        }, z.core.$strict>>;
        breakEven: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
export type CompleteActionPlan = z.infer<typeof CompleteActionPlanSchema>;
export declare function canonicalJson(value: unknown): string;
/** Portable UTF-8 input for the writer's SHA-256; the digest itself is excluded. */
export declare function actionPlanCanonicalJson(plan: ActionPlan): string;
//# sourceMappingURL=action-plan.d.ts.map