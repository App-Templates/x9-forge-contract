import { z } from 'zod';
import { WikiPageSchema } from '../capability/lab/wiki.js';
import { BUSINESS_UNIT_LEAD_ROLE, DIRECTOR_ROLE } from './agent-role.js';
import { AssetRefSchema, AssetSha256Schema } from './asset.js';
import { BusinessUnitLeadTypeIdSchema } from './business-unit-type.js';
import { CompanyMapLevelSchema } from './company-map.js';
import { DecisionRequestIdSchema } from './decision-request.js';

const SlugSchema = (min: number, max: number) => z.string().min(min).max(max).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);

const UniqueCompetenciesSchema = z.array(z.string().min(1).max(200)).min(1).max(20).refine(
  (competencies) => new Set(competencies).size === competencies.length,
  { message: 'Competencies must be unique' },
);

/** How a business unit of the action plan produces its work. */
export const ACTION_PLAN_BU_EXECUTORS = ['agent', 'dev_session', 'night'] as const;
export const ActionPlanBuExecutorSchema = z.enum(ACTION_PLAN_BU_EXECUTORS);
export type ActionPlanBuExecutor = z.infer<typeof ActionPlanBuExecutorSchema>;

/** The referent is only a pointer to an entry of the company memory map: no name, no address. */
export const ActionPlanReferentRefSchema = z.strictObject({
  personRef: SlugSchema(1, 40),
  entryVersion: z.number().int().min(1),
});
export type ActionPlanReferentRef = z.infer<typeof ActionPlanReferentRefSchema>;

/** Role agents are only listed in the plan; they are not born with it. */
export const ActionPlanRoleAgentSchema = z.strictObject({
  role: z.string().min(1).max(120),
  competencies: UniqueCompetenciesSchema,
});
export type ActionPlanRoleAgent = z.infer<typeof ActionPlanRoleAgentSchema>;

export const ActionPlanBuStartSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('now') }),
  z.strictObject({
    kind: z.literal('planned'),
    unlockedBy: z.strictObject({
      milestone: z.number().int().min(1),
      delivery: z.string().min(1).max(500),
    }),
  }),
]);
export type ActionPlanBuStart = z.infer<typeof ActionPlanBuStartSchema>;

export const ActionPlanBuSectionSchema = z.strictObject({
  id: SlugSchema(1, 40).describe('nome breve e stabile della sezione'),
  title: z.string().min(1).max(200).describe("la sezione, come la chiamerebbe l'utente"),
  expectedGoal: z.string().min(1).max(1000).describe("cosa potrà fare l'utente quando la sezione è finita"),
  deliveryCriteria: z.array(z.string().min(1).max(500)).min(1).max(10)
    .describe('come si verifica che è finita'),
  milestone: z.number().int().min(1).describe('la tappa del piano (`milestones[].number`) in cui si consegna'),
  needsFrom: z.array(z.strictObject({
    buSlug: SlugSchema(1, 30),
    what: z.string().min(1).max(500),
  })).max(10).optional().describe("cosa serve da un'altra BU per costruirla"),
});
export type ActionPlanBuSection = z.infer<typeof ActionPlanBuSectionSchema>;

/** What the plan delivers: `product` builds something the user uses (app, site, service); `study` delivers documents (analysis, research, financial plan, opinion). */
export const ACTION_PLAN_DELIVERY_SHAPES = ['product', 'study'] as const;
export const ActionPlanDeliveryShapeSchema = z.enum(ACTION_PLAN_DELIVERY_SHAPES)
  .describe("`product` se si costruisce qualcosa che l'utente usa (app, sito, servizio); `study` se si consegnano documenti (analisi, ricerca, piano finanziario, parere)");
export type ActionPlanDeliveryShape = z.infer<typeof ActionPlanDeliveryShapeSchema>;

/** A business unit working on an item of the project breakdown, and what it does there. */
export const ActionPlanWorkItemOwnerSchema = z.strictObject({
  buSlug: SlugSchema(1, 30),
  does: z.string().min(1).max(1000).describe('cosa fa questa BU per la voce'),
});
export type ActionPlanWorkItemOwner = z.infer<typeof ActionPlanWorkItemOwnerSchema>;

