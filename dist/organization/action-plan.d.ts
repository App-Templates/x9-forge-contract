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
export declare const ActionPlanBuSectionSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    expectedGoal: z.ZodString;
    deliveryCriteria: z.ZodArray<z.ZodString>;
    milestone: z.ZodNumber;
    needsFrom: z.ZodOptional<z.ZodArray<z.ZodObject<{
        buSlug: z.ZodString;
        what: z.ZodString;
    }, z.core.$strict>>>;
}, z.core.$strict>;
export type ActionPlanBuSection = z.infer<typeof ActionPlanBuSectionSchema>;
/** What the plan delivers: `product` builds something the user uses (app, site, service); `study` delivers documents (analysis, research, financial plan, opinion). */
export declare const ACTION_PLAN_DELIVERY_SHAPES: readonly ["product", "study"];
export declare const ActionPlanDeliveryShapeSchema: z.ZodEnum<{
    product: "product";
    study: "study";
}>;
export type ActionPlanDeliveryShape = z.infer<typeof ActionPlanDeliveryShapeSchema>;
/** A business unit working on an item of the project breakdown, and what it does there. */
export declare const ActionPlanWorkItemOwnerSchema: z.ZodObject<{
    buSlug: z.ZodString;
    does: z.ZodString;
}, z.core.$strict>;
export type ActionPlanWorkItemOwner = z.infer<typeof ActionPlanWorkItemOwnerSchema>;
/** One item of the project breakdown (alberatura): a section of what the user will use, nested through `parentId`. */
export declare const ActionPlanWorkItemSchema: z.ZodObject<{
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
}, z.core.$strict>;
export type ActionPlanWorkItem = z.infer<typeof ActionPlanWorkItemSchema>;
export declare const ACTION_PLAN_WORK_BREAKDOWN_MAX_ITEMS = 60;
export declare const ActionPlanWorkBreakdownSchema: z.ZodArray<z.ZodObject<{
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
}, z.core.$strict>>;
export type ActionPlanWorkBreakdown = z.infer<typeof ActionPlanWorkBreakdownSchema>;
/** Part 6 «Organizzazione» of the action plan: one business unit. */
export declare const ActionPlanBusinessUnitSchema: z.ZodObject<{
    buSlug: z.ZodString;
    /** Only a lead type of the catalog (1.65.0): the unit is born by Forge from this type. */
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
}, z.core.$strict>;
export type ActionPlanBusinessUnit = z.infer<typeof ActionPlanBusinessUnitSchema>;
/** A person the plan proposes for the client company map; written only when the owner approves this plan version. */
export declare const ActionPlanReferentProposalSchema: z.ZodObject<{
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
}, z.core.$strict>;
export type ActionPlanReferentProposal = z.infer<typeof ActionPlanReferentProposalSchema>;
/** A published wiki page at the version used to write the plan. */
export declare const ActionPlanDossierPageSchema: z.ZodObject<{
    slug: z.ZodString;
    version: z.ZodNumber;
}, z.core.$strict>;
export type ActionPlanDossierPage = z.infer<typeof ActionPlanDossierPageSchema>;
/** Part 1 of the plan: the request, the expected result and how it is measured. */
export declare const ActionPlanObjectiveSchema: z.ZodObject<{
    request: z.ZodString;
    expectedResult: z.ZodString;
    measure: z.ZodString;
}, z.core.$strict>;
export type ActionPlanObjective = z.infer<typeof ActionPlanObjectiveSchema>;
/** Objective tree, project level: result and delivery criteria of the whole project. */
export declare const ActionPlanProjectObjectiveSchema: z.ZodObject<{
    expectedResult: z.ZodString;
    deliveryCriteria: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export type ActionPlanProjectObjective = z.infer<typeof ActionPlanProjectObjectiveSchema>;
/** Objective tree, business unit level: what this unit must obtain. */
export declare const ActionPlanBuObjectiveSchema: z.ZodObject<{
    buSlug: z.ZodString;
    expectedResult: z.ZodString;
    deliveryCriteria: z.ZodArray<z.ZodString>;
    indicators: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        source: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ActionPlanBuObjective = z.infer<typeof ActionPlanBuObjectiveSchema>;
/** The eleven required parts of the versioned plan submitted for owner approval. */
export declare const ActionPlanSchema: z.ZodObject<{
    planId: z.ZodString;
    version: z.ZodNumber;
    digest: z.ZodString;
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    clientId: z.ZodString;
    projectId: z.ZodString;
    dossier: z.ZodOptional<z.ZodArray<z.ZodObject<{
        slug: z.ZodString;
        version: z.ZodNumber;
    }, z.core.$strict>>>;
    objective: z.ZodObject<{
        request: z.ZodString;
        expectedResult: z.ZodString;
        measure: z.ZodString;
    }, z.core.$strict>;
    deliveryShape: z.ZodOptional<z.ZodEnum<{
        product: "product";
        study: "study";
    }>>;
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
        /** Only a lead type of the catalog (1.65.0): the unit is born by Forge from this type. */
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
}, z.core.$strict>;
export type ActionPlan = z.infer<typeof ActionPlanSchema>;
/** The plan as the Director writes it: the service adds digest, tenant and organization (and planId/version when absent). */
export declare const ActionPlanDraftSchema: z.ZodObject<{
    budget: z.ZodObject<{
        currency: z.ZodString;
        total: z.ZodNumber;
        perBu: z.ZodArray<z.ZodObject<{
            buSlug: z.ZodString;
            cap: z.ZodNumber;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    objective: z.ZodObject<{
        request: z.ZodString;
        expectedResult: z.ZodString;
        measure: z.ZodString;
    }, z.core.$strict>;
    projectId: z.ZodString;
    clientId: z.ZodString;
    strategy: z.ZodObject<{
        approach: z.ZodString;
        choices: z.ZodArray<z.ZodString>;
        discardedAlternatives: z.ZodArray<z.ZodString>;
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
    dossier: z.ZodOptional<z.ZodArray<z.ZodObject<{
        slug: z.ZodString;
        version: z.ZodNumber;
    }, z.core.$strict>>>;
    deliveryShape: z.ZodOptional<z.ZodEnum<{
        product: "product";
        study: "study";
    }>>;
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
    businessUnits: z.ZodArray<z.ZodObject<{
        buSlug: z.ZodString;
        /** Only a lead type of the catalog (1.65.0): the unit is born by Forge from this type. */
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
    milestones: z.ZodArray<z.ZodObject<{
        number: z.ZodNumber;
        delivery: z.ZodString;
        buSlug: z.ZodString;
        dueDate: z.ZodOptional<z.ZodISODate>;
        closeCriterion: z.ZodString;
        blockedBy: z.ZodArray<z.ZodNumber>;
    }, z.core.$strict>>;
    criticalPath: z.ZodArray<z.ZodNumber>;
    exchanges: z.ZodArray<z.ZodObject<{
        fromBu: z.ZodString;
        toBu: z.ZodString;
        what: z.ZodString;
        format: z.ZodString;
    }, z.core.$strict>>;
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
    planId: z.ZodOptional<z.ZodString>;
    version: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export type ActionPlanDraft = z.infer<typeof ActionPlanDraftSchema>;
/**
 * The plan as the Director submits a new version. A new version needs the published dossier pages it is written on, and `deliveryShape` is required:
 * - `product`: the work breakdown (alberatura) is required and is the only source of what to build (no `sections` per unit);
 *   every parent exists, no cycles, every leaf has an owner, owners and milestones exist, every unit that starts now owns an item.
 * - `study`: no work breakdown; every unit that starts now carries its `sections` (the deliverables).
 * Every unit has its entry in `objectiveTree.businessUnits`.
 * Saved plans and old drafts are read with ActionPlanSchema / ActionPlanDraftSchema, which require none of this.
 */
export declare const ActionPlanSubmissionSchema: z.ZodObject<{
    budget: z.ZodObject<{
        currency: z.ZodString;
        total: z.ZodNumber;
        perBu: z.ZodArray<z.ZodObject<{
            buSlug: z.ZodString;
            cap: z.ZodNumber;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    objective: z.ZodObject<{
        request: z.ZodString;
        expectedResult: z.ZodString;
        measure: z.ZodString;
    }, z.core.$strict>;
    projectId: z.ZodString;
    clientId: z.ZodString;
    strategy: z.ZodObject<{
        approach: z.ZodString;
        choices: z.ZodArray<z.ZodString>;
        discardedAlternatives: z.ZodArray<z.ZodString>;
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
    dossier: z.ZodOptional<z.ZodArray<z.ZodObject<{
        slug: z.ZodString;
        version: z.ZodNumber;
    }, z.core.$strict>>>;
    deliveryShape: z.ZodOptional<z.ZodEnum<{
        product: "product";
        study: "study";
    }>>;
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
    businessUnits: z.ZodArray<z.ZodObject<{
        buSlug: z.ZodString;
        /** Only a lead type of the catalog (1.65.0): the unit is born by Forge from this type. */
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
    milestones: z.ZodArray<z.ZodObject<{
        number: z.ZodNumber;
        delivery: z.ZodString;
        buSlug: z.ZodString;
        dueDate: z.ZodOptional<z.ZodISODate>;
        closeCriterion: z.ZodString;
        blockedBy: z.ZodArray<z.ZodNumber>;
    }, z.core.$strict>>;
    criticalPath: z.ZodArray<z.ZodNumber>;
    exchanges: z.ZodArray<z.ZodObject<{
        fromBu: z.ZodString;
        toBu: z.ZodString;
        what: z.ZodString;
        format: z.ZodString;
    }, z.core.$strict>>;
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
    planId: z.ZodOptional<z.ZodString>;
    version: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export type ActionPlanSubmission = z.infer<typeof ActionPlanSubmissionSchema>;
/** The plan Stefano can approve as it stands: the eleven parts plus marketing, launch and financial plans, cross-checked. */
export declare const CompleteActionPlanSchema: z.ZodObject<{
    planId: z.ZodString;
    version: z.ZodNumber;
    digest: z.ZodString;
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    clientId: z.ZodString;
    projectId: z.ZodString;
    dossier: z.ZodOptional<z.ZodArray<z.ZodObject<{
        slug: z.ZodString;
        version: z.ZodNumber;
    }, z.core.$strict>>>;
    objective: z.ZodObject<{
        request: z.ZodString;
        expectedResult: z.ZodString;
        measure: z.ZodString;
    }, z.core.$strict>;
    deliveryShape: z.ZodOptional<z.ZodEnum<{
        product: "product";
        study: "study";
    }>>;
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
        /** Only a lead type of the catalog (1.65.0): the unit is born by Forge from this type. */
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