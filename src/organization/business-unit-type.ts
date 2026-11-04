import { z } from 'zod';
import { DevelopmentSessionEngineSchema } from '../capability/connect/development-session.js';
import { ModelTierSchema } from '../model-router/model-tier.js';
import type { DeliveryPackage } from './delivery-package.js';

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

export const DeliveryEmailModelSchema = z.strictObject({
  keyScreens: z.strictObject({
    min: z.number().int().min(0).max(8),
    max: z.number().int().min(0).max(8),
  }).refine(({ min, max }) => min <= max, { message: 'Minimum must not exceed maximum' }),
  overviewSheet: z.boolean(),
  preview: z.boolean(),
});
export type DeliveryEmailModel = z.infer<typeof DeliveryEmailModelSchema>;

export const BUSINESS_UNIT_DELIVERY_EMAIL_DEFAULTS: Readonly<Partial<Record<BusinessUnitLeadTypeId, DeliveryEmailModel>>> = {
  design: { keyScreens: { min: 6, max: 8 }, overviewSheet: true, preview: true },
};

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
  deliveryEmail: DeliveryEmailModelSchema.optional(),
  version: z.number().int().min(1),
});
export type BusinessUnitTypeCard = z.infer<typeof BusinessUnitTypeCardSchema>;

/** Missing delivery requirements in presentation order; legacy cards impose none. */
export function deliveryPackageMeets(card: Pick<BusinessUnitTypeCard, 'deliveryEmail'>, pkg: DeliveryPackage): string[] {
  const model = card.deliveryEmail;
  if (!model) return [];

  const missing: string[] = [];
  const count = pkg.keyScreens.length;
  if (count < model.keyScreens.min) {
    missing.push(`servono almeno ${model.keyScreens.min} schermate chiave, ce ne sono ${count}`);
  }
  if (count > model.keyScreens.max) {
    missing.push(`al massimo ${model.keyScreens.max} schermate chiave, ce ne sono ${count}`);
  }
  if (model.overviewSheet && !pkg.overviewSheet) missing.push('manca il foglio unico');
  if (model.preview && !pkg.preview) missing.push("manca l'anteprima");
  return missing;
}
