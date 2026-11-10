"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompleteActionPlanSchema = exports.ActionPlanSubmissionSchema = exports.ActionPlanDraftSchema = exports.ActionPlanSchema = exports.ActionPlanBuObjectiveSchema = exports.ActionPlanProjectObjectiveSchema = exports.ActionPlanObjectiveSchema = exports.ActionPlanDossierPageSchema = exports.ActionPlanReferentProposalSchema = exports.ActionPlanBusinessUnitSchema = exports.ActionPlanWorkBreakdownSchema = exports.ACTION_PLAN_WORK_BREAKDOWN_MAX_ITEMS = exports.ActionPlanWorkItemSchema = exports.ActionPlanWorkItemOwnerSchema = exports.ActionPlanDeliveryShapeSchema = exports.ACTION_PLAN_DELIVERY_SHAPES = exports.ActionPlanBuSectionSchema = exports.ActionPlanBuStartSchema = exports.ActionPlanRoleAgentSchema = exports.ActionPlanReferentRefSchema = exports.ActionPlanBuExecutorSchema = exports.ACTION_PLAN_BU_EXECUTORS = void 0;
exports.canonicalJson = canonicalJson;
exports.actionPlanCanonicalJson = actionPlanCanonicalJson;
const zod_1 = require("zod");
const wiki_js_1 = require("../capability/lab/wiki.cjs");
const agent_role_js_1 = require("./agent-role.cjs");
const asset_js_1 = require("./asset.cjs");
const business_unit_type_js_1 = require("./business-unit-type.cjs");
const company_map_js_1 = require("./company-map.cjs");
const decision_request_js_1 = require("./decision-request.cjs");
const SlugSchema = (min, max) => zod_1.z.string().min(min).max(max).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const UniqueCompetenciesSchema = zod_1.z.array(zod_1.z.string().min(1).max(200)).min(1).max(20).refine((competencies) => new Set(competencies).size === competencies.length, { message: 'Competencies must be unique' });
/** How a business unit of the action plan produces its work. */
exports.ACTION_PLAN_BU_EXECUTORS = ['agent', 'dev_session', 'night'];
exports.ActionPlanBuExecutorSchema = zod_1.z.enum(exports.ACTION_PLAN_BU_EXECUTORS);
/** The referent is only a pointer to an entry of the company memory map: no name, no address. */
exports.ActionPlanReferentRefSchema = zod_1.z.strictObject({
    personRef: SlugSchema(1, 40),
    entryVersion: zod_1.z.number().int().min(1),
});
/** Role agents are only listed in the plan; they are not born with it. */
exports.ActionPlanRoleAgentSchema = zod_1.z.strictObject({
    role: zod_1.z.string().min(1).max(120),
    competencies: UniqueCompetenciesSchema,
});
exports.ActionPlanBuStartSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.strictObject({ kind: zod_1.z.literal('now') }),
    zod_1.z.strictObject({
        kind: zod_1.z.literal('planned'),
        unlockedBy: zod_1.z.strictObject({
            milestone: zod_1.z.number().int().min(1),
            delivery: zod_1.z.string().min(1).max(500),
        }),
    }),
]);
exports.ActionPlanBuSectionSchema = zod_1.z.strictObject({
    id: SlugSchema(1, 40).describe('nome breve e stabile della sezione'),
    title: zod_1.z.string().min(1).max(200).describe("la sezione, come la chiamerebbe l'utente"),
    expectedGoal: zod_1.z.string().min(1).max(1000).describe("cosa potrà fare l'utente quando la sezione è finita"),
    deliveryCriteria: zod_1.z.array(zod_1.z.string().min(1).max(500)).min(1).max(10)
        .describe('come si verifica che è finita'),
    milestone: zod_1.z.number().int().min(1).describe('la tappa del piano (`milestones[].number`) in cui si consegna'),
    needsFrom: zod_1.z.array(zod_1.z.strictObject({
        buSlug: SlugSchema(1, 30),
        what: zod_1.z.string().min(1).max(500),
    })).max(10).optional().describe("cosa serve da un'altra BU per costruirla"),
});
/** What the plan delivers: `product` builds something the user uses (app, site, service); `study` delivers documents (analysis, research, financial plan, opinion). */
exports.ACTION_PLAN_DELIVERY_SHAPES = ['product', 'study'];
exports.ActionPlanDeliveryShapeSchema = zod_1.z.enum(exports.ACTION_PLAN_DELIVERY_SHAPES)
    .describe("`product` se si costruisce qualcosa che l'utente usa (app, sito, servizio); `study` se si consegnano documenti (analisi, ricerca, piano finanziario, parere)");