/** One item of the project breakdown (alberatura): a section of what the user will use, nested through `parentId`. */
export const ActionPlanWorkItemSchema = z.strictObject({
  id: SlugSchema(1, 40).describe('nome breve e stabile della voce'),
  parentId: SlugSchema(1, 40).optional().describe('la voce che la contiene; assente per le voci di primo livello'),
  title: z.string().min(1).max(200).describe("la sezione, come la chiamerebbe l'utente"),
  expectedGoal: z.string().min(1).max(1000).describe("cosa potrà fare l'utente quando la voce è finita"),
  deliveryCriteria: z.array(z.string().min(1).max(500)).min(1).max(10)
    .describe('come si verifica che è finita'),
  milestone: z.number().int().min(1).describe('la tappa del piano (`milestones[].number`) in cui si consegna'),
  owners: z.array(ActionPlanWorkItemOwnerSchema).max(10)
    .describe('le BU che ci lavorano e cosa fa ciascuna; ogni voce foglia ne ha almeno una'),
});
export type ActionPlanWorkItem = z.infer<typeof ActionPlanWorkItemSchema>;

export const ACTION_PLAN_WORK_BREAKDOWN_MAX_ITEMS = 60;
export const ActionPlanWorkBreakdownSchema = z.array(ActionPlanWorkItemSchema).min(1).max(ACTION_PLAN_WORK_BREAKDOWN_MAX_ITEMS).refine(
  (items) => new Set(items.map((item) => item.id)).size === items.length,
  { message: 'Work breakdown item ids must be unique' },
).describe("L'alberatura del progetto (solo `product`): tutte le sezioni che l'utente userà, comprese errori, dati mancanti e misura, con le BU che ci lavorano. È la fonte delle cose da costruire: i mini-brief delle BU la ereditano.");
export type ActionPlanWorkBreakdown = z.infer<typeof ActionPlanWorkBreakdownSchema>;

/** Part 6 «Organizzazione» of the action plan: one business unit. */
export const ActionPlanBusinessUnitSchema = z.strictObject({
  buSlug: SlugSchema(1, 30),
  /** Only a lead type of the catalog (1.65.0): the unit is born by Forge from this type. */
  typeId: BusinessUnitLeadTypeIdSchema,
  mandate: z.string().min(1).max(2000)
    .describe('ruolo e perimetro della BU in poche frasi; le cose da costruire vanno in `sections`'),
  competencies: UniqueCompetenciesSchema,
  lead: z.strictObject({ role: z.literal(BUSINESS_UNIT_LEAD_ROLE) }),
  reviewer: z.union([
    z.strictObject({ buSlug: SlugSchema(1, 30) }),
    z.strictObject({ role: z.literal(DIRECTOR_ROLE) }),
  ]).optional(),
  executor: ActionPlanBuExecutorSchema,
  referent: ActionPlanReferentRefSchema,
  firstActivities: z.array(z.string().min(1).max(500)).min(1).max(20)
    .describe('i primi passi del capo, prima di costruire le sezioni'),
  sections: z.array(ActionPlanBuSectionSchema).min(1).max(20).refine(
    (sections) => new Set(sections.map((section) => section.id)).size === sections.length,
    { message: 'Section ids must be unique within the business unit' },
  ).optional().describe('Le sezioni che questa BU costruisce dopo l’approvazione: la missione scomposta per questa BU, ognuna con cosa potrà fare l’utente. È il mini-brief che il capo riceve nel Mandato.'),
  roleAgents: z.array(ActionPlanRoleAgentSchema).max(20).optional(),
  start: ActionPlanBuStartSchema,
});
export type ActionPlanBusinessUnit = z.infer<typeof ActionPlanBusinessUnitSchema>;

const TextSchema = z.string().min(1).max(2000);
const BuSlugSchema = SlugSchema(1, 30);
const MilestoneNumberSchema = z.number().int().min(1);
const DeliveryCriteriaSchema = z.array(TextSchema).min(1).max(20);

/** A person the plan proposes for the client company map; written only when the owner approves this plan version. */
export const ActionPlanReferentProposalSchema = z.strictObject({
  personRef: SlugSchema(1, 40),
  name: z.string().min(1).max(120),
  role: z.string().min(1).max(120),
  email: z.email(),
  level: CompanyMapLevelSchema,
  buSlug: SlugSchema(1, 30).optional(),
}).refine((p) => (p.level === 'business_unit') === (p.buSlug !== undefined), {
  message: 'buSlug is required at business_unit level and only allowed there', path: ['buSlug'],
});
export type ActionPlanReferentProposal = z.infer<typeof ActionPlanReferentProposalSchema>;

/** A published wiki page at the version used to write the plan. */
export const ActionPlanDossierPageSchema = z.strictObject({
  slug: WikiPageSchema.shape.slug,
  version: WikiPageSchema.shape.version,
});
export type ActionPlanDossierPage = z.infer<typeof ActionPlanDossierPageSchema>;

