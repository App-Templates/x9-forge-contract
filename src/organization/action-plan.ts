import { z } from 'zod';
import { BUSINESS_UNIT_LEAD_ROLE, DIRECTOR_ROLE } from './agent-role.js';

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