/** A business unit working on an item of the project breakdown, and what it does there. */
exports.ActionPlanWorkItemOwnerSchema = zod_1.z.strictObject({
    buSlug: SlugSchema(1, 30),
    does: zod_1.z.string().min(1).max(1000).describe('cosa fa questa BU per la voce'),
});
/** One item of the project breakdown (alberatura): a section of what the user will use, nested through `parentId`. */
exports.ActionPlanWorkItemSchema = zod_1.z.strictObject({
    id: SlugSchema(1, 40).describe('nome breve e stabile della voce'),
    parentId: SlugSchema(1, 40).optional().describe('la voce che la contiene; assente per le voci di primo livello'),
    title: zod_1.z.string().min(1).max(200).describe("la sezione, come la chiamerebbe l'utente"),
    expectedGoal: zod_1.z.string().min(1).max(1000).describe("cosa potrà fare l'utente quando la voce è finita"),
    deliveryCriteria: zod_1.z.array(zod_1.z.string().min(1).max(500)).min(1).max(10)
        .describe('come si verifica che è finita'),
    milestone: zod_1.z.number().int().min(1).describe('la tappa del piano (`milestones[].number`) in cui si consegna'),
    owners: zod_1.z.array(exports.ActionPlanWorkItemOwnerSchema).max(10)
        .describe('le BU che ci lavorano e cosa fa ciascuna; ogni voce foglia ne ha almeno una'),
});
exports.ACTION_PLAN_WORK_BREAKDOWN_MAX_ITEMS = 60;
exports.ActionPlanWorkBreakdownSchema = zod_1.z.array(exports.ActionPlanWorkItemSchema).min(1).max(exports.ACTION_PLAN_WORK_BREAKDOWN_MAX_ITEMS).refine((items) => new Set(items.map((item) => item.id)).size === items.length, { message: 'Work breakdown item ids must be unique' }).describe("L'alberatura del progetto (solo `product`): tutte le sezioni che l'utente userà, comprese errori, dati mancanti e misura, con le BU che ci lavorano. È la fonte delle cose da costruire: i mini-brief delle BU la ereditano.");
/** Part 6 «Organizzazione» of the action plan: one business unit. */
exports.ActionPlanBusinessUnitSchema = zod_1.z.strictObject({
    buSlug: SlugSchema(1, 30),
    /** Only a lead type of the catalog (1.65.0): the unit is born by Forge from this type. */
    typeId: business_unit_type_js_1.BusinessUnitLeadTypeIdSchema,
    mandate: zod_1.z.string().min(1).max(2000)
        .describe('ruolo e perimetro della BU in poche frasi; le cose da costruire vanno in `sections`'),
    competencies: UniqueCompetenciesSchema,
    lead: zod_1.z.strictObject({ role: zod_1.z.literal(agent_role_js_1.BUSINESS_UNIT_LEAD_ROLE) }),
    reviewer: zod_1.z.union([
        zod_1.z.strictObject({ buSlug: SlugSchema(1, 30) }),
        zod_1.z.strictObject({ role: zod_1.z.literal(agent_role_js_1.DIRECTOR_ROLE) }),
    ]).optional(),
    executor: exports.ActionPlanBuExecutorSchema,
    referent: exports.ActionPlanReferentRefSchema,
    firstActivities: zod_1.z.array(zod_1.z.string().min(1).max(500)).min(1).max(20)
        .describe('i primi passi del capo, prima di costruire le sezioni'),
    sections: zod_1.z.array(exports.ActionPlanBuSectionSchema).min(1).max(20).refine((sections) => new Set(sections.map((section) => section.id)).size === sections.length, { message: 'Section ids must be unique within the business unit' }).optional().describe('Le sezioni che questa BU costruisce dopo l’approvazione: la missione scomposta per questa BU, ognuna con cosa potrà fare l’utente. È il mini-brief che il capo riceve nel Mandato.'),
    roleAgents: zod_1.z.array(exports.ActionPlanRoleAgentSchema).max(20).optional(),
    start: exports.ActionPlanBuStartSchema,
});
const TextSchema = zod_1.z.string().min(1).max(2000);
const BuSlugSchema = SlugSchema(1, 30);
const MilestoneNumberSchema = zod_1.z.number().int().min(1);
const DeliveryCriteriaSchema = zod_1.z.array(TextSchema).min(1).max(20);
/** A person the plan proposes for the client company map; written only when the owner approves this plan version. */
exports.ActionPlanReferentProposalSchema = zod_1.z.strictObject({
    personRef: SlugSchema(1, 40),
    name: zod_1.z.string().min(1).max(120),
    role: zod_1.z.string().min(1).max(120),
    email: zod_1.z.email(),
    level: company_map_js_1.CompanyMapLevelSchema,
    buSlug: SlugSchema(1, 30).optional(),
}).refine((p) => (p.level === 'business_unit') === (p.buSlug !== undefined), {
    message: 'buSlug is required at business_unit level and only allowed there', path: ['buSlug'],
});
/** A published wiki page at the version used to write the plan. */
exports.ActionPlanDossierPageSchema = zod_1.z.strictObject({
    slug: wiki_js_1.WikiPageSchema.shape.slug,
    version: wiki_js_1.WikiPageSchema.shape.version,
});
/** Part 1 of the plan: the request, the expected result and how it is measured. */
exports.ActionPlanObjectiveSchema = zod_1.z.strictObject({
    request: TextSchema,
    expectedResult: TextSchema,
    measure: TextSchema,
});
/** Objective tree, project level: result and delivery criteria of the whole project. */
exports.ActionPlanProjectObjectiveSchema = zod_1.z.strictObject({ expectedResult: TextSchema, deliveryCriteria: DeliveryCriteriaSchema });
/** Objective tree, business unit level: what this unit must obtain. */
exports.ActionPlanBuObjectiveSchema = zod_1.z.strictObject({
    buSlug: BuSlugSchema,
    expectedResult: TextSchema,
    deliveryCriteria: DeliveryCriteriaSchema,
    indicators: zod_1.z.array(zod_1.z.strictObject({ name: TextSchema, source: TextSchema })).max(20),
});
/** The eleven required parts of the versioned plan submitted for owner approval. */
exports.ActionPlanSchema = zod_1.z.strictObject({
    planId: decision_request_js_1.DecisionRequestIdSchema,
    version: zod_1.z.number().int().min(1),
    digest: asset_js_1.AssetSha256Schema,
    tenantId: asset_js_1.AssetRefSchema.shape.tenantId,
    organizationId: zod_1.z.string().min(1).max(64),
    clientId: asset_js_1.AssetRefSchema.shape.companyId,
    projectId: zod_1.z.string().min(1).max(64),
    dossier: zod_1.z.array(exports.ActionPlanDossierPageSchema).max(50).refine((pages) => new Set(pages.map((page) => page.slug)).size === pages.length, { message: 'Dossier page slugs must be unique' }).optional().describe('le pagine pubblicate da Lab su cui è scritto il piano, come le restituisce lab_read_published (slug e versione)'),
    objective: exports.ActionPlanObjectiveSchema,
    deliveryShape: exports.ActionPlanDeliveryShapeSchema.optional(),
    analysis: zod_1.z.strictObject({
        startingPoint: TextSchema,
        marketAndAlternatives: zod_1.z.strictObject({
            text: TextSchema,
            sources: zod_1.z.array(zod_1.z.url({ protocol: /^https?$/ })).min(1).max(30),
        }),
        recommendedMethod: zod_1.z.strictObject({ method: TextSchema, why: TextSchema }),
    }),
    strategy: zod_1.z.strictObject({
        approach: TextSchema,
        choices: zod_1.z.array(TextSchema).min(1).max(20),
        discardedAlternatives: zod_1.z.array(TextSchema).max(20),
    }),
    objectiveTree: zod_1.z.strictObject({
        project: exports.ActionPlanProjectObjectiveSchema,
        businessUnits: zod_1.z.array(exports.ActionPlanBuObjectiveSchema),
    }),
    workBreakdown: exports.ActionPlanWorkBreakdownSchema.optional(),
    milestones: zod_1.z.array(zod_1.z.strictObject({
        number: MilestoneNumberSchema,
        delivery: TextSchema,
        buSlug: BuSlugSchema,
        dueDate: zod_1.z.iso.date().optional().describe('giorno della tappa, se esiste'),
        closeCriterion: TextSchema,
        blockedBy: zod_1.z.array(zod_1.z.number().int()),
    })).min(1).max(50),
    criticalPath: zod_1.z.array(zod_1.z.number().int()).min(1).max(50),
    businessUnits: zod_1.z.array(exports.ActionPlanBusinessUnitSchema).min(1).max(20),
    exchanges: zod_1.z.array(zod_1.z.strictObject({
        fromBu: BuSlugSchema,
        toBu: BuSlugSchema,
        what: TextSchema,
        format: TextSchema,
    })),
    budget: zod_1.z.strictObject({
        currency: TextSchema,
        total: zod_1.z.number().min(0),
        perBu: zod_1.z.array(zod_1.z.strictObject({ buSlug: BuSlugSchema, cap: zod_1.z.number().min(0) })),
    }),
    risks: zod_1.z.array(TextSchema).max(30),
    assumptions: zod_1.z.array(TextSchema).max(30),
    missingMaterials: zod_1.z.array(zod_1.z.strictObject({
        what: TextSchema,
        kind: zod_1.z.enum(['asset', 'access', 'data']),
        owner: TextSchema.optional(),
        blocks: zod_1.z.strictObject({ buSlug: BuSlugSchema, milestone: MilestoneNumberSchema }).optional(),
        neededBy: zod_1.z.iso.date().optional(),
    })),
    questions: zod_1.z.array(zod_1.z.strictObject({ question: TextSchema, unlocks: TextSchema })),
    ifApproved: zod_1.z.strictObject({
        startNow: zod_1.z.array(BuSlugSchema),
        startLater: zod_1.z.array(zod_1.z.strictObject({ buSlug: BuSlugSchema, after: TextSchema })),
        verticalPlanDueBy: zod_1.z.array(zod_1.z.strictObject({ buSlug: BuSlugSchema, dueDate: zod_1.z.iso.date() })),
        updates: zod_1.z.strictObject({ how: TextSchema, every: TextSchema }),
    }),
    opportunities: zod_1.z.array(TextSchema).optional(),
    referentProposals: zod_1.z.array(exports.ActionPlanReferentProposalSchema).max(20).refine((proposals) => new Set(proposals.map((p) => JSON.stringify([p.level, p.buSlug ?? '', p.personRef]))).size === proposals.length, { message: 'Referent proposals must be unique per level, business unit and person' }).optional(),
});
/** The plan as the Director writes it: the service adds digest, tenant and organization (and planId/version when absent). */
exports.ActionPlanDraftSchema = exports.ActionPlanSchema.omit({ digest: true, tenantId: true, organizationId: true }).extend({
    planId: exports.ActionPlanSchema.shape.planId.optional(),
    version: exports.ActionPlanSchema.shape.version.optional(),
});
/** Item ids of the work breakdown that sit on a parent cycle (an item that is its own ancestor). */
function workBreakdownCycleIds(items) {
    const parents = new Map(items.map((item) => [item.id, item.parentId]));
    const inCycle = new Set();
    for (const item of items) {
        let current = item.parentId;
        for (let steps = 0; current !== undefined && steps <= items.length; steps += 1) {
            if (current === item.id) {
                inCycle.add(item.id);
                break;
            }
            current = parents.get(current);
        }
    }
    return inCycle;
}
/**
 * The plan as the Director submits a new version. A new version needs the published dossier pages it is written on, and `deliveryShape` is required:
 * - `product`: the work breakdown (alberatura) is required and is the only source of what to build (no `sections` per unit);
 *   every parent exists, no cycles, every leaf has an owner, owners and milestones exist, every unit that starts now owns an item.
 * - `study`: no work breakdown; every unit that starts now carries its `sections` (the deliverables).
 * Every unit has its entry in `objectiveTree.businessUnits`.
 * Saved plans and old drafts are read with ActionPlanSchema / ActionPlanDraftSchema, which require none of this.
 */