/** Part 1 of the plan: the request, the expected result and how it is measured. */
export const ActionPlanObjectiveSchema = z.strictObject({
  request: TextSchema,
  expectedResult: TextSchema,
  measure: TextSchema,
});
export type ActionPlanObjective = z.infer<typeof ActionPlanObjectiveSchema>;

/** Objective tree, project level: result and delivery criteria of the whole project. */
export const ActionPlanProjectObjectiveSchema = z.strictObject({ expectedResult: TextSchema, deliveryCriteria: DeliveryCriteriaSchema });
export type ActionPlanProjectObjective = z.infer<typeof ActionPlanProjectObjectiveSchema>;

/** Objective tree, business unit level: what this unit must obtain. */
export const ActionPlanBuObjectiveSchema = z.strictObject({
  buSlug: BuSlugSchema,
  expectedResult: TextSchema,
  deliveryCriteria: DeliveryCriteriaSchema,
  indicators: z.array(z.strictObject({ name: TextSchema, source: TextSchema })).max(20),
});
export type ActionPlanBuObjective = z.infer<typeof ActionPlanBuObjectiveSchema>;

/** The eleven required parts of the versioned plan submitted for owner approval. */
export const ActionPlanSchema = z.strictObject({
  planId: DecisionRequestIdSchema,
  version: z.number().int().min(1),
  digest: AssetSha256Schema,
  tenantId: AssetRefSchema.shape.tenantId,
  organizationId: z.string().min(1).max(64),
  clientId: AssetRefSchema.shape.companyId,
  projectId: z.string().min(1).max(64),
  dossier: z.array(ActionPlanDossierPageSchema).max(50).refine(
    (pages) => new Set(pages.map((page) => page.slug)).size === pages.length,
    { message: 'Dossier page slugs must be unique' },
  ).optional().describe('le pagine pubblicate da Lab su cui è scritto il piano, come le restituisce lab_read_published (slug e versione)'),
  objective: ActionPlanObjectiveSchema,
  deliveryShape: ActionPlanDeliveryShapeSchema.optional(),
  analysis: z.strictObject({
    startingPoint: TextSchema,
    marketAndAlternatives: z.strictObject({
      text: TextSchema,
      sources: z.array(z.url({ protocol: /^https?$/ })).min(1).max(30),
    }),
    recommendedMethod: z.strictObject({ method: TextSchema, why: TextSchema }),
  }),
  strategy: z.strictObject({
    approach: TextSchema,
    choices: z.array(TextSchema).min(1).max(20),
    discardedAlternatives: z.array(TextSchema).max(20),
  }),
  objectiveTree: z.strictObject({
    project: ActionPlanProjectObjectiveSchema,
    businessUnits: z.array(ActionPlanBuObjectiveSchema),
  }),
  workBreakdown: ActionPlanWorkBreakdownSchema.optional(),
  milestones: z.array(z.strictObject({
    number: MilestoneNumberSchema,
    delivery: TextSchema,
    buSlug: BuSlugSchema,
    dueDate: z.iso.date().optional().describe('giorno della tappa, se esiste'),
    closeCriterion: TextSchema,
    blockedBy: z.array(z.number().int()),
  })).min(1).max(50),
  criticalPath: z.array(z.number().int()).min(1).max(50),
  businessUnits: z.array(ActionPlanBusinessUnitSchema).min(1).max(20),
  exchanges: z.array(z.strictObject({
    fromBu: BuSlugSchema,
    toBu: BuSlugSchema,
    what: TextSchema,
    format: TextSchema,
  })),
  budget: z.strictObject({
    currency: TextSchema,
    total: z.number().min(0),
    perBu: z.array(z.strictObject({ buSlug: BuSlugSchema, cap: z.number().min(0) })),
  }),
  risks: z.array(TextSchema).max(30),
  assumptions: z.array(TextSchema).max(30),
  missingMaterials: z.array(z.strictObject({
    what: TextSchema,
    kind: z.enum(['asset', 'access', 'data']),
    owner: TextSchema.optional(),
    blocks: z.strictObject({ buSlug: BuSlugSchema, milestone: MilestoneNumberSchema }).optional(),
    neededBy: z.iso.date().optional(),
  })),
  questions: z.array(z.strictObject({ question: TextSchema, unlocks: TextSchema })),
  ifApproved: z.strictObject({
    startNow: z.array(BuSlugSchema),
    startLater: z.array(z.strictObject({ buSlug: BuSlugSchema, after: TextSchema })),
    verticalPlanDueBy: z.array(z.strictObject({ buSlug: BuSlugSchema, dueDate: z.iso.date() })),
    updates: z.strictObject({ how: TextSchema, every: TextSchema }),
  }),
  opportunities: z.array(TextSchema).optional(),
  referentProposals: z.array(ActionPlanReferentProposalSchema).max(20).refine(
    (proposals) => new Set(proposals.map((p) => JSON.stringify([p.level, p.buSlug ?? '', p.personRef]))).size === proposals.length,
    { message: 'Referent proposals must be unique per level, business unit and person' },
  ).optional(),
});
export type ActionPlan = z.infer<typeof ActionPlanSchema>;

