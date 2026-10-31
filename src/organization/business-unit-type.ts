import { z } from 'zod';
import { DevelopmentSessionEngineSchema } from '../capability/connect/development-session.js';
import { ModelTierSchema } from '../model-router/model-tier.js';

const Slug = (min: number, max: number) => z.string().min(min).max(max).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const Text = z.string().min(1).max(500);

const uniqueItems = <T extends z.ZodType<string>>(item: T, message: string) =>
  z.array(item).refine((items) => new Set(items).size === items.length, { message });

/**
 * Business unit types whose lead is born by the capo-bu route (Forge F2F-01, `businessUnitBirthPlan`): the ids of
 * the lead types of Forge's catalog (`packages/shared/src/business-unit-types.ts`, commit 0e150e058). An action plan
 * may name only these types, so a unit never fails at birth for an unknown type. This list is the single source
 * (R-14): Forge's catalog imports these ids and keeps only its own details (capabilities, level, profile).
 */
export const BUSINESS_UNIT_LEAD_TYPE_IDS = ['dati', 'design', 'sviluppo', 'finanza', 'marketing'] as const;
export const BusinessUnitLeadTypeIdSchema = z.enum(BUSINESS_UNIT_LEAD_TYPE_IDS);
export type BusinessUnitLeadTypeId = z.infer<typeof BusinessUnitLeadTypeIdSchema>;

/** Card fixing capabilities, skills, model, engine, budget, delivery criteria and reviewer of a business unit type. */
export const BusinessUnitTypeCardSchema = z.strictObject({
  typeId: Slug(2, 40),
  label: z.string().min(1).max(120),
  capabilities: uniqueItems(z.string().min(1).max(120), 'Capabilities must be unique'),
  skills: uniqueItems(z.string().min(1).max(120), 'Skills must be unique'),
  model: ModelTierSchema,
  sessionEngine: DevelopmentSessionEngineSchema,
  budget: z.strictObject({
    currency: z.string().min(1).max(10),
    monthlyCap: z.number().nonnegative().finite(),
    warnPercent: z.number().int().min(1).max(100),
  }),
  deliveryCriteria: z.array(Text).min(1),
  reviewerTypeId: Slug(2, 40).optional(),
  version: z.number().int().min(1),
});
export type BusinessUnitTypeCard = z.infer<typeof BusinessUnitTypeCardSchema>;