exports.ActionPlanSubmissionSchema = exports.ActionPlanDraftSchema.superRefine((plan, ctx) => {
    if (plan.dossier === undefined || plan.dossier.length === 0) {
        ctx.addIssue({
            code: 'custom',
            path: ['dossier'],
            message: 'A new plan version needs the published dossier pages used to write it',
        });
    }
    const businessUnitSlugs = new Set(plan.businessUnits.map((unit) => unit.buSlug));
    const milestoneNumbers = new Set(plan.milestones.map((milestone) => milestone.number));
    const treeUnitSlugs = new Set(plan.objectiveTree.businessUnits.map((unit) => unit.buSlug));
    const shape = plan.deliveryShape;
    if (shape === undefined) {
        ctx.addIssue({
            code: 'custom',
            path: ['deliveryShape'],
            message: `The plan needs deliveryShape: '${exports.ACTION_PLAN_DELIVERY_SHAPES[0]}' if it builds something the user uses (app, site, service), '${exports.ACTION_PLAN_DELIVERY_SHAPES[1]}' if it delivers documents (analysis, research, financial plan)`,
        });
    }
    plan.businessUnits.forEach((unit, index) => {
        if (!treeUnitSlugs.has(unit.buSlug)) {
            ctx.addIssue({
                code: 'custom',
                path: ['objectiveTree', 'businessUnits'],
                message: `Business unit ${unit.buSlug} needs its entry in objectiveTree.businessUnits: what this unit must obtain, delivery criteria and indicators`,
            });
        }
        if (shape === 'product' && unit.sections !== undefined) {
            ctx.addIssue({
                code: 'custom',
                path: ['businessUnits', index, 'sections'],
                message: `Business unit ${unit.buSlug}: a product plan lists what to build only in workBreakdown; move these sections into workBreakdown items owned by ${unit.buSlug}`,
            });
        }
        if (shape === 'study' && unit.start.kind === 'now' && unit.sections === undefined) {
            ctx.addIssue({
                code: 'custom',
                path: ['businessUnits', index, 'sections'],
                message: `Business unit ${unit.buSlug} starts now and needs its sections: the mission split into what this unit builds`,
            });
        }
        unit.sections?.forEach((section, position) => {
            if (!milestoneNumbers.has(section.milestone)) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['businessUnits', index, 'sections', position, 'milestone'],
                    message: `Section ${section.id} milestone ${section.milestone} does not exist in the plan`,
                });
            }
            section.needsFrom?.forEach((need, dependencyIndex) => {
                if (!businessUnitSlugs.has(need.buSlug) || need.buSlug === unit.buSlug) {
                    ctx.addIssue({
                        code: 'custom',
                        path: ['businessUnits', index, 'sections', position, 'needsFrom', dependencyIndex, 'buSlug'],
                        message: `Section ${section.id} needs work from ${need.buSlug}, which is not another existing business unit`,
                    });
                }
            });
        });
    });
    if (shape === 'study' && plan.workBreakdown !== undefined) {
        ctx.addIssue({
            code: 'custom',
            path: ['workBreakdown'],
            message: "A study plan has no workBreakdown: remove it and give every business unit that starts now its sections (the deliverables)",
        });
    }
    if (shape !== 'product')
        return;
    const items = plan.workBreakdown;
    if (items === undefined) {
        ctx.addIssue({
            code: 'custom',
            path: ['workBreakdown'],
            message: "A product plan needs workBreakdown: every section the user will use (including errors, missing data and measurement), nested with parentId, each leaf with the business units that build it and what each does",
        });
        return;
    }
    const itemIds = new Set(items.map((item) => item.id));
    const parentIds = new Set(items.flatMap((item) => (item.parentId === undefined ? [] : [item.parentId])));
    const cycleIds = workBreakdownCycleIds(items);
    const ownedBy = new Set();
    items.forEach((item, index) => {
        if (item.parentId !== undefined && (!itemIds.has(item.parentId) || item.parentId === item.id)) {
            ctx.addIssue({
                code: 'custom',
                path: ['workBreakdown', index, 'parentId'],
                message: `Work breakdown item ${item.id} has parentId ${item.parentId}, which is not another item of workBreakdown`,
            });
        }
        else if (cycleIds.has(item.id)) {
            ctx.addIssue({
                code: 'custom',
                path: ['workBreakdown', index, 'parentId'],
                message: `Work breakdown item ${item.id} is its own ancestor through parentId: the breakdown must be a tree`,
            });
        }
        if (!milestoneNumbers.has(item.milestone)) {
            ctx.addIssue({
                code: 'custom',
                path: ['workBreakdown', index, 'milestone'],
                message: `Work breakdown item ${item.id} milestone ${item.milestone} does not exist in the plan`,
            });
        }
        if (!parentIds.has(item.id) && item.owners.length === 0) {
            ctx.addIssue({
                code: 'custom',
                path: ['workBreakdown', index, 'owners'],
                message: `Work breakdown item ${item.id} is a leaf and needs at least one owner: the business unit that builds it and what it does`,
            });
        }
        const seenOwners = new Set();
        item.owners.forEach((owner, position) => {
            if (!businessUnitSlugs.has(owner.buSlug)) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['workBreakdown', index, 'owners', position, 'buSlug'],
                    message: `Work breakdown item ${item.id} is owned by ${owner.buSlug}, which is not a business unit of the plan`,
                });
            }
            else if (seenOwners.has(owner.buSlug)) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['workBreakdown', index, 'owners', position, 'buSlug'],
                    message: `Work breakdown item ${item.id} lists ${owner.buSlug} twice: one entry per business unit`,
                });
            }
            seenOwners.add(owner.buSlug);
            ownedBy.add(owner.buSlug);
        });
    });
    plan.businessUnits.forEach((unit, index) => {
        if (unit.start.kind === 'now' && !ownedBy.has(unit.buSlug)) {
            ctx.addIssue({
                code: 'custom',
                path: ['businessUnits', index],
                message: `Business unit ${unit.buSlug} starts now but owns no workBreakdown item: add it as owner of the items it builds, with what it does`,
            });
        }
    });
});
/** The plan Stefano can approve as it stands: the eleven parts plus marketing, launch and financial plans, cross-checked. */
exports.CompleteActionPlanSchema = exports.ActionPlanSchema.extend({
    marketingPlan: zod_1.z.strictObject({
        audience: TextSchema,
        channels: zod_1.z.array(TextSchema).min(1).max(20),
        messages: zod_1.z.array(TextSchema).min(1).max(20),
    }),
    launchPlan: zod_1.z.strictObject({
        launchDate: zod_1.z.iso.date(),
        steps: zod_1.z.array(TextSchema).min(1).max(30),
    }),
    financialPlan: zod_1.z.strictObject({
        revenueModel: TextSchema,
        costs: zod_1.z.array(zod_1.z.strictObject({ item: TextSchema, amount: zod_1.z.number().min(0) })).min(1).max(50),
        breakEven: TextSchema,
    }),
}).superRefine((plan, ctx) => {
    const businessUnitSlugs = new Set(plan.businessUnits.map((unit) => unit.buSlug));
    plan.referentProposals?.forEach((proposal, index) => {
        if (proposal.level === 'business_unit' && !businessUnitSlugs.has(proposal.buSlug)) {
            ctx.addIssue({
                code: 'custom',
                path: ['referentProposals', index, 'buSlug'],
                message: `Referent proposal business unit ${proposal.buSlug} does not exist in the plan`,
            });
        }
    });
    const treeUnits = new Map(plan.objectiveTree.businessUnits.map((unit) => [unit.buSlug, unit]));
    plan.businessUnits.forEach((unit, index) => {
        if ((treeUnits.get(unit.buSlug)?.indicators.length ?? 0) === 0) {
            ctx.addIssue({
                code: 'custom',
                path: ['objectiveTree', 'businessUnits'],
                message: `Business unit ${unit.buSlug} needs an objective tree entry with at least one indicator`,
            });
        }
        if (unit.reviewer === undefined) {
            ctx.addIssue({
                code: 'custom',
                path: ['businessUnits', index, 'reviewer'],
                message: `Business unit ${unit.buSlug} needs a reviewer`,
            });
        }
        const caps = plan.budget.perBu.filter((entry) => entry.buSlug === unit.buSlug).length;
        if (caps !== 1) {
            ctx.addIssue({
                code: 'custom',
                path: ['budget', 'perBu'],
                message: `Business unit ${unit.buSlug} needs exactly one budget cap, found ${caps}`,
            });
        }
    });
    const numbers = plan.milestones.map((milestone) => milestone.number);
    const known = new Set(numbers);
    if (known.size !== numbers.length) {
        ctx.addIssue({ code: 'custom', path: ['milestones'], message: 'Milestone numbers must be unique' });
    }
    plan.milestones.forEach((milestone, index) => {
        milestone.blockedBy.forEach((blocker, position) => {
            if (!known.has(blocker) || blocker === milestone.number) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['milestones', index, 'blockedBy', position],
                    message: `Milestone ${milestone.number} is blocked by ${blocker}, which is not another existing milestone`,
                });
            }
        });
    });
    plan.criticalPath.forEach((number, index) => {
        if (!known.has(number)) {
            ctx.addIssue({
                code: 'custom',
                path: ['criticalPath', index],
                message: `Critical path milestone ${number} does not exist`,
            });
        }
    });
    const capSum = plan.budget.perBu.reduce((sum, entry) => sum + entry.cap, 0);
    if (capSum > plan.budget.total) {
        ctx.addIssue({
            code: 'custom',
            path: ['budget', 'total'],
            message: `Business unit caps add up to ${capSum}, above the total ${plan.budget.total}`,
        });
    }
    plan.missingMaterials.forEach((material, index) => {
        for (const field of ['owner', 'neededBy']) {
            if (material[field] === undefined) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['missingMaterials', index, field],
                    message: `Missing material needs ${field}`,
                });
            }
        }
    });
});
function canonicalJson(value) {
    if (Array.isArray(value))
        return `[${value.map(canonicalJson).join(',')}]`;
    if (value !== null && typeof value === 'object') {
        const entries = Object.keys(value)
            .sort()
            .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`);
        return `{${entries.join(',')}}`;
    }
    return JSON.stringify(value);
}
/** Portable UTF-8 input for the writer's SHA-256; the digest itself is excluded. */
function actionPlanCanonicalJson(plan) {
    const { digest: _digest, ...content } = plan;
    return canonicalJson(content);
}
//# sourceMappingURL=action-plan.js.map