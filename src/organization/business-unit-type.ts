import { z } from 'zod';
import { DevelopmentSessionEngineSchema } from '../capability/connect/development-session.js';
import { ModelTierSchema } from '../model-router/model-tier.js';

const Slug = (min: number, max: number) => z.string().min(min).max(max).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const Text = z.string().min(1).max(500);

const uniqueItems = <T extends z.ZodType<string>>(item: T, message: string) =>
  z.array(item).refine((items) => new Set(items).size === items.length, { message });

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
