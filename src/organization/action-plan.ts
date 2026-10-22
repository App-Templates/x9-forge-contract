import { z } from 'zod';
import { BUSINESS_UNIT_LEAD_ROLE, DIRECTOR_ROLE } from './agent-role.js';
import { AssetRefSchema, AssetSha256Schema } from './asset.js';
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

/** Part 6 «Organizzazione» of the action plan: one business unit. */
export const ActionPlanBusinessUnitSchema = z.strictObject({
  buSlug: SlugSchema(1, 30),
  typeId: SlugSchema(2, 40),
  mandate: z.string().min(1).max(2000),
  competencies: UniqueCompetenciesSchema,
  lead: z.strictObject({ role: z.literal(BUSINESS_UNIT_LEAD_ROLE) }),
  reviewer: z.union([
    z.strictObject({ buSlug: SlugSchema(1, 30) }),
    z.strictObject({ role: z.literal(DIRECTOR_ROLE) }),
  ]).optional(),
  executor: ActionPlanBuExecutorSchema,
  referent: ActionPlanReferentRefSchema,
  firstActivities: z.array(z.string().min(1).max(500)).min(1).max(20),
  roleAgents: z.array(ActionPlanRoleAgentSchema).max(20).optional(),
  start: ActionPlanBuStartSchema,
});
export type ActionPlanBusinessUnit = z.infer<typeof ActionPlanBusinessUnitSchema>;

const TextSchema = z.string().min(1).max(2000);
const BuSlugSchema = SlugSchema(1, 30);
const MilestoneNumberSchema = z.number().int().min(1);
const DeliveryCriteriaSchema = z.array(TextSchema).min(1).max(20);

/** The eleven required parts of the versioned plan submitted for owner approval. */
export const ActionPlanSchema = z.strictObject({
  planId: DecisionRequestIdSchema,
  version: z.number().int().min(1),
  digest: AssetSha256Schema,
  tenantId: AssetRefSchema.shape.tenantId,
  organizationId: z.string().min(1).max(64),
  clientId: AssetRefSchema.shape.companyId,
  projectId: z.string().min(1).max(64),
  objective: z.strictObject({
    request: TextSchema,
    expectedResult: TextSchema,
    measure: TextSchema,
  }),
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
    project: z.strictObject({ expectedResult: TextSchema, deliveryCriteria: DeliveryCriteriaSchema }),
    businessUnits: z.array(z.strictObject({
      buSlug: BuSlugSchema,
      expectedResult: TextSchema,
      deliveryCriteria: DeliveryCriteriaSchema,
      indicators: z.array(z.strictObject({ name: TextSchema, source: TextSchema })).max(20),
    })),
  }),
  milestones: z.array(z.strictObject({
    number: MilestoneNumberSchema,
    delivery: TextSchema,
    buSlug: BuSlugSchema,
    dueDate: z.iso.date(),
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
});
export type ActionPlan = z.infer<typeof ActionPlanSchema>;

function canonicalJson(value: unknown): string {
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