/** The plan as the Director writes it: the service adds digest, tenant and organization (and planId/version when absent). */
export const ActionPlanDraftSchema = ActionPlanSchema.omit({ digest: true, tenantId: true, organizationId: true }).extend({
  planId: ActionPlanSchema.shape.planId.optional(),
  version: ActionPlanSchema.shape.version.optional(),
});
export type ActionPlanDraft = z.infer<typeof ActionPlanDraftSchema>;

/** Item ids of the work breakdown that sit on a parent cycle (an item that is its own ancestor). */
function workBreakdownCycleIds(items: readonly ActionPlanWorkItem[]): Set<string> {
  const parents = new Map(items.map((item) => [item.id, item.parentId]));
  const inCycle = new Set<string>();
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
export const ActionPlanSubmissionSchema = ActionPlanDraftSchema.superRefine((plan, ctx) => {
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
      message: `The plan needs deliveryShape: '${ACTION_PLAN_DELIVERY_SHAPES[0]}' if it builds something the user uses (app, site, service), '${ACTION_PLAN_DELIVERY_SHAPES[1]}' if it delivers documents (analysis, research, financial plan)`,
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

  if (shape !== 'product') return;
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
  const ownedBy = new Set<string>();
  items.forEach((item, index) => {
    if (item.parentId !== undefined && (!itemIds.has(item.parentId) || item.parentId === item.id)) {
      ctx.addIssue({
        code: 'custom',
        path: ['workBreakdown', index, 'parentId'],
        message: `Work breakdown item ${item.id} has parentId ${item.parentId}, which is not another item of workBreakdown`,
      });
    } else if (cycleIds.has(item.id)) {
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
    const seenOwners = new Set<string>();
    item.owners.forEach((owner, position) => {
      if (!businessUnitSlugs.has(owner.buSlug)) {
        ctx.addIssue({
          code: 'custom',
          path: ['workBreakdown', index, 'owners', position, 'buSlug'],
          message: `Work breakdown item ${item.id} is owned by ${owner.buSlug}, which is not a business unit of the plan`,
        });
      } else if (seenOwners.has(owner.buSlug)) {
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
export type ActionPlanSubmission = z.infer<typeof ActionPlanSubmissionSchema>;

/** The plan Stefano can approve as it stands: the eleven parts plus marketing, launch and financial plans, cross-checked. */
export const CompleteActionPlanSchema = ActionPlanSchema.extend({
  marketingPlan: z.strictObject({
    audience: TextSchema,
    channels: z.array(TextSchema).min(1).max(20),
    messages: z.array(TextSchema).min(1).max(20),
  }),
  launchPlan: z.strictObject({
    launchDate: z.iso.date(),
    steps: z.array(TextSchema).min(1).max(30),
  }),
  financialPlan: z.strictObject({
    revenueModel: TextSchema,
    costs: z.array(z.strictObject({ item: TextSchema, amount: z.number().min(0) })).min(1).max(50),
    breakEven: TextSchema,
  }),
}).superRefine((plan, ctx) => {
  const businessUnitSlugs = new Set(plan.businessUnits.map((unit) => unit.buSlug));
  plan.referentProposals?.forEach((proposal, index) => {
    if (proposal.level === 'business_unit' && !businessUnitSlugs.has(proposal.buSlug!)) {
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
    for (const field of ['owner', 'neededBy'] as const) {
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
export type CompleteActionPlan = z.infer<typeof CompleteActionPlanSchema>;

export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    const entries = Object.keys(value as Record<string, unknown>)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson((value as Record<string, unknown>)[key])}`);
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value);
}

/** Portable UTF-8 input for the writer's SHA-256; the digest itself is excluded. */
export function actionPlanCanonicalJson(plan: ActionPlan): string {
  const { digest: _digest, ...content } = plan;
  return canonicalJson(content);
}
